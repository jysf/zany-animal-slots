---
# Maps to ContextCore task.* semantic conventions.
# This variant assumes Claude plays every role. The context normally
# in a separate handoff doc lives in the ## Implementation Context
# section below.

task:
  id: SPEC-055
  type: story                      # epic | story | task | bug | chore
  cycle: build  # frame | design | build | verify | ship
  blocked: false
  priority: medium
  complexity: M                    # S | M | L  (L means split it)

project:
  id: PROJ-002
  stage: STAGE-009
repo:
  id: animal-slots

agents:
  architect: claude-opus-4-8       # design/frame: Opus (judgement-heavy). See AGENTS §8.
  implementer: claude-sonnet-4-6   # build/verify: Sonnet (execution against the spec)
  created_at: 2026-07-08

references:
  decisions:
    - DEC-001   # engine-no-dom: recording reads the SpinResult the engine already returns; engine untouched
    - DEC-005   # no backend: persistence is localStorage only, best-effort, never throws
    - DEC-020   # the session-stats model (SPEC-054) whose reducers this context calls
  constraints:
    - engine-no-dom
  related_specs:
    - SPEC-054  # the pure sessionStats reducers + statsStorage this context wraps (shipped)
    - SPEC-049  # MachineProvider — the React-Context-over-localStorage pattern this mirrors exactly
    - SPEC-013  # useSlotMachine — the spin-flow hook whose resolve + reset() this wires recording into

value_link: >-
  The STAGE-009 keystone that makes the stats REAL: it lifts SPEC-054's pure reducers into a reactive,
  persisted React Context (StatsProvider/useStats) and wires recording into the game — every resolved
  spin calls recordSpin and every wallet Reset calls recordCashIn — so stats now accumulate and survive
  a reload with no player action. The panel (SPEC-056) and sparkline (SPEC-057) are thin reads over it.

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
      tokens_total: null   # design cycle runs on the orchestrator's main Opus loop — not separately metered
      recorded_at: 2026-07-08
      note: >-
        Design authored on the main Opus loop (un-metered). This is a reactive-seam spec, not a
        math/simulation spec: the "measure-then-pin" discipline reduces to reading the real engine for
        the outcomes the seam records. Measured the three pinned seeds against the real engine BEFORE
        writing the failing tests (node_modules/.bin/vite-node over src/engine): seed 276 ⇒ totalWin 40,
        tier 'small' (a WIN, not a loss — the earlier fixture comment's "1030 balance" is 1000−10+40);
        seed 12345 ⇒ totalWin 0, tier 'none'; the wallet Reset restores startingBalance. So the seam
        tests pin: after seed 276 ⇒ spins 1, totalWagered 10, totalWon 40, winningSpins 1,
        biggestWin {amount:40, machineId:'wild-and-whimsical', tier:'small'}, series [30]; after seed
        12345 ⇒ spins 1, totalWon 0, series [-10]; reset() ⇒ cashIns 1 with spins unchanged. Build is
        transcription of the drop-in StatsProvider + the two precise seam edits in ## Notes. No new DEC
        (this rides DEC-020's model + DEC-001/DEC-005, same as SPEC-050 rode SPEC-049's DEC-less seam).
    - cycle: build
      interface: claude-code
      model: claude-sonnet-4-6
      tokens_total: null   # filled at ship from the build sub-agent's subagent_tokens
      recorded_at: 2026-07-08
      note: >-
        Transcribed the three drop-in files verbatim from the spec's Notes for the Implementer
        (src/ui/stats/StatsProvider.tsx, StatsProvider.test.tsx, useSlotMachine.stats.test.tsx — 5 + 3
        = 8 new tests) and made the two precise seam edits in src/ui/useSlotMachine.ts (useStats() call
        + recordSpin at spin-resolve with recordSpin added to the spin useCallback deps; recordCashIn()
        in reset() with recordCashIn added to the reset useCallback deps), plus nested <StatsProvider>
        inside <MachineProvider> in src/main.tsx. Gate green: typecheck, lint, test (395/395 across 67
        files, including the 8 new tests), build, validate, cost-audit all pass. Full existing suite
        stayed green, including the provider-less useSlotMachine.test.tsx (35 tests unchanged) — the
        useStats() no-op default holds. `git diff main -- src/engine/` and `git diff main -- src/stats/`
        both empty. No new dependency. No deviations from spec.
    - cycle: verify
      interface: claude-code
      model: claude-sonnet-4-6
      tokens_total: null   # filled at ship from the verify sub-agent's subagent_tokens
      recorded_at: 2026-07-08
      note: >-
        Cold review on feat/spec-055-reactive-stats-context. Full gate re-run green: typecheck, lint,
        test (395/395 across 67 files), build, validate, cost-audit. Boundary checks confirmed empty:
        `git diff main..HEAD -- src/engine/` (DEC-001), `git diff main..HEAD -- src/stats/` (SPEC-054
        frozen), `git diff main..HEAD -- package.json` (no new dep); no .only/.skip/xit in the new test
        files. Ran all three adversarial guard-mutations from the spec's Notes: deleting the recordSpin
        seam call failed the useSlotMachine.stats.test.tsx tests (spins stayed 0); deleting recordCashIn
        in reset() failed only the cash-in test; reverting StatsProvider's init to
        useState(emptyStats()) failed only the hydration test. Each reverted clean (git diff HEAD empty)
        and the full suite re-verified green afterward. Independently confirmed recordSpin fires exactly
        once per resolve (inside the single setTimeout, not a loop), recordSpin/recordCashIn are stable
        useCallback([]) refs (no stale-closure risk), and the useStats() no-op default holds (the
        provider-less 35-test useSlotMachine.test.tsx passes unchanged). Defect count: 0.
  totals:
    tokens_total: null
    estimated_usd: null
    session_count: 1
---

# SPEC-055: Reactive stats context and recording seam

## Context

STAGE-009 gives the player a **visible sense of progress**: an in-app panel of spins, biggest win,
cash-ins, win rate, net winnings, and a winnings-over-time sparkline — client-only, persisted across
reloads (brief §"a visible sense of progress").

SPEC-054 (shipped) laid the **infrastructure keystone**: a pure, tested session-stats model
(`src/stats/sessionStats.ts` — `emptyStats`/`recordSpin`/`recordCashIn`/`deriveMetrics`) and safe
versioned `localStorage` (`src/stats/statsStorage.ts` — `readStats`/`writeStats` under `zany:stats`).
Those reducers are pure and **unwired** — nothing calls them and there is no display surface.

This spec is the stage's **reactive keystone** (second in the backlog: model → **reactive seam** →
panel → sparkline, the same infra-before-UI order as SPEC-044→053). It lifts the pure reducers into a
**reactive, persisted React Context** — a `StatsProvider`/`useStats` that mirrors SPEC-049's
`MachineProvider`/`useActiveMachine` exactly (Context over guarded `localStorage`, no-op default so
provider-less consumers keep working) — and **wires recording into the game**: `useSlotMachine`'s
spin-resolve calls `recordSpin`, and the wallet `reset()` calls `recordCashIn`. After this spec, stats
accumulate on every spin and every cash-in and survive a reload, with **no display surface yet** (that
is SPEC-056). No new DEC: this rides DEC-020's model and DEC-001/DEC-005, exactly as SPEC-050's UI rode
SPEC-049's DEC-less reactive seam.

## Goal

Ship a reactive `src/ui/stats/StatsProvider.tsx` (a `StatsProvider` holding the session stats over
guarded `localStorage`, exposing `recordSpin(input, machineId)` / `recordCashIn()` / `resetStats()`,
plus a `useStats()` hook with a no-op default) and wire it into the game: `useSlotMachine` records
every resolved spin via `recordSpin` and every wallet `reset()` via `recordCashIn`, and `main.tsx`
wraps the app in the provider. Stats now accumulate and persist; no panel/UI (SPEC-056).

## Inputs

- **Files to read:**
  - `src/ui/machine/MachineProvider.tsx` — the exact Context-over-localStorage pattern to mirror
    (default value = real default, no-op setter; `useState(() => read…())`; persist in the mutators
    / on change; `useMemo` value; `useContext` hook that works provider-less).
  - `src/stats/sessionStats.ts` — the pure reducers this context calls (`emptyStats`, `recordSpin`,
    `recordCashIn`) and the `SessionStats` / `SpinRecordInput` types.
  - `src/stats/statsStorage.ts` — `readStats` / `writeStats` (guarded, never throws — DEC-005).
  - `src/ui/useSlotMachine.ts` — the spin-resolve callback (inside the `setTimeout` reveal) and the
    `reset()` callback where recording is wired; note the `machine` in scope (`machine.id`).
  - `src/main.tsx` — where `MachineProvider` wraps `App`; `StatsProvider` nests inside it.
- **Related code paths:** `src/ui/stats/` (new), `src/ui/`, `src/stats/` (read).

## Outputs

- **Files created:**
  - `src/ui/stats/StatsProvider.tsx` — the reactive, persisted stats Context + `useStats()` hook.
  - `src/ui/stats/StatsProvider.test.tsx` — provider/hook unit tests (hydrate, record, cash-in, reset,
    no-op-without-provider, persistence).
  - `src/ui/useSlotMachine.stats.test.tsx` — integration tests: driving the hook inside `StatsProvider`
    records spins + cash-ins with the real engine outcomes.
- **Files modified:**
  - `src/ui/useSlotMachine.ts` — call `useStats()`; `recordSpin(...)` at spin-resolve; `recordCashIn()`
    in `reset()`; add the two stable callbacks to the relevant `useCallback` deps.
  - `src/main.tsx` — wrap `<App/>` in `<StatsProvider>` (inside `MachineProvider`).
- **New exports:**
  - `StatsProvider.tsx`: `StatsProvider`, `useStats()`, `StatsContextValue`.
- **Database changes:** none (localStorage only, `zany:stats`; DEC-005).

## Acceptance Criteria

Testable outcomes. Cover happy path, error cases, edge cases.

- [ ] `useStats()` **without a provider** returns `emptyStats()` and no-op `recordSpin`/`recordCashIn`/
      `resetStats` — calling them does not throw and leaves the returned stats empty (so every existing
      `useSlotMachine`/`App` test that renders without a `StatsProvider` keeps passing unchanged).
- [ ] `StatsProvider` **hydrates** its initial stats from `readStats()` (a seeded `zany:stats` blob is
      reflected in `useStats().stats` on first render).
- [ ] `recordSpin(input, machineId)` from the provider updates the reactive stats via the pure reducer
      (spins/wagered/won/winningSpins/biggestWin/series) **and persists** (a subsequent `readStats()`
      reflects it).
- [ ] `recordCashIn()` increments `cashIns` only (spins/series untouched) and persists; `resetStats()`
      zeroes the record to `emptyStats()` and persists.
- [ ] Wired into the game: driving `useSlotMachine` inside a `StatsProvider` through **one resolved
      spin** records exactly one spin with the engine's real outcome — seed `276` ⇒ `spins 1,
      totalWagered 10, totalWon 40, winningSpins 1, biggestWin { amount: 40, machineId:
      'wild-and-whimsical', tier: 'small' }, series [30]`; a losing seed `12345` ⇒ `spins 1, totalWon 0,
      winningSpins 0, biggestWin null, series [-10]`.
- [ ] Wired into the game: calling `reset()` (the wallet Reset) records **one cash-in** (`cashIns` +1)
      and does **NOT** clear the recorded spins — the stage invariant that wallet Reset ≠ Clear stats.
- [ ] **Boundaries intact:** `git diff main..HEAD -- src/engine/` is EMPTY (DEC-001); no new dependency
      (DEC-005 / `no-new-top-level-deps-without-decision`). Full gate green.

## Failing Tests

Written during **design**, BEFORE build. The implementer's job in **build** is to make these pass.
Pinned values were **measured against the real engine** (vite-node over `src/engine`) at design:
seed 276 ⇒ totalWin 40 / tier 'small'; seed 12345 ⇒ totalWin 0 / tier 'none'.

- **`src/ui/stats/StatsProvider.test.tsx`** *(renderHook + act; `localStorage.clear()` in `beforeEach`)*
  - `"useStats without a provider returns emptyStats and no-op recorders"` — `renderHook(() =>
    useStats())`; `expect(result.current.stats).toEqual(emptyStats())`; then
    `act(() => { result.current.recordSpin({ totalWin: 40, bet: 10, tier: 'small' },
    'wild-and-whimsical'); result.current.recordCashIn(); result.current.resetStats(); })` **does not
    throw** and `result.current.stats` still `toEqual(emptyStats())`.
  - `"provider hydrates stats from localStorage"` — build a non-empty record via the reducers
    (`recordSpin(emptyStats(), { totalWin: 40, bet: 10, tier: 'small' }, 'wild-and-whimsical')`),
    `writeStats` it, then `renderHook(() => useStats(), { wrapper: StatsProvider })`; assert
    `result.current.stats` deep-equals the seeded record.
  - `"recordSpin updates the reactive stats and persists"` — `renderHook(() => useStats(),
    { wrapper: StatsProvider })`; `act(() => result.current.recordSpin({ totalWin: 40, bet: 10,
    tier: 'small' }, 'wild-and-whimsical'))`; assert `stats` has `spins 1, winningSpins 1,
    totalWagered 10, totalWon 40, biggestWin { amount: 40, machineId: 'wild-and-whimsical',
    tier: 'small' }, series [30]`; and `readStats()` deep-equals `result.current.stats`.
  - `"recordCashIn increments only cashIns and persists"` — after one `recordSpin` as above,
    `act(() => result.current.recordCashIn())`; assert `stats.cashIns === 1`, `stats.spins === 1`,
    `stats.series` unchanged (`[30]`); `readStats().cashIns === 1`.
  - `"resetStats zeroes the record and persists emptyStats"` — after recording, `act(() =>
    result.current.resetStats())`; assert `result.current.stats` deep-equals `emptyStats()` and
    `readStats()` deep-equals `emptyStats()`.

- **`src/ui/useSlotMachine.stats.test.tsx`** *(`vi.useFakeTimers()` + `localStorage.clear()` in
  `beforeEach`; `vi.useRealTimers()` in `afterEach`; a combined hook renders `useSlotMachine` and
  `useStats` under `StatsProvider`)*
  - Harness: `const render = (opts) => renderHook(() => ({ slot: useSlotMachine(opts),
    stats: useStats() }), { wrapper: StatsProvider });`
  - `"a resolved winning spin is recorded with the engine's real outcome"` — `render({ nextSeed: () =>
    276 })`; `act(() => result.current.slot.spin())`; `act(() =>
    vi.advanceTimersByTime(SPIN_DURATION_MS))`; assert `result.current.stats.stats` has `spins 1,
    totalWagered 10, totalWon 40, winningSpins 1, biggestWin { amount: 40, machineId:
    'wild-and-whimsical', tier: 'small' }, series [30]`.
  - `"a losing spin is still recorded (counted, no win)"` — `render({ nextSeed: () => 12345 })`; spin +
    advance; assert `stats.stats` has `spins 1, totalWagered 10, totalWon 0, winningSpins 0,
    biggestWin null, series [-10]`.
  - `"reset() records a cash-in and does NOT clear recorded spins"` — `render({ nextSeed: () => 276 })`;
    spin + advance (so `spins === 1`); `act(() => result.current.slot.reset())`; assert
    `result.current.stats.stats.cashIns === 1` **and** `result.current.stats.stats.spins === 1`
    (unchanged) and `biggestWin` still `{ amount: 40, ... }`; and `result.current.slot.balance === 1000`
    (wallet restored — the reset still does its wallet job).

## Implementation Context

*Read this section (and the files it points to) before starting the build cycle.*

### Decisions that apply

- `DEC-020` — the session-stats model this context wraps (cash-in = counted Reset; aggregate metrics;
  cumulative-net series bounded 200 FIFO; single versioned `zany:stats` blob). This spec does not
  amend it — it makes it reactive + wired.
- `DEC-001` — engine-no-dom: recording reads the `SpinResult` the engine already returns; the seam
  lives in `src/ui`. `git diff main..HEAD -- src/engine/` MUST be empty.
- `DEC-005` — no backend: persistence stays `localStorage` only (`readStats`/`writeStats`), best-effort,
  never throws. No network, no new dependency.

### Constraints that apply

- `engine-no-dom` — `src/ui/stats/` imports the pure model from `src/stats` and engine **types** only;
  the engine never imports UI/stats. The provider is a leaf UI concern.

### Prior related work

- `SPEC-049` (shipped) — `MachineProvider`/`useActiveMachine`: the Context-over-localStorage pattern
  with a no-op default so provider-less tests keep working. `StatsProvider` is the same shape, one
  reducer-set richer.
- `SPEC-054` (shipped) — the pure `sessionStats` reducers + `statsStorage` this context calls verbatim.
- `SPEC-050` (shipped) — precedent that a reactive seam's consumer needs no new DEC.

### Out of scope (for this spec specifically)

- Any panel / sheet / trigger / tile / display surface — that is **SPEC-056**.
- The winnings-over-time **sparkline** render — **SPEC-057**.
- A **per-machine** stats dimension — deferred by DEC-020 (the versioned blob leaves room).
- Any change to `sessionStats.ts` / `statsStorage.ts` (SPEC-054 is shipped and frozen) or to the engine
  or its `SpinResult` shape (DEC-001).
- A cross-tab live-sync of stats — out of scope for the whole stage (per-browser, client-only).

## Notes for the Implementer

Mirror `MachineProvider.tsx` closely. Keep the provider a leaf: it imports the pure model + storage
and nothing UI-heavy. The `useStats()` default MUST be no-op so the ~30 existing provider-less
`useSlotMachine`/`App` tests keep passing untouched (this is the SPEC-049 trick).

**Recording seam — two precise edits in `src/ui/useSlotMachine.ts`:**

1. Near the other hook calls at the top of `useSlotMachine` (right after
   `const activeMachine = useActiveMachine().machine;`), add:
   ```ts
   const { recordSpin, recordCashIn } = useStats();
   ```
   and the import:
   ```ts
   import { useStats } from './stats/StatsProvider';
   ```

2. In the spin-resolve `setTimeout` callback, immediately **after** the celebration `if/else` block
   (after `setStatus('resolved'); timerRef.current = null;` is fine too — anywhere in that callback,
   once per resolve), record the spin:
   ```ts
   // SPEC-055: record the resolved spin into session stats (no-op without a StatsProvider).
   recordSpin({ totalWin: outcome.totalWin, bet, tier: outcome.tier }, machine.id);
   ```
   Then add `recordSpin` to the `spin` `useCallback` dependency array
   (`[balance, bet, nextSeed, status, machine, recordSpin]`). `recordSpin` is a stable callback
   (provider `useCallback([])`), so this does not change re-render behavior — the seam captures a
   stable reference even inside the timer closure.

3. In the `reset` `useCallback`, add the cash-in **after** the wallet restore lines:
   ```ts
   recordCashIn(); // SPEC-055: a wallet Reset is a cash-in (DEC-020) — counted, not a stats clear.
   ```
   and add `recordCashIn` to its dependency array (`[machine, recordCashIn]`).

**`main.tsx`** — nest the provider inside `MachineProvider`:
```tsx
<MachineProvider>
  <StatsProvider>
    <App />
  </StatsProvider>
</MachineProvider>
```

**Adversarial guard-mutations to run in verify** (each should break the named test; revert after):
1. Delete the `recordSpin({ ... }, machine.id)` seam call in `useSlotMachine.ts` → breaks
   `"a resolved winning spin is recorded…"` (stats.spins stays 0). Proves the spin seam is wired.
2. Delete the `recordCashIn()` call in `reset()` → breaks `"reset() records a cash-in…"`. Proves the
   cash-in seam is wired.
3. In `StatsProvider`, change the init from `useState(() => readStats())` to `useState(emptyStats())`
   → breaks `"provider hydrates stats from localStorage"`. Proves hydration is real.

### `src/ui/stats/StatsProvider.tsx` (drop-in)

```tsx
// StatsProvider — reactive, persisted session-stats context (SPEC-055).
// Lifts SPEC-054's pure sessionStats reducers into a React Context backed by
// localStorage (statsStorage.ts), mirroring SPEC-049's MachineProvider exactly:
// a no-op default so provider-less consumers (every existing useSlotMachine/App
// test) keep working, useState(() => readStats()) hydration, and persist-on-change.
// The engine never sees this seam (DEC-001); persistence is localStorage only,
// guarded, never throws (DEC-005). No display surface — that is SPEC-056/057.
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  emptyStats,
  recordSpin as recordSpinReducer,
  recordCashIn as recordCashInReducer,
  type SessionStats,
  type SpinRecordInput,
} from '../../stats/sessionStats';
import { readStats, writeStats } from '../../stats/statsStorage';

export interface StatsContextValue {
  stats: SessionStats;
  recordSpin: (input: SpinRecordInput, machineId: string) => void;
  recordCashIn: () => void;
  resetStats: () => void;
}

const StatsContext = createContext<StatsContextValue>({
  stats: emptyStats(),
  recordSpin: () => {}, // no-op default — real behavior comes from the provider
  recordCashIn: () => {},
  resetStats: () => {},
});

export function StatsProvider({ children }: { children: ReactNode }) {
  const [stats, setStats] = useState<SessionStats>(() => readStats());

  // Persist on every change (guarded, never throws — DEC-005). Mirrors the
  // writeBalance-on-change effect in useSlotMachine; the mount write is a
  // harmless round-trip of the just-read value.
  useEffect(() => {
    writeStats(stats);
  }, [stats]);

  const recordSpin = useCallback((input: SpinRecordInput, machineId: string) => {
    setStats((prev) => recordSpinReducer(prev, input, machineId));
  }, []);

  const recordCashIn = useCallback(() => {
    setStats((prev) => recordCashInReducer(prev));
  }, []);

  const resetStats = useCallback(() => {
    setStats(emptyStats());
  }, []);

  const value = useMemo<StatsContextValue>(
    () => ({ stats, recordSpin, recordCashIn, resetStats }),
    [stats, recordSpin, recordCashIn, resetStats],
  );

  return <StatsContext.Provider value={value}>{children}</StatsContext.Provider>;
}

/** Subscribe to session stats. Returns empty stats + no-op recorders when used without a provider. */
export function useStats(): StatsContextValue {
  return useContext(StatsContext);
}
```

### `src/ui/stats/StatsProvider.test.tsx` (drop-in)

```tsx
// StatsProvider / useStats tests (SPEC-055). renderHook + act, no
// @testing-library/user-event in this repo's toolchain — a `wrapper` supplies
// the provider where needed. Mirrors MachineProvider.test.tsx.
import { renderHook, act } from '@testing-library/react';
import { StatsProvider, useStats } from './StatsProvider';
import { emptyStats, recordSpin } from '../../stats/sessionStats';
import { readStats, writeStats } from '../../stats/statsStorage';

describe('StatsProvider / useStats', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('useStats without a provider returns emptyStats and no-op recorders', () => {
    const { result } = renderHook(() => useStats());
    expect(result.current.stats).toEqual(emptyStats());
    act(() => {
      result.current.recordSpin({ totalWin: 40, bet: 10, tier: 'small' }, 'wild-and-whimsical');
      result.current.recordCashIn();
      result.current.resetStats();
    });
    // No provider => no state to change; the calls are safe no-ops.
    expect(result.current.stats).toEqual(emptyStats());
  });

  it('provider hydrates stats from localStorage', () => {
    const seeded = recordSpin(emptyStats(), { totalWin: 40, bet: 10, tier: 'small' }, 'wild-and-whimsical');
    writeStats(seeded);
    const { result } = renderHook(() => useStats(), { wrapper: StatsProvider });
    expect(result.current.stats).toEqual(seeded);
  });

  it('recordSpin updates the reactive stats and persists', () => {
    const { result } = renderHook(() => useStats(), { wrapper: StatsProvider });
    act(() => {
      result.current.recordSpin({ totalWin: 40, bet: 10, tier: 'small' }, 'wild-and-whimsical');
    });
    expect(result.current.stats).toMatchObject({
      spins: 1,
      winningSpins: 1,
      totalWagered: 10,
      totalWon: 40,
      biggestWin: { amount: 40, machineId: 'wild-and-whimsical', tier: 'small' },
      series: [30],
    });
    expect(readStats()).toEqual(result.current.stats);
  });

  it('recordCashIn increments only cashIns and persists', () => {
    const { result } = renderHook(() => useStats(), { wrapper: StatsProvider });
    act(() => {
      result.current.recordSpin({ totalWin: 40, bet: 10, tier: 'small' }, 'wild-and-whimsical');
    });
    act(() => {
      result.current.recordCashIn();
    });
    expect(result.current.stats.cashIns).toBe(1);
    expect(result.current.stats.spins).toBe(1);
    expect(result.current.stats.series).toEqual([30]);
    expect(readStats().cashIns).toBe(1);
  });

  it('resetStats zeroes the record and persists emptyStats', () => {
    const { result } = renderHook(() => useStats(), { wrapper: StatsProvider });
    act(() => {
      result.current.recordSpin({ totalWin: 40, bet: 10, tier: 'small' }, 'wild-and-whimsical');
    });
    act(() => {
      result.current.resetStats();
    });
    expect(result.current.stats).toEqual(emptyStats());
    expect(readStats()).toEqual(emptyStats());
  });
});
```

### `src/ui/useSlotMachine.stats.test.tsx` (drop-in)

```tsx
// Integration: driving useSlotMachine inside a StatsProvider records spins +
// cash-ins with the engine's REAL outcomes (SPEC-055). Seeds measured against
// the engine: 276 => win 40 / small; 12345 => loss. Fake timers advance the
// spin-resolve reveal (SPEC-016 pattern).
import { renderHook, act } from '@testing-library/react';
import { useSlotMachine, SPIN_DURATION_MS } from './useSlotMachine';
import { StatsProvider, useStats } from './stats/StatsProvider';
import type { UseSlotMachineOpts } from './useSlotMachine';

const render = (opts?: UseSlotMachineOpts) =>
  renderHook(() => ({ slot: useSlotMachine(opts), stats: useStats() }), { wrapper: StatsProvider });

describe('useSlotMachine × StatsProvider recording seam', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('a resolved winning spin is recorded with the engine real outcome', () => {
    const { result } = render({ nextSeed: () => 276 });
    act(() => {
      result.current.slot.spin();
    });
    act(() => {
      vi.advanceTimersByTime(SPIN_DURATION_MS);
    });
    expect(result.current.stats.stats).toMatchObject({
      spins: 1,
      totalWagered: 10,
      totalWon: 40,
      winningSpins: 1,
      biggestWin: { amount: 40, machineId: 'wild-and-whimsical', tier: 'small' },
      series: [30],
    });
  });

  it('a losing spin is still recorded (counted, no win)', () => {
    const { result } = render({ nextSeed: () => 12345 });
    act(() => {
      result.current.slot.spin();
    });
    act(() => {
      vi.advanceTimersByTime(SPIN_DURATION_MS);
    });
    expect(result.current.stats.stats).toMatchObject({
      spins: 1,
      totalWagered: 10,
      totalWon: 0,
      winningSpins: 0,
      biggestWin: null,
      series: [-10],
    });
  });

  it('reset() records a cash-in and does NOT clear recorded spins', () => {
    const { result } = render({ nextSeed: () => 276 });
    act(() => {
      result.current.slot.spin();
    });
    act(() => {
      vi.advanceTimersByTime(SPIN_DURATION_MS);
    });
    expect(result.current.stats.stats.spins).toBe(1);

    act(() => {
      result.current.slot.reset();
    });
    expect(result.current.stats.stats.cashIns).toBe(1);
    expect(result.current.stats.stats.spins).toBe(1); // NOT cleared — wallet Reset ≠ Clear stats
    expect(result.current.stats.stats.biggestWin).toMatchObject({ amount: 40 });
    expect(result.current.slot.balance).toBe(1000); // wallet still restored
  });
});
```

---

## Build Completion

*Filled in at the end of the **build** cycle, before advancing to verify.*

- **Branch:** `feat/spec-055-reactive-stats-context`
- **PR (if applicable):** none yet — local-only build cycle; PR opens at verify/ship.
- **All acceptance criteria met?** yes
- **New decisions emitted:**
  - none — rides DEC-020 + DEC-001/DEC-005, as designed
- **Deviations from spec:**
  - none — all three files transcribed verbatim from the spec's Notes; the two `useSlotMachine.ts` seam
    edits and the `main.tsx` nesting match the Notes exactly.
- **Follow-up work identified:**
  - none new — SPEC-056 (panel) and SPEC-057 (sparkline) are already queued in the stage backlog.

### Build-phase reflection (3 questions, short answers)

Process-focused: how did the build go? What friction did the spec create?

1. **What was unclear in the spec that slowed you down?**
   — Nothing. The spec's drop-in code blocks and precise seam-edit instructions left no ambiguity;
   this was a transcription task with a verification gate, not a design task.

2. **Was there a constraint or decision that should have been listed but wasn't?**
   — No. DEC-001 (engine-no-dom), DEC-005 (localStorage-only), and DEC-020 (the stats model) covered
   everything touched; the constraints.yaml `engine-no-dom` rule was already satisfied by construction
   since `src/ui/stats/` only imports from `src/stats` and `react`.

3. **If you did this task again, what would you do differently?**
   — Nothing differently — a design cycle that ships complete drop-in files + exact edit locations is
   the fastest possible build cycle. Ran the hard-constraint checks (`git diff main -- src/engine/`,
   `git diff main -- src/stats/`) early, before the full gate, which caught nothing but confirmed
   scope stayed clean throughout.

---

## Reflection (Ship)

*Appended during the **ship** cycle. Outcome-focused reflection, distinct
from the process-focused build reflection above.*

1. **What would I do differently next time?**
   — <answer>

2. **Does any template, constraint, or decision need updating?**
   — <answer>

3. **Is there a follow-up spec I should write now before I forget?**
   — <answer>
