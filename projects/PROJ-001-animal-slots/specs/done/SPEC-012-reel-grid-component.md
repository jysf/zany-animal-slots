---
# Maps to ContextCore task.* semantic conventions.

task:
  id: SPEC-012
  type: story
  cycle: ship
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
      tokens_total: 70296
      estimated_usd: 0.46
      duration_minutes: 3.6
      recorded_at: 2026-06-23
      notes: "Sonnet sub-agent build (Agent subagent_tokens=70296, 214s). estimated_usd ~= tokens x $6.6/M Sonnet blended, no cache discount (order-of-magnitude, AGENTS §4)."
    - cycle: verify
      agent: claude-sonnet-4-6
      interface: claude-code
      tokens_total: 62584
      estimated_usd: 0.41
      duration_minutes: 3.2
      recorded_at: 2026-06-23
      notes: "Sonnet sub-agent verify (Agent subagent_tokens=62584, 193s). estimated_usd ~= tokens x $6.6/M Sonnet blended, no cache discount (order-of-magnitude, AGENTS §4)."
    - cycle: ship
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      duration_minutes: 10
      recorded_at: 2026-06-23
      notes: "main-loop, not separately metered (AGENTS §4); ship cycle (incl. preview screenshot check)"
  totals:
    tokens_total: 132880
    estimated_usd: 0.87
    session_count: 4
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

## Verify

**Verdict: ✅ APPROVED**

Gate: `just typecheck && just lint && just test && just build` — all exit 0. 14 passed test files, 78/78 tests green. Production build: 143.80 kB JS (46 kB gzip), clean.

- **ACCEPTANCE CRITERIA** — all six checkboxes met.
  - 15 cells rendered, each with `role="img"` + `aria-label`. ✅
  - `SYMBOL_DISPLAY` maps all 8 SYMBOLS to DEC-006 emoji + readable label. ✅
  - `Game` renders `<ReelGrid grid={INITIAL_GRID} />` inside `.cabinet__game`. ✅
  - `reels.css` is token-only (8 `var(--…)` usages, zero hex literals); fits portrait cabinet. ✅
  - No engine internals imported; all `src/ui/reels/` imports go to `../../engine/index`. ✅
  - All four gate commands exit 0. ✅

- **DEC-001 BOUNDARY** — `git diff main..HEAD -- src/engine/` is empty; engine is unchanged. All `src/ui/reels/` imports use `../../engine/index`. No hits on `engine/rng|spin|strips|paylines|balance|tiers` in src/ui. Boundary clean. ✅

- **DEC-006** — `SYMBOL_DISPLAY` in `symbols.ts` maps all 8 symbols to exactly the emoji specified (🦌🦊🐿️🐻🦅🦉🦬🐺) with matching readable labels (Deer/Fox/Squirrel/Bear/Eagle/Owl/Bison/Wolf). ✅

- **DEC-010** — `reels.css` uses 8 `var(--…)` token references; grep for `#[0-9a-fA-F]{3,6}` in reels.css returns no matches. No raw hex. ✅

- **TESTS NOT VACUOUS** — `getAllByRole('img')` length-15 assertion is explicit and would catch a missing cell or wrong reel count. Per-symbol emoji/label test asserts both `getAllByLabelText('Wolf')[0].textContent === '🐺'` and equivalent for Deer — not a vacuous pass. The `maps every DEC-006 symbol` test iterates all `SYMBOLS` and checks both `emoji.length > 0` and `label.length > 0`. The `lays out five reels` test queries `.reel` and checks each has 3 `.reel__cell` children. `Game.test.tsx` asserts 15 `role="img"` cells inside the `role="main"` element — would catch Game not mounting the grid. ✅

- **PURE FUNCTION** — `ReelGrid` has no `useState`/`useRef`/`useEffect`; it is a pure function of its `grid` prop. SPEC-013 can pass a live grid without modification. ✅

- **DECISION DRIFT (CSS import placement)** — Builder co-located `reels.css` import inside `ReelGrid.tsx` rather than `Game.tsx` as the spec's Outputs section suggested. This is idiomatic for co-located component CSS in Vite (same pattern as `device-frame.css`). Vite bundles it regardless of import site; `Game.tsx` gets the styles transitively. Not a defect — an accepted deviation. ✅

- **`just decisions-audit --changed`** — "No changed files in scope (uncommitted changes)" because the branch is fully committed; expected. `just decisions-audit` (no flag) shows 14 pre-existing scope-overlap warnings, 0 structural errors — all pre-date this spec. No new drift introduced. ✅

- **BUILD REFLECTION** — 3 questions answered, non-empty, honest: builder noted the CSS import placement deviation proactively and gave a reasoned justification; noted lack of prior UI import precedent; identified what to read first next time. ✅

- **COST** — design session: null-with-note (main-loop, acceptable per AGENTS §4). Build session: null-with-note ("orchestrator to fill from subagent_tokens") — correct, not a silent omission; orchestrator fills at ship. Verify session just appended (also null-with-note for orchestrator to fill). ✅

---

## Reflection (Ship)

*Appended during the **ship** cycle.*

1. **What would I do differently next time?**
   — Nothing material. The static `INITIAL_GRID` + pure `ReelGrid({grid})` split was
   the right seam: the board renders now, and SPEC-013 can feed it live spin grids
   with no component change. The preview check (375px + desktop) confirmed the look
   that RTL can't.

2. **Does any template, constraint, or decision need updating?**
   — No. This is the first UI spec to import the engine; the path `../../engine/index`
   honors DEC-001. Worth noting for future UI specs that there's no path alias — a
   relative import to the engine index is the convention.

3. **Is there a follow-up spec I should write now before I forget?**
   — No new spec. SPEC-013 (spin button + flow) is next and will lift the grid into
   spin-flow state, feeding `ReelGrid` live results; already planned.
