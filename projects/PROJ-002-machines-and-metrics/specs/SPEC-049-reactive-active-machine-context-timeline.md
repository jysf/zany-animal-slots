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
