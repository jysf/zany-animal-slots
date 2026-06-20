# SPEC-006 — BUILD prompt (fresh session — Sonnet)

> Run on **claude-sonnet-4-6** (AGENTS §8).

```
Cycle: build. You are NOT the architect. The spec file is your only context.

Read in order:
1. /AGENTS.md (esp. §5 stack, §11 coding, §12 testing).
2. /projects/PROJ-001-animal-slots/specs/SPEC-006-symbols-and-weighted-reel-strips.md
   — ENTIRE Implementation Context, Acceptance Criteria, Failing Tests, and Notes
   for the Implementer (it contains the exact pinned REEL_STRIP array).
3. /projects/PROJ-001-animal-slots/stages/STAGE-002-slot-engine.md
4. /decisions/DEC-001, /decisions/DEC-006, /decisions/DEC-011.
5. /src/engine/rng.ts (context for how strips pair with the RNG).
6. /guidance/constraints.yaml — engine-no-dom, test-before-implementation, one-spec-per-pr.

Before coding, branch and mark build `[~]` in the SPEC-006 timeline. If something
needs architect judgment, set `[?]` with a one-line reason and stop.

Branch: git checkout -b feat/spec-006-reel-strips

Implement EXACTLY the spec in src/engine/strips.ts:
- SYMBOLS (8 IDs), SymbolId type derived from SYMBOLS, Tier type, SYMBOL_TIER
  (DEC-006), REEL_WEIGHTS (DEC-011), REEL_COUNT = 5, REEL_STRIP (the exact pinned
  35-element array), STRIPS (5 × REEL_STRIP), visibleCells(strip, stop) with wrap.
- Create src/engine/strips.test.ts with ALL eight Failing Tests, including the
  pinned-strip deep-equality and the visibleCells wrap cases.
- No React/DOM/src-ui imports, no Math.random, no new deps.

Gate (all exit 0): just typecheck && just lint && just test && just build

When done:
1. Fill "## Build Completion" (incl. 3 honest reflection answers).
2. Append a build cost session (cycle: build, agent: claude-sonnet-4-6, interface:
   claude-code, tokens_total null + "orchestrator to fill" note).
3. Mark build `[~]` only (orchestrator advances/PRs/merges).
DO NOT git push / open a PR / run gh / run just advance-cycle.
```
