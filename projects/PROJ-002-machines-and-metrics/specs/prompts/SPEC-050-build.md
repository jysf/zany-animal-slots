# SPEC-050 — BUILD prompt (fresh session — Sonnet)

> Run on **claude-sonnet-4-6** (AGENTS §8). LOCAL ONLY: branch + local commits.
> NO push, NO PR, NO `gh`, NO `just advance-cycle`. A visible UI addition (header machine
> selector) — pure UI (DEC-001), token-styled (DEC-010), ≥44px (touch-targets-44).

```
Cycle: build. You are NOT the architect. The spec file is your only context.

Read in order:
1. /AGENTS.md (§5 build flow, §8 models, §12 tests).
2. /projects/PROJ-002-machines-and-metrics/specs/SPEC-050-machine-selector-ui.md — the ENTIRE
   Acceptance Criteria, Failing Tests, Implementation Context, and Notes. The Notes have COMPLETE
   drop-in code for every file. Implement it VERBATIM.
3. /decisions/DEC-001, DEC-010, DEC-015 (read only).
4. Source (read to edit): src/machines/registry.ts, src/ui/regions/Header.tsx,
   src/ui/controls.touch-target.test.ts; (read only) src/ui/machine/MachineProvider.tsx,
   src/ui/audio/MuteToggle.tsx, src/ui/audio/audio.css.

Before coding, branch and mark build [~] in the SPEC-050 timeline.

Branch: git checkout main && git pull --ff-only && git checkout -b feat/spec-050-machine-selector-ui

Implement EXACTLY the spec (drop-ins in the Notes). New files:
- src/ui/machine/MachineSelector.tsx (native <select>, aria-label "Machine", value=activeMachineId,
  onChange→setActiveMachineId, options from listMachines()).
- src/ui/machine/machine-selector.css (.machine-selector, token-only, min-height + min-width
  var(--space-7), no raw hex).
- src/ui/machine/MachineSelector.test.tsx (mock ../../machines/registry listMachines + ./MachineProvider
  useActiveMachine; the 3 tests from Failing Tests: renders labeled + options + value; selects the
  active id (active='arctic'); change→setActiveMachineId('arctic')).
Modified files:
- src/machines/registry.ts — add listMachines(): Machine[] = Object.values(MACHINES).
- src/machines/registry.test.ts — add the listMachines test.
- src/ui/regions/Header.tsx — render <MachineSelector/> FIRST in .cabinet__header-controls.
- src/ui/controls.touch-target.test.ts — read machine/machine-selector.css and add the
  .machine-selector entry to CONTROLS.

HARD CONSTRAINTS (verify before finishing):
- `git diff main..HEAD -- src/engine/` MUST be EMPTY (DEC-001).
- No new dependency. No new DEC. No raw hex in machine-selector.css (DEC-010).

Repo toolchain gotchas: ESLint has NO react-hooks plugin. NO @testing-library/user-event (use
render/fireEvent). JSX test files are .tsx. tsconfig include is ["src"]. Test stubs need only
{id, name}; `as unknown as Machine[]` on the stub array is fine (the selector reads only .id/.name).
App.test renders <App/> without a MachineProvider — MachineSelector's useActiveMachine returns the
default context value, so it renders one option; App.test stays green (do not wrap it).

Gate (all exit 0): just typecheck && just lint && just test && just build
Then confirm: `just validate` and `just cost-audit` pass; the new/updated tests ran and passed;
`git diff main..HEAD -- src/engine/` is EMPTY.

When done:
1. Fill "## Build Completion" (incl. 3 honest reflection answers).
2. Append a build cost session (cycle: build, agent: claude-sonnet-4-6, interface: claude-code,
   tokens_total: null + "orchestrator to fill tokens_total from subagent_tokens" note,
   recorded_at: 2026-07-07, notes).
3. Mark build [~] in the timeline.
4. Commit locally with a message referencing SPEC-050.
DO NOT git push / open a PR / run gh / run just advance-cycle.
```
