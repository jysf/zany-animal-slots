---
# Maps to ContextCore task.* semantic conventions.

task:
  id: SPEC-018
  type: story
  cycle: build
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
  created_at: 2026-06-26

references:
  decisions:
    - DEC-001
    - DEC-003
    - DEC-010
  constraints:
    - portrait-first
    - test-before-implementation
    - one-spec-per-pr
  related_specs:
    - SPEC-008
    - SPEC-012
    - SPEC-016

value_link: "Closes the loop visually — highlights the cells of each winning payline (from the engine's lineWins) so a win reads at a glance. The last STAGE-003 spec."

cost:
  sessions:
    - cycle: design
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      duration_minutes: 20
      recorded_at: 2026-06-26
      notes: "main-loop, not separately metered (AGENTS §4); design cycle"
  totals:
    tokens_total: 0
    estimated_usd: 0
    session_count: 0
---

# SPEC-018: Winning-line highlight

## Context

The seventh and final STAGE-003 spec. The engine already returns `lineWins`
(SPEC-008) and the hook surfaces them (SPEC-013); this spec makes a win **visible**
by highlighting the exact cells of each winning payline on the grid. It maps each
`LineWin` to its cells via the engine's `PAYLINES` (the run is the first `count`
reels at that line's rows) and applies a highlight class. This is the *basic*
highlight only — particles, the wolf jackpot moment, balance count-up, tier-scaled
feel, and audio are STAGE-004. When this ships, STAGE-003 is complete: a fully
playable slot.

See `STAGE-003-reels-ui-and-spin-flow.md`, `DEC-003` (the five paylines + the
left-anchored run rule), `DEC-010` (tokens, no raw hex), `DEC-001` (the UI consumes
the engine's `PAYLINES`/`lineWins`; no engine change), and SPEC-012's `ReelGrid`.

## Goal

Highlight the winning cells after a spin: a pure helper turns the hook's `lineWins`
into the set of winning `(reel, row)` cells (using `PAYLINES`), and `ReelGrid`
marks those cells with a highlight class — shown when resolved, suppressed while
spinning. App threads `lineWins` through.

## Inputs

- **Files to read:** `src/engine/index.ts` (`PAYLINES`, `LineWin`, `LineId`),
  `src/ui/reels/ReelGrid.tsx` + `reels.css`, `src/ui/regions/Game.tsx`,
  `src/ui/App.tsx`, `src/ui/useSlotMachine.ts` (`lineWins`), `src/styles/tokens.css`.
- **Related code paths:** `src/ui/`.

## Outputs

- **Files created:**
  - `src/ui/reels/winningCells.ts` — `winningCellKeys(lineWins): Set<string>`
    mapping line wins → `"reel:row"` keys via `PAYLINES`.
  - `src/ui/reels/winningCells.test.ts` — the helper's unit tests.
- **Files modified:**
  - `src/ui/reels/ReelGrid.tsx` — accept `lineWins: LineWin[]`; add a
    `.reel__cell--win` class to cells in `winningCellKeys(lineWins)` (suppressed
    while `spinning`).
  - `src/ui/reels/reels.css` — `.reel__cell--win` highlight (a token-based glow/
    border, e.g. `--color-coin`); no raw hex.
  - `src/ui/regions/Game.tsx` — accept + pass `lineWins` to `ReelGrid`.
  - `src/ui/App.tsx` — thread `lineWins` from the hook to `Game`.
  - `src/ui/reels/ReelGrid.test.tsx` — extend.
- **New exports:** `winningCellKeys`.
- **Database changes:** none.

## Acceptance Criteria

- [ ] `winningCellKeys(lineWins)` returns the set of `"reel:row"` keys for the first
      `count` reels of each winning line (rows from `PAYLINES`): e.g. an L1
      (`rows [1,1,1,1,1]`) win of `count 3` → `{"0:1","1:1","2:1"}`; multiple line
      wins union their cells; `[]` → empty set.
- [ ] `ReelGrid` adds `.reel__cell--win` to exactly the winning cells when not
      spinning, and to **no** cells while `spinning` (so a stale highlight doesn't
      flash mid-spin).
- [ ] The highlight uses a design token (no raw hex) and does not alter the symbol
      or layout (purely additive styling).
- [ ] Engine unchanged; UI consumes `PAYLINES`/`lineWins` only via `src/engine`;
      gate (`typecheck`/`lint`/`test`/`build`) exits 0.

## Failing Tests

Written during **design**, BEFORE build. RTL/unit; the exact glow look is a preview
check.

- **`src/ui/reels/winningCells.test.ts`**
  - `"maps a single line win to its cells"` — `winningCellKeys([{ line:'L1',
    symbol:'BEAR', count:3, multiplier:1, amount:10 }])` equals the set
    `{"0:1","1:1","2:1"}` (L1 rows are all 1).
  - `"covers count reels (4 of a kind)"` — an L2 (`rows [0,0,0,0,0]`) win of
    `count 4` → `{"0:0","1:0","2:0","3:0"}`.
  - `"unions multiple winning lines"` — `[L1 count3, L3 count3]` →
    `{"0:1","1:1","2:1","0:2","1:2","2:2"}` (6 cells; L3 rows are all 2).
  - `"a V-line uses its per-reel rows"` — an L4 (`rows [0,1,2,1,0]`) win of `count 5`
    → `{"0:0","1:1","2:2","3:1","4:0"}`.
  - `"no wins → empty set"` — `winningCellKeys([])` has size 0.

- **`src/ui/reels/ReelGrid.test.tsx`** (extended)
  - `"highlights the winning cells when resolved"` — render `<ReelGrid grid={G}
    lineWins={[{line:'L1',symbol:'BEAR',count:3,...}]} spinning={false} />`; assert
    exactly 3 cells carry `.reel__cell--win` (and they are the L1 row-1 cells of
    reels 0–2).
  - `"suppresses the highlight while spinning"` — same props but `spinning`; assert
    **no** cell has `.reel__cell--win`.
  - `"no highlight when there are no wins"` — `lineWins={[]}` → zero `.reel__cell--win`.

## Implementation Context

### Decisions that apply

- `DEC-003` — paylines + the left-anchored run: a `LineWin` of `count` covers reels
  `0..count-1` at that line's rows. Use `PAYLINES` for the rows.
- `DEC-010` — the highlight is token-based CSS (no raw hex), prefixed class
  `.reel__cell--win`.
- `DEC-001` — the UI reads `PAYLINES`/`lineWins` from `src/engine` (index); no engine
  change, no game logic added.

### Constraints that apply

- `portrait-first`, `test-before-implementation`, `one-spec-per-pr`.

### Prior related work

- `SPEC-008` (shipped) — `LineWin` (`{ line, symbol, count, multiplier, amount }`)
  and `PAYLINES`. `SPEC-012` (shipped) — `ReelGrid` cells. `SPEC-016` (shipped) —
  the `spinning` prop (reuse it to suppress the highlight mid-spin).

### Out of scope (for this spec specifically)

- Tier-scaled highlight color/intensity, particles, the wolf jackpot moment,
  balance count-up, a payline trail animation, and audio — all STAGE-004.
- Animating the highlight beyond a static (or simple CSS) emphasis — keep it basic.

## Notes for the Implementer

- `winningCellKeys(lineWins)`: `const set = new Set<string>(); for (const w of
  lineWins) { const line = PAYLINES.find(p => p.id === w.line); if (!line) continue;
  for (let reel = 0; reel < w.count; reel++) set.add(`${reel}:${line.rows[reel]}`); }
  return set;`.
- `ReelGrid`: compute `const winKeys = spinning ? EMPTY : winningCellKeys(lineWins)`;
  for each cell at `(reel, row)`, add `reel__cell--win` when `winKeys.has(
  `${reel}:${row}`)`. Default `lineWins` to `[]` so existing callers/tests still work.
- `reels.css`: `.reel__cell--win` — a token-based glow/outline (e.g.
  `box-shadow: 0 0 0 2px var(--color-coin)` or a background tint); additive only,
  no layout shift, no raw hex.
- Thread `lineWins` App → Game → ReelGrid (alongside the existing `grid`/`spinning`).
- Keep `ReelGrid` a pure function of its props.
- After building, the orchestrator previews: spin until a win lands → the winning
  cells glow; during the spin no stale highlight shows.

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
