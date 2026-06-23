---
# Maps to ContextCore task.* semantic conventions.

task:
  id: SPEC-011
  type: story
  cycle: verify
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
  created_at: 2026-06-23

references:
  decisions:
    - DEC-001
    - DEC-002
    - DEC-005
  constraints:
    - engine-no-dom
    - deterministic-rng
    - test-before-implementation
    - one-spec-per-pr
  related_specs:
    - SPEC-005
    - SPEC-006
    - SPEC-007
    - SPEC-008
    - SPEC-009
    - SPEC-010

value_link: "STAGE-002's payoff — the single typed `spin()` + re-exported surface the UI consumes in STAGE-003, composing rng→debit→grid→paylines→credit→tier into one SpinResult."

cost:
  sessions:
    - cycle: design
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      duration_minutes: 30
      recorded_at: 2026-06-23
      notes: "main-loop, not separately metered (AGENTS §4); design cycle"
    - cycle: build
      agent: claude-sonnet-4-6
      interface: claude-code
      tokens_total: 60959
      estimated_usd: 0.40
      duration_minutes: 3.3
      recorded_at: 2026-06-23
      notes: "Sonnet sub-agent build (Agent subagent_tokens=60959, 199s). estimated_usd ~= tokens x $6.6/M Sonnet blended, no cache discount (order-of-magnitude, AGENTS §4)."
    - cycle: verify
      agent: claude-sonnet-4-6
      interface: claude-code
      tokens_total: 63579
      estimated_usd: 0.42
      duration_minutes: 6.9
      recorded_at: 2026-06-23
      notes: "Sonnet sub-agent verify (Agent subagent_tokens=63579, 416s). estimated_usd ~= tokens x $6.6/M Sonnet blended, no cache discount (order-of-magnitude, AGENTS §4)."
  totals:
    tokens_total: 0
    estimated_usd: 0
    session_count: 0
---

# SPEC-011: Public engine interface

## Context

The seventh and final STAGE-002 spec — the seam the whole stage was built toward.
It composes the engine modules (RNG, strips, spin resolver, payline/paytable
evaluation, bet/balance, win-tier) into one typed public surface at
`src/engine/index.ts`: a `spin()` that takes a seed, balance, and bet and returns
a plain-data `SpinResult` (grid, line wins, total win, new balance, win tier), plus
re-exports of the types/constants/helpers the UI needs. After this, the UI
(STAGE-003) imports **only** from `src/engine/index.ts` — never engine internals
(AGENTS §11). When this ships, STAGE-002 is complete.

See `STAGE-002-slot-engine.md`, the **Game-Design Spec** in `brief.md`, the AGENTS
glossary ("Spin / SpinResult"), `DEC-001` (the engine boundary the UI consumes),
`DEC-002` (injected seed), and `DEC-005` (play-money). Composes SPEC-005..010.

## Goal

Expose `src/engine/index.ts`: a `spin({ seed, balance, bet })` that debits the
bet (or returns a typed `insufficient-balance` outcome), resolves the grid from a
seeded RNG, evaluates paylines, credits the win, classifies the win tier, and
returns a `SpinResult`; plus re-exports of the engine's public types, constants,
and bet/affordability helpers.

## Inputs

- **Files to read:** all of `src/engine/`: `rng.ts` (`createRng`), `strips.ts`
  (`SymbolId`, `Tier`, `SYMBOLS`, `SYMBOL_TIER`), `spin.ts` (`Grid`,
  `resolveGrid`), `paylines.ts` (`PAYLINES`, `PAYTABLE`, `LineWin`,
  `evaluatePaylines`), `balance.ts` (`BetLevel`, `BET_LEVELS`, `DEFAULT_BET`,
  `STARTING_BALANCE`, `debit`, `credit`, `canAfford`, `nextBet`, `prevBet`),
  `tiers.ts` (`WinTier`, `classifyWin`); the AGENTS glossary "Spin / SpinResult".
- **Related code paths:** `src/engine/`.

## Outputs

- **Files created:**
  - `src/engine/index.ts` — the public interface.
  - `src/engine/index.test.ts` — the Failing Tests below.
- **New exports (from `index.ts`):**
  - `export interface SpinResult { grid: Grid; lineWins: LineWin[]; totalWin:
    number; balance: number; tier: WinTier; bet: BetLevel; }` — the new balance is
    after debit + credit.
  - `export type SpinOutcome = ({ ok: true } & SpinResult) | { ok: false; reason:
    'insufficient-balance'; balance: number };`
  - `export function spin(args: { seed: number; balance: number; bet: BetLevel }):
    SpinOutcome;`
  - **Re-exports** (so the UI imports only this module): types `SymbolId`, `Tier`,
    `Grid`, `LineId`, `Payline`, `LineWin`, `WinTier`, `BetLevel`; values `SYMBOLS`,
    `SYMBOL_TIER`, `PAYLINES`, `PAYTABLE`, `BET_LEVELS`, `DEFAULT_BET`,
    `STARTING_BALANCE`, `nextBet`, `prevBet`, `canAfford`.
- **Database changes:** none.

## Acceptance Criteria

- [ ] `spin({ seed, balance, bet })` with an affordable bet returns
      `{ ok: true, grid, lineWins, totalWin, balance, tier, bet }` where: `grid` is
      `resolveGrid(createRng(seed))`; `lineWins`/`totalWin` are
      `evaluatePaylines(grid, bet)`; `balance` is `(balance − bet) + totalWin`;
      `tier` is `classifyWin(totalWin, bet, lineWins)`.
- [ ] When `balance < bet`, `spin` returns `{ ok: false, reason:
      'insufficient-balance', balance }` (unchanged) and does **not** resolve a grid
      or throw.
- [ ] **Deterministic:** identical `{ seed, balance, bet }` yields an identical
      `SpinOutcome`.
- [ ] `index.ts` re-exports the listed types/constants/helpers so the UI consumes
      only `src/engine/index.ts`.
- [ ] `index.ts` imports only engine modules; no React/DOM/`src/ui`; no
      `Math.random()`.
- [ ] `just typecheck`, `just lint`, `just test`, `just build` all exit 0.

## Failing Tests

Written during **design**, BEFORE build. Full-spin fixtures were computed from the
composed pipeline (canonical RNG + strip + paylines + paytable).

- **`src/engine/index.test.ts`**
  - `"a losing spin debits the bet and returns tier none"` — `spin({ seed: 12345,
    balance: 1000, bet: 10 })` returns `ok: true`, `totalWin === 0`,
    `tier === 'none'`, `balance === 990`, `bet === 10`, and `grid` deep-equals
    `[["FOX","DEER","FOX"],["DEER","FOX","BEAR"],["DEER","FOX","WOLF"],
    ["FOX","BEAR","EAGLE"],["FOX","WOLF","SQUIRREL"]]`.
  - `"a small win credits and classifies small"` — `spin({ seed: 12, balance: 1000,
    bet: 10 })` returns `ok: true`, `totalWin === 10`, `tier === 'small'`,
    `balance === 1000` (−10 bet + 10 win), `lineWins.length === 1`.
  - `"a big multi-line win credits and classifies big"` — `spin({ seed: 276,
    balance: 1000, bet: 10 })` returns `ok: true`, `totalWin === 55`,
    `tier === 'big'`, `balance === 1045`, `lineWins.length === 3`.
  - `"an unaffordable spin returns insufficient-balance without spinning"` —
    `spin({ seed: 1, balance: 5, bet: 10 })` deep-equals `{ ok: false, reason:
    'insufficient-balance', balance: 5 }` (no `grid` field); does not throw.
  - `"a spin is deterministic for the same inputs"` — two calls of
    `spin({ seed: 999, balance: 1000, bet: 25 })` deep-equal each other.
  - `"the balance reflects debit then credit"` — for seed 276 at `balance 1000,
    bet 10`: `balance === 1000 − 10 + 55 === 1045` (asserts the order: debit first,
    then credit the win).
  - `"re-exports the public surface the UI needs"` — from `./index`:
    `BET_LEVELS` deep-equals `[10,25,50]`; `DEFAULT_BET === 10`;
    `STARTING_BALANCE === 1000`; `PAYLINES.length === 5`; `SYMBOLS.length === 8`;
    and `nextBet`, `prevBet`, `canAfford` are functions.

## Implementation Context

### Decisions that apply

- `DEC-001` — `index.ts` IS the engine's public boundary; the UI imports only this
  file. It composes internals but exposes a clean typed surface.
- `DEC-002` — `spin` takes a caller-provided `seed` and builds the `Rng` via
  `createRng(seed)`; no `Math.random()`. (The UI supplies fresh seeds in STAGE-003.)
- `DEC-005` — play-money; an unaffordable spin is a typed outcome, never a throw.

### Constraints that apply

- `engine-no-dom` (blocking, lint-enforced), `deterministic-rng` (blocking),
  `test-before-implementation`, `one-spec-per-pr`.

### Prior related work

- `SPEC-005`..`SPEC-010` (all shipped) — the modules this composes. The full-spin
  fixtures (seeds 12345/12/276) were derived from that exact pipeline.

### Out of scope (for this spec specifically)

- Any UI, rendering, animation, audio, auto-spin loop, or localStorage persistence
  (STAGE-003+). `spin()` is a pure function of its inputs.
- Generating seeds (the UI does that). The engine only consumes a provided seed.
- Changing any module's internal behavior — this spec only composes + re-exports.

## Notes for the Implementer

- Compose in this order inside `spin`:
  1. `const d = debit(balance, bet);` if `!d.ok` return `{ ok: false, reason:
     'insufficient-balance', balance }` (the original balance).
  2. `const grid = resolveGrid(createRng(seed));`
  3. `const { lineWins, totalWin } = evaluatePaylines(grid, bet);`
  4. `const newBalance = credit(d.balance, totalWin);`
  5. `const tier = classifyWin(totalWin, bet, lineWins);`
  6. `return { ok: true, grid, lineWins, totalWin, balance: newBalance, tier, bet };`
- Re-export with `export type { ... }` for types and `export { ... }` for values,
  or `export * from './module'` selectively — but keep the surface to the listed
  names (don't leak `createRng`/`resolveGrid`/`debit` internals unless needed; the
  UI works through `spin` + the helpers).
- Keep `index.ts` thin: composition + re-exports only, no new game logic.
- `bet` is a `BetLevel` (`10 | 25 | 50`); `spin`'s arg type should use it.

---

## Build Completion

*Filled in at the end of the **build** cycle, before advancing to verify.*

- **Branch:** `feat/spec-011-engine-interface`
- **PR (if applicable):** (local only — orchestrator opens PR at ship)
- **All acceptance criteria met?** yes
- **New decisions emitted:**
  - none
- **Deviations from spec:**
  - none
- **Follow-up work identified:**
  - none (STAGE-002 backlog complete after this spec ships)

### Build-phase reflection (3 questions, short answers)

1. **What was unclear in the spec that slowed you down?**
   — Nothing truly slowed things down. The only minor friction was that the spec's compose-order diagram showed `import type { LineId, Payline }` as a local import, but TypeScript's `noUnusedLocals` flagged them as unused (they're re-exported via `export type { ... } from './paylines'`, not needed locally). Removing the redundant local imports resolved it immediately.

2. **Was there a constraint or decision that should have been listed but wasn't?**
   — No. `engine-no-dom`, `deterministic-rng`, and `DEC-005` (no-throw on insufficient balance) all mapped directly to implementation choices. TypeScript strict mode (`noUnusedLocals`) could have been noted in the context to flag the import issue, but it's a minor compile-error, not an architectural gap.

3. **If you did this task again, what would you do differently?**
   — Nothing significant. The spec was precise: pinned fixtures, exact compose order, exact re-export list. Starting with the test file to confirm the fixtures compile before writing `index.ts` would surface any import-shape issues earlier, but the gate caught it instantly anyway.

---

## Verify

*Completed 2026-06-23 by claude-sonnet-4-6 (cold sub-agent).*

**Verdict: ✅ APPROVED**

Gates: `just typecheck && just lint && just test && just build` — all exit 0.
72/72 tests pass. `just decisions-audit --changed` — no uncommitted changes in scope; PR-branch changes (`src/engine/index.ts`, `src/engine/index.test.ts`) are governed by DEC-001 (`affected_scope: src/engine/**`), honored.

- [x] **ACCEPTANCE CRITERIA** — all six boxes met. `spin()` returns `ok: true` with correct grid/lineWins/totalWin/balance/tier/bet on affordable bets; returns `{ ok: false, reason: 'insufficient-balance', balance }` (original, unchanged) and no grid on unaffordable bets; identical inputs yield identical output; index.ts re-exports the full listed surface; no React/DOM/src-ui imports; all four gates green.
- [x] **COMPOSITION CORRECTNESS** — compose order in `spin()` is exactly debit → (if !d.ok return insufficient-balance with original balance, no grid, no throw) → resolveGrid(createRng(seed)) → evaluatePaylines(grid, bet) → credit(d.balance, totalWin) → classifyWin. The unaffordable path returns before `resolveGrid` is called and carries the original `balance` arg, not the debited one. Balance math: `(1000 − 10) + 55 = 1045` confirmed by test "the balance reflects debit then credit".
- [x] **FIXTURES** — three pinned full-spin fixtures genuine and self-consistent. seed 12345 → totalWin 0, tier 'none' (0 ≤ 0), balance 990 (1000−10+0). seed 12 → totalWin 10, tier 'small' (10 > 0, 10 < 5×10=50), balance 1000 (1000−10+10). seed 276 → totalWin 55, tier 'big' (55 ≥ 5×10=50), balance 1045 (1000−10+55), lineWins.length 3. Tier thresholds match `classifyWin` (jackpot-first, then ≤0 → none, <5×bet → small, ≥5×bet → big). All three asserted in test suite and pass.
- [x] **RE-EXPORTS** — index.ts exports: types `SymbolId`, `Tier`, `Grid`, `LineId`, `Payline`, `LineWin`, `WinTier`, `BetLevel`; values `SYMBOLS`, `SYMBOL_TIER`, `PAYLINES`, `PAYTABLE`, `BET_LEVELS`, `DEFAULT_BET`, `STARTING_BALANCE`, `nextBet`, `prevBet`, `canAfford`; plus `SpinResult`, `SpinOutcome`, `spin`. Re-export test asserts `BET_LEVELS`, `DEFAULT_BET`, `STARTING_BALANCE`, `PAYLINES.length`, `SYMBOLS.length`, `nextBet`/`prevBet`/`canAfford` as functions — key ones covered.
- [x] **TESTS NOT VACUOUS** — wrong compose order (e.g. credit before debit) would break "the balance reflects debit then credit" (would yield 1000+55−10=1045 only by accident; more critically, credit-before-debit would mean crediting on the pre-debit balance, which the explicit `credit(d.balance, totalWin)` catches). Grid on unaffordable path caught by `expect('grid' in result).toBe(false)`. Non-determinism caught by deep-equal of two identical-seed calls. Missing re-export caught by import + value assertions. Tests are genuine.
- [x] **CONSTRAINTS** — `engine-no-dom`: index.ts imports only `./rng`, `./spin`, `./paylines`, `./balance`, `./tiers` — no React, no DOM, no src/ui. `deterministic-rng`: no bare `Math.random()` call anywhere in src/engine/ (only in a JSDoc comment). DEC-001/002/005 all honored: public boundary is index.ts only; seed injected via `createRng(seed)`; unaffordable spin is typed outcome, not throw.
- [x] **DECISION DRIFT** — no non-trivial build choices that need a new DEC-*. Build was pure composition + re-exports as specified. Builder correctly emitted "none".
- [x] **BUILD REFLECTION** — three answers present, honest, and non-empty. Friction (noUnusedLocals on redundant local imports) is real and plausible. No architectural gaps identified. "Nothing significant" on what to do differently is appropriate given the spec's precision.
- [x] **COST** — design session: null with valid main-loop note (correct per AGENTS §4). Build session: null with "orchestrator to fill" note (correct for sub-agent run). Verify session: appended this cycle with same null/orchestrator pattern.

---

## Reflection (Ship)

*Appended during the **ship** cycle.*

1. **What would I do differently next time?**
   — <answer>

2. **Does any template, constraint, or decision need updating?**
   — <answer>

3. **Is there a follow-up spec I should write now before I forget?**
   — <answer>
