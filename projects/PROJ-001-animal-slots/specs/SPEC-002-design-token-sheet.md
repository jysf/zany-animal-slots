---
# Maps to ContextCore task.* semantic conventions.
# This variant assumes Claude plays every role. The context normally
# in a separate handoff doc lives in the ## Implementation Context
# section below.

task:
  id: SPEC-002
  type: story                      # epic | story | task | bug | chore
  cycle: build  # frame | design | build | verify | ship
  blocked: false
  priority: high
  complexity: S                    # S | M | L  (L means split it)

project:
  id: PROJ-001
  stage: STAGE-001
repo:
  id: animal-slots

agents:
  architect: claude-opus-4-8       # design/frame: Opus (judgement-heavy). See AGENTS §8.
  implementer: claude-sonnet-4-6   # build/verify: Sonnet (execution against the spec)
  created_at: 2026-06-19

references:
  decisions:
    - DEC-001
  constraints:
    - test-before-implementation
    - one-spec-per-pr
  related_specs:
    - SPEC-001

value_link: "Delivers STAGE-001's design-token system — the single source of visual truth (color, type scale, spacing) that every later UI spec (layout, reels, celebrations) consumes, and the seam PROJ-002's theme-swap will use."

# Self-reported AI cost per cycle.
cost:
  sessions:
    - cycle: design
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      duration_minutes: 25
      recorded_at: 2026-06-19
      notes: "main-loop, not separately metered (AGENTS §4); design cycle"
  totals:
    tokens_total: 0
    estimated_usd: 0
    session_count: 0
---

# SPEC-002: Design-token sheet

## Context

Second spec of STAGE-001 (Scaffold & design system), after SPEC-001 stood up the
buildable app + the `engine-no-dom` boundary. This spec establishes the
**design-token system** that STAGE-001's design notes call the "single source of
truth for visual values": colors, a type scale, and a spacing scale, expressed
once as CSS custom properties. Every later UI spec — the four-region layout
(SPEC-003), reels and controls (STAGE-003), celebrations (STAGE-004) — consumes
these tokens via `var(--token)` rather than literal hex/px, which is also what
makes PROJ-002's theme-swap (Arctic/Desert) a token-sheet swap later.

The theme is "Wild & Whimsical" — a warm wooden slot cabinet by a campfire under
a North-American-wildlife night sky. The tokens below encode that palette.

See parent stage `STAGE-001-scaffold-and-design-system.md`, project `brief.md`,
and `AGENTS.md` §5 (vanilla CSS + CSS custom properties, no UI component library).

## Goal

Add `src/styles/tokens.css` defining the design tokens (color, type scale,
spacing) as CSS custom properties on `:root`, imported once so they're available
app-wide — with a test asserting the required tokens are declared with non-empty
values. No component restyling.

## Inputs

- **Files to read:** `projects/PROJ-001-animal-slots/stages/STAGE-001-scaffold-and-design-system.md` (Design Notes — tokens are the single source of truth) and `AGENTS.md` §5/§11.
- **Related code paths:** `src/styles/` (exists, empty — from SPEC-001), `src/main.tsx` (the global import site).

## Outputs

- **Files created:**
  - `src/styles/tokens.css` — the token sheet: a `:root { … }` block declaring
    the required custom properties (see Acceptance Criteria), with a short
    header comment documenting the taxonomy and naming convention.
  - `src/styles/tokens.test.ts` — the failing tests below.
- **Files modified:**
  - `src/main.tsx` — add `import './styles/tokens.css'` so the tokens load
    globally (single import).
- **New exports:** none.
- **Database changes:** none.

## Acceptance Criteria

- [ ] `src/styles/tokens.css` defines a `:root` block with CSS custom properties
      covering all three categories (color, type scale, spacing).
- [ ] It declares **at least** the required semantic token names (the stable
      contract the rest of the UI codes against):
      - **Color:** `--color-bg`, `--color-surface`, `--color-frame`,
        `--color-text`, `--color-text-muted`, `--color-accent`, `--color-coin`,
        `--color-win-small`, `--color-win-big`, `--color-jackpot`,
        `--color-jackpot-sky`
      - **Type:** `--font-family-display`, `--font-family-body`,
        `--font-size-xs`, `--font-size-sm`, `--font-size-base`, `--font-size-lg`,
        `--font-size-xl`, `--font-size-2xl`, `--font-size-3xl`,
        `--line-height-tight`, `--line-height-base`, `--font-weight-normal`,
        `--font-weight-bold`, `--font-weight-black`
      - **Spacing:** `--space-0`, `--space-1`, `--space-2`, `--space-3`,
        `--space-4`, `--space-5`, `--space-6`, `--space-7`, `--space-8`
- [ ] Every declared custom property has a non-empty value (no `--x: ;`).
- [ ] `src/main.tsx` imports `./styles/tokens.css`.
- [ ] `just typecheck`, `just lint`, `just test`, `just build` all exit 0; the
      tokens tests pass.

## Failing Tests

Written during **design**, BEFORE build. Build's job is to make these pass.

> jsdom does not resolve `var()` / computed custom-property cascade reliably, so
> these tests assert the **declared token contract** by parsing the CSS source
> (and the import), not DOM-resolved computed values. That's the honest,
> deterministic thing to test for a token sheet — don't fake a `getComputedStyle`
> resolution test that jsdom can't actually back.

- **`src/styles/tokens.test.ts`**
  - `"declares every required design token on :root"` — read
    `src/styles/tokens.css` via `fs.readFileSync`; for each required token name
    (the full list in Acceptance Criteria), assert a declaration matching
    `/--token-name\s*:\s*[^;]+;/` exists (i.e. present with a non-empty value).
  - `"has no empty custom-property values"` — assert the file contains no
    declaration matching `/--[\w-]+\s*:\s*;/`.
  - `"is imported globally in main.tsx"` — read `src/main.tsx`; assert it
    imports `./styles/tokens.css`.

## Implementation Context

*Read this section (and the files it points to) before starting the build cycle.*

### Decisions that apply

- `DEC-001` (engine/presentation separation) — tokens are pure presentation
  (`src/styles/**`); nothing here touches `src/engine/**`. No engine imports.

### Constraints that apply

- `test-before-implementation` — the three failing tests above are written here
  in design; build makes them pass.
- `one-spec-per-pr` — only the token sheet + its import + its test.
- (Not yet relevant: `portrait-first`, `touch-targets-44` — those bite in
  SPEC-003's layout, which *consumes* these tokens.)

### Prior related work

- `SPEC-001` (shipped, PR #1) — created `src/styles/` and `src/main.tsx`; this
  spec adds `tokens.css` there and imports it from `main.tsx`.

### Out of scope (for this spec specifically)

If any of these feels necessary during build, write a new spec rather than
expanding this one:

- The four-region (Header/Game/Status/Action) layout — **SPEC-003**.
- The desktop device-frame wrapper — **SPEC-004**.
- Applying tokens to real components / any restyling — later (this spec only
  *declares* tokens + proves they load).
- Radius / shadow / elevation / motion-duration tokens — add when SPEC-003/004
  actually need them (keep this sheet to color + type + spacing).
- Web-font loading — use system font stacks for v1 (keeps the CSP tight for
  STAGE-006; a playful display webfont is a deferred enhancement).
- Dark mode / alternate themes (Arctic/Desert) — PROJ-002 theme-swap.

## Notes for the Implementer

- Start `tokens.css` with a short comment documenting the taxonomy and naming
  convention: `--<category>-<name>` (e.g. `--color-accent`, `--font-size-lg`,
  `--space-4`). Group by category with comments.
- **Suggested starter palette** (Wild & Whimsical campfire; tune freely as long
  as the required token names exist and resolve to non-empty values). It's fine
  for semantic tokens to reference a small raw palette via `var()`:
  - wood frame browns (`--color-frame`/`--color-surface`/`--color-bg` warm/dark),
    campfire orange for `--color-accent` (the spin button), gold for
    `--color-coin`, forest green for `--color-win-small`, a brighter
    campfire/amber for `--color-win-big`, gold + a deep night-sky for
    `--color-jackpot` / `--color-jackpot-sky`, cream for `--color-text`.
- Type scale in `rem`, roughly a 1.25 modular scale (`--font-size-base: 1rem`,
  up to `--font-size-3xl` for big-win/jackpot numbers). System font stacks for
  `--font-family-display` and `--font-family-body` (no external font).
- Spacing in `rem` on a 4px base (`--space-1: 0.25rem` … `--space-8: 4rem`,
  `--space-0: 0`).
- Single global import in `main.tsx` (`import './styles/tokens.css'`). Don't
  restyle `App.tsx` — that's later.

---

## Build Completion

*Filled in at the end of the **build** cycle, before advancing to verify.*

- **Branch:**
- **PR (if applicable):**
- **All acceptance criteria met?** yes/no
- **New decisions emitted:**
  - `DEC-NNN` — <title> (if any)
- **Deviations from spec:**
  - [list]
- **Follow-up work identified:**
  - [any new specs for the stage's backlog]

### Build-phase reflection (3 questions, short answers)

1. **What was unclear in the spec that slowed you down?**
   — <answer>

2. **Was there a constraint or decision that should have been listed but wasn't?**
   — <answer>

3. **If you did this task again, what would you do differently?**
   — <answer>

---

## Reflection (Ship)

*Appended during the **ship** cycle.*

1. **What would I do differently next time?**
   — <answer>

2. **Does any template, constraint, or decision need updating?**
   — <answer>

3. **Is there a follow-up spec I should write now before I forget?**
   — <answer>
