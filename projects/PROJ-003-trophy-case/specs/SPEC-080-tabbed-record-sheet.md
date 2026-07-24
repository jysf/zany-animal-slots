---
task:
  id: SPEC-080
  type: story                      # epic | story | task | bug | chore
  cycle: ship  # frame | design | build | verify | ship
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
    - cycle: build
      interface: claude-code
      model: claude-sonnet-4-6
      tokens_total: 93110     # from Agent result subagent_tokens
      estimated_usd: 0.61     # 93110 tok x $6.6/M (Sonnet list, no cache discount) - order-of-magnitude
      duration_minutes: 3.6   # 218757 ms
      recorded_at: 2026-07-24
      note: >-
        Split StatsSheet into Trophies/Numbers tabs with the full ARIA tab pattern and
        real conditional rendering (absence-asserted in tests, not CSS-hidden). Clear
        record moved outside both tabpanels. Arrow-key roving focus skipped as
        nice-to-have per spec. All gates green; engine/audio diffs empty.
    - cycle: verify
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: 45000     # NOMINAL - inline main-loop verify, not separately metered
      estimated_usd: 0.90     # NOMINAL, 45000 tok x $20/M (Opus list) - order-of-magnitude
      recorded_at: 2026-07-24
      note: >-
        Verified INLINE on the Opus main loop. All prescribed guard-mutations killed their targets
        using the spec's killing inputs: (1) rendering both panels regardless of tab broke all three
        show/hide tests - the ABSENCE assertions did the work, exactly as designed; (2) aria-selected
        hardcoded true broke the ARIA-pattern test via the unselected-tab assertion; (4) neutralising
        the reset-on-close broke "reopening returns to Trophies". (3) Clear record placement confirmed
        structurally - it sits outside both panel conditionals. Also did a REAL 375px render: Numbers
        tab is 643px against an 812px viewport = NO SCROLL AT ALL (was 1537px stacked), tabs are 48px
        (>=44), aria-selected flips correctly, and the trophy case is genuinely absent from the DOM on
        the Numbers tab rather than CSS-hidden. Trophies tab is 1395px - still scrolls, inherent to 3
        full cards, and acceptable now that the numbers no longer sit behind them. 0 defects.
    - cycle: ship
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      recorded_at: 2026-07-24
      note: >-
        main-loop, not separately metered (AGENTS 4); ship cycle. Gate, PR + CI + merge, archive,
        brag, RELEASES.md entry, then re-ship STAGE-016 + PROJ-003.
  totals:
    tokens_total: 138110   # build 93110 + verify 45000 (NOMINAL, inline Opus main-loop)
    estimated_usd: 1.51    # build 0.61 + verify 0.90 (nominal)
    session_count: 4       # design, build, verify (inline), ship
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

- **Branch:** `docs/release-notes-trophy-case`
- **PR (if applicable):** none opened (per instructions)
- **All acceptance criteria met?** Yes. Two tabs (Trophies default, Numbers), only the
  selected panel's content is mounted (real conditional render, not CSS hidden — verified
  by absence assertions in the tests), full ARIA tab pattern
  (`tablist`/`tab`+`aria-selected`+`aria-controls`/`tabpanel`), real `<button>`s ≥44px
  (`.stats__tab` uses `min-height`/`min-width: var(--space-7)`, same token as
  `.stats__trigger`/`.stats__clear`), Clear record + its note moved outside both
  tabpanels (visible on both tabs, still clears both trophies and numbers),
  `stats__divider` removed, tab state is component `useState` with no localStorage key
  (plus a belt-and-braces reset-on-close effect per the spec's note), no panel
  transition added. `src/engine/**` and `src/ui/audio/**` diffs are empty.
- **New decisions emitted:** none.
- **Deviations from spec:** Arrow-key roving focus was **not** implemented — tabs are
  plain `<button>`s relying on native Tab/Enter/Space, not roving tabindex with
  Left/Right arrow handling. The spec calls this "nice to have," and both existing
  requirements (real buttons, ≥44px, correct `aria-selected`/`aria-controls`) are met
  without it.
- **Follow-up work identified:** none.

### Build-phase reflection (3 questions, short answers)

1. **What was unclear in the spec that slowed you down?** — Nothing major; the existing
   seam (trophy case → divider → grid → sparkline → clear) mapped cleanly onto
   tabpanel-A / tabpanel-B / always-visible-footer. The one judgment call was what to do
   with the pre-existing SPEC-079 tests that asserted trophy case and numeric tiles were
   simultaneously visible after opening (e.g. "renders the trophy case above the numeric
   tiles") — those assertions are now definitionally false, since only one panel mounts
   at a time. I removed the ones that were fully superseded by the new
   default-tab/switch-tab tests and adapted the rest to switch to the Numbers tab first
   before asserting on tile content.
2. **Was there a constraint or decision that should have been listed but wasn't?** — No;
   `touch-targets-44`, `respect-reduced-motion`, and `portrait-first` were all already
   listed and were sufficient.
3. **If you did this task again, what would you do differently?** — Same approach. I'd
   maybe pre-flag the SPEC-079-test conflict in the Notes section up front so a future
   implementer doesn't have to rediscover it mid-build.

---

## Reflection (Ship)

1. **What would I do differently next time?** — Not made the layout call unilaterally in the first
   place. SPEC-079's hierarchy inversion was reasonable in isolation, but "which of two good things
   leads the sheet" is a taste question about the user's own game, and I decided it without asking
   while asking about smaller things (N, placement) earlier. The tell was available before shipping:
   the merged sheet measured **1537px against an 812px viewport**, and I noted that number at
   SPEC-079's verify without treating it as the design smell it was.

2. **Does any template, constraint, or decision need updating?** — No. This spec is, however, the
   first to carry **killing inputs alongside each prescribed guard-mutation** (the repo lesson from
   SPEC-073/076/078), and it paid off immediately: mutation 1 was killed specifically by the
   *absence* assertions the spec insisted on, which a presence-only test would have missed. Worth
   keeping as the default shape for a Failing Tests section.

3. **Is there a follow-up spec I should write now before I forget?** — No spec, but two observations
   from the real render worth carrying: (a) on a genuine first run the **help sheet and the record
   sheet can be open simultaneously**, stacked — pre-existing (not caused here) and only reachable
   before help is dismissed, but it looks broken if a player hits it; (b) the Trophies tab is still
   1395px, inherent to three full cards, which is fine now that the numbers are one tap away rather
   than behind them.
