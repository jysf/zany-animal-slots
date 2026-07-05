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
- [~] **build** — Sonnet sub-agent (local only): apply the drop-in signature changes + thread
      the machine; make the parity guard green; keep every pinned fixture byte-identical and
      tiers.ts unchanged.
- [ ] **verify** — Sonnet sub-agent (cold review): full gate re-run + AC-by-AC + frozen-seed
      parity confirmation + tiers.ts-diff-empty + no-module-constant-reads + no-UI-change +
      DEC-001/no-cycle checks.
- [ ] **ship** — Opus (orchestrator): PR, CI-poll, squash-merge, cost totals, bookkeeping,
      archive; update STAGE-007 backlog line + count.
