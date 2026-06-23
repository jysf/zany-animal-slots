# SPEC-015 — BUILD prompt (fresh session — Sonnet)

> Run on **claude-sonnet-4-6** (AGENTS §8).

```
Cycle: build. You are NOT the architect. The spec file is your only context.

Read in order:
1. /AGENTS.md (§5, §11, §12 — UI tests are behavior/state).
2. /projects/PROJ-001-animal-slots/specs/SPEC-015-balance-persistence-and-reset.md —
   ENTIRE Implementation Context, Acceptance Criteria, Failing Tests, Notes.
3. /projects/PROJ-001-animal-slots/stages/STAGE-003-reels-ui-and-spin-flow.md
4. /decisions/DEC-001, /decisions/DEC-005.
5. /src/engine/index.ts (STARTING_BALANCE), /src/ui/useSlotMachine.ts,
   /src/ui/App.tsx, /src/ui/regions/Action.tsx, /src/ui/regions/controls.css,
   and the existing /src/ui/useSlotMachine.test.tsx + /src/ui/regions/Action.test.tsx.
6. /guidance/constraints.yaml — touch-targets-44, portrait-first, test-before-implementation, one-spec-per-pr.

Before coding, branch and mark build `[~]` in the SPEC-015 timeline. If something
needs architect judgment, set `[?]` with a one-line reason and stop.

Branch: git checkout -b feat/spec-015-balance-persistence

Implement EXACTLY the spec:
- src/ui/storage.ts — BALANCE_KEY, readBalance(): number|null (try/catch, null on
  absent/invalid/non-finite), writeBalance(n) (try/catch, ignore failures).
- useSlotMachine.ts — init balance from opts.initialBalance ?? readBalance() ??
  STARTING_BALANCE; persist on change via useEffect; add reset() (→ STARTING_BALANCE).
- Action.tsx — add a Reset button from new prop {onReset} (aria name "Reset", ≥44px);
  App.tsx threads reset → onReset. Update any existing Action test to pass onReset.
- Tests: src/ui/storage.test.ts (round-trip, null when absent, invalid→null) AND
  extend useSlotMachine.test.tsx (rehydrate from storage, fallback 1000, persists
  after spin → 990 + readBalance()===990, reset → 1000 + persisted) AND Action.test.tsx
  (Reset calls onReset). Add beforeEach(() => localStorage.clear()) where storage is used.
- CSS via tokens, no raw hex. Engine only via src/engine; do NOT modify engine code. No new deps.

Gate (all exit 0): just typecheck && just lint && just test && just build
(Do NOT attempt a browser/preview check — the orchestrator does the visual check.)

When done:
1. Fill "## Build Completion" (incl. 3 honest reflection answers).
2. Append a build cost session (cycle: build, agent: claude-sonnet-4-6, interface:
   claude-code, tokens_total null + "orchestrator to fill" note).
3. Mark build `[~]` only.
DO NOT git push / open a PR / run gh / run just advance-cycle.
```
