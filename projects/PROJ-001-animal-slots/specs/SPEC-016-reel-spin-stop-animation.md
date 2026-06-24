---
# Maps to ContextCore task.* semantic conventions.

task:
  id: SPEC-016
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
    - DEC-004
  constraints:
    - respect-reduced-motion
    - portrait-first
    - test-before-implementation
    - one-spec-per-pr
  related_specs:
    - SPEC-012
    - SPEC-013

value_link: "Turns the instant spin into a real one — idle → spinning → stopped with a reel-stop bounce — so the game feels alive (the UI owns the timing; the engine still owns the outcome)."

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
  totals:
    tokens_total: 0
    estimated_usd: 0
    session_count: 0
---

# SPEC-016: Reel spin/stop animation

## Context

The fifth STAGE-003 spec. SPEC-013's spin resolves instantly; this gives it life:
pressing Spin enters a **spinning** state, the reels animate, then **stop** on the
landed grid with a reel-stop bounce. Animation is CSS transforms/keyframes
(DEC-004), with a `prefers-reduced-motion` path that drops the motion. Crucially,
the engine still computes the whole outcome up front — the UI only **delays the
reveal** and owns all timing ("the engine returns data; the UI owns time"). While
spinning, the controls are disabled.

See `STAGE-003-reels-ui-and-spin-flow.md`, `DEC-004` (CSS transforms/keyframes, not
canvas; clean reduced-motion path), the `respect-reduced-motion` constraint, and
SPEC-013's `useSlotMachine` / SPEC-012's `ReelGrid`.

## Goal

Make `spin()` timed: compute the engine outcome immediately, enter `status:
'spinning'` (controls disabled), and after a fixed UI duration reveal the landed
grid + new balance and return to `idle`. Add the CSS spinning + reel-stop-bounce
animation (staggered reels) with a `prefers-reduced-motion` fallback.

## Inputs

- **Files to read:** `src/ui/useSlotMachine.ts` (the flow + its tests),
  `src/ui/reels/ReelGrid.tsx` + `reels.css`, `src/ui/regions/Action.tsx`,
  `src/ui/App.tsx`, `DEC-004`, `src/styles/tokens.css`.
- **Related code paths:** `src/ui/`.

## Outputs

- **Files modified:**
  - `src/ui/useSlotMachine.ts` — `status` gains `'spinning'`; `spin()` computes the
    outcome, sets `'spinning'`, and applies it after `SPIN_DURATION_MS` (timer);
    `canSpin` is false while spinning; add `isSpinning` to the result; clean up the
    timer on unmount. Export `SPIN_DURATION_MS`.
  - `src/ui/reels/ReelGrid.tsx` — accept a `spinning: boolean` prop; apply a
    `.reel--spinning` / `.reel-grid--spinning` class so the CSS can animate, and a
    reel-stop bounce when it clears (staggered per reel, e.g. via `--reel-index`).
  - `src/ui/reels/reels.css` — `@keyframes` for the spin + the reel-stop bounce
    (CSS transforms only), staggered per reel, behind the non-reduced-motion path;
    a `@media (prefers-reduced-motion: reduce)` block that disables the motion.
  - `src/ui/regions/Action.tsx` — disable bet/reset/spin while `isSpinning` (accept
    an `isSpinning` prop; Spin is already gated by `canSpin`).
  - `src/ui/regions/Game.tsx` — pass `spinning` down to `ReelGrid`.
  - `src/ui/App.tsx` — thread `isSpinning` into `Game` and `Action`.
  - `src/ui/useSlotMachine.test.tsx`, `Action.test.tsx`, plus a `reels.css`
    contract test — extend/add (see Failing Tests).
- **New exports:** `isSpinning` on the result; `SPIN_DURATION_MS`.
- **Database changes:** none.

## Acceptance Criteria

- [ ] `spin()` immediately sets `status: 'spinning'` (and `isSpinning: true`) and
      does **not** yet change the grid/balance; after `SPIN_DURATION_MS` it applies
      the engine outcome (grid/balance/lineWins/tier) and returns to `status:
      'idle'` (`isSpinning: false`).
- [ ] `canSpin` is false while spinning; calling `spin()` again mid-spin is a no-op
      (one outcome per spin); the timer is cleared on unmount (no state-update warning).
- [ ] The outcome is still entirely the engine's — same seed ⇒ same landed grid &
      balance as before; only the *reveal* is delayed (UI owns time, DEC-004/DEC-001).
- [ ] The reel CSS uses transforms/keyframes (DEC-004), staggers the reels, and has
      a `@media (prefers-reduced-motion: reduce)` block that disables the motion;
      no raw hex in the animation CSS.
- [ ] Controls (bet ±, Reset, Spin) are disabled while spinning.
- [ ] Engine unchanged; UI imports engine only via `src/engine`; gate
      (`typecheck`/`lint`/`test`/`build`) exits 0.

## Failing Tests

Written during **design**, BEFORE build. Use `vi.useFakeTimers()` for the timed
flow (advance by `SPIN_DURATION_MS`); the visual motion itself is a preview check,
its **contract** (keyframes + reduced-motion) is asserted by reading the CSS.

- **`src/ui/useSlotMachine.test.tsx`** (extended; fake timers — `beforeEach(() => {
  vi.useFakeTimers(); localStorage.clear(); })`, `afterEach(() =>
  vi.useRealTimers())`; wrap timer advances in `act`)
  - `"spin enters the spinning state without revealing yet"` — with
    `nextSeed: () => 276`, `act(spin)` → `status === 'spinning'`, `isSpinning`,
    `canSpin === false`, and `grid` still `INITIAL_GRID`, `balance` still 1000.
  - `"after SPIN_DURATION_MS the outcome is revealed"` — then
    `act(() => vi.advanceTimersByTime(SPIN_DURATION_MS))` → `status === 'idle'`,
    `isSpinning === false`, `balance === 1045`, `tier === 'big'`, grid changed.
  - `"a second spin mid-spin is ignored"` — `act(spin)`; `act(spin)` again before
    advancing; advance timers → balance reflects exactly one spin (seed 12345 → 990,
    not 980).
  - `"the resolve timer is cleaned up on unmount"` — `act(spin)`, `unmount()`, then
    `vi.advanceTimersByTime(SPIN_DURATION_MS)` → no error / no act warning.
  - (existing SPEC-013/014/015 spin tests are updated to advance timers after
    `spin()` before asserting the resolved balance.)

- **`src/ui/reels/reels.animation.test.ts`** (CSS contract, `fs.readFileSync` like
  SPEC-004)
  - `"defines a reel-stop / spin keyframe animation"` — `reels.css` contains
    `@keyframes` and uses `transform`.
  - `"has a reduced-motion fallback"` — `reels.css` contains
    `@media (prefers-reduced-motion: reduce)`.
  - `"uses no raw hex color literals"` — no `/#[0-9a-fA-F]{3,8}\b/` in `reels.css`.

- **`src/ui/regions/Action.test.tsx`** (extended)
  - `"disables all controls while spinning"` — `<Action ... isSpinning />` → the
    Spin, bet −, bet +, and Reset buttons are all `disabled`.

## Implementation Context

### Decisions that apply

- `DEC-004` — reel animation is CSS transforms/keyframes (GPU-composited), not
  canvas; keep a clean reduced-motion path.
- `DEC-001` — the engine computes the outcome; the UI only times the reveal. No
  engine change; no game logic in the UI.

### Constraints that apply

- `respect-reduced-motion` — a `prefers-reduced-motion: reduce` media query must
  disable the motion (reveal still happens, just without animation).
- `portrait-first`, `test-before-implementation`, `one-spec-per-pr`.
- (`perf-60fps` — use transform/opacity only, which are GPU-composited.)

### Prior related work

- `SPEC-013` (shipped) — synchronous `useSlotMachine` spin (now made timed here).
  `SPEC-012` (shipped) — `ReelGrid` (gains a `spinning` prop). The seed fixtures
  (276 → 1045/big, 12345 → 990/none) are unchanged — only the reveal is delayed.

### Out of scope (for this spec specifically)

- Auto-spin (SPEC-017) and the winning-line highlight (SPEC-018).
- Celebration juice — particles, the wolf jackpot moment, balance count-up,
  tier-scaled feel, audio (STAGE-004).
- Per-symbol reel cycling realism — a transform-based spin blur/translate is
  enough for v1; symbol-accurate scrolling is a future polish.

## Notes for the Implementer

- Hook: keep the precomputed outcome in a ref or closure; `spin()` →
  `setStatus('spinning')`, `timerRef.current = setTimeout(() => { applyOutcome();
  setStatus('idle'); }, SPIN_DURATION_MS)`. Guard re-entrancy on `status ===
  'spinning'`. Clear the timer in a `useEffect` cleanup on unmount. Export
  `SPIN_DURATION_MS` (e.g. `700`). `canSpin = status !== 'spinning' &&
  canAfford(balance, bet)`.
- Persisting balance (SPEC-015) still happens via the existing effect when balance
  updates at reveal — no change needed there.
- ReelGrid: when `spinning`, add a class the CSS animates; stagger reels with an
  inline `style={{ ['--reel-index']: i }}` and an `animation-delay` derived from it
  so they "stop" left→right; apply a short bounce keyframe on stop.
- reels.css: `transform`/`opacity` keyframes only; wrap motion so a
  `@media (prefers-reduced-motion: reduce)` block sets `animation: none` (instant
  reveal). Tokens only, no raw hex.
- Action: thread `isSpinning`; disable the bet ±, Reset, and Spin buttons while it
  is true (Spin is also covered by `canSpin`).
- After building, the orchestrator does a preview check: click Spin → reels animate
  for ~0.7s, controls disabled, then stop on the landed grid with a bounce.

---

## Build Completion

*Filled in at the end of the **build** cycle, before advancing to verify.*

- **Branch:** feat/spec-016-reel-animation
- **PR (if applicable):** (local only — orchestrator to open)
- **All acceptance criteria met?** yes
- **New decisions emitted:**
  - none (CSS animation approach fully covered by DEC-004; no novel decisions)
- **Deviations from spec:**
  - The `status` union now includes `'spinning'` and `'resolved'` (from the prior `'idle' | 'resolved'`). The spec implied `'idle' | 'spinning'` in the AC but the prior code had `'idle' | 'resolved'`. Kept `'resolved'` as the post-spin state (the hook transitions idle → spinning → resolved → idle on next spin). This matches the STAGE-003 success criteria wording ("idle → spinning → resolved").
  - `spin-btn` disabled on `!canSpin || isSpinning`: `canSpin` already gates on `status !== 'spinning'` in the hook, so the `isSpinning` prop is belt-and-suspenders on the button. Kept both because Action receives them as separate props and the spec says to disable while isSpinning.
- **Follow-up work identified:**
  - none beyond the existing SPEC-017 (auto-spin) and SPEC-018 (winning-line highlight) backlog items

### Build-phase reflection (3 questions, short answers)

1. **What was unclear in the spec that slowed you down?**
   — The prior `status` type was `'idle' | 'resolved'`, but the spec listed AC for `'spinning'` without explicitly resolving how `'resolved'` fits in. The "Notes for the Implementer" mentioned `setStatus('idle')` on reveal, but keeping `'resolved'` better matches STAGE-003's stated state machine. A one-liner in the spec like "status transitions: idle → spinning → resolved → idle (same as before; 'spinning' is the new addition)" would have made this zero-friction.

2. **Was there a constraint or decision that should have been listed but wasn't?**
   — No missing constraints — `respect-reduced-motion`, `perf-60fps`, `DEC-004`, and `DEC-001` all applied cleanly. The `perf-60fps` advisory is referenced in DEC-004 but not listed in the spec's `references.constraints`; it's worth adding there so a verifier knows to check transform-only animation.

3. **If you did this task again, what would you do differently?**
   — Read the existing test file more carefully before writing the new tests — I had to reconcile the updated `beforeEach`/`afterEach` fake-timer setup with the pre-existing tests in one pass. A two-step approach (add fake timers + advance calls to existing tests first, then add new SPEC-016 tests) would make the diff easier to review.

---

## Reflection (Ship)

*Appended during the **ship** cycle.*

1. **What would I do differently next time?**
   — <answer>

2. **Does any template, constraint, or decision need updating?**
   — <answer>

3. **Is there a follow-up spec I should write now before I forget?**
   — <answer>
