---
# Maps to ContextCore task.* semantic conventions.

task:
  id: SPEC-023
  type: story
  cycle: verify
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
  created_at: 2026-06-27

references:
  decisions:
    - DEC-001
    - DEC-004
    - DEC-006
    - DEC-010
  constraints:
    - respect-reduced-motion
    - perf-60fps
    - portrait-first
    - test-before-implementation
    - one-spec-per-pr
  related_specs:
    - SPEC-018
    - SPEC-021

value_link: "Traces each winning line with paw prints that pop across the reels left→right, making *what paid* legible and felt — a CSS celebration keyed off SPEC-021's one-shot signal."

cost:
  sessions:
    - cycle: design
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      duration_minutes: 30
      recorded_at: 2026-06-27
      notes: "main-loop, not separately metered (AGENTS §4); design cycle"
    - cycle: build
      agent: claude-sonnet-4-6
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      duration_minutes: null
      recorded_at: 2026-06-27
      notes: "orchestrator to fill tokens_total from subagent_tokens at ship"
  totals:
    tokens_total: 0
    estimated_usd: 0
    session_count: 0
---

# SPEC-023: Payline paw-print trail

## Context

The third celebration and the second CSS consumer of SPEC-021's `celebration`
signal. SPEC-018 already gives winning cells a static gold glow; this spec adds a
**paw-print trail** — a 🐾 that pops onto each winning cell, staggered reel 0 → reel
N, so the win reads as paws tracing the line that paid. Multiple winning lines
each get their cells traced (the existing `winningCellKeys` already unions all
lines' covered cells). The trace replays once per win by keying the paw element on
`celebration.id` (SPEC-021), so two identical back-to-back wins still re-animate.

It's a CSS celebration (transform/opacity keyframe with a per-reel `animation-delay`
stagger, DEC-004) with a `prefers-reduced-motion` path that shows the paws
statically (no motion). Emoji art per DEC-006; token-only CSS, no raw hex
(DEC-010). Pure presentation of engine-derived data (`lineWins` + `PAYLINES`); no
engine change, no game math (DEC-001) — and nothing fires that didn't actually
land (the paws only mark cells that are part of a real winning line).

See `STAGE-004-win-celebration-and-juice.md`, `DEC-004`, `DEC-006`, `DEC-010`,
SPEC-018 (`winningCellKeys`, the glow it sits beside), and SPEC-021 (`celebration`).

## Goal

Render a paw-print (🐾) marker over each winning cell when a win is resolved
(not spinning), animated to pop in staggered left→right per reel and keyed on
`celebration.id` so it replays each win; show the paws statically under
`prefers-reduced-motion`; render nothing when there is no win, while spinning, or
when there is no celebration.

## Inputs

- **Files to read:** `src/ui/reels/ReelGrid.tsx` (+ `ReelGrid.test.tsx`) — the
  grid + `winningCellKeys` usage; `src/ui/reels/reels.css` (cell styles +
  reduced-motion block); `src/ui/reels/winningCells.ts`; `src/ui/regions/Game.tsx`
  (+ `Game.test.tsx`); `src/ui/App.tsx`; `src/ui/useSlotMachine.ts` (`Celebration`);
  `src/ui/reels/reels.animation.test.ts` (CSS-contract pattern).
- **Related code paths:** `src/ui/reels/`, `src/ui/regions/`.

## Outputs

- **Files created:** none (paw markup lives in `ReelGrid`; paw CSS lives in
  `reels.css` alongside the cell/highlight styles it overlays).
- **Files modified:**
  - `src/ui/reels/ReelGrid.tsx` — accept an optional `trailKey?: number | null`;
    render a `.reel__paw` (🐾, `aria-hidden`) inside each winning cell when
    `trailKey != null` (and, as already, only when not spinning). Key the paw on
    `trailKey` so a new win remounts it and replays the animation.
  - `src/ui/reels/reels.css` — `.reel__cell { position: relative }` (containing
    block); `.reel__paw` overlay; a `@keyframes paw-trail-pop` (scale/opacity);
    per-reel stagger via the inherited `--reel-index`; add `.reel__paw { animation:
    none }` to the existing `@media (prefers-reduced-motion: reduce)` block. Tokens
    only, no raw hex.
  - `src/ui/regions/Game.tsx` — accept an optional `celebration` prop and pass
    `trailKey={celebration?.id ?? null}` to `ReelGrid`.
  - `src/ui/App.tsx` — pass `celebration={celebration}` to `Game`.
  - `src/ui/reels/ReelGrid.test.tsx`, `src/ui/regions/Game.test.tsx`,
    `src/ui/reels/reels.animation.test.ts` — extend (below).
- **New exports:** none (new optional props only).
- **Database changes:** none.

## Acceptance Criteria

- [ ] When resolved (not spinning) with `trailKey != null` and a winning line, a
      `.reel__paw` 🐾 marker renders on **each** winning cell — exactly as many
      paws as winning cells (e.g. an L1 count-3 win → 3 paws).
- [ ] No paw markers when there is no win (`lineWins` empty), while spinning, or
      when `trailKey` is null.
- [ ] The paw pops in via a CSS `@keyframes` (transform/opacity) staggered per
      reel using `--reel-index` (DEC-004); the paw is `aria-hidden` and
      `pointer-events: none` (decorative; does not change the cell's a11y or
      layout).
- [ ] A `@media (prefers-reduced-motion: reduce)` path shows the paws without
      animation; `reels.css` has no raw hex (CSS-contract test).
- [ ] The trail replays each win — the paw is keyed on `trailKey` (= the
      `celebration.id`) so a new win remounts it.
- [ ] Engine unchanged; UI consumes only `lineWins`/`PAYLINES`/`celebration`;
      existing ReelGrid/Game tests still pass; gate exits 0.

## Failing Tests

Written during **design**, BEFORE build. Reuse the `TEST_GRID` + `L1_WIN_3`
fixtures already in `ReelGrid.test.tsx`. Query paws via
`container.querySelectorAll('.reel__paw')`.

- **`src/ui/reels/ReelGrid.test.tsx`** (extended)
  - `"renders a paw on each winning cell when a trail is active"` —
    `<ReelGrid grid={TEST_GRID} lineWins={[L1_WIN_3]} spinning={false} trailKey={1} />`
    → `.reel__paw` count `=== 3` (L1 count-3 covers reels 0/1/2 at row 1).
  - `"renders no paws when there is no win"` — `lineWins={[]} trailKey={1}` →
    `.reel__paw` count `=== 0`.
  - `"renders no paws while spinning"` — `lineWins={[L1_WIN_3]} spinning trailKey={1}`
    → `.reel__paw` count `=== 0`.
  - `"renders no paws when trailKey is null"` — `lineWins={[L1_WIN_3]} trailKey={null}`
    → `.reel__paw` count `=== 0`.
  - `"paws are decorative (aria-hidden) and do not change the symbol count"` —
    with the trail active, `getAllByRole('img')` is still `15` and every
    `.reel__paw` has `aria-hidden="true"`.

- **`src/ui/regions/Game.test.tsx`** (extended)
  - `"threads the celebration into a paw trail on a win"` — render `<Game
    grid={TEST_GRID} lineWins={[L1_WIN_3]} spinning={false} celebration={{ id: 1,
    tier: 'small', totalWin: 10, lineWins: [L1_WIN_3] }} />` → `.reel__paw` count
    `=== 3`. Without a `celebration` prop → `0`.

- **`src/ui/reels/reels.animation.test.ts`** (extended)
  - `"defines the paw-trail keyframe and class"` — `reels.css` matches
    `/@keyframes\s+paw-trail-pop/` and `/\.reel__paw/`, and the paw keyframe uses
    `transform`.
  - (The existing reduced-motion + no-raw-hex assertions already cover the paw CSS.)

## Implementation Context

### Decisions that apply

- `DEC-004` — paw pop-in is a CSS transform/opacity keyframe; reduced motion shows
  it statically. The per-reel stagger reuses the `--reel-index` custom property the
  reel already sets (custom properties inherit, so the paw inside a reel reads it).
- `DEC-006` — the paw is the 🐾 emoji (placeholder art, consistent with the symbol
  set).
- `DEC-010` — paw CSS is token-only, prefixed `.reel__paw`, no raw hex; lives in
  `reels.css` with the other cell styles.
- `DEC-001` — paws mark only cells from real `lineWins` (via `winningCellKeys`);
  no engine change, no UI game math; nothing fires that didn't land.

### Constraints that apply

- `respect-reduced-motion` — static paws under reduced motion (no keyframe).
- `perf-60fps` — transform/opacity only (GPU-composited), a handful of elements.
- `portrait-first`, `test-before-implementation`, `one-spec-per-pr`.

### Prior related work

- `SPEC-018` (shipped) — `winningCellKeys(lineWins)` → the `reel:row` set; the
  gold-glow `.reel__cell--win` the paws sit on. ReelGrid already suppresses wins
  while spinning (so paws are absent mid-spin for free).
- `SPEC-021` (shipped) — `celebration.id`; the paw's replay key. Second CSS
  consumer of the signal (after SPEC-022's count-up).

### Out of scope (for this spec specifically)

- Particles, the jackpot moment, the jingle, the win badge (other STAGE-004
  specs). Tier-scaling the paw (size/speed by win tier) — the trail is uniform.
- Connecting paws with a drawn line/SVG path — v1 is per-cell paw markers, not a
  vector path. (A future polish spec could add a connecting stroke.)

## Notes for the Implementer

- ReelGrid: add `trailKey?: number | null` to `Props` (default `undefined`).
  Inside the cell render, when `isWin && trailKey != null`, render an extra child
  in the cell span:
  ```tsx
  {isWin && trailKey != null && (
    <span className="reel__paw" aria-hidden="true" key={`paw-${trailKey}`}>🐾</span>
  )}
  ```
  `isWin` is already false while spinning (winKeys is the stable EMPTY set then),
  so paws are absent mid-spin without extra gating. The cell `<span>` keeps its
  `role="img"`/`aria-label`; the paw is a decorative child (`aria-hidden`).
- reels.css (add near the cell/highlight styles):
  ```css
  .reel__cell { position: relative; }        /* containing block for the paw */

  .reel__paw {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--font-size-xl);
    opacity: 0.85;                /* final/visible state (also the reduced-motion state) */
    pointer-events: none;
    z-index: 5;
    animation: paw-trail-pop 0.3s ease-out calc(var(--reel-index, 0) * 0.12s) both;
  }

  @keyframes paw-trail-pop {
    0%   { transform: scale(0.3);  opacity: 0;    }
    60%  { transform: scale(1.15); opacity: 0.9;  }
    100% { transform: scale(1);    opacity: 0.85; }
  }
  ```
  Then add to the EXISTING `@media (prefers-reduced-motion: reduce)` block:
  ```css
  .reel__paw { animation: none; }   /* static paw (opacity 0.85, scale 1) */
  ```
  `both` fill keeps the paw hidden (0% state) until its staggered turn; under
  reduced motion `animation: none` falls back to the base `.reel__paw` (visible,
  scale 1) — the required non-animated path.
- Game: add `celebration?: Celebration | null` to `Props` (import the type from
  `../useSlotMachine`); pass `trailKey={celebration?.id ?? null}` to `<ReelGrid>`.
  Keep the existing `<WinBadge … />`.
- App: add `celebration={celebration}` to `<Game …>` (it already destructures
  `celebration` from `useSlotMachine()` for Status).
- No new DEC — this is squarely DEC-004/006/010 territory.
- After build, the orchestrator previews: spin to a win → paws pop across the
  winning cells left→right, clear on the next spin; verify the symbol stays
  readable and tune paw opacity/size in preview if it obscures the glyph.

---

## Build Completion

*Filled in at the end of the **build** cycle, before advancing to verify.*

- **Branch:** feat/spec-023-paw-trail
- **PR (if applicable):** none (local only per spec instructions)
- **All acceptance criteria met?** yes
- **New decisions emitted:**
  - none (covered by DEC-004/006/010 as expected)
- **Deviations from spec:**
  - none; drop-in markup and CSS matched spec verbatim
- **Follow-up work identified:**
  - none at this time; tier-scaling paw size/speed is explicitly out of scope

### Build-phase reflection (3 questions, short answers)

1. **What was unclear in the spec that slowed you down?**
   — Nothing slowed me down; the "Notes for the Implementer" section provided complete drop-in code for every file. The spec was exceptionally clear about where the `key` prop on the inner `<span>` should be placed relative to JSX (child span, not the outer cell key).

2. **Was there a constraint or decision that should have been listed but wasn't?**
   — No missing constraints. The `position: relative` addition to `.reel__cell` could theoretically affect existing glow-shadow rendering in SPEC-018, but in practice `box-shadow` is unaffected by stacking context changes here, so it's a non-issue. Worth noting but not worth a new decision.

3. **If you did this task again, what would you do differently?**
   — Nothing material. The spec's "both" fill mode explanation (keeps paw hidden at 0% until its staggered delay fires) was important context; I'd highlight that sentence when briefing the next implementer since it's easy to omit and hard to debug visually.

---

## Reflection (Ship)

*Appended during the **ship** cycle.*

1. **What would I do differently next time?**
   — <answer>

2. **Does any template, constraint, or decision need updating?**
   — <answer>

3. **Is there a follow-up spec I should write now before I forget?**
   — <answer>
