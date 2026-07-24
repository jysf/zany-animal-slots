---
# Maps to ContextCore task.* semantic conventions.

task:
  id: SPEC-079
  type: story                      # epic | story | task | bug | chore
  cycle: ship  # frame | design | build | verify | ship
  blocked: false
  priority: medium
  complexity: S                    # S | M | L  (L means split it)

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
    - DEC-010   # design tokens, no raw hex
    - DEC-020   # the session-stats model whose display this reorganizes
    - DEC-024   # the trophy model being surfaced
  constraints:
    - engine-no-dom
    - portrait-first
    - touch-targets-44
    - respect-reduced-motion
  related_specs:
    - SPEC-076  # the TrophyCase component this mounts
    - SPEC-056  # the StatsSheet being reorganized

value_link: >-
  The moment the trophy case becomes real for the player: trophies lead the sheet, the numbers
  follow, and the sheet stops calling a record that survives reloads a "session".

cost:
  sessions:
    - cycle: design
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: null   # design cycle runs on the orchestrator's main Opus loop — not separately metered
      recorded_at: 2026-07-23
      note: >-
        Design authored on the main Opus loop (un-metered). Split out of SPEC-076 (which scored L).
        Small integration spec, but it carries the user-visible rename and the hierarchy inversion,
        plus the one drought stat. Flags the 375px hardware check as a ship-time obligation, not
        something a Chromium preview can discharge.
    - cycle: build
      interface: claude-code
      model: claude-sonnet-4-6
      tokens_total: 117470    # from Agent result subagent_tokens
      estimated_usd: 0.78     # 117470 tok x $6.6/M (Sonnet list, no cache discount) - order-of-magnitude
      duration_minutes: 6.9   # 411150 ms
      recorded_at: 2026-07-23
      note: >-
        Mounted TrophyCase above the tile grid, removed the biggest-win tile, added the
        drought counter (max spinIndex, not topWins[0]), applied the five renamed strings,
        added the labelled divider. Full gate green; live-app check at 375x812 confirmed
        scroll (not clip) with the case at the top.
    - cycle: verify
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: 60000     # NOMINAL — inline main-loop verify, not separately metered (see note); ~order-of-magnitude
      estimated_usd: 1.20     # NOMINAL, 60000 tok x $20/M (Opus list) — inline verify ran on the Opus main loop, not Sonnet
      recorded_at: 2026-07-23
      note: >-
        Verified INLINE on the main Opus loop (un-metered) at the user's request to cut wall-clock,
        not as a separate Sonnet subagent — less independent (same author verifies), a tradeoff the
        user chose. Ran the 4 guard-mutations from Notes: drought using topWins[0] instead of max
        spinIndex breaks the "43" drought test (confirms the most-recent-vs-biggest fixture has
        teeth); DOM-order test uses compareDocumentPosition and opens the dialog by the RENAMED
        accessible name; storage key confirmed still 'zany:stats'; rename grep shows "Session stats"
        gone from src/. Also did a REAL browser render at 375x812 (dev server, no audio, no spin):
        the case renders trophies in their ORIGINATING machines' creatures (Arctic + Ocean shown
        while W&W active — DEC-021 confirmed visually), full cards + compact rows both legible, lit
        winning cells read even at thumb size, drought shows 12, sheet scrolls. 0 defects.
    - cycle: ship
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      recorded_at: 2026-07-23
      note: >-
        main-loop, not separately metered (AGENTS 4); ship cycle. Full gate, PR + CI-poll to 7/7 +
        squash-merge, archive, brag. This is the spec that makes the trophy case VISIBLE; shipped it
        so the user can review a working surface. SPEC-077 (earned badge) + SPEC-078 (replay) remain.
  totals:
    tokens_total: 177470   # build 117470 + verify 60000 (NOMINAL, inline Opus main-loop)
    estimated_usd: 1.98    # build 0.78 + verify 1.20 (nominal)
    session_count: 4       # design, build, verify (inline), ship
---

# SPEC-079: Mount the trophy case in the record sheet

## Context

SPEC-076 built `TrophyCase` and deliberately left it unmounted. This spec puts it on screen
and finishes the surface.

Three things happen here. The sheet's **hierarchy inverts** — trophies lead, the numbers
follow — because the trophies are now the reason to open it. The existing **"Biggest win"
tile is subsumed** by the #1 trophy, which shows strictly more (the same amount, plus the
reels, machine, bet, spin number, and multiplier); keeping both would be duplication.
And the sheet is **renamed**: "Session stats" is a misnomer, since the record lives in
`localStorage` and survives reloads — trophies from an hour ago are not "this session".

## Goal

Mount `TrophyCase` at the top of the stats sheet, invert the sheet's hierarchy, remove the
now-redundant "Biggest win" tile, add the drought counter, and rename the sheet's user-facing
strings — without changing the storage key or any recorded data.

## Inputs

- **Files to read:**
  - `src/ui/stats/StatsSheet.tsx` + `StatsSheet.test.tsx` + `stats.css`
  - `src/ui/trophies/TrophyCase.tsx` (SPEC-076) — the component being mounted
  - `src/stats/sessionStats.ts` — `SessionStats`, `deriveMetrics`, `TopWin`
  - `src/ui/controls.touch-target.test.ts` — asserts `.stats__trigger` sizing (do not break)

## Outputs

- **Files modified:**
  - `src/ui/stats/StatsSheet.tsx` — mount `TrophyCase`, invert order, drop the biggest-win
    tile, add the drought line, rename strings.
  - `src/ui/stats/stats.css` — a section divider / spacing for the two zones.
  - `src/ui/stats/StatsSheet.test.tsx` — updated + new assertions.

## Acceptance Criteria

- [ ] `TrophyCase` renders **above** the numeric tiles in the sheet's DOM order, receiving
      `topWins` and `spins` from `useStats()`.
- [ ] The **"Biggest win" tile is gone** — no `stat-biggest` testid remains and the amount is
      not duplicated between the tile and the #1 trophy.
- [ ] The remaining tiles (Spins, Win rate, Net winnings, Cash-ins) still render with their
      existing testids and values — **no metric regression**.
- [ ] The sparkline still renders, below the tiles.
- [ ] A **drought counter** shows spins since the last trophy
      (`spins − topWins[0].spinIndex`) when at least one trophy exists; it is **absent** when
      `topWins` is empty (nothing to be in a drought from).
- [ ] The drought counter reads `0` sensibly on the spin that just set a trophy (not `-0`,
      not a negative number).
- [ ] **Rename:** the sheet title, the trigger's `aria-label` and `title`, the dialog's
      `aria-label`, the clear button, and the clear note no longer say "Session stats".
      The new name is **"Your record"** (button: **"Clear record"**).
- [ ] The `zany:stats` **localStorage key is unchanged** — renaming a persisted key would
      orphan exactly the history this project exists to protect.
- [ ] The clear note states that clearing removes trophies too.
- [ ] `.stats__trigger` keeps its ≥44px sizing (`controls.touch-target.test.ts` still passes).
- [ ] The trigger emoji stays **📊** (see Notes — deliberate).
- [ ] `src/engine/**` and `src/ui/audio/**` diffs empty; no raw hex; no new dependency.

## Failing Tests

- **`src/ui/stats/StatsSheet.test.tsx`** (update + add)
  - existing tests updated for the new strings; `stat-biggest` assertions **removed**, not
    weakened (the tile is gone by design).
  - `"renders the trophy case above the numeric tiles"` — assert DOM order: the trophy-case
    element precedes the tile grid (e.g. via `compareDocumentPosition` or querying the sheet's
    children in order).
  - `"no longer renders a separate Biggest win tile"` — assert `queryByTestId('stat-biggest')`
    is null.
  - `"still renders spins, win rate, net, and cash-ins"` — pin the no-regression case.
  - `"shows spins since the last trophy when a trophy exists"` — stats with
    `spins: 143`, `topWins[0].spinIndex: 100` ⇒ text contains `43`.
  - `"hides the drought counter when there are no trophies"` — empty `topWins` ⇒ absent.
  - `"the sheet is named 'Your record', not 'Session stats'"` — assert the title and the
    trigger's accessible name, and assert `/Session stats/` appears nowhere.
  - `"clearing the record also clears trophies"` — seed stats with a trophy, click
    **Clear record**, assert `topWins` is empty afterwards and the empty state shows.

## Implementation Context

### Decisions that apply

- `DEC-024` — trophies are part of the same blob, so the existing `resetStats()` already
  clears them. **Do not add new clearing logic**; just make the copy honest.
- `DEC-020` — the numeric metrics are unchanged; only their position and the removal of the
  biggest-win tile change.
- `DEC-010` — tokens, no raw hex, `stats__*` prefix for sheet-level classes.

### Constraints that apply

- `portrait-first` — **the sheet is now much taller.** It already has
  `max-height: 100dvh; overflow-y: auto` (SPEC-063/070), so it should scroll rather than
  clip — confirm that still holds with the case at the top.
- `touch-targets-44`, `respect-reduced-motion`.

### Out of scope (for this spec specifically)

- The celebration badge (SPEC-077) and replay (SPEC-078).
- Any change to the stats model, storage, seam, or the `zany:stats` key.
- Any change to `TrophyCase`'s internals — mount it as built.

## Notes for the Implementer

### Naming — use exactly these strings

| Where | Old | New |
|---|---|---|
| `<h2 className="stats__title">` | Session stats | **Your record** |
| trigger `aria-label` / `title` | Session stats | **Your record** |
| dialog `aria-label` | Session stats | **Your record** |
| clear button | Clear stats | **Clear record** |
| clear note | "Clears this browser's session record only…" | "Clears this browser's record — trophies included. Your balance and machine are untouched." |

**Keep the trigger emoji as 📊.** A 🏆 would arguably fit the new headline content better, but
the emoji is the control's visual identity and players navigate by it; changing it is a
discoverability cost this spec doesn't need to pay. Flagging it as a deliberate choice rather
than an oversight.

**Do not rename** the `zany:stats` storage key, the `stats__*` CSS class prefix, the
`StatsSheet` component/file name, or any testid other than the removed `stat-biggest`. This is
a **copy** change, not a refactor — keeping the blast radius small is the point.

### Drought counter

```tsx
// Spins since the most recent trophy. topWins[0] is the LARGEST, not the most recent —
// use the max spinIndex across trophies for "most recent".
const lastTrophySpin = stats.topWins.length
  ? Math.max(...stats.topWins.map((t) => t.spinIndex))
  : null;
const drought = lastTrophySpin === null ? null : Math.max(0, stats.spins - lastTrophySpin);
```

> Note the subtlety the acceptance criterion glosses: `topWins[0]` is the biggest win, not the
> latest one. A player whose best win was spin 12 and most recent trophy was spin 140 is not in
> a 128-spin drought. Use the max `spinIndex`. The `Math.max(0, …)` guard also kills the `-0`
> case.

Render it near the numeric tiles (it is a nerdier stat — it does not belong on the hero card).
If the sheet feels crowded at 375px, this is the first thing to cut; say so in Build Completion
rather than cutting it unilaterally.

### Layout

Keep it simple: `TrophyCase`, then a labelled divider, then the existing tile grid + drought +
sparkline + clear button. The divider can be a plain `<h3>`-style label (e.g. "The numbers")
using existing type tokens.

### Adversarial guard-mutations for verify

1. Render `TrophyCase` after the tiles ⇒ breaks the DOM-order test.
2. Re-add the biggest-win tile ⇒ breaks "no longer renders a separate Biggest win tile".
3. Drought uses `topWins[0].spinIndex` instead of the max ⇒ should break a test — **if it
   doesn't, the drought tests are too weak; report that** (seed a fixture where the biggest
   win and the most recent trophy are different spins).
4. Revert the title string to "Session stats" ⇒ breaks the rename test.

### Do NOT

- Do not touch `src/engine/**` or `src/ui/audio/**`.
- Do not change the storage key or any persisted data.
- Do not `git add -A`, `git stash -u`, or `git add src/ui/` broadly
  (`src/ui/audio/_spike/` must stay untracked).

---

## Build Completion

- **Branch:** feat/spec-079-sheet-integration
- **PR (if applicable):** none opened yet (build cycle only)
- **All acceptance criteria met?** Yes. `TrophyCase` mounts above the tile grid (verified by
  DOM-order test + `compareDocumentPosition`, and visually in the running app); the
  "Biggest win" tile and `stat-biggest` testid are gone; Spins/Win rate/Net/Cash-ins are
  unchanged; the sparkline still renders below the tiles; the drought counter
  (`data-testid="stat-drought"`) shows spins since the most recent trophy using
  `Math.max(...topWins.map(t => t.spinIndex))` (not `topWins[0]`), guarded with
  `Math.max(0, …)`, and is absent when `topWins` is empty; all five renamed strings match the
  table exactly; the `zany:stats` key, `stats__*` prefix, component/file name, and remaining
  testids are untouched; the trigger emoji stays 📊; `.stats__trigger` still passes
  `controls.touch-target.test.ts`; the sheet was confirmed live at 375×812 — `scrollHeight`
  (1913px) exceeds `clientHeight` (812px) with `overflow-y: auto`, so it scrolls rather than
  clips with the case at the top. The drought counter was kept — it did not need to be cut.
- **New decisions emitted:** none.
- **Deviations from spec:** none. The divider is a plain `<h3 className="stats__divider">The
  numbers</h3>` using existing type tokens, per the Notes' "keep it simple" guidance.
- **Follow-up work identified:** none beyond the already-gated SPEC-077 (celebration badge)
  and SPEC-078 (replay), which stay out of scope here.

### Build-phase reflection (3 questions, short answers)

1. **What was unclear in the spec that slowed you down?** — Nothing major; the Notes section's
   worked drought-counter snippet and exact rename table left little to interpret. The one
   thing I double-checked myself was whether the drought tile should keep the
   `stats__tile--wide` styling vacated by the removed biggest-win tile — the spec didn't say,
   but it reads better wide (longer label) so I kept it.
2. **Was there a constraint or decision that should have been listed but wasn't?** — No; the
   spec's own adversarial guard-mutation #3 anticipated the exact bug this task is designed to
   avoid (using `topWins[0].spinIndex` instead of the max), and the test fixture
   (`shows spins since the last trophy when a trophy exists`) exercises a case where the
   biggest win and the most recent trophy are different spins, so a regression to
   `topWins[0]` does break it as the spec predicted.
3. **If you did this task again, what would you do differently?** — Nothing structural; I'd
   seed the live-app verification (localStorage `zany:stats`) earlier in the pass instead of
   after the automated gate, since it caught nothing the tests hadn't already, but it's cheap
   insurance for a DOM-order/scroll claim that's hard to fully trust from jsdom alone.

---

## Reflection (Ship)

1. **What would I do differently next time?** — Split SPEC-076/079 earlier and more confidently.
   The original single spec was clearly L, and pretending otherwise would have produced a sprawling
   diff mixing a new component with a sheet reorg and a rename. Splitting kept each half reviewable.
   The only thing I'd change: this integration spec is where the whole stage finally became
   *visible*, and I front-loaded four specs of invisible plumbing before anyone could see anything —
   defensible for correctness, but it means the first lookable artifact came late. A thin
   vertical slice earlier (one trophy, ugly, on screen) would have de-risked the visual direction sooner.

2. **Does any template, constraint, or decision need updating?** — No. Worth recording that the
   rename deliberately did NOT touch the `zany:stats` key, the `stats__*` class prefix, or the
   component name — the user-facing copy changed, the persisted identity did not. Renaming the key
   would have orphaned the exact history this whole project was built to protect; the honest name
   and the stable key are not in tension, and conflating them would have been the mistake.

3. **Is there a follow-up spec I should write now before I forget?** — No new spec. SPEC-077 (the
   earned-in-the-moment badge) and SPEC-078 (replay) remain in the STAGE-015 backlog and are the
   two things that turn the case from a place you visit into something you feel yourself filling.
   One carry-forward for whoever ships them: the `thumb` grid legibility looked good in a 375px
   Chromium render, but the project's own rule is that a real iPhone is the only evidence that
   counts — the final confirmation is still owed on hardware.
