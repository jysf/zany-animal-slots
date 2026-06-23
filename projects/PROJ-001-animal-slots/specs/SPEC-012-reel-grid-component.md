---
# Maps to ContextCore task.* semantic conventions.

task:
  id: SPEC-012
  type: story
  cycle: verify
  blocked: false
  priority: high
  complexity: S

project:
  id: PROJ-001
  stage: STAGE-003
repo:
  id: animal-slots

agents:
  architect: claude-opus-4-8
  implementer: claude-sonnet-4-6
  created_at: 2026-06-23

references:
  decisions:
    - DEC-001
    - DEC-006
    - DEC-010
  constraints:
    - portrait-first
    - test-before-implementation
    - one-spec-per-pr
  related_specs:
    - SPEC-003
    - SPEC-011

value_link: "First STAGE-003 spec — renders the engine's 5×3 Grid as emoji in the cabinet, the visible surface every later spin/animation/celebration draws onto."

cost:
  sessions:
    - cycle: design
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      duration_minutes: 25
      recorded_at: 2026-06-23
      notes: "main-loop, not separately metered (AGENTS §4); design cycle"
    - cycle: build
      agent: claude-sonnet-4-6
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      duration_minutes: null
      recorded_at: 2026-06-23
      notes: "sub-agent build cycle — orchestrator to fill tokens_total/estimated_usd/duration from Agent result"
  totals:
    tokens_total: 0
    estimated_usd: 0
    session_count: 0
---

# SPEC-012: Reel grid component

## Context

The first STAGE-003 spec — the game gets a face. STAGE-002's engine produces a 5×3
`Grid` of `SymbolId`s; this spec renders that grid as emoji inside the cabinet's
Game region (SPEC-003), in a 5-reel × 3-row layout. The `SymbolId → emoji` mapping
lives in the **UI** (the engine is deliberately glyph-free — DEC-001/DEC-006); the
engine never knows about presentation. This is purely the static display surface —
no spin call, no animation, no controls yet (those are SPEC-013+). It gives every
later spec something real to render into.

See `STAGE-003-reels-ui-and-spin-flow.md`, `DEC-006` (the emoji per symbol),
`DEC-001` (UI consumes the engine only through `src/engine/index.ts`), `DEC-010`
(global CSS + tokens, no CSS-in-JS), and SPEC-003's `Game` region.

## Goal

Render a `Grid` (from `src/engine`) as a 5×3 emoji board in the Game region: a
`ReelGrid` component plus the UI's `SymbolId → { emoji, label }` map, styled with
tokens. The board shows a static initial grid until SPEC-013 wires live spins.

## Inputs

- **Files to read:** `src/engine/index.ts` (`Grid`, `SymbolId`, `SYMBOLS`),
  `src/ui/regions/Game.tsx` + `src/ui/regions/regions.css` (the `.cabinet__game`
  region to render into), `src/styles/tokens.css` (tokens), `DEC-006` (emoji set).
- **Related code paths:** `src/ui/`.

## Outputs

- **Files created:**
  - `src/ui/reels/symbols.ts` — `SYMBOL_DISPLAY: Record<SymbolId, { emoji: string;
    label: string }>` (the UI's glyph map) and `INITIAL_GRID: Grid` (a static,
    non-winning idle arrangement shown before the first spin).
  - `src/ui/reels/ReelGrid.tsx` — the `ReelGrid` component.
  - `src/ui/reels/reels.css` — the grid layout (tokens only, no raw hex).
  - `src/ui/reels/ReelGrid.test.tsx` — the Failing Tests below.
- **Files modified:**
  - `src/ui/regions/Game.tsx` — render `<ReelGrid grid={INITIAL_GRID} />` inside
    `.cabinet__game`; import `reels.css`.
- **New exports:**
  - `ReelGrid` (default or named) — `function ReelGrid({ grid }: { grid: Grid })`.
  - `SYMBOL_DISPLAY`, `INITIAL_GRID` from `reels/symbols.ts`.
- **Database changes:** none.

## Acceptance Criteria

- [ ] `ReelGrid` renders a `grid: Grid` as **5 reels × 3 cells = 15 cells**; each
      cell shows its symbol's emoji and carries an accessible label (the symbol's
      human name), e.g. `role="img"` + `aria-label`.
- [ ] `SYMBOL_DISPLAY` maps all 8 `SYMBOLS` to the DEC-006 emoji + a readable label
      (Deer 🦌, Fox 🦊, Squirrel 🐿️, Bear 🐻, Eagle 🦅, Owl 🦉, Bison 🦬, Wolf 🐺).
- [ ] The Game region renders the `ReelGrid` (with `INITIAL_GRID`) so the board is
      visible in the running app.
- [ ] Layout is token-driven (`reels.css`, no raw hex), 5 columns × 3 rows, and
      fits the portrait cabinet at 375–430px without overflow (`portrait-first`).
- [ ] No engine logic in the UI; `reels/*` import the engine only via
      `src/engine` (its `index.ts`). The engine is unchanged.
- [ ] `just typecheck`, `just lint`, `just test`, `just build` all exit 0.

## Failing Tests

Written during **design**, BEFORE build. These are **RTL behavior/structure**
tests (AGENTS §12) — the visual look is a review/preview-screenshot check, not a
unit test.

- **`src/ui/reels/ReelGrid.test.tsx`**
  - `"renders 15 symbol cells for a 5×3 grid"` — render `<ReelGrid grid={G} />`
    for a known grid `G`; assert `screen.getAllByRole('img')` has length 15.
  - `"renders the correct emoji and label per symbol"` — for a grid that includes
    `WOLF` and `DEER`, assert a cell with `aria-label` "Wolf" shows 🐺 and one
    labelled "Deer" shows 🦌 (use `getAllByLabelText`/text content).
  - `"maps every DEC-006 symbol to an emoji + label"` — for each id in `SYMBOLS`,
    `SYMBOL_DISPLAY[id]` has a non-empty `emoji` and `label`.
  - `"lays out five reels"` — assert five reel columns are present (e.g.
    `container.querySelectorAll('.reel')` has length 5, each with 3 cells).
  - `"INITIAL_GRID is a valid 5×3 grid of known symbols"` — `INITIAL_GRID` has 5
    reels of 3 cells, every cell ∈ `SYMBOLS`.

- **`src/ui/regions/Game.test.tsx`** (new)
  - `"the Game region renders the reel grid"` — render `<Game />`; assert the
    `main` (`role="main"`) contains 15 symbol cells (`getAllByRole('img')`).

## Implementation Context

### Decisions that apply

- `DEC-006` — the emoji per symbol + tier (here we only need the glyphs/labels).
- `DEC-001` — the UI imports the engine only via `src/engine` (`index.ts`); the
  engine has no emoji/DOM. `ReelGrid` is pure presentation.
- `DEC-010` — global CSS + tokens via `var()`, prefixed class names
  (`.reel-grid`, `.reel`, `.reel__cell`); no CSS-in-JS, no raw hex.

### Constraints that apply

- `portrait-first` — the board must fit the portrait cabinet (375–430px) cleanly.
- `test-before-implementation`, `one-spec-per-pr`.
- (`touch-targets-44` — N/A here; no interactive controls yet, those are SPEC-013.)

### Prior related work

- `SPEC-011` (shipped, PR #11) — `src/engine/index.ts` exports `Grid`, `SymbolId`,
  `SYMBOLS`. Import the `Grid`/`SymbolId` types from there.
- `SPEC-003` (shipped) — the four-region cabinet; `.cabinet__game` is the centered
  flex region the grid renders into.

### Out of scope (for this spec specifically)

- Any spin call, state machine, or balance/bet display (SPEC-013).
- Reel spin/stop animation or the reel-stop bounce (SPEC-016 / animation spec).
- Winning-line highlight (later STAGE-003 spec) and all celebration/audio
  (STAGE-004).
- Lifting grid into shared state — for now `Game` renders `INITIAL_GRID`; SPEC-013
  will lift the live grid into the spin-flow state and pass it down.

## Notes for the Implementer

- `SYMBOL_DISPLAY` (UI glyph map, DEC-006):
  `DEER 🦌 "Deer", FOX 🦊 "Fox", SQUIRREL 🐿️ "Squirrel", BEAR 🐻 "Bear",
  EAGLE 🦅 "Eagle", OWL 🦉 "Owl", BISON 🦬 "Bison", WOLF 🐺 "Wolf"`.
- Each cell: `<span className="reel__cell" role="img" aria-label={label}>{emoji}</span>`.
  Render reels as 5 columns (`grid[reel]`), each with its 3 cells (rows 0..2).
- `INITIAL_GRID` — a static, varied, non-winning arrangement for the idle board,
  e.g. `[[DEER,FOX,SQUIRREL],[BEAR,EAGLE,OWL],[BISON,DEER,FOX],[SQUIRREL,BEAR,EAGLE],
  [OWL,BISON,WOLF]]` typed as `Grid`.
- Layout: CSS grid or flex — 5 equal columns, 3 rows; size cells with tokens so the
  board fits 375px portrait without horizontal scroll. Emoji font-size from a token
  (reuse an existing size token; add one only if truly needed).
- Keep `ReelGrid` a pure function of its `grid` prop (no internal state) so SPEC-013
  can feed it live spin results.
- After building, the orchestrator does a preview screenshot check (375px +
  desktop) — make sure the board renders centered in the Game region.

---

## Build Completion

*Filled in at the end of the **build** cycle, before advancing to verify.*

- **Branch:** feat/spec-012-reel-grid
- **PR (if applicable):**
- **All acceptance criteria met?** yes
- **New decisions emitted:**
  - none
- **Deviations from spec:**
  - The spec says "import reels.css" in Game.tsx — the import is handled inside ReelGrid.tsx itself (which is the conventional pattern for co-located CSS in Vite). Game.tsx imports ReelGrid which carries the CSS. No behavioral difference.
- **Follow-up work identified:**
  - none beyond the existing STAGE-003 backlog

### Build-phase reflection (3 questions, short answers)

1. **What was unclear in the spec that slowed you down?**
   — The spec said "Import the engine ONLY from 'src/engine' (the index, via the existing alias/relative path used elsewhere in src/ui)" but no UI file had yet imported the engine, so there was no precedent to follow. No path alias exists in tsconfig/vite.config. Used `../../engine/index` (relative) which works fine.

2. **Was there a constraint or decision that should have been listed but wasn't?**
   — No missing constraints; the spec was thorough. One implicit detail: since reels.css is co-located and imported from ReelGrid.tsx rather than Game.tsx directly, Vite bundles it into the same chunk — consistent with how other co-located CSS files work in this project (device-frame.css imported in App.tsx, not in the child component).

3. **If you did this task again, what would you do differently?**
   — Read the existing import patterns in App.tsx and region files first (before coding) to confirm CSS import placement convention — it would have resolved the Game.tsx vs ReelGrid.tsx import question immediately.

---

## Reflection (Ship)

*Appended during the **ship** cycle.*

1. **What would I do differently next time?**
   — <answer>

2. **Does any template, constraint, or decision need updating?**
   — <answer>

3. **Is there a follow-up spec I should write now before I forget?**
   — <answer>
