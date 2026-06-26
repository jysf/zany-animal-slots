# SPEC-018 — BUILD prompt (fresh session — Sonnet)

> Run on **claude-sonnet-4-6** (AGENTS §8).

```
Cycle: build. You are NOT the architect. The spec file is your only context.

Read in order:
1. /AGENTS.md (§5, §11, §12 — UI tests are behavior/structure).
2. /projects/PROJ-001-animal-slots/specs/SPEC-018-winning-line-highlight.md — ENTIRE
   Implementation Context, Acceptance Criteria, Failing Tests, Notes.
3. /projects/PROJ-001-animal-slots/stages/STAGE-003-reels-ui-and-spin-flow.md
4. /decisions/DEC-001, /decisions/DEC-003, /decisions/DEC-010.
5. /src/engine/index.ts (PAYLINES, LineWin, LineId), /src/ui/reels/ReelGrid.tsx +
   reels.css, /src/ui/regions/Game.tsx, /src/ui/App.tsx, /src/ui/useSlotMachine.ts,
   /src/styles/tokens.css.
6. /guidance/constraints.yaml — portrait-first, test-before-implementation, one-spec-per-pr.

Before coding, branch and mark build `[~]` in the SPEC-018 timeline. If something
needs architect judgment, set `[?]` with a one-line reason and stop.

Branch: git checkout -b feat/spec-018-line-highlight

Implement EXACTLY the spec:
- src/ui/reels/winningCells.ts — winningCellKeys(lineWins): Set<string> of "reel:row"
  for the first `count` reels of each line (rows from PAYLINES). Empty for [].
- ReelGrid.tsx: accept lineWins: LineWin[] (default []); compute winKeys = spinning ?
  empty : winningCellKeys(lineWins); add `.reel__cell--win` to cells whose "reel:row"
  is in winKeys. Keep ReelGrid pure.
- reels.css: `.reel__cell--win` token-based glow/outline (e.g. box-shadow with
  var(--color-coin)); additive only, no layout shift, NO raw hex.
- Game.tsx + App.tsx: thread lineWins from the hook → Game → ReelGrid.
- Tests: src/ui/reels/winningCells.test.ts (single line→cells, count-4, union of two
  lines, V-line per-reel rows, empty) AND extend ReelGrid.test.tsx (highlights 3 cells
  when resolved; NO highlight while spinning; none when lineWins empty).
- Engine only via src/engine; do NOT modify engine code. No new deps.

Gate (all exit 0): just typecheck && just lint && just test && just build
(Do NOT attempt a browser/preview check — the orchestrator does the visual check.)

When done:
1. Fill "## Build Completion" (incl. 3 honest reflection answers).
2. Append a build cost session (cycle: build, agent: claude-sonnet-4-6, interface:
   claude-code, tokens_total null + "orchestrator to fill" note).
3. Mark build `[~]` only.
DO NOT git push / open a PR / run gh / run just advance-cycle.
```
