# SPEC-019 — BUILD prompt (fresh session — Sonnet)

> Run on **claude-sonnet-4-6** (AGENTS §8).

```
Cycle: build. You are NOT the architect. The spec file is your only context.

Read in order:
1. /AGENTS.md (§5, §11, §12 — UI tests are behavior/state).
2. /projects/PROJ-001-animal-slots/specs/SPEC-019-win-amount-display.md — ENTIRE
   Implementation Context, Acceptance Criteria, Failing Tests, Notes.
3. /projects/PROJ-001-animal-slots/stages/STAGE-004-win-celebration-and-juice.md
4. /decisions/DEC-001, /decisions/DEC-004, /decisions/DEC-010.
5. /src/ui/useSlotMachine.ts + /src/ui/useSlotMachine.test.tsx, /src/ui/regions/Status.tsx
   + Status.test.tsx, /src/ui/regions/Game.tsx, /src/ui/reels/ReelGrid.tsx + reels.css,
   /src/ui/App.tsx, /src/styles/tokens.css, /src/engine/index.ts (SpinResult.totalWin).
6. /guidance/constraints.yaml — respect-reduced-motion, portrait-first, test-before-implementation, one-spec-per-pr.

Before coding, branch and mark build `[~]` in the SPEC-019 timeline. If something
needs architect judgment, set `[?]` with a one-line reason and stop.

Branch: git checkout -b feat/spec-019-win-amount

Implement EXACTLY the spec:
- useSlotMachine.ts: add lastWin (useState 0); set lastWin = outcome.totalWin in the
  spin-resolve callback; reset() sets lastWin 0; return it. Keep timed-flow behavior.
- src/ui/reels/WinBadge.tsx: WinBadge({amount, show}) → null unless show && amount>0,
  else an overlay element (role="status") showing "WIN +{amount}", absolutely
  positioned over the grid (no layout shift).
- Status.tsx: add a WIN readout (new lastWin prop) next to Balance/Bet.
- Game.tsx: render <WinBadge amount={lastWin} show={!spinning} /> over the grid.
- App.tsx: thread lastWin + spinning into Status/Game.
- reels.css (or win-badge.css): .win-badge overlay + pop-in @keyframes (transform/
  opacity) + @media (prefers-reduced-motion: reduce) static fallback. Tokens, no raw hex.
- Tests: extend useSlotMachine.test.tsx (lastWin 0 initial; seed 276 → 55 after
  advancing SPIN_DURATION_MS; seed 12345 → 0; reset clears), WinBadge.test.tsx (shows
  55 when amount 55 + show; null when amount 0 or show false), Status.test.tsx (WIN
  readout shows lastWin). Update any existing Status render to pass the new prop.
- Engine only via src/engine; do NOT modify engine code. No new deps. Keep ALL existing tests green.

Gate (all exit 0): just typecheck && just lint && just test && just build
(Do NOT attempt a browser/preview check — the orchestrator does the visual check.)

When done:
1. Fill "## Build Completion" (incl. 3 honest reflection answers).
2. Append a build cost session (cycle: build, agent: claude-sonnet-4-6, interface:
   claude-code, tokens_total null + "orchestrator to fill" note).
3. Mark build `[~]` only.
DO NOT git push / open a PR / run gh / run just advance-cycle.
```
