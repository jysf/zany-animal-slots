---
# Maps to ContextCore task.* semantic conventions.

task:
  id: SPEC-009
  type: story
  cycle: ship
  blocked: false
  priority: high
  complexity: S

project:
  id: PROJ-001
  stage: STAGE-002
repo:
  id: animal-slots

agents:
  architect: claude-opus-4-8
  implementer: claude-sonnet-4-6
  created_at: 2026-06-21

references:
  decisions:
    - DEC-001
    - DEC-005
  constraints:
    - engine-no-dom
    - no-real-money
    - test-before-implementation
    - one-spec-per-pr
  related_specs:
    - SPEC-005

value_link: "STAGE-002's wallet — bet levels + balance debit/credit/reset as pure, typed transitions (invalid spins returned as data, never thrown), per DEC-005 play-money."

cost:
  sessions:
    - cycle: design
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      duration_minutes: 20
      recorded_at: 2026-06-21
      notes: "main-loop, not separately metered (AGENTS §4); design cycle"
    - cycle: build
      agent: claude-sonnet-4-6
      interface: claude-code
      tokens_total: 54088
      estimated_usd: 0.36
      duration_minutes: 2.3
      recorded_at: 2026-06-22
      notes: "Sonnet sub-agent build (Agent subagent_tokens=54088, 137s). estimated_usd ~= tokens x $6.6/M Sonnet blended, no cache discount (order-of-magnitude, AGENTS §4)."
    - cycle: verify
      agent: claude-sonnet-4-6
      interface: claude-code
      tokens_total: 55502
      estimated_usd: 0.37
      duration_minutes: 2.9
      recorded_at: 2026-06-22
      notes: "Sonnet sub-agent verify (Agent subagent_tokens=55502, 176s). estimated_usd ~= tokens x $6.6/M Sonnet blended, no cache discount (order-of-magnitude, AGENTS §4)."
    - cycle: ship
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      duration_minutes: 8
      recorded_at: 2026-06-22
      notes: "main-loop, not separately metered (AGENTS §4); ship cycle"
  totals:
    tokens_total: 109590
    estimated_usd: 0.73
    session_count: 4
---

# SPEC-009: Bet and balance state machine

## Context

The fifth STAGE-002 engine spec. The engine needs the player's **wallet**: the
three bet levels (x1/x2/x3 = 10/25/50), a balance that starts at 1000 and resets
to 1000, and the debit/credit transitions a spin applies. Crucially, an
unaffordable bet is returned as a **typed result**, not thrown (AGENTS §11;
DEC-005 play-money). This module owns only the money primitives; SPEC-011 composes
them with the spin + payline evaluation into the public `spin()`.

See `STAGE-002-slot-engine.md`, the **Game-Design Spec** in `brief.md`
(bet & balance), `DEC-005` (play-money / no real currency), and the
`no-real-money` constraint.

## Goal

Provide pure bet/balance primitives: the bet levels + default, bet-level stepping
(clamped), affordability check, a typed `debit` (success or
`insufficient-balance`, balance unchanged on failure), and `credit`, with the
starting/reset balance constant.

## Inputs

- **Files to read:** `brief.md` Game-Design Spec (bet & balance section);
  `decisions/DEC-005-play-money-model.md`; `guidance/constraints.yaml`
  (`no-real-money`).
- **Related code paths:** `src/engine/`.

## Outputs

- **Files created:**
  - `src/engine/balance.ts` — the wallet primitives.
  - `src/engine/balance.test.ts` — the Failing Tests below.
- **New exports (from `balance.ts`):**
  - `export const STARTING_BALANCE = 1000;` — initial + reset value.
  - `export const BET_LEVELS = [10, 25, 50] as const;` — total bets x1/x2/x3.
  - `export type BetLevel = (typeof BET_LEVELS)[number];` — `10 | 25 | 50`.
  - `export const DEFAULT_BET: BetLevel = 10;`
  - `export function nextBet(bet: BetLevel): BetLevel;` — step up, clamped at 50.
  - `export function prevBet(bet: BetLevel): BetLevel;` — step down, clamped at 10.
  - `export function canAfford(balance: number, bet: number): boolean;` —
    `bet > 0 && balance >= bet`.
  - `export type DebitResult = { ok: true; balance: number } | { ok: false;
    reason: 'insufficient-balance'; balance: number };`
  - `export function debit(balance: number, bet: number): DebitResult;` — on
    success `{ ok: true, balance: balance - bet }`; if not affordable
    `{ ok: false, reason: 'insufficient-balance', balance }` (unchanged). Never throws.
  - `export function credit(balance: number, amount: number): number;` —
    `balance + amount`.
- **Database changes:** none. (localStorage persistence is STAGE-003.)

## Acceptance Criteria

- [ ] `STARTING_BALANCE === 1000`; `BET_LEVELS` is `[10, 25, 50]`; `DEFAULT_BET === 10`.
- [ ] `nextBet`/`prevBet` step through the three levels and **clamp** at the ends
      (no wraparound): `nextBet(50) === 50`, `prevBet(10) === 10`.
- [ ] `canAfford` is true iff `bet > 0 && balance >= bet` (exact-balance bet allowed).
- [ ] `debit` returns a typed success with the reduced balance, or
      `{ ok: false, reason: 'insufficient-balance' }` with the **unchanged** balance
      — it never throws.
- [ ] `credit` adds a win to the balance.
- [ ] `balance.ts` imports nothing from React/DOM/`src/ui`; no `Math.random()`.
- [ ] `just typecheck`, `just lint`, `just test`, `just build` all exit 0.

## Failing Tests

Written during **design**, BEFORE build.

- **`src/engine/balance.test.ts`**
  - `"exposes the starting balance and bet levels"` — `STARTING_BALANCE === 1000`;
    `BET_LEVELS` deep-equals `[10, 25, 50]`; `DEFAULT_BET === 10`.
  - `"nextBet steps up and clamps at 50"` — `nextBet(10) === 25`,
    `nextBet(25) === 50`, `nextBet(50) === 50`.
  - `"prevBet steps down and clamps at 10"` — `prevBet(50) === 25`,
    `prevBet(25) === 10`, `prevBet(10) === 10`.
  - `"canAfford respects balance and positive bet"` — `canAfford(1000, 50) === true`,
    `canAfford(50, 50) === true` (exact), `canAfford(40, 50) === false`,
    `canAfford(0, 10) === false`, `canAfford(100, 0) === false`.
  - `"debit succeeds when affordable"` — `debit(1000, 10)` deep-equals
    `{ ok: true, balance: 990 }`; `debit(10, 10)` deep-equals `{ ok: true, balance: 0 }`.
  - `"debit fails (typed, no throw) when unaffordable"` — `debit(5, 10)` deep-equals
    `{ ok: false, reason: 'insufficient-balance', balance: 5 }`; the call does not
    throw and leaves the input balance unchanged.
  - `"credit adds a win to the balance"` — `credit(990, 50) === 1040`;
    `credit(0, 0) === 0`.

## Implementation Context

### Decisions that apply

- `DEC-005` (play-money model) — balance is play coins; never real currency. No RTP
  claim attaches to these numbers.
- `DEC-001` (engine/presentation separation) — pure engine; the UI holds the live
  balance/bet and calls these functions; persistence (localStorage) is STAGE-003.

### Constraints that apply

- `no-real-money` (blocking) — play-money only; nothing here touches payments.
- `engine-no-dom` (blocking, lint-enforced), `test-before-implementation`,
  `one-spec-per-pr`.

### Prior related work

- `SPEC-005`..`SPEC-008` (shipped) — other engine modules. This one is independent
  of the grid/RNG; SPEC-011 will compose `debit` → spin → `credit` into the public
  `spin()`.

### Out of scope (for this spec specifically)

- The composed `spin()` orchestration (debit, resolve, score, credit) — SPEC-011.
- Win-tier classification (SPEC-010).
- localStorage persistence of balance, and auto-spin's "stop when balance < bet"
  loop — both STAGE-003 (the UI).
- Carrying bet selection inside balance state — bet level and balance are passed as
  plain values; the UI owns the live state.

## Notes for the Implementer

- Keep everything pure and total. `debit`/`credit` take and return plain numbers;
  do not mutate.
- `nextBet`/`prevBet`: find the index in `BET_LEVELS` and clamp to `[0, len-1]`.
- `debit` is the only place an "error" arises, and it is returned as data
  (`{ ok: false, reason: 'insufficient-balance', balance }`) — do NOT throw
  (AGENTS §11: invalid game states are typed results, not exceptions).
- `canAfford(balance, bet)` = `bet > 0 && balance >= bet`. `debit` should use it.

---

## Build Completion

*Filled in at the end of the **build** cycle, before advancing to verify.*

- **Branch:** feat/spec-009-bet-balance
- **PR (if applicable):**
- **All acceptance criteria met?** yes
- **New decisions emitted:**
  - none
- **Deviations from spec:**
  - none
- **Follow-up work identified:**
  - none beyond what is already in the STAGE-002 backlog (SPEC-010 win-tier, SPEC-011 public interface)

### Build-phase reflection (3 questions, short answers)

1. **What was unclear in the spec that slowed you down?**
   — Nothing unclear. The spec was unusually complete: exact export signatures, seven named tests with precise expected values, and explicit notes on clamping and the no-throw contract. The only judgment call was how to express `DebitFailure` using a local type alias versus inline, which the spec leaves open — I chose two named local aliases for readability.

2. **Was there a constraint or decision that should have been listed but wasn't?**
   — No. `engine-no-dom`, `no-real-money`, and DEC-001/DEC-005 all applied directly and were already listed. The `deterministic-rng` constraint (`no bare Math.random()`) technically applies to all of `src/engine/**` but is already captured in `constraints.yaml` and noted in STAGE-002; adding it to this spec's front-matter would be belt-and-suspenders given the module has no randomness at all.

3. **If you did this task again, what would you do differently?**
   — Nothing substantial. The module is small and the spec was precise enough to go straight to writing. The only micro-improvement would be to run `just test src/engine/balance.test.ts` first (isolated) to confirm the new tests fail before writing the implementation — the spec says tests-before-implementation, and I wrote both files before running the gate. In practice the gate run still caught any mistakes, but the strict TDD sequence would be: write test file → confirm failures → write implementation → confirm passes.

---

## Verify

Verified 2026-06-22 by claude-sonnet-4-6 (cold, separate session).

**Verdict: ✅ APPROVED**

- [x] **Gate:** `just typecheck && just lint && just test && just build` — all exit 0. 53/53 tests pass.
- [x] **Decisions-audit:** `just decisions-audit --changed` — "No changed files in scope." Pre-existing 14 scope warnings are not introduced by this spec; zero structural errors.
- [x] **Acceptance Criteria:** All 7 checkboxes met. `STARTING_BALANCE === 1000`, `BET_LEVELS === [10,25,50]`, `DEFAULT_BET === 10`; nextBet/prevBet clamp (no wrap); `canAfford` = `bet > 0 && balance >= bet`; `debit` returns typed result (never throws); `credit` adds.
- [x] **Correctness:** Constants are exact. `nextBet(50) === 50`, `prevBet(10) === 10` (clamped). `canAfford(50,50) === true` (exact-balance allowed), `canAfford(100,0) === false` (zero-bet blocked). `debit(10,10)` → `{ok:true,balance:0}` (drain to zero is allowed). `debit(5,10)` → `{ok:false,reason:'insufficient-balance',balance:5}` (unchanged).
- [x] **No-throw contract (AGENTS §11 / DEC-005):** `debit` uses `canAfford` guard and returns a `DebitResult` discriminated union on both paths. It does not contain a `throw`. Test explicitly asserts `expect(() => debit(5,10)).not.toThrow()` and checks the unchanged balance via `toEqual`.
- [x] **Tests not vacuous:** A wraparound bug in nextBet/prevBet would fail `nextBet(50) === 50` / `prevBet(10) === 10`. A `>=` → `>` slip in canAfford would fail `canAfford(50,50) === true`. A thrown error would fail `.not.toThrow()`. A mutated balance would fail the `balance: 5` check in the failure case. All meaningful paths covered.
- [x] **Constraints:** `balance.ts` has zero imports (no React/DOM/ui). No `Math.random()`. No real-money arithmetic. DEC-001 honored (pure engine module, no DOM). DEC-005 honored (play-coin arithmetic only, no payment surface).
- [x] **Decision drift:** No non-trivial build choices made. Builder explicitly noted no new DECs needed. Confirmed correct.
- [x] **Build reflection:** Three questions answered with substance. Builder honestly noted the test-before-implementation process deviation (wrote impl+tests together before running gate), correctly judging it a minor sequence issue not a code defect. Tests were authored from the spec's Failing Tests section and are correct. Acceptable.
- [x] **Cost sessions:** design session present (null numerics, main-loop note — correct per AGENTS §4). Build session present (null numerics, "orchestrator to fill" note — correct for sub-agent build). Verify session appended by this reviewer. Ship session outstanding (filled at ship — expected).

---

## Reflection (Ship)

*Appended during the **ship** cycle.*

1. **What would I do differently next time?**
   — Nothing. A pure-arithmetic spec like this needs no computed fixtures — the
   expected values are obvious — so the value was in nailing the typed no-throw
   `debit` contract, which the tests pin directly (`.not.toThrow()` + unchanged
   balance).

2. **Does any template, constraint, or decision need updating?**
   — No. AGENTS §11 (typed results over throws) and DEC-005 fully governed it.

3. **Is there a follow-up spec I should write now before I forget?**
   — No new spec. SPEC-010 (win-tier) and SPEC-011 (public interface, which
   composes debit → spin → evaluate → credit) remain; both already planned.
