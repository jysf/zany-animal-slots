---
# Maps to ContextCore task.* semantic conventions.
# This variant assumes Claude plays every role. The context normally
# in a separate handoff doc lives in the ## Implementation Context
# section below.

task:
  id: SPEC-067
  type: chore                      # epic | story | task | bug | chore
  cycle: ship  # frame | design | build | verify | ship
  blocked: false
  priority: medium
  complexity: S                    # S | M | L  (L means split it)

project:
  id: PROJ-002
  stage: STAGE-013
repo:
  id: animal-slots

agents:
  architect: claude-opus-4-8       # design/frame: Opus (judgement-heavy). See AGENTS §8.
  implementer: claude-opus-4-8     # small hardening change — built + preview-verified in the orchestrator session
  created_at: 2026-07-12

references:
  decisions:
    - DEC-001   # presentation-only; engine untouched
    - DEC-005   # play-money / no-backend — the boundary logs to console only, never a remote logger
    - DEC-010   # token-only CSS for the fallback
    - DEC-023   # analytics posture — the SECURITY.md update AFFIRMS it (default-off/zero-network), not amends
  constraints:
    - engine-no-dom
    - touch-targets-44
  related_specs:
    - SPEC-061  # the analytics seam the SECURITY.md accuracy update describes
    - SPEC-063  # sibling STAGE-013 UI hardening

# One sentence on what this spec contributes to its stage's
# value_contribution. For plumbing: "infrastructure enabling
# STAGE-013's <capability>". Optional; null is acceptable.
value_link: >-
  Hardening before PROJ-002 close-out: a top-level crash guard so a component error can't white-screen
  the game, plus a SECURITY.md accuracy pass so the security doc matches the shipped code (analytics
  seam + localStorage keys).

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
      tokens_total: null   # main-loop, not separately metered (AGENTS §4)
      recorded_at: 2026-07-12
      note: Design + build + verify in the orchestrator session (small hardening change; verification is the live fallback + happy-path render).
    - cycle: build
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: 26000   # NOMINAL main-loop estimate — not a metered subagent
      estimated_usd: 0.39   # nominal, 26000 tok x ~$15/M (Opus list, order-of-magnitude)
      recorded_at: 2026-07-12
      note: >-
        Build in the orchestrator loop: a top-level ErrorBoundary (class component) + token-only fallback
        CSS wired outermost in main.tsx; a SECURITY.md accuracy pass (the default-off analytics seam +
        the real localStorage key set). NOMINAL main-loop token estimate (SPEC-054-verify precedent).
        Full gate green (471, worktree excluded). Engine diff EMPTY.
    - cycle: verify
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: 12000   # NOMINAL main-loop estimate
      estimated_usd: 0.18   # nominal, 12000 tok x ~$15/M
      recorded_at: 2026-07-12
      note: >-
        Verified in-browser: happy path renders normally (15 reels, no console errors, boundary
        transparent); then forced a crash (temporary App throw, reverted) → the boundary showed the
        token-styled "Something went wrong / Reload" fallback instead of a white screen. Unit tests cover
        both paths. NOMINAL main-loop estimate.
    - cycle: ship
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      recorded_at: 2026-07-12
      note: main-loop ship cycle — PR + CI-poll + squash-merge + archive + brag.
  totals:
    tokens_total: 38000   # build 26000 + verify 12000 (both NOMINAL; design + ship null)
    estimated_usd: 0.57
    session_count: 4
---

# SPEC-067: Hardening — error boundary + security-doc accuracy

## Context

A hardening pass before PROJ-002 close-out, from a survey of loose ends after the STAGE-011 (analytics)
and STAGE-013 (UI polish) waves. Two gaps:

1. **No React error boundary** — any component that throws during render would **white-screen** the whole
   game. For a play-money app a crash should never look like data loss; a graceful fallback is standard
   robustness hardening.
2. **`SECURITY.md` drifted from the code** — it claimed "no analytics, no trackers" and "only a play-money
   balance + a mute preference in `localStorage`," but STAGE-011 added a (default-OFF, inert) analytics
   seam and earlier stages added `localStorage` keys (active-machine, session stats, help-seen). The
   security doc should match reality.

Presentation/doc only — no engine change (DEC-001).

## Goal

Add a top-level `ErrorBoundary` that catches render errors and shows a token-styled "something went
wrong — reload" fallback instead of a blank screen; and correct `SECURITY.md` so it accurately describes
the default-OFF analytics seam and the real (all non-sensitive) `localStorage` key set — affirming, not
amending, the DEC-023 / DEC-005 posture.

## Outputs

- **Files created:** `src/ui/ErrorBoundary.tsx` (class component — `getDerivedStateFromError` +
  `componentDidCatch`), `src/ui/error-boundary.css` (token-only fallback), `src/ui/ErrorBoundary.test.tsx`.
- **Files modified:** `src/main.tsx` (wrap the whole tree in `<ErrorBoundary>`, outermost),
  `SECURITY.md` (analytics + client-state accuracy).
- No engine / dependency / DEC change.

## Acceptance Criteria

- [ ] With no error, `ErrorBoundary` renders its children transparently (the app is unchanged).
- [ ] When a descendant throws, the boundary renders a `role="alert"` fallback with a "Something went
      wrong" message and a ≥44px **Reload** button — never a blank screen. The caught error is logged to
      the dev console only (no remote logger — DEC-005).
- [ ] `SECURITY.md` accurately describes: the analytics seam is **default-OFF, zero-network, no PII/cookie,
      DNT-honoring** (posture unchanged; remote sinks gated); and the real `localStorage` keys (balance,
      mute, active-machine, session stats, help-seen — all non-sensitive; the analytics session id is
      in-memory only).
- [ ] `git diff … -- src/engine/` EMPTY; token-only CSS (DEC-010); full gate green.

## Failing Tests / guards

- `src/ui/ErrorBoundary.test.tsx` — renders children when healthy; renders the fallback (role=alert +
  "something went wrong" + reload button) when a child throws.

## Implementation Context

- `DEC-001` — UI/doc only; the engine is untouched.
- `DEC-005` — the boundary logs to the dev console only, never a backend logger (no backend exists).
- `DEC-010` — the fallback is token-only CSS, prefixed classes, no raw hex.
- `DEC-023` — the SECURITY.md update **affirms** the analytics posture (default-off, zero-network) it
  set; it is a clarification, not the Tier-2 amendment (which would additionally change CSP + require a
  DEC amending DEC-005 when a *remote* sink is enabled).

### Out of scope
- Retry/telemetry in the boundary beyond a reload; a remote error logger (no backend, DEC-005).
- The `JackpotMoment` hardcoded-wolf cosmetic (flagged separately); any Tier-2 analytics work (gated).

## Notes for the Implementer

A React error boundary must be a class component. Wire it outermost in `main.tsx` so it catches provider
and App errors. Verified in-browser by forcing a temporary crash (reverted) to see the fallback + confirming
the happy path renders normally.

---

## Build Completion

- **Branch:** `feat/spec-067-hardening`
- **All acceptance criteria met?** yes — happy path renders normally (15 reels, no console errors, boundary
  transparent); a forced crash showed the token-styled "Something went wrong / Reload" fallback (screenshot);
  unit tests cover both paths; `SECURITY.md` corrected. Full gate green (471, worktree excluded); engine
  diff EMPTY.
- **New decisions emitted:** none.
- **Deviations from spec:** none.
- **Follow-up identified:** the `JackpotMoment` machine-agnostic wolf (still flagged); PROJ-002 close-out
  is now unblocked.

### Build-phase reflection
1. **What was unclear?** — Only the DEC-023 nuance on touching SECURITY.md; resolved by framing the edit as
   an accuracy clarification that AFFIRMS the posture (default-off/zero-network), not the Tier-2 amendment.
2. **Missing constraint/decision?** — No.
3. **Do differently?** — Nothing; forcing the crash in the browser (then reverting) is the right way to see
   an error-boundary fallback that unit tests can prove but not show.

---

## Reflection (Ship)

1. **What would I do differently next time?** — Add the error boundary earlier (STAGE-001-era) — it's cheap
   insurance every app wants; retrofitting it during a hardening pass works but it protects nothing that
   already shipped without it.
2. **Does any template/constraint/decision need updating?** — No DEC change. The SECURITY.md accuracy pass
   is worth remembering as a close-out checklist item: after a wave adds storage keys or a network seam,
   reconcile the security doc with the code before shipping/closing.
3. **Follow-up spec to write now?** — None required for close-out. Optional: make `JackpotMoment`
   machine-aware (still shows a wolf regardless of the machine's jackpot creature) — flagged, user's call.
