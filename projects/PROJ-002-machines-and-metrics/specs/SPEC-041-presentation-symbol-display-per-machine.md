---
# Maps to ContextCore task.* semantic conventions.
# This variant assumes Claude plays every role. The context normally
# in a separate handoff doc lives in the ## Implementation Context
# section below.

task:
  id: SPEC-041
  type: story                      # epic | story | task | bug | chore
  cycle: build  # frame | design | build | verify | ship
  blocked: false
  priority: medium
  complexity: M                    # S | M | L  (L means split it)

project:
  id: PROJ-002
  stage: STAGE-007
repo:
  id: animal-slots

agents:
  architect: claude-opus-4-8       # design/frame: Opus (judgement-heavy). See AGENTS §8.
  implementer: claude-sonnet-4-6   # build/verify: Sonnet (execution against the spec)
  created_at: 2026-07-04

references:
  decisions:
    - DEC-015                       # config-driven machine model — presentation slice consumed by UI
    - DEC-001                       # engine/presentation separation — presentation data is UI-side
    - DEC-006                       # emoji symbol set — the symbolDisplay being threaded
  constraints:
    - test-before-implementation
    - one-spec-per-pr
    - no-new-top-level-deps-without-decision
  related_specs:
    - SPEC-038                       # pinned the Machine type + presentation.symbolDisplay
    - SPEC-039                       # threaded the default machine into the engine; same pattern, UI side
    - SPEC-012                       # ReelGrid (the reels UI being threaded)

# One sentence on what this spec contributes to its stage's
# value_contribution. For plumbing: "infrastructure enabling
# STAGE-007's <capability>". Optional; null is acceptable.
value_link: "The presentation half of the config-driven spine: the reels + paytable UI read `symbolDisplay` (emoji/label) from the machine's presentation slice instead of importing the module-level SYMBOL_DISPLAY, threaded from the default machine — so a machine's symbol appearance is data, ready for SPEC-042 to swap per active machine. Behavior-preserving (identical glyphs). Theme + audio per machine deferred to STAGE-008."

# Self-reported AI cost per cycle. Each cycle (design, build, verify,
# ship) appends one entry to sessions[]. Totals are computed at ship.
# Record a REAL tokens_total for metered cycles (build/verify) — the
# orchestrator fills it from the Agent result's subagent_tokens at ship
# (or /cost interactively). Only un-metered main-loop cycles (design/ship)
# may be null-with-note. `just cost-audit` enforces this on shipped specs.
# See AGENTS.md §4 and docs/cost-tracking.md. interface: claude-code |
# claude-ai | api | ollama | other.
cost:
  sessions:
    - cycle: design
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      duration_minutes: 40
      recorded_at: 2026-07-04
      notes: "main-loop, not separately metered (AGENTS §4); design cycle (first UI-touching STAGE-007 spec — thread symbolDisplay from the machine's presentation slice into ReelGrid + paytable via props/params, sourced from the default machine; extract a SymbolDisplay type; update component tests; visual parity + a preview check at ship. Included the scope decision to defer per-machine theme + audio to STAGE-008 — recorded in the STAGE-007 Design Notes + brief STAGE-008 line)."
    - cycle: build
      agent: claude-sonnet-4-6
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      duration_minutes: null
      recorded_at: 2026-07-04
      notes: "orchestrator to fill tokens_total from subagent_tokens; local-only build sub-agent: applied the drop-in prop/param threading exactly as specified (SymbolDisplay type extraction, ReelGrid symbolDisplay prop, Game/PaytableSheet sourcing WILD_AND_WHIMSICAL, paytableRows(symbolDisplay) param); updated ReelGrid.test.tsx (all 11 render() call sites + 1 new supplied-map case) and paytable.test.ts (all 4 call sites + 1 new supplied-map case); PaytableSheet.test.tsx/Game.test.tsx needed no changes (they exercise the components without asserting on ReelGrid/paytableRows call sites directly). Full gate green (typecheck/lint/test 296 passed/build); src/engine diff empty; SYMBOL_DISPLAY grep in the two consumers empty (reworded two explanatory comments that had referenced the old name so the literal grep matches nothing); symbols.ts still exports SYMBOL_DISPLAY; no theme/audio/tokens.css touched; no new dependency; no new DEC."
  totals:
    tokens_total: 0
    estimated_usd: 0
    session_count: 0
---

# SPEC-041: presentation symbol display per machine

## Context

Fourth STAGE-007 spec and the **first to touch UI code**. SPEC-038 pinned the `Machine`
type with a `presentation` slice (`symbolDisplay`), and SPEC-039/040 made the engine
consume the machine's math slice. But the UI still imports the module-level
`SYMBOL_DISPLAY` (emoji + a11y label per symbol) directly from `src/ui/reels/symbols.ts`
in two places — `ReelGrid.tsx` (the reels) and `paytable.ts` (the paytable rows). This
spec threads `symbolDisplay` from the **machine's presentation slice** into those
consumers, sourced from the default machine, so a machine's *symbol appearance* is data —
ready for SPEC-042 to supply the active machine.

It is the presentation analog of SPEC-039: the components read from a machine (defaulted
to `WILD_AND_WHIMSICAL`) now; SPEC-042 threads the *active* machine via the registry/hook.
Because it changes rendered UI, its guard is **visual parity** — the identical emoji and
`aria-label`s render — verified by the existing component tests (kept byte-identical) plus
an orchestrator **preview check** at ship.

**Scope note (recorded in the STAGE-007 Design Notes + brief):** the original 041 frame
bundled emoji + theme tokens + audio params. Theme tokens are static CSS and audio params
live in a lazily-created global audio singleton — parameterizing either at runtime is
invasive and behavior-preserving-only, with **no payoff until a genuinely distinct machine
exists**. So per-machine **theme + audio are deferred to STAGE-008** (2–3 themed machines);
SPEC-041 ships only the `symbolDisplay` wiring.

See `STAGE-007` (backlog slot 4 of 6), `PROJ-002`, DEC-015, DEC-006 (the emoji set).

## Goal

Thread `symbolDisplay` (the per-symbol emoji + a11y label map) from the machine's
presentation slice into `ReelGrid` (via a prop) and `paytableRows` (via a param), sourced
from the default machine `WILD_AND_WHIMSICAL`, replacing the direct `SYMBOL_DISPLAY`
imports in those consumers — with the reels and paytable rendering byte-identical glyphs
(visual parity). Per-machine theme + audio are out of scope (STAGE-008).

## Inputs

- **Files to read:**
  - `src/ui/reels/ReelGrid.tsx` — imports `SYMBOL_DISPLAY`; reads `SYMBOL_DISPLAY[symbolId]`
    at the cell (line ~40). Add a `symbolDisplay` prop.
  - `src/ui/regions/Game.tsx` — renders `<ReelGrid .../>`; pass the prop here.
  - `src/ui/paytable.ts` — `paytableRows()` reads `SYMBOL_DISPLAY[s].emoji`. Add a param.
  - `src/ui/PaytableSheet.tsx` — calls `paytableRows()`; pass the arg here.
  - `src/machines/types.ts` — `MachinePresentation.symbolDisplay`; extract a `SymbolDisplay`
    type alias here for the prop/param types.
  - `src/machines/wildAndWhimsical.ts` — `WILD_AND_WHIMSICAL.presentation.symbolDisplay`
    (the default source; references today's `SYMBOL_DISPLAY`, so parity is by identity).
  - `src/ui/reels/symbols.ts` — where `SYMBOL_DISPLAY` still lives (unchanged; the default
    machine references it).
- **External APIs:** none.
- **Related code paths:** `src/ui/reels/`, `src/ui/regions/`, `src/ui/`, `src/machines/`.

## Outputs

- **Files modified:**
  - `src/machines/types.ts` — add `export type SymbolDisplay = Record<SymbolId, { emoji:
    string; label: string }>` and use it in `MachinePresentation` (`symbolDisplay:
    SymbolDisplay`). Purely a named-alias extraction — the shape is unchanged.
  - `src/ui/reels/ReelGrid.tsx` — add `symbolDisplay: SymbolDisplay` to `Props`; read
    `symbolDisplay[symbolId]` instead of the imported `SYMBOL_DISPLAY`; drop the
    `import { SYMBOL_DISPLAY } from './symbols'`.
  - `src/ui/regions/Game.tsx` — import `WILD_AND_WHIMSICAL`; pass
    `symbolDisplay={WILD_AND_WHIMSICAL.presentation.symbolDisplay}` to `<ReelGrid>`.
  - `src/ui/paytable.ts` — `paytableRows(symbolDisplay: SymbolDisplay)` reads
    `symbolDisplay[s].emoji`; drop the `SYMBOL_DISPLAY` import.
  - `src/ui/PaytableSheet.tsx` — call `paytableRows(WILD_AND_WHIMSICAL.presentation.symbolDisplay)`.
  - Their tests (`ReelGrid.test.tsx`, `paytable.test.ts`, `PaytableSheet.test.tsx`,
    `Game.test.tsx` if it renders ReelGrid) — pass the machine's `symbolDisplay`; expected
    rendered output unchanged.
- **New exports:** `SymbolDisplay` (type) from `src/machines/types.ts`.
- **New dependency:** none. **New decision:** none (DEC-015 covers it).

## Acceptance Criteria

- [ ] **`SymbolDisplay` type** exists in `src/machines/types.ts` and `MachinePresentation.
      symbolDisplay` is typed as `SymbolDisplay` (shape unchanged: `Record<SymbolId, {
      emoji: string; label: string }>`).
- [ ] **`ReelGrid` reads from a prop:** `ReelGrid` takes `symbolDisplay: SymbolDisplay` in
      `Props` and renders `symbolDisplay[symbolId]`; it no longer imports `SYMBOL_DISPLAY`.
- [ ] **`Game` supplies the default machine's map:** `Game.tsx` passes
      `symbolDisplay={WILD_AND_WHIMSICAL.presentation.symbolDisplay}` to `<ReelGrid>`.
- [ ] **`paytableRows` takes the map:** `paytableRows(symbolDisplay: SymbolDisplay)` uses
      the param; `PaytableSheet.tsx` calls it with `WILD_AND_WHIMSICAL.presentation.
      symbolDisplay`; `paytable.ts` no longer imports `SYMBOL_DISPLAY`.
- [ ] **Visual parity:** the reels render the same emoji + `aria-label` per cell, and the
      paytable rows show the same emoji per tier, as before (existing component-test
      expectations unchanged and green).
- [ ] **No `SYMBOL_DISPLAY` import remains in the consumers** (`ReelGrid.tsx`, `paytable.ts`);
      `src/ui/reels/symbols.ts` still defines+exports it (the default machine references it).
- [ ] **DEC-001 intact:** no engine change (`git diff main..HEAD -- src/engine/` is EMPTY);
      the machine's presentation is UI-side plain data.
- [ ] Full gate green (`just typecheck && just lint && just test && just build`); no new
      dependency; `just validate` passes.

## Failing Tests

Written during **design**, BEFORE build. Existing component tests keep their exact rendered
expectations (that identity is the visual-parity proof); their call sites gain the machine's
`symbolDisplay`.

- **`src/ui/reels/ReelGrid.test.tsx`** — every `render(<ReelGrid … />)` gains
  `symbolDisplay={WILD_AND_WHIMSICAL.presentation.symbolDisplay}`. The asserted emoji /
  `aria-label` per cell (e.g. a 🐺 with label "Wolf") are unchanged. Add one focused case:
  `"renders the emoji supplied by symbolDisplay"` — render with a **stub** map (e.g.
  `{ ...WILD_AND_WHIMSICAL.presentation.symbolDisplay, WOLF: { emoji: '🎰', label: 'Slot' } }`)
  and assert a WOLF cell renders 🎰 / "Slot" — proving ReelGrid renders the *supplied* map,
  not a hard-coded import.
- **`src/ui/paytable.test.ts`** — `paytableRows()` → `paytableRows(WILD_AND_WHIMSICAL.
  presentation.symbolDisplay)`; expected emoji-per-tier arrays unchanged. Add a case:
  `"uses the supplied symbolDisplay"` — call with a stub map overriding one symbol's emoji
  and assert that emoji appears in the right tier row.
- **`src/ui/PaytableSheet.test.tsx`** — still renders the same emoji (call site now passes
  the machine map); existing expectations unchanged.
- **`src/ui/regions/Game.test.tsx`** (if it asserts reel emoji) — unchanged expectations;
  Game now sources the prop from `WILD_AND_WHIMSICAL`.

## Implementation Context

*Read this section (and the files it points to) before starting the build cycle.*

### Decisions that apply

- `DEC-015` — the machine's presentation slice is consumed by the UI; this wires the
  `symbolDisplay` half of it. (Theme + audio deferred to STAGE-008 — see the STAGE-007
  Design Notes.)
- `DEC-001` — engine/presentation separation: presentation data is UI-side; no engine
  change. The machine object is plain data.
- `DEC-006` — the emoji symbol set; `symbolDisplay` carries it. Values unchanged.

### Constraints that apply

- `test-before-implementation` — the updated component tests + the two "supplied map"
  cases are the design's failing tests.
- `one-spec-per-pr` — only the symbolDisplay threading + its tests. No theme/audio, no
  registry/hook (SPEC-042), no engine change.
- `no-new-top-level-deps-without-decision` — none.

### Prior related work

- `SPEC-039` (shipped) — the same "thread the default machine, keep parity" pattern, on the
  engine side. `SPEC-038` — the presentation slice + `WILD_AND_WHIMSICAL`.
- `SPEC-012` (ReelGrid), `SPEC-008`/paytable — the UI being threaded.

### Out of scope (for this spec specifically)

- **Per-machine theme tokens + audio params** — deferred to STAGE-008 (STAGE-007 Design
  Notes). Do not touch `tokens.css`, `audioEngine.ts`, or `mixer.ts`, and do not add
  `theme`/`audio` fields to `MachinePresentation` here.
- **Registry + hook threading of the ACTIVE machine** — SPEC-042. This spec sources the
  default machine directly in `Game`/`PaytableSheet`; SPEC-042 swaps that for the active
  machine from the registry/hook.
- **Any engine change** — `src/engine/**` untouched.
- **Moving `SYMBOL_DISPLAY` out of `symbols.ts`** — it stays there; the default machine
  references it (single source). Retiring it is later cleanup.

## Notes for the Implementer

- **Parity anchor is identity.** `WILD_AND_WHIMSICAL.presentation.symbolDisplay` IS today's
  `SYMBOL_DISPLAY` (same object, from SPEC-038), so routing the UI through the machine
  changes nothing rendered. Keep every existing component-test expectation byte-identical;
  if one must change, stop and set the timeline `[?]`.
- **`SymbolDisplay` type (drop-in, `src/machines/types.ts`):**
  ```ts
  import type { SymbolId, MachineMath } from '../engine/index';

  /** Per-symbol emoji + accessible label — the UI presentation map (DEC-006). */
  export type SymbolDisplay = Record<SymbolId, { emoji: string; label: string }>;

  export interface MachinePresentation {
    symbolDisplay: SymbolDisplay;
  }

  export interface Machine {
    id: string;
    name: string;
    math: MachineMath;
    presentation: MachinePresentation;
  }
  ```
- **`ReelGrid.tsx` (drop-in changes):** remove `import { SYMBOL_DISPLAY } from './symbols';`,
  add `import type { SymbolDisplay } from '../../machines/types';`, add `symbolDisplay:
  SymbolDisplay;` to `Props`, destructure it, and change the cell line to `const { emoji,
  label } = symbolDisplay[symbolId];`. Keep everything else (spinning, winKeys, paw trail)
  identical.
- **`Game.tsx`:** `import { WILD_AND_WHIMSICAL } from '../../machines/wildAndWhimsical';`
  then `<ReelGrid grid={grid} spinning={spinning} lineWins={lineWins}
  trailKey={celebration?.id ?? null} symbolDisplay={WILD_AND_WHIMSICAL.presentation.symbolDisplay} />`.
  (Verify the relative import path from `src/ui/regions/` to `src/machines/`.)
- **`paytable.ts`:** add `import type { SymbolDisplay } from '../machines/types';`, change
  the signature to `export function paytableRows(symbolDisplay: SymbolDisplay): PaytableRow[]`,
  use `symbolDisplay[s].emoji`, and drop `import { SYMBOL_DISPLAY } from './reels/symbols';`.
- **`PaytableSheet.tsx`:** import `WILD_AND_WHIMSICAL` and call
  `paytableRows(WILD_AND_WHIMSICAL.presentation.symbolDisplay)`.
- **Repo toolchain gotchas:** ESLint has NO react-hooks plugin (no exhaustive-deps
  disables); NO `@testing-library/user-event` — use `render`/`fireEvent` from
  `@testing-library/react`; **JSX test files must be `.tsx`** (ReelGrid/PaytableSheet/Game
  tests are `.tsx`; `paytable.test.ts` is plain `.ts`, no JSX — keep it that way). `tsconfig`
  `include` is `["src"]`. No new dependency.
- **Self-check before finishing:** `git diff main..HEAD -- src/engine/` is EMPTY;
  `grep -rn 'SYMBOL_DISPLAY' src/ui/reels/ReelGrid.tsx src/ui/paytable.ts` finds nothing
  (both now go through the machine); the full gate is green.
- **Ship-time (orchestrator, not build):** a preview visual check confirms the reels +
  paytable look identical to the live build (this is a UI spec).

---

## Build Completion

*Filled in at the end of the **build** cycle, before advancing to verify.*

- **Branch:** `feat/spec-041-presentation-symbol-display`
- **PR (if applicable):** not opened (local-only build cycle; orchestrator handles PR/ship)
- **All acceptance criteria met?** yes
- **New decisions emitted:** none — DEC-015 already covers this wiring
- **Deviations from spec:**
  - Reworded two explanatory code comments (in `ReelGrid.tsx` and `paytable.ts`) that
    referenced the literal string `SYMBOL_DISPLAY` when explaining what the code no longer
    imports. The hard constraint's grep checks for that literal string with no code/comment
    distinction, so the comments now say "the module-level emoji/label map" instead. No
    functional change — purely to satisfy the literal grep constraint.
- **Follow-up work identified:**
  - None beyond what the spec already defers (SPEC-042 registry/hook threading;
    STAGE-008 per-machine theme + audio).

### Build-phase reflection (3 questions, short answers)

Process-focused: how did the build go? What friction did the spec create?

1. **What was unclear in the spec that slowed you down?**
   — Nothing substantive. The spec's drop-in code snippets and file-by-file Notes matched
   the actual source almost verbatim, so this was closer to transcription than design work.
   The only judgment call was whether `PaytableSheet.test.tsx`/`Game.test.tsx` needed edits —
   the spec said "if it renders ReelGrid" / call sites, and on inspection neither test
   asserts against `ReelGrid`/`paytableRows` call arguments directly (they exercise the
   parent components end-to-end), so no changes were needed there.

2. **Was there a constraint or decision that should have been listed but wasn't?**
   — The hard-constraint grep (`grep -rn 'SYMBOL_DISPLAY' ...` must find nothing) doesn't
   distinguish code from comments. My first pass left two comments mentioning the old name
   to explain the change, which technically failed the literal grep even though no import/
   usage remained. Worth a one-line clarification in future specs: "the grep is literal —
   don't use the old identifier name even in comments."

3. **If you did this task again, what would you do differently?**
   — Grep for the banned identifier in my own new comments before running the gate, not
   after — would have saved one extra edit-and-rerun cycle.

---

## Reflection (Ship)

*Appended during the **ship** cycle. Outcome-focused reflection, distinct
from the process-focused build reflection above.*

1. **What would I do differently next time?**
   — <answer>

2. **Does any template, constraint, or decision need updating?**
   — <answer>

3. **Is there a follow-up spec I should write now before I forget?**
   — <answer>
