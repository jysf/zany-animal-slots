---
# Maps to ContextCore insight.* semantic conventions.

insight:
  id: DEC-024
  type: decision
  confidence: 0.88
  audience:
    - developer
    - agent

agent:
  id: claude-opus-4-8
  session_id: null

project:
  id: PROJ-003
repo:
  id: animal-slots

created_at: 2026-07-23
supersedes: null
superseded_by: null

# Governs the persisted stats model + its safe read path.
affected_scope:
  - src/stats/sessionStats.ts
  - src/stats/statsStorage.ts

tags:
  - stats
  - persistence
  - schema-evolution
  - trophy-case
---

# DEC-024: Trophy model and additive-schema evolution

## Decision

The session-stats blob gains a bounded, amount-descending `topWins: TopWin[]` (cap
**10**), where a `TopWin` = `{ amount, machineId, tier, bet, grid, lineWins, spinIndex }`
and a new win is inserted only on a **strictly-greater** amount; and — the reusable half
— a purely *additive* field on the persisted `zany:stats` blob is **normalized on read**
(missing ⇒ default) rather than triggering a `STATS_VERSION` bump. `STATS_VERSION` stays
`1`.

## Context

PROJ-003 (the trophy case) needs to re-render a player's best wins as real reels, which
means persisting each win's `grid` + `lineWins` — data the engine already computes and
`recordSpin` currently discards, keeping only a `biggestWin` amount (DEC-020). Adding
that persisted data touches a `localStorage` blob that holds **real, unrecoverable player
history** (spins, biggest win, winnings-over-time series, cash-ins). The user's hard
constraint on this wave: *do not wipe existing stats* — adding a field must not make
`readStats()` discard history.

`statsStorage.readStats()` (SPEC-054) discards a blob on any `isValid()` failure and on a
`STATS_VERSION` mismatch. The naïve "add a field" move — require `topWins` in `isValid()`
and/or bump the version — would reset every existing player. The decision is how to grow
the schema without that.

## Alternatives Considered

- **Option A: Bump `STATS_VERSION` to 2.**
  - What it is: version the blob shape; `readStats` discards v1 on load.
  - Why rejected: destroys the exact history the user told us to preserve, to gain
    nothing — the old data is still perfectly readable. Versioning exists to discard an
    *unreadable* blob; an additive field leaves it readable.

- **Option B: Require `topWins` in `isValid()`, no version bump.**
  - What it is: add `Array.isArray(s.topWins)` to the validator.
  - Why rejected: an old blob (no `topWins`) fails validation and is silently replaced by
    `emptyStats()` — same history loss as A, just quieter and harder to notice.

- **Option C (chosen): Additive field, normalize on read.**
  - What it is: `isValid()` does **not** require `topWins`; `readStats()` returns the
    validated record with `topWins` defaulted to `[]` when missing or malformed. No
    version bump. Insert is strictly-greater and capped at 10; `spinIndex` is the spin's
    1-based ordinal (no clock — keeps reducers deterministic under test).
  - Why selected: preserves all prior history by construction, keeps the change purely
    additive, and yields a rule reusable for the next additive field.

## Consequences

- **Positive:** Existing players keep their entire record; `topWins` simply starts empty
  and fills as they win. The rule ("additive ⇒ normalize on read; bump only when an
  existing field changes meaning/type or disappears") is now a documented pattern for
  this repo's persisted blobs.
- **Positive:** `biggestWin` is retained and is provably consistent with `topWins[0]`
  (both use strictly-greater), so nothing that reads `biggestWin` breaks.
- **Negative:** The blob grows ~5–6 KB at 10 trophies (each carries a 15-cell grid + up
  to 20 line wins). Comfortable against a ~5 MB origin quota, and `writeStats` already
  swallows quota failures (DEC-005) — but it is not free, which is why N is bounded.
- **Negative:** `isValid()` no longer fully describes the current shape (it tolerates a
  missing field by design), so the "is this blob valid" question and the "is this blob
  current" question have diverged — a reader must know normalization happens downstream.
- **Neutral:** `spinIndex` is display-only; it is not used for ordering (amount is).

## Validation

Right if: an existing player's stats survive the upgrade with `topWins: []` and no other
change (asserted by a literal pre-`topWins` fixture in `statsStorage.test.ts`), and
`topWins[0].amount === biggestWin.amount` holds across arbitrary spin sequences. Revisit
if a future field is *not* purely additive (an existing field changes type/meaning) —
that is exactly the case this rule says must bump the version instead.

## References

- Related specs: SPEC-073 (authors + implements), SPEC-074 (feeds the seam)
- Related decisions: DEC-020 (session-stats model, extended), DEC-001 (engine-no-dom),
  DEC-005 (no backend / never throws), DEC-021 (per-machine identity — why the grid is
  re-renderable in the right creatures downstream)
- Constraints: engine-no-dom
