---
# Maps to ContextCore task.* semantic conventions.

task:
  id: SPEC-007
  type: story
  cycle: build
  blocked: false
  priority: high
  complexity: S

project:
  id: PROJ-001
  stage: STAGE-002
repo:
  id: animal-slots

agents:
  architect: claude-opus-4-8
  implementer: claude-sonnet-4-6
  created_at: 2026-06-19

references:
  decisions:
    - DEC-001
    - DEC-002
  constraints:
    - engine-no-dom
    - deterministic-rng
    - test-before-implementation
    - one-spec-per-pr
  related_specs:
    - SPEC-005
    - SPEC-006

value_link: "STAGE-002's spin core — turns a seeded RNG + weighted strips into the 5×3 grid every payline reads (the deterministic heart of a spin)."

cost:
  sessions:
    - cycle: design
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      duration_minutes: 20
      recorded_at: 2026-06-19
      notes: "main-loop, not separately metered (AGENTS §4); design cycle"
  totals:
    tokens_total: 0
    estimated_usd: 0
    session_count: 0
---

# SPEC-007: 5×3 spin resolver

## Context

The third STAGE-002 engine spec. With the RNG (SPEC-005) and weighted strips
(SPEC-006) in place, this spec resolves a **spin** into the visible 5×3 grid:
draw one stop per reel from the injected PRNG (reel 0→4) and read the three
consecutive symbols at each stop. The grid it produces is the input that payline
evaluation (SPEC-008) and the UI reels (STAGE-003) consume. It owns the spin's
*shape* (grid + draw order); it does not score, bet, or classify.

See `STAGE-002-slot-engine.md`, the **Game-Design Spec** in `brief.md` (grid &
reel model + draw order), `DEC-002` (seedable injected RNG), and SPEC-006's
`STRIPS`/`visibleCells`.

## Goal

Given an injected `Rng` (and the reel `STRIPS`), draw one stop per reel in order
(reel 0→4) and resolve the visible 5×3 `Grid`. Same seed ⇒ same stops ⇒ same grid.

## Inputs

- **Files to read:** `src/engine/rng.ts` (`Rng`, `randomInt`), `src/engine/strips.ts`
  (`STRIPS`, `REEL_COUNT`, `visibleCells`, `SymbolId`); `brief.md` Game-Design Spec
  (grid/reel model + the reel 0→4 draw order).
- **Related code paths:** `src/engine/`.

## Outputs

- **Files created:**
  - `src/engine/spin.ts` — the resolver.
  - `src/engine/spin.test.ts` — the Failing Tests below.
- **New exports (from `spin.ts`):**
  - `export type Grid = SymbolId[][];` — indexed `grid[reel][row]`, 5 reels × 3
    rows (row 0 = top, 1 = mid, 2 = bottom). Documented with a comment.
  - `export function resolveStops(rng: Rng, strips?: readonly (readonly SymbolId[])[]):
    number[];` — one `randomInt(rng, strip.length)` per reel, in reel order 0→4;
    returns the five stop indices. Defaults to `STRIPS`.
  - `export function resolveGrid(rng: Rng, strips?: readonly (readonly SymbolId[])[]):
    Grid;` — the grid built from `resolveStops` + `visibleCells`. Defaults to `STRIPS`.
- **Database changes:** none.

## Acceptance Criteria

- [ ] `resolveStops(rng)` returns `REEL_COUNT` (5) integers, each in
      `[0, strip.length)`, drawn in reel order 0→4 — exactly one PRNG draw per reel.
- [ ] `resolveGrid(rng)` returns a 5×3 `Grid` (`grid[reel]` has 3 symbols), where
      `grid[reel]` equals `visibleCells(strips[reel], stops[reel])`.
- [ ] **Deterministic:** the same seed yields the same stops and the same grid.
- [ ] The resolver matches the **pinned** stops/grid for seed 12345 (locks the
      RNG↔strip↔grid pipeline end to end).
- [ ] `spin.ts` imports only engine modules (`rng`, `strips`) — no React/DOM/
      `src/ui`; no bare `Math.random()`.
- [ ] `just typecheck`, `just lint`, `just test`, `just build` all exit 0.

## Failing Tests

Written during **design**, BEFORE build. The pinned stops/grid were computed from
the canonical strip (SPEC-006) and the canonical RNG (SPEC-005).

- **`src/engine/spin.test.ts`**
  - `"resolveStops returns five in-range stops"` — for `createRng(7)`,
    `resolveStops(rng)` has length 5 and every value is an integer in `[0, 35)`.
  - `"resolveStops consumes exactly one draw per reel, in order"` — with two
    `createRng(5)` instances `a` and `b`: call `resolveStops(a)`, then advance `b`
    with five `b()` calls; assert `a() === b()` (proves resolveStops consumed
    exactly 5 draws, in sequence).
  - `"resolveStops is deterministic and matches the pinned seed"` — from
    `createRng(12345)`, `resolveStops(rng)` deep-equals `[34, 10, 16, 28, 17]`.
  - `"resolveGrid is 5 reels × 3 rows"` — `resolveGrid(createRng(7))` has length 5
    and each `grid[reel]` has length 3.
  - `"each grid column equals visibleCells at the drawn stop"` — with seed 5: get
    `stops = resolveStops(createRng(5))` and `grid = resolveGrid(createRng(5))`;
    for every reel, `grid[reel]` deep-equals `visibleCells(STRIPS[reel], stops[reel])`.
  - `"resolveGrid matches the pinned grid for seed 12345"` — `resolveGrid(createRng(12345))`
    deep-equals:
    ```
    [["FOX","DEER","FOX"],
     ["DEER","FOX","BEAR"],
     ["DEER","FOX","WOLF"],
     ["FOX","BEAR","EAGLE"],
     ["FOX","WOLF","SQUIRREL"]]
    ```
  - `"resolveGrid is deterministic"` — two `resolveGrid(createRng(99))` calls
    deep-equal each other.

## Implementation Context

### Decisions that apply

- `DEC-002` (seedable injected RNG) — the resolver takes an injected `Rng`; it
  never creates its own randomness and never calls `Math.random()`.
- `DEC-001` (engine/presentation separation) — pure engine; imports only `rng`
  and `strips`.

### Constraints that apply

- `deterministic-rng` (blocking) — all draws via the injected `Rng`/`randomInt`.
- `engine-no-dom` (blocking, lint-enforced), `test-before-implementation`,
  `one-spec-per-pr`.

### Prior related work

- `SPEC-005` (shipped, PR #5) — `rng.ts` (`Rng`, `randomInt`).
- `SPEC-006` (shipped, PR #6) — `strips.ts` (`STRIPS`, `REEL_COUNT`,
  `visibleCells`, `SymbolId`). The pinned grid in the tests is the canonical strip
  read at the seed-12345 stops `[34,10,16,28,17]`.

### Out of scope (for this spec specifically)

- Payline/paytable scoring (SPEC-008), bet/balance (SPEC-009), win-tier (SPEC-010),
  the composed public `spin()` (SPEC-011).
- Converting a seed to an `Rng` at the public boundary — `spin.ts` takes an `Rng`;
  the seed→`Rng` convenience lives in `index.ts` (SPEC-011).
- Any reel animation, timing, or rendering (STAGE-003).

## Notes for the Implementer

- `Grid` is `grid[reel][row]` (NOT row-major). `grid[reel] = visibleCells(strip,
  stop)` returns `[top, mid, bottom]`, so row 0 is top.
- Draw order is reel 0→4, exactly one `randomInt(rng, strip.length)` per reel — do
  not reorder or batch draws, or the pinned fixtures (and future seeds) break.
- `resolveGrid` should reuse `resolveStops` (don't draw twice). Suggested:
  `const stops = resolveStops(rng, strips); return stops.map((s, reel) =>
  visibleCells(strips[reel], s));`.
- Default the `strips` param to `STRIPS` so callers normally pass only the `Rng`.

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
