---
# Maps to ContextCore task.* semantic conventions.

task:
  id: SPEC-013
  type: story
  cycle: verify
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
    - cycle: build
      agent: claude-sonnet-4-6
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      duration_minutes: null
      recorded_at: 2026-06-23
      notes: "sub-agent build cycle — orchestrator to fill tokens_total/estimated_usd/duration from Agent result"
    - cycle: verify
      agent: claude-sonnet-4-6
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      duration_minutes: null
      recorded_at: 2026-06-23
      notes: "sub-agent verify cycle — orchestrator to fill tokens_total/estimated_usd/duration from Agent result"
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

- **Branch:** `feat/spec-013-spin-flow`
- **PR (if applicable):** (orchestrator will open after verify)
- **All acceptance criteria met?** yes
- **New decisions emitted:**
  - none (no non-trivial novel decisions; choices followed DEC-001/002/005 exactly)
- **Deviations from spec:**
  - `@testing-library/user-event` is not installed; Action test uses `fireEvent` from `@testing-library/react` instead. Behavior is equivalent for a disabled-button click assertion.
- **Follow-up work identified:**
  - none beyond the existing stage backlog (bet controls, persistence, animation)

### Build-phase reflection (3 questions, short answers)

1. **What was unclear in the spec that slowed you down?**
   — Nothing materially unclear. The only minor friction was discovering `@testing-library/user-event` is absent — the spec's test code used `userEvent.click` by implication but the dep wasn't listed as available. `fireEvent` is an equivalent substitute for this assertion.

2. **Was there a constraint or decision that should have been listed but wasn't?**
   — No missing constraints. The "no new deps" rule (informally stated in the build prompt) is the constraint that matters here; it could be explicit in `constraints.yaml` as `no-new-deps-in-build`, but it's minor enough to leave advisory.

3. **If you did this task again, what would you do differently?**
   — Check the available testing utilities (`grep @testing-library package.json`) before writing test code that might reference a missing package. It's a 5-second check that avoids one test-run/fix cycle.

---

## Reflection (Ship)

*Appended during the **ship** cycle.*

1. **What would I do differently next time?**
   — <answer>

2. **Does any template, constraint, or decision need updating?**
   — <answer>

3. **Is there a follow-up spec I should write now before I forget?**
   — <answer>

---

## Verify

**Verdict: ✅ APPROVED**

Reviewer: claude-sonnet-4-6 | Date: 2026-06-23

### Gate
- [x] `just typecheck` — exit 0
- [x] `just lint` — exit 0
- [x] `just test` — exit 0 (86/86 tests, 17 files)
- [x] `just build` — exit 0 (Vite production bundle)
- [x] `just decisions-audit --changed` — no drift (no uncommitted UI changes in scope)
- [x] `git diff main..HEAD -- src/engine/` — empty; engine unchanged

### Acceptance Criteria
- [x] `useSlotMachine()` starts at balance=1000, bet=10, INITIAL_GRID, status='idle', lineWins=[], tier='none', canSpin=true — confirmed in useSlotMachine.test.tsx, all four assertions present
- [x] spin() calls engineSpin({ seed: nextSeed(), balance, bet }) and applies ok outcome — confirmed; hook does setGrid/setBalance/setLineWins/setTier/setStatus from outcome fields; UI computes nothing
- [x] canAfford(balance<bet) → canSpin=false, spin() no-op, balance unchanged, no throw — confirmed in test "cannot spin when the balance cannot cover the bet"
- [x] Action renders accessible Spin button, calls onSpin when enabled, disabled when canSpin=false — confirmed in Action.test.tsx (two tests with fireEvent)
- [x] Status shows balance and bet — confirmed in Status.test.tsx
- [x] App wires hook → Game/Status/Action (live grid, balance, canSpin) — confirmed in App.tsx + App.test.tsx SPEC-013 assertion
- [x] UI imports engine only via src/engine index — grep found zero engine internal imports in src/ui; lint passes with engine-no-dom rule

### Flow Correctness
- [x] Initial state: STARTING_BALANCE=1000, DEFAULT_BET=10, INITIAL_GRID, status='idle', tier='none', canSpin=true — all match
- [x] Seed 276 → balance=1045, tier='big', lineWins.length=3 — asserted directly in test
- [x] Seed 12345 → balance=990, tier='none' — asserted directly in test
- [x] Unaffordable (initialBalance=5, bet=10) → canSpin=false, spin() no-op, balance stays 5, status stays 'idle' — asserted

### DEC-001 Boundary
- [x] No imports of engine/rng, engine/spin, engine/strips, engine/paylines, engine/balance, engine/tiers found in src/ui (grep exit 1 = no matches)
- [x] Engine files unchanged (git diff main..HEAD -- src/engine/ is empty)
- [x] No Math.random() in src/engine/** (only appears in comments)

### DEC-002 (injectable seed)
- [x] nextSeed is injectable via opts.nextSeed — tests use { nextSeed: () => 276 } and { nextSeed: () => 12345 }
- [x] Default is module-level counter seeded from Date.now() — in useSlotMachine.ts lines 19-23

### Tests Not Vacuous
- [x] Seed-276 fixture: balance, tier, lineWins.length, status, grid — 5 concrete assertions, would catch UI recomputing balance
- [x] Seed-12345 fixture: balance===990, tier==='none' — catches bet-deduction path
- [x] Low-balance no-op: canSpin===false before spin, balance===5 after spin, status==='idle' — all three asserted; would catch a spin that fires when it shouldn't
- [x] Action disabled test: fireEvent.click on disabled button, onSpin not called — correctly asserts browser disabled behavior

### A11y / Constraints
- [x] Spin button text content "Spin" provides accessible name (getByRole('button', { name: /spin/i }) passes)
- [x] min-height: 2.75rem = 44px; min-width: 2.75rem = 44px — touch-targets-44 met
- [x] controls.css: all colors via CSS custom properties (--color-accent, --color-bg, --color-frame, --color-text-muted, --color-coin, --color-text); zero raw hex found
- [x] ReelGrid untouched (pure, no new imports)

### Decision Drift
- [x] DEC-001: honored — import boundary clean
- [x] DEC-002: honored — injected nextSeed, engine receives seed
- [x] DEC-005: honored — unaffordable spin is a silent no-op; no throw
- [x] fireEvent instead of @testing-library/user-event: acceptable deviation — no new dep needed, behavior identical for disabled-button assertion; not a DEC-worthy choice

### Build Reflection Quality
- [x] Three questions answered with non-empty, honest content
- [x] Deviation (fireEvent vs userEvent) clearly stated with rationale

### Cost Sessions
- [x] Design session present with null numerics + correct note (main-loop, not separately metered)
- [x] Build session present with null numerics + note (orchestrator to fill from Agent result)
- [x] Verify session appended (this cycle)
