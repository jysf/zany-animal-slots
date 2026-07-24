---
# Maps to ContextCore epic-level conventions.
# A Stage is a coherent chunk of work within a Project.

stage:
  id: STAGE-015
  status: active                    # proposed | active | shipped | cancelled | on_hold
  priority: medium
  target_complete: null

project:
  id: PROJ-003
repo:
  id: animal-slots

created_at: 2026-07-23
shipped_at: null

value_contribution:
  advances: >-
    The half of the thesis that is actually about fun: turning the stored wins into a
    surface worth opening — real reels, the right creatures, the winning cells lit —
    and making the act of earning a trophy legible in the moment it happens.
  delivers:
    - "A ranked trophy case at the top of the record sheet: full cards for #1-#3, tap-to-expand rows for #4-#10."
    - "Every trophy re-rendered as a real 5x3 grid in its ORIGINATING machine's creatures, winning cells lit and the rest dimmed."
    - "Trophy replay: tapping a trophy re-spins the reels into that saved grid, lines lighting and paws popping."
    - "A 'trophy earned' moment on the win celebration, with a distinct treatment for taking #1."
    - "A locked-plinth empty state that invites a first win, plus at-a-glance return context (bet multiplier, the bar to beat, the current drought)."
    - "An honest name: the 'Session stats' sheet is renamed, since the record survives reloads."
  explicitly_does_not:
    - "Add a sixth header control — the case lives inside the existing (renamed) record sheet."
    - "Add audio of any kind, including a trophy sting (src/ui/audio/** is untouched)."
    - "Add sharing, export, screenshots, all-time records, or per-machine cases."
---

# STAGE-015: The Trophy Case

## What This Stage Is

The visible payoff. STAGE-014 quietly fills a `topWins` array; this stage builds the
case that makes it worth having. The stats sheet's hierarchy inverts — trophies first,
numbers below — and the existing "Biggest win" tile is promoted into the #1 trophy: a
full card with a medal, tier-derived framing, the amount, the machine, the bet, the
spin number, and the actual 5×3 grid that produced it, re-rendered in that machine's
own creatures with the winning cells lit and everything else dimmed back. #2 and #3 get
the same card treatment; #4–#10 sit as compact rows that expand in place on tap, so ten
trophies stay browsable on a 375px phone instead of becoming a scroll marathon. And
because a case you only discover by opening a sheet isn't much of a reward, the win
celebration gains a badge the moment a spin enters the top ten — with a distinct
treatment for knocking off #1.

## Why Now

It is the point of the project, and it cannot start earlier: it needs STAGE-014's
stored trophies to render, and it is better built against a store with real trophies in
it. It also inherits, ready-made, everything it needs from PROJ-002 — the sheet idiom,
the design-token system (DEC-010), and per-machine symbol identity (DEC-021), which is
precisely what lets a *saved* grid render in the right creatures rather than the
currently-selected machine's.

## Success Criteria

- Opening the record sheet shows trophies **above** the numbers, with #1 as a full card
  and the existing "Biggest win" tile gone (subsumed, not duplicated).
- Tapping a trophy replays it: the reels re-spin into that saved grid with lines
  lighting; under `prefers-reduced-motion` the grid appears instantly. A replay does not
  start while a live spin or auto-spin is running (and vice versa).
- The sheet is renamed from "Session stats" to an honest name across title, trigger,
  clear button, and note; the `zany:stats` storage key is unchanged.
- With the case full, the bar-to-beat is shown; each card shows its bet multiplier; the
  empty state is ten locked plinths, not a single zero.
- A trophy won on Arctic renders Arctic's creatures **while Ocean is the active
  machine** — the originating machine's `symbolDisplay`, never the active one.
- Winning cells are visually distinct from non-winning cells on every rendered trophy,
  and the distinction does not rely on color alone.
- Rows #4–#10 expand in place on tap and collapse again; keyboard-reachable, ≥44px hit
  areas (constraint `touch-targets-44`).
- With zero wins, the case shows an inviting empty state, not a zero or a blank.
- A spin entering the top ten shows a badge during its celebration; taking #1 shows a
  distinct one. Both have a non-animated path under `prefers-reduced-motion`
  (constraint `respect-reduced-motion`).
- "Clear stats" clears trophies too, and the sheet's note says so.
- The trophy grid has an accessible text alternative (screen reader gets the win, not
  fifteen unlabelled emoji).
- Token colors only, no raw hex (DEC-010). `src/engine/**` and `src/ui/audio/**` diffs
  both empty.
- Full gate green, and a **real-device Safari/iPhone check** — see Design Notes.

## Scope

### In scope
- Rendering a saved trophy grid via the existing `ReelGrid` at trophy scale (card +
  thumbnail), in the originating machine's `symbolDisplay`, winning cells lit.
- Deriving winning cells from a trophy's `lineWins` + the originating machine's
  `math.paylines` — presentation-layer only, reading engine data it already has; fixes
  the current module-level `PAYLINES` coupling.
- The trophy case section at the top of the record sheet: rank medals, tier framing,
  full cards for #1–#3, tap-to-expand compact rows for #4–#10, locked-plinth empty
  state, bet multiplier, bar-to-beat, drought counter.
- Trophy replay: tapping a trophy re-spins the reels into its saved grid.
- Promoting/removing the now-redundant "Biggest win" tile.
- Renaming the sheet ("Session stats" → an honest name) across title/trigger/button/note.
- The "trophy earned" / "new best" badge on the existing win celebration.
- `stats.css` additions (and/or a sibling stylesheet) using tokens only.

### Explicitly out of scope
- Any change to the stats *model* or storage — that shipped in STAGE-014.
- Any engine change, and any change to spin/celebration timing or the audio graph.
- A sixth header trigger, a standalone trophy sheet, sharing/export/screenshots,
  all-time (vs session) records, per-machine cases, or a "worst loss" counterpart.
- New analytics events (STAGE-011 Tier 2 stays gated).

## Spec Backlog

- [x] SPEC-075 (shipped on 2026-07-23) — Trophy grid at rest: `TrophyGrid` reuses `ReelGrid`
      at card + thumb sizes, rendering a saved grid in its ORIGINATING machine's
      `symbolDisplay` with winning cells lit; `winningCellKeys` now takes the machine's
      `math.paylines` (module-level `PAYLINES` coupling fixed); unknown `machineId` is marked
      rather than silently rendered as the default. 0 defects.
- [x] SPEC-076 (shipped on 2026-07-23) — The trophy case COMPONENT: ranked layout (full cards
      #1–#3, tap-to-expand compact rows #4–#10), tier framing, locked-plinth empty state, bet
      multiplier, bar-to-beat. Standalone + independently tested; mounted by SPEC-079. 1 defect
      (a fractional-multiplier test whose fixture made the guard-mutation unkillable), fixed at ship.
- [x] SPEC-079 (shipped on 2026-07-23) — Mounted the case in the record sheet: trophies lead,
      the numbers follow, "Biggest win" tile subsumed by #1, drought counter (max spinIndex),
      sheet renamed "Your record"/"Clear record" (storage key unchanged). Verified inline +
      real 375px browser render (DEC-021 confirmed visually). 0 defects.
- [ ] SPEC-077 (frame) — "Trophy earned" moment: badge on the win celebration when a
      spin enters the top ten, distinct treatment at #1, reduced-motion path.
- [ ] SPEC-078 (frame) — Trophy replay: tapping a trophy re-spins the reels into that
      saved grid, reusing `ReelGrid`'s existing `spinning` + `trailKey` animation;
      instant reveal under `prefers-reduced-motion`; must not interfere with a live spin
      or auto-spin.

**Count:** 3 shipped / 0 active / 2 pending

## Design Notes

- **Reuse `ReelGrid`, don't build a new grid.** `ReelGrid` already takes
  `grid` + `lineWins` + `symbolDisplay`, lights winning cells, and animates via
  `spinning` + `trailKey`. SPEC-075 renders it at trophy scale rather than authoring a
  parallel component; SPEC-078's replay drives the same animation props it already has.
  This is why replay is cheap — the machinery exists and has simply never been pointed
  at stored data.
- **Fix the payline source while here.** `winningCells.winningCellKeys` imports the
  module-level `PAYLINES`, not the machine's `math.paylines`. Harmless today (all four
  machines share the same 20 lines) but a *stored* trophy from a future machine with
  its own lines would light the wrong cells. SPEC-075 passes the originating machine's
  `math.paylines` through so the derivation is correct by construction. Keep the
  live-reel call site behavior identical.
- **Originating machine, not active machine.** The trophy's `machineId` selects the
  `symbolDisplay` *and* the paylines used to compute winning cells. `getMachine()`
  falls back to Wild & Whimsical for an unknown id — acceptable for now (no machine has
  ever been removed), but it would silently mis-render a saved trophy, so SPEC-075
  should make the fallback visible rather than silent if it is cheap to do so.
- **The four near-free card details (SPEC-076), each reading a number already stored:**
  1. **Bet multiplier** — `amount / bet`, shown as "24× your bet". Amount stays the
     rank key, so #2 can legitimately show a bigger multiplier than #1 — two different
     axes, kept honest rather than hidden.
  2. **Bar to beat** — `topWins[9].amount`, shown only once the case is full (before
     that every win enters, so there is no bar).
  3. **Drought counter** — `currentSpins − topWins[0].spinIndex`, "N spins since your
     last trophy". A nerdier stat; lives near the numbers, not on the hero card, and is
     the first to cut if the 375px sheet feels crowded.
  4. **Locked-plinth empty state** — ten outlined slots that fill in, not a single "no
     wins yet". The biggest "trophy case, not stat row" lever in the set; real markup +
     CSS rather than a one-liner, but small.
- **Rename the sheet (SPEC-076).** "Session stats" is a misnomer — the blob is
  `localStorage` and survives reloads; trophies make that obvious. Rename the sheet
  title, the header trigger `aria-label`/`title`, the "Clear stats" button, and the
  clear note to match. No behavior change; the storage key `zany:stats` stays (renaming
  a persisted key *would* orphan history — exactly what this project refuses to do).
- **Highlight must not be color-alone.** Lit cells get a second channel (scale, ring,
  or opacity contrast against dimmed neighbours) so the distinction survives both
  color-vision differences and a small phone screen.
- **The 375px question is the stage's main risk.** A thumbnail 5×3 emoji grid may be
  illegible on a real phone. Fallback already agreed: rows #4–#10 show
  amount + machine + tier only until expanded. **This is settled on a real iPhone in
  Safari, not in the Chromium preview** — a preview screenshot is not evidence here,
  and the ship note must say what to check rather than claim it was verified.
- **Reuse, don't fork.** The card/row treatment should read as the same design system
  as `PaytableSheet`/`StatsSheet`; tier framing should reuse the existing
  `--color-win-small` / `--color-win-big` / `--color-jackpot` tokens rather than
  introducing new ones.
- **Celebration badge is additive.** It renders inside the existing celebration
  component's lifecycle; it must not extend the celebration's duration or interfere
  with auto-spin's inter-spin timing.

## Dependencies

### Depends on
- **STAGE-014** — the stored `topWins`; nothing renders without it.
- **STAGE-012 / DEC-021 (shipped)** — per-machine `symbolDisplay`, which is what makes a
  saved grid renderable in the right creatures.
- **STAGE-009 (shipped)** — `StatsSheet`, `StatsProvider`, `stats.css`, the sheet idiom.
- **DEC-010** — design tokens, no raw hex.

### Enables
- A machine-aware `JackpotMoment` (PROJ-002's deferred cosmetic) — same component.
- Any future all-time records surface.

## Stage-Level Reflection

*Filled in when status moves to shipped.*

- **Did we deliver the outcome in "What This Stage Is"?** <yes/no + notes>
- **How many specs did it actually take?** <number vs. plan>
- **What changed between starting and shipping?** <one sentence>
- **Lessons that should update AGENTS.md, templates, or constraints?**
  - <one-line updates>
- **Should any spec-level reflections be promoted to stage-level lessons?**
  - <one-line items>
