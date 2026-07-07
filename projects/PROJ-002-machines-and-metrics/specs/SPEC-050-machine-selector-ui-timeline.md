# SPEC-050 timeline

Architect appends as cycles are designed. Executors update status as
they go. Status markers: `[ ]` not started · `[~]` in progress · `[x]` complete · `[?]` blocked.

Cycle prompts live in `prompts/SPEC-050-<cycle>.md`.

## Instructions

- [x] **design** — completed 2026-07-07 (Opus): a header **machine-selector** control
      (`src/ui/machine/MachineSelector.tsx`) — a native `<select aria-label="Machine">` listing the
      registry's machines (new `listMachines()` helper) with `value=activeMachineId`, `onChange` →
      SPEC-049's `setActiveMachineId`; placed first in `.cabinet__header-controls`. Token-only CSS
      (`machine-selector.css`, mirrors `.mute-toggle`, ≥44px both dims, re-themes via vars — DEC-010)
      and added to the `controls.touch-target.test.ts` ≥44px guard. The first NON-no-op UI spec of the
      run: it adds a visible control (one option today; grows as SPEC-051/052/053 register machines).
      Drives the reactive context so a switch re-renders reels + paytable + theme + audio together and
      persists (SPEC-049). DEC-001 clean (`git diff src/engine/` EMPTY). Complete drop-in code + failing
      tests (listMachines; selector renders/selects-active/switches via mocked deps; touch-target
      entry). No new dep, no new DEC. **[M]** Build prompt written.
- [~] **build** — (Sonnet): implemented the spec's drop-in code verbatim (listMachines, MachineSelector
      + machine-selector.css + its tests, Header wiring, touch-target CONTROLS entry). Gate green:
      typecheck/lint/test (60 files, 356 tests)/build/validate/cost-audit all exit 0.
      `git diff main..HEAD -- src/engine/` EMPTY. Branch `feat/spec-050-machine-selector-ui`, local
      commit only (no push/PR). Left `[~]` for the orchestrator to flip to `[x]`.
