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
- [x] **build** — (Sonnet): implemented the spec's drop-in code verbatim (listMachines, MachineSelector
      + machine-selector.css + its tests, Header wiring, touch-target CONTROLS entry). Gate green:
      typecheck/lint/test (60 files, 356 tests)/build/validate/cost-audit all exit 0.
      `git diff main..HEAD -- src/engine/` EMPTY. Branch `feat/spec-050-machine-selector-ui`, local
      commit only (no push/PR). Left `[~]` for the orchestrator to flip to `[x]`.
- [x] **verify** — (Sonnet, cold): re-ran the full gate independently — typecheck/lint/test (60 files,
      356 tests)/build/validate/cost-audit all exit 0. Conformance confirmed by direct source read:
      `listMachines()` = `Object.values(MACHINES)`; `MachineSelector.tsx` matches the drop-in verbatim
      (`<select aria-label="Machine">`, `value=activeMachineId`, `onChange` → `setActiveMachineId`,
      options from `listMachines()`); `machine-selector.css` has `min-height` AND `min-width` both
      `var(--space-7)`, no raw hex; `Header.tsx` renders `<MachineSelector/>` first in
      `.cabinet__header-controls`; `regions.css` `.cabinet__header` has the orchestrator's
      `flex-wrap: wrap` fix (in scope, confirmed present); `controls.touch-target.test.ts` has the
      `.machine-selector` CONTROLS entry. No `.skip`/`.only`/`xit` in touched test files.
      `git diff main..HEAD -- src/engine/` EMPTY; no MATH drift in any machine file.
      Adversarial mutations (all 3 bit as designed, clean reverts): (a) `onChange` → no-op: "switching
      the selection calls setActiveMachineId" FAILED (expected call with `'arctic'`, received 0 calls) —
      reverted, diff clean. (b) hard-coded `value={machines[0]?.id}`: "selects the active machine's id"
      FAILED (expected `'arctic'`, got `'wild-and-whimsical'`) — reverted, diff clean. (c)
      `machine-selector.css` `min-width: 1rem`: touch-target test FAILED
      (".machine-selector: missing min-width ≥44px") — reverted, diff clean. No teeth gaps; no added
      assertions needed. Preview sanity (dev server, port 5173): desktop — `.machine-selector`
      combobox "Machine" renders in `.cabinet__header-controls` with one option "Wild & Whimsical".
      Mobile (375px) — `.cabinet__header` scrollWidth (359) == clientWidth (359), no overflow, all
      three header controls on one row, machine name fully readable. Full gate re-run green post-revert
      (60 files, 356 tests). Guards EMPTY. **Defect count: 0.**
- [x] **ship** — completed 2026-07-07 (Opus): reconciled both sub-agents against git/disk; ran the
      preview check that SURFACED a mobile header-overflow regression (the ~164px selector spilled the
      Paytable button past the 359px cabinet at 375px) and applied the fix — `flex-wrap: wrap` on
      `.cabinet__header` (src/ui/regions/regions.css), re-previewed clean at 375px + desktop, no console
      errors. Filled build/verify cost from subagent_tokens (build 90710 tok / $0.60; verify 78562 tok
      / $0.52; totals 169272 tok / $1.12 / 4 sessions). Squash-merged PR #60 (CI CLEAN — all 7 checks
      SUCCESS), synced main. 0 defects; all 3 guard-mutations bit. Seventh STAGE-008 spec shipped
      (7/10). First visible change of the wave — the selector is live (one option today). DEC-001 clean
      (engine diff EMPTY); no new dep; no new DEC. SPEC-051 (Arctic) makes the switch multi-option +
      visibly/audibly real.
