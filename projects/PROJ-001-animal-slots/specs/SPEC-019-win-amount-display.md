---
# Maps to ContextCore task.* semantic conventions.

task:
  id: SPEC-019
  type: story
  cycle: build
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
  totals:
    tokens_total: 0
    estimated_usd: 0
    session_count: 0
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
