# SPEC-007 — BUILD prompt (fresh session — Sonnet)

> Run on **claude-sonnet-4-6** (AGENTS §8).

```
Cycle: build. You are NOT the architect. The spec file is your only context.

Read in order:
1. /AGENTS.md (§5, §11, §12).
2. /projects/PROJ-001-animal-slots/specs/SPEC-007-5x3-spin-resolver.md — ENTIRE
   Implementation Context, Acceptance Criteria, Failing Tests (incl. the pinned
   seed-12345 stops [34,10,16,28,17] and grid), and Notes for the Implementer.
3. /projects/PROJ-001-animal-slots/stages/STAGE-002-slot-engine.md
4. /decisions/DEC-001, /decisions/DEC-002.
5. /src/engine/rng.ts and /src/engine/strips.ts (the modules you compose).
6. /guidance/constraints.yaml — engine-no-dom, deterministic-rng, test-before-implementation, one-spec-per-pr.

Before coding, branch and mark build `[~]` in the SPEC-007 timeline. If something
needs architect judgment, set `[?]` with a one-line reason and stop.

Branch: git checkout -b feat/spec-007-spin-resolver

Implement EXACTLY the spec in src/engine/spin.ts:
- type Grid = SymbolId[][]  (grid[reel][row], 5×3, row 0 = top) — document it.
- resolveStops(rng, strips = STRIPS): number[]  — one randomInt(rng, strip.length)
  per reel, reel order 0→4.
- resolveGrid(rng, strips = STRIPS): Grid  — reuse resolveStops, then map each stop
  through visibleCells (do NOT draw twice).
- Create src/engine/spin.test.ts with ALL seven Failing Tests, including the
  exactly-one-draw-per-reel test and the pinned seed-12345 stops + grid.
- Import only from ./rng and ./strips. No React/DOM/src-ui, no Math.random, no deps.

Gate (all exit 0): just typecheck && just lint && just test && just build

When done:
1. Fill "## Build Completion" (incl. 3 honest reflection answers).
2. Append a build cost session (cycle: build, agent: claude-sonnet-4-6, interface:
   claude-code, tokens_total null + "orchestrator to fill" note).
3. Mark build `[~]` only.
DO NOT git push / open a PR / run gh / run just advance-cycle.
```
