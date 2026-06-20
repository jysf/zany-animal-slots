---
# Maps to ContextCore task.* semantic conventions.

task:
  id: SPEC-008
  type: story
  cycle: build
  blocked: false
  priority: high
  complexity: M

project:
  id: PROJ-001
  stage: STAGE-002
repo:
  id: animal-slots

agents:
  architect: claude-opus-4-8
  implementer: claude-sonnet-4-6
  created_at: 2026-06-19

references:
  decisions:
    - DEC-001
    - DEC-003
    - DEC-011
  constraints:
    - engine-no-dom
    - test-before-implementation
    - one-spec-per-pr
  related_specs:
    - SPEC-006
    - SPEC-007

value_link: "STAGE-002's scoring — turns a resolved grid into line wins + a total payout per the 5 fixed paylines (DEC-003) and the tier paytable (DEC-011)."

cost:
  sessions:
    - cycle: design
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      duration_minutes: 30
      recorded_at: 2026-06-19
      notes: "main-loop, not separately metered (AGENTS §4); design cycle"
  totals:
    tokens_total: 0
    estimated_usd: 0
    session_count: 0
---

# SPEC-008: Payline and paytable evaluation

## Context

The fourth STAGE-002 engine spec and its scoring heart. Given a resolved 5×3
`Grid` (SPEC-007) and a total bet, this spec evaluates the **five fixed paylines**
(DEC-003) against the **tier paytable** (DEC-011): for each line it finds the
left-anchored run of identical symbols (3+, starting at reel 0) and pays that
tier's multiple of the total bet; the spin's total win is the sum across all
hitting lines. It is pure scoring — no RNG, no balance, no win-tier label.

See `STAGE-002-slot-engine.md`, the **Game-Design Spec** in `brief.md` (paylines +
paytable tables + worked examples), `DEC-003` (the five lines), and `DEC-011`
(the paytable). Symbol tiers come from SPEC-006's `SYMBOL_TIER`.

## Goal

Evaluate a `Grid` + `totalBet` into line wins and a total: for each of the five
paylines, score the left-anchored run (≥3) of its reel-0 symbol using the tier
paytable (`floor(multiplier × totalBet)`), and sum all line wins.

## Inputs

- **Files to read:** `src/engine/spin.ts` (`Grid`), `src/engine/strips.ts`
  (`SymbolId`, `Tier`, `SYMBOL_TIER`); `brief.md` Game-Design Spec (paylines,
  paytable, worked examples); `DEC-003`, `DEC-011`.
- **Related code paths:** `src/engine/`.

## Outputs

- **Files created:**
  - `src/engine/paylines.ts` — paylines, paytable, evaluation.
  - `src/engine/paylines.test.ts` — the Failing Tests below.
- **New exports (from `paylines.ts`):**
  - `export type LineId = 'L1' | 'L2' | 'L3' | 'L4' | 'L5';`
  - `export interface Payline { id: LineId; rows: readonly number[]; }`
  - `export const PAYLINES: readonly Payline[];` — the 5 lines (DEC-003).
  - `export const PAYTABLE: Record<Tier, readonly [number, number, number]>;` —
    per tier, the `[3-of-a-kind, 4, 5]` multipliers (DEC-011).
  - `export interface LineWin { line: LineId; symbol: SymbolId; count: 3 | 4 | 5;
    multiplier: number; amount: number; }` (`amount = floor(multiplier × totalBet)`).
  - `export interface PaylineResult { lineWins: LineWin[]; totalWin: number; }`
  - `export function lineSymbols(grid: Grid, line: Payline): SymbolId[];` — the five
    symbols along a line (`grid[reel][line.rows[reel]]`).
  - `export function evaluatePaylines(grid: Grid, totalBet: number): PaylineResult;`
- **Database changes:** none.

## Acceptance Criteria

- [ ] `PAYLINES` is the five DEC-003 lines with exact rows: L1 `[1,1,1,1,1]`,
      L2 `[0,0,0,0,0]`, L3 `[2,2,2,2,2]`, L4 `[0,1,2,1,0]`, L5 `[2,1,0,1,2]`.
- [ ] `PAYTABLE` equals DEC-011: low `[0.5,2,5]`, mid `[1,4,12]`, high `[3,10,40]`,
      jackpot `[8,40,200]`.
- [ ] A line pays only for a run of identical symbols **starting at reel 0**, of
      length ≥3; `amount = floor(multiplier × totalBet)`.
- [ ] `evaluatePaylines` sums all hitting lines into `totalWin`; non-winning grids
      return `totalWin: 0` and `lineWins: []`.
- [ ] `paylines.ts` imports only engine modules (`spin`, `strips`); no React/DOM/
      `src/ui`; no `Math.random()`.
- [ ] `just typecheck`, `just lint`, `just test`, `just build` all exit 0.

## Failing Tests

Written during **design**, BEFORE build. Expected payouts were computed from the
DEC-003 lines + DEC-011 paytable (floor rounding). Grids are `grid[reel][row]`.

- **`src/engine/paylines.test.ts`**
  - `"PAYLINES matches DEC-003"` — `PAYLINES` deep-equals the five lines with rows
    L1 `[1,1,1,1,1]`, L2 `[0,0,0,0,0]`, L3 `[2,2,2,2,2]`, L4 `[0,1,2,1,0]`,
    L5 `[2,1,0,1,2]` (ids L1..L5).
  - `"PAYTABLE matches DEC-011"` — `PAYTABLE` deep-equals
    `{low:[0.5,2,5], mid:[1,4,12], high:[3,10,40], jackpot:[8,40,200]}`.
  - `"lineSymbols reads cells along a line"` — for the grid
    `G = [['DEER','FOX','SQUIRREL'],['SQUIRREL','BEAR','DEER'],['EAGLE','BEAR','FOX'],
    ['OWL','BEAR','BISON'],['DEER','EAGLE','OWL']]` and L4 (`rows [0,1,2,1,0]`),
    `lineSymbols(G, L4)` equals `['DEER','BEAR','FOX','BEAR','DEER']`.
  - `"a non-winning grid pays nothing"` — grid
    `[['DEER','FOX','SQUIRREL'],['BEAR','EAGLE','OWL'],['DEER','BISON','FOX'],
    ['EAGLE','DEER','SQUIRREL'],['FOX','OWL','BEAR']]` → `{lineWins: [], totalWin: 0}`.
  - `"a run must start at reel 0"` — grid `G` above (L1 middle row is
    `FOX,BEAR,BEAR,BEAR,EAGLE` — three BEARs but not anchored at reel 0) →
    `totalWin === 0`, `lineWins` empty.
  - `"scores a single 3-of-a-kind mid on L1"` — grid
    `[['DEER','BEAR','SQUIRREL'],['FOX','BEAR','DEER'],['SQUIRREL','BEAR','FOX'],
    ['BEAR','DEER','EAGLE'],['EAGLE','FOX','OWL']]`, `totalBet 10` →
    `totalWin === 10`, `lineWins` is one entry
    `{line:'L1', symbol:'BEAR', count:3, multiplier:1, amount:10}`.
  - `"scores a 5-of-a-kind low on L2"` — grid
    `[['DEER','FOX','SQUIRREL'],['DEER','BEAR','OWL'],['DEER','EAGLE','FOX'],
    ['DEER','OWL','BISON'],['DEER','BEAR','SQUIRREL']]`, `totalBet 10` →
    `totalWin === 50`; the single line win is `{line:'L2', symbol:'DEER', count:5,
    multiplier:5, amount:50}`.
  - `"scores a 4-of-a-kind high on L1"` — grid
    `[['BISON','BISON','DEER'],['FOX','BISON','OWL'],['SQUIRREL','BISON','FOX'],
    ['BEAR','BISON','EAGLE'],['EAGLE','DEER','OWL']]`, `totalBet 10` →
    `totalWin === 100` (`{line:'L1', symbol:'BISON', count:4, multiplier:10,
    amount:100}`).
  - `"five Wolves pays the jackpot amount on every line"` — an all-`WOLF` 5×3 grid,
    `totalBet 10` → `totalWin === 10000`; `lineWins` has 5 entries, each
    `{symbol:'WOLF', count:5, multiplier:200, amount:2000}` for L1..L5.
  - `"sums multiple hitting lines"` — grid
    `[['FOX','BEAR','DEER'],['SQUIRREL','BEAR','DEER'],['EAGLE','BEAR','DEER'],
    ['OWL','FOX','BISON'],['DEER','EAGLE','SQUIRREL']]` (L1 row1 = three BEARs,
    L3 row2 = three DEER): `totalBet 10` → `totalWin === 15` (L1 mid 3 = 10 + L3
    low 3 = floor(0.5×10)=5); `totalBet 25` → `totalWin === 37` (25 + floor(0.5×25)=12).
  - `"floors fractional payouts"` — a grid whose only win is a low 3-of-a-kind on L2
    (e.g. `[['DEER','BEAR','SQUIRREL'],['DEER','EAGLE','FOX'],['DEER','OWL','BISON'],
    ['FOX','DEER','EAGLE'],['EAGLE','FOX','OWL']]`), `totalBet 25` →
    the line win `amount === 12` (floor of `0.5 × 25 = 12.5`), `totalWin === 12`.

## Implementation Context

### Decisions that apply

- `DEC-003` — the five fixed paylines and the rule: pay on 3+ consecutive matching
  symbols **from reel 0**, sum all lines. No wilds (WOLF is not wild).
- `DEC-011` — the tier paytable (multiples of total bet for 3/4/5 of a kind) and
  the `floor(multiplier × totalBet)` coin rounding.
- `DEC-001` — pure engine; imports only `spin` (Grid) and `strips` (tiers).

### Constraints that apply

- `engine-no-dom` (blocking, lint-enforced), `test-before-implementation`,
  `one-spec-per-pr`.

### Prior related work

- `SPEC-007` (shipped, PR #7) — `Grid` (`grid[reel][row]`).
- `SPEC-006` (shipped, PR #6) — `SymbolId`, `Tier`, `SYMBOL_TIER`.

### Out of scope (for this spec specifically)

- Bet/balance debiting/crediting (SPEC-009), win-tier classification (SPEC-010),
  the composed public `spin()` (SPEC-011).
- Per-symbol payout splits within a tier, per-line betting, or extra lines (future
  specs per DEC-003).
- Treating WOLF as a wild — not in v1.

## Notes for the Implementer

- Tier lookup: `SYMBOL_TIER[symbol]` → `PAYTABLE[tier]` → index `count - 3` for the
  multiplier. `amount = Math.floor(multiplier * totalBet)`.
- Per line: read `lineSymbols(grid, line)`, take `s0 = symbols[0]`, count the run
  of `s0` from index 0 until the first mismatch; if `run >= 3`, emit a `LineWin`
  with `count` clamped to the 3–5 range (a 5-reel line maxes at 5).
- `evaluatePaylines` iterates `PAYLINES` in order; push each line's `LineWin` (if
  any) and accumulate `totalWin`. Return `{ lineWins, totalWin }`.
- Keep `count` typed as `3 | 4 | 5`. The run length on a 5-reel line is always in
  that range once `>= 3`.
- Pure functions, no mutation of the input grid.

---

## Build Completion

*Filled in at the end of the **build** cycle, before advancing to verify.*

- **Branch:**
- **PR (if applicable):**
- **All acceptance criteria met?** yes/no
- **New decisions emitted:**
  - `DEC-NNN` — <title> (if any)
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
