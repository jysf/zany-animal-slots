---
# Maps to ContextCore task.* semantic conventions.
# This variant assumes Claude plays every role. The context normally
# in a separate handoff doc lives in the ## Implementation Context
# section below.

task:
  id: SPEC-003
  type: story                      # epic | story | task | bug | chore
  cycle: verify  # frame | design | build | verify | ship
  blocked: false
  priority: high
  complexity: M                    # S | M | L  (L means split it)

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
    - DEC-010
  constraints:
    - portrait-first
    - touch-targets-44
    - test-before-implementation
    - one-spec-per-pr
  related_specs:
    - SPEC-001
    - SPEC-002

value_link: "Delivers STAGE-001's four-region cabinet layout — the responsive portrait shell every game element renders into, and the first proof the design tokens drive real UI."

# Self-reported AI cost per cycle.
cost:
  sessions:
    - cycle: design
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      duration_minutes: 30
      recorded_at: 2026-06-19
      notes: "main-loop, not separately metered (AGENTS §4); design cycle"
    - cycle: build
      agent: claude-sonnet-4-6
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      duration_minutes: 15
      recorded_at: 2026-06-19
      notes: "metered build subagent (Sonnet); orchestrator to fill tokens_total from subagent_tokens"
  totals:
    tokens_total: 0
    estimated_usd: 0
    session_count: 0
---

# SPEC-003: Four-region portrait layout

## Context

Third spec of STAGE-001, after the scaffold (SPEC-001) and the design tokens
(SPEC-002). This builds the **four-region cabinet layout** — the responsive
portrait shell the whole game lives inside — and is the first spec to actually
*consume* the design tokens, proving them as the single source of visual truth.

The cabinet stacks four regions vertically (per the brief / STAGE-001):

- **Header** — the title / branding bar at the top.
- **Game** — the central play area (the 5×3 reel grid lands here in STAGE-003).
- **Status** — balance / bet readout (populated in STAGE-003).
- **Action** — the controls bar at the bottom (spin / bet / auto-spin later).

It is a styled but **empty** skeleton: the regions render, are themed with the
tokens, and fill the viewport in portrait — but contain only placeholders, no
game content, no interactivity, no engine.

See `STAGE-001-scaffold-and-design-system.md`, `docs/architecture.md` (module
layout: `src/ui/regions/`), `DEC-010` (styling approach), and SPEC-002's tokens.

## Goal

Render a four-region (Header / Game / Status / Action) portrait cabinet that
fills the viewport with the Game region flexing to take remaining space, styled
entirely with the design tokens, and correct across 375–430px. No game content,
no interactivity.

## Inputs

- **Files to read:** `src/styles/tokens.css` (the tokens to consume),
  `src/ui/App.tsx` + `src/ui/App.test.tsx` (SPEC-001's shell, to restructure),
  `docs/architecture.md` (module layout), `DEC-010` (global CSS + tokens).
- **Related code paths:** `src/ui/` (regions go in `src/ui/regions/`).

## Outputs

- **Files created:**
  - `src/ui/regions/Header.tsx`, `Game.tsx`, `Status.tsx`, `Action.tsx` — the
    four region components (presentational, placeholder content).
  - `src/ui/regions/regions.css` (or a layout stylesheet) — the cabinet + region
    styles, consuming tokens via `var(--…)`. Global CSS per DEC-010.
  - `src/ui/regions/regions.test.tsx` — structure tests (or extend App.test.tsx).
  - `src/styles/layout.test.ts` — the CSS token-usage test (see Failing Tests).
- **Files modified:**
  - `src/ui/App.tsx` — compose the four regions into the cabinet (restructured
    from SPEC-001's bare `<main>`), import the layout CSS.
  - `src/ui/App.test.tsx` — update SPEC-001's single assertion to the new
    four-region structure (the "Animal Slots" title moves into the Header/banner;
    `<main>` becomes the Game region).
- **New exports:** `Header`, `Game`, `Status`, `Action` (region components); `App`
  (unchanged default export).
- **Database changes:** none.

## Acceptance Criteria

- [ ] `App` renders four regions in vertical order: a **banner** (`<header>`)
      containing the "Animal Slots" title, a **main** Game region, a **Status**
      region, and an **Action/Controls** region — each with an accessible
      name/role.
- [ ] The layout fills the viewport height (portrait), with the **Game** region
      flexing to take the remaining space (Header/Status/Action sized to content).
- [ ] All themed visual values (colors, spacing, type) come from the design
      tokens via `var(--…)`; the layout CSS contains **no raw hex color
      literals** (proven by the token-usage test).
- [ ] Renders correctly across **375–430px** portrait widths (constraint
      `portrait-first`; verified by review/manual — jsdom can't compute layout).
- [ ] The Action region reserves a control row at least `var(--space-…)`-tall
      sized for future **≥44px** touch targets (constraint `touch-targets-44`;
      no interactive controls yet — just the reserved space).
- [ ] `just typecheck`, `just lint`, `just test`, `just build` all exit 0.

## Failing Tests

Written during **design**, BEFORE build. Build's job is to make these pass.

> Same jsdom caveat as SPEC-002: jsdom doesn't compute real layout, media
> queries, or resolved `var()` values. So we test (a) the **structure** via
> React Testing Library roles/names and (b) the **token-usage contract** by
> parsing the layout CSS source. Responsiveness/exact sizing is a review/manual
> check, not a jsdom unit test — don't fake one.

- **`src/ui/App.test.tsx`** (updated from SPEC-001)
  - `"renders the four cabinet regions"` — render `<App />`; assert all of:
    `getByRole('banner')`, `getByRole('main')`,
    `getByRole('region', { name: /status/i })`,
    `getByRole('region', { name: /controls/i })` are in the document.
  - `"shows the Animal Slots title in the header"` — assert
    `getByRole('heading', { name: /animal slots/i })` is within the banner.

- **`src/styles/layout.test.ts`** (token-usage contract for the layout CSS)
  - `"styles the layout with design tokens"` — read the layout CSS via
    `fs.readFileSync`; assert it references design tokens (e.g. at least one
    `var(--color-` and one `var(--space-`).
  - `"uses no raw hex color literals"` — assert the layout CSS contains no
    match for `/#[0-9a-fA-F]{3,8}\b/` (themed colors must be tokens, per DEC-010
    + the single-source-of-truth principle).

## Implementation Context

*Read this section (and the files it points to) before starting the build cycle.*

### Decisions that apply

- `DEC-001` (engine/presentation separation) — pure presentation under
  `src/ui/**`; no `src/engine/**` imports.
- `DEC-010` (global CSS + tokens, no CSS Modules/CSS-in-JS) — the styling
  approach this spec establishes in practice: global CSS files, prefixed class
  names (e.g. `.cabinet`, `.cabinet__header`), tokens via `var()`.

### Constraints that apply

- `portrait-first` — primary layout is portrait; must render correctly 375–430px.
  (Desktop device frame is SPEC-004 — for now desktop may be full-bleed or simply
  centered; don't break it, but don't build the frame here.)
- `touch-targets-44` — reserve the Action row sized for ≥44px controls (the
  controls themselves are STAGE-003).
- `test-before-implementation` — the failing tests above are written in design.
- `one-spec-per-pr`.

### Prior related work

- `SPEC-001` (shipped, PR #1) — created `App.tsx` (the bare `<main aria-label="Animal Slots">`)
  and `App.test.tsx`; this spec restructures both.
- `SPEC-002` (shipped, PR #2) — the design tokens this layout consumes.

### Out of scope (for this spec specifically)

If any of these feels necessary during build, write a new spec rather than
expanding this one:

- The desktop **device-frame** wrapper — **SPEC-004**.
- Any actual reels, symbols, balance/bet readout, or controls — placeholders
  only (STAGE-002 engine / STAGE-003 UI).
- Any interactivity, animation, engine, or audio.
- Reduced-motion handling (nothing animates yet) — revisit when motion arrives.
- New design tokens — reuse SPEC-002's set; if something's genuinely missing,
  note it rather than hardcoding a literal.

## Notes for the Implementer

- Cabinet = a full-height flex column (`100dvh`/`100vh` with a `dvh` fallback),
  Game region `flex: 1` to fill, Header/Status/Action content-sized.
- Semantics for testability: Header → `<header>` (role banner) with an
  `<h1>Animal Slots</h1>`; Game → `<main>`; Status → `<section aria-label="Status">`;
  Action → `<section aria-label="Controls">`. (These give the roles/names the
  tests assert; tune the labels only if you also update the tests.)
- Update SPEC-001's `App.test.tsx` assertion — the "Animal Slots" accessible
  name moves from `<main>` to the heading in the banner.
- Keep regions presentational and empty (a label/placeholder is fine). The grid,
  status, and controls fill them in later stages.
- Constrain the cabinet to a sensible max-width and center it so desktop isn't
  full-bleed-ugly, but do NOT build the device frame (SPEC-004).

---

## Build Completion

*Filled in at the end of the **build** cycle, before advancing to verify.*

- **Branch:** feat/spec-003-four-region-layout
- **PR (if applicable):** #3 — https://github.com/jysf/zany-animal-slots/pull/3
- **All acceptance criteria met?** yes
- **New decisions emitted:**
  - none
- **Deviations from spec:**
  - The spec listed `src/ui/regions/regions.test.tsx` as a separate file but the spec's Failing Tests placed them in `src/ui/App.test.tsx`; only `App.test.tsx` was updated (per the explicit Failing Tests section) — no separate `regions.test.tsx` was created, consistent with the spec text.
- **Follow-up work identified:**
  - SPEC-004 (desktop device-frame wrapper) — already noted in the stage backlog.

### Build-phase reflection (3 questions, short answers)

1. **What was unclear in the spec that slowed you down?**
   — The Outputs section listed `src/ui/regions/regions.test.tsx` as a new file, but the Failing Tests section placed the structure tests directly in `src/ui/App.test.tsx`. A small ambiguity, quickly resolved by following the Failing Tests section (the authoritative list).

2. **Was there a constraint or decision that should have been listed but wasn't?**
   — No missing constraints or decisions; DEC-010's BEM-ish prefix guidance and DEC-001's "no engine imports" covered everything encountered.

3. **If you did this task again, what would you do differently?**
   — Nothing material; the spec was clear and complete. A tiny clarification in the Outputs section ("update App.test.tsx; do not create a separate regions.test.tsx") would remove the ambiguity above.

---

## Reflection (Ship)

*Appended during the **ship** cycle.*

1. **What would I do differently next time?**
   — <answer>

2. **Does any template, constraint, or decision need updating?**
   — <answer>

3. **Is there a follow-up spec I should write now before I forget?**
   — <answer>
