---
# Maps to ContextCore task.* semantic conventions.

task:
  id: SPEC-020
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
  created_at: 2026-06-27

references:
  decisions:
    - DEC-001
    - DEC-004
    - DEC-006
    - DEC-010
    - DEC-011
  constraints:
    - portrait-first
    - touch-targets-44
    - respect-reduced-motion
    - test-before-implementation
    - one-spec-per-pr
  related_specs:
    - SPEC-008
    - SPEC-012
    - SPEC-019

value_link: "Tells the player what pays — an on-demand paytable sheet listing each tier's 3/4/5 payouts from the engine's PAYTABLE, so wins are understandable."

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
      tokens_total: 76180
      estimated_usd: 0.50
      duration_minutes: 4.3
      recorded_at: 2026-06-27
      notes: "Sonnet sub-agent build (Agent subagent_tokens=76180, 259s). estimated_usd ~= tokens x $6.6/M Sonnet blended, no cache discount (order-of-magnitude, AGENTS §4)."
    - cycle: verify
      agent: claude-sonnet-4-6
      interface: claude-code
      tokens_total: 72201
      estimated_usd: 0.48
      duration_minutes: 10.4
      recorded_at: 2026-06-27
      notes: "Sonnet sub-agent verify (Agent subagent_tokens=72201, 624s). estimated_usd ~= tokens x $6.6/M Sonnet blended, no cache discount (order-of-magnitude, AGENTS §4)."
    - cycle: ship
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      duration_minutes: 12
      recorded_at: 2026-06-27
      notes: "main-loop, not separately metered (AGENTS §4); ship cycle (incl. preview sheet-open/Esc check via eval)"
  totals:
    tokens_total: 148381
    estimated_usd: 0.98
    session_count: 4
---

# SPEC-020: Paytable sheet

## Context

The second STAGE-004 spec and the player's other requested feature: there's
nothing telling the player *what pays*. This adds a paytable on demand — an
"ℹ Paytable" button (in the header) opens a **slide-up overlay sheet** listing each
symbol tier's 3/4/5-of-a-kind payouts, read straight from the engine's `PAYTABLE`
and `SYMBOL_TIER` (DEC-011 values) with the symbols' emoji (DEC-006). Closable by
✕, backdrop tap, or Esc. Pure presentation of existing engine data — no engine
change, no new game math (DEC-001); the displayed numbers are guaranteed accurate
because they come from the same source the evaluator uses.

See `STAGE-004-win-celebration-and-juice.md`, `DEC-011` (the paytable),
`DEC-006`/`DEC-010`/`DEC-004` (symbols, token CSS, animation), and SPEC-019's
win-amount display this complements.

## Goal

Provide a self-contained `PaytableSheet` (its own "ℹ Paytable" trigger + a slide-up
overlay) that renders, per tier (jackpot → high → mid → low), the tier's symbols'
emoji and its `[3, 4, 5]`-of-a-kind multipliers (× total bet) from the engine's
`PAYTABLE`/`SYMBOL_TIER`; closable by ✕ / backdrop / Esc, with basic dialog a11y.

## Inputs

- **Files to read:** `src/engine/index.ts` (`PAYTABLE`, `SYMBOL_TIER`, `SYMBOLS`,
  `Tier`), `src/ui/reels/symbols.ts` (`SYMBOL_DISPLAY`), `src/ui/regions/Header.tsx`,
  `src/ui/regions/regions.css`, `src/styles/tokens.css`.
- **Related code paths:** `src/ui/`.

## Outputs

- **Files created:**
  - `src/ui/paytable.ts` — `paytableRows()`: pure builder of the display rows from
    the engine data + UI emoji.
  - `src/ui/paytable.test.ts` — its unit tests.
  - `src/ui/PaytableSheet.tsx` — the self-contained trigger + overlay sheet.
  - `src/ui/PaytableSheet.test.tsx` — its tests.
  - `src/ui/paytable.css` — trigger + overlay/sheet styling (slide-up keyframe +
    reduced-motion fallback); tokens only, no raw hex.
- **Files modified:**
  - `src/ui/regions/Header.tsx` — render `<PaytableSheet />` (the trigger sits in the
    header bar).
  - `src/ui/regions/regions.css` — `.cabinet { position: relative }` so the overlay
    scopes to the cabinet (the sheet covers the framed cabinet, not the whole desktop).
- **New exports:** `paytableRows`, `PaytableSheet`.
- **Database changes:** none.

## Acceptance Criteria

- [ ] `paytableRows()` returns one row per tier in descending value order
      (`jackpot`, `high`, `mid`, `low`); each row has the tier's symbols' emoji and
      its `[3,4,5]` multipliers from `PAYTABLE` (e.g. jackpot 🐺 `[8,40,200]`, low
      🦌🦊🐿️ `[0.5,2,5]`). Values come from the engine, not hard-coded in the UI.
- [ ] An accessible **ℹ Paytable** trigger (≥44px) opens the sheet; it is **closed
      by default** (no dialog in the DOM until opened).
- [ ] The open sheet is a dialog (`role="dialog"`, `aria-modal`, an accessible name)
      listing every tier's emoji + 3/4/5 payouts, with a "× total bet" note.
- [ ] The sheet closes via a **✕** button, a **backdrop** click, and the **Esc** key.
- [ ] The overlay/sheet animate in (CSS keyframe, DEC-004) with a
      `prefers-reduced-motion: reduce` fallback; tokens only, no raw hex; the trigger
      and sheet don't shift the game layout when closed.
- [ ] Engine unchanged; UI reads `PAYTABLE`/`SYMBOL_TIER` only via `src/engine`;
      gate (`typecheck`/`lint`/`test`/`build`) exits 0.

## Failing Tests

Written during **design**, BEFORE build. RTL; the slide animation is a preview check.

- **`src/ui/paytable.test.ts`**
  - `"returns the four tiers in descending value order"` — `paytableRows().map(r =>
    r.tier)` equals `['jackpot','high','mid','low']`.
  - `"each tier has its DEC-011 multipliers"` — the `jackpot` row's `multipliers`
    equal `[8,40,200]`; `high` `[3,10,40]`; `mid` `[1,4,12]`; `low` `[0.5,2,5]`.
  - `"each tier lists its symbols' emoji"` — the `jackpot` row's `emoji` includes
    `🐺`; the `low` row includes `🦌`, `🦊`, `🐿️`; the `mid` row includes
    `🐻`, `🦅`, `🦉`; `high` includes `🦬`.
  - `"multipliers come from the engine PAYTABLE"` — for each row, `multipliers`
    deep-equals `PAYTABLE[row.tier]` (no UI-side constants).

- **`src/ui/PaytableSheet.test.tsx`** (RTL + a fake-timer-free interaction; use
  `fireEvent`)
  - `"is closed by default"` — render `<PaytableSheet />`; `queryByRole('dialog')`
    is null; the trigger button (name /paytable/i) is present.
  - `"opens on trigger click and shows tier payouts"` — click the trigger →
    a `dialog` appears containing the jackpot 5-of-a-kind value `200` and the
    low 3-of-a-kind `0.5` (and the 🐺 / 🦌 emoji).
  - `"closes on the ✕ button"` — open, then click the close (name /close/i) →
    `queryByRole('dialog')` is null.
  - `"closes on backdrop click"` — open, click the backdrop element →
    dialog removed.
  - `"closes on Escape"` — open, `fireEvent.keyDown(document, { key: 'Escape' })` →
    dialog removed.

## Implementation Context

### Decisions that apply

- `DEC-011` — the paytable values; the sheet **displays** them from `PAYTABLE`, never
  re-states them (so it can't drift from the evaluator).
- `DEC-006` — the symbols + tiers; emoji come from the UI's `SYMBOL_DISPLAY`.
- `DEC-001` — pure presentation; the UI reads engine exports via `src/engine`; no
  engine change.
- `DEC-010` (token CSS, no raw hex, prefixed classes) and `DEC-004` (CSS
  keyframe + reduced-motion) for the overlay.

### Constraints that apply

- `touch-targets-44` — the trigger and ✕ are ≥44px.
- `respect-reduced-motion` — the slide-up has a non-animated path.
- `portrait-first`, `test-before-implementation`, `one-spec-per-pr`.

### Prior related work

- `SPEC-008` (shipped) — `PAYTABLE` (`Record<Tier, [n3,n4,n5]>`) + tiers.
- `SPEC-012` (shipped) — `SYMBOL_DISPLAY` (UI emoji map). `SPEC-019` (shipped) — the
  win-amount display this sits beside.

### Out of scope (for this spec specifically)

- Showing the payline diagrams/shapes, or per-symbol (vs per-tier) payouts.
- Tier-scaled celebration, particles, jackpot moment, count-up, audio — later
  STAGE-004 specs.
- A full focus-trap / inert-background implementation — basic dialog semantics
  (role, aria-modal, focus the sheet/close on open, Esc) are enough for v1; the
  formal a11y audit is STAGE-005.

## Notes for the Implementer

- `paytable.ts`: `const TIER_ORDER: Tier[] = ['jackpot','high','mid','low'];`
  `paytableRows()` → for each tier, `{ tier, label, emoji: SYMBOLS.filter(s =>
  SYMBOL_TIER[s] === tier).map(s => SYMBOL_DISPLAY[s].emoji), multipliers:
  PAYTABLE[tier] }`. `label` e.g. 'Jackpot' / 'High' / 'Mid' / 'Low'.
- `PaytableSheet.tsx`: own `const [open, setOpen] = useState(false)`. Render the
  trigger `<button aria-label="Paytable">ℹ Paytable</button>` always; when `open`,
  render an overlay: a backdrop `<div className="paytable__backdrop" onClick={close}>`
  and a sheet `<div role="dialog" aria-modal="true" aria-label="Paytable">` with a
  ✕ close button (`aria-label="Close"`), the rows, and a "× total bet" note. Stop
  click propagation on the sheet so inside-clicks don't close. Add an Esc handler
  (a `useEffect` keydown listener while open). Focus the close button on open
  (a ref + `useEffect`).
- Render the multipliers readably, e.g. `8×` / `0.5×`; show each tier's emoji row.
- `paytable.css`: `.paytable__backdrop` (absolute inset 0, dim), `.paytable__sheet`
  (anchored bottom, slide-up `@keyframes` translateY), `@media
  (prefers-reduced-motion: reduce)` drops the animation. Token colors only, no raw hex.
- `.cabinet { position: relative }` (regions.css) so the absolute backdrop/sheet
  cover the cabinet. The trigger lives in the Header; the overlay (rendered from
  PaytableSheet inside Header) is absolute and covers the whole cabinet.
- After building, the orchestrator previews: tap "ℹ Paytable" → the sheet slides up
  with the tiers + payouts; ✕ / backdrop / Esc close it.

---

## Build Completion

*Filled in at the end of the **build** cycle, before advancing to verify.*

- **Branch:** `feat/spec-020-paytable-sheet`
- **PR (if applicable):** (orchestrator to open)
- **All acceptance criteria met?** yes
- **New decisions emitted:**
  - none — all choices were already covered by DEC-001/004/006/010/011
- **Deviations from spec:**
  - None. Spec pseudo-code was followed exactly: TIER_ORDER constant, paytableRows() via SYMBOLS.filter → map, PaytableSheet with own useState/useEffect/ref, backdrop data-testid for test targeting, stopPropagation on sheet.
- **Follow-up work identified:**
  - None new; remaining STAGE-004 specs (win-state router, celebrations, audio) are already in the backlog.

### Build-phase reflection (3 questions, short answers)

1. **What was unclear in the spec that slowed you down?**
   — The spec noted "focus the close button on open (a ref + useEffect)" but didn't say what to do if the user tabs away and re-opens — left it as-is (re-focus on every open) which is the natural behavior. Also, the backdrop's `data-testid` attribute needed to be inferred from the test code (`document.querySelector('[data-testid=...]')`) since the test file was not provided pre-written; easy to infer.

2. **Was there a constraint or decision that should have been listed but wasn't?**
   — No gaps. DEC-004 (CSS keyframes), DEC-010 (tokens, no raw hex), DEC-001 (engine via index only) and the three constraints (touch-targets-44, respect-reduced-motion, portrait-first) all had clear implementations. The spec's Notes section was unusually complete.

3. **If you did this task again, what would you do differently?**
   — Nothing significant. The spec pseudo-code in `## Notes for the Implementer` was precise enough that the implementation was a straight translation. I would still verify with `just typecheck` before `just test` to catch type issues early (as done here).

---

## Reflection (Ship)

*Appended during the **ship** cycle.*

1. **What would I do differently next time?**
   — Nothing. Reading the paytable rows from the engine's `PAYTABLE` (rather than
   re-stating the numbers in the UI) means the sheet can never drift from what the
   evaluator actually pays — the deep-equal test enforces it. Keeping the sheet
   self-contained (trigger + dialog + own state) made it a one-line drop into the
   Header with no prop threading.

2. **Does any template, constraint, or decision need updating?**
   — No. DEC-011/006/001/004/010 covered it. (A formal focus-trap is deferred to
   the STAGE-005 a11y audit, as scoped — basic dialog semantics + Esc + focus-on-open
   are in place.)

3. **Is there a follow-up spec I should write now before I forget?**
   — No new spec. This completes the requested win-legibility slice (win amount +
   paytable). The remaining STAGE-004 celebration/audio specs (count-up, particles,
   jackpot moment, paw-print trail, jingle, mute) stay in the backlog for when the
   user wants the juice.

---

## Verify

**Verdict: ✅ APPROVED**

Gate: `just typecheck && just lint && just test && just build` — all exit 0. 142/142 tests pass. `just decisions-audit --changed` — clean (no uncommitted file changes).

### Checked items

- **ACCEPTANCE CRITERIA** — All six checkboxes met:
  - [x] `paytableRows()` returns four tiers jackpot→high→mid→low with correct emoji and multipliers from engine PAYTABLE.
  - [x] "ℹ Paytable" trigger (≥44px via `--space-7`=48px) always rendered; closed by default (conditional `{open && ...}` — no dialog in DOM until clicked).
  - [x] Open sheet has `role="dialog"`, `aria-modal="true"`, `aria-label="Paytable"`; all tiers with emoji + 3/4/5 payouts; "× total bet" note.
  - [x] Three close paths present: ✕ button, backdrop onClick, Esc keydown listener.
  - [x] Slide-up `@keyframes paytable-slide-up` with `@media (prefers-reduced-motion: reduce) { .paytable__sheet { animation: none } }`; no raw hex anywhere in paytable.css; trigger and sheet are `position: absolute` so no layout shift when closed.
  - [x] `git diff main..HEAD -- src/engine/` is empty; all four gate commands exit 0.

- **DATA CORRECTNESS** — `paytableRows()` uses `TIER_ORDER = ['jackpot','high','mid','low']`, reads `PAYTABLE[tier]` directly from engine import, filters `SYMBOLS` by `SYMBOL_TIER[s] === tier`, maps to `SYMBOL_DISPLAY[s].emoji`. Engine PAYTABLE has jackpot [8,40,200], high [3,10,40], mid [1,4,12], low [0.5,2,5] — exact DEC-011 values. No UI-side constants. The "multipliers come from engine PAYTABLE" test asserts deep-equal against `PAYTABLE[row.tier]` per row — would catch any hard-coded deviation.

- **SHEET BEHAVIOR** — Dialog absent from DOM when closed (conditional render). All three close paths tested independently: ✕ button (`getByRole('button', {name:/close/i})`), backdrop (`data-testid="paytable-backdrop"` queried via querySelector), Esc (`fireEvent.keyDown(document, {key:'Escape'})`). `stopPropagation` on sheet element prevents inside-clicks from closing. Focus moved to close button ref on open via `useEffect`.

- **A11Y / CONSTRAINTS** — `--space-7` = 48px ≥ 44px; both trigger and close button set `min-height` and `min-width` to `var(--space-7)`. Focus moves to close button on open (ref + useEffect). `@keyframes paytable-slide-up` + `@media (prefers-reduced-motion: reduce)` drops animation. No raw hex, no rgb/rgba/hsl — confirmed by grep. `.cabinet { position: relative }` in regions.css is a safe, additive change: the flex-column layout is not disturbed (relative does not affect normal flow of children; the overlay uses `position: absolute` which is taken out of flow).

- **DEC-001** — `git diff main..HEAD -- src/engine/` empty. `paytable.ts` imports only from `../engine/index` (never engine internals). ESLint passes.

- **TESTS NOT VACUOUS** — "multipliers come from the engine PAYTABLE" loops over all rows and deep-equals against live `PAYTABLE[row.tier]` — a hard-coded constant would break this test if it diverged. "is closed by default" asserts `queryByRole('dialog')` is null — would catch always-mounted dialog. Three separate close-path tests each independently open and close the sheet — any broken close path fails exactly one test.

- **DECISION DRIFT** — No new non-trivial choices. DEC-001/004/006/010/011 all honored. No new DEC needed. Build reflection is substantive (3 specific answers, non-template). Cost sessions: design null-with-note (main-loop ✓), build null-with-note (sub-agent, orchestrator fills ✓) — both correctly structured; verify session appended now.
