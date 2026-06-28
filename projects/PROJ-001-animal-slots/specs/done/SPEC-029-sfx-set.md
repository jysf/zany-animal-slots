---
# Maps to ContextCore task.* semantic conventions.

task:
  id: SPEC-029
  type: story
  cycle: ship
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
      tokens_total: 51704
      estimated_usd: 0.34
      duration_minutes: 2.8
      recorded_at: 2026-06-27
      notes: "Sonnet sub-agent build (Agent subagent_tokens=51704, 170s). estimated_usd ~= tokens x $6.6/M Sonnet blended, no cache discount (order-of-magnitude, AGENTS §4)."
    - cycle: verify
      agent: claude-sonnet-4-6
      interface: claude-code
      tokens_total: 65733
      estimated_usd: 0.43
      duration_minutes: 4.4
      recorded_at: 2026-06-27
      notes: "Sonnet sub-agent verify (Agent subagent_tokens=65733, 263s). estimated_usd ~= tokens x $6.6/M Sonnet blended, no cache discount (order-of-magnitude, AGENTS §4)."
    - cycle: ship
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      duration_minutes: 8
      recorded_at: 2026-06-27
      notes: "main-loop, not separately metered (AGENTS §4); ship cycle (orchestrator squash-merge + bookkeeping; incl. preview SFX check)"
  totals:
    tokens_total: 117437
    estimated_usd: 0.77
    session_count: 5
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

## Verify

**Verdict: ✅ APPROVED**

Gate results (all exit 0):
- `just typecheck` — 0 errors
- `just lint` — 0 errors
- `just test` — 225/225 passed (37 test files; +11 new: 4 sfx + 7 useGameSfx)
- `just build` — clean production build (406 kB JS, 677 ms)
- `just decisions-audit --changed` — 0 new warnings (19 scope warnings are pre-existing on main; confirmed identical output)

Checklist:

- **AC: playSfx routes through getChannel('sfx'), never toDestination; REEL_STOP_CLUNKS===5; 5 staggered hits; never throws** — PASS. `sfx.ts`: every branch calls `getChannel('sfx')` then `.connect(ch)` on the synth (lines 16, 22). No `.toDestination()` call anywhere in the file (grep confirmed — the only match is a comment). `REEL_STOP_CLUNKS = 5` (line 11). reelStop loop runs `for (let i = 0; i < REEL_STOP_CLUNKS; i++)` with `t0 + i * 0.09` stagger (lines 23–25). Entire function body wrapped in `try { } catch { }` (lines 14/31–33).
- **AC: useGameSfx spin/reelStop on correct edges; no fire on mount; no fire on unrelated re-renders** — PASS. `useGameSfx.ts`: `prev = useRef<boolean | null>(null)` (line 17); effect reads `was = prev.current`, sets `prev.current = isSpinning`, returns early if `was === null` (mount guard, line 25); edge-detects `!was && isSpinning` → `play('spin')`, `was && !isSpinning` → `play('reelStop')` (lines 27–28). Effect keyed on `[isSpinning]` only (line 29) — unrelated re-renders don't trigger it.
- **AC: win once per new winning celebration.id (tier !== 'none'); not on no-win** — PASS. Second effect (lines 32–36): guards `!celebration || celebration.tier === 'none'` before playing 'win'. Keyed on `[celebration?.id]` (line 36) — fires once per id change.
- **AC: gating (muted or !unlocked)** — PASS. Both effects check `if (muted || !unlocked) return` before any `play()` call (lines 26, 34). Gating variables destructured from `opts` at function top (line 16) and read at fire time.
- **ENGINE UNCHANGED** — PASS. `git diff main..HEAD -- src/engine/` is empty.
- **NO NEW DEP** — PASS. `git diff main..HEAD -- package.json` is empty.
- **NO toDestination in sfx.ts** — PASS. Only occurrence is in a comment (`// …never toDestination()`); no actual `.toDestination()` call.
- **EDGE DETECTION** — PASS. `prev` initialized to `null`; mount guard `if (was === null) return` present; `[isSpinning]` and `[celebration?.id]` dep arrays are minimal and correct; `muted`/`unlocked` read at fire time from outer closure.
- **TESTS NOT VACUOUS** — PASS. `useGameSfx.test.ts` injects a `play` spy and asserts exact call counts per edge scenario; gating tests drive a spin edge AND a win and assert zero calls. `sfx.test.ts` mocks `tone` and `./audioEngine`, asserts `getChannel` called with `'sfx'`, asserts `connect(mockChannel)` (not toDestination), asserts 5 trigger calls for reelStop, and asserts the never-throws guard. Tests would fail if routing, gating, count, or try/catch were removed.
- **NO BAD ESLINT-DISABLE / NO user-event** — PASS. No `eslint-disable` in any of the four new files. No `user-event` import.
- **DECISION DRIFT** — PASS. `just decisions-audit --changed` reports 0 new issues (the tool found no uncommitted changes to audit; the committed diff was reviewed manually — DEC-013 and DEC-007 are honored: sfx channel only, synthesized only, gated). No new DEC needed (DEC-013 already covers this channel).
- **BUILD REFLECTION** — PASS. Three questions answered honestly and specifically; the MembraneSynth mock-shape observation is credible detail. Minor note: Q2 observation about exhaustive-deps comment is correct (no effect without the plugin), and worth tracking for later.
- **COST** — PASS. Build session has `tokens_total: null` with "orchestrator to fill" note, as required.

---

## Reflection (Ship)

*Appended during the **ship** cycle.*

1. **What would I do differently next time?**
   — Nothing material. SPEC-028's `sfx` channel meant this was pure plug-in: synths
   `.connect(getChannel('sfx'))`, fired off `isSpinning` edges + `celebration` via the
   same injected-spy-tested hook pattern as the jingle. Driving SFX off the engine's
   real events (not new state) kept it honest and fire-once. The win ting is kept
   short/quiet so it layers under the jingle rather than competing.

2. **Does any template, constraint, or decision need updating?**
   — No. DEC-013 covered the channel; nothing new. One small note for mock-heavy
   audio specs (the build hit it briefly): when a synth calls `triggerAttackRelease`
   directly on the instance returned by the constructor (not the `connect()` return),
   the `tone` mock must expose `triggerAttackRelease` on the instance itself — worth a
   line in future audio-spec test outlines.

3. **Is there a follow-up spec I should write now before I forget?**
   — No new spec. SPEC-030 (dynamic mixing) is next — it tweaks the bed/sfx/jingle
   channel gains to duck/swell, the payoff of the shared-graph foundation. Then the
   a11y audits (031–033) and the perf pass (034).
