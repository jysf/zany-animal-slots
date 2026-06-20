# SPEC-008 — BUILD prompt (fresh session — Sonnet)

> Run on **claude-sonnet-4-6** (AGENTS §8).

```
Cycle: build. You are NOT the architect. The spec file is your only context.

Read in order:
1. /AGENTS.md (§5, §11, §12).
2. /projects/PROJ-001-animal-slots/specs/SPEC-008-payline-and-paytable-evaluation.md
   — ENTIRE Implementation Context, Acceptance Criteria, Failing Tests (with the
   exact grids + expected payouts), and Notes for the Implementer.
3. /projects/PROJ-001-animal-slots/stages/STAGE-002-slot-engine.md
4. /decisions/DEC-001, /decisions/DEC-003, /decisions/DEC-011.
5. /src/engine/spin.ts (Grid) and /src/engine/strips.ts (SymbolId, Tier, SYMBOL_TIER).
6. /guidance/constraints.yaml — engine-no-dom, test-before-implementation, one-spec-per-pr.

Before coding, branch and mark build `[~]` in the SPEC-008 timeline. If something
needs architect judgment, set `[?]` with a one-line reason and stop.

Branch: git checkout -b feat/spec-008-payline-eval

Implement EXACTLY the spec in src/engine/paylines.ts:
- LineId, Payline, PAYLINES (the 5 DEC-003 lines), PAYTABLE (DEC-011:
  low [0.5,2,5], mid [1,4,12], high [3,10,40], jackpot [8,40,200]),
  LineWin, PaylineResult, lineSymbols(grid, line), evaluatePaylines(grid, totalBet).
- A line pays only the left-anchored run (>=3) of its reel-0 symbol;
  amount = Math.floor(multiplier * totalBet); totalWin = sum of line wins.
- Create src/engine/paylines.test.ts with ALL Failing Tests from the spec
  (every grid + expected total/lineWins, incl. the floor-rounding and
  run-must-start-at-reel-0 cases).
- Import only from ./spin and ./strips. No React/DOM/src-ui, no Math.random, no deps.

Gate (all exit 0): just typecheck && just lint && just test && just build

When done:
1. Fill "## Build Completion" (incl. 3 honest reflection answers).
2. Append a build cost session (cycle: build, agent: claude-sonnet-4-6, interface:
   claude-code, tokens_total null + "orchestrator to fill" note).
3. Mark build `[~]` only.
DO NOT git push / open a PR / run gh / run just advance-cycle.
```
