---
# Maps to ContextCore task.* semantic conventions.

task:
  id: SPEC-027
  type: story
  cycle: verify
  blocked: false
  priority: high
  complexity: M

project:
  id: PROJ-001
  stage: STAGE-004
repo:
  id: animal-slots

agents:
  architect: claude-opus-4-8
  implementer: claude-sonnet-4-6
  created_at: 2026-06-27

references:
  decisions:
    - DEC-007
    - DEC-001
    - DEC-005
  constraints:
    - audio-gesture-and-mute
    - no-new-top-level-deps-without-decision
    - license-policy
    - test-before-implementation
    - one-spec-per-pr
  related_specs:
    - SPEC-021
    - SPEC-026

value_link: "The one shipping piece of audio: a tier-scaled synthesized win jingle (Tone.js) keyed off the engine's win tier and gated by mute + first-gesture unlock — completing STAGE-004's 'feel' half with sound."

cost:
  sessions:
    - cycle: design
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      duration_minutes: 35
      recorded_at: 2026-06-27
      notes: "main-loop, not separately metered (AGENTS §4); design cycle"
    - cycle: build
      agent: claude-sonnet-4-6
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      duration_minutes: null
      recorded_at: 2026-06-27
      notes: "orchestrator to fill tokens_total from subagent_tokens at ship"
    - cycle: verify
      agent: claude-sonnet-4-6
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      duration_minutes: null
      recorded_at: 2026-06-27
      notes: "orchestrator to fill tokens_total from subagent_tokens at ship"
  totals:
    tokens_total: 0
    estimated_usd: 0
    session_count: 0
---

# SPEC-027: Tier-scaled win jingle

## Context

The last STAGE-004 spec and the **one piece of audio** the MVP ships (DEC-007): a
**tier-scaled synthesized win jingle** via Tone.js, keyed off the engine's win
tier — a short arpeggio for `small`, a longer flourish for `big`, a triumphant
run for `jackpot`. It plays once per win (keyed on SPEC-021's `celebration.id`),
**gated** by SPEC-026's `muted` (off when muted) and `unlocked` (no sound before
the first user gesture — autoplay policy). No sound is faked: the jingle reflects
only the tier that actually landed (DEC-005/DEC-001).

This spec **adds the `tone` dependency** — explicitly authorized by DEC-007 (so
`npm install tone` satisfies `no-new-top-level-deps-without-decision`; Tone.js is
MIT, satisfying `license-policy`). No engine change. After this ships, STAGE-004's
9-item backlog is complete.

See `STAGE-004-win-celebration-and-juice.md`, `DEC-007` (synthesized Tone.js,
win-jingle-only, gesture + mute gated), `DEC-001`, `DEC-005`, SPEC-021
(`celebration` — `id`/`tier`), SPEC-026 (`useAudio` — `muted`/`unlocked`).

## Goal

Add `src/ui/audio/jingle.ts` (Tone.js synthesis: a tier-scaled note sequence,
small < big < jackpot) and `useWinJingle(celebration, { muted, unlocked })` (plays
the jingle once per win `id` **only** when `!muted && unlocked` and the tier is a
real win); wire it into `App` (consuming `useAudio()`'s `muted`/`unlocked` and the
hook's `celebration`). Install `tone` (DEC-007-authorized).

## Inputs

- **Files to read:** `src/ui/audio/useAudio.ts` (`muted`/`unlocked`, SPEC-026),
  `src/ui/useSlotMachine.ts` (`Celebration`, `WinTier`), `src/ui/App.tsx` (wiring
  host), `src/ui/useCountUp.ts` (the fire-once-per-`celebration.id` effect pattern
  to mirror), `decisions/DEC-007`, `decisions/DEC-009` (the dep-DEC precedent),
  `package.json`.
- **External:** Tone.js — https://tonejs.github.io/ — MIT, ships its own types.
- **Related code paths:** `src/ui/audio/`.

## Outputs

- **Files created:**
  - `src/ui/audio/jingle.ts` (+ `jingle.test.ts`) — `JINGLE_NOTES` (tier→note
    array) + `playJingle(tier)` (Tone.js).
  - `src/ui/audio/useWinJingle.ts` (+ `useWinJingle.test.ts`) — the gated hook.
- **Files modified:**
  - `src/ui/App.tsx` — destructure `unlocked` from `useAudio()` and call
    `useWinJingle(celebration, { muted, unlocked })`.
  - `package.json` (+ `package-lock.json`) — add `tone` to `dependencies`.
- **New exports:** `JINGLE_NOTES`, `playJingle`; `useWinJingle`.
- **New dependency:** `tone` (MIT; DEC-007-authorized).
- **Database changes:** none.

## Acceptance Criteria

- [ ] `JINGLE_NOTES` maps `small`/`big`/`jackpot` to note arrays with **strictly
      increasing** length (`small < big < jackpot`) — the tier scaling.
- [ ] `playJingle('none')` is a no-op (no Tone calls); `playJingle(tier)` for a
      real tier calls `Tone.start()` and triggers exactly `JINGLE_NOTES[tier].length`
      notes (verified against a mocked `tone`).
- [ ] `useWinJingle` plays the jingle **once** when a new `celebration` win arrives
      AND `!muted` AND `unlocked`, passing the engine `tier`.
- [ ] `useWinJingle` does **not** play when `muted`, when `!unlocked`, or when
      there is no celebration / a no-win.
- [ ] It re-plays on a new `celebration.id` (a subsequent win); toggling mute alone
      (no new win) does not trigger a play.
- [ ] `tone` is added to `package.json` `dependencies`; no new DEC is needed
      (DEC-007 authorizes it); gate (`typecheck`/`lint`/`test`/`build`) exits 0.
- [ ] Engine unchanged; UI consumes only `celebration` + `useAudio` state.

## Failing Tests

Written during **design**, BEFORE build. The hook tests inject a spy player so
they need no Tone. The jingle test mocks the `tone` module.

- **`src/ui/audio/useWinJingle.test.ts`** (renderHook; inject `play` spy)
  - `"plays once on a win when unmuted and unlocked"` — start `celebration=null`;
    rerender `celebration={{id:1,tier:'small',…}}`, `{muted:false, unlocked:true}`
    → `play` called once with `'small'`.
  - `"does not play when muted"` — same win, `{muted:true, unlocked:true}` → not
    called.
  - `"does not play when locked"` — same win, `{muted:false, unlocked:false}` →
    not called.
  - `"does not play without a celebration"` — `celebration=null` → not called.
  - `"re-plays on a new win id"` — rerender `{id:2,tier:'big'}` (unmuted/unlocked)
    → called again with `'big'` (total 2).
  - `"does not re-play when only mute toggles"` — after one win (id 1), rerender
    same `id:1` with `muted` flipped → no additional call.

- **`src/ui/audio/jingle.test.ts`** (`vi.mock('tone', …)`)
  - `"scales note count by tier"` — `JINGLE_NOTES.small.length <
    JINGLE_NOTES.big.length < JINGLE_NOTES.jackpot.length`.
  - `"playJingle('none') is a no-op"` — mocked `Tone.start` / synth NOT called.
  - `"playJingle plays the tier's notes"` — `playJingle('small')` calls
    `Tone.start()` once and triggers exactly `JINGLE_NOTES.small.length` notes;
    `playJingle('jackpot')` triggers `JINGLE_NOTES.jackpot.length` (more) — proving
    tier scaling reaches Tone.

## Implementation Context

### Decisions that apply

- `DEC-007` — synthesized Tone.js, **win-jingle only**, gated behind first-gesture
  unlock + persisted mute. This spec is that jingle. It also **authorizes the
  `tone` dependency** (so no new DEC for the dep).
- `DEC-001` — the jingle is keyed off the engine's `tier` (via `celebration`); no
  engine change, no game math in the UI.
- `DEC-005` — only real wins play (the taste note: nothing faked).

### Constraints that apply

- `audio-gesture-and-mute` — gate on `unlocked` (gesture happened) and `!muted`
  (SPEC-026 supplies both). `src/ui/audio/**`.
- `no-new-top-level-deps-without-decision` — satisfied: DEC-007 is the decision
  that authorizes `tone`. The build MAY run `npm install tone`.
- `license-policy` — `tone` is MIT (permissive; allowed).
- `test-before-implementation`, `one-spec-per-pr`.

### Prior related work

- `SPEC-021` (shipped) — `celebration` (`id` fires once per win; `tier` is the
  jingle selector). Mirror the `useCountUp` fire-once-per-`id` effect pattern.
- `SPEC-026` (shipped) — `useAudio()` → `muted` + `unlocked`; this spec consumes
  both. `unlocked` is true by the time a win resolves (the Spin click is the
  unlocking gesture), so the first jingle is allowed.

### Out of scope (for this spec specifically)

- Any non-jingle audio (ambient bed, SFX set, button clicks, the literal wolf-howl
  sample) — STAGE-005 / PROJ-002 (DEC-007). Volume/mix controls. A `prefers-
  reduced-motion` path (audio is not motion — the mute toggle is its control).

## Notes for the Implementer

- Install: `npm install tone` (DEC-007-authorized — do NOT emit a new DEC).
- `jingle.ts` — keep Tone usage minimal and tree-shakeable (named imports):
  ```ts
  import { start, now, Synth } from 'tone';
  import type { WinTier } from '../useSlotMachine'; // or from ../../engine/index

  export const JINGLE_NOTES: Record<'small' | 'big' | 'jackpot', string[]> = {
    small:   ['C5', 'E5', 'G5'],
    big:     ['C5', 'E5', 'G5', 'C6', 'E6'],
    jackpot: ['C5', 'E5', 'G5', 'C6', 'E6', 'G6', 'C7'],
  };

  export function playJingle(tier: WinTier): void {
    if (tier === 'none') return;
    const notes = JINGLE_NOTES[tier];
    void start();                       // resume the context (a gesture has occurred)
    const synth = new Synth().toDestination();
    const t0 = now();
    notes.forEach((note, i) => synth.triggerAttackRelease(note, '8n', t0 + i * 0.12));
  }
  ```
  (Wrapping the body in a `try { … } catch { /* audio is best-effort */ }` is fine
  so a missing AudioContext never breaks the app.)
- `useWinJingle.ts` — fire once per `celebration.id`, gate inside the effect:
  ```ts
  import { useEffect } from 'react';
  import type { Celebration } from '../useSlotMachine';
  import type { WinTier } from '../useSlotMachine';
  import { playJingle } from './jingle';

  export function useWinJingle(
    celebration: Celebration | null,
    opts: { muted: boolean; unlocked: boolean },
    play: (tier: WinTier) => void = playJingle,
  ): void {
    const { muted, unlocked } = opts;
    useEffect(() => {
      if (!celebration) return;
      if (muted || !unlocked) return;
      if (celebration.tier === 'none') return;
      play(celebration.tier);
      // Intentionally keyed on celebration.id ONLY (fire once per win); muted/
      // unlocked are read at fire time. This repo has no react-hooks ESLint plugin.
    }, [celebration?.id]);
  }
  ```
  The `play` param is injectable so tests pass a `vi.fn()` and never touch Tone.
- `App.tsx` — `const { muted, toggleMute, unlocked } = useAudio();` (now also
  `unlocked`), keep `<Header muted onToggleMute />`, and add
  `useWinJingle(celebration, { muted, unlocked });` near the other hook calls.
- `jingle.test.ts` — `vi.mock('tone', () => ({ start: vi.fn(()=>Promise.resolve()),
  now: vi.fn(()=>0), Synth: vi.fn(() => ({ toDestination: () => ({
  triggerAttackRelease: <shared vi.fn> }) })) }))`; assert call counts per tier and
  the no-op for `'none'`. (Define the shared `triggerAttackRelease` spy in the
  factory and import it to assert.)
- Bundle note: Tone is sizable; named imports keep it as small as practical. The
  build size will grow — expected and DEC-007-authorized.
- This repo's ESLint has **no `react-hooks` plugin** — do NOT add an exhaustive-deps
  disable. `@testing-library/user-event` is NOT installed — use `fireEvent` /
  `renderHook` only.
- After build, the orchestrator previews: spin to a win with sound unmuted →
  confirm no console errors and the audio context resumes (the jingle is best-effort
  in the preview; the unit tests prove gating + tier scaling).

---

## Build Completion

*Filled in at the end of the **build** cycle, before advancing to verify.*

- **Branch:** feat/spec-027-win-jingle
- **PR (if applicable):** local only (not pushed per instructions)
- **All acceptance criteria met?** yes
- **New decisions emitted:**
  - none — DEC-007 authorizes Tone.js + the jingle
- **Deviations from spec:**
  - `WinTier` is not re-exported from `useSlotMachine`; both `jingle.ts` and `useWinJingle.ts` import it from `../../engine/index` instead. The spec's drop-in code suggested `from '../useSlotMachine'` but that module does not re-export the type.
- **Follow-up work identified:**
  - none; this completes the STAGE-004 backlog

### Build-phase reflection (3 questions, short answers)

1. **What was unclear in the spec that slowed you down?**
   — The drop-in code in "Notes for the Implementer" suggested `import type { WinTier } from '../useSlotMachine'`, but `useSlotMachine.ts` only imports `WinTier` internally and does not re-export it. TypeScript caught this immediately; the fix (import from `../../engine/index`) was obvious, but it required a short investigation cycle.

2. **Was there a constraint or decision that should have been listed but wasn't?**
   — No gaps. DEC-007 covering the dep, the audio-gesture-and-mute constraint, and the note that this repo has no react-hooks ESLint plugin were all accurate and sufficient. The spec's note about not adding an exhaustive-deps disable comment was especially useful — otherwise the default instinct would have been to add one.

3. **If you did this task again, what would you do differently?**
   — Verify that every type referenced in drop-in import paths is actually exported before writing the files, rather than discovering the mismatch at typecheck. A one-line grep (`grep "export.*WinTier" src/ui/useSlotMachine.ts`) would have caught it before the first typecheck run.

---

## Verify

**Reviewer:** claude-sonnet-4-6 (cold — did not build this)
**Date:** 2026-06-27
**Verdict:** ✅ APPROVED

### Gate results

| Gate | Result |
|---|---|
| `just typecheck` | exit 0 |
| `just lint` | exit 0 |
| `just test` | exit 0 — 32 test files, **203 tests** passed (0 failed) |
| `just build` | exit 0 — 1030 modules transformed, 384.93 kB bundle |
| `just decisions-audit --changed main` | advisory only — DEC-007 correctly flagged as governing `src/ui/audio/**`; all changes consistent |

### Checklist

- ✅ **JINGLE_NOTES strictly increasing** — `small=3, big=5, jackpot=7` (3 < 5 < 7). Evidence: `jingle.ts` lines 7–11; test asserts `small.length < big.length < jackpot.length`.
- ✅ **playJingle('none') is a no-op** — `jingle.ts` line 14 returns early before any Tone call. Test `jingle.test.ts` line 33–37 asserts `start` and `triggerAttackRelease` NOT called.
- ✅ **playJingle(tier) calls Tone.start() once + triggers JINGLE_NOTES[tier].length notes** — confirmed in `jingle.ts` lines 17–21; tests assert `start` called once and `triggerAttackRelease` called `JINGLE_NOTES.small.length` (3) / `JINGLE_NOTES.jackpot.length` (7) times.
- ✅ **Tone mock is non-vacuous** — `vi.mock('tone', …)` defines a shared `triggerAttackRelease` spy before the factory; each tier test runs independently (beforeEach clears mocks). Would fail if `playJingle` didn't scale or didn't call Tone.
- ✅ **useWinJingle plays once on new win when !muted && unlocked** — `useWinJingle.test.ts` line 13–28; `play` spy called once with `'small'`.
- ✅ **Does not play when muted** — test line 30–40; `play` not called.
- ✅ **Does not play when locked** — test line 42–51; `play` not called.
- ✅ **Does not play without celebration** — test line 53–62; `play` not called.
- ✅ **Re-plays on new celebration.id** — test line 64–81; `play` called twice total after `id:1` then `id:2`.
- ✅ **Does not re-play when only mute toggles (same id)** — test line 83–102; after win `id:1`, toggle muted true, then false — `play` stays at 1 call.
- ✅ **useEffect keyed on [celebration?.id] only** — `useWinJingle.ts` line 23: `}, [celebration?.id])`. Muted/unlocked read at fire time inside the effect. Correct: mute toggle alone never changes `celebration?.id` so no re-fire.
- ✅ **play param is injectable** — third param defaults to `playJingle` but tests pass `vi.fn()`. No real Tone runs in hook tests.
- ✅ **tone in package.json dependencies** — confirmed: `"tone": "^15.1.22"` in `dependencies` (not devDependencies).
- ✅ **DEP AUTHORIZED** — DEC-007 explicitly authorizes `tone` / Tone.js. No new DEC was added or is required. Confirmed no new `DEC-*` files in `git diff main..HEAD`.
- ✅ **MIT license** — `node_modules/tone/package.json`: `"license": "MIT"`. Satisfies `license-policy` constraint.
- ✅ **Engine unchanged** — `git diff main..HEAD -- src/engine/` is empty.
- ✅ **No eslint-disable in audio/** — `grep -rn "eslint-disable" src/ui/audio/` returned no matches.
- ✅ **No @testing-library/user-event** — hook tests use `renderHook` + `rerender` only; no `fireEvent`, no `userEvent`.
- ✅ **Scope** — only `src/ui/audio/jingle.ts`, `jingle.test.ts`, `useWinJingle.ts`, `useWinJingle.test.ts`, `src/ui/App.tsx`, `package.json`, `package-lock.json`, plus spec/timeline/stage docs. No engine, no unrelated UI.
- ✅ **decisions-audit** — `just decisions-audit --changed main` advisory only; DEC-007 governs `src/ui/audio/**` and implementation is fully consistent. 16 pre-existing scope-overlap warnings from `just decisions-audit` (no flag); all pre-date this PR, none contradictory.
- ✅ **Build reflection honest and specific** — correctly identifies the `WinTier` import-path fix: `useSlotMachine.ts` imports `WinTier` from `engine/index` but does not re-export it. Both `jingle.ts` and `useWinJingle.ts` import from `../../engine/index` (the public interface, DEC-001 compliant). Confirmed via `grep "export.*WinTier" src/engine/index.ts` → line 18: `export type { WinTier } from './tiers'`.
- ✅ **Cost build session** — present with `tokens_total: null` + "orchestrator to fill" note. Correct per AGENTS §4 (metered subagent cycle; orchestrator fills at ship).

---

## Reflection (Ship)

*Appended during the **ship** cycle.*

1. **What would I do differently next time?**
   — <answer>

2. **Does any template, constraint, or decision need updating?**
   — <answer>

3. **Is there a follow-up spec I should write now before I forget?**
   — <answer>
