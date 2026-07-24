---
# Maps to ContextCore epic-level conventions.
# A Stage is a coherent chunk of work within a Project.

stage:
  id: STAGE-014
  status: active                  # proposed | active | shipped | cancelled | on_hold
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
    The half of the project thesis that says the engine already computes everything a
    trophy needs and the app simply throws it away — this stage stops the discard and
    makes a win durable, without changing a pixel.
  delivers:
    - "A bounded, sorted top-10 record of the session's best wins, persisted across reloads."
    - "A stats blob that gains a field without discarding a single byte of existing history."
    - "The full spin outcome (grid + lineWins) reaching the stats layer, where before only the amount did."
  explicitly_does_not:
    - "Show anything. This stage is deliberately invisible in the running app — the case is STAGE-015."
    - "Change the engine, the spin flow, the celebration, or any existing displayed metric."
    - "Bump STATS_VERSION or migrate anything. Additive-and-normalize is the whole point."
---

# STAGE-014: Trophy Data Model + Record Seam

## What This Stage Is

The durable half of the trophy case. Today `useSlotMachine` holds a complete
`SpinResult` — `grid`, `lineWins`, `totalWin`, `tier`, `bet` — and passes three of
those fields to `recordSpin`, dropping the reels on the floor. This stage widens that
seam and gives the stats model somewhere to put them: a `TopWin` record and a bounded,
sorted `topWins` array on `SessionStats`, capped at 10, inserted on a strictly-greater
amount. The load path is widened in the same breath so that a stats blob written by
today's build — with no `topWins` at all — still loads with its spins, biggest win,
series, and cash-ins fully intact, normalizing the missing field to `[]` rather than
failing validation and resetting the record. When this stage ships, the app looks
exactly the same and has been quietly collecting trophies.

## Why Now

It is the precondition for everything visible in STAGE-015, and it carries the one
genuinely risky change in the project: touching a persisted schema that holds real,
unrecoverable user history. Isolating it in its own stage means the schema-safety work
gets reviewed on its own terms instead of being buried under a CSS-heavy UI diff, and
means a regression there is caught before any of the fun work builds on top of it. It
also means STAGE-015 opens against a store that already has trophies in it during
manual testing, rather than an empty one.

## Success Criteria

- A pre-wave `zany:stats` blob (no `topWins` key) round-trips through `readStats()`
  with **every existing field preserved** and `topWins === []`. Asserted by a test
  using a literal fixture of today's shape, not a re-serialized current object.
- `STATS_VERSION` is unchanged at `1`.
- Ten wins in, ten trophies out, ordered by amount descending; an eleventh win larger
  than the smallest displaces it and the array stays at 10.
- A win equal to an existing entry does **not** displace it (earliest keeps the rank).
- A losing spin (`totalWin === 0`) never creates a trophy.
- `topWins[0]?.amount === biggestWin?.amount` holds after any sequence of recorded
  spins.
- `src/engine/**` diff is empty.
- `just typecheck && just lint && just test && just build && just validate &&
  just cost-audit` all green.

## Scope

### In scope
- `TopWin` type + `topWins` field on `SessionStats`, `TOP_WINS_CAP = 10`, and
  `emptyStats()` seeding it to `[]`.
- The insert/cap reducer, folded into `recordSpin` in `src/stats/sessionStats.ts`.
- `SpinRecordInput` widened to include `grid` and `lineWins`.
- `isValid()` + `readStats()` in `src/stats/statsStorage.ts`: accept a blob with or
  without `topWins`, normalize to `[]`, reject a malformed one without discarding the
  rest of the record.
- The `recordSpin(...)` call site in `src/ui/useSlotMachine.ts` (~line 222) passing
  `outcome.grid` and `outcome.lineWins`.
- The DEC recording the trophy model (extends DEC-020) and the additive-schema rule.

### Explicitly out of scope
- Any UI. No component renders `topWins` in this stage.
- Removing or changing `biggestWin` — it stays, and is asserted consistent with
  `topWins[0]`.
- Any change to `series`, `SERIES_CAP`, cash-in semantics, or the analytics `track()`
  payload (no new event types — STAGE-011 Tier 2 stays gated).
- `src/ui/audio/**` — untouched.

## Spec Backlog

- [x] SPEC-073 (shipped on 2026-07-23) — Trophy model + forward-compatible persisted
      schema: `TopWin`, `topWins` (cap 10, strictly-greater insert), widened
      `SpinRecordInput`, and a `readStats()`/`isValid()` that tolerates and normalizes a
      missing `topWins` without a version bump. Emitted **DEC-024**. 0 defects.
- [x] SPEC-074 (shipped on 2026-07-23) — Record-seam widening: passes `grid` + `lineWins`
      from the resolved outcome through `recordSpin` at the `useSlotMachine` call site, and
      tightens them to REQUIRED so a future call site that forgets them is a compile error.
      Hook-level test proven to fail when the seam is disconnected. 0 defects.

**Count:** 2 shipped / 0 active / 0 pending — **backlog complete**

## Design Notes

- **Why no version bump.** `STATS_VERSION` exists to let `statsStorage` *discard* a
  blob it can no longer read. A purely additive field is still readable, so bumping
  would destroy history to gain nothing — the exact outcome the user ruled out. The
  rule to record in the DEC: bump only when an existing field changes meaning, type,
  or disappears; normalize on read for anything additive.
- **`spinIndex`, not a timestamp.** The trophy stores `stats.spins` at record time
  ("spin #143"). It is PII-free, needs no clock, and keeps the model deterministic
  under test — a `Date.now()` in a reducer would make every test time-dependent.
- **Insert is strictly-greater**, matching `biggestWin`'s existing tie rule, so the two
  can never disagree about who is first.
- **Storage cost.** 10 trophies × (15 symbol ids + up to 20 line wins) lands around
  5–6 KB of JSON — comfortable against a ~5 MB origin quota, and `writeStats` already
  swallows quota failures rather than throwing (DEC-005).
- **The seam is the only UI-layer change,** and it is one call site: everything else in
  this stage is pure model + storage, unit-testable with no DOM.

## Dependencies

### Depends on
- **STAGE-009 (shipped)** — `SessionStats`, `recordSpin`, `statsStorage`, `StatsProvider`,
  and DEC-020, all of which this extends rather than replaces.
- **PROJ-001 (shipped)** — the `SpinResult` contract (`grid`, `lineWins`) consumed
  read-only; no engine change (DEC-001).

### Enables
- **STAGE-015** — the trophy case has nothing to render without this.

## Stage-Level Reflection

*Filled in when status moves to shipped.*

- **Did we deliver the outcome in "What This Stage Is"?** <yes/no + notes>
- **How many specs did it actually take?** <number vs. plan>
- **What changed between starting and shipping?** <one sentence>
- **Lessons that should update AGENTS.md, templates, or constraints?**
  - <one-line updates>
- **Should any spec-level reflections be promoted to stage-level lessons?**
  - <one-line items>
