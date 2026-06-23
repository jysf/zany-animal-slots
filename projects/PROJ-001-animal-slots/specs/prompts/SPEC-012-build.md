# SPEC-012 — BUILD prompt (fresh session — Sonnet)

> Run on **claude-sonnet-4-6** (AGENTS §8).

```
Cycle: build. You are NOT the architect. The spec file is your only context.

Read in order:
1. /AGENTS.md (§5 stack, §11 coding, §12 testing — UI tests are behavior/structure).
2. /projects/PROJ-001-animal-slots/specs/SPEC-012-reel-grid-component.md — ENTIRE
   Implementation Context, Acceptance Criteria, Failing Tests, Notes.
3. /projects/PROJ-001-animal-slots/stages/STAGE-003-reels-ui-and-spin-flow.md
4. /decisions/DEC-001, /decisions/DEC-006, /decisions/DEC-010.
5. /src/engine/index.ts (Grid, SymbolId, SYMBOLS), /src/ui/regions/Game.tsx,
   /src/ui/regions/regions.css, /src/styles/tokens.css.
6. /guidance/constraints.yaml — portrait-first, test-before-implementation, one-spec-per-pr.

Before coding, branch and mark build `[~]` in the SPEC-012 timeline. If something
needs architect judgment, set `[?]` with a one-line reason and stop.

Branch: git checkout -b feat/spec-012-reel-grid

Implement EXACTLY the spec:
- src/ui/reels/symbols.ts — SYMBOL_DISPLAY (Record<SymbolId,{emoji,label}>) for all
  8 DEC-006 symbols + INITIAL_GRID (static non-winning 5×3, typed Grid).
- src/ui/reels/ReelGrid.tsx — ReelGrid({grid}: {grid: Grid}); 5 reel columns × 3
  cells; each cell <span className="reel__cell" role="img" aria-label={label}>{emoji}</span>.
- src/ui/reels/reels.css — token-driven layout (no raw hex), fits 375px portrait.
- Modify src/ui/regions/Game.tsx to render <ReelGrid grid={INITIAL_GRID} /> and
  import reels.css.
- Tests: src/ui/reels/ReelGrid.test.tsx (15 cells, emoji+label per symbol,
  SYMBOL_DISPLAY covers all SYMBOLS, 5 reels, INITIAL_GRID valid) AND
  src/ui/regions/Game.test.tsx (Game's main contains 15 symbol cells).
- Import the engine ONLY from 'src/engine' (its index). Do NOT touch engine code.
  No new deps.

Gate (all exit 0): just typecheck && just lint && just test && just build
(Do NOT attempt a browser/preview check — the orchestrator does the visual check.)

When done:
1. Fill "## Build Completion" (incl. 3 honest reflection answers).
2. Append a build cost session (cycle: build, agent: claude-sonnet-4-6, interface:
   claude-code, tokens_total null + "orchestrator to fill" note).
3. Mark build `[~]` only.
DO NOT git push / open a PR / run gh / run just advance-cycle.
```
