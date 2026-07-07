---
# Maps to ContextCore task.* semantic conventions.
# This variant assumes Claude plays every role. The context normally
# in a separate handoff doc lives in the ## Implementation Context
# section below.

task:
  id: SPEC-050
  type: story                      # epic | story | task | bug | chore
  cycle: ship  # frame | design | build | verify | ship
  blocked: false
  priority: medium
  complexity: M                    # S | M | L  (L means split it)

project:
  id: PROJ-002
  stage: STAGE-008
repo:
  id: animal-slots

agents:
  architect: claude-opus-4-8       # design/frame: Opus (judgement-heavy). See AGENTS §8.
  implementer: claude-sonnet-4-6   # build/verify: Sonnet (execution against the spec)
  created_at: 2026-07-07

references:
  decisions:
    - DEC-001   # engine-no-dom: the selector is pure UI; the engine never sees it
    - DEC-010   # global CSS, prefixed classes, no raw hex — the selector styles this way
    - DEC-015   # config-driven machine model: the selector lists registered machines + drives the active one
  constraints:
    - engine-no-dom
    - touch-targets-44
  related_specs:
    - SPEC-049  # the reactive context this selector DRIVES (setActiveMachineId)
    - SPEC-048  # theme/audio slice — a switch re-applies both
    - SPEC-047  # parameterized engine reads — a switch re-runs them (reels + paytable)
    - SPEC-051  # Arctic — the first second machine that makes a switch visibly/audibly meaningful

value_link: >-
  Ships STAGE-008's user-facing variety control: an in-app machine selector wired to the reactive
  context (SPEC-049), so choosing a machine re-renders the reels, paytable, theme, and audio together
  and the choice persists across reload. The control the themed machines (SPEC-051/052/053) are picked
  through.

cost:
  sessions:
    - cycle: design
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: null   # design cycle runs on the orchestrator's main Opus loop — not separately metered
      recorded_at: 2026-07-07
      note: >-
        Design authored on the main Opus orchestrator loop (un-metered). No numeric pins — the
        selector renders the registry's machines (today one: Wild & Whimsical) and drives SPEC-049's
        setActiveMachineId. Verified the header controls pattern (MuteToggle/PaytableSheet in
        .cabinet__header-controls), the touch-target contract test enumerates control classes (add
        .machine-selector), and consumers render without a provider (default context) so existing
        tests stay green.
    - cycle: build
      interface: claude-code
      model: claude-sonnet-4-6
      tokens_total: 90710    # from Agent result subagent_tokens
      estimated_usd: 0.60    # 90710 tok × $6.6/M (Sonnet)
      duration_minutes: 12.7 # 760789 ms
      recorded_at: 2026-07-07
      note: >-
        Implemented the spec's drop-in code verbatim: listMachines() in src/machines/registry.ts,
        the new src/ui/machine/MachineSelector.tsx + machine-selector.css + MachineSelector.test.tsx,
        Header.tsx rendering MachineSelector first in .cabinet__header-controls, and the
        controls.touch-target.test.ts CONTROLS entry for .machine-selector. Gate green: typecheck,
        lint, test (60 files / 356 tests, all passing, including the 3 new MachineSelector tests +
        the new listMachines test), build, validate, and cost-audit all exit 0.
        `git diff main..HEAD -- src/engine/` confirmed EMPTY (DEC-001). No new dependency, no new DEC,
        no raw hex in machine-selector.css (DEC-010).
    - cycle: verify
      interface: claude-code
      model: claude-sonnet-4-6
      tokens_total: 78562    # from Agent result subagent_tokens
      estimated_usd: 0.52    # 78562 tok × $6.6/M (Sonnet)
      duration_minutes: 37.5 # 2247420 ms
      recorded_at: 2026-07-07
      note: >-
        Cold re-verification: re-ran the full gate independently (typecheck, lint, test — 60 files /
        356 tests, build, validate, cost-audit — all exit 0). Confirmed conformance by reading the
        changed source directly (registry.ts, MachineSelector.tsx, machine-selector.css, Header.tsx,
        regions.css, controls.touch-target.test.ts) against the spec's Acceptance Criteria and drop-in
        code. All three adversarial guard-mutations (no-op onChange; hard-coded select value; sub-44px
        min-width) each broke exactly the intended test, then reverted clean — no teeth gaps.
        `git diff main..HEAD -- src/engine/` EMPTY; no MATH drift. Preview-verified via dev server on
        port 5173: selector renders with one option "Wild & Whimsical", aria-label "Machine"; at 375px
        `.cabinet__header` does not overflow (scrollWidth == clientWidth). Full gate re-run green after
        reverting all mutations. Defect count: 0.
    - cycle: ship
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      duration_minutes: 18
      recorded_at: 2026-07-07
      note: >-
        main-loop, not separately metered (AGENTS §4); ship cycle. Reconciled both sub-agents against
        git/disk, ran the preview check that surfaced a mobile header-overflow regression + applied
        the flex-wrap fix (src/ui/regions/regions.css) + re-previewed clean at 375px/desktop, filled
        build+verify cost from subagent_tokens, PR + CI-poll + squash-merge + backlog rollup + archive.
  totals:
    tokens_total: 169272   # build 90710 + verify 78562
    estimated_usd: 1.12    # build $0.60 + verify $0.52
    session_count: 4       # design, build, verify, ship
---

# SPEC-050: Machine selector UI

## Context

SPEC-049 made the active machine a reactive, persisted React Context (`useActiveMachine` exposes
`{ machine, activeMachineId, setActiveMachineId }`), but **nothing in the app calls
`setActiveMachineId` yet** — the seam is inert. This spec ships the user-facing control that drives
it: an in-app **machine selector** in the header. Choosing a machine calls `setActiveMachineId`,
which re-renders every subscriber — the reels (`Game`), the paytable (`PaytableSheet`), the theme
(`useMachineTheme`), and the audio (`useMachineAudio`) all update together (the SPEC-047/048/049
payoff) — and the choice persists across reload (localStorage, via SPEC-049).

Only the default machine is registered today (the themed machines are SPEC-051/052/053, which the
stage's dependency order requires to ship *after* this selector infrastructure). So the selector
renders a single option now and becomes visibly/audibly meaningful the moment SPEC-051 (Arctic)
registers a second machine — the same "infrastructure first, data second" pattern the whole stage
follows. It is a small, pure-UI addition (DEC-001): a themed control in the header, token-styled
(DEC-010), ≥44px (constraint touch-targets-44).

## Goal

Add an in-app machine-selector control to the header that lists the registered machines and, on
selection, calls `setActiveMachineId` from the active-machine context — so switching re-renders the
reels, paytable, theme, and audio together and the choice persists across reload. A `listMachines()`
registry helper provides the options.

## Inputs

- **Files to read:**
  - `src/machines/registry.ts` — `MACHINES`, `getMachine`, `DEFAULT_MACHINE_ID` (add `listMachines`).
  - `src/ui/machine/MachineProvider.tsx` — `useActiveMachine()` (`activeMachineId`, `setActiveMachineId`).
  - `src/ui/regions/Header.tsx` — the header; renders `.cabinet__header-controls` (MuteToggle + PaytableSheet).
  - `src/ui/audio/MuteToggle.tsx` + `src/ui/audio/audio.css` (`.mute-toggle`) — the header-control pattern + styling to mirror.
  - `src/ui/controls.touch-target.test.ts` — the ≥44px contract test that enumerates control classes.
- **Related code paths:** `src/ui/machine/`, `src/ui/regions/`, `src/machines/`.

## Outputs

- **Files created:**
  - `src/ui/machine/MachineSelector.tsx` — the selector `<select>` control.
  - `src/ui/machine/machine-selector.css` — token-based styling (`.machine-selector`, ≥44px, re-themes via vars).
  - `src/ui/machine/MachineSelector.test.tsx`.
- **Files modified:**
  - `src/machines/registry.ts` — add `listMachines(): Machine[]`.
  - `src/machines/registry.test.ts` — test `listMachines`.
  - `src/ui/regions/Header.tsx` — render `<MachineSelector/>` in `.cabinet__header-controls`.
  - `src/ui/controls.touch-target.test.ts` — add `.machine-selector` to the enumerated controls.
- **New exports:** `listMachines` (registry.ts); `MachineSelector` (default export).
- **Database changes:** none.

## Acceptance Criteria

- [ ] `listMachines()` returns the registered machines (`Object.values(MACHINES)`) — today `[WILD_AND_WHIMSICAL]`.
- [ ] `MachineSelector` renders a `<select>` with an accessible name "Machine", one `<option>` per
      registered machine (option label = `machine.name`, value = `machine.id`), with the active
      machine's id as the selected value (read from `useActiveMachine().activeMachineId`).
- [ ] Changing the selection calls `setActiveMachineId(newId)` from the context (the switch: subscribers
      re-render; SPEC-049 persists it).
- [ ] The selector sits in the header's `.cabinet__header-controls` (alongside MuteToggle + PaytableSheet).
- [ ] The control is ≥44px (constraint touch-targets-44): `.machine-selector` declares `min-height`
      AND `min-width` at `var(--space-7)`, and it is added to `controls.touch-target.test.ts`'s list.
- [ ] Token-only styling (DEC-010): `.machine-selector` uses `var(--color-*)` / `var(--space-*)` —
      no raw hex — so it re-themes with the active machine.
- [ ] Pure UI (DEC-001): `git diff main..HEAD -- src/engine/` is EMPTY.
- [ ] `just typecheck && just lint && just test && just build && just validate && just cost-audit` all pass.

## Failing Tests

Written now, BEFORE build.

- **`src/machines/registry.test.ts`** (ADD):
  - `"listMachines returns the registered machines"` — `expect(listMachines()).toContain(WILD_AND_WHIMSICAL)`
    and `expect(listMachines().length).toBeGreaterThanOrEqual(1)`.

- **`src/ui/machine/MachineSelector.test.tsx`** (mock the two deps so the test controls options + the
  setter spy; `import { render, screen, fireEvent } from '@testing-library/react'`):
  - Mock `../../machines/registry` → `listMachines` is a `vi.fn()`; mock `./MachineProvider` →
    `useActiveMachine` is a `vi.fn()`. Set their return values per test.
  - `"renders a labeled machine selector with an option per registered machine"` — `listMachines` →
    `[{ id: 'wild-and-whimsical', name: 'Wild & Whimsical' }]`; `useActiveMachine` →
    `{ activeMachineId: 'wild-and-whimsical', setActiveMachineId: vi.fn() }`; assert
    `screen.getByRole('combobox', { name: /machine/i })` exists, an option with text
    "Wild & Whimsical" is present, and the select's `value` is `'wild-and-whimsical'`.
  - `"selects the active machine's id"` — `listMachines` → two stubs
    `[{id:'wild-and-whimsical',name:'W&W'},{id:'arctic',name:'Arctic'}]`; `useActiveMachine` →
    `{ activeMachineId: 'arctic', setActiveMachineId: vi.fn() }`; assert the select's `value` is
    `'arctic'` (proves the selected value tracks `activeMachineId`, not a hard-coded default).
  - `"switching the selection calls setActiveMachineId with the chosen id"` — same two stubs;
    `useActiveMachine` → `{ activeMachineId: 'wild-and-whimsical', setActiveMachineId: spy }`; render;
    assert 2 options; `fireEvent.change(select, { target: { value: 'arctic' } })`;
    `expect(spy).toHaveBeenCalledWith('arctic')`.

- **`src/ui/controls.touch-target.test.ts`** (MODIFY): add
  `{ label: '.machine-selector (machine-selector.css)', cssSource: machineSelectorCss, selector: '.machine-selector' }`
  to `CONTROLS` (and read the new CSS file) — the existing `it('interactive controls are ≥44px')` then
  asserts `.machine-selector` has `min-height` + `min-width` at a 44px-equivalent.

## Implementation Context

### Decisions that apply

- `DEC-001` (engine-no-dom) — the selector is pure UI; the engine is untouched. `git diff src/engine/` EMPTY.
- `DEC-010` (global CSS, prefixed classes, no raw hex) — `.machine-selector` in its own CSS file,
  token-only values (so it re-themes with the active machine).
- `DEC-015` (config-driven machine model) — the selector lists `MACHINES` and drives the active one;
  adding a machine (SPEC-051+) makes it appear automatically. No engine logic.

### Constraints that apply

- `engine-no-dom` — UI only.
- `touch-targets-44` — `.machine-selector` ≥44px (both dimensions), enforced by `controls.touch-target.test.ts`.

### Prior related work

- `SPEC-049` (shipped) — the reactive context this drives; `setActiveMachineId` persists + re-renders.
- `SPEC-026` (shipped) — MuteToggle established the header-control pattern (aria-label, token CSS, ≥44px) to mirror.

### Out of scope (for this spec specifically)

- **The themed machines** — SPEC-051/052/053. With one machine registered the selector shows one
  option; the visible/audible switch is exercised end-to-end (and preview-verified) starting SPEC-051.
- **Balance/bet reset on switch** — the wallet persists across a switch (SPEC-049's seam); no reset
  UX here.
- **A fancy custom dropdown** — a native `<select>` is used (accessible, keyboard-friendly,
  re-themes via tokens); a bespoke popup is unnecessary polish.

## Notes for the Implementer

**Toolchain brief:** ESLint has NO react-hooks plugin. NO `@testing-library/user-event` — use
`render`/`fireEvent`. JSX test files are `.tsx`. `tsconfig` include is `["src"]`. No new dependency.
No new DEC. DEC-010: no raw hex in the CSS.

**`src/machines/registry.ts`** — add after `getMachine` (keep everything else):

```ts
/** All registered machines, in registration order — the selector's option list (SPEC-050). */
export function listMachines(): Machine[] {
  return Object.values(MACHINES);
}
```

**`src/ui/machine/MachineSelector.tsx`:**

```tsx
// MachineSelector — header control to switch the active machine (SPEC-050).
// Lists the registry's machines and drives SPEC-049's setActiveMachineId; a switch
// re-renders reels + paytable + theme + audio together and persists (DEC-015).
// DEC-001: pure UI. DEC-010: token-only styling via machine-selector.css.
// constraint touch-targets-44: .machine-selector is ≥44px.
import { listMachines } from '../../machines/registry';
import { useActiveMachine } from './MachineProvider';
import './machine-selector.css';

export default function MachineSelector() {
  const { activeMachineId, setActiveMachineId } = useActiveMachine();
  const machines = listMachines();

  return (
    <select
      className="machine-selector"
      aria-label="Machine"
      value={activeMachineId}
      onChange={(e) => setActiveMachineId(e.target.value)}
    >
      {machines.map((m) => (
        <option key={m.id} value={m.id}>
          {m.name}
        </option>
      ))}
    </select>
  );
}
```

**`src/ui/machine/machine-selector.css`** (mirror `.mute-toggle`; token-only; ≥44px both dims):

```css
/*
 * Machine selector — header <select> to switch the active machine (SPEC-050).
 * DEC-010: token-only, prefixed class, no raw hex — re-themes with the active machine.
 * constraint touch-targets-44: ≥44px hit area (min-height + min-width).
 */

.machine-selector {
  /* ≥44px hit area (constraint: touch-targets-44). */
  min-height: var(--space-7);   /* 3rem = 48px */
  min-width: var(--space-7);
  padding: var(--space-1) var(--space-2);

  background: transparent;
  border: 1px solid var(--color-text-muted);
  border-radius: var(--radius-md);
  color: var(--color-text-muted);
  font-family: var(--font-family-body);
  font-size: var(--font-size-base);
  cursor: pointer;

  flex-shrink: 0;
}

.machine-selector:hover,
.machine-selector:focus-visible {
  color: var(--color-text);
  border-color: var(--color-text);
}
```

**`src/ui/regions/Header.tsx`** — render the selector first in the controls cluster:

```tsx
import MachineSelector from '../machine/MachineSelector';
// ...
<div className="cabinet__header-controls">
  <MachineSelector />
  <MuteToggle muted={muted} onToggle={onToggleMute} />
  <PaytableSheet />
</div>
```

**`src/ui/controls.touch-target.test.ts`** — read the new CSS and add the control entry:

```ts
const MACHINE_SELECTOR_CSS = resolve(__dirname, 'machine/machine-selector.css');
const machineSelectorCss = readFileSync(MACHINE_SELECTOR_CSS, 'utf-8');
// ...in CONTROLS:
{ label: '.machine-selector (machine-selector.css)', cssSource: machineSelectorCss, selector: '.machine-selector' },
```

**MachineSelector.test.tsx mocking sketch** (both deps mocked so options + setter are controlled):

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MachineSelector from './MachineSelector';
import { listMachines } from '../../machines/registry';
import { useActiveMachine } from './MachineProvider';

vi.mock('../../machines/registry', () => ({ listMachines: vi.fn() }));
vi.mock('./MachineProvider', () => ({ useActiveMachine: vi.fn() }));

const mockedList = vi.mocked(listMachines);
const mockedUse = vi.mocked(useActiveMachine);

beforeEach(() => { vi.clearAllMocks(); });
// each test sets mockedList.mockReturnValue([...]) and mockedUse.mockReturnValue({...})
```

(The option stubs need only `{ id, name }`; cast as needed to satisfy `Machine[]` — a
`as unknown as Machine[]` on the stub array is acceptable in the test, since the selector only reads
`.id` and `.name`.)

**Why not a no-op:** unlike SPEC-047/048/049 this ADDS a visible header control. Preview-verify: the
selector renders in the header, themed, showing "Wild & Whimsical". The multi-option switch (reels +
paytable + theme + audio changing together) is exercised end-to-end starting SPEC-051 (Arctic) — note
that in the ship entry.

**Verify-cycle adversarial checks (teeth):** (a) make `onChange` ignore the event (never call
`setActiveMachineId`) → the "switching calls setActiveMachineId" test must FAIL; revert. (b) hard-code
the `<select value>` to `DEFAULT_MACHINE_ID` (or the first machine) instead of `activeMachineId` → the
"selects the active machine's id" test (active = 'arctic') must FAIL; revert. Each mutation must break
a test.

---

## Build Completion

*Filled in at the end of the **build** cycle, before advancing to verify.*

- **Branch:** `feat/spec-050-machine-selector-ui`
- **All acceptance criteria met?** yes
- **New decisions emitted:** none (UI control under DEC-015/DEC-010, as expected).
- **Deviations from spec:** none — implemented the drop-in code verbatim (`MachineSelector.tsx`,
  `machine-selector.css`, the registry `listMachines()` addition, `Header.tsx`, and the
  `controls.touch-target.test.ts` entry). `MachineSelector.test.tsx` follows the mocking sketch;
  the third test also asserts `screen.getAllByRole('option')` has length 2 as a light extra check
  before firing the change event.
- **Follow-up work identified:** none beyond what the spec already calls out (SPEC-051 Arctic makes
  the switch visibly/audibly meaningful with a second option).
- **Orchestrator post-build fix (preview-surfaced):** the mobile preview (375px) showed the added
  selector (~164px, sized to "Wild & Whimsical") pushed the header controls past the cabinet's right
  edge — a layout regression the spec's drop-in didn't anticipate. Added `flex-wrap: wrap` to
  `.cabinet__header` (`src/ui/regions/regions.css`) so the controls cluster drops to its own row on a
  narrow phone (single row where there's width); no overflow at any width, machine name stays fully
  readable. Committed separately on the branch; gate re-run green (356 tests). DEC-001 still EMPTY.

### Build-phase reflection (3 questions, short answers)

1. **What was unclear in the spec that slowed you down?** — Nothing; the Notes section's drop-in
   code was complete and unambiguous for every file, so this was a direct transcription task.
2. **Was there a constraint or decision that should have been listed but wasn't?** — No gaps found;
   DEC-001/DEC-010/DEC-015 and the touch-targets-44 constraint fully covered the surface area touched.
3. **If you did this task again, what would you do differently?** — Nothing material; the spec's
   "Notes for the Implementer" section made this a low-risk, mechanical build.

---

## Reflection (Ship)

*Appended during the **ship** cycle. Outcome-focused, distinct from the build reflection.*

1. **What would I do differently next time?**
   — Budget for layout in the design when a spec ADDS a control to a fixed-width, crowded container.
     The spec nailed the control's behavior/a11y/theming but didn't consider that a ~164px `<select>`
     (sized to "Wild & Whimsical") would overflow the 359px phone cabinet's header. Preview-verify
     caught it and a one-line `flex-wrap: wrap` on `.cabinet__header` fixed it, but the design should
     have flagged the header's width budget up front (or specified a `max-width`/wrap for the control
     cluster) rather than discovering it at preview. Lesson: for a visible addition to a
     portrait-phone-first layout, reason about the narrowest target's width in the design.

2. **Does any template, constraint, or decision need updating?**
   — No new DEC (UI control under DEC-015/DEC-010; DEC-001 intact — engine diff EMPTY). No
     constraint/template change. Logged a signal to the PROJ-002 set: a spec that adds a control to a
     fixed-width container must reason about the narrowest viewport's width budget at design time, and
     preview-verify at 375px is the backstop that catches it.

3. **Is there a follow-up spec I should write now before I forget?**
   — No new spec. The selector is live and the reactive plumbing (SPEC-047/048/049) is all wired, so
     **SPEC-051 (Arctic)** is the immediate next step — it registers the second machine, at which point
     the selector shows two options and a switch becomes visibly/audibly real (reels + paytable + theme
     + audio all changing together). SPEC-051's preview-verify should exercise exactly that end-to-end
     switch (pick Arctic → assert the theme CSS vars, paytable, and reels update; reload → Arctic
     persists). SPEC-052 (Desert) + SPEC-053 (Ocean) follow the same pattern to complete the
     4-machine set.
