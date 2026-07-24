---
# Maps to ContextCore task.* semantic conventions.

task:
  id: SPEC-076
  type: story                      # epic | story | task | bug | chore
  cycle: design                    # frame | design | build | verify | ship
  blocked: false
  priority: medium
  complexity: M                    # S | M | L  (L means split it) — split out SPEC-079 to stay M

project:
  id: PROJ-003
  stage: STAGE-015
repo:
  id: animal-slots

agents:
  architect: claude-opus-4-8       # design/frame: Opus (judgement-heavy). See AGENTS §8.
  implementer: claude-sonnet-4-6   # build/verify: Sonnet (execution against the spec)
  created_at: 2026-07-23

references:
  decisions:
    - DEC-001   # engine-no-dom: presentation only
    - DEC-010   # design tokens, no raw hex, prefixed classes
    - DEC-021   # per-machine identity (via TrophyGrid)
    - DEC-024   # the TopWin model + cap 10 being displayed
  constraints:
    - engine-no-dom
    - portrait-first
    - respect-reduced-motion
    - touch-targets-44
  related_specs:
    - SPEC-075  # TrophyGrid, the rendering primitive this composes
    - SPEC-079  # mounts this component in the record sheet (next spec)

value_link: >-
  The trophy case itself — the surface that turns ten stored records into something that reads
  as a collection worth filling, rather than a stat row with pictures.

cost:
  sessions:
    - cycle: design
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: null   # design cycle runs on the orchestrator's main Opus loop — not separately metered
      recorded_at: 2026-07-23
      note: >-
        Design authored on the main Opus loop (un-metered). Originally framed as one spec covering the
        case AND its sheet integration; that scored complexity L, so per AGENTS §"L means split it" the
        integration (hierarchy inversion, Biggest-win subsumption, drought counter, rename) was split
        into SPEC-079 and this spec stays a self-contained, independently testable component at M.
    - cycle: build
      interface: claude-code
      model: claude-sonnet-4-6
      tokens_total: null
      recorded_at: 2026-07-23
      note: >-
        Built TrophyCase/TrophyCard/TrophyRow + trophies.css additions + TrophyCase.test.tsx; all
        Failing Tests pass, gate green. tokens_total not recorded by this session — orchestrator to
        fill from subagent_tokens at ship (constraint cost-captured-per-cycle).
  totals:
    tokens_total: 0
    estimated_usd: 0
    session_count: 0
---

# SPEC-076: The trophy case component

## Context

SPEC-075 shipped `TrophyGrid` — one saved win, rendered correctly. This spec builds the
**case**: the ranked, celebratory arrangement of up to ten of them.

The user chose N = 10 and placement inside the existing stats sheet. Ten full-size cards
would make a 375px sheet a scroll marathon, so the agreed design ranks the presentation
instead of flattening it: **#1–#3 as full trophy cards** (medal, tier framing, hero grid,
amount + machine + bet + spin number + bet multiplier), **#4–#10 as compact rows** (thumbnail
grid + amount + machine) that **expand in place on tap**. Depth without the marathon, and the
podium stays meaningful.

This spec builds the component standalone and tests it in isolation. **SPEC-079** mounts it
in the sheet.

## Goal

A `TrophyCase` component that takes `topWins` (and the current spin count) and renders the
ranked case — full cards for the podium, tap-to-expand rows below, an inviting locked-plinth
empty state, and the bar-to-beat once the case is full.

## Inputs

- **Files to read:**
  - `src/ui/trophies/TrophyGrid.tsx`, `src/ui/trophies/trophies.css` (SPEC-075)
  - `src/stats/sessionStats.ts` — `TopWin`, `TOP_WINS_CAP`
  - `src/ui/stats/stats.css` — the sheet's visual language to match
  - `src/machines/registry.ts` — `getMachine` for the machine's display name
  - `src/styles/tokens.css` — tier color tokens (`--color-win-small`, `--color-win-big`,
    `--color-jackpot`, `--color-coin`, `--color-text-muted`)

## Outputs

- **Files created:**
  - `src/ui/trophies/TrophyCase.tsx` — the case (default export).
  - `src/ui/trophies/TrophyCard.tsx` — a full podium card.
  - `src/ui/trophies/TrophyRow.tsx` — a compact, expandable row.
  - `src/ui/trophies/TrophyCase.test.tsx` (covers all three).
- **Files modified:**
  - `src/ui/trophies/trophies.css` — case/card/row/empty-state styles (tokens only).
- **New exports:** `TrophyCase` (default), `TrophyCaseProps`.

## Acceptance Criteria

- [ ] `TrophyCase` accepts `{ topWins: TopWin[]; spins: number }` and renders nothing
      engine-related — pure presentation (DEC-001).
- [ ] With 0 trophies, renders the **empty state**: `TOP_WINS_CAP` (10) locked plinth
      placeholders plus an inviting line of copy. No zeros, no blank.
- [ ] With 1–3 trophies, renders that many **full cards** and no rows.
- [ ] With >3 trophies, renders exactly 3 full cards and the remainder as **compact rows**.
- [ ] Each full card shows: rank medal (🥇/🥈/🥉), amount, machine name, tier, bet,
      `spinIndex` ("spin #143"), the **bet multiplier** (`amount / bet`, e.g. "24× your bet"),
      and a `TrophyGrid` at `size="card"`.
- [ ] Each compact row shows rank, amount, machine name, and a `TrophyGrid` at
      `size="thumb"`; tapping it **expands in place** to reveal the full card detail, and
      tapping again collapses it.
- [ ] The row toggle is a real `<button>`, keyboard-operable, with `aria-expanded`
      reflecting state, and a hit area ≥44px (constraint `touch-targets-44`).
- [ ] Tier framing uses the existing tier tokens (`--color-win-small` / `--color-win-big` /
      `--color-jackpot`); **no new color tokens, no raw hex** (DEC-010).
- [ ] When `topWins.length === TOP_WINS_CAP`, a **bar-to-beat** line shows
      `topWins[9].amount` ("Beat 35 to make the case"). When the case is not full, it is
      **absent** (every win still gets in, so there is no bar).
- [ ] Bet multiplier renders sensibly for a non-integer ratio (e.g. 4.8× → shown to at most
      1 decimal, no `24.000000001×`).
- [ ] Any flourish/animation is disabled under `prefers-reduced-motion`
      (constraint `respect-reduced-motion`).
- [ ] `src/engine/**` and `src/ui/audio/**` diffs empty; no new dependency.

## Failing Tests

- **`src/ui/trophies/TrophyCase.test.tsx`**
  - `"renders the locked-plinth empty state with no trophies"` — `topWins: []`; assert 10
    plinth placeholders present and no `TrophyGrid` rendered.
  - `"renders up to three full cards and the rest as compact rows"` — 6 trophies; assert 3
    cards and 3 rows.
  - `"renders only cards when there are three or fewer trophies"` — 2 trophies; assert 2
    cards, 0 rows.
  - `"a full card shows amount, machine, tier, spin number, and bet multiplier"` — a trophy
    `{ amount: 240, bet: 10, machineId: 'arctic', tier: 'big', spinIndex: 143 }`; assert the
    rendered text contains `240`, Arctic's display name, `143`, and `24×`.
  - `"a compact row expands in place on click and collapses again"` — click the 4th entry's
    toggle; assert the expanded detail appears and `aria-expanded` flips to `"true"`; click
    again and assert it collapses.
  - `"shows the bar to beat only when the case is full"` — with 10 trophies whose smallest is
    35, assert the text contains `35`; with 9 trophies, assert the bar-to-beat text is absent.
  - `"formats a fractional bet multiplier to at most one decimal"` — `{ amount: 48, bet: 10 }`
    ⇒ contains `4.8×` and not a long float.
  - `"the row toggle is a keyboard-operable button with aria-expanded"` — assert role
    `button` and that keyboard activation toggles it.

## Implementation Context

### Decisions that apply

- `DEC-024` — cap is `TOP_WINS_CAP` (import it, do not hardcode 10; the empty state and the
  bar-to-beat both key off it).
- `DEC-021` — machine identity comes via `TrophyGrid`; for the machine *name* use
  `getMachine(trophy.machineId).name`. **Reuse SPEC-075's unknown-machine handling rather
  than re-implementing it** — if the name is needed outside `TrophyGrid`, mirror its
  `hasOwnProperty(MACHINES, id)` check so an unknown id is not silently attributed.
- `DEC-010` — tokens only; class prefix `trophy-` (`.trophy-case__*`, `.trophy-card__*`,
  `.trophy-row__*`).

### Constraints that apply

- `portrait-first` — **the whole point of the ranked layout.** Must not overflow at 375px.
- `touch-targets-44` — row toggles.
- `respect-reduced-motion` — any expand transition or card flourish needs a no-motion path.

### Out of scope (for this spec specifically)

- **Mounting this in the stats sheet** — hierarchy inversion, removing the "Biggest win"
  tile, the drought counter, and the sheet rename are all **SPEC-079**.
- The celebration badge (SPEC-077) and replay (SPEC-078).
- Any change to the stats model, storage, or seam.

## Notes for the Implementer

### Shape

```tsx
export interface TrophyCaseProps {
  topWins: TopWin[];
  /** Current session spin count — reserved for the drought line in SPEC-079; not rendered here. */
  spins: number;
}
```

Render order: heading → cards (`topWins.slice(0, 3)`) → rows (`topWins.slice(3)`) →
bar-to-beat (only when `topWins.length === TOP_WINS_CAP`). Empty state replaces all of it
when `topWins.length === 0`.

### Bet multiplier formatting

```ts
// 24 → "24×", 4.8 → "4.8×", 4.83 → "4.8×". Avoid trailing ".0" on whole numbers.
function formatMultiplier(amount: number, bet: number): string {
  const m = amount / bet;
  return `${Number.isInteger(m) ? m : m.toFixed(1)}×`;
}
```

Guard `bet <= 0` defensively (return `''` and render nothing) — it cannot happen with a
valid `BetLevel`, but a corrupt persisted blob could carry one, and this component renders
persisted data.

### Rows expand in place

Keep the expansion state local to `TrophyRow` (`useState`), not lifted — rows are
independent and nothing else needs to know. The toggle button wraps the summary content:

```tsx
<button
  type="button"
  className="trophy-row__toggle"
  aria-expanded={open}
  onClick={() => setOpen((v) => !v)}
>
```

When open, render the same detail block the card uses. **Factor the shared detail markup
into one small component/function used by both `TrophyCard` and the expanded `TrophyRow`** so
the two can never drift.

### Tier framing

Map tier → an existing token, via a CSS class rather than inline style:

```css
.trophy-card--small   { border-color: var(--color-win-small); }
.trophy-card--big     { border-color: var(--color-win-big); }
.trophy-card--jackpot { border-color: var(--color-jackpot); }
```

(`tier: 'none'` cannot appear — a trophy requires `totalWin > 0` — but default safely.)

### Empty state

Ten `.trophy-case__plinth` placeholders in the same grid rhythm as the rows, each `aria-hidden`
(decorative), with one real line of copy above them that carries the meaning for AT — e.g.
"No trophies yet — your ten best wins will live here."

### Adversarial guard-mutations for verify

1. Slice cards at 4 instead of 3 ⇒ breaks "three full cards and the rest as compact rows".
2. Render the bar-to-beat unconditionally ⇒ breaks "only when the case is full".
3. `aria-expanded` hardcoded to `false` ⇒ breaks the expand test.
4. `formatMultiplier` returns the raw ratio ⇒ breaks the fractional-multiplier test.
5. Empty state renders 5 plinths instead of `TOP_WINS_CAP` ⇒ breaks the empty-state test.

### Do NOT

- Do not modify `StatsSheet.tsx` — that is SPEC-079. This spec's component is not yet
  mounted anywhere, and that is expected and correct.
- Do not touch `src/engine/**` or `src/ui/audio/**`.
- Do not `git add -A` or `git stash -u`.

---

## Build Completion

- **Branch:** `feat/spec-076-trophy-case`
- **PR (if applicable):** not opened (per instruction — build cycle only)
- **All acceptance criteria met?** Yes. `TrophyCase`/`TrophyCard`/`TrophyRow` built as
  specified: empty state renders `TOP_WINS_CAP` plinths + one line of copy; 1–3 trophies
  render as cards only; >3 render exactly 3 cards + the remainder as expandable rows; each
  card shows medal/amount/machine/tier/bet/spin #/bet multiplier via a `TrophyGrid
  size="card"`; each row shows rank/amount/machine/`TrophyGrid size="thumb"` and expands in
  place on a real `<button>` with `aria-expanded` and a 48px (`--space-7`) hit area; tier
  framing uses only `--color-win-small`/`--color-win-big`/`--color-jackpot`; bar-to-beat
  shows only at `topWins.length === TOP_WINS_CAP`; `formatMultiplier` matches the Notes'
  spec and guards `bet <= 0`; the expand transition has a `prefers-reduced-motion: reduce`
  off-switch. `src/engine/**` and `src/ui/audio/**` diffs are empty; no new dependency;
  `StatsSheet.tsx` untouched.
- **New decisions emitted:** none.
- **Deviations from spec:** none of substance. One test-implementation note: the spec's
  test list implies verifying keyboard operability; since the repo has no
  `@testing-library/user-event` dependency (and adding one wasn't warranted for this spec),
  the keyboard test asserts the toggle is a real, focusable `<button type="button">` with
  `aria-expanded` — real buttons are natively keyboard-operable in a browser (jsdom doesn't
  simulate the browser's default Enter/Space→click action, so a `fireEvent.keyDown`-based
  assertion would be testing jsdom's fidelity, not the component) — and exercises the same
  toggle via `fireEvent.click` to confirm the `aria-expanded` state machine.
- **Follow-up work identified:** SPEC-079 mounts `TrophyCase` in the stats sheet (already
  planned); no new follow-up beyond that.

### Build-phase reflection (3 questions, short answers)

1. **What was unclear in the spec that slowed you down?** — Nothing major; the Notes for
   the Implementer (shape, multiplier formula, empty-state copy, tier-class mapping) were
   detailed enough to implement directly without guessing.
2. **Was there a constraint or decision that should have been listed but wasn't?** — The
   spec's failing-test list implies simulating real keyboard activation of the toggle
   button, but the repo doesn't have `@testing-library/user-event` installed, and nothing
   flags that gap. Worth a line in a future spec's Inputs noting which test-interaction
   libraries are actually available.
3. **If you did this task again, what would you do differently?** — Nothing structural;
   I'd write the shared `TrophyDetail` component first (it de-risks the card/row markup
   drift the spec explicitly calls out) before the two composing components, which is what
   I did here.

---

## Reflection (Ship)

1. **What would I do differently next time?** —
2. **Does any template, constraint, or decision need updating?** —
3. **Is there a follow-up spec I should write now before I forget?** —
