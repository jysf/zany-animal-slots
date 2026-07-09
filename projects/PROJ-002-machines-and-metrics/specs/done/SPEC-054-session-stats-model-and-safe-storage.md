---
# Maps to ContextCore task.* semantic conventions.
# This variant assumes Claude plays every role. The context normally
# in a separate handoff doc lives in the ## Implementation Context
# section below.

task:
  id: SPEC-054
  type: story                      # epic | story | task | bug | chore
  cycle: ship  # frame | design | build | verify | ship
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
    - DEC-020   # the session-stats model this spec authors + implements (cash-in, metrics, series, persistence)
  constraints:
    - engine-no-dom
  related_specs:
    - SPEC-049  # the zany:* namespace + safe-localStorage pattern (activeMachineStorage.ts) this mirrors
    - SPEC-055  # reactive stats context + recording seam that will CALL these pure reducers (next spec)
    - SPEC-015  # src/ui/storage.ts safe-localStorage idiom (readBalance/writeBalance) the storage module mirrors

value_link: >-
  The infrastructure keystone for STAGE-009's "visible sense of progress": a pure, tested
  session-stats model (record + derive) plus safe versioned localStorage, over which the reactive
  seam (SPEC-055), the panel (SPEC-056), and the sparkline (SPEC-057) build. No UI, no wiring, no
  engine change — but every later spec in the stage is a thin layer over this.

# Self-reported AI cost per cycle. Each cycle (design, build, verify,
# ship) appends one entry to sessions[]. Totals are computed at ship.
cost:
  sessions:
    - cycle: design
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: null   # design cycle runs on the orchestrator's main Opus loop — not separately metered
      recorded_at: 2026-07-08
      note: >-
        Design authored on the main Opus loop (un-metered). This is a PURE model + storage spec — no
        RTP/strip simulation to pin; the "measure-then-pin" discipline reduces to deterministic
        arithmetic, so the Failing Tests carry concrete pinned values computed by hand from the
        reducer semantics (e.g. two spins {bet:10,win:0} then {bet:10,win:50} ⇒ net 30, series
        [-10, 30], winRate 0.5, biggestWin {amount:50,...}). Authored DEC-020 (the model's semantics)
        as part of this design. Build is transcription of the drop-in code in ## Notes.
    - cycle: build
      interface: claude-code
      model: claude-sonnet-4-6
      tokens_total: 98457    # from Agent result subagent_tokens
      estimated_usd: 0.65    # 98457 tok × $6.6/M (Sonnet)
      duration_minutes: 15.4 # 925216 ms
      recorded_at: 2026-07-08
      note: >-
        Build transcribed both drop-in modules (sessionStats.ts, statsStorage.ts) verbatim from the
        spec's Notes, wrote sessionStats.test.ts and statsStorage.test.ts to cover every case in the
        Failing Tests section (7 + 6 tests, all passing), and confirmed the full gate: typecheck,
        lint, test (387/387 passed across 65 files), build, validate, cost-audit all exit 0. One
        deviation: the FIFO test's pinned bet:1 in the spec text doesn't typecheck against BetLevel
        (10|25|50), so bet:10 was substituted with scaled expected values (see Build Completion).
        git diff main..HEAD -- src/engine/ confirmed empty; no new dependency; touched only
        src/stats/** plus this spec's own bookkeeping.
    - cycle: verify
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: 90000    # nominal — see note
      estimated_usd: 0.59    # nominal, 90000 tok × $6.6/M
      recorded_at: 2026-07-08
      note: >-
        Cold re-verification on the main Opus loop (single-agent, not separately metered — nominal
        90000-tok estimate per the run's cost convention). Reconciled the build against git/disk:
        read both source modules (byte-for-byte the spec's drop-ins) and confirmed only src/stats/**
        + spec bookkeeping changed. Re-ran the FULL gate green: typecheck, lint, test (387/387, 65
        files), build, validate, cost-audit all exit 0. Ran all 4 adversarial guard-mutations from
        the spec's Notes — each broke EXACTLY its target test and only that test, then reverted clean
        (13/13 stats tests green after revert): (1) biggestWin > → >= broke "strictly larger"; (2)
        dropping .slice(-SERIES_CAP) broke "FIFO-bounded"; (3) removing the spins===0 guard broke
        "guarding spins === 0" (NaN); (4) removing the version check broke "version mismatch". Guards
        have teeth. `git diff main..HEAD -- src/engine/` empty; no .only/.skip/xit in src/stats/.
        Defect count: 0 (the build's one deviation — bet:1→bet:10 in the FIFO test — is a correct fix
        for a spec typo, not a defect; the spec text should be treated as licensing valid BetLevels).
    - cycle: ship
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      recorded_at: 2026-07-08
      note: >-
        main-loop, not separately metered (AGENTS §4); ship cycle. Reconciled build + self-verify
        against git/disk, filled build cost from the Agent result's subagent_tokens (98457) and verify
        as a nominal main-loop estimate, PR + CI-poll + squash-merge + backlog rollup + archive.
  totals:
    tokens_total: 188457   # build 98457 + verify 90000 (nominal)
    estimated_usd: 1.24    # build 0.65 + verify 0.59 (nominal)
    session_count: 4       # design, build, verify, ship
---

# SPEC-054: Session-stats model and safe storage

## Context

STAGE-009 gives the player a **visible sense of progress** in the now-fun four-machine game: an
in-app panel showing spins, biggest win, cash-ins, win rate, net winnings, and a winnings-over-time
sparkline — all client-only, persisted across reloads (brief §"a visible sense of progress").

This is the stage's **infrastructure keystone**, first in the backlog (model → reactive seam → panel
→ sparkline, the same infra-before-UI order as SPEC-044→053). It ships a **pure**, engine-independent
session-stats model — the record type, the `emptyStats`/`recordSpin`/`recordCashIn` reducers, and
`deriveMetrics` — plus **safe versioned `localStorage`** persistence mirroring
`src/machines/activeMachineStorage.ts` (SPEC-049) under the `zany:stats` key. **No React, no wiring,
no UI** — those are SPEC-055 (reactive context + recording seam), SPEC-056 (panel), SPEC-057
(sparkline).

It authors and implements **DEC-020**, which pins the model's cross-cutting semantics: a cash-in is
a wallet Reset (counted, not cleared); metrics are aggregate (not per-machine); the winnings-over-time
series is **cumulative net winnings per spin, bounded to the last 200 points (FIFO)**; and stats
persist as a single versioned JSON blob that degrades to `emptyStats()` when absent/corrupt/stale.
DEC-001 holds (the engine is untouched — reducers read the `SpinResult` fields the engine already
returns); DEC-005 holds (`localStorage` only, best-effort, never throws).

## Goal

Ship a pure `src/stats/sessionStats.ts` module (the `SessionStats` record, `emptyStats`, immutable
`recordSpin`/`recordCashIn` reducers, and `deriveMetrics`) and a safe `src/stats/statsStorage.ts`
persistence module (`STATS_KEY`, `readStats`, `writeStats` — versioned single blob, never throws),
each fully unit-tested. No React, no wiring, no display surface.

## Inputs

- **Files to read:**
  - `src/machines/activeMachineStorage.ts` — the safe-localStorage pattern to mirror (guarded
    try/catch, never throws; `zany:*` key).
  - `src/ui/storage.ts` — the `readBalance`/`writeBalance` idiom incl. the finite-number degrade.
  - `src/engine/index.ts` — the `SpinResult` interface (`{ grid, lineWins, totalWin, balance, tier,
    bet }`) the reducers consume, and the `WinTier` / `BetLevel` re-exports.
  - `decisions/DEC-020-session-stats-model.md` — the semantics this spec implements.
- **Related code paths:** `src/stats/` (new), `src/engine/` (types only, read).

## Outputs

- **Files created:**
  - `src/stats/sessionStats.ts` — the pure model (types + reducers + `deriveMetrics`).
  - `src/stats/sessionStats.test.ts` — reducer/derive unit tests.
  - `src/stats/statsStorage.ts` — safe versioned `localStorage` (`STATS_KEY`, `readStats`, `writeStats`).
  - `src/stats/statsStorage.test.ts` — persistence unit tests (round-trip, corrupt, version, never-throw).
- **Files modified:** none.
- **New exports:**
  - `sessionStats.ts`: `STATS_VERSION`, `SERIES_CAP`, `SessionStats`, `BiggestWin`, `SessionMetrics`,
    `SpinRecordInput`, `emptyStats()`, `recordSpin(stats, input, machineId)`,
    `recordCashIn(stats)`, `deriveMetrics(stats)`.
  - `statsStorage.ts`: `STATS_KEY`, `readStats()`, `writeStats(stats)`.
- **Database changes:** none (localStorage only; DEC-005).

## Acceptance Criteria

Testable outcomes. Cover happy path, error cases, edge cases.

- [ ] `emptyStats()` returns a zeroed record: `version === STATS_VERSION`, all counters 0,
      `biggestWin === null`, `series === []`.
- [ ] `recordSpin` (immutably) increments `spins`, adds `input.bet` to `totalWagered` and
      `input.totalWin` to `totalWon`, increments `winningSpins` iff `input.totalWin > 0`, and appends
      the new **cumulative net** (`totalWon − totalWagered`) to `series`. The input record is unchanged.
- [ ] `recordSpin` updates `biggestWin` to `{ amount: input.totalWin, machineId, tier: input.tier }`
      **only when** `input.totalWin` is strictly greater than the current `biggestWin.amount` (a loss,
      or an equal/smaller win, leaves it unchanged).
- [ ] `series` is bounded: after more than `SERIES_CAP` spins its length is exactly `SERIES_CAP` and
      it holds the most-recent points (FIFO drop-oldest), the last being the latest cumulative net.
- [ ] `recordCashIn` (immutably) increments `cashIns` only — it does NOT change `spins`, `totalWon`,
      `totalWagered`, `biggestWin`, or `series`. The input record is unchanged.
- [ ] `deriveMetrics` returns `net = totalWon − totalWagered`, `winRate = winningSpins / spins`
      (and `winRate === 0` when `spins === 0`, no divide-by-zero), plus `spins`, `cashIns`, `biggestWin`.
- [ ] `STATS_KEY === 'zany:stats'`; `readStats()` returns `emptyStats()` when the key is absent,
      unparseable, or its `version !== STATS_VERSION` — and never throws.
- [ ] `writeStats(stats)` then `readStats()` round-trips an equal record; `writeStats` never throws
      when `localStorage.setItem` throws (quota / unavailable).

## Failing Tests

Written during **design**, BEFORE build. The implementer's job in **build** is to make these pass.
Pinned values are deterministic arithmetic from the DEC-020 semantics (no simulation needed).

- **`src/stats/sessionStats.test.ts`**
  - `"emptyStats returns a zeroed, versioned record"` — asserts `emptyStats()` deep-equals
    `{ version: STATS_VERSION, spins: 0, winningSpins: 0, totalWagered: 0, totalWon: 0,
    biggestWin: null, cashIns: 0, series: [] }`.
  - `"recordSpin accumulates counters and appends the cumulative-net series point"` — from
    `emptyStats()`, `recordSpin(s, { totalWin: 0, bet: 10, tier: 'none' }, 'ocean')` ⇒
    `spins 1, winningSpins 0, totalWagered 10, totalWon 0, series [-10]`; then
    `recordSpin(_, { totalWin: 50, bet: 10, tier: 'big' }, 'ocean')` ⇒
    `spins 2, winningSpins 1, totalWagered 20, totalWon 50, series [-10, 30]`.
  - `"recordSpin is immutable (does not mutate its input)"` — capture `const before = emptyStats()`;
    call `recordSpin(before, { totalWin: 50, bet: 10, tier: 'big' }, 'ocean')`; assert `before`
    still deep-equals a fresh `emptyStats()` and the return value is a different object.
  - `"recordSpin updates biggestWin only on a strictly larger win, with machineId + tier"` — sequence
    wins `50` (ocean/big) → `biggestWin { amount: 50, machineId: 'ocean', tier: 'big' }`; then a
    `500` (arctic/jackpot) → updates to `{ amount: 500, machineId: 'arctic', tier: 'jackpot' }`; then
    a `500` again and a `0` loss → biggestWin unchanged (strict `>`).
  - `"series is FIFO-bounded to SERIES_CAP"` — fold `SERIES_CAP + 5` losing spins
    (`{ totalWin: 0, bet: 10, tier: 'none' }` — `bet` must be a valid `BetLevel`, so 10, not 1) from
    `emptyStats()`; assert `series.length === SERIES_CAP` and
    `series[SERIES_CAP - 1] === -10 * (SERIES_CAP + 5)` (latest cumulative net) and
    `series[0] === -60` (oldest surviving point = after the 6th spin, at 10/spin).
  - `"deriveMetrics computes net and win rate, guarding spins === 0"` — `deriveMetrics(emptyStats())`
    ⇒ `{ spins: 0, winRate: 0, net: 0, biggestWin: null, cashIns: 0 }`; and for a record with
    `spins 2, winningSpins 1, totalWon 50, totalWagered 20` ⇒ `winRate 0.5, net 30`.
  - `"recordCashIn increments only cashIns and is immutable"` — from a non-empty record, `recordCashIn`
    increments `cashIns` by 1 and leaves `spins/totalWon/totalWagered/biggestWin/series` untouched;
    the input record is unchanged and the return value is a different object.

- **`src/stats/statsStorage.test.ts`** *(with `localStorage.clear()` in `beforeEach`/`afterEach`)*
  - `"STATS_KEY is the namespaced key"` — asserts `STATS_KEY === 'zany:stats'`.
  - `"readStats returns emptyStats when absent"` — clean storage ⇒ `readStats()` deep-equals
    `emptyStats()`.
  - `"writeStats then readStats round-trips"` — build a non-empty record via the reducers, `writeStats`
    it, `readStats()` deep-equals it.
  - `"readStats returns emptyStats on an unparseable blob (never throws)"` —
    `localStorage.setItem(STATS_KEY, 'not json{')`; `readStats()` deep-equals `emptyStats()`.
  - `"readStats returns emptyStats on a version mismatch"` —
    `localStorage.setItem(STATS_KEY, JSON.stringify({ ...emptyStats(), version: 999 }))`;
    `readStats()` deep-equals `emptyStats()`.
  - `"writeStats never throws when setItem throws"` — `vi.spyOn(Storage.prototype, 'setItem')
    .mockImplementation(() => { throw new Error('quota'); })`; `expect(() => writeStats(emptyStats()))
    .not.toThrow()`; restore.

## Implementation Context

*Read this section (and the files it points to) before starting the build cycle.*

### Decisions that apply

- `DEC-020` — the session-stats model: this spec IMPLEMENTS its semantics (cash-in = counted Reset;
  aggregate metrics; cumulative-net series bounded to 200 FIFO; single versioned `zany:stats` blob
  degrading to `emptyStats()`).
- `DEC-001` — engine-no-dom: the reducers live in `src/stats/` and only *read* `SpinResult` fields;
  `git diff main..HEAD -- src/engine/` MUST be empty.
- `DEC-005` — no backend: persistence is `localStorage` only, best-effort, never throws.

### Constraints that apply

- `engine-no-dom` — `src/stats/` is a new leaf module; it imports only *types* from `src/engine`
  (`SpinResult`, `WinTier`, `BetLevel`), never the reverse. The engine gains no import of `src/stats`.

### Prior related work

- `SPEC-049` (shipped) — `src/machines/activeMachineStorage.ts` + the `zany:*` namespace this mirrors;
  `statsStorage.ts` is the same guarded pattern one level richer (a JSON blob, not a bare string).
- `SPEC-015` (shipped) — `src/ui/storage.ts` `readBalance`/`writeBalance` incl. the finite-value degrade.

### Out of scope (for this spec specifically)

- Any React (Context/provider/hook) — that is SPEC-055.
- Any wiring into `useSlotMachine` / the wallet Reset handler — SPEC-055.
- Any UI / panel / sparkline / trigger — SPEC-056, SPEC-057.
- A per-machine stats dimension — deliberately deferred by DEC-020 (the versioned blob leaves room).
- Choosing the axis the *sparkline draws* — SPEC-054 fixes the stored series (cumulative net);
  rendering is SPEC-057.

## Notes for the Implementer

This is transcription of the drop-in code below. Keep the two modules pure/leaf; no imports beyond
`SpinResult`/`WinTier`/`BetLevel` types from `src/engine`. New `.test.ts` (not `.tsx` — no JSX).

**Adversarial guard-mutations to run in verify** (each should break the named test; revert after):
1. In `recordSpin`, change the `biggestWin` guard from `>` to `>=` → breaks the "strictly larger"
   test (an equal win would overwrite the machineId/tier).
2. In `recordSpin`, drop the FIFO trim (`.slice(-SERIES_CAP)`) → breaks the "FIFO-bounded" test.
3. In `deriveMetrics`, remove the `spins === 0 ? 0 :` guard → the empty-record case yields `NaN`,
   breaking the "guarding spins === 0" test.
4. In `readStats`, remove the `parsed.version !== STATS_VERSION` check → breaks the "version mismatch"
   test.

### `src/stats/sessionStats.ts` (drop-in)

```ts
// sessionStats.ts — pure, engine-independent session-stats model (SPEC-054, DEC-020).
// No React, no storage, no engine mutation: reducers read the SpinResult fields the engine
// already returns (DEC-001). Every reducer is immutable — it returns a new record.

import type { SpinResult, WinTier, BetLevel } from '../engine';

/** Bumped only on a breaking change to the persisted blob shape (statsStorage degrades on mismatch). */
export const STATS_VERSION = 1;

/** Winnings-over-time series cap: keep the last N cumulative-net points, FIFO drop-oldest (DEC-020). */
export const SERIES_CAP = 200;

/** The largest single-spin win, with the machine + tier that produced it (DEC-020). */
export interface BiggestWin {
  amount: number;
  machineId: string;
  tier: WinTier;
}

/** The persisted, aggregate-across-machines session record (DEC-020). */
export interface SessionStats {
  version: number;
  spins: number;
  winningSpins: number;
  totalWagered: number;
  totalWon: number;
  biggestWin: BiggestWin | null;
  cashIns: number;
  /** Cumulative net (totalWon − totalWagered) after each spin, capped to the last SERIES_CAP (FIFO). */
  series: number[];
}

/** The subset of a resolved spin the model records (DEC-001: read-only view of SpinResult). */
export type SpinRecordInput = Pick<SpinResult, 'totalWin' | 'bet' | 'tier'>;

/** Derived, display-ready metrics — computed, never stored. */
export interface SessionMetrics {
  spins: number;
  winRate: number; // winningSpins / spins, 0 when spins === 0
  net: number; // totalWon − totalWagered
  biggestWin: BiggestWin | null;
  cashIns: number;
}

/** A fresh, zeroed record. The single source of the empty/default shape. */
export function emptyStats(): SessionStats {
  return {
    version: STATS_VERSION,
    spins: 0,
    winningSpins: 0,
    totalWagered: 0,
    totalWon: 0,
    biggestWin: null,
    cashIns: 0,
    series: [],
  };
}

/**
 * Record one resolved spin. Immutable — returns a new record.
 * A "winning spin" is totalWin > 0; biggestWin updates only on a STRICTLY larger win (keeps the
 * earliest machine/tier on ties); the series appends the new cumulative net, FIFO-capped.
 */
export function recordSpin(
  stats: SessionStats,
  input: SpinRecordInput,
  machineId: string,
): SessionStats {
  const totalWagered = stats.totalWagered + input.bet;
  const totalWon = stats.totalWon + input.totalWin;
  const isWin = input.totalWin > 0;
  const biggestWin =
    input.totalWin > (stats.biggestWin?.amount ?? 0)
      ? { amount: input.totalWin, machineId, tier: input.tier }
      : stats.biggestWin;
  const series = [...stats.series, totalWon - totalWagered].slice(-SERIES_CAP);
  return {
    ...stats,
    spins: stats.spins + 1,
    winningSpins: stats.winningSpins + (isWin ? 1 : 0),
    totalWagered,
    totalWon,
    biggestWin,
    series,
  };
}

/**
 * Record one cash-in (a wallet Reset press — DEC-020). Immutable.
 * Counts only: net winnings and the series are play outcomes and must NOT move on a top-up.
 */
export function recordCashIn(stats: SessionStats): SessionStats {
  return { ...stats, cashIns: stats.cashIns + 1 };
}

/** Compute display-ready metrics. Pure; guards spins === 0 (no divide-by-zero). */
export function deriveMetrics(stats: SessionStats): SessionMetrics {
  return {
    spins: stats.spins,
    winRate: stats.spins === 0 ? 0 : stats.winningSpins / stats.spins,
    net: stats.totalWon - stats.totalWagered,
    biggestWin: stats.biggestWin,
    cashIns: stats.cashIns,
  };
}

// BetLevel is re-exported for callers (SPEC-055) that type spin inputs; kept here to co-locate the
// model's engine-type surface.
export type { BetLevel };
```

### `src/stats/statsStorage.ts` (drop-in)

```ts
// statsStorage.ts — safe versioned localStorage for the session-stats blob (SPEC-054, DEC-020).
// Mirrors src/machines/activeMachineStorage.ts (SPEC-049): namespaced zany:* key, guarded,
// never throws (DEC-005). A single JSON blob; absent/corrupt/wrong-version ⇒ emptyStats().

import { emptyStats, STATS_VERSION, type SessionStats } from './sessionStats';

export const STATS_KEY = 'zany:stats';

/** Narrow an unknown parse result to a well-formed, current-version SessionStats. */
function isValid(v: unknown): v is SessionStats {
  if (typeof v !== 'object' || v === null) return false;
  const s = v as Record<string, unknown>;
  return (
    s.version === STATS_VERSION &&
    typeof s.spins === 'number' &&
    typeof s.winningSpins === 'number' &&
    typeof s.totalWagered === 'number' &&
    typeof s.totalWon === 'number' &&
    typeof s.cashIns === 'number' &&
    Array.isArray(s.series) &&
    (s.biggestWin === null || typeof s.biggestWin === 'object')
  );
}

/** The persisted stats, or emptyStats() when absent / corrupt / wrong-version. Never throws. */
export function readStats(): SessionStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (raw === null) return emptyStats();
    const parsed: unknown = JSON.parse(raw);
    return isValid(parsed) ? parsed : emptyStats();
  } catch {
    return emptyStats();
  }
}

/** Persist the stats blob. Silently ignores quota / unavailable storage. Never throws. */
export function writeStats(stats: SessionStats): void {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {
    // ignore quota / unavailable
  }
}
```

---

## Build Completion

*Filled in at the end of the **build** cycle, before advancing to verify.*

- **Branch:** `feat/spec-054-session-stats-model`
- **PR (if applicable):** none (local-only build session; PR deferred to a later cycle)
- **All acceptance criteria met?** yes
- **New decisions emitted:**
  - `DEC-020` — The session-stats model (authored at design; no NEW dec expected at build)
- **Deviations from spec:**
  - The `"series is FIFO-bounded to SERIES_CAP"` test in the spec's Failing Tests text pins
    `{ totalWin: 0, bet: 1, tier: 'none' }`, but `SpinRecordInput['bet']` is `BetLevel` (`10 | 25 | 50`,
    per `src/engine/balance.ts`) — a literal `bet: 1` fails `tsc --noEmit`. Wrote the test with
    `bet: 10` (the smallest valid `BetLevel`) instead, scaling the expected pinned values by the same
    factor (`series[0] === -60` instead of `-6`; `series[SERIES_CAP - 1] === -10 * totalSpins` instead
    of `-totalSpins`). The test still exercises the same FIFO-cap + cumulative-net behavior; only the
    magnitude of the pinned numbers changed. No other deviation — both drop-in modules
    (`sessionStats.ts`, `statsStorage.ts`) were transcribed verbatim from the spec's Notes.
- **Follow-up work identified:**
  - None beyond the stage backlog already queued (SPEC-055/056/057).

### Build-phase reflection (3 questions, short answers)

Process-focused: how did the build go? What friction did the spec create?

1. **What was unclear in the spec that slowed you down?**
   — Only the `bet: 1` vs. `BetLevel` mismatch in the FIFO test description (see Deviations). The
   two drop-in modules were unambiguous and pasted in cleanly; everything else in the Failing Tests
   section matched the actual reducer behavior on the first try.

2. **Was there a constraint or decision that should have been listed but wasn't?**
   — Not really a missing constraint, but the Failing Tests prose could have said "use a valid
   `BetLevel`" instead of the literal `bet: 1`, since `SpinRecordInput` already types `bet` via
   `Pick<SpinResult, ...>`. A one-line note in `## Notes for the Implementer` would have saved the
   two-minute typecheck failure and the need to record a deviation.

3. **If you did this task again, what would you do differently?**
   — Nothing structural — I'd typecheck the literal test inputs against the drop-in type signatures
   mentally before writing the FIFO test, which would have caught the `bet: 1` issue before running
   `tsc` the first time.

---

## Reflection (Ship)

*Appended during the **ship** cycle. Outcome-focused reflection, distinct
from the process-focused build reflection above.*

1. **What would I do differently next time?**
   — Typecheck pinned literal test inputs against the drop-in type signatures at design time. The
   only friction all cycle was the FIFO test's `bet: 1` vs. `BetLevel` mismatch — a design typo the
   build correctly fixed. When a spec pins numbers into a typed input, run them past the type first.

2. **Does any template, constraint, or decision need updating?**
   — No. DEC-020 held cleanly through build + verify (no new decisions needed). The pattern of
   "pin values a valid domain type accepts" is worth carrying into SPEC-055–057 but doesn't warrant
   a template change. DEC-001/DEC-005 both stayed clean (empty engine diff; guarded storage).

3. **Is there a follow-up spec I should write now before I forget?**
   — No new spec — SPEC-055 (reactive stats context + recording seam) is already framed and is the
   natural next step, consuming these pure reducers exactly as designed. The versioned blob leaves
   room for the deferred per-machine dimension (a possible PROJ-003 item) without a migration.
