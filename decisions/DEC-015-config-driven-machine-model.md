---
# Maps to ContextCore insight.* semantic conventions.

insight:
  id: DEC-015
  type: decision
  confidence: 0.85
  audience:
    - developer
    - agent

agent:
  id: claude-opus-4-8
  session_id: null

# Emitted during PROJ-002 / STAGE-007 (the config-driven machine model).
project:
  id: PROJ-002
repo:
  id: animal-slots

created_at: 2026-07-04
supersedes: null                     # generalizes DEC-006/011/003; does not replace them
superseded_by: null

# Scoped narrowly to the new config layer. The overlap with DEC-001's
# broad `src/engine/**` is intentional (DEC-015 extends DEC-001) and is
# explained under Consequences; keep this list tight so decisions-audit
# does not flag spurious overlaps with DEC-006/011/003's file scopes.
affected_scope:
  - src/engine/machine.ts
  - src/machines/**

tags:
  - architecture
  - engine
  - configuration
  - game-design
  - machine-model
---

# DEC-015: A "machine" is pure config — a math slice the engine consumes + a presentation slice the UI consumes

## Decision

A slot **machine** is modelled as **pure data**, split into two slices:

- a **math slice** (`MachineMath`, in `src/engine/machine.ts`) — `symbols`,
  `symbolTier`, `reelWeights`, `reelCount`, `rows`, `strips`, `paylines`, `paytable`,
  `jackpot` (`{ symbol, count }`), `tiers` (`{ bigMultiple }`), `betLevels`,
  `defaultBet`, `startingBalance` — which the **engine** consumes; and
- a **presentation slice** (`MachinePresentation`, in `src/machines/types.ts`) — the
  `symbolDisplay` emoji/label map now, and theme tokens + audio params from SPEC-041 —
  which the **UI** consumes.

A `Machine = { id, name, math, presentation }`. Today's game is the default machine
**"Wild & Whimsical"** (`src/machines/wildAndWhimsical.ts`). Adding or retuning a
machine is therefore a **data** change (new/edited config + this decision's descendants),
never an engine-logic change. The engine only ever sees the **math** slice — it never
receives the presentation slice — so the engine-no-dom boundary (DEC-001) is preserved.

## Context

PROJ-001 shipped a single hard-coded game whose logic lived in module-level constants
(`SYMBOLS`/`SYMBOL_TIER`/`REEL_WEIGHTS`/`REEL_STRIP`/`STRIPS` in `strips.ts`,
`PAYLINES`/`PAYTABLE` in `paylines.ts`, the WOLF×5 jackpot rule + 5× "big" boundary in
`tiers.ts`, `BET_LEVELS`/`DEFAULT_BET`/`STARTING_BALANCE` in `balance.ts`). PROJ-002's
thesis is that the clean engine/presentation split (DEC-001) makes the game
**configurable**: a machine should be data, so STAGE-008's fun-retune and extra
machines become cheap data edits rather than risky engine edits.

STAGE-007 tests that thesis by parameterizing the engine — which deliberately
**unfreezes** it (untouched since SPEC-011). The frozen seeds (407947 → jackpot 2000;
12345 → 0; 276 → 55/big/3 lines; 12 → 10/small) are the contract that behavior stays
identical through the migration. SPEC-038 (this decision's origin) takes the first,
lowest-risk step: it pins the `Machine` type and expresses the current game as the
default machine's data **without changing any engine signature**, guarded by a
data-parity contract test.

## Alternatives Considered

- **Option A: Keep module-level constants; add machines by branching engine code.**
  - What it is: introduce variety by editing `strips.ts`/`paylines.ts`/`tiers.ts` per
    machine (flags, conditionals, or forks).
  - Why rejected: makes every new machine an engine change, exactly the risk PROJ-002
    means to eliminate; couples math variants to engine logic; multiplies test surface.

- **Option B: One flat `Machine` object the engine consumes wholesale (math + presentation together).**
  - What it is: pass the entire machine (including emoji/theme/audio) into `spin()`.
  - Why rejected: the engine would then "see" presentation data, eroding DEC-001's
    engine-no-dom boundary and the load-bearing separation the project celebrates. Even
    though emoji/theme are plain strings, letting them cross into the engine invites
    creep.

- **Option C (chosen): Two-slice machine — engine consumes only the math slice.**
  - What it is: `MachineMath` lives in the engine and is the only thing engine functions
    receive; the full `Machine` (math + presentation) is composed in an app-layer
    `src/machines/` module the UI reads. `spin({ …, machine })` will take the **math**
    slice (typed `MachineMath`), threaded into `resolveGrid`/`evaluatePaylines`/
    `classifyWin` (SPEC-039/040/042).
  - Why selected: keeps DEC-001 pristine (engine never sees DOM/presentation), makes the
    configurable-vs-presentation split explicit in the types, and lets the presentation
    slice evolve (theme/audio in SPEC-041) without touching the engine.

## Consequences

- **Positive:** New machines and the STAGE-008 retune become data edits, not engine
  code. The math/presentation split is enforced by the type system and DEC-001's ESLint
  boundary. The default machine is a single, testable source of "what the current game
  is."
- **Positive (migration safety):** SPEC-038 has the default machine **reference** the
  existing constants (one source of truth, zero transcription risk). Ownership of the
  literal data inverts incrementally in SPEC-039..042 as each engine function is
  parameterized — every step guarded by the frozen seeds — so the unfreeze never risks a
  silent behavior change.
- **Negative:** A new indirection layer (`src/engine/machine.ts` + `src/machines/`) and,
  transiently, two representations of the same data (constant + machine reference) until
  the constants are retired. The SPEC-038 data-parity test is therefore transitional;
  the durable guard is frozen-seed parity (SPEC-043 + per-spec assertions).
- **Neutral / intentional overlap:** DEC-015's `affected_scope` overlaps DEC-001's
  `src/engine/**` because DEC-015 **extends** DEC-001 (the engine now takes plain-data
  config). This overlap is expected, not a conflict.

## Relationship to prior decisions

- **Extends DEC-001** (engine/presentation separation): the boundary holds; the engine
  now receives its inputs as an explicit plain-data **math** config instead of reading
  module constants. The engine still imports no DOM.
- **Generalizes (does not supersede) DEC-006** (emoji symbol set), **DEC-011** (paytable
  + reel weights), and **DEC-003** (fixed five paylines): their specifics become the
  **default machine's data**. Their rationale still holds and lives on *inside* "Wild &
  Whimsical"; they are not replaced, so their `superseded_by` stays `null`.

## Validation

- **Right if:** STAGE-008 ships a retune + additional machines with **zero** change to
  engine logic (data + descendant DECs only), and the frozen seeds stay green through the
  entire STAGE-007 migration.
- **Revisit if:** a machine variant turns out to need genuinely new engine *mechanics*
  (e.g. scatters, per-reel asymmetric strips beyond what data expresses, bonus rounds) —
  those extend the engine and the `MachineMath` shape under a new decision, not a data
  edit alone.

## References

- Related specs: SPEC-038 (this decision's origin — pins the type + extracts the default
  machine), SPEC-039/040 (parameterize the engine), SPEC-041 (presentation slice),
  SPEC-042 (registry + hook), SPEC-043 (frozen-seed parity guard).
- Related decisions: DEC-001 (extends), DEC-006 / DEC-011 / DEC-003 (generalizes),
  DEC-002 (deterministic RNG — the frozen seeds that guard the migration).
- Parent work: PROJ-002 brief, STAGE-007 stage frame.
