# SPEC-014 — BUILD prompt (fresh session — Sonnet)

> Run on **claude-sonnet-4-6** (AGENTS §8).

```
Cycle: build. You are NOT the architect. The spec file is your only context.

Read in order:
1. /AGENTS.md (§5, §11, §12 — UI tests are behavior/state).
2. /projects/PROJ-001-animal-slots/specs/SPEC-014-bet-plus-minus-controls.md — ENTIRE
   Implementation Context, Acceptance Criteria, Failing Tests, Notes.
3. /projects/PROJ-001-animal-slots/stages/STAGE-003-reels-ui-and-spin-flow.md
4. /decisions/DEC-001, /decisions/DEC-005.
5. /src/engine/index.ts (nextBet, prevBet, canAfford, BET_LEVELS, BetLevel),
   /src/ui/useSlotMachine.ts, /src/ui/regions/Action.tsx, /src/ui/regions/Status.tsx,
   /src/ui/regions/controls.css, /src/ui/App.tsx, and the existing
   /src/ui/useSlotMachine.test.tsx + /src/ui/regions/Action.test.tsx.
6. /guidance/constraints.yaml — touch-targets-44, portrait-first, test-before-implementation, one-spec-per-pr.

Before coding, branch and mark build `[~]` in the SPEC-014 timeline. If something
needs architect judgment, set `[?]` with a one-line reason and stop.

Branch: git checkout -b feat/spec-014-bet-controls

Implement EXACTLY the spec:
- useSlotMachine.ts: make `bet` stateful (useState<BetLevel>(DEFAULT_BET)); add
  increaseBet()/decreaseBet() (using engine nextBet/prevBet) and canIncreaseBet
  (not at 50 AND canAfford(balance, nextBet(bet))) / canDecreaseBet (not at 10);
  the step functions are no-ops when their flag is false; spin() keeps using the
  current bet. Keep existing behavior/tests passing.
- Action.tsx: add bet − and + buttons (aria-label "Decrease bet" / "Increase bet",
  ≥44px) from new props {onBetDown,onBetUp,canBetDown,canBetUp}; disabled per flags.
  Keep Spin prominent.
- App.tsx: thread the new hook fields into Action.
- Status.tsx: unchanged (bet already displayed).
- Extend useSlotMachine.test.tsx (increase/clamp 50, decrease/clamp 10, can't raise
  beyond affordable, spin uses chosen bet → seed 12345 + bet 25 → balance 975) and
  Action.test.tsx (bet buttons call handlers; disabled per flags). Update any
  existing Action test that constructs <Action> to pass the new required props.
- controls.css via tokens, no raw hex. Engine imported only via src/engine. Do NOT
  modify engine code. No new deps.

Gate (all exit 0): just typecheck && just lint && just test && just build
(Do NOT attempt a browser/preview check — the orchestrator does the visual check.)

When done:
1. Fill "## Build Completion" (incl. 3 honest reflection answers).
2. Append a build cost session (cycle: build, agent: claude-sonnet-4-6, interface:
   claude-code, tokens_total null + "orchestrator to fill" note).
3. Mark build `[~]` only.
DO NOT git push / open a PR / run gh / run just advance-cycle.
```
