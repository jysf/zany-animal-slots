# SPEC-010 — BUILD prompt (fresh session — Sonnet)

> Run on **claude-sonnet-4-6** (AGENTS §8).

```
Cycle: build. You are NOT the architect. The spec file is your only context.

Read in order:
1. /AGENTS.md (§5, §11, §12, §14 glossary "Win tier").
2. /projects/PROJ-001-animal-slots/specs/SPEC-010-win-tier-classification.md —
   ENTIRE Implementation Context, Acceptance Criteria, Failing Tests, Notes.
3. /projects/PROJ-001-animal-slots/stages/STAGE-002-slot-engine.md
4. /decisions/DEC-001, /decisions/DEC-003.
5. /src/engine/paylines.ts (LineWin) and /src/engine/strips.ts (WOLF/SymbolId).
6. /guidance/constraints.yaml — engine-no-dom, test-before-implementation, one-spec-per-pr.

Before coding, branch and mark build `[~]` in the SPEC-010 timeline. If something
needs architect judgment, set `[?]` with a one-line reason and stop.

Branch: git checkout -b feat/spec-010-win-tier

Implement EXACTLY the spec in src/engine/tiers.ts:
- type WinTier = 'none'|'small'|'big'|'jackpot'.
- isJackpot(lineWins) — some line with symbol==='WOLF' && count===5.
- classifyWin(totalWin, totalBet, lineWins) — jackpot if isJackpot; else none if
  totalWin<=0; else small if totalWin < 5*totalBet; else big. (Check jackpot FIRST.)
- Create src/engine/tiers.test.ts with ALL Failing Tests from the spec (none, small
  incl. just-under-50, big at the 5x boundary + above, jackpot, jackpot-precedence,
  isJackpot true/false cases, large-non-Wolf-is-big).
- Import only from ./paylines and ./strips. No React/DOM/src-ui, no Math.random, no deps.

Gate (all exit 0): just typecheck && just lint && just test && just build

When done:
1. Fill "## Build Completion" (incl. 3 honest reflection answers).
2. Append a build cost session (cycle: build, agent: claude-sonnet-4-6, interface:
   claude-code, tokens_total null + "orchestrator to fill" note).
3. Mark build `[~]` only.
DO NOT git push / open a PR / run gh / run just advance-cycle.
```
