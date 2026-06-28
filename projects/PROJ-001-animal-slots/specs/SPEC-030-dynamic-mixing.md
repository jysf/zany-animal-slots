---
# Maps to ContextCore task.* semantic conventions.

task:
  id: SPEC-030
  type: story
  cycle: verify
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
    - SPEC-025
    - SPEC-028

value_link: "The payoff of the shared audio graph: tier-aware bus mixing — the ambient bed swells on a big win and ducks under the jackpot moment so the showpiece audio stands out — keyed off the engine win tier, gated."

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

# SPEC-030: Dynamic mixing

## Context

The third STAGE-005 audio spec and the **payoff of DEC-013's channel graph**:
with the bed (SPEC-028), SFX (SPEC-029), and jingle (SPEC-027) each on their own
channel, mixing is now a gain change on one node. This spec adds **tier-aware bus
automation**: on a **big** win the ambient **bed swells** (a brief lift for
energy), and on the **jackpot** the **bed ducks** (drops low) so the jackpot
jingle + win ting cut through the moment, then both restore to the baseline level.
Small wins leave the mix flat.

Keyed off the engine win tier via the one-shot `celebration` (fires once per win),
gated by `useAudio` (`muted` + `unlocked`), synthesized-only (DEC-007), engine
untouched (DEC-001/DEC-005 — nothing faked; the mix reflects the tier that landed).

See `STAGE-005-…md`, `DEC-013` (channels to mix on), `DEC-007`, SPEC-025 (the
jackpot moment the duck supports), SPEC-028 (the `bed` channel + `CHANNEL_GAINS`).

## Goal

Add `src/ui/audio/mixer.ts` (`applyMix(tier)` — ramps the `bed` channel gain:
swell on `big`, duck on `jackpot`, then restore to `CHANNEL_GAINS.bed`; no-op on
`small`/`none`) and `useDynamicMixing(celebration, { muted, unlocked })` (calls
`applyMix(tier)` once per winning `celebration.id`, gated); wire it into `App`.

## Inputs

- **Files to read:** `src/ui/audio/audioEngine.ts` (`getChannel('bed')`,
  `CHANNEL_GAINS`), `src/ui/audio/useWinJingle.ts` (the fire-once-per-id gated
  pattern to mirror), `src/ui/useSlotMachine.ts` (`Celebration`, `WinTier`),
  `src/ui/App.tsx`. Tone.js: a `Gain`'s `.gain` param has `rampTo(value, seconds)`.
- **Related code paths:** `src/ui/audio/`.

## Outputs

- **Files created:**
  - `src/ui/audio/mixer.ts` (+ `mixer.test.ts`) — `applyMix`, the `MIX` level/timing
    constants.
  - `src/ui/audio/useDynamicMixing.ts` (+ `useDynamicMixing.test.ts`) — the hook.
- **Files modified:**
  - `src/ui/App.tsx` — call `useDynamicMixing(celebration, { muted, unlocked })`.
- **New exports:** `applyMix`, `MIX`; `useDynamicMixing`.
- **Database changes:** none.

## Acceptance Criteria

- [ ] `applyMix('jackpot')` ramps the `bed` channel gain **down** to `MIX.duckLevel`,
      then (after `MIX.holdMs`) ramps it back to `CHANNEL_GAINS.bed`.
- [ ] `applyMix('big')` ramps the `bed` gain **up** to `MIX.swellLevel`, then restores
      it to `CHANNEL_GAINS.bed`.
- [ ] `applyMix('small')` and `applyMix('none')` are no-ops (no gain change). All
      branches are best-effort (`try/catch`) — never throw. (Verified with a mocked
      `bed` channel + fake timers.)
- [ ] `MIX.duckLevel < CHANNEL_GAINS.bed < MIX.swellLevel` (duck is quieter, swell
      is louder than baseline).
- [ ] `useDynamicMixing` calls `applyMix(tier)` once per new winning
      `celebration.id` (tier ≠ `none`) only when `!muted && unlocked`; not when muted,
      locked, or on a no-win.
- [ ] Engine unchanged; no new dependency; existing tests still pass; gate exits 0.

## Failing Tests

Written during **design**, BEFORE build. The hook test injects a `mix` spy; the
mixer test mocks the `bed` channel (via mocking `./audioEngine`) and uses fake
timers for the restore.

- **`src/ui/audio/useDynamicMixing.test.ts`** (renderHook; inject `mix` spy;
  `{muted:false, unlocked:true}` unless stated)
  - `"applies the mix on a new winning celebration"` — `celebration={id:1,
    tier:'big',…}` → `mix('big')` once.
  - `"passes the jackpot tier"` — `{id:1, tier:'jackpot'}` → `mix('jackpot')`.
  - `"re-applies on a new win id"` — then `{id:2, tier:'small'}` → `mix('small')`
    (total 2 calls).
  - `"does not apply on a no-win"` — `celebration=null` → not called.
  - `"does not apply when muted"` — `{muted:true}` + a win → not called.
  - `"does not apply when locked"` — `{unlocked:false}` + a win → not called.

- **`src/ui/audio/mixer.test.ts`** (`vi.mock('./audioEngine', …)` returning a `bed`
  channel whose `gain.rampTo` is a spy; `vi.useFakeTimers()`)
  - `"MIX levels are ordered"` — `MIX.duckLevel < CHANNEL_GAINS.bed < MIX.swellLevel`.
  - `"jackpot ducks then restores"` — `applyMix('jackpot')` → `rampTo` called toward
    `MIX.duckLevel`; after `vi.advanceTimersByTime(MIX.holdMs)` → `rampTo` called
    toward `CHANNEL_GAINS.bed`.
  - `"big swells then restores"` — `applyMix('big')` → `rampTo` toward
    `MIX.swellLevel`; after the hold → restore toward `CHANNEL_GAINS.bed`.
  - `"small and none are no-ops"` — `applyMix('small')` / `applyMix('none')` → no
    `rampTo` call.
  - `"never throws"` — best-effort.

## Implementation Context

### Decisions that apply

- `DEC-013` — mixing is bus automation: ramp the **`bed` channel's** `.gain` param;
  do not touch individual synths. Baseline is `CHANNEL_GAINS.bed` (restore target).
- `DEC-007` — synthesized; gated.
- `DEC-001`/`DEC-005` — keyed off the engine tier via `celebration`; nothing faked.

### Constraints that apply

- `audio-gesture-and-mute` — gated on `muted` + `unlocked` (read at fire time).
- `perf-60fps` — gain ramps are cheap; the perf pass (SPEC-034) measures the whole.
- `test-before-implementation`, `one-spec-per-pr`.

### Prior related work

- `SPEC-028` (shipped) — `getChannel('bed')` + `CHANNEL_GAINS.bed` (the baseline);
  the channel architecture (DEC-013) exists precisely so this is a one-node change.
- `SPEC-027` / `SPEC-029` (shipped) — the jingle + win ting that the jackpot duck
  makes prominent. `SPEC-025` (shipped) — the jackpot moment (≈3.5s) the duck spans.

### Out of scope (for this spec specifically)

- New sounds (bed/SFX/jingle already exist). Per-SFX ducking, sidechain
  compression, or a full mixer UI. The a11y/perf specs. Asset files (DEC-007).

## Notes for the Implementer

- `mixer.ts` — ramp the bed gain, restore after a hold; best-effort:
  ```ts
  import { getChannel, CHANNEL_GAINS } from './audioEngine';
  import type { WinTier } from '../../engine/index';

  export const MIX = {
    duckLevel: 0.05,     // bed drops under the jackpot
    swellLevel: 0.45,    // bed lifts on a big win  (> CHANNEL_GAINS.bed = 0.25)
    rampS: 0.2,          // ramp time to the target
    restoreS: 0.6,       // ramp time back to baseline
    holdMs: 3000,        // how long before restoring (≈ jackpot moment span)
  };

  export function applyMix(tier: WinTier): void {
    if (tier !== 'big' && tier !== 'jackpot') return;   // small / none: flat
    try {
      const gain = getChannel('bed').gain;
      const target = tier === 'jackpot' ? MIX.duckLevel : MIX.swellLevel;
      gain.rampTo(target, MIX.rampS);
      setTimeout(() => { try { gain.rampTo(CHANNEL_GAINS.bed, MIX.restoreS); } catch { /* ignore */ } }, MIX.holdMs);
    } catch { /* audio is best-effort */ }
  }
  ```
  (Levels/timings are feel knobs — tune in preview. The contract is: jackpot ducks,
  big swells, both restore to `CHANNEL_GAINS.bed`, and the ordering invariant holds.)
- `useDynamicMixing.ts` — mirror `useWinJingle` exactly:
  ```ts
  import { useEffect } from 'react';
  import type { Celebration } from '../useSlotMachine';
  import { applyMix } from './mixer';
  import type { WinTier } from '../../engine/index';
  export function useDynamicMixing(
    celebration: Celebration | null,
    opts: { muted: boolean; unlocked: boolean },
    mix: (t: WinTier) => void = applyMix,
  ): void {
    const { muted, unlocked } = opts;
    useEffect(() => {
      if (!celebration || celebration.tier === 'none') return;
      if (muted || !unlocked) return;
      mix(celebration.tier);
    }, [celebration?.id]);
  }
  ```
- `App.tsx` — add `useDynamicMixing(celebration, { muted, unlocked })` next to the
  other audio hooks.
- This repo's ESLint has **no `react-hooks` plugin** — do NOT add an exhaustive-deps
  disable. **No new dependency.** No new DEC (DEC-013 covers bus mixing).
- After build, the orchestrator previews: a big win lifts the bed briefly; the
  jackpot drops it under the moment then restores. Audio is best-effort in preview —
  confirm no console errors; tune levels/timings.

---

## Build Completion

*Filled in at the end of the **build** cycle, before advancing to verify.*

- **Branch:** feat/spec-030-dynamic-mixing
- **PR (if applicable):** local only (not yet pushed)
- **All acceptance criteria met?** yes
- **New decisions emitted:**
  - none (DEC-013 covers bus mixing as expected)
- **Deviations from spec:**
  - none — drop-in code used verbatim; `mixer.ts` and `useDynamicMixing.ts` match the spec's "Notes for the Implementer" exactly
- **Follow-up work identified:**
  - none beyond the existing STAGE-005 backlog (reduced-motion, contrast, colorblind, perf)

### Build-phase reflection (3 questions, short answers)

1. **What was unclear in the spec that slowed you down?**
   — Nothing slowed me down. The "Notes for the Implementer" gave complete drop-in code and the existing `useWinJingle` / `audioEngine` files made the mock pattern obvious. The spec was the clearest of the STAGE-005 audio series.

2. **Was there a constraint or decision that should have been listed but wasn't?**
   — No gaps. The `vi.useFakeTimers()` / `vi.useRealTimers()` discipline for the `setTimeout`-based restore wasn't explicitly called out in the spec, but it was obvious from the test description and the fake-timer pattern is standard Vitest.

3. **If you did this task again, what would you do differently?**
   — Nothing of substance. The spec was tight enough that the build was purely mechanical: write the files, run the gate, done in one pass. If anything, I'd note that the `rampTo` mock in `mixer.test.ts` must be defined *before* the `vi.mock(...)` call (module hoisting order) — a subtle Vitest constraint worth a one-liner in the spec's notes.

---

## Verify

Reviewed 2026-06-27 by claude-sonnet-4-6 (cold session, PR #30).

### Gate results

```
just typecheck  ✅  exit 0 (tsc --noEmit, strict)
just lint       ✅  exit 0 (no ESLint errors)
just test       ✅  exit 0 — 237/237 tests, 39 files (incl. 6 mixer + 6 useDynamicMixing)
just build      ✅  exit 0 — 1037 modules; dist/assets/index-*.js 406 kB
```

`just decisions-audit --changed main` — advisory reminders for DEC-004, DEC-007, DEC-010, DEC-013. All confirmed consistent; DEC-013 is the governing decision for this spec and the implementation follows it exactly.

### Checklist

- ✅ **AC: `applyMix('jackpot')` ducks then restores** — `mixer.ts` ramps `getChannel('bed').gain` to `MIX.duckLevel` (0.05) then after `setTimeout(MIX.holdMs=3000)` ramps to `CHANNEL_GAINS.bed` (0.25). Test "jackpot ducks then restores" asserts both `rampTo` calls with exact values after `vi.advanceTimersByTime(MIX.holdMs)`. Evidence: `mixer.test.ts` lines 33–44.
- ✅ **AC: `applyMix('big')` swells then restores** — ramps to `MIX.swellLevel` (0.45) then restores to 0.25. Test "big swells then restores" asserts same pattern. Evidence: `mixer.test.ts` lines 46–57.
- ✅ **AC: `applyMix('small')` and `applyMix('none')` are no-ops** — early return on `tier !== 'big' && tier !== 'jackpot'`; tests advance timers and assert `rampTo` not called. Evidence: `mixer.test.ts` lines 59–68.
- ✅ **AC: Never throws** — outer `try/catch` wraps all audio calls; inner try/catch in `setTimeout` callback; "never throws even when rampTo throws" test confirms. Evidence: `mixer.test.ts` lines 70–73.
- ✅ **AC: `MIX.duckLevel < CHANNEL_GAINS.bed < MIX.swellLevel`** — 0.05 < 0.25 < 0.45. "MIX levels are ordered" test asserts both inequalities. Evidence: `mixer.test.ts` lines 26–29 + `mixer.ts` lines 8–10.
- ✅ **AC: `useDynamicMixing` fires once per new `celebration.id` (tier≠none), gated by `!muted && unlocked`** — six tests cover: new win triggers once, jackpot tier passed correctly, new win id fires again (total 2 calls), null celebration is no-op, muted blocks, locked blocks. Evidence: `useDynamicMixing.test.ts` (all 6 tests).
- ✅ **DEC-013 honored** — `mixer.ts` calls `getChannel('bed').gain.rampTo(...)`, not individual synths; restore target is `CHANNEL_GAINS.bed`. Verified in `audioEngine.ts`: `getChannel()` returns a `Gain` node; `.gain` is the Tone.js `Param` with `rampTo()`.
- ✅ **Engine unchanged** — `git diff main..HEAD -- src/engine/` is empty.
- ✅ **No new dep** — `git diff main..HEAD -- package.json` is empty.
- ✅ **Tests not vacuous** — `useDynamicMixing` tests inject `vi.fn()` as `mix` param and assert exact call counts + tier argument. `mixer.test.ts` mocks `./audioEngine`, uses fake timers, and asserts exact `rampTo` arguments for duck/swell target AND the post-holdMs restore, plus no-op branches and never-throws. Tests would fail if ramp targets, restore target, holdMs timing, or gating conditions were wrong.
- ✅ **No bad `eslint-disable` / no `user-event`** — grep clean across all four new files.
- ✅ **Decision drift** — `just decisions-audit --changed main` advisory only; DEC-013 governs the territory; no new DEC required (DEC-013 already covers bus mixing).
- ✅ **Build reflection honest** — three answers are specific and accurate (noted the Vitest module-hoisting subtlety; no inflated difficulty claimed; deviations: none, consistent with verbatim drop-in code).
- ✅ **Cost sessions** — build session present with `tokens_total: null` and "orchestrator to fill" note. Design session has null numerics with "main-loop, not separately metered" note. Both correct per AGENTS §4.

### Verdict

✅ **APPROVED** — all acceptance criteria met, gate exits 0 (237/237 tests), DEC-013 honored, engine untouched, no new deps, tests are substantive, no constraint violations.

---

## Reflection (Ship)

*Appended during the **ship** cycle.*

1. **What would I do differently next time?**
   — <answer>

2. **Does any template, constraint, or decision need updating?**
   — <answer>

3. **Is there a follow-up spec I should write now before I forget?**
   — <answer>
