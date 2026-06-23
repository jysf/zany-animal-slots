---
# Maps to ContextCore task.* semantic conventions.

task:
  id: SPEC-013
  type: story
  cycle: build
  blocked: false
  priority: high
  complexity: M

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
    - DEC-002
    - DEC-005
  constraints:
    - portrait-first
    - touch-targets-44
    - test-before-implementation
    - one-spec-per-pr
  related_specs:
    - SPEC-011
    - SPEC-012

value_link: "The game becomes playable — wires the Spin control to the engine's spin(), turning a click into a real resolved grid + updated balance, the spine the rest of STAGE-003 layers onto."

cost:
  sessions:
    - cycle: design
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      duration_minutes: 35
      recorded_at: 2026-06-23
      notes: "main-loop, not separately metered (AGENTS §4); design cycle"
  totals:
    tokens_total: 0
    estimated_usd: 0
    session_count: 0
---

# SPEC-013: Spin button and flow

## Context

The second STAGE-003 spec and the playable spine. SPEC-012 renders a static board;
this spec makes it move: a **Spin** control wired to the engine's `spin()` so a
click debits the bet, resolves a real 5×3 grid, credits any win, and updates the
displayed balance. It introduces the UI's spin-flow state (a `useSlotMachine`
hook) and lifts the live grid into it, feeding SPEC-012's pure `ReelGrid`. The UI
supplies a fresh **seed** per spin (the engine only consumes a provided seed —
DEC-002); the engine still owns all game outcomes (DEC-001).

This is the synchronous spin: a click immediately resolves to the landed grid and
new balance. The *animated* spinning phase (idle → spinning → stopped, reel-stop
bounce, controls-disabled-mid-spin) is the later animation spec; bet controls are
SPEC-014 and balance persistence is SPEC-015. Bet is fixed at the default (10) and
balance is in-memory here.

See `STAGE-003-reels-ui-and-spin-flow.md`, `DEC-001` (UI consumes the engine only
via `src/engine`), `DEC-002` (injected seed), `DEC-005` (play-money; unaffordable
is a typed no-op, not an error), and SPEC-011's `spin()` / SPEC-012's `ReelGrid`.

## Goal

Wire a Spin control to the engine: a `useSlotMachine` hook holding grid/balance/
bet/lineWins/tier, whose `spin()` calls `spin({ seed, balance, bet })` with a
UI-generated seed and applies the outcome; plus the Spin button (Action region),
the balance/bet readout (Status region), and App threading the live grid into
`ReelGrid`. Spin is disabled when the balance can't cover the bet.

## Inputs

- **Files to read:** `src/engine/index.ts` (`spin`, `SpinOutcome`, `Grid`,
  `BetLevel`, `LineWin`, `WinTier`, `STARTING_BALANCE`, `DEFAULT_BET`, `canAfford`),
  `src/ui/reels/symbols.ts` (`INITIAL_GRID`), `src/ui/reels/ReelGrid.tsx`,
  `src/ui/App.tsx`, `src/ui/regions/{Game,Status,Action}.tsx` + `regions.css`,
  `src/styles/tokens.css`.
- **Related code paths:** `src/ui/`.

## Outputs

- **Files created:**
  - `src/ui/useSlotMachine.ts` — the spin-flow hook.
  - `src/ui/useSlotMachine.test.tsx` — hook tests (deterministic via injected seed).
  - `src/ui/regions/Action.test.tsx`, `src/ui/regions/Status.test.tsx` — region tests.
  - (controls/readout CSS may extend `regions.css` or a small `controls.css` — your
    call, tokens only, no raw hex.)
- **Files modified:**
  - `src/ui/regions/Game.tsx` — take a `grid: Grid` prop and render
    `<ReelGrid grid={grid} />` (instead of owning `INITIAL_GRID`).
  - `src/ui/regions/Action.tsx` — render a **Spin** button from props
    `{ onSpin: () => void; canSpin: boolean }`; disabled when `!canSpin`; ≥44px.
  - `src/ui/regions/Status.tsx` — show balance + bet from props
    `{ balance: number; bet: number }`.
  - `src/ui/App.tsx` — call `useSlotMachine()` and thread `grid` → `Game`,
    `{ balance, bet }` → `Status`, `{ onSpin: spin, canSpin }` → `Action`.
- **New exports:**
  - `useSlotMachine(opts?: { initialBalance?: number; nextSeed?: () => number }):
    { grid: Grid; balance: number; bet: BetLevel; lineWins: LineWin[]; tier: WinTier;
    status: 'idle' | 'resolved'; canSpin: boolean; spin: () => void }`.
- **Database changes:** none. (localStorage persistence is SPEC-015.)

## Acceptance Criteria

- [ ] `useSlotMachine()` starts at `balance = STARTING_BALANCE` (1000),
      `bet = DEFAULT_BET` (10), `grid = INITIAL_GRID`, `status = 'idle'`,
      `lineWins = []`, `tier = 'none'`, `canSpin = true`.
- [ ] `spin()` calls the engine `spin({ seed: nextSeed(), balance, bet })` and, on
      `ok`, updates grid/balance/lineWins/tier and sets `status = 'resolved'`. The
      new balance is the engine's (`balance − bet + totalWin`); the UI computes no
      outcome itself.
- [ ] When `!canAfford(balance, bet)` (e.g. balance 5, bet 10), `canSpin` is false
      and `spin()` is a no-op (balance unchanged, no throw).
- [ ] The **Action** region renders an accessible **Spin** button that calls
      `onSpin` when clicked and is `disabled` when `canSpin` is false; the button is
      ≥44px (`touch-targets-44`).
- [ ] The **Status** region displays the current balance and bet.
- [ ] `App` wires the hook so the rendered board (`ReelGrid`) shows the hook's grid
      and the balance readout reflects the hook's balance.
- [ ] UI imports the engine only via `src/engine`; engine is unchanged; no
      `Math.random()` in `src/engine/**`. `just typecheck/lint/test/build` exit 0.

## Failing Tests

Written during **design**, BEFORE build. Behavior is RTL/`renderHook`; the spin
*animation* and look are out of scope here (later spec). Deterministic outcomes use
an injected `nextSeed`; the fixtures are the SPEC-011 full-spin values.

- **`src/ui/useSlotMachine.test.tsx`** (use `renderHook` + `act`)
  - `"starts idle at 1000 with default bet and the initial grid"` — initial
    `balance === 1000`, `bet === 10`, `status === 'idle'`, `tier === 'none'`,
    `lineWins` empty, `canSpin === true`, `grid` equals `INITIAL_GRID`.
  - `"a winning spin applies the engine outcome"` — with
    `useSlotMachine({ nextSeed: () => 276 })`, after `act(() => result.spin())`:
    `balance === 1045`, `tier === 'big'`, `lineWins.length === 3`,
    `status === 'resolved'`, and `grid` is no longer `INITIAL_GRID`.
  - `"a losing spin still debits the bet"` — with `nextSeed: () => 12345`, after a
    spin: `balance === 990`, `tier === 'none'`.
  - `"cannot spin when the balance can't cover the bet"` — with
    `useSlotMachine({ initialBalance: 5 })`: `canSpin === false`; after
    `act(() => result.spin())`, `balance === 5` (unchanged) and `status` stays
    `'idle'`.

- **`src/ui/regions/Action.test.tsx`**
  - `"renders an enabled Spin button that calls onSpin"` — render
    `<Action onSpin={fn} canSpin />`; `getByRole('button', { name: /spin/i })` is
    enabled; clicking it calls `fn`.
  - `"disables Spin when canSpin is false"` — `<Action onSpin={fn} canSpin={false} />`
    → the Spin button is `disabled` and clicking does not call `fn`.

- **`src/ui/regions/Status.test.tsx`**
  - `"shows the balance and bet"` — `<Status balance={1000} bet={10} />` renders
    text containing `1000` and `10` (e.g. a "Balance" and "Bet" readout).

- **`src/ui/App.test.tsx`** (extended)
  - `"renders the Spin control and a balance readout"` — render `<App />`; a button
    named `/spin/i` is present and enabled, and the balance `1000` is shown. (The
    existing four-region + device-stage assertions still hold.)

## Implementation Context

### Decisions that apply

- `DEC-001` — the UI calls `spin()` from `src/engine` (index) and renders its
  `SpinResult`; it never recomputes outcomes. No engine internals imported.
- `DEC-002` — the engine takes a seed; the UI generates it. Default `nextSeed` is a
  UI concern (e.g. a `Date.now()`-seeded incrementing counter); it is **injectable**
  so tests are deterministic. (Using `Date.now()`/`Math.random()` in the *UI* is
  fine — the `deterministic-rng` constraint only governs `src/engine/**`.)
- `DEC-005` — play-money; an unaffordable spin is a no-op returning the unchanged
  balance, never a thrown error.

### Constraints that apply

- `touch-targets-44` — the Spin button is ≥44px.
- `portrait-first` — controls/readout fit the portrait cabinet.
- `test-before-implementation`, `one-spec-per-pr`.

### Prior related work

- `SPEC-011` (shipped, PR #11) — `spin({ seed, balance, bet })`; fixtures: seed 276
  → big win, balance 1045, 3 line wins; seed 12345 → no win, balance 990.
- `SPEC-012` (shipped, PR #12) — `ReelGrid({ grid })` (pure) + `INITIAL_GRID`.

### Out of scope (for this spec specifically)

- The animated spinning phase: idle → **spinning** → stopped, reel-stop bounce,
  controls-disabled-*during*-the-spin, and any inter-state timing (the animation
  spec). Here a spin resolves synchronously to the landed grid.
- Bet +/− controls (SPEC-014) — bet is fixed at `DEFAULT_BET`.
- Balance persistence to localStorage + Reset (SPEC-015) — balance is in-memory.
- Auto-spin (later spec) and the winning-line highlight (later spec) — the hook
  exposes `lineWins`/`tier` as data, but rendering a highlight/celebration is not here.

## Notes for the Implementer

- `useSlotMachine`: React state for `grid` (init `INITIAL_GRID`), `balance` (init
  `opts.initialBalance ?? STARTING_BALANCE`), `bet` (`DEFAULT_BET`), `lineWins`
  (`[]`), `tier` (`'none'`), `status` (`'idle'`). `canSpin = canAfford(balance, bet)`.
  `spin()`: `if (!canSpin) return; const o = engineSpin({ seed: nextSeed(), balance,
  bet }); if (o.ok) { setGrid(o.grid); setBalance(o.balance); setLineWins(o.lineWins);
  setTier(o.tier); setStatus('resolved'); }`. Wrap in `useCallback` if convenient.
- Default `nextSeed`: a module-level counter seeded once from `Date.now()`, e.g.
  `let s = Date.now() | 0; const nextSeed = () => (s = (s + 0x9e3779b1) | 0);` — keep
  it in the hook file; tests inject their own.
- `Action`: a single `<button type="button" onClick={onSpin} disabled={!canSpin}>`
  with an accessible name "Spin" (campfire-styled via a token, e.g.
  `--color-accent`/`--color-coin`), min-height/width 44px.
- `Status`: render balance + bet as labelled text (e.g. "Balance 1000" / "Bet 10");
  keep it simple and token-styled.
- `Game` now takes `grid` — update its one existing test (SPEC-012's Game.test)
  if needed so it passes a grid (or keep a default param of `INITIAL_GRID` to avoid
  breaking it; your call, but App must pass the live grid).
- Keep `ReelGrid` untouched (pure). Do not add timing/animation here.

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
