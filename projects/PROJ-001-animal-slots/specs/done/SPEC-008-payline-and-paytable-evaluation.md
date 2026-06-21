---
# Maps to ContextCore task.* semantic conventions.

task:
  id: SPEC-008
  type: story
  cycle: ship
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
    - cycle: build
      agent: claude-sonnet-4-6
      interface: claude-code
      tokens_total: 62952
      estimated_usd: 0.42
      duration_minutes: 2.9
      recorded_at: 2026-06-20
      notes: "Sonnet sub-agent build (Agent subagent_tokens=62952, 175s). estimated_usd ~= tokens x $6.6/M Sonnet blended, no cache discount (order-of-magnitude, AGENTS §4)."
    - cycle: verify
      agent: claude-sonnet-4-6
      interface: claude-code
      tokens_total: 67684
      estimated_usd: 0.45
      duration_minutes: 4.2
      recorded_at: 2026-06-20
      notes: "Sonnet sub-agent verify (Agent subagent_tokens=67684, 249s). estimated_usd ~= tokens x $6.6/M Sonnet blended, no cache discount (order-of-magnitude, AGENTS §4)."
    - cycle: ship
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      duration_minutes: 10
      recorded_at: 2026-06-21
      notes: "main-loop, not separately metered (AGENTS §4); ship cycle"
  totals:
    tokens_total: 130636
    estimated_usd: 0.87
    session_count: 4
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

- **Branch:** feat/spec-008-payline-eval
- **PR (if applicable):**
- **All acceptance criteria met?** yes
- **New decisions emitted:**
  - none
- **Deviations from spec:**
  - none
- **Follow-up work identified:**
  - none (SPEC-009 bet/balance and SPEC-010 win-tier are already in the backlog)

### Build-phase reflection (3 questions, short answers)

1. **What was unclear in the spec that slowed you down?**
   — Nothing was unclear. The spec was very precise: exact rows per line, exact paytable values, exact test grids with expected outputs including the floor-rounding case. The "run must start at reel 0" test used the same grid G as `lineSymbols`, which required careful reading to confirm no line was actually winning (it isn't — L1 middle row starts with FOX, not BEAR).

2. **Was there a constraint or decision that should have been listed but wasn't?**
   — No missing constraints. `engine-no-dom`, `deterministic-rng` (no Math.random), and importing only from `./spin` and `./strips` are all called out explicitly.

3. **If you did this task again, what would you do differently?**
   — Nothing significant. The spec was complete enough that it was a straight translation. Writing the test first (which the spec's Failing Tests section effectively did already) confirmed the logic before I ran the gate.

---

## Reflection (Ship)

*Appended during the **ship** cycle.*

1. **What would I do differently next time?**
   — Nothing on execution. Computing every expected payout independently (Node,
   from the DEC-003 lines + DEC-011 paytable) and embedding them as fixtures made
   the [M] scoring spec verifiable by hand at review — the verifier re-derived 7
   cases and matched. That up-front fixture computation is what makes a scoring
   spec trustworthy.

2. **Does any template, constraint, or decision need updating?**
   — No. DEC-003 + DEC-011 fully specified the behavior, and the "no wilds in v1"
   clarification lived in the spec where it belonged.

3. **Is there a follow-up spec I should write now before I forget?**
   — No new spec. SPEC-009 (bet/balance) and SPEC-010 (win-tier) are next and
   independent; SPEC-011 composes everything into the public `spin()`. All planned.

---

## Verify

**Reviewer:** claude-sonnet-4-6 (cold sub-agent, 2026-06-20)

### Verdict: ✅ APPROVED

### Gate results

- [x] `just typecheck` — exit 0
- [x] `just lint` — exit 0 (engine-no-dom rule passed; no violations)
- [x] `just test` — exit 0 (11/11 paylines tests pass; 46/46 total)
- [x] `just build` — exit 0 (Vite production build clean)
- [x] `just decisions-audit --changed` — "No changed files in scope (your uncommitted changes)" (all changes committed); scope-overlap warnings are pre-existing across entire repo, not introduced here

### Acceptance criteria

- [x] `PAYLINES` has exactly the five DEC-003 rows: L1 [1,1,1,1,1], L2 [0,0,0,0,0], L3 [2,2,2,2,2], L4 [0,1,2,1,0], L5 [2,1,0,1,2] — confirmed in source and asserted per-line in the test.
- [x] `PAYTABLE` equals DEC-011: low [0.5,2,5], mid [1,4,12], high [3,10,40], jackpot [8,40,200] — confirmed in source and deep-equal asserted.
- [x] Left-anchored run ≥3 from reel 0; `amount = Math.floor(multiplier × totalBet)` — implementation runs a `for` loop from reel 1, breaking on first mismatch; correct.
- [x] `evaluatePaylines` sums all hitting lines; non-winning grid returns `{lineWins:[], totalWin:0}`.
- [x] `paylines.ts` imports only `./spin` and `./strips`; no React/DOM/src-ui; no `Math.random()`.
- [x] All four just gates exit 0.

### Data vs decisions

- **DEC-003 paylines:** source exactly matches the decision table (verified row-by-row).
- **DEC-011 paytable:** source exactly matches the decision table (verified cell-by-cell).
- **DEC-001 pure engine:** only `./spin` and `./strips` imported; lint enforces at the rule level.

### Scoring correctness (hand-derived)

All verified against the formula `amount = floor(PAYTABLE[tier][count-3] × totalBet)`:

1. **All-Wolf, bet=10:** jackpot 5-of-a-kind → multiplier=200; `floor(200×10)=2000`; 5 lines → **10000** ✓
2. **Multi-line bet=25:** L1 BEAR mid 3→ `floor(1×25)=25`; L3 DEER low 3 → `floor(0.5×25)=floor(12.5)=12`; total **37** ✓
3. **Floor test bet=25:** DEER low 3 → `floor(0.5×25)=floor(12.5)=`**12** ✓
4. **BISON 4-of-a-kind high, bet=10:** `PAYTABLE['high'][1]=10`; `floor(10×10)=`**100** ✓
5. **DEER 5-of-a-kind low, bet=10:** `PAYTABLE['low'][2]=5`; `floor(5×10)=`**50** ✓
6. **Reel-0 anchor (grid G):** manually walked all 5 lines; reel-0 symbol never repeats to reel 1 on any line → totalWin=0 ✓
7. **Non-winning grid:** all 5 lines checked; no line reaches run≥3 → totalWin=0 ✓

### Tests not vacuous

- **Wrong paytable value:** the `PAYTABLE matches DEC-011` deep-equal test would catch any single changed multiplier.
- **Off-by-one run count:** the 3-of-a-kind vs 4-of-a-kind vs 5-of-a-kind tests assert both `count` and `amount` individually; the 4-of-a-kind BISON test has run=4 (reel 4 breaks to DEER), confirming the loop exits on the first mismatch.
- **Missing floor:** the `floors fractional payouts` test asserts `amount===12` not `12.5`; would fail if `Math.floor` were removed.
- **Row-major/col-major grid mixup:** `lineSymbols` test asserts `['DEER','BEAR','FOX','BEAR','DEER']` on L4 using a hand-specified grid; any transposition of `grid[reel][row]` → `grid[row][reel]` would break it.

### Constraints

- [x] `engine-no-dom`: paylines.ts imports only `./spin` and `./strips`; lint confirms.
- [x] `deterministic-rng`: no bare `Math.random()` anywhere in `src/engine/` (grep confirmed; only appears in a comment in strips.ts).
- [x] `test-before-implementation`: Failing Tests block was written in design; implementation makes them pass.
- [x] `one-spec-per-pr`: PR #8 references SPEC-008 only.
- [x] `DEC-001`: pure engine respected structurally and at lint level.

### Decision drift

None. No non-trivial build choices requiring a new DEC-* were made; implementation was a straight translation of the spec. The 14 scope-overlap warnings from `just decisions-audit` are pre-existing across all engine decisions (DEC-001's broad `src/engine/**` scope overlaps with more-specific file scopes); they do not indicate drift in this spec's changes.

### Build reflection

- Three questions answered with specific, non-empty content. Honest assessment ("straight translation").
- Cost: design session has correct null-with-note; build session has correct null-with-note per AGENTS §4.
