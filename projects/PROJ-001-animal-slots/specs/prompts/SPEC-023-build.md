# SPEC-023 — BUILD prompt (fresh session — Sonnet)

> Run on **claude-sonnet-4-6** (AGENTS §8).

```
Cycle: build. You are NOT the architect. The spec file is your only context.

Read in order:
1. /AGENTS.md (§5, §11, §12 — UI tests are behavior/state).
2. /projects/PROJ-001-animal-slots/specs/SPEC-023-payline-paw-print-trail.md — the
   ENTIRE Implementation Context, Acceptance Criteria, Failing Tests, Notes (the
   Notes give drop-in markup + CSS).
3. /projects/PROJ-001-animal-slots/stages/STAGE-004-win-celebration-and-juice.md
4. /decisions/DEC-004, /decisions/DEC-006, /decisions/DEC-010, /decisions/DEC-001.
5. /src/ui/reels/ReelGrid.tsx + ReelGrid.test.tsx, /src/ui/reels/reels.css,
   /src/ui/reels/winningCells.ts, /src/ui/reels/reels.animation.test.ts,
   /src/ui/regions/Game.tsx + Game.test.tsx, /src/ui/App.tsx,
   /src/ui/useSlotMachine.ts (the Celebration type).
6. /guidance/constraints.yaml — respect-reduced-motion, perf-60fps, portrait-first,
   test-before-implementation, one-spec-per-pr.

Before coding, branch and mark build `[~]` in the SPEC-023 timeline. If something
needs architect judgment, set `[?]` with a one-line reason and stop.

Branch: git checkout main && git pull --ff-only && git checkout -b feat/spec-023-paw-trail

Implement EXACTLY the spec (Notes give drop-in code):
- src/ui/reels/ReelGrid.tsx: add optional `trailKey?: number | null`; inside the
  cell, when `isWin && trailKey != null`, render
  <span className="reel__paw" aria-hidden="true" key={`paw-${trailKey}`}>🐾</span>.
  Keep the cell's role="img"/aria-label. (isWin is already false while spinning.)
- src/ui/reels/reels.css: add `.reel__cell { position: relative }`, the `.reel__paw`
  overlay, `@keyframes paw-trail-pop` (transform/opacity), per-reel stagger via the
  inherited `--reel-index`, and `.reel__paw { animation: none }` inside the EXISTING
  @media (prefers-reduced-motion: reduce) block. Tokens only, NO raw hex.
- src/ui/regions/Game.tsx: add optional `celebration?: Celebration | null` (import
  the type from ../useSlotMachine); pass `trailKey={celebration?.id ?? null}` to
  <ReelGrid>. Keep <WinBadge>.
- src/ui/App.tsx: pass `celebration={celebration}` to <Game> (already destructured).
- Tests: extend ReelGrid.test.tsx (5 paw tests via container.querySelectorAll
  ('.reel__paw'); reuse TEST_GRID + L1_WIN_3), Game.test.tsx (paw trail threaded on
  a win; none without celebration), reels.animation.test.ts (paw-trail-pop keyframe
  + .reel__paw class present).
- Engine only via src/engine; do NOT modify engine code. No new deps. Keep ALL
  existing tests green (15 symbol cells unchanged; paws are aria-hidden, not role=img).

NO new DEC — this is DEC-004/006/010 territory.

Gate (all exit 0): just typecheck && just lint && just test && just build
(Do NOT attempt a browser/preview check — the orchestrator does the visual check.)

When done:
1. Fill "## Build Completion" (incl. 3 honest reflection answers).
2. Append a build cost session (cycle: build, agent: claude-sonnet-4-6, interface:
   claude-code, tokens_total null + "orchestrator to fill tokens_total from
   subagent_tokens" note).
3. Mark build `[~]` only.
4. Commit locally (message referencing SPEC-023).
DO NOT git push / open a PR / run gh / run just advance-cycle.
```
