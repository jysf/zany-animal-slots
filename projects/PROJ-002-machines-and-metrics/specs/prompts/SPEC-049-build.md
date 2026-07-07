# SPEC-049 — BUILD prompt (fresh session — Sonnet)

> Run on **claude-sonnet-4-6** (AGENTS §8). LOCAL ONLY: branch + local commits.
> NO push, NO PR, NO `gh`, NO `just advance-cycle`. A reactive SEAM — with only one machine
> registered the context always resolves to the default, so there is NO observable change today.

```
Cycle: build. You are NOT the architect. The spec file is your only context.

Read in order:
1. /AGENTS.md (§5 build flow, §8 models, §12 tests).
2. /projects/PROJ-002-machines-and-metrics/specs/SPEC-049-reactive-active-machine-context.md
   — the ENTIRE Acceptance Criteria, Failing Tests, Implementation Context, and Notes. The Notes
   contain COMPLETE drop-in code for every file. Implement it VERBATIM.
3. /decisions/DEC-001, DEC-005, DEC-015 (read only).
4. Source (read to edit): src/machines/registry.ts, src/ui/useSlotMachine.ts, src/ui/PaytableSheet.tsx,
   src/ui/regions/Game.tsx, src/main.tsx; (read only) src/ui/storage.ts, src/machines/types.ts.

Before coding, branch and mark build [~] in the SPEC-049 timeline.

Branch: git checkout main && git pull --ff-only && git checkout -b feat/spec-049-reactive-active-machine-context

Implement EXACTLY the spec (drop-ins in the Notes). New files:
- src/machines/activeMachineStorage.ts (ACTIVE_MACHINE_KEY='zany:active-machine', readActiveMachineId,
  writeActiveMachineId — mirror src/ui/storage.ts, never throws).
- src/ui/machine/MachineProvider.tsx (ActiveMachineContextValue, MachineProvider, useActiveMachine;
  default context value = default machine so consumers work with NO provider; normalizeId snaps
  unknown/absent ids to DEFAULT_MACHINE_ID).
- src/machines/activeMachineStorage.test.ts, src/ui/machine/MachineProvider.test.tsx.
Modified files:
- src/machines/registry.ts — getActiveMachine() returns getMachine(readActiveMachineId() ?? DEFAULT_MACHINE_ID).
- src/ui/useSlotMachine.ts — machine = opts?.machine ?? useActiveMachine().machine (call useActiveMachine
  unconditionally; remove the getActiveMachine import).
- src/ui/PaytableSheet.tsx + src/ui/regions/Game.tsx — const machine = useActiveMachine().machine
  (swap the import; mind relative depth: PaytableSheet '../machine/MachineProvider', Game
  '../../machine/MachineProvider').
- src/main.tsx — wrap <App/> in <MachineProvider>.
Tests (make them pass) — all named in the spec's Failing Tests section:
- activeMachineStorage.test.ts (key, null-when-absent, round-trip, guarded-never-throws).
- ADD to registry.test.ts: getActiveMachine default-when-empty, reflects-persisted-id, unknown→default
  (with beforeEach/afterEach localStorage.clear()).
- MachineProvider.test.tsx: no-provider→default, init-from-storage, unknown→default, setActiveMachineId
  persists+updates.

HARD CONSTRAINTS (verify before finishing):
- `git diff main..HEAD -- src/engine/` MUST be EMPTY (DEC-001 — reactive seam is UI/machines only).
- No new dependency. No new DEC. No change to any machine's MATH. Do NOT touch
  machine-parity.contract.test.ts (it stays green: empty storage → default).

Repo toolchain gotchas: ESLint has NO react-hooks plugin (no exhaustive-deps disables). NO
@testing-library/user-event — use renderHook/act with a `wrapper` for the provider. JSX/renderHook
test files are .tsx; the storage test is plain .ts. tsconfig include is ["src"]. jsdom provides
localStorage (clear it per-test). The existing consumer tests render WITHOUT a provider — the default
context value keeps them green; do NOT wrap them.

Gate (all exit 0): just typecheck && just lint && just test && just build
Then confirm: `just validate` and `just cost-audit` pass; the new/updated tests ran and passed; the
`git diff main..HEAD -- src/engine/` guard is EMPTY.

When done:
1. Fill "## Build Completion" (incl. 3 honest reflection answers).
2. Append a build cost session (cycle: build, agent: claude-sonnet-4-6, interface: claude-code,
   tokens_total: null + "orchestrator to fill tokens_total from subagent_tokens" note,
   recorded_at: <today>, notes).
3. Mark build [~] in the timeline.
4. Commit locally with a message referencing SPEC-049.
DO NOT git push / open a PR / run gh / run just advance-cycle.
```
