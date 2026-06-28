# SPEC-022 — BUILD prompt (fresh session — Sonnet)

> Run on **claude-sonnet-4-6** (AGENTS §8).

```
Cycle: build. You are NOT the architect. The spec file is your only context.

Read in order:
1. /AGENTS.md (§5, §11, §12 — UI tests are behavior/state).
2. /projects/PROJ-001-animal-slots/specs/SPEC-022-balance-count-up.md — ENTIRE
   Implementation Context, Acceptance Criteria, Failing Tests, Notes (the Notes
   contain the exact hook/helper/setup code to implement).
3. /projects/PROJ-001-animal-slots/stages/STAGE-004-win-celebration-and-juice.md
4. /decisions/DEC-012 (the JS-tween decision — authoritative for this spec),
   /decisions/DEC-004, /decisions/DEC-001.
5. /src/ui/useSlotMachine.ts (the `celebration` signal + `Celebration` type),
   /src/ui/regions/Status.tsx + Status.test.tsx, /src/ui/App.tsx,
   /src/test/setup.ts, /src/engine/index.ts.
6. /guidance/constraints.yaml — respect-reduced-motion, test-before-implementation,
   one-spec-per-pr.

Before coding, branch and mark build `[~]` in the SPEC-022 timeline. If something
needs architect judgment, set `[?]` with a one-line reason and stop.

Branch: git checkout main && git pull --ff-only && git checkout -b feat/spec-022-balance-count-up

Implement EXACTLY the spec (the Notes give drop-in code):
- src/ui/prefersReducedMotion.ts — the defensive matchMedia helper.
- src/ui/useCountUp.ts — the count-up hook + exported COUNT_UP_DURATION_MS (use the
  setInterval STEP_MS tween from the Notes; key on signal.id; snap on null/reduced).
- src/test/setup.ts — add the default window.matchMedia mock (matches:false), keep
  the existing jest-dom import.
- src/ui/regions/Status.tsx — accept optional `celebration?: Celebration | null`
  (import Celebration from ../useSlotMachine); render useCountUp(balance, signal) in
  the Balance value cell; no-celebration → instant (existing tests must pass).
- src/ui/App.tsx — destructure `celebration` from useSlotMachine() and pass it to
  <Status …>.
- Tests: prefersReducedMotion.test.ts (3 cases), useCountUp.test.tsx (7 cases),
  extend Status.test.tsx (balance counts up on a win, existing tests still pass).
  Use vi.useFakeTimers(); for reduced-motion override window.matchMedia to
  matches:true and restore in afterEach. Advance COUNT_UP_DURATION_MS to finish.
- Engine only via src/engine; do NOT modify engine code. No new deps. Do NOT add any
  .css file (this celebration is JS — DEC-012). Keep ALL existing tests green.

NOTE: DEC-012 already exists (authored at design). Do NOT create a new DEC.

Gate (all exit 0): just typecheck && just lint && just test && just build
(Do NOT attempt a browser/preview check — the orchestrator does the visual check.)

When done:
1. Fill "## Build Completion" (incl. 3 honest reflection answers).
2. Append a build cost session (cycle: build, agent: claude-sonnet-4-6, interface:
   claude-code, tokens_total null + "orchestrator to fill tokens_total from
   subagent_tokens" note).
3. Mark build `[~]` only.
4. Commit locally (message referencing SPEC-022).
DO NOT git push / open a PR / run gh / run just advance-cycle.
```
