---
task:
  id: SPEC-080
  type: story                      # epic | story | task | bug | chore
  cycle: design                    # frame | design | build | verify | ship
  blocked: false
  priority: medium
  complexity: S                    # S | M | L  (L means split it)

project:
  id: PROJ-003
  stage: STAGE-016
repo:
  id: animal-slots

agents:
  architect: claude-opus-4-8       # design/frame: Opus (judgement-heavy). See AGENTS §8.
  implementer: claude-sonnet-4-6   # build/verify: Sonnet (execution against the spec)
  created_at: 2026-07-24

references:
  decisions:
    - DEC-001   # engine-no-dom: presentation only
    - DEC-010   # design tokens, no raw hex
  constraints:
    - portrait-first
    - touch-targets-44
    - respect-reduced-motion
  related_specs:
    - SPEC-079  # the hierarchy inversion this corrects
    - SPEC-056  # the original stats sheet

value_link: >-
  Makes the trophy case and the session numbers both first-class instead of trading one for the
  other — the user's correction to an agent-made layout decision.

cost:
  sessions:
    - cycle: design
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: null   # design cycle runs on the orchestrator's main Opus loop — not separately metered
      recorded_at: 2026-07-24
      note: >-
        Design authored on the main Opus loop (un-metered). Small corrective spec: SPEC-079's
        hierarchy inversion was an AGENT decision, and the user's same-day verdict was that both
        surfaces matter. Tabs, not reordering, because reordering just moves which one is buried.
  totals:
    tokens_total: 0
    estimated_usd: 0
    session_count: 0
---

# SPEC-080: Tabbed record sheet

## Context

SPEC-079 inverted the record sheet so trophies led and the session numbers followed. That was an
**agent-made decision**, and playing the result the user's verdict was that both surfaces are
worth having and neither should be buried. Measured: the merged sheet is ~**1537px tall on an
812px viewport**, so reaching the numbers means scrolling the whole trophy case.

Simply flipping the order back would only move the problem — the trophy case would be the buried
one. Tabs make both reachable in a single tap.

## Goal

Split the record sheet into two tabs — **Trophies** and **Numbers** — so each is about one
screen tall at 375px and neither requires scrolling past the other, without adding a header
control or changing any recorded data.

## Inputs

- **Files to read:** `src/ui/stats/StatsSheet.tsx`, `StatsSheet.test.tsx`, `stats.css`

## Outputs

- **Files modified:** `src/ui/stats/StatsSheet.tsx`, `src/ui/stats/stats.css`,
  `src/ui/stats/StatsSheet.test.tsx`.

## Acceptance Criteria

- [ ] The open sheet shows two tab controls, **Trophies** and **Numbers**, with **Trophies**
      selected by default.
- [ ] Selecting a tab shows that panel and hides the other; only one panel's content is in the
      accessible tree at a time.
- [ ] The tabs use the **ARIA tab pattern**: a `role="tablist"` container, `role="tab"` controls
      with `aria-selected` reflecting state and `aria-controls` pointing at a `role="tabpanel"`.
- [ ] Tabs are real `<button>`s, keyboard operable, ≥44px hit area (`touch-targets-44`).
- [ ] The **Trophies** panel contains the trophy case; the **Numbers** panel contains the tile
      grid, the drought counter, and the sparkline.
- [ ] **Clear record stays visible on both tabs** — it clears both, so it must not hide inside
      one. Its confirmation note stays with it.
- [ ] The `stats__divider` ("The numbers") heading is **removed** — the tab label replaces it.
- [ ] Tab state is **ephemeral component state**: reopening the sheet returns to Trophies. No new
      `localStorage` key.
- [ ] All existing sheet behavior is unchanged: Esc closes, backdrop closes, focus goes to Close
      on open, the trigger keeps its name and ≥44px sizing, `zany:stats` untouched.
- [ ] No header control added. Tokens only, no raw hex. `src/engine/**` and `src/ui/audio/**`
      diffs empty.

## Failing Tests

- **`src/ui/stats/StatsSheet.test.tsx`**
  - `"opens on the Trophies tab by default"` — trophy case present, tile grid absent.
  - `"switching to Numbers shows the stats and hides the trophy case"` — click Numbers; assert
    `stat-spins` present **and** the trophy case absent. *(Assert BOTH directions — a test that
    only checks the new panel appeared would pass if both rendered at once, which is the bug this
    spec exists to remove.)*
  - `"switching back to Trophies restores the case and hides the stats"`.
  - `"tabs expose the ARIA tab pattern"` — `role="tablist"` present; each `role="tab"` has
    `aria-selected` matching its state and `aria-controls` resolving to a `role="tabpanel"`.
  - `"Clear record is reachable from BOTH tabs"` — assert on Trophies, switch, assert on Numbers.
  - `"clearing from the Numbers tab still clears trophies"` — seed a trophy, switch to Numbers,
    click Clear record, switch to Trophies, assert the empty state.
  - `"reopening the sheet returns to the Trophies tab"` — switch to Numbers, close, reopen,
    assert Trophies is selected. *(Pins the ephemeral-state decision.)*

## Implementation Context

### Decisions that apply

- `DEC-010` — tokens only; keep the `stats__*` prefix (`.stats__tabs`, `.stats__tab`,
  `.stats__panel`).
- `DEC-001` — presentation only. No model, storage, or engine change.

### Constraints that apply

- `portrait-first` — the point of the change; each panel should be ~one screen at 375px.
- `touch-targets-44` — tab controls.
- `respect-reduced-motion` — if a panel transition is added at all, it needs an off-switch.
  Simplest compliant choice: **no transition**.

### Out of scope

- Reordering, restyling, or otherwise changing `TrophyCase` internals or the tiles.
- Persisting the selected tab.
- Any new header control, sheet, or route.
- Anything in `src/ui/audio/**` or `src/engine/**`.

## Notes for the Implementer

### Structure

The sheet already has a clean seam. Today:

```
<TrophyCase … />
<h3 className="stats__divider">The numbers</h3>
<div className="stats__grid"> … tiles + drought … </div>
<div className="stats__sparkline-wrap"> … </div>
<button className="stats__clear">Clear record</button>
<p className="stats__note"> … </p>
```

Becomes: tablist → the selected panel → then the **always-visible** clear button + note.

```tsx
const [tab, setTab] = useState<'trophies' | 'numbers'>('trophies');
```

Declare `tab` inside the component so closing the sheet (which unmounts the panel content)
naturally returns to `'trophies'` on reopen — confirm that holds given how `open` is managed; if
the sheet body is not unmounted on close, reset `tab` when `open` flips false.

Keyboard: native `<button>`s give you Enter/Space for free. Arrow-key roving focus is *nice to
have* for the full ARIA tab pattern — implement it if cheap, but do not fake `aria-selected`
without real focus management. If you skip arrow keys, say so in Build Completion.

### Killing inputs for the guard-mutations

*(Per the repo lesson: a prescribed mutation must come with an input that makes it fail.)*

1. **Render both panels regardless of `tab`** ⇒ must break `"switching to Numbers … hides the
   trophy case"`. The killing assertion is the **absence** check — a test that only asserts the
   new panel appeared cannot detect this.
2. **`aria-selected` hardcoded to `true` on both tabs** ⇒ must break the ARIA-pattern test.
   Killing input: assert `aria-selected` on the *unselected* tab is `"false"`, not just that the
   selected one is `"true"`.
3. **Move Clear record inside the Numbers panel** ⇒ must break `"reachable from BOTH tabs"`. The
   killing input is asserting it while the **Trophies** tab is active.
4. **Persist `tab` to localStorage / lift it above the sheet** ⇒ must break `"reopening returns
   to Trophies"`. Killing input: switch tab, close, reopen — assert the *default*, not merely
   that a tab is selected.

### Do NOT

- Do not touch `src/engine/**` or `src/ui/audio/**`.
- Do not `git add -A`, `git stash -u`, or `git add src/ui/` broadly.
- Do not start a dev server.

---

## Build Completion

- **Branch:**
- **PR (if applicable):**
- **All acceptance criteria met?**
- **New decisions emitted:**
- **Deviations from spec:**
- **Follow-up work identified:**

### Build-phase reflection (3 questions, short answers)

1. **What was unclear in the spec that slowed you down?** —
2. **Was there a constraint or decision that should have been listed but wasn't?** —
3. **If you did this task again, what would you do differently?** —

---

## Reflection (Ship)

1. **What would I do differently next time?** —
2. **Does any template, constraint, or decision need updating?** —
3. **Is there a follow-up spec I should write now before I forget?** —
