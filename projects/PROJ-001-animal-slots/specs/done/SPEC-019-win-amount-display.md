---
# Maps to ContextCore task.* semantic conventions.

task:
  id: SPEC-019
  type: story
  cycle: ship
  blocked: false
  priority: high
  complexity: M

project:
  id: PROJ-001
  stage: STAGE-004
repo:
  id: animal-slots

agents:
  architect: claude-opus-4-8
  implementer: claude-sonnet-4-6
  created_at: 2026-06-26

references:
  decisions:
    - DEC-001
    - DEC-004
    - DEC-010
  constraints:
    - portrait-first
    - respect-reduced-motion
    - test-before-implementation
    - one-spec-per-pr
  related_specs:
    - SPEC-013
    - SPEC-016
    - SPEC-018

value_link: "Shows the player how much they won — a pop-up badge over the reels plus a persistent last-win readout, both from the engine's totalWin. First STAGE-004 spec."

cost:
  sessions:
    - cycle: design
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      duration_minutes: 25
      recorded_at: 2026-06-26
      notes: "main-loop, not separately metered (AGENTS §4); design cycle"
    - cycle: build
      agent: claude-sonnet-4-6
      interface: claude-code
      tokens_total: 86139
      estimated_usd: 0.57
      duration_minutes: 4.4
      recorded_at: 2026-06-26
      notes: "Sonnet sub-agent build (Agent subagent_tokens=86139, 264s). estimated_usd ~= tokens x $6.6/M Sonnet blended, no cache discount (order-of-magnitude, AGENTS §4)."
    - cycle: verify
      agent: claude-sonnet-4-6
      interface: claude-code
      tokens_total: 74935
      estimated_usd: 0.49
      duration_minutes: 4.0
      recorded_at: 2026-06-27
      notes: "Sonnet sub-agent verify (Agent subagent_tokens=74935, 241s). estimated_usd ~= tokens x $6.6/M Sonnet blended, no cache discount (order-of-magnitude, AGENTS §4)."
    - cycle: ship
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      duration_minutes: 12
      recorded_at: 2026-06-27
      notes: "main-loop, not separately metered (AGENTS §4); ship cycle (incl. preview win-badge check via eval)"
  totals:
    tokens_total: 161074
    estimated_usd: 1.06
    session_count: 4
---

# SPEC-019: Win-amount display

## Context

The first STAGE-004 spec, and the most basic win feedback: today a win just makes
the balance jump with no "you won X" signal. This surfaces the engine's already-
returned `totalWin` two ways (the player chose both): a **pop-up badge** over the
reels on a win (animated in, cleared on the next spin) and a **persistent last-win
readout** in the status bar. Pure presentation of an existing engine output — no
engine change, no new game math (DEC-001).

See `STAGE-004-win-celebration-and-juice.md`, `DEC-004` (CSS transform/keyframe
animation; reduced-motion path), `DEC-010` (token CSS), and SPEC-011's `SpinResult.
totalWin` surfaced through SPEC-013's `useSlotMachine` / SPEC-016's `spinning`.

## Goal

Expose `lastWin` from `useSlotMachine` (the resolved spin's `totalWin`; 0 on a loss;
reset to 0 by `reset()`), render a **WIN** readout in the Status region, and show a
**win badge** over the reels when there's a fresh win (resolved, not spinning),
animated per DEC-004 with a reduced-motion fallback.

## Inputs

- **Files to read:** `src/ui/useSlotMachine.ts` (+ test), `src/ui/regions/Status.tsx`,
  `src/ui/regions/Game.tsx`, `src/ui/reels/ReelGrid.tsx` + `reels.css`,
  `src/ui/App.tsx`, `src/styles/tokens.css`, `src/engine/index.ts` (`SpinResult.totalWin`).
- **Related code paths:** `src/ui/`.

## Outputs

- **Files created:**
  - `src/ui/reels/WinBadge.tsx` — the pop-up win badge (over the reels).
  - `src/ui/reels/WinBadge.test.tsx` — its tests.
- **Files modified:**
  - `src/ui/useSlotMachine.ts` — add `lastWin: number` to the result (set to the
    resolved spin's `totalWin`; 0 on a losing spin; `reset()` sets it to 0).
  - `src/ui/regions/Status.tsx` — add a **WIN** readout showing `lastWin`.
  - `src/ui/regions/Game.tsx` — render `<WinBadge amount={lastWin} show={...} />`
    overlaid on the reel grid.
  - `src/ui/App.tsx` — thread `lastWin` (and the show condition) into `Status`/`Game`.
  - `src/ui/reels/reels.css` (or a small `win-badge.css`) — the badge styling +
    pop-in keyframe + `prefers-reduced-motion` fallback; tokens only, no raw hex.
  - `src/ui/useSlotMachine.test.tsx`, `src/ui/regions/Status.test.tsx` — extend.
- **New exports:** `lastWin` on `UseSlotMachineResult`; `WinBadge`.
- **Database changes:** none.

## Acceptance Criteria

- [ ] `useSlotMachine` exposes `lastWin` = the last resolved spin's `totalWin`
      (e.g. seed 276 → 55, seed 12345 → 0); starts at 0; `reset()` sets it to 0.
- [ ] The Status region shows a **WIN** readout reflecting `lastWin` (alongside
      Balance / Bet).
- [ ] `WinBadge` renders the amount (e.g. "WIN +55" or "+55") **only** when there is
      a fresh win to show — `amount > 0` and not spinning — and renders nothing
      otherwise (no win, or mid-spin).
- [ ] The badge overlays the reels without shifting the grid layout; it animates in
      via a CSS keyframe (DEC-004) and has a `prefers-reduced-motion: reduce` path
      that shows it without motion; no raw hex.
- [ ] Engine unchanged; UI consumes `totalWin` only via `src/engine`; gate
      (`typecheck`/`lint`/`test`/`build`) exits 0.

## Failing Tests

Written during **design**, BEFORE build. Hook flow uses fake timers (advance by
`SPIN_DURATION_MS` to resolve), as established in SPEC-016.

- **`src/ui/useSlotMachine.test.tsx`** (extended)
  - `"lastWin starts at 0"` — initial `lastWin === 0`.
  - `"lastWin reflects a winning spin"` — `nextSeed: () => 276`; `act(spin)` then
    advance `SPIN_DURATION_MS` → `lastWin === 55`.
  - `"lastWin is 0 after a losing spin"` — `nextSeed: () => 12345`; spin + advance →
    `lastWin === 0`.
  - `"reset clears lastWin"` — after a winning spin (`lastWin === 55`), `act(reset)`
    → `lastWin === 0`.

- **`src/ui/reels/WinBadge.test.tsx`**
  - `"shows the amount on a win"` — `<WinBadge amount={55} show />` renders text
    containing `55` (e.g. "WIN +55").
  - `"renders nothing when there is no win"` — `<WinBadge amount={0} show />` and
    `<WinBadge amount={55} show={false} />` each render no badge (null / empty).

- **`src/ui/regions/Status.test.tsx`** (extended)
  - `"shows the last win amount"` — `<Status balance={1045} bet={10} lastWin={55} />`
    renders a WIN readout containing `55`.

## Implementation Context

### Decisions that apply

- `DEC-001` — `lastWin` is the engine's `SpinResult.totalWin`; the UI displays it,
  computes nothing. No engine change.
- `DEC-004` — the badge pop-in is a CSS keyframe (transform/opacity); reduced-motion
  shows it statically.
- `DEC-010` — token-based CSS, prefixed classes (`.win-badge`), no raw hex.

### Constraints that apply

- `respect-reduced-motion` — the badge has a non-animated path.
- `portrait-first`, `test-before-implementation`, `one-spec-per-pr`.

### Prior related work

- `SPEC-013` (shipped) — `useSlotMachine` resolves a `SpinResult`; `lineWins`/`tier`
  already surfaced. `SPEC-016` (shipped) — `spinning`/`status` (use to gate the badge).
  `SPEC-018` (shipped) — the winning-cell highlight the badge appears alongside.

### Out of scope (for this spec specifically)

- The **balance count-up** animation (a separate STAGE-004 backlog spec) — this
  shows the win *amount*, not an animated balance tick.
- Tier-scaled badge color/intensity, particles, the jackpot moment, paw-print
  trail, and audio — later STAGE-004 specs.
- The paytable sheet — SPEC-020.

## Notes for the Implementer

- Hook: add `const [lastWin, setLastWin] = useState(0)`. In the spin-resolve
  callback set `setLastWin(outcome.totalWin)` (alongside the existing grid/balance/
  lineWins/tier updates). In `reset()` add `setLastWin(0)`. Return `lastWin`.
- Status: a third `.status-readout__item` "WIN" / `{lastWin}` (Status takes a new
  `lastWin: number` prop). Keep the existing Balance/Bet items.
- WinBadge: `function WinBadge({ amount, show }: { amount: number; show: boolean })`;
  return `null` unless `show && amount > 0`; otherwise a positioned overlay element
  (e.g. `<div className="win-badge" role="status">WIN +{amount}</div>`). It must not
  push the grid (absolute-positioned over the Game region or the reel-grid wrapper).
- Game: render `<WinBadge amount={lastWin} show={!spinning} />` inside the
  `.cabinet__game` (position it over the grid). App passes `lastWin` + `spinning`.
- The "show" condition is `!spinning` (the component itself also guards `amount > 0`),
  so the badge clears during the next spin and reappears only on the next win.
- CSS: `.win-badge` — absolute/overlay, token colors (e.g. `--color-coin` /
  `--color-win-big`), a pop-in `@keyframes` (scale/opacity); a
  `@media (prefers-reduced-motion: reduce)` block that drops the animation. No raw hex,
  no layout shift.
- After building, the orchestrator previews: spin to a win → "WIN +N" pops over the
  reels and the status WIN readout updates; next spin clears the badge.

---

## Build Completion

*Filled in at the end of the **build** cycle, before advancing to verify.*

- **Branch:** `feat/spec-019-win-amount`
- **PR (if applicable):** (orchestrator to open)
- **All acceptance criteria met?** yes
- **New decisions emitted:**
  - none — all decisions (DEC-001/004/010) already covered the approach
- **Deviations from spec:**
  - Added `position: relative` to `.cabinet__game` in `regions.css` (required as
    the containing block for `WinBadge`'s `position: absolute`). Not called out
    in the spec but directly implied by "absolutely positioned over the grid."
- **Follow-up work identified:**
  - None new; SPEC-020 (paytable sheet) is already on the backlog.

### Build-phase reflection (3 questions, short answers)

1. **What was unclear in the spec that slowed you down?**
   — The spec said "absolutely positioned over the Game region or the reel-grid
   wrapper" but did not mention that `.cabinet__game` lacked `position: relative`.
   A one-line note ("ensure the parent has `position: relative`") would remove a
   small guessing step.

2. **Was there a constraint or decision that should have been listed but wasn't?**
   — Nothing was missing; DEC-004 and DEC-010 were sufficient. The reduced-motion
   path is covered by a `@media (prefers-reduced-motion: reduce)` block that drops
   the animation and restores the final `transform`, which aligns with DEC-004's
   guidance.

3. **If you did this task again, what would you do differently?**
   — Read the existing CSS for `.cabinet__game` first (before touching Game.tsx) to
   spot the missing `position: relative` earlier rather than discovering it mid-edit.

---

## Verify

Verified 2026-06-27 by claude-sonnet-4-6 (cold session, PR #19).

**Verdict: ✅ APPROVED**

Gate: `typecheck` ✅ · `lint` ✅ · `test` ✅ (133/133) · `build` ✅

- **ACCEPTANCE CRITERIA** — All five checkboxes confirmed met. `lastWin` exposed on `UseSlotMachineResult`; Status WIN readout present; WinBadge guards `show && amount > 0`; CSS keyframe with `@media (prefers-reduced-motion: reduce)` fallback; engine directory diff against main is empty; gate exits 0.
- **LASTWIN CORRECTNESS** — `useState(0)` initializes to 0. Reveal callback sets `setLastWin(outcome.totalWin)` at the same time as grid/balance. `reset()` calls `setLastWin(0)`. All four hook tests use fake timers and advance `SPIN_DURATION_MS` before asserting — genuinely exercise the post-reveal path. seed 276 → `lastWin === 55` ✅; seed 12345 → `lastWin === 0` ✅; reset after win → `lastWin === 0` ✅.
- **WINBADGE** — Guard is `if (!show || amount <= 0) return null`. Both null cases covered by separate tests: `amount=0 show=true` → null; `amount=55 show=false` → null. `Game.tsx` passes `show={!spinning}` so badge is absent during spin and clears for the next spin. ✅
- **STYLING** — win-badge.css: zero raw hex literals (grep confirms). `@keyframes win-badge-pop-in` animates `transform` (scale) and `opacity` consistent with DEC-004. `@media (prefers-reduced-motion: reduce)` block sets `animation: none` and restores the final composed `transform: translate(-50%, -50%) scale(1)` so position is not lost. Badge is `position: absolute` inside `.cabinet__game { position: relative }` — no layout shift. The `position: relative` addition to `.cabinet__game` in `regions.css` is the correct containing block for the absolute overlay and does not affect the existing `flex: 1 / align-items: center` layout (position: relative is compatible with flexbox). ✅
- **DEC-001** — `git diff main..HEAD -- src/engine/` is empty. `lastWin` is `outcome.totalWin` directly — no UI-side computation. ✅
- **TESTS NOT VACUOUS** — The `lastWin` tests would catch `lastWin` not updating (assert `=== 55`). WinBadge tests directly assert null for the loss and mid-spin cases; they would catch the badge rendering when it shouldn't. The Status test asserts the exact value `55` appears in the render. Tests are substantive, not vacuous. ✅
- **DECISION DRIFT** — `just decisions-audit --changed` reports "no changed files in scope" (all changes are committed). `just decisions-audit` shows 14 pre-existing scope warnings unchanged from main — none introduced by this spec. No non-trivial build choices needing a new DEC. ✅
- **BUILD REFLECTION** — Honest and specific: identifies the missing `position: relative` note in the spec as a concrete friction point, confirms DEC-004/DEC-010 were sufficient, proposes a concrete "read parent CSS first" process improvement. ✅
- **COST** — Build session has `tokens_total: null` with "orchestrator to fill" note — correct per AGENTS.md §4. Verify session appended (also null-with-note, to be filled by orchestrator at ship). ✅

---

## Reflection (Ship)

*Appended during the **ship** cycle.*

1. **What would I do differently next time?**
   — Nothing material. Surfacing the engine's existing `totalWin` (rather than
   re-summing `lineWins` in the UI) kept the DEC-001 boundary clean, and gating the
   badge on `!spinning && amount>0` made it self-clearing. The preview confirmed it
   live ("WIN +5" pop + the status WIN readout), which the unit tests can't show.

2. **Does any template, constraint, or decision need updating?**
   — No. One tiny spec-writing note for future overlay specs: call out that the
   parent needs a `position: relative` containing block (the builder had to add it
   to `.cabinet__game`) — a one-line heads-up, not a template change.

3. **Is there a follow-up spec I should write now before I forget?**
   — No new spec. SPEC-020 (paytable sheet) is next (the other requested item), then
   this slice pauses for review. The richer celebration specs (count-up, particles,
   jackpot moment, jingle) remain in the STAGE-004 backlog.
