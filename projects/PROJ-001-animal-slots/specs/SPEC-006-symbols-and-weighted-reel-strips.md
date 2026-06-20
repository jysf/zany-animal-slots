---
# Maps to ContextCore task.* semantic conventions.

task:
  id: SPEC-006
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
    - DEC-006
    - DEC-011
  constraints:
    - engine-no-dom
    - test-before-implementation
    - one-spec-per-pr
  related_specs:
    - SPEC-005

value_link: "STAGE-002's symbol vocabulary + weighted reels — the deterministic strips every spin draws its grid from (DEC-006 symbols, DEC-011 weights)."

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
    - cycle: build
      agent: claude-sonnet-4-6
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      duration_minutes: null
      recorded_at: 2026-06-19
      notes: "sub-agent build cycle — orchestrator to fill tokens_total/estimated_usd/duration from Agent result"
  totals:
    tokens_total: 0
    estimated_usd: 0
    session_count: 0
---

# SPEC-006: Symbols and weighted reel strips

## Context

The second STAGE-002 engine spec. With the RNG in place (SPEC-005), the engine
now needs its **symbol vocabulary** and the **weighted reel strips** a spin draws
stops from. This spec encodes DEC-006's symbol set + tiers and DEC-011's reel
weights as pure data, plus the strip-to-grid helper (`visibleCells`) that turns a
reel stop into the three visible symbols. It is the deterministic substrate the
spin resolver (SPEC-007) and payline evaluation (SPEC-008) build on.

See `STAGE-002-slot-engine.md`, the **Game-Design Spec** in `brief.md`, `DEC-006`
(emoji symbol set + tiers), and `DEC-011` (paytable + reel-strip weights). Emoji
glyphs are deliberately NOT in the engine — the UI maps `SymbolId → emoji`
later (DEC-001 separation); the engine deals only in symbol IDs.

## Goal

Provide the engine's symbol set (`SymbolId`, `SYMBOL_TIER`), the per-reel weighted
strip (`REEL_WEIGHTS` → a deterministic length-35 `REEL_STRIP`, identical across
the five reels), and `visibleCells(strip, stop)` returning the three consecutive
(wrapping) symbols a reel shows at a stop.

## Inputs

- **Files to read:** `decisions/DEC-006-emoji-symbol-set.md`,
  `decisions/DEC-011-paytable-and-reel-weights.md`, `brief.md` Game-Design Spec,
  `src/engine/rng.ts` (the `Rng`/`randomInt` this pairs with — for context only).
- **Related code paths:** `src/engine/`.

## Outputs

- **Files created:**
  - `src/engine/strips.ts` — symbols, tiers, weights, strips, `visibleCells`.
  - `src/engine/strips.test.ts` — the Failing Tests below.
- **New exports (from `strips.ts`):**
  - `export const SYMBOLS` — readonly tuple of the 8 symbol IDs.
  - `export type SymbolId = (typeof SYMBOLS)[number];`
  - `export type Tier = 'low' | 'mid' | 'high' | 'jackpot';`
  - `export const SYMBOL_TIER: Record<SymbolId, Tier>;` (DEC-006)
  - `export const REEL_WEIGHTS: Record<SymbolId, number>;` (DEC-011)
  - `export const REEL_COUNT = 5;`
  - `export const REEL_STRIP: readonly SymbolId[];` — canonical length-35 strip.
  - `export const STRIPS: readonly (readonly SymbolId[])[];` — `REEL_COUNT` strips
    (all the same composition for v1).
  - `export function visibleCells(strip: readonly SymbolId[], stop: number):
    [SymbolId, SymbolId, SymbolId];` — `[strip[stop], strip[stop+1], strip[stop+2]]`
    with wraparound (modulo strip length).
- **Database changes:** none.

## Acceptance Criteria

- [ ] `SYMBOLS` has the 8 IDs `DEER, FOX, SQUIRREL, BEAR, EAGLE, OWL, BISON, WOLF`;
      `SYMBOL_TIER` maps them to `low/low/low/mid/mid/mid/high/jackpot` (DEC-006).
- [ ] `REEL_WEIGHTS` equals DEC-011: `DEER 7, FOX 7, SQUIRREL 6, BEAR 4, EAGLE 4,
      OWL 4, BISON 2, WOLF 1` (sum 35).
- [ ] `REEL_STRIP` has length 35 and its symbol counts exactly match
      `REEL_WEIGHTS`; `STRIPS` has `REEL_COUNT` (5) strips, each length 35 with the
      same composition.
- [ ] `REEL_STRIP` equals the pinned canonical order (locks the strip so spin
      grids are reproducible).
- [ ] `visibleCells` returns three consecutive symbols and wraps at the end of the
      strip.
- [ ] `strips.ts` imports nothing from React/DOM/`src/ui/**`; no `Math.random()`.
- [ ] `just typecheck`, `just lint`, `just test`, `just build` all exit 0.

## Failing Tests

Written during **design**, BEFORE build.

- **`src/engine/strips.test.ts`**
  - `"has the eight DEC-006 symbols"` — `SYMBOLS` deep-equals
    `['DEER','FOX','SQUIRREL','BEAR','EAGLE','OWL','BISON','WOLF']`.
  - `"maps each symbol to its DEC-006 tier"` — `SYMBOL_TIER` deep-equals
    `{DEER:'low', FOX:'low', SQUIRREL:'low', BEAR:'mid', EAGLE:'mid', OWL:'mid',
    BISON:'high', WOLF:'jackpot'}`.
  - `"weights match DEC-011 and sum to 35"` — `REEL_WEIGHTS` deep-equals
    `{DEER:7, FOX:7, SQUIRREL:6, BEAR:4, EAGLE:4, OWL:4, BISON:2, WOLF:1}`; the sum
    of its values is 35.
  - `"the reel strip honors the weights"` — `REEL_STRIP.length === 35`; counting
    each symbol in `REEL_STRIP` reproduces `REEL_WEIGHTS` exactly.
  - `"all five reels share the canonical composition"` — `STRIPS.length === 5`;
    every strip has length 35 and the same per-symbol counts as `REEL_WEIGHTS`.
  - `"the canonical strip order is pinned"` — `REEL_STRIP` deep-equals the pinned
    array in Notes for the Implementer (locks ordering for SPEC-007).
  - `"visibleCells returns three consecutive symbols"` — for `REEL_STRIP`,
    `visibleCells(REEL_STRIP, 0)` equals `[REEL_STRIP[0], REEL_STRIP[1],
    REEL_STRIP[2]]`.
  - `"visibleCells wraps at the end of the strip"` —
    `visibleCells(REEL_STRIP, 34)` equals `[REEL_STRIP[34], REEL_STRIP[0],
    REEL_STRIP[1]]`, and `visibleCells(REEL_STRIP, 33)` equals
    `[REEL_STRIP[33], REEL_STRIP[34], REEL_STRIP[0]]`.

## Implementation Context

### Decisions that apply

- `DEC-006` — the 8 emoji symbols and their tiers (engine holds IDs + tiers, NOT
  emoji glyphs; emoji is a UI concern under DEC-001).
- `DEC-011` — the reel weights (`REEL_WEIGHTS`) and the symmetric-strip choice.
- `DEC-001` — pure engine module; no React/DOM/`src/ui` imports.

### Constraints that apply

- `engine-no-dom` (blocking, lint-enforced), `test-before-implementation`,
  `one-spec-per-pr`.

### Prior related work

- `SPEC-005` (shipped, PR #5) — `rng.ts` provides `Rng`/`randomInt`; the spin
  resolver (SPEC-007) will combine `randomInt(rng, REEL_STRIP.length)` with
  `visibleCells` to draw a grid. This spec does not draw — it only defines data +
  the cell helper.

### Out of scope (for this spec specifically)

- Drawing stops / resolving a grid / running a spin (SPEC-007).
- Payline or paytable evaluation (SPEC-008).
- Mapping symbols to emoji or any rendering (STAGE-003, UI).
- Per-reel asymmetric strips (a clean future spec per DEC-011).

## Notes for the Implementer

- Tiers: Low = DEER/FOX/SQUIRREL, Mid = BEAR/EAGLE/OWL, High = BISON,
  Jackpot = WOLF (DEC-006).
- **Pinned canonical strip** (use exactly this array for `REEL_STRIP`; it is a
  well-spread arrangement of the DEC-011 weights with no adjacent duplicates):

  ```ts
  export const REEL_STRIP = [
    'DEER','FOX','SQUIRREL','BEAR','EAGLE','OWL','DEER','FOX','SQUIRREL','BISON',
    'DEER','FOX','BEAR','EAGLE','OWL','SQUIRREL','DEER','FOX','WOLF','SQUIRREL',
    'BEAR','EAGLE','OWL','DEER','FOX','SQUIRREL','BISON','DEER','FOX','BEAR',
    'EAGLE','OWL','SQUIRREL','DEER','FOX',
  ] as const satisfies readonly SymbolId[];
  ```

- `STRIPS`: five entries, all the canonical strip — e.g.
  `Array.from({ length: REEL_COUNT }, () => REEL_STRIP)`.
- `visibleCells`: `const n = strip.length; return [strip[stop % n],
  strip[(stop + 1) % n], strip[(stop + 2) % n]];`. (Assume `stop` is a valid
  non-negative index from `randomInt`; no need to handle negatives.)
- Keep it pure data + one tiny function. Derive `SymbolId` from `SYMBOLS` so the
  set has a single source of truth.

---

## Build Completion

*Filled in at the end of the **build** cycle, before advancing to verify.*

- **Branch:** feat/spec-006-reel-strips
- **PR (if applicable):**
- **All acceptance criteria met?** yes
- **New decisions emitted:**
  - none
- **Deviations from spec:**
  - none
- **Follow-up work identified:**
  - none (SPEC-007 spin resolver is already planned in the stage backlog)

### Build-phase reflection (3 questions, short answers)

1. **What was unclear in the spec that slowed you down?**
   — Nothing was unclear. The spec provided the pinned REEL_STRIP array verbatim and the exact `visibleCells` implementation formula, so there was no ambiguity to resolve.

2. **Was there a constraint or decision that should have been listed but wasn't?**
   — No. DEC-001 (engine-no-dom), DEC-006 (symbols/tiers), and DEC-011 (weights) were exactly the right set. The `deterministic-rng` constraint was not listed in the spec's front-matter but is implicitly satisfied (no `Math.random()` in this file — it's pure data plus one deterministic helper).

3. **If you did this task again, what would you do differently?**
   — Nothing significant. The spec was self-contained and detailed enough that implementation was direct transcription. The pinned array in "Notes for the Implementer" was the key time-saver.

---

## Reflection (Ship)

*Appended during the **ship** cycle.*

1. **What would I do differently next time?**
   — <answer>

2. **Does any template, constraint, or decision need updating?**
   — <answer>

3. **Is there a follow-up spec I should write now before I forget?**
   — <answer>
