# SPEC-042 — BUILD prompt (fresh session — Sonnet)

> Run on **claude-sonnet-4-6** (AGENTS §8). LOCAL ONLY: branch + local commits.
> NO push, NO PR, NO `gh`, NO `just advance-cycle`. End-to-end parity is the gate.

```
Cycle: build. You are NOT the architect. The spec file is your only context.

Read in order:
1. /AGENTS.md (§5 build flow, §8 models, §11 typed-results, §12 tests, §14 pure-data, UI/React conventions).
2. /projects/PROJ-002-machines-and-metrics/specs/SPEC-042-machine-registry-and-hook-plumbing.md
   — the ENTIRE Implementation Context, Acceptance Criteria, Failing Tests, Notes. The Notes
   contain drop-in code for the registry + every hook/UI change. Use them verbatim.
3. /decisions/DEC-015 + /decisions/DEC-005 (read only).
4. Source: /src/machines/wildAndWhimsical.ts, /src/machines/types.ts, /src/ui/useSlotMachine.ts,
   /src/ui/regions/Game.tsx, /src/ui/PaytableSheet.tsx, /src/ui/App.tsx (context),
   /src/ui/useSlotMachine.test.tsx, /src/engine/index.ts (spin already takes `machine` — unchanged).

Before coding, branch and mark build [~] in the SPEC-042 timeline. If any existing
useSlotMachine pinned-seed/balance expectation would have to change to pass, STOP and set
build [?] (a changed frozen-seed outcome or balance = a behavior regression).

Branch: git checkout main && git pull --ff-only && git checkout -b feat/spec-042-machine-registry-hook

Implement EXACTLY the spec (drop-in in the Notes):
- CREATE src/machines/registry.ts — MACHINES (default only), DEFAULT_MACHINE_ID,
  getMachine(id) (fallback to default), getActiveMachine() (returns the default).
- CREATE src/machines/registry.test.ts — the 3 registry cases from the spec Failing Tests.
- MODIFY src/ui/useSlotMachine.ts — resolve `const machine = opts?.machine ?? getActiveMachine()`;
  balance init falls back to machine.math.startingBalance; bet inits to machine.math.defaultBet;
  reset() restores machine.math.startingBalance; spin passes `machine: machine.math` to engineSpin;
  result exposes `machine`; opts gains `machine?: Machine`; result type gains `machine: Machine`.
  Drop the now-unused STARTING_BALANCE/DEFAULT_BET engine imports (keep canAfford/nextBet/prevBet).
  Add `machine` to the spin + reset useCallback deps. Keep timers/auto-spin/celebration identical.
- MODIFY src/ui/regions/Game.tsx — replace the WILD_AND_WHIMSICAL import with getActiveMachine
  from ../../machines/registry; `const machine = getActiveMachine()`; pass
  symbolDisplay={machine.presentation.symbolDisplay}.
- MODIFY src/ui/PaytableSheet.tsx — same swap; paytableRows(getActiveMachine().presentation.symbolDisplay).
- MODIFY src/ui/useSlotMachine.test.tsx — add the "supplied machine sets the starting balance"
  guard (clear localStorage, pass { machine: variant } with variant.math.startingBalance 5000,
  assert balance 5000 + result.current.machine === variant); keep every existing pinned-seed/
  balance assertion byte-identical. Game.test.tsx/PaytableSheet.test.tsx: change only if they
  import WILD_AND_WHIMSICAL directly; rendered expectations unchanged.

HARD CONSTRAINTS (verify before finishing):
- `git diff main..HEAD -- src/engine/` MUST be EMPTY (spin already had the machine param — no engine change).
- `grep -rn 'WILD_AND_WHIMSICAL' src/ui/regions/Game.tsx src/ui/PaytableSheet.tsx src/ui/useSlotMachine.ts`
  finds NOTHING (all resolve the active machine via the registry).
- No selector UI, no persistence of a choice, no 2nd machine. No new dependency. No new DEC.
- Every existing useSlotMachine pinned-seed/balance expectation stays byte-identical
  (407947→2000/balance 2990, the loss/small/big seeds, default balance 1000, reset→1000).

Repo toolchain gotchas: ESLint has NO react-hooks plugin (no exhaustive-deps disables); NO
@testing-library/user-event (use renderHook/act/render/fireEvent from @testing-library/react
as the existing tests do); vi.fn() factories use no named params; JSX test files must be .tsx
(useSlotMachine.test.tsx is .tsx; registry.test.ts is .ts, no JSX); tsconfig include is ["src"].

Gate (all exit 0): just typecheck && just lint && just test && just build
Then confirm: just validate passes; the src/engine diff is EMPTY; the WILD_AND_WHIMSICAL grep
in the three files is empty.

When done:
1. Fill "## Build Completion" (incl. 3 honest reflection answers).
2. Append a build cost session (cycle: build, agent: claude-sonnet-4-6, interface:
   claude-code, tokens_total: null + "orchestrator to fill tokens_total from
   subagent_tokens" note, duration/notes).
3. Mark build [~] in the timeline.
4. Commit locally with a message referencing SPEC-042.
DO NOT git push / open a PR / run gh / run just advance-cycle. (Orchestrator does the preview check + ship.)
```
