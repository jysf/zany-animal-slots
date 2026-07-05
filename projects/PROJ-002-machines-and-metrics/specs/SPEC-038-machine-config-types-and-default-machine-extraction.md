---
# Maps to ContextCore task.* semantic conventions.
# This variant assumes Claude plays every role. The context normally
# in a separate handoff doc lives in the ## Implementation Context
# section below.

task:
  id: SPEC-038
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
    - DEC-015                       # emitted by this spec (config-driven machine model)
    - DEC-001                       # engine-no-dom boundary must survive
    - DEC-006                       # symbol set — becomes the default machine's data
    - DEC-011                       # weights/paytable — becomes the default machine's data
    - DEC-003                       # fixed paylines — becomes the default machine's data
  constraints:
    - engine-no-dom
    - test-before-implementation
    - one-spec-per-pr
    - no-new-top-level-deps-without-decision
  related_specs:
    - SPEC-006                       # symbols + weighted reel strips (constants extracted here)
    - SPEC-008                       # payline + paytable evaluation (constants extracted here)
    - SPEC-011                       # public engine interface (index.ts, extended additively)

# One sentence on what this spec contributes to its stage's
# value_contribution. For plumbing: "infrastructure enabling
# STAGE-007's <capability>". Optional; null is acceptable.
value_link: "The keystone of the config-driven spine: pins the Machine type (a math slice the engine consumes + a presentation slice the UI consumes) and expresses today's game as the default machine 'Wild & Whimsical' — data only, no engine signature changes yet — so every later STAGE-007 spec parameterizes against a fixed, parity-guarded shape. Emits DEC-015."

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
      duration_minutes: 30
      recorded_at: 2026-07-04
      notes: "main-loop, not separately metered (AGENTS §4); design cycle (keystone: pin the Machine type — math + presentation slices — extract today's constants into the default machine referencing them byte-identically, write the data-parity failing tests + build prompt, emit DEC-015). No engine signature changes designed here."
  totals:
    tokens_total: 0
    estimated_usd: 0
    session_count: 0
---

# SPEC-038: machine config types and default machine extraction

## Context

This is the **keystone** spec of `STAGE-007` (Config-driven machine model), the
spine of `PROJ-002` (Machines & Metrics). The stage turns the one hard-coded game
into a config-driven one: a **machine** is pure data — a **math slice** the engine
consumes (symbols, tiers, strips/weights, paylines, paytable, jackpot rule, tier
boundaries, bet levels, starting balance) and a **presentation slice** the UI
consumes (emoji, theme tokens, audio params). Once the engine is parameterized,
STAGE-008's fun-retune and extra machines become *data* edits, not engine code.

STAGE-007 deliberately **unfreezes** the engine (untouched since SPEC-011), so it
must land first, guarded by frozen-seed parity. SPEC-038 is the first, lowest-risk
step: it **pins the `Machine` type** and expresses today's game as the default
machine **"Wild & Whimsical"** — a data object whose fields *reference* the current
engine constants byte-identically — **without changing any engine function
signature**. That fixed, parity-guarded shape is what SPEC-039 (grid + payline),
SPEC-040 (tier + jackpot), SPEC-041 (presentation), and SPEC-042 (registry + hook)
parameterize against; SPEC-043 is the durable frozen-seed parity guard.

Because SPEC-038 changes no engine logic, its risk is confined to *shape*: is the
`Machine` type complete, and does the default machine's data equal today's
constants? Both are pinned by a **data-parity** contract test written here at design.

See `STAGE-007` (backlog slot 1 of 6), `PROJ-002`, and DEC-001/006/011/003 (whose
specifics become the default machine's data — see DEC-015).

## Goal

Define the `Machine` config type (a `math` slice for the engine + a `presentation`
slice for the UI) and express today's game as the default machine **"Wild &
Whimsical"**, whose data references the current engine constants byte-identically —
**adding no engine function signatures and changing no engine logic** — and pin the
extraction with a data-parity contract test. Emit **DEC-015** (config-driven machine
model).

## Inputs

- **Files to read:**
  - `src/engine/strips.ts` — `SYMBOLS`, `SYMBOL_TIER`, `REEL_WEIGHTS`, `REEL_COUNT`,
    `REEL_STRIP`, `STRIPS`, `SymbolId`, `Tier` (the math slice's symbol/reel data).
  - `src/engine/paylines.ts` — `PAYLINES`, `PAYTABLE`, `Payline` (paylines + paytable).
  - `src/engine/balance.ts` — `BET_LEVELS`, `DEFAULT_BET`, `STARTING_BALANCE`, `BetLevel`.
  - `src/engine/tiers.ts` — the hard-coded jackpot rule (WOLF×5) + big boundary (5×),
    which become `jackpot` / `tiers` data on the math slice.
  - `src/engine/index.ts` — the public interface; SPEC-038 adds **additive** re-exports.
  - `src/ui/reels/symbols.ts` — `SYMBOL_DISPLAY` (the presentation slice's emoji/label).
  - `projects/PROJ-001-animal-slots/specs/done/SPEC-037-...-timeline.md` +
    `SECURITY.contract.test.ts` — the contract-test-as-guard pattern to mirror.
- **External APIs:** none.
- **Related code paths:** `src/engine/`, a new `src/machines/`, `src/ui/reels/`.

## Outputs

- **Files created:**
  - `src/engine/machine.ts` — the engine-facing **`MachineMath`** type (+ `JackpotRule`,
    `TierBoundaries`) and `WILD_AND_WHIMSICAL_MATH: MachineMath` (references today's
    engine constants). Pure data, no DOM (DEC-001).
  - `src/machines/types.ts` — the app-facing **`Machine`** and **`MachinePresentation`**
    types (the composition of math + presentation).
  - `src/machines/wildAndWhimsical.ts` — `WILD_AND_WHIMSICAL: Machine` (the default
    machine: math from the engine + `presentation.symbolDisplay` from the UI map).
  - `src/machines/wildAndWhimsical.parity.test.ts` — the data-parity contract test.
- **Files modified:**
  - `src/engine/index.ts` — **additive** re-exports only: `export type { MachineMath,
    JackpotRule, TierBoundaries } from './machine'` and `export {
    WILD_AND_WHIMSICAL_MATH } from './machine'`. No existing export or signature changes.
- **New exports:** `MachineMath`, `JackpotRule`, `TierBoundaries`, `WILD_AND_WHIMSICAL_MATH`
  (engine); `Machine`, `MachinePresentation`, `WILD_AND_WHIMSICAL` (machines).
- **Database changes:** none.
- **New dependency:** **none**.
- **New decision:** **DEC-015** (config-driven machine model) — created in `decisions/`.

## Acceptance Criteria

- [ ] **`MachineMath` type** (`src/engine/machine.ts`) has exactly these fields, typed
      against existing engine types: `symbols: readonly SymbolId[]`, `symbolTier:
      Record<SymbolId, Tier>`, `reelWeights: Record<SymbolId, number>`, `reelCount:
      number`, `rows: number`, `strips: readonly (readonly SymbolId[])[]`, `paylines:
      readonly Payline[]`, `paytable: Record<Tier, readonly [number, number, number]>`,
      `jackpot: JackpotRule`, `tiers: TierBoundaries`, `betLevels: readonly BetLevel[]`,
      `defaultBet: BetLevel`, `startingBalance: number`. `JackpotRule = { symbol:
      SymbolId; count: number }`; `TierBoundaries = { bigMultiple: number }`.
- [ ] **`Machine` type** (`src/machines/types.ts`) = `{ id: string; name: string; math:
      MachineMath; presentation: MachinePresentation }`; `MachinePresentation = {
      symbolDisplay: Record<SymbolId, { emoji: string; label: string }> }` (theme +
      audio params are explicitly deferred to SPEC-041).
- [ ] **Default machine** `WILD_AND_WHIMSICAL` has `id === 'wild-and-whimsical'`, `name
      === 'Wild & Whimsical'`, `math === WILD_AND_WHIMSICAL_MATH`, and `presentation.
      symbolDisplay === SYMBOL_DISPLAY`.
- [ ] **Data parity:** every `WILD_AND_WHIMSICAL_MATH` field deep-equals the current
      constant (`symbols`↔`SYMBOLS`, `symbolTier`↔`SYMBOL_TIER`, `reelWeights`↔
      `REEL_WEIGHTS`, `reelCount`↔`REEL_COUNT`, `strips`↔`STRIPS`, `paylines`↔`PAYLINES`,
      `paytable`↔`PAYTABLE`, `betLevels`↔`BET_LEVELS`, `defaultBet`↔`DEFAULT_BET`,
      `startingBalance`↔`STARTING_BALANCE`), and the extracted literals match today's
      behavior exactly: `jackpot === { symbol: 'WOLF', count: 5 }`, `tiers === {
      bigMultiple: 5 }`, `rows === 3`, `reelCount === 5`, `startingBalance === 1000`,
      and `sum(reelWeights) === 35 === REEL_STRIP.length`.
- [ ] **DEC-001 intact:** `src/engine/machine.ts` imports no React/DOM (the engine-no-dom
      ESLint boundary + `src/test/engine-boundary.test.ts` still pass).
- [ ] **No engine logic/signature change:** `git diff main..HEAD` shows **zero** changes
      to `src/engine/strips.ts`, `paylines.ts`, `tiers.ts`, `spin.ts`, `balance.ts`,
      `rng.ts`; the only `src/engine/` changes are the new `machine.ts` and **additive**
      re-exports in `index.ts`. All existing engine tests pass unchanged.
- [ ] **DEC-015** exists in `decisions/DEC-015-config-driven-machine-model.md` (extends
      DEC-001; generalizes DEC-006/011/003) and validates via `just decisions-audit` if
      that check runs in the gate.
- [ ] Full gate green (`just typecheck && just lint && just test && just build`); no new
      dependency; `just validate` passes.

## Failing Tests

Written during **design**, BEFORE build. The implementer makes them pass by creating
the machine files exactly as specified (the drop-in code is in **Notes**).

- **`src/machines/wildAndWhimsical.parity.test.ts`** — imports `WILD_AND_WHIMSICAL`
  from `./wildAndWhimsical`; imports the live constants from `../engine/strips`,
  `../engine/paylines`, `../engine/balance`, and `SYMBOL_DISPLAY` from
  `../ui/reels/symbols`. (Importing engine internals from a test is fine — many engine
  unit tests do; the engine-no-dom boundary only constrains `src/engine/**` *source*.)
  - `"identity"` — `WILD_AND_WHIMSICAL.id === 'wild-and-whimsical'` and `.name ===
    'Wild & Whimsical'`.
  - `"symbols + tiers + weights"` — `math.symbols` toEqual `SYMBOLS`; `math.symbolTier`
    toEqual `SYMBOL_TIER`; `math.reelWeights` toEqual `REEL_WEIGHTS`.
  - `"reel geometry + strips"` — `math.reelCount` toBe `REEL_COUNT` toBe `5`; `math.rows`
    toBe `3`; `math.strips` toEqual `STRIPS`, toHaveLength `5`, and every strip toEqual
    `REEL_STRIP` with length `35`.
  - `"paylines + paytable"` — `math.paylines` toEqual `PAYLINES`; `math.paytable` toEqual
    `PAYTABLE`.
  - `"jackpot rule + tier boundary"` — `math.jackpot` toEqual `{ symbol: 'WOLF', count:
    5 }`; `math.tiers` toEqual `{ bigMultiple: 5 }`.
  - `"bet levels + starting balance"` — `math.betLevels` toEqual `BET_LEVELS`;
    `math.defaultBet` toBe `DEFAULT_BET`; `math.startingBalance` toBe `STARTING_BALANCE`
    toBe `1000`.
  - `"presentation symbolDisplay"` — `presentation.symbolDisplay` toEqual `SYMBOL_DISPLAY`.
  - `"structural completeness"` — for every `s` in `math.symbols`: `math.symbolTier[s]`,
    `math.reelWeights[s] > 0`, and `presentation.symbolDisplay[s]` are all defined; and
    `sum(Object.values(math.reelWeights)) === 35 === REEL_STRIP.length`.

## Implementation Context

*Read this section (and the files it points to) before starting the build cycle.*

### Decisions that apply

- **`DEC-015`** (emitted by this spec) — config-driven machine model: the engine will
  consume a machine's math slice; a machine is pure data. SPEC-038 pins the type +
  extracts the default machine; later specs wire the engine to it.
- `DEC-001` — engine-no-dom: the engine only ever sees the **math** slice; `machine.ts`
  imports no React/DOM. The presentation slice lives in `src/machines/` (app layer).
- `DEC-006` / `DEC-011` / `DEC-003` — the symbol set / weights+paytable / fixed paylines
  become the default machine's **data**. Their rationale still holds; DEC-015 generalizes
  (does not supersede) them.

### Constraints that apply

- `engine-no-dom` — `src/engine/machine.ts` must not import React/DOM.
- `test-before-implementation` — the parity test is written here at design; build makes
  it pass.
- `one-spec-per-pr` — machine types + default-machine extraction + DEC-015 only. No
  engine function changes, no UI wiring (those are SPEC-039..042).
- `no-new-top-level-deps-without-decision` — no new dependency.

### Prior related work

- `SPEC-006` (symbols + weighted strips), `SPEC-008` (paylines + paytable), `SPEC-009`
  (bet/balance), `SPEC-010` (win tiers), `SPEC-011` (public engine interface) — the
  constants being extracted and the `index.ts` surface being extended additively.
- The contract-test-as-guard pattern (`SECURITY.contract.test.ts`, the a11y/perf/headers
  guards) — this spec's parity test follows it.

### Out of scope (for this spec specifically)

- **Any engine function signature/logic change** — `spin`/`resolveGrid`/`evaluatePaylines`
  /`classifyWin` are untouched here. Parameterizing them is SPEC-039 (grid+payline) and
  SPEC-040 (tier+jackpot).
- **Presentation theme tokens + audio params** in the machine — SPEC-041. SPEC-038's
  `MachinePresentation` holds only `symbolDisplay`; SPEC-041 extends it with theme +
  audio and wires the UI to read the active machine.
- **A machine registry, selector UI, persistence, or a 2nd/3rd machine** — SPEC-042
  (registry + hook plumbing, default only) and STAGE-008.
- **Re-homing the literal data / deleting engine constants** — at SPEC-038 the machine
  *references* the constants (single source of truth, zero transcription risk). Ownership
  inverts incrementally in SPEC-039..042 as each engine function is parameterized, each
  step guarded by frozen seeds. See Notes → "Migration strategy".
- **`useSlotMachine` / any component change** — SPEC-042.

## Notes for the Implementer

- **Migration strategy (why the machine *references* constants here).** SPEC-038 makes
  the default machine's math fields *point at* the existing engine constants
  (`symbols: SYMBOLS`, `paytable: PAYTABLE`, …). This gives one source of truth and
  **zero transcription risk** for the keystone. The literal data will be re-homed into
  the machine and the engine constants retired incrementally in SPEC-039..042, each step
  guarded by the frozen seeds. The data-parity test here is therefore a **transitional**
  guard (valid while both representations coexist); SPEC-043's frozen-seed parity is the
  durable behavioral guard. A later spec that deletes a constant updates/removes the
  matching assertion here.
- **Drop-in code — `src/engine/machine.ts`:**
  ```ts
  // The engine-consumed MATH slice of a machine (DEC-015; DEC-001: plain data, no DOM).
  // SPEC-038 pins the shape and extracts today's game as WILD_AND_WHIMSICAL_MATH by
  // *referencing* the current engine constants byte-identically. No engine function
  // signature changes here — SPEC-039/040 wire the engine to consume this.
  import type { SymbolId, Tier } from './strips';
  import { SYMBOLS, SYMBOL_TIER, REEL_WEIGHTS, REEL_COUNT, STRIPS } from './strips';
  import type { Payline } from './paylines';
  import { PAYLINES, PAYTABLE } from './paylines';
  import type { BetLevel } from './balance';
  import { BET_LEVELS, DEFAULT_BET, STARTING_BALANCE } from './balance';

  /** The jackpot rule: `count` of `symbol` on a payline. Today: five WOLF (DEC-003). */
  export interface JackpotRule {
    symbol: SymbolId;
    count: number;
  }

  /** Amount-based win-tier boundaries. big = totalWin >= bigMultiple × totalBet. */
  export interface TierBoundaries {
    bigMultiple: number;
  }

  /** The MATH slice the engine consumes. A machine = this + a presentation slice. */
  export interface MachineMath {
    symbols: readonly SymbolId[];
    symbolTier: Record<SymbolId, Tier>;
    reelWeights: Record<SymbolId, number>;
    reelCount: number;
    /** Visible rows per reel (today: 3, implicit in visibleCells' 3-tuple). */
    rows: number;
    strips: readonly (readonly SymbolId[])[];
    paylines: readonly Payline[];
    paytable: Record<Tier, readonly [number, number, number]>;
    jackpot: JackpotRule;
    tiers: TierBoundaries;
    betLevels: readonly BetLevel[];
    defaultBet: BetLevel;
    startingBalance: number;
  }

  /** The default machine's math slice — today's constants, byte-identical (DEC-015). */
  export const WILD_AND_WHIMSICAL_MATH: MachineMath = {
    symbols: SYMBOLS,
    symbolTier: SYMBOL_TIER,
    reelWeights: REEL_WEIGHTS,
    reelCount: REEL_COUNT,
    rows: 3,
    strips: STRIPS,
    paylines: PAYLINES,
    paytable: PAYTABLE,
    jackpot: { symbol: 'WOLF', count: 5 },
    tiers: { bigMultiple: 5 },
    betLevels: BET_LEVELS,
    defaultBet: DEFAULT_BET,
    startingBalance: STARTING_BALANCE,
  };
  ```
- **Drop-in code — additive re-exports in `src/engine/index.ts`** (add near the existing
  `// ── Re-exports` blocks; change nothing else):
  ```ts
  export type { MachineMath, JackpotRule, TierBoundaries } from './machine';
  export { WILD_AND_WHIMSICAL_MATH } from './machine';
  ```
- **Drop-in code — `src/machines/types.ts`:**
  ```ts
  // A machine = pure config: a MATH slice (engine) + a PRESENTATION slice (UI).
  // SPEC-038 pins symbolDisplay in the presentation slice; SPEC-041 extends it with
  // theme tokens + audio params and wires the UI to read the active machine.
  import type { SymbolId, MachineMath } from '../engine/index';

  export interface MachinePresentation {
    symbolDisplay: Record<SymbolId, { emoji: string; label: string }>;
  }

  export interface Machine {
    id: string;
    name: string;
    math: MachineMath;
    presentation: MachinePresentation;
  }
  ```
- **Drop-in code — `src/machines/wildAndWhimsical.ts`:**
  ```ts
  // The default machine — today's game expressed as pure config (DEC-015).
  // Behavior-preserving: its data IS the current constants (the math slice references
  // WILD_AND_WHIMSICAL_MATH; the presentation slice references the UI's SYMBOL_DISPLAY).
  // The migration re-homes data, it does not re-tune (STAGE-007; STAGE-008 retunes).
  import { WILD_AND_WHIMSICAL_MATH } from '../engine/index';
  import { SYMBOL_DISPLAY } from '../ui/reels/symbols';
  import type { Machine } from './types';

  export const WILD_AND_WHIMSICAL: Machine = {
    id: 'wild-and-whimsical',
    name: 'Wild & Whimsical',
    math: WILD_AND_WHIMSICAL_MATH,
    presentation: {
      symbolDisplay: SYMBOL_DISPLAY,
    },
  };
  ```
- **Drop-in code — `src/machines/wildAndWhimsical.parity.test.ts`:**
  ```ts
  import { describe, it, expect } from 'vitest';
  import { WILD_AND_WHIMSICAL } from './wildAndWhimsical';
  import {
    SYMBOLS,
    SYMBOL_TIER,
    REEL_WEIGHTS,
    REEL_COUNT,
    REEL_STRIP,
    STRIPS,
  } from '../engine/strips';
  import { PAYLINES, PAYTABLE } from '../engine/paylines';
  import { BET_LEVELS, DEFAULT_BET, STARTING_BALANCE } from '../engine/balance';
  import { SYMBOL_DISPLAY } from '../ui/reels/symbols';

  const { math, presentation } = WILD_AND_WHIMSICAL;

  describe('SPEC-038 default machine parity — extracted data == current constants', () => {
    it('identity', () => {
      expect(WILD_AND_WHIMSICAL.id).toBe('wild-and-whimsical');
      expect(WILD_AND_WHIMSICAL.name).toBe('Wild & Whimsical');
    });

    it('symbols + tiers + weights', () => {
      expect(math.symbols).toEqual(SYMBOLS);
      expect(math.symbolTier).toEqual(SYMBOL_TIER);
      expect(math.reelWeights).toEqual(REEL_WEIGHTS);
    });

    it('reel geometry + strips', () => {
      expect(math.reelCount).toBe(REEL_COUNT);
      expect(math.reelCount).toBe(5);
      expect(math.rows).toBe(3);
      expect(math.strips).toEqual(STRIPS);
      expect(math.strips).toHaveLength(5);
      for (const strip of math.strips) {
        expect(strip).toEqual(REEL_STRIP);
        expect(strip).toHaveLength(35);
      }
    });

    it('paylines + paytable', () => {
      expect(math.paylines).toEqual(PAYLINES);
      expect(math.paytable).toEqual(PAYTABLE);
    });

    it('jackpot rule + tier boundary', () => {
      expect(math.jackpot).toEqual({ symbol: 'WOLF', count: 5 });
      expect(math.tiers).toEqual({ bigMultiple: 5 });
    });

    it('bet levels + starting balance', () => {
      expect(math.betLevels).toEqual(BET_LEVELS);
      expect(math.defaultBet).toBe(DEFAULT_BET);
      expect(math.startingBalance).toBe(STARTING_BALANCE);
      expect(math.startingBalance).toBe(1000);
    });

    it('presentation symbolDisplay', () => {
      expect(presentation.symbolDisplay).toEqual(SYMBOL_DISPLAY);
    });

    it('structural completeness — every symbol has a tier, weight, and display', () => {
      for (const s of math.symbols) {
        expect(math.symbolTier[s]).toBeDefined();
        expect(math.reelWeights[s]).toBeGreaterThan(0);
        expect(presentation.symbolDisplay[s]).toBeDefined();
      }
      const sum = Object.values(math.reelWeights).reduce((a, b) => a + b, 0);
      expect(sum).toBe(35);
      expect(sum).toBe(REEL_STRIP.length);
    });
  });
  ```
- **Repo toolchain gotchas** (apply even though this is mostly a data spec): ESLint has
  **no** react-hooks plugin (don't add exhaustive-deps disables) and **no**
  `@testing-library/user-event`. The parity test is a `.ts` file (no JSX) — correct.
  `tsconfig` `include` is `["src"]`, so all new `src/**` files are typechecked. Do **not**
  add a new dependency. Do **not** touch `src/engine/{strips,paylines,tiers,spin,balance,
  rng}.ts` or any component/hook.
- **DEC-015** is authored at **design** (by the architect) and already exists in
  `decisions/DEC-015-config-driven-machine-model.md` when build starts — the builder does
  **not** create it. It extends DEC-001 and generalizes DEC-006/011/003; its
  `affected_scope` is scoped to `src/engine/machine.ts` + `src/machines/**` (the overlap
  with DEC-001's `src/engine/**` is intentional and explained in the DEC). The builder
  should read it but only references it in the Build Completion notes.

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

Process-focused: how did the build go? What friction did the spec create?

1. **What was unclear in the spec that slowed you down?**
   — <answer>

2. **Was there a constraint or decision that should have been listed but wasn't?**
   — <answer>

3. **If you did this task again, what would you do differently?**
   — <answer>

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
