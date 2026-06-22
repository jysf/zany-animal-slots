# SPEC-009 — BUILD prompt (fresh session — Sonnet)

> Run on **claude-sonnet-4-6** (AGENTS §8).

```
Cycle: build. You are NOT the architect. The spec file is your only context.

Read in order:
1. /AGENTS.md (§5, §11 — invalid states are typed results not throws, §12).
2. /projects/PROJ-001-animal-slots/specs/SPEC-009-bet-and-balance-state-machine.md
   — ENTIRE Implementation Context, Acceptance Criteria, Failing Tests, Notes.
3. /projects/PROJ-001-animal-slots/stages/STAGE-002-slot-engine.md
4. /decisions/DEC-001, /decisions/DEC-005.
5. /guidance/constraints.yaml — engine-no-dom, no-real-money, test-before-implementation, one-spec-per-pr.

Before coding, branch and mark build `[~]` in the SPEC-009 timeline. If something
needs architect judgment, set `[?]` with a one-line reason and stop.

Branch: git checkout -b feat/spec-009-bet-balance

Implement EXACTLY the spec in src/engine/balance.ts:
- STARTING_BALANCE = 1000, BET_LEVELS = [10,25,50] as const, BetLevel type,
  DEFAULT_BET = 10, nextBet/prevBet (clamped, no wrap), canAfford, DebitResult
  union, debit (typed result, NEVER throws, balance unchanged on failure), credit.
- Create src/engine/balance.test.ts with ALL seven Failing Tests.
- Pure/total functions, no mutation. No React/DOM/src-ui imports, no Math.random, no deps.

Gate (all exit 0): just typecheck && just lint && just test && just build

When done:
1. Fill "## Build Completion" (incl. 3 honest reflection answers).
2. Append a build cost session (cycle: build, agent: claude-sonnet-4-6, interface:
   claude-code, tokens_total null + "orchestrator to fill" note).
3. Mark build `[~]` only.
DO NOT git push / open a PR / run gh / run just advance-cycle.
```
