---
# Maps to ContextCore task.* semantic conventions.

task:
  id: SPEC-015
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
    - DEC-005
  constraints:
    - portrait-first
    - touch-targets-44
    - test-before-implementation
    - one-spec-per-pr
  related_specs:
    - SPEC-013

value_link: "Makes the balance stick — persists it to localStorage so a session survives reloads, with a Reset that restores 1000 (DEC-005)."

cost:
  sessions:
    - cycle: design
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      duration_minutes: 20
      recorded_at: 2026-06-23
      notes: "main-loop, not separately metered (AGENTS §4); design cycle"
    - cycle: build
      agent: claude-sonnet-4-6
      interface: claude-code
      tokens_total: 72272
      estimated_usd: 0.48
      duration_minutes: 4.2
      recorded_at: 2026-06-23
      notes: "Sonnet sub-agent build (Agent subagent_tokens=72272, 253s). estimated_usd ~= tokens x $6.6/M Sonnet blended, no cache discount (order-of-magnitude, AGENTS §4)."
    - cycle: verify
      agent: claude-sonnet-4-6
      interface: claude-code
      tokens_total: 64262
      estimated_usd: 0.42
      duration_minutes: 3.2
      recorded_at: 2026-06-23
      notes: "Sonnet sub-agent verify (Agent subagent_tokens=64262, 191s). estimated_usd ~= tokens x $6.6/M Sonnet blended, no cache discount (order-of-magnitude, AGENTS §4)."
    - cycle: ship
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      duration_minutes: 12
      recorded_at: 2026-06-23
      notes: "main-loop, not separately metered (AGENTS §4); ship cycle (incl. preview persistence/reset check via eval)"
  totals:
    tokens_total: 136534
    estimated_usd: 0.90
    session_count: 4
---

# SPEC-015: Balance persistence and reset

## Context

The fourth STAGE-003 spec. So far the balance is in-memory and resets to 1000 on
every reload. This spec makes it **persist**: the balance is written to
localStorage and rehydrated on load, and a **Reset** control restores it to 1000
(DEC-005: balance is a local-only play-money number). Persistence is a UI concern —
the engine stays storage-free (DEC-001). One of the project's two localStorage keys
(`balance`; `mute` arrives with audio in STAGE-004/005).

See `STAGE-003-reels-ui-and-spin-flow.md`, `DEC-005` ("balance ... local-only (a
`localStorage` number; Reset restores 1000)"), and SPEC-013's `useSlotMachine`.

## Goal

Persist the balance across reloads via localStorage (rehydrate on init, write on
change) and add a `reset()` (→ `STARTING_BALANCE`) surfaced as a Reset button, with
a small safe storage module. The engine remains untouched.

## Inputs

- **Files to read:** `src/engine/index.ts` (`STARTING_BALANCE`),
  `src/ui/useSlotMachine.ts`, `src/ui/App.tsx`, `src/ui/regions/Action.tsx` +
  `controls.css`, `DEC-005`.
- **Related code paths:** `src/ui/`.

## Outputs

- **Files created:**
  - `src/ui/storage.ts` — `BALANCE_KEY`, `readBalance(): number | null`,
    `writeBalance(n: number): void` (safe: try/catch, ignores non-finite / invalid).
  - `src/ui/storage.test.ts` — storage round-trip + invalid-value tests.
- **Files modified:**
  - `src/ui/useSlotMachine.ts` — initialize balance from
    `opts.initialBalance ?? readBalance() ?? STARTING_BALANCE`; write balance to
    storage on change (effect); add `reset()` to the result.
  - `src/ui/regions/Action.tsx` — render a **Reset** button from props
    `{ onReset: () => void }` (≥44px, accessible name "Reset").
  - `src/ui/App.tsx` — thread `reset` → `Action` as `onReset`.
  - `src/ui/useSlotMachine.test.tsx`, `src/ui/regions/Action.test.tsx` — extend.
  - `src/ui/regions/controls.css` — style the Reset button (tokens, no raw hex).
- **New exports:** `reset` on `UseSlotMachineResult`; `storage.ts` exports.
- **Database changes:** none (localStorage only).

## Acceptance Criteria

- [ ] `writeBalance(n)` then `readBalance()` round-trips the number; `readBalance()`
      returns `null` when the key is absent or the stored value is not a finite
      number (no throw).
- [ ] `useSlotMachine()` with no `initialBalance` rehydrates the balance from
      localStorage when present, else starts at `STARTING_BALANCE`. An explicit
      `opts.initialBalance` still takes precedence (for tests).
- [ ] After a spin (or reset), the new balance is written to localStorage.
- [ ] `reset()` sets the balance back to `STARTING_BALANCE` (1000) and persists it;
      a **Reset** button (≥44px, `touch-targets-44`) in the Action region calls it.
- [ ] The engine is unchanged; UI imports the engine only via `src/engine`;
      `just typecheck/lint/test/build` exit 0.

## Failing Tests

Written during **design**, BEFORE build. RTL/`renderHook`; tests clear localStorage
in `beforeEach` so storage state is isolated.

- **`src/ui/storage.test.ts`**
  - `"round-trips a balance"` — `writeBalance(777)` then `readBalance() === 777`.
  - `"returns null when absent"` — with cleared storage, `readBalance() === null`.
  - `"ignores an invalid stored value"` — set the raw key to `"not-a-number"`;
    `readBalance() === null` (no throw).

- **`src/ui/useSlotMachine.test.tsx`** (extended; `beforeEach(() =>
  localStorage.clear())`)
  - `"rehydrates the balance from localStorage"` — `writeBalance(777)` before
    `renderHook(() => useSlotMachine())` → initial `balance === 777`.
  - `"falls back to STARTING_BALANCE when storage is empty"` — cleared storage →
    initial `balance === 1000`.
  - `"persists the balance after a spin"` — `useSlotMachine({ nextSeed: () => 12345 })`
    (no initialBalance), `act(spin)` → `balance === 990` **and** `readBalance() === 990`.
  - `"reset restores 1000 and persists"` — `useSlotMachine({ nextSeed: () => 12345 })`,
    `act(spin)` (balance 990), then `act(reset)` → `balance === 1000` and
    `readBalance() === 1000`.

- **`src/ui/regions/Action.test.tsx`** (extended)
  - `"renders a Reset button that calls onReset"` — render `<Action>` with the props
    incl. `onReset`; `getByRole('button', { name: /reset/i })` calls `onReset` on click.

## Implementation Context

### Decisions that apply

- `DEC-005` — balance is a local-only play-money number; Reset restores 1000. No
  real currency, no server.
- `DEC-001` — persistence is a UI concern; the engine takes/returns plain numbers
  and never touches storage.

### Constraints that apply

- `touch-targets-44` — the Reset button is ≥44px.
- `portrait-first`, `test-before-implementation`, `one-spec-per-pr`.

### Prior related work

- `SPEC-013` (shipped) — `useSlotMachine` (balance state + spin). `SPEC-014`
  (shipped) — bet controls in the Action region (Reset joins that controls bar).

### Out of scope (for this spec specifically)

- The `mute` localStorage key + audio (STAGE-004/005).
- Reel animation (SPEC-016), auto-spin (SPEC-017), line highlight (SPEC-018).
- Migrating/ versioning the stored value, or cross-tab sync — a single plain
  number key is enough for v1.

## Notes for the Implementer

- `storage.ts`: `export const BALANCE_KEY = 'zany-animal-slots.balance';`
  `readBalance()`: `try { const raw = localStorage.getItem(BALANCE_KEY); if (raw ===
  null) return null; const n = Number(raw); return Number.isFinite(n) ? n : null; }
  catch { return null; }`. `writeBalance(n)`: `try { localStorage.setItem(BALANCE_KEY,
  String(n)); } catch { /* ignore quota/unavailable */ }`.
- Hook init: `useState<number>(() => opts?.initialBalance ?? readBalance() ??
  STARTING_BALANCE)`. Persist with `useEffect(() => { writeBalance(balance); },
  [balance])`. `reset = useCallback(() => setBalance(STARTING_BALANCE), [])`.
- Note the effect persists `opts.initialBalance` too — fine; the test files clear
  localStorage in `beforeEach` so suites stay isolated.
- Action: a `<button>` named "Reset" (≥44px), `onClick={onReset}`. Place it in the
  controls bar; keep Spin prominent. It can always be enabled.
- After building, the orchestrator does a preview check (spin a few times, reload →
  balance persists; click Reset → back to 1000).

---

## Build Completion

*Filled in at the end of the **build** cycle, before advancing to verify.*

- **Branch:** `feat/spec-015-balance-persistence`
- **PR (if applicable):**
- **All acceptance criteria met?** yes
- **New decisions emitted:**
  - none (storage pattern is straightforward; the spec's Notes for the Implementer was
    specific enough to not require a new DEC)
- **Deviations from spec:**
  - None. Implemented exactly as specified: storage.ts with BALANCE_KEY/readBalance/writeBalance,
    hook init via lazy-initializer pattern, useEffect persist, reset callback, Reset button in
    Action with aria-label "Reset" and ≥44px CSS via tokens, all failing tests written.
- **Follow-up work identified:**
  - None beyond existing STAGE-003 backlog (SPEC-016 animation, SPEC-017 auto-spin,
    SPEC-018 line highlight).

### Build-phase reflection (3 questions, short answers)

1. **What was unclear in the spec that slowed you down?**
   — Nothing significant. The "Notes for the Implementer" section was exceptionally
   complete — it gave the exact function bodies for readBalance/writeBalance and the
   useState/useEffect/useCallback patterns. The only minor thing to reason through was
   whether adding `beforeEach(localStorage.clear())` to the existing useSlotMachine tests
   would break any of the prior tests; it didn't, because all pre-existing tests that needed
   a specific balance already passed `initialBalance` which takes precedence.

2. **Was there a constraint or decision that should have been listed but wasn't?**
   — No missing decisions. DEC-001 (engine-no-dom), DEC-005 (play-money / reset to 1000),
   and the touch-targets-44 constraint covered everything. The "no raw hex in CSS" rule
   comes from the coding conventions section of AGENTS.md rather than a constraint ID —
   it could be worth a dedicated constraint entry, but it's not a blocker.

3. **If you did this task again, what would you do differently?**
   — Nothing structural. The build was smooth and the spec was tight. If anything,
   I'd note that the spec could have explicitly called out the `defaultBetProps` fixture
   in Action.test.tsx needs `onReset` added to it (required prop update for existing
   tests) — but it was an obvious consequence of adding a required prop and took only
   seconds to address.

---

## Verify

Verified 2026-06-23 by claude-sonnet-4-6 (cold sub-agent).

**Verdict: APPROVED**

- ACCEPTANCE CRITERIA: All five checkboxes met — storage round-trips, rehydration, persist-after-spin, reset persists, engine unchanged, gate exit 0.
- STORAGE SAFETY: `readBalance` is fully wrapped in try/catch and returns `null` on absent key, non-finite value, or any exception. `writeBalance` is fully wrapped with silent catch. The invalid-value test sets a non-numeric raw string and expects `null`. Never throws. PASS.
- HOOK PERSISTENCE: Init order is `opts?.initialBalance ?? readBalance() ?? STARTING_BALANCE` (lazy initializer). Explicit `initialBalance` wins — existing tests unaffected. `useEffect([balance])` persists on every change. `reset = useCallback(() => setBalance(STARTING_BALANCE), [])` is correct. Persist-after-spin and reset-persists fixtures are genuine (no `initialBalance` passed, so storage path is exercised). PASS.
- TEST ISOLATION: `beforeEach(() => localStorage.clear())` present in both `storage.test.ts` and `useSlotMachine.test.tsx`. PASS.
- WIRING/A11Y: `reset-btn` has `min-height: 2.75rem` (44px) and `min-width: 2.75rem` (44px). `aria-label="Reset"` provides accessible name. All CSS colors via design tokens, no raw hex. `App.tsx` passes `onReset={reset}` to `<Action>`. PASS.
- DEC-001/DEC-005: `git diff main..HEAD -- src/engine/` is empty. Persistence is UI-only. Balance is local play-money. PASS.
- TESTS NOT VACUOUS: Tests catch: missing `writeBalance` call (persist-after-spin checks `readBalance()`), wrong init precedence (rehydration test), reset not persisting (reset test checks both state and storage), `readBalance` throwing on garbage (invalid-value test). PASS.
- DECISION DRIFT: No non-trivial build choices needing a new DEC. Spec's implementation notes were specific enough. `just decisions-audit --changed` reports no scope. PASS.
- BUILD REFLECTION: Three questions answered honestly, non-empty, with real friction identified (existing-test compatibility reasoning, `defaultBetProps` update). PASS.
- COST: Design null-with-note (main-loop, correct). Build null-with-note (sub-agent, orchestrator fills). Pattern correct per AGENTS §4.
- GATE: `just typecheck && just lint && just test && just build` all exit 0. 100/100 tests pass.

---

## Reflection (Ship)

*Appended during the **ship** cycle.*

1. **What would I do differently next time?**
   — Nothing. Extracting a tiny `storage.ts` (safe read/write) kept the hook clean
   and made the storage edge cases (absent/invalid/throwing) unit-testable on their
   own. The preview eval (spin → reload → persists → Reset) confirmed the full
   round-trip the unit tests approximate with jsdom localStorage.

2. **Does any template, constraint, or decision need updating?**
   — No. DEC-005 already specified "localStorage number; Reset restores 1000"; this
   implements it exactly. The `mute` key is correctly deferred to the audio stage.

3. **Is there a follow-up spec I should write now before I forget?**
   — No new spec. Next is SPEC-016 (reel spin/stop animation), then auto-spin and
   the winning-line highlight — all in the STAGE-003 backlog.
