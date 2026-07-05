# SPEC-039 timeline

Architect appends as cycles are designed. Executors update status as
they go. Status markers: `[ ]` not started · `[~]` in progress · `[x]` complete · `[?]` blocked.

Cycle prompts live in `prompts/SPEC-039-<cycle>.md`.

## Instructions

- [x] **design** — completed 2026-07-04 (Opus): the riskiest STAGE-007 spec (first engine
      signature change). Parameterized `resolveGrid(rng, math)` to read `math.strips` and
      `evaluatePaylines(grid, bet, math)` to read `math.paylines`/`symbolTier`/`paytable`
      instead of module constants; `spin({seed,balance,bet,machine=WILD_AND_WHIMSICAL_MATH})`
      threads the slice (so the UI keeps working until SPEC-042). `classifyWin`/`tiers.ts`
      untouched (SPEC-040). Wrote the frozen-seed parity guard `spin-parity.test.ts` (407947→
      2000/jackpot, 12345→0, 276→55/big/3, 12→10/small; explicit==default) + specified the
      mechanical call-site updates to spin.test/paylines.test/index.test (outcomes identical
      = the parity proof). Type-only `import type { MachineMath }` avoids the paylines↔machine
      runtime cycle. Build prompt written. No new DEC (DEC-015 covers it).
- [x] **build** — completed 2026-07-04 (Sonnet sub-agent, local only): applied the drop-in
      signature changes verbatim — resolveGrid/resolveStops read `math.strips`, evaluatePaylines
      reads `math.paylines`/`symbolTier`/`paytable`, spin() threads a defaulted machine; type-only
      `MachineMath` imports avoid the paylines↔machine runtime cycle. Added spin-parity.test.ts
      (5 tests) + mechanical call-site updates + the index.test jackpot case. Full gate green
      (292 tests); tiers.ts diff empty; no module-constant reads left in the three functions.
      Branch feat/spec-039-parameterize-grid-payline, commit 0cef3cd. subagent_tokens=106662, 304s.
- [x] **verify** — Sonnet sub-agent (cold review): PASS, 0 defects. Full gate green (292
      tests incl. spin-parity.test.ts 5/5); all four frozen seeds byte-identical through
      default vs explicit machine; spin.test/paylines.test/index.test diffs confirmed
      mechanical-only (call-site args/imports, zero expected-value changes); no
      STRIPS/PAYLINES/PAYTABLE/SYMBOL_TIER reads in resolveGrid/resolveStops/evaluatePaylines
      bodies; type-only MachineMath imports in both spin.ts/paylines.ts; tiers.ts diff empty;
      useSlotMachine.ts untouched; no new dep.
- [x] **ship** — completed 2026-07-04 (Opus): squash-merged PR #47 (CI CLEAN — cost-capture,
      app-checks, supply-chain, Workers build all green), cost totals (196210 tok / $1.29 /
      5 sessions), ship reflection, archived. Second STAGE-007 spec shipped (2/6); the engine
      now consumes the machine's math slice for grid + payline eval, all four frozen seeds
      byte-identical. SPEC-040 (parameterize win-tier + jackpot rule) is next.
