---
# Maps to ContextCore task.* semantic conventions.
# This variant assumes Claude plays every role. The context normally
# in a separate handoff doc lives in the ## Implementation Context
# section below.

task:
  id: SPEC-039
  type: story                      # epic | story | task | bug | chore
  cycle: build  # frame | design | build | verify | ship
  blocked: false
  priority: medium
  complexity: M                    # S | M | L  (L means split it)

project:
  id: PROJ-002
  stage: STAGE-007
repo:
  id: animal-slots

agents:
  architect: claude-opus-4-8       # design/frame: Opus (judgement-heavy). See AGENTS §8.
  implementer: claude-sonnet-4-6   # build/verify: Sonnet (execution against the spec)
  created_at: 2026-07-04

references:
  decisions:
    - DEC-015                       # config-driven machine model — engine consumes the math slice
    - DEC-001                       # engine-no-dom boundary must survive (machine = plain data)
    - DEC-002                       # deterministic RNG — the frozen seeds are the parity contract
    - DEC-003                       # fixed paylines — now read from the machine, not the module
    - DEC-011                       # paytable/weights — now read from the machine, not the module
  constraints:
    - engine-no-dom
    - deterministic-rng
    - test-before-implementation
    - one-spec-per-pr
    - no-new-top-level-deps-without-decision
  related_specs:
    - SPEC-038                       # pinned the Machine type + WILD_AND_WHIMSICAL_MATH (consumed here)
    - SPEC-007                       # the 5×3 spin resolver being parameterized
    - SPEC-008                       # payline + paytable evaluation being parameterized

# One sentence on what this spec contributes to its stage's
# value_contribution. For plumbing: "infrastructure enabling
# STAGE-007's <capability>". Optional; null is acceptable.
value_link: "The riskiest STAGE-007 spec and the first to change an engine signature: resolveGrid + evaluatePaylines stop reading module-level STRIPS/PAYLINES/PAYTABLE/SYMBOL_TIER and instead consume the machine's math slice (SPEC-038's WILD_AND_WHIMSICAL_MATH), with spin() threading it. Gated by the four frozen seeds so behavior stays byte-identical while the engine becomes data-driven."

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
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      duration_minutes: 35
      recorded_at: 2026-07-04
      notes: "main-loop, not separately metered (AGENTS §4); design cycle (parameterize resolveGrid + evaluatePaylines to consume the machine's math slice; spin() threads a defaulted machine; remove module-constant reads/defaults; write the frozen-seed parity failing test + update the existing engine unit-test call sites; build prompt). Riskiest spec — first engine signature change."
    - cycle: build
      agent: claude-sonnet-4-6
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      duration_minutes: 20
      recorded_at: 2026-07-04
      notes: "orchestrator to fill tokens_total from subagent_tokens. Build sub-agent (local only, no push/PR/gh/advance-cycle): applied the drop-in signature changes verbatim — resolveStops/resolveGrid read math.strips, evaluatePaylines reads math.paylines/symbolTier/paytable, spin() threads a defaulted machine param; type-only MachineMath imports in spin.ts + paylines.ts to avoid the paylines↔machine runtime cycle. Added spin-parity.test.ts (5 tests, frozen-seed guard + default-equals-explicit). Updated call sites in spin.test.ts/paylines.test.ts (outcomes unchanged) and added the jackpot case to index.test.ts. Full gate green (typecheck/lint/test 292 passed/build/validate); tiers.ts diff confirmed empty; no STRIPS/PAYLINES/PAYTABLE/SYMBOL_TIER reads left in the three parameterized function bodies."
  totals:
    tokens_total: 0
    estimated_usd: 0
    session_count: 0
---

# SPEC-039: parameterize resolveGrid and evaluatePaylines

## Context

Second spec of `STAGE-007` (config-driven machine model) and **the riskiest** — the
first to change an engine **signature**. SPEC-038 pinned the `Machine` type and shipped
`WILD_AND_WHIMSICAL_MATH` (the default machine's math slice) as pure data that
*references* today's constants, but changed no engine logic. This spec makes the grid
resolver and payline evaluator actually **consume** that math slice instead of reading
module-level constants: `resolveGrid` reads `math.strips`, and `evaluatePaylines` reads
`math.paylines` / `math.paytable` / `math.symbolTier`. `spin()` threads the machine
through (defaulted to `WILD_AND_WHIMSICAL_MATH` so the UI keeps working until SPEC-042
wires the hook).

STAGE-007 deliberately **unfroze** the engine; every change is gated by the four
**frozen seeds** (the parity contract). Because this spec changes real engine behavior
paths, it leads with those seeds: **407947** → five Wolves, totalWin 2000, jackpot;
**12345** → 0, none; **276** → 55, big, 3 lines; **12** → 10, small. They must produce
byte-identical grids / lineWins / totalWin / tier through the default machine after the
change. `classifyWin` (the jackpot rule + big boundary) stays hard-coded here — SPEC-040
parameterizes it; SPEC-043 consolidates the full machine-parity contract test.

See `STAGE-007` (backlog slot 2 of 6, "← riskiest; watch"), `PROJ-002`, DEC-015
(config-driven machine model), DEC-002 (the deterministic RNG whose seeds are the guard).

## Goal

Make `resolveGrid` and `evaluatePaylines` consume the machine's math slice (`strips` /
`paylines` / `paytable` / `symbolTier`) instead of module-level constants, and have
`spin()` thread the machine (defaulted to `WILD_AND_WHIMSICAL_MATH`) — changing no
observable behavior, proven by the four frozen seeds producing byte-identical outcomes
through the default machine.

## Inputs

- **Files to read:**
  - `src/engine/spin.ts` — `resolveStops` / `resolveGrid` (parameterize; today default to
    module `STRIPS`).
  - `src/engine/paylines.ts` — `evaluatePaylines` (reads module `PAYLINES` / `PAYTABLE` /
    imported `SYMBOL_TIER`; parameterize to read from the machine).
  - `src/engine/machine.ts` — `MachineMath` type + `WILD_AND_WHIMSICAL_MATH` (SPEC-038;
    the slice consumed here).
  - `src/engine/index.ts` — `spin()` composition (thread the machine).
  - `src/engine/index.test.ts`, `src/engine/spin.test.ts`, `src/engine/paylines.test.ts`
    — the existing unit tests whose call sites need the new signatures (outcomes unchanged).
  - `src/engine/tiers.ts` — **unchanged** here (jackpot rule / big boundary are SPEC-040);
    read only to confirm `classifyWin`'s signature stays as-is.
- **External APIs:** none.
- **Related code paths:** `src/engine/` only. No UI/hook change (that's SPEC-042).

## Outputs

- **Files created:**
  - `src/engine/spin-parity.test.ts` — the SPEC-039 frozen-seed parity guard (four seeds
    through the default machine == through an explicit `WILD_AND_WHIMSICAL_MATH`, with
    pinned totalWin/tier).
- **Files modified:**
  - `src/engine/spin.ts` — `resolveStops(rng, strips)` loses its `= STRIPS` default;
    `resolveGrid(rng, math: MachineMath)` reads `math.strips`. `import type { MachineMath }
    from './machine'`. Remove the now-unused module `STRIPS` import if it becomes unused.
  - `src/engine/paylines.ts` — `evaluatePaylines(grid, totalBet, math: MachineMath)` reads
    `math.paylines` / `math.paytable` / `math.symbolTier`. `import type { MachineMath }
    from './machine'`. Drop the now-unused `SYMBOL_TIER` **value** import (keep `type Tier`,
    `type SymbolId`). The module `PAYLINES` / `PAYTABLE` consts remain exported (still
    referenced by the machine) — just no longer read by `evaluatePaylines`.
  - `src/engine/index.ts` — `spin({ seed, balance, bet, machine = WILD_AND_WHIMSICAL_MATH })`
    threads `machine` into `resolveGrid` + `evaluatePaylines`. `import { WILD_AND_WHIMSICAL_MATH }`
    + `import type { MachineMath }` from `./machine`. `classifyWin` call unchanged.
  - `src/engine/spin.test.ts`, `src/engine/paylines.test.ts` — update call sites to pass
    the machine slice; **expected outcomes unchanged** (parity).
  - `src/engine/index.test.ts` — add a jackpot-seed (407947 → totalWin 2000, tier jackpot,
    five WOLF) assertion; existing spin() cases stay (they exercise the default machine).
- **New exports:** none new to the public surface; `resolveGrid` / `evaluatePaylines` /
  `spin` signatures change (see above).
- **Database changes:** none. **New dependency:** none. **New decision:** none (DEC-015 covers it).

## Acceptance Criteria

- [ ] **`resolveGrid` consumes the machine:** `resolveGrid(rng, math: MachineMath)` reads
      `math.strips` (via `resolveStops(rng, math.strips)` and `visibleCells(math.strips[reel],
      stop)`); it no longer defaults to or reads the module `STRIPS`. `resolveStops(rng,
      strips)` has no `= STRIPS` default.
- [ ] **`evaluatePaylines` consumes the machine:** `evaluatePaylines(grid, totalBet, math:
      MachineMath)` iterates `math.paylines` and reads `math.symbolTier[s0]` +
      `math.paytable[tier][count-3]`; it no longer reads module `PAYLINES` / `PAYTABLE` /
      imported `SYMBOL_TIER`.
- [ ] **`spin` threads the machine:** `spin({ seed, balance, bet, machine })` with `machine:
      MachineMath` defaulting to `WILD_AND_WHIMSICAL_MATH`; it passes `machine` to
      `resolveGrid` and `evaluatePaylines`. Calling `spin({ seed, balance, bet })` (no
      machine) still works and is identical to passing the default explicitly.
- [ ] **Frozen-seed parity (the gate):** through the default machine, seed **407947** →
      totalWin 2000 / tier jackpot / a five-WOLF line; **12345** → totalWin 0 / tier none /
      the pinned grid; **276** → totalWin 55 / tier big / 3 lineWins; **12** → totalWin 10 /
      tier small. For each seed, `spin({...})` deep-equals `spin({..., machine:
      WILD_AND_WHIMSICAL_MATH })`.
- [ ] **No module-constant reads left in the two functions:** neither `resolveGrid`/
      `resolveStops` nor `evaluatePaylines` references `STRIPS`, `PAYLINES`, `PAYTABLE`, or
      `SYMBOL_TIER` at runtime (verified by reading the source; the machine slice is the
      only source).
- [ ] **DEC-001 intact:** no new React/DOM import; `machine` is plain data (`MachineMath`);
      `src/test/engine-boundary.test.ts` passes. The `MachineMath` import in `spin.ts` /
      `paylines.ts` is **type-only** (`import type`) so the machine↔paylines module cycle is
      erased at runtime.
- [ ] **`classifyWin` untouched:** `src/engine/tiers.ts` is byte-for-byte unchanged; the
      jackpot rule + big boundary stay hard-coded (SPEC-040 parameterizes them).
- [ ] Full gate green (`just typecheck && just lint && just test && just build`); all
      pre-existing engine tests still pass with updated call sites; no new dependency;
      `just validate` passes.

## Failing Tests

Written during **design**, BEFORE build. The implementer makes these pass by threading the
machine slice (drop-in guidance in **Notes**). Existing tests whose call sites change keep
their **exact** expected values — that identity IS the parity proof.

- **`src/engine/spin-parity.test.ts`** (new — the SPEC-039 frozen-seed guard). Imports
  `spin` from `./index` and `WILD_AND_WHIMSICAL_MATH` from `./machine`.
  - `"seed 407947 → jackpot 2000 through the default machine"` — `spin({ seed: 407947,
    balance: 1000, bet: 10 })` is `ok`, `totalWin === 2000`, `tier === 'jackpot'`, and some
    `lineWins` entry has `symbol === 'WOLF'` and `count === 5`.
  - `"seed 12345 → losing (0 / none)"` — `totalWin === 0`, `tier === 'none'`.
  - `"seed 276 → big, 55, 3 lines"` — `totalWin === 55`, `tier === 'big'`, `lineWins.length
    === 3`.
  - `"seed 12 → small, 10"` — `totalWin === 10`, `tier === 'small'`.
  - `"explicit machine equals the default for every frozen seed"` — for each seed in
    `[407947, 12345, 276, 12]`, `spin({ seed, balance: 1000, bet: 10 })` deep-equals
    `spin({ seed, balance: 1000, bet: 10, machine: WILD_AND_WHIMSICAL_MATH })`.
- **`src/engine/spin.test.ts`** (update call sites; outcomes unchanged) — pass the machine
  slice: `resolveStops(rng, WILD_AND_WHIMSICAL_MATH.strips)` and `resolveGrid(createRng(n),
  WILD_AND_WHIMSICAL_MATH)`. The pinned stops `[34,10,16,28,17]` for seed 12345 and the
  pinned seed-12345 grid stay identical.
- **`src/engine/paylines.test.ts`** (update call sites; outcomes unchanged) — every
  `evaluatePaylines(grid, bet)` becomes `evaluatePaylines(grid, bet,
  WILD_AND_WHIMSICAL_MATH)`; all expected `totalWin` / `lineWins` values stay identical.
- **`src/engine/index.test.ts`** (add one case; existing cases unchanged) — add
  `"a jackpot spin credits 2000 and classifies jackpot"`: `spin({ seed: 407947, balance:
  1000, bet: 10 })` → `totalWin === 2000`, `tier === 'jackpot'`, `balance === 1000 - 10 +
  2000 === 2990`.

## Implementation Context

*Read this section (and the files it points to) before starting the build cycle.*

### Decisions that apply

- `DEC-015` — config-driven machine model: the engine consumes the machine's **math** slice.
  This spec is where `resolveGrid` / `evaluatePaylines` start doing so.
- `DEC-001` — engine-no-dom: `machine` is plain data (`MachineMath`); no DOM crosses in.
- `DEC-002` — deterministic RNG: the four frozen seeds are the parity contract; draw order
  (reel 0→4, one draw per reel) must not change.
- `DEC-003` / `DEC-011` — the paylines / paytable+weights now read from the machine instead
  of the module constants; their values are unchanged (they live on inside the default machine).

### Constraints that apply

- `engine-no-dom` — no React/DOM in the engine; keep the boundary test green.
- `deterministic-rng` — no change to RNG or draw order; parity depends on it.
- `test-before-implementation` — the parity test + updated call sites are the design's
  failing tests; build makes them green.
- `one-spec-per-pr` — only the grid + payline parameterization + spin threading + their
  tests. No `classifyWin` change, no UI change.
- `no-new-top-level-deps-without-decision` — none.

### Prior related work

- `SPEC-038` (shipped) — the `Machine` type + `WILD_AND_WHIMSICAL_MATH` consumed here.
- `SPEC-007` (the 5×3 resolver) and `SPEC-008` (payline+paytable evaluation) — the functions
  being parameterized; their pinned fixtures are the parity anchors.

### Out of scope (for this spec specifically)

- **`classifyWin` / jackpot rule / big boundary** — `src/engine/tiers.ts` stays byte-identical.
  Parameterizing the jackpot symbol/count and `bigMultiple` is **SPEC-040**.
- **UI / hook plumbing** — `useSlotMachine` still calls `spin({ seed, balance, bet })`
  (relying on the default machine). Threading the active machine from the hook is **SPEC-042**.
- **Deleting the module `STRIPS` / `PAYLINES` / `PAYTABLE` / `SYMBOL_TIER` constants** — they
  remain (the default machine references them). Retiring them is a later cleanup once nothing
  reads them directly.
- **Per-reel asymmetric strips, more rows/reels, more paylines** — the machine has the fields
  (`reelCount`, `rows`) but this spec keeps behavior identical; new geometry is STAGE-008+.

## Notes for the Implementer

- **The parity anchor is identity.** Every existing engine test that changes only its call
  site MUST keep its exact expected values. If any pinned grid/stop/totalWin/tier changes,
  you have introduced a behavior change — stop and set the timeline `[?]`.
- **Type-only import to avoid a runtime cycle.** `machine.ts` imports **values** from
  `paylines.ts` (`PAYLINES`, `PAYTABLE`); `paylines.ts` now needs the `MachineMath` **type**
  from `machine.ts`. Import it as `import type { MachineMath } from './machine'` — a type-only
  edge is erased at runtime, so no import cycle exists. Same in `spin.ts`.
- **Drop-in — `src/engine/spin.ts`:**
  ```ts
  import { type Rng, randomInt } from './rng';
  import { type SymbolId, visibleCells } from './strips';
  import type { MachineMath } from './machine';

  export type Grid = SymbolId[][];

  /** Draw one stop index per reel (reel 0→4), one PRNG draw each. Draw order is
   *  load-bearing for the frozen seeds — do not reorder. */
  export function resolveStops(
    rng: Rng,
    strips: readonly (readonly SymbolId[])[],
  ): number[] {
    return strips.map((strip) => randomInt(rng, strip.length));
  }

  /** Resolve the visible 5×3 Grid for a spin from the machine's strips. */
  export function resolveGrid(rng: Rng, math: MachineMath): Grid {
    const stops = resolveStops(rng, math.strips);
    return stops.map((stop, reel) => visibleCells(math.strips[reel], stop) as SymbolId[]);
  }
  ```
  (Note: `STRIPS` is no longer imported in `spin.ts`. Keep `visibleCells` + `SymbolId`.)
- **Drop-in — `src/engine/paylines.ts`** `evaluatePaylines` (and imports):
  ```ts
  import type { Grid } from './spin';
  import { type SymbolId, type Tier } from './strips';   // SYMBOL_TIER value import removed
  import type { MachineMath } from './machine';
  // ... Payline / LineId / PAYLINES / PAYTABLE / LineWin / PaylineResult / lineSymbols
  //     stay exactly as they are (PAYLINES/PAYTABLE consts remain exported) ...

  export function evaluatePaylines(
    grid: Grid,
    totalBet: number,
    math: MachineMath,
  ): PaylineResult {
    const lineWins: LineWin[] = [];
    let totalWin = 0;

    for (const line of math.paylines) {
      const symbols = lineSymbols(grid, line);
      const s0 = symbols[0];

      let run = 1;
      for (let reel = 1; reel < symbols.length; reel++) {
        if (symbols[reel] === s0) run++;
        else break;
      }

      if (run >= 3) {
        const count = run as 3 | 4 | 5;
        const tier: Tier = math.symbolTier[s0];
        const multiplier = math.paytable[tier][count - 3];
        const amount = Math.floor(multiplier * totalBet);
        lineWins.push({ line: line.id, symbol: s0, count, multiplier, amount });
        totalWin += amount;
      }
    }
    return { lineWins, totalWin };
  }
  ```
  `lineSymbols(grid, line)` is unchanged and still takes a `Payline`. The module `PAYLINES`
  / `PAYTABLE` / `SYMBOL_TIER` are no longer *read by evaluatePaylines*; leave the
  `PAYLINES`/`PAYTABLE` exports in place (the machine references them and `index.ts`
  re-exports them). Only the `SYMBOL_TIER` **value** import in `paylines.ts` becomes unused —
  remove it to satisfy `no-unused-vars`.
- **Drop-in — `src/engine/index.ts`** `spin`:
  ```ts
  import { WILD_AND_WHIMSICAL_MATH } from './machine';
  import type { MachineMath } from './machine';
  // ... existing imports ...

  export function spin(args: {
    seed: number;
    balance: number;
    bet: BetLevel;
    machine?: MachineMath;
  }): SpinOutcome {
    const { seed, balance, bet, machine = WILD_AND_WHIMSICAL_MATH } = args;

    const d = debit(balance, bet);
    if (!d.ok) return { ok: false, reason: 'insufficient-balance', balance };

    const grid = resolveGrid(createRng(seed), machine);
    const { lineWins, totalWin } = evaluatePaylines(grid, bet, machine);
    const newBalance = credit(d.balance, totalWin);
    const tier = classifyWin(totalWin, bet, lineWins);   // unchanged — SPEC-040 parameterizes

    return { ok: true, grid, lineWins, totalWin, balance: newBalance, tier, bet };
  }
  ```
  Keep the existing doc-comment; update it to note the machine param + default. The public
  `SpinResult`/`SpinOutcome` types are unchanged.
- **Updating the existing tests (mechanical, outcomes identical):**
  - `spin.test.ts`: `import { WILD_AND_WHIMSICAL_MATH } from './machine';` then
    `resolveStops(rng)` → `resolveStops(rng, WILD_AND_WHIMSICAL_MATH.strips)` and
    `resolveGrid(createRng(n))` → `resolveGrid(createRng(n), WILD_AND_WHIMSICAL_MATH)`. The
    "each grid column equals visibleCells" test may keep using `STRIPS[reel]` (import stays)
    or switch to `WILD_AND_WHIMSICAL_MATH.strips[reel]` — both are the same reference.
  - `paylines.test.ts`: `import { WILD_AND_WHIMSICAL_MATH } from './machine';` then add
    `, WILD_AND_WHIMSICAL_MATH` as the 3rd arg to every `evaluatePaylines(...)` call. Do not
    change any expected value.
  - `index.test.ts`: add the jackpot-seed case; leave the others as-is.
- **Repo toolchain gotchas:** ESLint has NO react-hooks plugin (no exhaustive-deps disables);
  NO `@testing-library/user-event`; `vi.fn()` factories use no named params (N/A here); test
  files with JSX must be `.tsx` — all engine tests here are `.ts` (no JSX), correct. `tsconfig`
  `include` is `["src"]` so everything is typechecked. No new dependency; touch only
  `src/engine/**`.
- **Self-check before you finish:** `git diff main..HEAD -- src/engine/tiers.ts` is EMPTY
  (classifyWin untouched), and `grep -nE 'STRIPS|PAYLINES|PAYTABLE|SYMBOL_TIER'
  src/engine/spin.ts src/engine/paylines.ts` shows those names only in unchanged
  export/definition lines (paylines.ts still *defines* PAYLINES/PAYTABLE) — NOT inside
  `resolveGrid`/`resolveStops`/`evaluatePaylines` bodies.

---

## Build Completion

*Filled in at the end of the **build** cycle, before advancing to verify.*

- **Branch:** `feat/spec-039-parameterize-grid-payline`
- **PR (if applicable):** none — local-only build cycle per orchestrator instructions;
  PR deferred to ship.
- **All acceptance criteria met?** yes
- **New decisions emitted:**
  - none (DEC-015 covers it, as anticipated)
- **Deviations from spec:**
  - none. Implemented the drop-in code from the spec's Notes verbatim for
    `spin.ts`, `paylines.ts`, and `index.ts`. `spin.test.ts` kept its
    `STRIPS`-based "each grid column equals visibleCells" assertion (the spec
    explicitly allowed either that or switching to
    `WILD_AND_WHIMSICAL_MATH.strips[reel]` — both are the same reference), and
    added `WILD_AND_WHIMSICAL_MATH` as the 3rd/2nd arg elsewhere as specified.
- **Follow-up work identified:**
  - none new — SPEC-040 (parameterize `classifyWin`) and SPEC-042 (UI/hook
    threading) remain as already scheduled in the STAGE-007 backlog.

### Build-phase reflection (3 questions, short answers)

Process-focused: how did the build go? What friction did the spec create?

1. **What was unclear in the spec that slowed you down?**
   — Nothing was unclear; the drop-in code blocks in the Notes section matched
   the acceptance criteria and failing-test descriptions exactly, so this was a
   mechanical, low-ambiguity build. The only judgment call (keep `STRIPS` import
   in `spin.test.ts`'s visibleCells test vs. switch to
   `WILD_AND_WHIMSICAL_MATH.strips`) was already pre-resolved by the spec as an
   explicit either/or.

2. **Was there a constraint or decision that should have been listed but wasn't?**
   — No. The hard constraints (type-only `MachineMath` import to avoid the
   paylines↔machine runtime cycle, tiers.ts byte-identical, no
   STRIPS/PAYLINES/PAYTABLE/SYMBOL_TIER reads in the three function bodies) were
   all called out explicitly and were sufficient to self-verify before finishing.

3. **If you did this task again, what would you do differently?**
   — Nothing procedurally; the mechanical regex substitution for
   `evaluatePaylines(grid, N)` → `evaluatePaylines(grid, N, WILD_AND_WHIMSICAL_MATH)`
   across `paylines.test.ts`'s 9 call sites was fast and safe since the pattern
   was uniform. Would keep the same approach (scripted substitution + full-file
   diff review) on future mechanical call-site updates.

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
