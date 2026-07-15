---
# Maps to ContextCore task.* semantic conventions.
# This variant assumes Claude plays every role. The context normally
# in a separate handoff doc lives in the ## Implementation Context
# section below.

task:
  id: SPEC-072
  type: bug                        # epic | story | task | bug | chore
  cycle: ship  # frame | design | build | verify | ship
  blocked: false
  priority: high
  complexity: S                    # S | M | L  (L means split it)

project:
  id: PROJ-002
  stage: STAGE-013
repo:
  id: animal-slots

agents:
  architect: claude-opus-4-8       # design/frame: Opus (judgement-heavy). See AGENTS §8.
  implementer: claude-sonnet-4-6   # build/verify: Sonnet (execution against the spec)
  created_at: 2026-07-14

references:
  decisions:
    - DEC-007   # synthesized audio (Tone.js) gated behind a user gesture — this fixes the gesture unlock
    - DEC-013   # the audio graph / engine (ensureAudio) this calls
    - DEC-001   # UI-only; engine untouched
  constraints:
    - audio-gesture-and-mute
    - engine-no-dom
  related_specs:
    - SPEC-026  # useAudio first-gesture unlock (this fixes its iOS behaviour)

# One sentence on what this spec contributes to its stage's
# value_contribution. For plumbing: "infrastructure enabling
# STAGE-013's <capability>". Optional; null is acceptable.
value_link: >-
  User-reported: no audio on iPhone. iOS Safari requires the AudioContext resume to run synchronously
  inside the user gesture; the old flow deferred it to a later effect, leaving the context suspended.

# Self-reported AI cost per cycle. Each cycle (design, build, verify,
# ship) appends one entry to sessions[]. Totals are computed at ship.
# Record a REAL tokens_total for metered cycles (build/verify) — the
# orchestrator fills it from the Agent result's subagent_tokens at ship
# (or /cost interactively). Only un-metered main-loop cycles (design/ship)
# may be null-with-note. `just cost-audit` enforces this on shipped specs.
# See AGENTS.md §4 and docs/cost-tracking.md. interface: claude-code |
# claude-ai | api | ollama | other.
cost:
  sessions:
    - cycle: design
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: null
      recorded_at: 2026-07-12
      note: Design + build + verify in the orchestrator session (audio-unlock fix; verified by instrumenting AudioContext.resume in the browser).
    - cycle: build
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: 22000   # NOMINAL main-loop estimate
      estimated_usd: 0.33   # nominal, 22000 tok x ~$15/M
      recorded_at: 2026-07-12
      note: >-
        Root-caused: useAudio's first-gesture handler only flipped `unlocked` (a React state) and the
        AudioContext resume (Tone.start via ensureAudio) ran LATER in reactive effects (useAmbientBed /
        sfx) — desktop tolerates a deferred resume, iOS Safari does NOT (resume must run in the gesture
        stack). Fix: call ensureAudio() synchronously inside the pointerdown/keydown handler before
        setUnlocked(true). Added a useAudio test asserting ensureAudio is called on the gesture. NOMINAL
        main-loop estimate. Full gate green (472, worktree excluded); engine diff EMPTY.
    - cycle: verify
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: 12000   # NOMINAL main-loop estimate
      estimated_usd: 0.18   # nominal, 12000 tok x ~$15/M
      recorded_at: 2026-07-12
      note: >-
        Verified in-browser by monkey-patching AudioContext.prototype.resume: after the fix, a
        pointerdown triggers resume() SYNCHRONOUSLY within the gesture stack (recorded 1 call immediately
        after dispatch, vs 0 before). No console errors. Cannot play actual iPhone audio from the Chromium
        preview — the resume-in-gesture is the iOS requirement; user to re-test on device. NOMINAL estimate.
    - cycle: ship
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      recorded_at: 2026-07-12
      note: main-loop ship cycle — PR + CI-poll + squash-merge + archive + brag.
  totals:
    tokens_total: 34000
    estimated_usd: 0.51
    session_count: 4
---

# SPEC-072: iOS audio unlock — resume the AudioContext inside the gesture

## Context

User-reported: **audio doesn\'t play on iPhone.** Root cause (confirmed in-browser): `useAudio`\'s
first-gesture handler only set a React flag (`setUnlocked(true)`); the actual AudioContext resume
(`Tone.start()` via `ensureAudio()`) happened **later**, in reactive effects (`useAmbientBed`, SFX,
jingle) that fire *after* the gesture. Desktop browsers tolerate a resume shortly after a gesture, but
**iOS Safari strictly requires `AudioContext.resume()` to be called synchronously inside the user-gesture
call stack** — a deferred resume leaves the context `suspended` and nothing plays.

UI-only fix (DEC-001); honours DEC-007 (audio gated behind a gesture) — this makes the gesture actually
resume the context.

## Goal

Resume the AudioContext **synchronously inside the first-gesture handler** so audio unlocks on iOS Safari,
without changing the mute/gesture policy.

## Outputs

- **Files modified:** `src/ui/audio/useAudio.ts` — the `pointerdown`/`keydown` handler now calls
  `ensureAudio()` (guarded `Tone.start()`) before `setUnlocked(true)`.
- **Files modified (test):** `src/ui/audio/useAudio.test.ts` — mocks `audioEngine` and asserts
  `ensureAudio()` is called on the first gesture.
- No engine / dependency / DEC change.

## Acceptance Criteria

- [ ] On the first `pointerdown`/`keydown`, `ensureAudio()` (→ `Tone.start()` → `AudioContext.resume()`)
      runs synchronously in the handler (verified: `resume()` is invoked within the gesture stack).
- [ ] `unlocked` still flips to true; mute policy unchanged; `ensureAudio()` never throws (guarded).
- [ ] `git diff … -- src/engine/` EMPTY; full gate green.

## Failing Tests / guards

- `useAudio.test.ts` — asserts `ensureAudio` is called exactly once on the first gesture (was never
  called from the handler before). Browser-verified that `AudioContext.resume()` fires in the gesture stack.

## Implementation Context

- `DEC-007` — audio stays gated behind a user gesture + persisted mute; this fix only moves the *resume*
  into the gesture where iOS needs it.
- `DEC-013` — `ensureAudio()` is the guarded engine entry point (`Tone.start()`), safe in jsdom/tests.

### Out of scope
- The iOS **silent/ringer switch**: if the phone is on silent, iOS mutes Web Audio at the hardware level —
  not fixable from the web layer without media-element hacks. Flagged to the user to check if audio is
  still silent after this fix. The `JackpotMoment` wolf (flagged).

## Notes for the Implementer

Verified by patching `AudioContext.prototype.resume` in the page and firing a `pointerdown`: post-fix the
resume is recorded synchronously in the gesture; pre-fix it wasn\'t. Actual iPhone playback needs a device
re-test (not drivable from the Chromium preview).

---

## Build Completion

- **Branch:** `feat/spec-072-ios-audio-unlock`
- **All acceptance criteria met?** yes — `ensureAudio()` now runs in the gesture handler; browser
  instrumentation confirms `AudioContext.resume()` fires synchronously on the gesture; test added. Full
  gate green (472, worktree excluded); engine diff EMPTY.
- **New decisions emitted:** none.
- **Deviations from spec:** none.
- **Follow-up identified:** device re-test on iPhone; if still silent, check the silent switch (hardware).

### Build-phase reflection
1. **What was unclear?** — Whether it was the unlock or the silent switch; instrumenting resume() proved
   the unlock was deferred (the fixable cause).
2. **Missing constraint/decision?** — No.
3. **Do differently?** — The original SPEC-026 unlock should have resumed the context in the gesture from
   the start; flipping a flag and resuming in an effect is a desktop-only pattern.

---

## Reflection (Ship)

1. **What would I do differently next time?** — Treat "unlock audio on gesture" as "resume the context IN
   the gesture," not "set a flag and start audio reactively" — the latter silently fails on iOS.
2. **Does any template/constraint/decision need updating?** — No DEC. Worth an AGENTS/audio note + the
   recurring theme this session: iOS Safari behaviours (audio unlock, dvh, fixed positioning) need real
   device/Safari testing — the Chromium preview can\'t stand in.
3. **Follow-up spec to write now?** — None; awaiting the iPhone re-test.
