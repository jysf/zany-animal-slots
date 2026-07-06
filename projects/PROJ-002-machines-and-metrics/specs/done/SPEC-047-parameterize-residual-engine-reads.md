---
# Maps to ContextCore task.* semantic conventions.
# This variant assumes Claude plays every role. The context normally
# in a separate handoff doc lives in the ## Implementation Context
# section below.

task:
  id: SPEC-047
  type: story                      # epic | story | task | bug | chore
  cycle: ship  # frame | design | build | verify | ship
  blocked: false
  priority: medium
  complexity: S                    # S | M | L  (L means split it)

project:
  id: PROJ-002
  stage: STAGE-008
repo:
  id: animal-slots

agents:
  architect: claude-opus-4-8       # design/frame: Opus (judgement-heavy). See AGENTS §8.
  implementer: claude-sonnet-4-6   # build/verify: Sonnet (execution against the spec)
  created_at: 2026-07-06

references:
  decisions:
    - DEC-001   # engine-no-dom: bet-stepping stays pure engine; paytable UI reads engine only via index.ts
    - DEC-011   # paytable + reel weights: multipliers come from PAYTABLE (now the machine's paytable)
    - DEC-015   # config-driven machine model: the last residual engine reads become machine-driven
  constraints:
    - engine-no-dom
  related_specs:
    - SPEC-039  # parameterize resolveGrid/evaluatePaylines — the same "machine param defaulting to W&W" pattern
    - SPEC-040  # parameterize win-tier + jackpot rule — same pattern
    - SPEC-041  # presentation symbolDisplay threaded into paytableRows (this extends paytableRows again)
    - SPEC-042  # hook threads the active machine — this makes bet-stepping use machine.math.betLevels

value_link: >-
  Infrastructure enabling STAGE-008's variety: the last two engine reads that ignored the
  active machine (bet-level stepping + the paytable view's math source) become machine-driven,
  so a themed machine (SPEC-051/052/053) may legitimately vary its bet levels, paytable, and
  payline count — closing the STAGE-007 deferral so no residual module const silently overrides
  a machine's data.

# Self-reported AI cost per cycle. Each cycle (design, build, verify,
# ship) appends one entry to sessions[]. Totals are computed at ship.
cost:
  sessions:
    - cycle: design
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: null   # design cycle runs on the orchestrator's main Opus loop — not separately metered
      note: >-
        Design authored on the main Opus orchestrator loop (un-metered). Measured the current
        values against the real engine via vite-node BEFORE writing the failing tests (BET_LEVELS
        [10,25,50]; default machine paylines 20; paytable per DEC-016; the custom [10,50] levels
        array gives nextBet(10)->50 / prevBet(50)->10, skipping 25 — the adversarial-guard teeth),
        so the build is transcription.
    - cycle: build
      agent: claude-sonnet-4-6
      interface: claude-code
      tokens_total: 119465   # from Agent result subagent_tokens
      estimated_usd: 0.79    # 119465 tok × $6.6/M (Sonnet)
      duration_minutes: 41.0 # 2461216 ms
      note: >-
        Implemented the four drop-in source edits (balance.ts nextBet/prevBet gain an optional
        `levels` param; paytable.ts paytableRows/paylineCount read MachineMath instead of engine
        consts, PAYLINE_COUNT removed; PaytableSheet.tsx resolves the machine once and threads
        math to both functions; useSlotMachine.ts threads machine.math.betLevels into all three
        nextBet/prevBet call sites) and the three test-file updates (balance.test.ts +2 tests,
        paytable.test.ts updated to two-arg calls +2 tests, useSlotMachine.test.tsx +1 test)
        verbatim per the spec Notes, with one type-only deviation (added `as const` to the
        stub-math paytable tuple literal in paytable.test.ts to satisfy MachineMath's tuple type
        under strict tsc). Manually ran both adversarial guard-mutations from the spec Notes
        (revert nextBet/prevBet to ignore levels; revert paytableRows/paylineCount to read the
        engine PAYTABLE/SYMBOL_TIER/SYMBOLS/PAYLINES consts) and confirmed both fail the new
        tests as specified, then restored the correct implementation. Gate green: `just
        typecheck && just lint && just test && just build && just validate` — 54 test files,
        326 tests passed. Hard guard confirmed empty: `git diff main..HEAD -- src/engine/
        machine.ts src/engine/paylines.ts src/engine/spin.ts src/engine/strips.ts
        src/engine/tiers.ts src/machines/`.
    - cycle: verify
      agent: claude-sonnet-4-6
      interface: claude-code
      tokens_total: 93485    # from Agent result subagent_tokens
      estimated_usd: 0.62    # 93485 tok × $6.6/M (Sonnet)
      duration_minutes: 77.6 # 4656420 ms
      note: >-
        Cold, independent re-verification. Re-ran the full gate (`just typecheck && just lint
        && just test && just build && just validate`) — all exit 0, 54 test files, 326 tests
        passed. Confirmed spec conformance by reading the changed source directly: balance.ts
        nextBet/prevBet take `levels: readonly BetLevel[] = BET_LEVELS` and index `levels` (pure,
        no DOM); paytable.ts paytableRows/paylineCount read MachineMath fields, PAYLINE_COUNT and
        the engine value-import are gone (type-only MachineMath/Tier import, DEC-001 intact);
        PaytableSheet.tsx resolves getActiveMachine() once and threads machine.math to both
        functions; useSlotMachine.ts threads machine.math.betLevels into all three call sites with
        `machine` in the two useCallback deps. No .skip/.only/xit in the touched test files. Ran
        both adversarial guard-mutations myself: (a) reverting nextBet/prevBet to index BET_LEVELS
        failed 2 tests in balance.test.ts (expected 50/10, got 25/25) and 1 in
        useSlotMachine.test.tsx (expected 50, got 25); (b) reverting paytableRows/paylineCount to
        read engine PAYTABLE/SYMBOL_TIER/SYMBOLS/PAYLINES failed 1 test in paytable.test.ts
        (expected [9,9,9], got the engine's real [10,50,250] jackpot row). Both reverted via `git
        checkout --` with diff confirmed empty afterward. Hard guards (engine-math/machine files;
        package.json/package-lock.json) both empty. Full gate re-confirmed green after all
        reverts. Defect count: 0.
    - cycle: ship
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      duration_minutes: 12
      recorded_at: 2026-07-06
      note: >-
        main-loop, not separately metered (AGENTS §4); ship cycle. Reconciled both sub-agents
        against git/disk (reviewed the full diff, re-ran the gate + hard guards myself — all
        green/empty), filled build+verify cost from subagent_tokens, PR + CI-poll + squash-merge
        + backlog rollup + archive.
  totals:
    tokens_total: 212950   # build 119465 + verify 93485
    estimated_usd: 1.41    # build $0.79 + verify $0.62
    session_count: 4       # design, build, verify, ship
---

# SPEC-047: Parameterize residual engine reads

## Context

STAGE-007 made a machine a data object the engine consumes, but two reads were left
pointing at engine **module constants** rather than the active machine — deferred to
STAGE-008 because they have no payoff until a machine that actually *differs* exists
(which SPEC-051/052/053 will add):

1. **Bet-level stepping.** `nextBet`/`prevBet` (`src/engine/balance.ts`) index the
   module const `BET_LEVELS`, so every machine steps `10 → 25 → 50` no matter what its
   `machine.math.betLevels` says. `MachineMath.betLevels` is threaded everywhere *except*
   the stepping functions that move between them.
2. **The paytable view's math source.** `paytableRows` (`src/ui/paytable.ts`) reads
   `SYMBOLS` / `SYMBOL_TIER` / `PAYTABLE` imported from `../engine/index`, and the
   payline-count copy uses the module const `PAYLINE_COUNT = PAYLINES.length`. So the
   Paytable sheet always renders the DEFAULT machine's symbols/tiers/multipliers/line-count,
   even though `PaytableSheet` already resolves `getActiveMachine()` for the emoji map.

Both are the same latent bug: a residual module const silently overrides a machine's data.
This spec parameterizes both to read the active machine — the last STAGE-007 deferral of
this kind — following the exact "machine param defaulting to the default" pattern SPEC-039/
040 used for `resolveGrid`/`evaluatePaylines`/`classifyWin`. It changes **no observable
behavior for the default machine** (its `betLevels`/`paytable`/`paylines` ARE today's
constants), so there is **no frozen-seed re-baseline** — it's a pure seam change, proven
data-driven by an adversarial guard-mutation.

## Goal

Make bet-level stepping and the paytable view read the **active machine's** math slice
instead of engine module constants: `nextBet`/`prevBet` step through a supplied
`betLevels` (defaulting to `BET_LEVELS`), and `paytableRows` + a new `paylineCount` derive
symbols/tiers/multipliers/line-count from a supplied `MachineMath`. No behavior change for
the default machine; no frozen-seed re-baseline.

## Inputs

- **Files to read:**
  - `src/engine/balance.ts` — `BET_LEVELS`, `BetLevel`, `nextBet`, `prevBet` (parameterize the two steppers).
  - `src/engine/machine.ts` — `MachineMath` (`.betLevels`, `.symbols`, `.symbolTier`, `.paytable`, `.paylines`).
  - `src/ui/paytable.ts` — `paytableRows`, `PAYLINE_COUNT` (the paytable view's math source).
  - `src/ui/PaytableSheet.tsx` — the sole consumer of `paytableRows`/`PAYLINE_COUNT`; already reads `getActiveMachine()`.
  - `src/ui/useSlotMachine.ts` — the sole consumer of `nextBet`/`prevBet`; already threads `machine`.
  - `src/engine/index.ts` — the UI's only engine entrypoint (DEC-001); re-exports `nextBet`/`prevBet`/`MachineMath`.
- **Related code paths:** `src/engine/`, `src/ui/`.

## Outputs

- **Files created:** none.
- **Files modified:**
  - `src/engine/balance.ts` — `nextBet`/`prevBet` take an optional `levels: readonly BetLevel[] = BET_LEVELS`.
  - `src/ui/paytable.ts` — `paytableRows(math, symbolDisplay)` reads symbols/tiers/multipliers from `math`;
    replace the `PAYLINE_COUNT` const with a `paylineCount(math)` function.
  - `src/ui/PaytableSheet.tsx` — resolve the active machine once, pass `machine.math` to
    `paytableRows`/`paylineCount`.
  - `src/ui/useSlotMachine.ts` — pass `machine.math.betLevels` to `nextBet`/`prevBet`.
  - Test files: `src/engine/balance.test.ts`, `src/ui/paytable.test.ts`, `src/ui/useSlotMachine.test.tsx`.
- **New exports:** `paylineCount(math: MachineMath): number` from `src/ui/paytable.ts`.
- **Removed exports:** `PAYLINE_COUNT` const from `src/ui/paytable.ts` (superseded by `paylineCount(math)`).
- **Database changes:** none.

## Acceptance Criteria

- [ ] `nextBet(bet, levels)` / `prevBet(bet, levels)` step through the **supplied** `levels`
      array (clamped at the ends, no wraparound); called with no `levels` arg they default to
      `BET_LEVELS` so every existing call site keeps today's `10 → 25 → 50` behavior.
- [ ] `nextBet(10, [10, 50])` returns `50` and `prevBet(50, [10, 50])` returns `10` — proving
      the steppers read the passed levels (which SKIP 25), not the module `BET_LEVELS`.
- [ ] `paytableRows(math, symbolDisplay)` derives tier membership from `math.symbols` +
      `math.symbolTier` and multipliers from `math.paytable` — not from the engine module
      constants. Called with the default machine's math it returns exactly today's rows.
- [ ] `paylineCount(math)` returns `math.paylines.length` (20 for the default machine);
      `PAYLINE_COUNT` the module const no longer exists.
- [ ] `useSlotMachine` steps the bet through `machine.math.betLevels`: a machine whose
      `betLevels` is `[10, 50]` steps `10 → 50` (skipping 25) via `increaseBet`.
- [ ] `PaytableSheet` renders the active machine's line-count and paytable (reads
      `getActiveMachine().math` once; passes it to both functions).
- [ ] No behavior change for the default machine → **no frozen-seed re-baseline**;
      `git diff main..HEAD -- src/engine/machine.ts src/engine/paylines.ts src/engine/spin.ts
      src/engine/strips.ts src/engine/tiers.ts src/machines/` is EMPTY (data + engine-math
      untouched; only the two stepper signatures and the paytable-view source change).
- [ ] `just typecheck && just lint && just test && just build && just validate` all pass.

## Failing Tests

Written now, BEFORE build. The implementer makes these pass. (The existing `paytableRows`
call sites in `src/ui/paytable.test.ts` must be updated to the new two-arg signature — that
is part of this spec, not incidental churn.)

- **`src/engine/balance.test.ts`** (add — keep the existing default-arg tests, which prove
  the `BET_LEVELS` default still holds):
  - `"nextBet steps through a machine's custom bet levels"` — asserts
    `nextBet(10, [10, 50])` toBe `50`, `nextBet(50, [10, 50])` toBe `50` (top clamp),
    and (sanity) `nextBet(10, [10, 25, 50])` toBe `25`.
  - `"prevBet steps through a machine's custom bet levels"` — asserts
    `prevBet(50, [10, 50])` toBe `10`, `prevBet(10, [10, 50])` toBe `10` (bottom clamp).

- **`src/ui/paytable.test.ts`** (modify — update every `paytableRows(DEFAULT_DISPLAY)` to
  `paytableRows(DEFAULT_MATH, DEFAULT_DISPLAY)` where
  `DEFAULT_MATH = WILD_AND_WHIMSICAL.math`; add `paylineCount` to the import):
  - `"paylineCount reads the machine's payline count"` — asserts `paylineCount(DEFAULT_MATH)`
    toBe `20`.
  - `"paytableRows is machine-driven: multipliers and line-count come from the supplied math"`
    — build `stubMath = { ...DEFAULT_MATH, paytable: { low: [9,9,9], mid: [9,9,9], high: [9,9,9],
    jackpot: [9,9,9] }, paylines: DEFAULT_MATH.paylines.slice(0, 3) }`; assert every row of
    `paytableRows(stubMath, DEFAULT_DISPLAY)` has `multipliers` `[9,9,9]` (NOT the engine
    PAYTABLE numbers) and `paylineCount(stubMath)` toBe `3` (NOT 20).

- **`src/ui/useSlotMachine.test.tsx`** (add, under the SPEC-042 machine-threading block):
  - `"steps the bet through the active machine's bet levels"` — render
    `useSlotMachine({ machine: { ...WILD_AND_WHIMSICAL, math: { ...WILD_AND_WHIMSICAL.math,
    betLevels: [10, 50] } }, initialBalance: 1000 })`; `expect(result.current.bet).toBe(10)`;
    `act(() => result.current.increaseBet())`; `expect(result.current.bet).toBe(50)` (skips 25);
    `act(() => result.current.increaseBet())`; `expect(result.current.bet).toBe(50)` (top clamp);
    `act(() => result.current.decreaseBet())`; `expect(result.current.bet).toBe(10)`.

## Implementation Context

*Read this section (and the files it points to) before starting the build cycle.*

### Decisions that apply

- `DEC-001` (engine-no-dom) — `balance.ts` stays pure engine (numbers in/out, no DOM). The
  paytable view (`paytable.ts`) is UI and imports from `../engine/index` ONLY (the
  `MachineMath` type + `Tier`); it never reaches into engine internals. ESLint's
  `no-restricted-imports` block on `src/engine/**` is unaffected (no new engine imports).
- `DEC-011` — paytable multipliers come from `PAYTABLE`, never hard-coded in the UI. This
  spec keeps that invariant but sources them from `math.paytable` (which, for the default
  machine, IS `PAYTABLE` by reference) so a machine may legitimately vary them.
- `DEC-015` — config-driven machine model: this closes the last residual reads that ignored
  the active machine, so "add a machine" stays pure data. No engine LOGIC changes.

### Constraints that apply

- `engine-no-dom` — `nextBet`/`prevBet` remain pure functions of `(BetLevel, readonly BetLevel[])`.

### Prior related work

- `SPEC-039` / `SPEC-040` (shipped) — established the pattern this spec copies: add an
  optional `machine`/data parameter with a default so existing callers are unchanged, then
  thread the active machine from the UI. Here the parameter is `levels` (for the steppers)
  and `math` (for the paytable view).
- `SPEC-041` (shipped) — already made `paytableRows` take `symbolDisplay` as a param sourced
  from the machine's presentation slice; this extends the same function to also take the
  machine's math, and updates `PaytableSheet` (its only caller) accordingly.
- `SPEC-042` (shipped) — the hook already resolves `machine` and threads `machine.math` into
  the engine; this spec routes `machine.math.betLevels` into the two steppers it calls.

### Out of scope (for this spec specifically)

- Any retune / data change to the default machine — its `betLevels`, `paytable`, and
  `paylines` stay byte-identical, so there is **no frozen-seed re-baseline** (that was
  SPEC-046, already shipped). The `git diff` guard above enforces this.
- Reactivity of the active machine (the module-const `getActiveMachine()` seam) — that is
  **SPEC-049**. `PaytableSheet` still reads `getActiveMachine()` at render exactly as it does
  today; this spec only changes WHAT it passes on, not WHEN it re-reads.
- The theme/audio presentation slice — **SPEC-048**.
- Making `BetLevel` a wider type. `MachineMath.betLevels` stays `readonly BetLevel[]`
  (`10 | 25 | 50`); a machine varies which of those it offers and in what order, not the
  denominations themselves. (A themed machine wanting other denominations is a future spec.)

## Notes for the Implementer

**Toolchain brief (read — these have bitten before):** ESLint has NO react-hooks plugin
(no exhaustive-deps disables). NO `@testing-library/user-event` — use `renderHook`/`act`
(the useSlotMachine tests already do). JSX test files stay `.tsx`. `tsconfig` `include` is
`["src"]`. No new dependency. No new DEC (this is a seam parameterization under DEC-015, not
a new decision).

**`src/engine/balance.ts` — drop-in for the two steppers** (only the signatures + the
`BET_LEVELS` references inside change; docstrings updated to mention the `levels` param):

```ts
/**
 * Step the bet level up by one step within `levels` (defaults to BET_LEVELS).
 * Clamped at the top — no wraparound. A machine supplies its own `machine.math.betLevels`.
 */
export function nextBet(bet: BetLevel, levels: readonly BetLevel[] = BET_LEVELS): BetLevel {
  const idx = levels.indexOf(bet);
  const nextIdx = Math.min(idx + 1, levels.length - 1);
  return levels[nextIdx];
}

/**
 * Step the bet level down by one step within `levels` (defaults to BET_LEVELS).
 * Clamped at the bottom — no wraparound. A machine supplies its own `machine.math.betLevels`.
 */
export function prevBet(bet: BetLevel, levels: readonly BetLevel[] = BET_LEVELS): BetLevel {
  const idx = levels.indexOf(bet);
  const prevIdx = Math.max(idx - 1, 0);
  return levels[prevIdx];
}
```

Note: if `bet` is not in `levels`, `indexOf` returns `-1` and both clamp to `levels[0]`
(snap-to-floor) — a reasonable total behavior, and unreachable in practice because the hook
inits `bet` from `machine.math.defaultBet` which is always in `betLevels`.

**`src/ui/paytable.ts` — read the machine's math instead of engine consts.** Replace the
value import with a type-only import and thread `math`:

```ts
import type { MachineMath, Tier } from '../engine/index';
import type { SymbolDisplay } from '../machines/types';

// ...PaytableRow interface unchanged...

/** Number of fixed paylines for a machine's math slice (was the PAYLINE_COUNT const). */
export function paylineCount(math: MachineMath): number {
  return math.paylines.length;
}

/**
 * Build the paytable display rows from the machine's math + the supplied symbol display map.
 * Symbols/tiers/multipliers come from `math` so the sheet reflects the ACTIVE machine
 * (DEC-011: multipliers still come from the machine's paytable, never hard-coded here).
 */
export function paytableRows(math: MachineMath, symbolDisplay: SymbolDisplay): PaytableRow[] {
  return TIER_ORDER.map((tier) => ({
    tier,
    label: TIER_LABELS[tier],
    emoji: math.symbols.filter((s) => math.symbolTier[s] === tier).map(
      (s) => symbolDisplay[s].emoji,
    ),
    multipliers: math.paytable[tier],
  }));
}
```

Delete the old `import { SYMBOLS, SYMBOL_TIER, PAYTABLE, PAYLINES } from '../engine/index';`
value import and the `export const PAYLINE_COUNT = PAYLINES.length;` line. `TIER_ORDER` /
`TIER_LABELS` / the `PaytableRow` interface are unchanged. (The file header comment mentioning
SPEC-041 threading symbolDisplay can gain a SPEC-047 line noting math is now threaded too.)

**`src/ui/PaytableSheet.tsx` — resolve the machine once, pass its math.** Change:

```ts
import { paytableRows, paylineCount } from './paytable';
// ...
const machine = getActiveMachine();
const rows = paytableRows(machine.math, machine.presentation.symbolDisplay);
```

and in the rules copy, replace `{PAYLINE_COUNT}` with `{paylineCount(machine.math)}`.

**`src/ui/useSlotMachine.ts` — pass the machine's bet levels to the steppers.** The three
call sites (`canIncreaseBet`, `canDecreaseBet`, and the `setBet(nextBet(...))` /
`setBet(prevBet(...))` in `increaseBet`/`decreaseBet`) each add `machine.math.betLevels`:

```ts
const canIncreaseBet =
  nextBet(bet, machine.math.betLevels) !== bet &&
  canAfford(balance, nextBet(bet, machine.math.betLevels));
const canDecreaseBet = prevBet(bet, machine.math.betLevels) !== bet;
// ...
const increaseBet = useCallback(() => {
  if (!canIncreaseBet) return;
  setBet(nextBet(bet, machine.math.betLevels));
}, [bet, canIncreaseBet, machine]);

const decreaseBet = useCallback(() => {
  if (!canDecreaseBet) return;
  setBet(prevBet(bet, machine.math.betLevels));
}, [bet, canDecreaseBet, machine]);
```

(Add `machine` to the two `useCallback` deps since they now read `machine.math.betLevels`.)

**Verify-cycle adversarial check (teeth):** the guard-mutations that MUST fail a test —
(a) revert `nextBet`/`prevBet` to ignore `levels` and use `BET_LEVELS` (the old body): the
new `nextBet(10, [10, 50]) === 50` test and the hook `10 → 50` test must FAIL (they'd get
25); revert. (b) revert `paytableRows` to read the engine `PAYTABLE`/`SYMBOL_TIER`/`SYMBOLS`
consts and `paylineCount` to `PAYLINES.length`: the stub-math test (`[9,9,9]` multipliers,
`paylineCount === 3`) must FAIL; revert. If a mutation does NOT fail a test, the guard has no
teeth — investigate before shipping.

---

## Build Completion

*Filled in at the end of the **build** cycle, before advancing to verify.*

- **Branch:** `feat/spec-047-parameterize-residual-engine-reads`
- **All acceptance criteria met?** yes
- **New decisions emitted:** none (seam parameterization under DEC-015, as expected).
- **Deviations from spec:** One implementation-detail deviation, not a behavior/API deviation:
  the stub-math test's inline `paytable: { low: [9,9,9], ... }` literal (as given verbatim in
  the spec Notes) fails `tsc --strict` because `MachineMath.paytable[tier]` is typed as the
  tuple `readonly [number, number, number]` and a bare `[9, 9, 9]` array literal widens to
  `number[]`. Added `as const` to each of the four tuples in that one test object so it
  type-checks; the runtime values and assertions are unchanged from the spec text. No other
  deviations — all four source edits and all three test-file changes were made verbatim.
- **Follow-up work identified:** none beyond what the spec already defers to SPEC-048/049.

### Build-phase reflection (3 questions, short answers)

1. **What was unclear in the spec that slowed you down?**
   — Nothing was unclear; the only friction was the `as const` tuple-typing wrinkle in the
     stub-math test literal noted above, which the spec's drop-in code didn't need to
     anticipate since it was written before running `tsc` against it.
2. **Was there a constraint or decision that should have been listed but wasn't?**
   — No. DEC-001/011/015 fully covered the boundary and data-source rules needed; nothing
     missing.
3. **If you did this task again, what would you do differently?**
   — Nothing structurally different — the spec's "measure against the real engine before
     writing tests" design discipline meant the build was, as advertised, transcription plus
     one small type-literal fix.

---

## Reflection (Ship)

*Appended during the **ship** cycle. Outcome-focused, distinct from the build reflection.*

1. **What would I do differently next time?**
   — Ship the drop-in test literals already `tsc`-clean. This build was pure transcription
     with a single wrinkle: the stub-math `paytable` tuple literal in `paytable.test.ts`
     needed `as const` to satisfy `MachineMath.paytable`'s `readonly [number, number, number]`
     under strict `tsc` (the design's verbatim literal widened to `number[]`). Trivial, but a
     spec whose drop-in code was run through `tsc` at design time would have zero deviations.

2. **Does any template, constraint, or decision need updating?**
   — No. No new DEC (this closed the last STAGE-007 residual-read deferral as a seam
     parameterization under DEC-015 — not a new decision). No constraint/template change. One
     small LESSON worth logging to the PROJ-002 signals set: for parameterization specs,
     type-check inline test-object literals against strict tsc when authoring drop-in code —
     tuple-typed fields (`readonly [number, number, number]`) need `as const` on array literals.

3. **Is there a follow-up spec I should write now before I forget?**
   — No new spec. The stage backlog already sequences the payoff: SPEC-048 (theme/audio slice),
     SPEC-049 (reactive active-machine context — makes `getActiveMachine()` reactive so the
     paytable re-reads on a switch), SPEC-050 (selector), then the three themed machines
     (051/052/053) that finally exercise the now-machine-driven bet levels + paytable this spec
     unlocked. Nothing to add.
