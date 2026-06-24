# SPEC-016 — BUILD prompt (fresh session — Sonnet)

> Run on **claude-sonnet-4-6** (AGENTS §8).

```
Cycle: build. You are NOT the architect. The spec file is your only context.

Read in order:
1. /AGENTS.md (§5, §11, §12 — UI tests are behavior/state; CSS contract tests OK).
2. /projects/PROJ-001-animal-slots/specs/SPEC-016-reel-spin-stop-animation.md — ENTIRE
   Implementation Context, Acceptance Criteria, Failing Tests, Notes.
3. /projects/PROJ-001-animal-slots/stages/STAGE-003-reels-ui-and-spin-flow.md
4. /decisions/DEC-001, /decisions/DEC-004.
5. /src/ui/useSlotMachine.ts + /src/ui/useSlotMachine.test.tsx, /src/ui/reels/ReelGrid.tsx
   + /src/ui/reels/reels.css, /src/ui/regions/Game.tsx + Action.tsx, /src/ui/App.tsx,
   /src/styles/tokens.css.
6. /guidance/constraints.yaml — respect-reduced-motion, portrait-first, test-before-implementation, one-spec-per-pr.

Before coding, branch and mark build `[~]` in the SPEC-016 timeline. If something
needs architect judgment, set `[?]` with a one-line reason and stop.

Branch: git checkout -b feat/spec-016-reel-animation

Implement EXACTLY the spec:
- useSlotMachine.ts: status gains 'spinning'; export SPIN_DURATION_MS (e.g. 700);
  spin() computes the engine outcome, sets status 'spinning' (does NOT yet change
  grid/balance), and via setTimeout(SPIN_DURATION_MS) applies the outcome + returns
  to 'idle'. canSpin false while spinning; re-entrant spin is a no-op; expose
  isSpinning; clear the timer on unmount (no act/state-update warning). Balance
  persistence effect (SPEC-015) still applies at reveal.
- ReelGrid.tsx: accept spinning: boolean; add classes the CSS animates; stagger reels
  (e.g. inline --reel-index + animation-delay) and a reel-stop bounce on stop.
- reels.css: @keyframes (transform/opacity only) for spin + bounce, staggered;
  @media (prefers-reduced-motion: reduce) disables motion. Tokens only, NO raw hex.
- Action.tsx: accept isSpinning; disable bet ±, Reset, Spin while spinning.
- Game.tsx + App.tsx: thread spinning/isSpinning down.
- Tests: extend useSlotMachine.test.tsx with fake timers (vi.useFakeTimers in
  beforeEach, vi.useRealTimers in afterEach; advance by SPIN_DURATION_MS inside act)
  — spinning-without-reveal, reveal-after-duration (seed 276 → 1045), mid-spin
  second-spin ignored (seed 12345 → 990 not 980), timer-cleanup-on-unmount; UPDATE
  the existing spin tests (SPEC-013/14/15) to advance timers before asserting
  resolved balances. Add reels.animation.test.ts (CSS contract: @keyframes+transform,
  prefers-reduced-motion block, no raw hex). Extend Action.test.tsx (all controls
  disabled when isSpinning). Engine only via src/engine; do NOT modify engine code. No new deps.

Gate (all exit 0): just typecheck && just lint && just test && just build
(Do NOT attempt a browser/preview check — the orchestrator does the visual check.)

When done:
1. Fill "## Build Completion" (incl. 3 honest reflection answers).
2. Append a build cost session (cycle: build, agent: claude-sonnet-4-6, interface:
   claude-code, tokens_total null + "orchestrator to fill" note).
3. Mark build `[~]` only.
DO NOT git push / open a PR / run gh / run just advance-cycle.
```
