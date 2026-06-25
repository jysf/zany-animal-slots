# SPEC-017 — BUILD prompt (fresh session — Sonnet)

> Run on **claude-sonnet-4-6** (AGENTS §8).

```
Cycle: build. You are NOT the architect. The spec file is your only context.

Read in order:
1. /AGENTS.md (§5, §11, §12 — UI tests are behavior/state).
2. /projects/PROJ-001-animal-slots/specs/SPEC-017-auto-spin-toggle.md — ENTIRE
   Implementation Context, Acceptance Criteria, Failing Tests, Notes (esp. the
   ref-based continuation pattern and the jackpot seed 407947).
3. /projects/PROJ-001-animal-slots/stages/STAGE-003-reels-ui-and-spin-flow.md
4. /decisions/DEC-001, /decisions/DEC-005.
5. /src/ui/useSlotMachine.ts + /src/ui/useSlotMachine.test.tsx, /src/ui/regions/Action.tsx
   + controls.css, /src/ui/App.tsx, /src/engine/index.ts.
6. /guidance/constraints.yaml — touch-targets-44, portrait-first, test-before-implementation, one-spec-per-pr.

Before coding, branch and mark build `[~]` in the SPEC-017 timeline. If something
needs architect judgment, set `[?]` with a one-line reason and stop.

Branch: git checkout -b feat/spec-017-auto-spin

Implement EXACTLY the spec:
- useSlotMachine.ts: add AUTO_SPIN_COUNT (10), AUTO_SPIN_DELAY_MS (e.g. 400);
  autoSpinning/autoRemaining state; toggleAutoSpin(). Use the ref-based continuation
  in the Notes (autoRef + spinRef) so the spin-resolve callback both reveals AND, if
  auto-active, decrements + either stops (jackpot / remaining 0 / !canAfford) or
  schedules the next spin after AUTO_SPIN_DELAY_MS. RE-USE the SPEC-016 spin() —
  don't fork it. Clear BOTH the spin timer and auto timer on unmount and on stop.
- Action.tsx: an Auto toggle button (props autoSpinning, onToggleAuto), aria-pressed,
  ≥44px, enabled while auto-spinning; keep Spin/bet/Reset disabled while spinning/auto.
- App.tsx: thread autoSpinning/toggleAutoSpin into Action.
- Tests (fake timers): extend useSlotMachine.test.tsx — start+remaining, stop after
  10 (seed 12345 → balance 900), stop on jackpot (seed 407947 → balance 2990, tier
  jackpot, no further spins), stop when balance<bet (seed 12345 + initialBalance 25 →
  2 spins → balance 5), toggle-off stops, unmount-during-auto cleanup. Extend
  Action.test.tsx (Auto toggle calls onToggleAuto; reflects autoSpinning state).
  Keep ALL existing tests green (advance timers as already established).
- Engine only via src/engine; do NOT modify engine code. No new deps. CSS tokens, no raw hex.

Gate (all exit 0): just typecheck && just lint && just test && just build
(Do NOT attempt a browser/preview check — the orchestrator does the visual check.)

When done:
1. Fill "## Build Completion" (incl. 3 honest reflection answers).
2. Append a build cost session (cycle: build, agent: claude-sonnet-4-6, interface:
   claude-code, tokens_total null + "orchestrator to fill" note).
3. Mark build `[~]` only.
DO NOT git push / open a PR / run gh / run just advance-cycle.
```
