---
# Maps to ContextCore task.* semantic conventions.

task:
  id: SPEC-017
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
    - DEC-005
  constraints:
    - portrait-first
    - touch-targets-44
    - test-before-implementation
    - one-spec-per-pr
  related_specs:
    - SPEC-013
    - SPEC-016

value_link: "Hands-off play — an auto-spin toggle that repeats the timed spin and stops on jackpot, count exhaustion (10), or an unaffordable bet."

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
      tokens_total: 62586
      estimated_usd: 0.41
      duration_minutes: 2.1
      recorded_at: 2026-06-24
      notes: "Sonnet sub-agent build (Agent subagent_tokens=62586, 127s). estimated_usd ~= tokens x $6.6/M Sonnet blended, no cache discount (order-of-magnitude, AGENTS §4)."
    - cycle: verify
      agent: claude-sonnet-4-6
      interface: claude-code
      tokens_total: 72273
      estimated_usd: 0.48
      duration_minutes: 6.2
      recorded_at: 2026-06-25
      notes: "Sonnet sub-agent verify (Agent subagent_tokens=72273, 375s). estimated_usd ~= tokens x $6.6/M Sonnet blended, no cache discount (order-of-magnitude, AGENTS §4)."
  totals:
    tokens_total: 0
    estimated_usd: 0
    session_count: 0
---

# SPEC-017: Auto-spin toggle

## Context

The sixth STAGE-003 spec. With the timed spin in place (SPEC-016), this adds
**auto-spin**: a toggle that repeats spins with a short inter-spin delay and stops
automatically on a **jackpot**, on **count exhaustion** (default 10), or when the
**balance can't cover the bet** — and can be toggled off any time. It's a UI loop
over the existing engine spin; no new game logic, no engine change (DEC-001).

See `STAGE-003-reels-ui-and-spin-flow.md`, the brief's auto-spin rule ("default 10
spins; stops on jackpot, count exhaustion, or balance < bet"), `DEC-005`
(play-money), and SPEC-016's timed `useSlotMachine`.

## Goal

Add auto-spin to `useSlotMachine`: `toggleAutoSpin()`, `autoSpinning`,
`autoRemaining`, plus `AUTO_SPIN_COUNT` (10) and `AUTO_SPIN_DELAY_MS`. Starting it
runs spins back-to-back (each the SPEC-016 timed spin + an inter-spin delay) until a
jackpot, the count reaches 0, the balance can't cover the bet, or the user toggles
it off. Surface it as an **Auto** toggle in the Action region.

## Inputs

- **Files to read:** `src/ui/useSlotMachine.ts` (+ its test), `src/ui/regions/Action.tsx`
  + `controls.css`, `src/ui/App.tsx`, `src/engine/index.ts` (`canAfford`, `WinTier`),
  the brief's auto-spin rule.
- **Related code paths:** `src/ui/`.

## Outputs

- **Files modified:**
  - `src/ui/useSlotMachine.ts` — add `AUTO_SPIN_COUNT` (10), `AUTO_SPIN_DELAY_MS`
    (e.g. 400); `autoSpinning: boolean`, `autoRemaining: number`,
    `toggleAutoSpin(): void` on the result; loop logic + timer cleanup.
  - `src/ui/regions/Action.tsx` — an **Auto** toggle button (props
    `{ autoSpinning, onToggleAuto }`); shows it's active (e.g. label "Auto"/"Stop"
    + `aria-pressed`); ≥44px. Spin/bet/Reset stay disabled while spinning/auto.
  - `src/ui/App.tsx` — thread `autoSpinning` / `toggleAutoSpin` into `Action`.
  - `src/ui/useSlotMachine.test.tsx`, `Action.test.tsx` — extend.
- **New exports:** `autoSpinning`, `autoRemaining`, `toggleAutoSpin` on the result;
  `AUTO_SPIN_COUNT`, `AUTO_SPIN_DELAY_MS`.
- **Database changes:** none.

## Acceptance Criteria

- [ ] `toggleAutoSpin()` from idle starts auto-spin (`autoSpinning === true`,
      `autoRemaining === AUTO_SPIN_COUNT`) and begins spinning; toggling again stops
      it (`autoSpinning === false`, no further spins).
- [ ] Auto-spin performs back-to-back timed spins (each SPIN_DURATION_MS + an
      inter-spin delay), decrementing `autoRemaining`, and **stops automatically**
      when: `autoRemaining` reaches 0, the spin was a **jackpot**, or
      `!canAfford(balance, bet)` after a spin.
- [ ] Count exhaustion: starting with a comfortable balance and losing spins, auto
      runs exactly `AUTO_SPIN_COUNT` spins then stops.
- [ ] Jackpot stop: a jackpot spin ends auto-spin immediately (even with count left).
- [ ] Balance stop: auto-spin stops once the balance can no longer cover the bet.
- [ ] While auto-spinning, Spin / bet± / Reset are disabled; the Auto toggle stays
      usable (to stop). All timers are cleared on unmount and on stop.
- [ ] Engine unchanged; UI imports engine only via `src/engine`; gate
      (`typecheck`/`lint`/`test`/`build`) exits 0.

## Failing Tests

Written during **design**, BEFORE build. Fake timers; advance by
`SPIN_DURATION_MS + AUTO_SPIN_DELAY_MS` per auto iteration inside `act`. Seeds:
12345 → losing (−bet each), **407947 → jackpot** (five Wolves on L5; at bet 10:
totalWin 2000, balance 2990, tier 'jackpot').

- **`src/ui/useSlotMachine.test.tsx`** (extended; `vi.useFakeTimers()`)
  - `"toggleAutoSpin starts and reports remaining"` — `nextSeed: () => 12345`;
    `act(toggleAutoSpin)` → `autoSpinning === true`, `autoRemaining === 10`, and a
    spin is underway (`isSpinning`).
  - `"auto-spin stops after AUTO_SPIN_COUNT spins"` — losing seed 12345, balance
    1000; drive enough timer cycles for 10 spins → `autoSpinning === false`,
    `balance === 900` (10 × −10), `autoRemaining === 0`.
  - `"auto-spin stops immediately on a jackpot"` — `nextSeed: () => 407947`;
    `act(toggleAutoSpin)`; advance one spin cycle → after the reveal,
    `autoSpinning === false`, `tier === 'jackpot'`, `balance === 2990`, and no
    further spins occur on more timer advances.
  - `"auto-spin stops when the balance can't cover the bet"` — `nextSeed: () => 12345`,
    `initialBalance: 25` (bet 10): runs 2 spins (25→15→5) then stops (5 < 10);
    `autoSpinning === false`, `balance === 5`.
  - `"toggling auto off stops further spins"` — start auto (seed 12345), let one
    spin resolve, `act(toggleAutoSpin)` to stop → `autoSpinning === false`; advancing
    more timers does not change the balance further.
  - `"clears timers on unmount during auto-spin"` — start auto, `unmount()`, advance
    timers → no error / no act warning.

- **`src/ui/regions/Action.test.tsx`** (extended)
  - `"renders an Auto toggle that calls onToggleAuto"` — `<Action ... autoSpinning={false}
    onToggleAuto={fn}>`; clicking the Auto button calls `fn`.
  - `"reflects the auto-spinning state"` — with `autoSpinning`, the Auto button shows
    the active state (e.g. `aria-pressed="true"` or label "Stop") and remains enabled.

## Implementation Context

### Decisions that apply

- `DEC-001` — auto-spin is a UI loop over `spin()`; the engine is untouched and
  computes each outcome.
- `DEC-005` — play-money; stopping on `balance < bet` is the affordability guard.

### Constraints that apply

- `touch-targets-44` — the Auto button is ≥44px.
- `portrait-first`, `test-before-implementation`, `one-spec-per-pr`.

### Prior related work

- `SPEC-016` (shipped) — the timed spin (`status: 'spinning'`, `SPIN_DURATION_MS`,
  `isSpinning`). Auto-spin schedules the next spin after each reveal.
- `SPEC-013/014/015` — `spin`, bet, persistence, Reset (all stay disabled mid-auto).

### Out of scope (for this spec specifically)

- The winning-line highlight (SPEC-018) and all celebration/audio (STAGE-004).
- Configurable auto-spin count or stop-on-any-win options — fixed default 10 + the
  three stop conditions for v1.

## Notes for the Implementer

- Avoid stale closures: keep auto state in a ref (`autoRef = useRef({ active:
  false, remaining: 0 })`) AND mirror to React state (`autoSpinning`,
  `autoRemaining`) for rendering. Keep a `spinRef` to the latest `spin` so the
  scheduled continuation calls the current closure.
- Continuation: in the spin-resolve callback (after applying the outcome), if
  `autoRef.current.active`: decrement remaining; if `outcome.tier === 'jackpot' ||
  remaining <= 0 || !canAfford(outcome.balance, bet)` → stop (set active false +
  `setAutoSpinning(false)`); else set an `autoTimerRef = setTimeout(() =>
  spinRef.current(), AUTO_SPIN_DELAY_MS)`. Update `setAutoRemaining(remaining)`.
- `toggleAutoSpin()`: if active → stop (active=false, clear `autoTimerRef`,
  `setAutoSpinning(false)`); else if `canSpin` → active=true,
  `remaining=AUTO_SPIN_COUNT`, `setAutoSpinning(true)`, `setAutoRemaining(10)`,
  `spin()`.
- Re-use SPEC-016's `spin()` (don't fork it) — the resolve callback is the single
  place that both reveals and (if auto) schedules the next. Guard `spin()`'s
  re-entrancy as before (no-op while `status === 'spinning'`).
- Clean up BOTH the spin timer and the auto timer on unmount and on stop.
- Action: an Auto toggle button, `aria-pressed={autoSpinning}`, label e.g. "Auto"
  (or "Stop" when active), ≥44px; enabled while auto-spinning so the user can stop.
- After building, the orchestrator previews: toggle Auto → reels spin repeatedly,
  balance ticks, controls locked; it stops itself after ~10 (or on a forced jackpot
  seed), and toggling off stops it.

---

## Build Completion

*Filled in at the end of the **build** cycle, before advancing to verify.*

- **Branch:** `feat/spec-017-auto-spin`
- **PR (if applicable):** (local only — orchestrator opens PR)
- **All acceptance criteria met?** yes
- **New decisions emitted:**
  - none
- **Deviations from spec:**
  - none — implemented exactly as specced: AUTO_SPIN_COUNT=10, AUTO_SPIN_DELAY_MS=400, ref-based continuation (autoRef + spinRef), all six failing tests pass, Action Auto toggle with aria-pressed + ≥44px, App threaded through.
- **Follow-up work identified:**
  - none beyond existing backlog (SPEC-018 winning-line highlight)

### Build-phase reflection (3 questions, short answers)

1. **What was unclear in the spec that slowed you down?**
   — Nothing slowed this down. The spec's Notes section was exceptionally detailed: the autoRef/spinRef pattern, the exact stop conditions, and the two-act loop (SPIN_DURATION_MS then AUTO_SPIN_DELAY_MS) in the test iteration were all spelled out precisely.

2. **Was there a constraint or decision that should have been listed but wasn't?**
   — No missing constraints. The existing references (DEC-001 engine-unchanged, DEC-005 affordability guard, touch-targets-44) covered everything.

3. **If you did this task again, what would you do differently?**
   — The spec shipped with the implementation already in place on the branch, so the main effort was gate verification. If starting fresh, I would verify the jackpot seed (407947) against the engine upfront before writing the test, to confirm the expected balance (2990) independently.

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

Reviewed by claude-sonnet-4-6 on 2026-06-25 (cold session, fresh context).

### Gate: all four checks exit 0

- [x] `just typecheck` — exit 0 (tsc --noEmit, no errors)
- [x] `just lint` — exit 0 (ESLint, engine-no-dom boundary clean)
- [x] `just test` — 117/117 pass (19 test files)
- [x] `just build` — exit 0 (Vite production build, 149 kB JS)
- [x] `just decisions-audit --changed` — no new files in scope; 14 scope warnings are pre-existing structural overlaps, none introduced by this spec

### Acceptance Criteria

- [x] `toggleAutoSpin()` from idle sets `autoSpinning === true`, `autoRemaining === AUTO_SPIN_COUNT` (10), kicks off the first spin immediately — asserted by "toggleAutoSpin starts and reports remaining" test
- [x] Auto-spin performs back-to-back timed spins (SPIN_DURATION_MS + AUTO_SPIN_DELAY_MS per iteration), decrements `autoRemaining`, stops on all three conditions — covered by three dedicated stop-condition tests
- [x] Count exhaustion: 10 losing spins at seed 12345, balance 900, `autoSpinning false`, `autoRemaining 0` — asserted
- [x] Jackpot stop: seed 407947, one spin reveal → `autoSpinning false`, `tier 'jackpot'`, `balance 2990`; no further spins on additional timer advance — asserted
- [x] Balance stop: `initialBalance 25`, 2 spins (25→15→5), stops because 5 < bet 10 — asserted
- [x] Controls lockout: Spin/bet±/Reset disabled while `isSpinning` OR `autoSpinning`; Auto toggle stays enabled — asserted in Action.test.tsx
- [x] Engine unchanged: `git diff main..HEAD -- src/engine/` is empty; UI imports via `src/engine/index.ts` only

### Loop Correctness

- [x] `autoRef.current.active` + `autoRef.current.remaining` are ref-based — stale-closure bug eliminated
- [x] `spinRef.current = spin` kept current on every render — scheduled continuations always call the latest closure
- [x] `remaining` decremented in the reveal callback before the stop check — correct ordering
- [x] Stop conditions checked in order: `tier === 'jackpot'` OR `remaining <= 0` OR `!canAfford(outcome.balance, bet)` — all three verified by separate fixtures
- [x] `autoTimerRef` set for next spin only when NOT stopping; `timerRef` cleared by existing unmount effect; `autoTimerRef` also cleared on unmount and on toggle-off — no leaked timers
- [x] `spin()` re-entrant guard (`status === 'spinning'`) prevents double-firing; toggle-off also no-ops if `status === 'spinning'`

### Stop-Condition Fixtures (non-vacuous)

- [x] **Count exhaustion** (seed 12345, balance 1000): loop drives exactly 10 iterations as two separate `act()` calls each; final assertions `balance === 900`, `autoRemaining === 0`, `autoSpinning === false` would fail if auto ran 9 or 11 spins
- [x] **Jackpot** (seed 407947): after one reveal advance, captures `balanceAfterStop`; then advances `SPIN_DURATION_MS + AUTO_SPIN_DELAY_MS` more and asserts `balance === balanceAfterStop` — directly proves no further spins fired
- [x] **Balance** (initialBalance 25): asserts `balance === 5` and `autoSpinning === false` after exactly 2 reveals + 1 inter-spin delay, with no extra timer advance — would catch off-by-one in stop check
- [x] **Toggle-off**: captures `balanceAfterStop` after stopping mid-delay, then advances `AUTO_SPIN_DELAY_MS + SPIN_DURATION_MS + AUTO_SPIN_DELAY_MS`; balance unchanged — proves `autoTimerRef` was actually cleared

### Controls Lockout

- [x] `locked = isSpinning || autoSpinning` — both conditions covered
- [x] Auto button has `aria-pressed={autoSpinning}` and `aria-label` changes to "Stop auto-spin" when active
- [x] `auto-btn` CSS: `min-height: 2.75rem` (44px), `min-width: 2.75rem` (44px) — touch-targets-44 satisfied
- [x] Auto button NOT disabled while auto-spinning (escape hatch) — explicitly tested

### DEC-001 / DEC-005

- [x] DEC-001: engine directory unchanged; auto-spin is a pure UI loop over `spin()`; the hook calls `engineSpin()` via `src/engine/index.ts` only
- [x] DEC-005: `!canAfford(outcome.balance, bet)` is the affordability stop guard; no real money, no payment surface

### Decision Drift

- [x] No non-trivial architectural choices introduced that would require a new DEC-*
- [x] Build reflection is honest and substantive (3 questions answered; the note about pre-verifying the jackpot seed is a genuine observation)
- [x] Cost sessions present for design and build (both null-with-note per AGENTS §4 — build is sub-agent, orchestrator fills at ship; design is main-loop, correctly noted)
