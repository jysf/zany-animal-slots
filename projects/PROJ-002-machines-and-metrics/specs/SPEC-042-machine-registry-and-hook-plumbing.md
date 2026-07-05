---
# Maps to ContextCore task.* semantic conventions.
# This variant assumes Claude plays every role. The context normally
# in a separate handoff doc lives in the ## Implementation Context
# section below.

task:
  id: SPEC-042
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
    - DEC-015                       # config-driven machine model — one active machine drives engine + UI
    - DEC-001                       # engine sees only math; UI sees presentation
    - DEC-002                       # deterministic RNG — frozen seeds are the end-to-end parity contract
    - DEC-005                       # play-money balance/reset — now sourced from the machine
  constraints:
    - test-before-implementation
    - one-spec-per-pr
    - no-new-top-level-deps-without-decision
    - engine-no-dom
  related_specs:
    - SPEC-039                       # spin() takes machine.math (now passed explicitly by the hook)
    - SPEC-041                       # presentation symbolDisplay (now sourced from the registry, not a direct import)
    - SPEC-013                       # useSlotMachine (the hook being threaded)

# One sentence on what this spec contributes to its stage's
# value_contribution. For plumbing: "infrastructure enabling
# STAGE-007's <capability>". Optional; null is acceptable.
value_link: "Closes the config-driven loop: a machine registry (default only) becomes the single source of the active machine, useSlotMachine threads it into the engine (spin gets machine.math; balance/bet init from the machine) and the reels/paytable read the active machine's presentation from the registry — replacing SPEC-039's spin default and SPEC-041's direct WILD_AND_WHIMSICAL imports. Default-only, no selector; end-to-end behavior-preserving, the seam STAGE-008's machine selector plugs into."

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
      notes: "main-loop, not separately metered (AGENTS §4); design cycle (introduce src/machines/registry.ts as the single source of the active machine; useSlotMachine takes/defaults a machine, threads machine.math into spin, inits balance/bet + reset from the machine, returns the active machine; Game + PaytableSheet source symbolDisplay from getActiveMachine() instead of the direct WILD_AND_WHIMSICAL import. End-to-end behavior-preserving; a 'supplied machine' hook guard proves it's machine-driven; preview check at ship. Bet-level stepping + paytable math source left on engine constants — noted as STAGE-008 follow-ups)."
  totals:
    tokens_total: 0
    estimated_usd: 0
    session_count: 0
---

# SPEC-042: machine registry and hook plumbing

## Context

Fifth STAGE-007 spec — it **closes the config-driven loop**. The engine consumes the
machine's math slice (SPEC-039/040) and the reels/paytable read `symbolDisplay` from the
presentation slice (SPEC-041), but the "which machine" is still resolved by two
independent hard defaults: `spin()` falls back to `WILD_AND_WHIMSICAL_MATH` (SPEC-039),
and `Game.tsx` / `PaytableSheet.tsx` import `WILD_AND_WHIMSICAL` directly (SPEC-041). This
spec introduces a **machine registry** as the single source of the **active machine**, has
`useSlotMachine` thread it into the engine (spin gets `machine.math`; balance/bet init +
reset come from the machine), and points the presentation consumers at
`getActiveMachine()`.

STAGE-007 ships the **default machine only — no selector UI** (that, plus persistence, is
STAGE-008). So `getActiveMachine()` returns the default and the app plays **byte-identically**
to today. The value is the *seam*: one place decides the active machine, threaded into both
engine and presentation — exactly where STAGE-008's machine selector plugs in.

Its guard is **end-to-end parity**: the frozen seeds through `useSlotMachine` (the existing
hook tests pin seeds and assert outcomes) stay green, balance/bet init is unchanged, the UI
renders identically (preview check at ship), plus a **supplied-machine** hook test proving
the hook is genuinely machine-driven (a machine with a different `startingBalance` changes
the initial balance).

See `STAGE-007` (backlog slot 5 of 6), `PROJ-002`, DEC-015, DEC-002 (frozen seeds), DEC-005
(play-money balance/reset, now machine-sourced).

## Goal

Add a machine registry (`src/machines/registry.ts`) as the single source of the active
machine (default only), have `useSlotMachine` take/default a `machine`, thread `machine.math`
into `spin()` and source balance/bet init + reset from the machine, and point `Game` +
`PaytableSheet` at `getActiveMachine()` instead of the direct `WILD_AND_WHIMSICAL` import —
end-to-end behavior-preserving (frozen-seed + balance parity + identical UI), with no
selector UI (STAGE-008).

## Inputs

- **Files to read:**
  - `src/machines/wildAndWhimsical.ts` — the default `Machine` the registry registers.
  - `src/machines/types.ts` — the `Machine` type.
  - `src/ui/useSlotMachine.ts` — the hook: init (`STARTING_BALANCE`/`DEFAULT_BET`), `spin`
    (`engineSpin({ seed, balance, bet })`), `reset` — all to become machine-sourced.
  - `src/ui/regions/Game.tsx` — imports `WILD_AND_WHIMSICAL`, passes its `symbolDisplay`.
  - `src/ui/PaytableSheet.tsx` — imports `WILD_AND_WHIMSICAL`, calls `paytableRows(...)`.
  - `src/ui/App.tsx` — calls `useSlotMachine()` (unchanged; here for context).
  - `src/ui/useSlotMachine.test.tsx` — the pinned-seed hook tests (must stay green).
  - `src/engine/index.ts` — `spin({ seed, balance, bet, machine })` (SPEC-039; unchanged here).
- **External APIs:** none.
- **Related code paths:** `src/machines/`, `src/ui/`.

## Outputs

- **Files created:**
  - `src/machines/registry.ts` — `MACHINES` (default only), `DEFAULT_MACHINE_ID`,
    `getMachine(id)`, `getActiveMachine()`.
  - `src/machines/registry.test.ts` — registry unit tests.
- **Files modified:**
  - `src/ui/useSlotMachine.ts` — `UseSlotMachineOpts` gains `machine?: Machine`; the hook
    resolves `const machine = opts?.machine ?? getActiveMachine()`; balance init falls back to
    `machine.math.startingBalance` (not module `STARTING_BALANCE`); `bet` inits to
    `machine.math.defaultBet`; `reset()` restores `machine.math.startingBalance`; `spin`
    passes `machine: machine.math` to `engineSpin`; the result exposes `machine`. Drop the now-
    unused `STARTING_BALANCE`/`DEFAULT_BET` engine imports (keep `canAfford`/`nextBet`/`prevBet`).
  - `src/ui/regions/Game.tsx` — replace the `WILD_AND_WHIMSICAL` import with
    `getActiveMachine` from `../../machines/registry`; source `symbolDisplay` from it.
  - `src/ui/PaytableSheet.tsx` — same swap: `getActiveMachine().presentation.symbolDisplay`.
  - `src/ui/useSlotMachine.test.tsx` — add the supplied-machine guard cases; existing
    pinned-seed/balance expectations unchanged.
  - `Game.test.tsx` / `PaytableSheet.test.tsx` — only if a direct `WILD_AND_WHIMSICAL` import
    is referenced; rendered expectations unchanged (glyphs identical).
- **New exports:** `MACHINES`, `DEFAULT_MACHINE_ID`, `getMachine`, `getActiveMachine`
  (registry); `machine` added to `UseSlotMachineResult`.
- **New dependency:** none. **New decision:** none (DEC-015 covers it).

## Acceptance Criteria

- [ ] **Registry** (`src/machines/registry.ts`): `getActiveMachine()` returns
      `WILD_AND_WHIMSICAL`; `MACHINES[DEFAULT_MACHINE_ID] === WILD_AND_WHIMSICAL` and
      `DEFAULT_MACHINE_ID === 'wild-and-whimsical'`; `getMachine('wild-and-whimsical')`
      returns it; `getMachine('<unknown>')` falls back to the default.
- [ ] **Hook threads the machine into the engine:** `useSlotMachine` resolves an active
      machine (`opts.machine ?? getActiveMachine()`) and calls `engineSpin({ seed, balance,
      bet, machine: machine.math })`.
- [ ] **Hook state is machine-sourced:** initial balance falls back to
      `machine.math.startingBalance`, initial bet is `machine.math.defaultBet`, and `reset()`
      restores `machine.math.startingBalance` — no module `STARTING_BALANCE`/`DEFAULT_BET`
      read in the hook.
- [ ] **Hook exposes the active machine:** `UseSlotMachineResult` includes `machine: Machine`
      (the resolved active machine).
- [ ] **Presentation sources the active machine:** `Game.tsx` and `PaytableSheet.tsx` read
      `getActiveMachine().presentation.symbolDisplay`; neither imports `WILD_AND_WHIMSICAL`
      directly anymore.
- [ ] **Supplied-machine guard (genuinely machine-driven):** `useSlotMachine({ machine:
      variant })` where `variant.math.startingBalance !== 1000` (with no `initialBalance` and
      no persisted balance) initializes `balance` to `variant.math.startingBalance`, and
      `result.machine` is the supplied `variant`.
- [ ] **Frozen-seed + balance parity:** every existing `useSlotMachine.test.tsx` assertion
      (pinned-seed spins → totalWin/tier/balance, e.g. 407947 → 2000 / balance 2990; the
      loss/small/big seeds; the default balance 1000; reset → 1000) stays byte-identical.
- [ ] **Engine untouched:** `git diff main..HEAD -- src/engine/` is EMPTY (SPEC-039 already
      gave `spin` the `machine` param; this spec only passes it). DEC-001 intact.
- [ ] Full gate green (`just typecheck && just lint && just test && just build`); no new
      dependency; `just validate` passes.

## Failing Tests

Written during **design**, BEFORE build. Existing hook/component expectations stay
byte-identical (that identity is the parity proof); new cases prove the machine-driven seam.

- **`src/machines/registry.test.ts`** (new):
  - `"getActiveMachine returns the default machine"` — `getActiveMachine()` toBe
    `WILD_AND_WHIMSICAL`.
  - `"DEFAULT_MACHINE_ID + MACHINES map"` — `DEFAULT_MACHINE_ID === 'wild-and-whimsical'`;
    `MACHINES[DEFAULT_MACHINE_ID]` toBe `WILD_AND_WHIMSICAL`.
  - `"getMachine resolves by id, falls back for unknown"` — `getMachine('wild-and-whimsical')`
    toBe `WILD_AND_WHIMSICAL`; `getMachine('nope')` toBe `WILD_AND_WHIMSICAL`.
- **`src/ui/useSlotMachine.test.tsx`** (add cases; existing unchanged):
  - `"defaults to the active machine and preserves the frozen seeds"` — with no `machine`
    opt, a pinned-seed spin (e.g. `nextSeed: () => 407947`) still yields `lastWin` 2000 /
    tier jackpot / balance 2990 (i.e. the default is threaded). (May already be covered by an
    existing pinned-seed test — keep those green; this AC is about them not regressing.)
  - `"is machine-driven: a supplied machine sets the starting balance"` — clear
    `localStorage`; render `useSlotMachine({ machine: variant })` with `const variant = { ...
    WILD_AND_WHIMSICAL, math: { ...WILD_AND_WHIMSICAL.math, startingBalance: 5000 } }`; assert
    initial `balance === 5000` and `result.current.machine === variant`. (Contrast: the
    default machine gives 1000 — proving the hook reads the supplied machine, not a constant.)
- **`src/ui/useSlotMachine.test.tsx`** existing pinned-seed/balance tests — must stay green
  verbatim (frozen-seed + balance parity through the default machine).

## Implementation Context

*Read this section (and the files it points to) before starting the build cycle.*

### Decisions that apply

- `DEC-015` — a machine is data; the registry is where the app resolves the active one and
  threads it into engine + presentation.
- `DEC-001` — the engine still only receives `machine.math` (via `spin`); presentation stays
  UI-side. No engine change.
- `DEC-002` — frozen seeds are the end-to-end parity contract (default machine).
- `DEC-005` — play-money balance/reset; now sourced from `machine.math.startingBalance`
  (value unchanged: 1000).

### Constraints that apply

- `test-before-implementation` — the registry tests + the supplied-machine guard are the
  design's failing tests.
- `one-spec-per-pr` — registry + hook threading + the two UI source-swaps only. No selector
  UI, no persistence of a choice, no 2nd machine, no engine change.
- `no-new-top-level-deps-without-decision` — none.
- `engine-no-dom` — unaffected; the engine isn't touched.

### Prior related work

- `SPEC-039` — gave `spin` the `machine` param (defaulted); this spec passes it explicitly
  from the hook. `SPEC-041` — the presentation `symbolDisplay` seam, now sourced from the
  registry. `SPEC-013` — `useSlotMachine`.

### Out of scope (for this spec specifically)

- **Selector UI / persisting a machine choice / a 2nd or 3rd machine** — STAGE-008.
  `getActiveMachine()` returns the default; STAGE-008 makes active-machine selection reactive
  + persisted (a store/context the hook and UI subscribe to) and adds the selector.
- **Bet-level stepping per machine** — `nextBet`/`prevBet` still use the engine's `BET_LEVELS`
  (equal to `machine.math.betLevels`). Parameterizing bet stepping is a STAGE-008 follow-up
  (only matters when a machine has different bet levels). Note it; don't do it here.
- **Paytable math source per machine** — `paytableRows` still reads the engine's
  `SYMBOLS`/`SYMBOL_TIER`/`PAYTABLE` for the math (SPEC-041 machine-sourced only the emoji).
  Parameterizing the paytable's math is STAGE-008 (a variant with a different paytable).
- **Removing `WILD_AND_WHIMSICAL_MATH` as `spin`'s default** — leave it (harmless; the hook
  now passes the machine explicitly). Cleanup later.
- **Any engine change** — `src/engine/**` untouched.

## Notes for the Implementer

- **Parity anchor is identity.** `getActiveMachine()` is `WILD_AND_WHIMSICAL`, whose
  `math.startingBalance`/`defaultBet` are today's `STARTING_BALANCE` (1000) / `DEFAULT_BET`
  (10) and whose `presentation.symbolDisplay` is today's `SYMBOL_DISPLAY`. So routing the hook
  + UI through the registry changes nothing observable. Keep every existing hook/component
  assertion byte-identical; if one must change, stop and set the timeline `[?]`.
- **Drop-in — `src/machines/registry.ts`:**
  ```ts
  // The machine registry — the single source of the ACTIVE machine.
  // STAGE-007 registers the default machine only (no selector). STAGE-008 makes the active
  // machine selectable + persisted; getActiveMachine() is the seam it plugs into.
  import { WILD_AND_WHIMSICAL } from './wildAndWhimsical';
  import type { Machine } from './types';

  export const DEFAULT_MACHINE_ID = WILD_AND_WHIMSICAL.id;

  /** All registered machines, keyed by id. Default only in STAGE-007. */
  export const MACHINES: Record<string, Machine> = {
    [WILD_AND_WHIMSICAL.id]: WILD_AND_WHIMSICAL,
  };

  /** Look up a machine by id; falls back to the default for an unknown id. */
  export function getMachine(id: string): Machine {
    return MACHINES[id] ?? WILD_AND_WHIMSICAL;
  }

  /** The active machine. Default only in STAGE-007 — STAGE-008 makes this selectable + persisted. */
  export function getActiveMachine(): Machine {
    return MACHINES[DEFAULT_MACHINE_ID];
  }
  ```
- **`useSlotMachine.ts` changes (keep everything else — timers, auto-spin, celebration —
  identical):**
  - Imports: `import { getActiveMachine } from '../machines/registry';` and
    `import type { Machine } from '../machines/types';`. Remove `STARTING_BALANCE` and
    `DEFAULT_BET` from the `../engine/index` import (keep `spin as engineSpin`, `canAfford`,
    `nextBet`, `prevBet`).
  - `UseSlotMachineOpts`: add `machine?: Machine;`.
  - `UseSlotMachineResult`: add `machine: Machine;`.
  - Top of the hook: `const machine = opts?.machine ?? getActiveMachine();`
  - Balance init: `useState<number>(() => opts?.initialBalance ?? readBalance() ??
    machine.math.startingBalance);`
  - Bet init: `useState<BetLevel>(machine.math.defaultBet);`
  - `reset`: `setBalance(machine.math.startingBalance);` (rest of reset unchanged). Add
    `machine` to its `useCallback` deps.
  - `spin`: `const outcome = engineSpin({ seed: nextSeed(), balance, bet, machine: machine.math });`
    Add `machine` to spin's `useCallback` deps.
  - Return object: add `machine,`.
  - (ESLint has no react-hooks plugin, so deps are advisory — but add `machine` for
    correctness; `machine` is a stable module const for the default, so it won't churn.)
- **`Game.tsx`:** replace `import { WILD_AND_WHIMSICAL } from '../../machines/wildAndWhimsical';`
  with `import { getActiveMachine } from '../../machines/registry';`. Add `const machine =
  getActiveMachine();` in the component body and pass `symbolDisplay={machine.presentation.symbolDisplay}`.
- **`PaytableSheet.tsx`:** replace the `WILD_AND_WHIMSICAL` import with `getActiveMachine`;
  `const machine = getActiveMachine();` then `paytableRows(machine.presentation.symbolDisplay)`.
- **Supplied-machine test setup:** the balance init is `opts?.initialBalance ?? readBalance()
  ?? machine.math.startingBalance`. To exercise `startingBalance`, DON'T pass `initialBalance`
  and clear persisted balance first (`localStorage.clear()` or the storage key) so
  `readBalance()` is null. Build the variant by spreading: `{ ...WILD_AND_WHIMSICAL, math: {
  ...WILD_AND_WHIMSICAL.math, startingBalance: 5000 } }`.
- **Repo toolchain gotchas:** ESLint has NO react-hooks plugin (no exhaustive-deps disables);
  NO `@testing-library/user-event` (use `renderHook`/`act` from `@testing-library/react` as
  the existing hook tests do); JSX test files must be `.tsx` (`useSlotMachine.test.tsx`,
  `registry.test.ts` is plain `.ts`); `tsconfig` `include` is `["src"]`. No new dependency.
- **Self-check before finishing:** `git diff main..HEAD -- src/engine/` is EMPTY; `grep -rn
  'WILD_AND_WHIMSICAL' src/ui/regions/Game.tsx src/ui/PaytableSheet.tsx src/ui/useSlotMachine.ts`
  finds nothing (all go through the registry); the full gate is green.
- **Ship-time (orchestrator):** a preview visual + play check — spin a few times, confirm the
  reels/paytable/balance behave identically to the default machine.

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
