# SPEC-011 — BUILD prompt (fresh session — Sonnet)

> Run on **claude-sonnet-4-6** (AGENTS §8).

```
Cycle: build. You are NOT the architect. The spec file is your only context.

Read in order:
1. /AGENTS.md (§5, §11 — UI imports engine only via index.ts; §12).
2. /projects/PROJ-001-animal-slots/specs/SPEC-011-public-engine-interface.md —
   ENTIRE Implementation Context, Acceptance Criteria, Failing Tests (with the
   pinned full-spin fixtures), and Notes for the Implementer (the compose order).
3. /projects/PROJ-001-animal-slots/stages/STAGE-002-slot-engine.md
4. /decisions/DEC-001, /decisions/DEC-002, /decisions/DEC-005.
5. ALL of src/engine/: rng.ts, strips.ts, spin.ts, paylines.ts, balance.ts, tiers.ts.
6. /guidance/constraints.yaml — engine-no-dom, deterministic-rng, test-before-implementation, one-spec-per-pr.

Before coding, branch and mark build `[~]` in the SPEC-011 timeline. If something
needs architect judgment, set `[?]` with a one-line reason and stop.

Branch: git checkout -b feat/spec-011-engine-interface

Implement EXACTLY the spec in src/engine/index.ts:
- SpinResult interface, SpinOutcome union, spin({seed,balance,bet}) composing in the
  spec's order (debit → if !ok return insufficient-balance with ORIGINAL balance →
  resolveGrid(createRng(seed)) → evaluatePaylines → credit → classifyWin → return
  ok:true result). NEVER throws on unaffordable.
- Re-export the listed public surface (types: SymbolId, Tier, Grid, LineId, Payline,
  LineWin, WinTier, BetLevel; values: SYMBOLS, SYMBOL_TIER, PAYLINES, PAYTABLE,
  BET_LEVELS, DEFAULT_BET, STARTING_BALANCE, nextBet, prevBet, canAfford).
- Create src/engine/index.test.ts with ALL Failing Tests, incl. the pinned fixtures
  (seed 12345 → none/balance 990/grid; seed 12 → small/10/balance 1000; seed 276 →
  big/55/balance 1045/3 lineWins; insufficient-balance; determinism; re-exports).
- Import only engine modules. No React/DOM/src-ui, no Math.random, no new deps.

Gate (all exit 0): just typecheck && just lint && just test && just build

When done:
1. Fill "## Build Completion" (incl. 3 honest reflection answers).
2. Append a build cost session (cycle: build, agent: claude-sonnet-4-6, interface:
   claude-code, tokens_total null + "orchestrator to fill" note).
3. Mark build `[~]` only.
DO NOT git push / open a PR / run gh / run just advance-cycle.
```
