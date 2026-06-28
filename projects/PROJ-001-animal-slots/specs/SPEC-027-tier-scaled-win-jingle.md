---
# Maps to ContextCore task.* semantic conventions.

task:
  id: SPEC-027
  type: story
  cycle: build
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

- **Branch:**
- **PR (if applicable):**
- **All acceptance criteria met?** yes/no
- **New decisions emitted:**
  - none expected — DEC-007 authorizes Tone.js + the jingle
- **Deviations from spec:**
  - [list]
- **Follow-up work identified:**
  - [any new specs for the stage's backlog]

### Build-phase reflection (3 questions, short answers)

1. **What was unclear in the spec that slowed you down?**
   — <answer>

2. **Was there a constraint or decision that should have been listed but wasn't?**
   — <answer>

3. **If you did this task again, what would you do differently?**
   — <answer>

---

## Reflection (Ship)

*Appended during the **ship** cycle.*

1. **What would I do differently next time?**
   — <answer>

2. **Does any template, constraint, or decision need updating?**
   — <answer>

3. **Is there a follow-up spec I should write now before I forget?**
   — <answer>
