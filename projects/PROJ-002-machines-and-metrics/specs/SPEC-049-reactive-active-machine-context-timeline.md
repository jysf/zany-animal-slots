# SPEC-049 timeline

Architect appends as cycles are designed. Executors update status as
they go. Status markers: `[ ]` not started · `[~]` in progress · `[x]` complete · `[?]` blocked.

Cycle prompts live in `prompts/SPEC-049-<cycle>.md`.

## Instructions

- [x] **design** — completed 2026-07-06 (Opus): lift the active machine into a **React Context**
      (`src/ui/machine/MachineProvider.tsx` — `MachineProvider` + `useActiveMachine`) backed by
      **localStorage** (`src/machines/activeMachineStorage.ts`, namespaced key `zany:active-machine`).
      The three consumers (`useSlotMachine`, `PaytableSheet`, `Game`) subscribe to it; `getActiveMachine()`
      stops being a module const (reads `getMachine(readActiveMachineId() ?? DEFAULT_MACHINE_ID)`);
      `main.tsx` wraps `<App/>` in the provider. The context's DEFAULT value is the default machine, so
      consumers rendered WITHOUT a provider (every existing test) keep working — a **provable no-op
      today** since only one machine is registered (empty/unknown id → default). `setActiveMachineId`
      persists + normalizes (unknown → default id). DEC-001 clean (`git diff src/engine/` EMPTY);
      DEC-005 clean (localStorage, guarded, no backend). This is the keystone: once SPEC-050's selector
      calls `setActiveMachineId`, a switch re-renders reels + paytable + theme + audio together and the
      choice survives reload. Complete drop-in code for all files + failing tests (activeMachineStorage /
      registry / MachineProvider). No new dep, no new DEC. **[M]** Build prompt written.

- [~] **build** — (Sonnet) implemented the spec's drop-in code verbatim on
      `feat/spec-049-reactive-active-machine-context`: new
      `src/machines/activeMachineStorage.ts` (+ 4 tests), new
      `src/ui/machine/MachineProvider.tsx` (+ 4 tests), `registry.ts`'s `getActiveMachine()`
      repointed to read persisted storage (+ 3 new `registry.test.ts` cases), `useSlotMachine` /
      `PaytableSheet` / `Game` swapped to `useActiveMachine().machine`, `main.tsx` wrapped in
      `<MachineProvider>`. Gate green: typecheck, lint, test (59 files / 351 tests), build, validate,
      cost-audit all exit 0. `git diff main..HEAD -- src/engine/` confirmed EMPTY. Ran the three
      verify-cycle adversarial mutations from Notes: (a) and (b) failed their target tests as
      predicted; (c) did not reproduce today because the "reflects the persisted id" test's fixture id
      equals `DEFAULT_MACHINE_ID` (single-machine registry) — wiring independently confirmed via a
      throwaway spy; see spec's Build Completion for the full write-up. All local commits only — no
      push, no PR, no `gh`, no `just advance-cycle`. Left `[~]` for the orchestrator to flip to `[x]`.
