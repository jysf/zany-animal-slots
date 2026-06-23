# SPEC-013 — BUILD prompt (fresh session — Sonnet)

> Run on **claude-sonnet-4-6** (AGENTS §8).

```
Cycle: build. You are NOT the architect. The spec file is your only context.

Read in order:
1. /AGENTS.md (§5 stack, §11 coding, §12 testing — UI tests are behavior/state).
2. /projects/PROJ-001-animal-slots/specs/SPEC-013-spin-button-and-flow.md — ENTIRE
   Implementation Context, Acceptance Criteria, Failing Tests, Notes.
3. /projects/PROJ-001-animal-slots/stages/STAGE-003-reels-ui-and-spin-flow.md
4. /decisions/DEC-001, /decisions/DEC-002, /decisions/DEC-005.
5. /src/engine/index.ts (spin, SpinOutcome, Grid, BetLevel, LineWin, WinTier,
   STARTING_BALANCE, DEFAULT_BET, canAfford), /src/ui/reels/symbols.ts (INITIAL_GRID),
   /src/ui/reels/ReelGrid.tsx, /src/ui/App.tsx, /src/ui/regions/{Game,Status,Action}.tsx,
   /src/ui/regions/regions.css, /src/styles/tokens.css.
6. /guidance/constraints.yaml — portrait-first, touch-targets-44, test-before-implementation, one-spec-per-pr.

Before coding, branch and mark build `[~]` in the SPEC-013 timeline. If something
needs architect judgment, set `[?]` with a one-line reason and stop.

Branch: git checkout -b feat/spec-013-spin-flow

Implement EXACTLY the spec:
- src/ui/useSlotMachine.ts — the hook with the signature in the spec (grid/balance/
  bet/lineWins/tier/status/canSpin/spin; opts {initialBalance?, nextSeed?}). spin()
  calls engine spin({seed: nextSeed(), balance, bet}) and applies the ok outcome;
  no-op when !canSpin. SYNCHRONOUS resolve (no animation/timing — that's a later spec).
- Modify Game.tsx (take grid prop → <ReelGrid grid={grid}/>), Action.tsx (Spin
  button from {onSpin, canSpin}, disabled when !canSpin, ≥44px, accessible name "Spin"),
  Status.tsx (show balance + bet from props), App.tsx (use the hook, thread props).
- Tests: useSlotMachine.test.tsx (renderHook + act: initial state; seed 276 → balance
  1045/tier big/3 lineWins; seed 12345 → balance 990/none; initialBalance 5 → canSpin
  false + spin no-op), Action.test.tsx (enabled calls onSpin / disabled when !canSpin),
  Status.test.tsx (shows balance+bet), and EXTEND App.test.tsx (Spin button + balance
  1000 shown; existing region/device-stage assertions still pass).
- CSS via tokens (no raw hex). Import engine ONLY from 'src/engine' (../../engine/index
  or ../engine/index as appropriate). Do NOT modify engine code. No new deps.

Gate (all exit 0): just typecheck && just lint && just test && just build
(Do NOT attempt a browser/preview check — the orchestrator does the visual check.)

When done:
1. Fill "## Build Completion" (incl. 3 honest reflection answers).
2. Append a build cost session (cycle: build, agent: claude-sonnet-4-6, interface:
   claude-code, tokens_total null + "orchestrator to fill" note).
3. Mark build `[~]` only.
DO NOT git push / open a PR / run gh / run just advance-cycle.
```
