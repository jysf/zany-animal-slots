---
# Maps to ContextCore task.* semantic conventions.

task:
  id: SPEC-029
  type: story
  cycle: build
  blocked: false
  priority: high
  complexity: M

project:
  id: PROJ-001
  stage: STAGE-005
repo:
  id: animal-slots

agents:
  architect: claude-opus-4-8
  implementer: claude-sonnet-4-6
  created_at: 2026-06-27

references:
  decisions:
    - DEC-007
    - DEC-013
    - DEC-001
  constraints:
    - audio-gesture-and-mute
    - perf-60fps
    - test-before-implementation
    - one-spec-per-pr
  related_specs:
    - SPEC-026
    - SPEC-028

value_link: "Adds the mechanical sound layer — a spin whoosh, per-reel stop clunks, and a win ting — on the SPEC-028 sfx channel, fired off real game events and gated by mute + unlock."

cost:
  sessions:
    - cycle: design
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      duration_minutes: 30
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
  totals:
    tokens_total: 0
    estimated_usd: 0
    session_count: 0
---

# SPEC-029: SFX set

## Context

The second STAGE-005 audio spec. SPEC-028 built the shared graph and the ambient
bed and reserved an `sfx` channel; this spec fills it with the **mechanical sound
layer**: a **spin whoosh** when a spin starts, **per-reel stop clunks** staggered
as the reels land, and a short **win ting** on a win (a percussive coin texture
layered under SPEC-027's melodic jingle). All synthesized on the `sfx` channel
(DEC-013), gated by `useAudio` (`muted` + `unlocked`, SPEC-026), no asset files
(DEC-007).

The SFX fire off **real game events** the UI already exposes — `isSpinning` edges
(spin start / reels land) and the one-shot `celebration` (a win) — so nothing is
faked and each fires once per event (DEC-001/DEC-005). Pure UI.

See `STAGE-005-…md`, `DEC-013` (the `sfx` channel), `DEC-007`, SPEC-026
(`useAudio`), SPEC-028 (the graph + `getChannel`).

## Goal

Add `src/ui/audio/sfx.ts` (`playSfx(name)` for `'spin' | 'reelStop' | 'win'`,
synthesized through the `sfx` channel; `reelStop` schedules a staggered run of
clunks) and `useGameSfx(isSpinning, celebration, { muted, unlocked })` (fires
`spin` on the spin-start edge, `reelStop` on the reels-land edge, and `win` on a
new winning `celebration`, all gated); wire it into `App`.

## Inputs

- **Files to read:** `src/ui/audio/audioEngine.ts` (`getChannel('sfx')`),
  `src/ui/audio/jingle.ts` (the synth-through-a-channel + `try/catch` pattern to
  mirror), `src/ui/audio/useWinJingle.ts` (the fire-once-per-`celebration.id`
  pattern), `src/ui/useSlotMachine.ts` (`isSpinning`, `Celebration`), `src/ui/App.tsx`.
  Tone.js: `MembraneSynth` / `NoiseSynth` / `MetalSynth` (or plain `Synth`), `now`.
- **Related code paths:** `src/ui/audio/`.

## Outputs

- **Files created:**
  - `src/ui/audio/sfx.ts` (+ `sfx.test.ts`) — `playSfx`, `SfxName`, and the
    per-reel clunk count constant.
  - `src/ui/audio/useGameSfx.ts` (+ `useGameSfx.test.ts`) — the event-wiring hook.
- **Files modified:**
  - `src/ui/App.tsx` — call `useGameSfx(isSpinning, celebration, { muted, unlocked })`.
- **New exports:** `playSfx`, `SfxName`, `REEL_STOP_CLUNKS`; `useGameSfx`.
- **Database changes:** none.

## Acceptance Criteria

- [ ] `playSfx(name)` synthesizes each of `'spin'`/`'reelStop'`/`'win'` through the
      `sfx` channel (`getChannel('sfx')`), never `.toDestination()`; `reelStop`
      schedules `REEL_STOP_CLUNKS` (5) staggered hits. Best-effort (`try/catch`) —
      never throws. (Verified against a mocked `tone`.)
- [ ] `useGameSfx` plays `'spin'` exactly on the **not-spinning → spinning** edge
      and `'reelStop'` exactly on the **spinning → not-spinning** edge (one each per
      spin; no fire on mount, no fire on unrelated re-renders).
- [ ] `useGameSfx` plays `'win'` once per new winning `celebration.id` (tier ≠
      `none`); not on a no-win.
- [ ] All three are gated: nothing plays when `muted` or `!unlocked`.
- [ ] Engine unchanged; no new dependency; existing tests still pass; gate exits 0.

## Failing Tests

Written during **design**, BEFORE build. The hook tests inject a `play` spy (no
real Tone); `sfx.test.ts` mocks `tone`.

- **`src/ui/audio/useGameSfx.test.ts`** (renderHook; inject `play` spy; opts
  `{muted:false, unlocked:true}` unless stated)
  - `"plays spin on the spin-start edge"` — rerender `isSpinning` false→true →
    `play('spin')` once.
  - `"plays reelStop on the reels-land edge"` — false→true→false → `play('reelStop')`
    on the true→false transition.
  - `"does not fire on mount"` — initial render `isSpinning=false` → no call.
  - `"plays win on a new winning celebration"` — set `celebration={id:1,
    tier:'small',…}` → `play('win')` once; a second win `id:2` → again.
  - `"does not play win on a no-win"` — `celebration=null` → no `'win'`.
  - `"does not play anything when muted"` — `{muted:true}`, drive a spin edge + a
    win → no calls.
  - `"does not play anything when locked"` — `{unlocked:false}`, same → no calls.

- **`src/ui/audio/sfx.test.ts`** (`vi.mock('tone', …)`)
  - `"REEL_STOP_CLUNKS is 5"`.
  - `"playSfx routes through the sfx channel"` — `playSfx('spin')` connects its
    synth to `getChannel('sfx')` (mock the engine or assert the channel is used),
    and triggers at least once; no `.toDestination()`.
  - `"reelStop schedules REEL_STOP_CLUNKS hits"` — `playSfx('reelStop')` triggers 5
    staggered hits.
  - `"playSfx never throws"` — wrapping is best-effort.

## Implementation Context

### Decisions that apply

- `DEC-013` — SFX play on the `sfx` channel via `getChannel('sfx')`; never direct
  to destination. Levels are the channel's job (mixing is SPEC-030).
- `DEC-007` — synthesized only; gated.
- `DEC-001`/`DEC-005` — fire off real engine-driven events (`isSpinning`,
  `celebration`); nothing faked.

### Constraints that apply

- `audio-gesture-and-mute` — gated on `muted` + `unlocked` (read at fire time).
- `perf-60fps` — short one-shots; the perf pass (SPEC-034) measures the full load.
- `test-before-implementation`, `one-spec-per-pr`.

### Prior related work

- `SPEC-028` (shipped) — the graph + `getChannel('sfx')` this spec fills; mirror its
  `try/catch` best-effort + mocked-`tone` test style.
- `SPEC-026` (shipped) — `useAudio` gate. `SPEC-027` (shipped) — the win **jingle**;
  the `win` SFX is a brief percussive coin ting that *layers under* the jingle, not a
  replacement (keep it short/quiet so they complement).

### Out of scope (for this spec specifically)

- Dynamic mixing / ducking / swell (SPEC-030 — this spec just plays through the
  channel at its default level). The a11y/perf specs. Asset files (DEC-007).
- Bet-change / button-click UI SFX — not in the framed set; keep to spin/reelStop/win.

## Notes for the Implementer

- `sfx.ts` — one synth per call, through the sfx channel, best-effort:
  ```ts
  import { now, MembraneSynth, NoiseSynth, MetalSynth } from 'tone';
  import { ensureAudio, getChannel } from './audioEngine';

  export type SfxName = 'spin' | 'reelStop' | 'win';
  export const REEL_STOP_CLUNKS = 5;

  export function playSfx(name: SfxName): void {
    try {
      ensureAudio();
      const ch = getChannel('sfx');
      const t0 = now();
      if (name === 'spin') {
        const whoosh = new NoiseSynth({ noise: { type: 'white' }, envelope: { attack: 0.005, decay: 0.25, sustain: 0 } }).connect(ch);
        whoosh.triggerAttackRelease('8n', t0);
      } else if (name === 'reelStop') {
        const drum = new MembraneSynth().connect(ch);
        for (let i = 0; i < REEL_STOP_CLUNKS; i++) drum.triggerAttackRelease('C2', '16n', t0 + i * 0.09);
      } else { // 'win'
        const ting = new MetalSynth().connect(ch);
        ting.triggerAttackRelease('C6', '16n', t0);
      }
    } catch { /* audio is best-effort */ }
  }
  ```
  (Exact synths/voicing are feel choices — tune in preview; the contract is
  routing-through-`sfx` + the staggered reelStop count.)
- `useGameSfx.ts` — edge detection via a ref, gated at fire time:
  ```ts
  import { useEffect, useRef } from 'react';
  import type { Celebration } from '../useSlotMachine';
  import { playSfx, type SfxName } from './sfx';

  export function useGameSfx(
    isSpinning: boolean,
    celebration: Celebration | null,
    opts: { muted: boolean; unlocked: boolean },
    play: (n: SfxName) => void = playSfx,
  ): void {
    const { muted, unlocked } = opts;
    const prev = useRef<boolean | null>(null);
    useEffect(() => {
      const was = prev.current;
      prev.current = isSpinning;
      if (was === null) return;                 // no fire on mount
      if (muted || !unlocked) return;
      if (!was && isSpinning) play('spin');
      else if (was && !isSpinning) play('reelStop');
    }, [isSpinning]);
    useEffect(() => {
      if (!celebration || celebration.tier === 'none') return;
      if (muted || !unlocked) return;
      play('win');
    }, [celebration?.id]);
  }
  ```
- `App.tsx` — destructure `status`/`isSpinning` already present; add
  `useGameSfx(isSpinning, celebration, { muted, unlocked })` next to the other audio
  hooks.
- This repo's ESLint has **no `react-hooks` plugin** — do NOT add an exhaustive-deps
  disable. **No new dependency.** No new DEC (DEC-013 covers the channel).
- After build, the orchestrator previews: a spin plays a whoosh then a stutter of
  clunks as it lands; a win adds a ting under the jingle; muting silences all. Audio
  is best-effort in preview — confirm no console errors and tune levels/voicing.

---

## Build Completion

*Filled in at the end of the **build** cycle, before advancing to verify.*

- **Branch:** feat/spec-029-sfx-set
- **PR (if applicable):** local only — no push per instructions
- **All acceptance criteria met?** yes
- **New decisions emitted:**
  - none expected
- **Deviations from spec:**
  - none; drop-in code from "Notes for the Implementer" used exactly as provided
- **Follow-up work identified:**
  - none beyond the already-planned SPEC-030 (dynamic mixing)

### Build-phase reflection (3 questions, short answers)

1. **What was unclear in the spec that slowed you down?**
   — The `sfx.test.ts` mock wiring for `MembraneSynth` required care: the reelStop path calls `triggerAttackRelease` directly on the drum instance (not on a chained return from `connect`), so the mock needed `triggerAttackRelease` on the synth object itself as well as `connect` returning `drumMock` self-referentially. The spec's test outline didn't spell this out, requiring a quick read of the implementation to reason about the mock shape.

2. **Was there a constraint or decision that should have been listed but wasn't?**
   — No missing constraint. The note about "no exhaustive-deps disable comment" is slightly inconsistent with normal practice (the comments are typically no-ops without the plugin), but the spec calls it out clearly enough to follow without slowdown.

3. **If you did this task again, what would you do differently?**
   — Write the `sfx.test.ts` mock for `MembraneSynth` last, after confirming the implementation path (direct call on drum vs. chained return), rather than trying to infer the mock shape from the implementation outline alone.

---

## Reflection (Ship)

*Appended during the **ship** cycle.*

1. **What would I do differently next time?**
   — <answer>

2. **Does any template, constraint, or decision need updating?**
   — <answer>

3. **Is there a follow-up spec I should write now before I forget?**
   — <answer>
