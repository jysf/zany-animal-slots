---
# Maps to ContextCore task.* semantic conventions.
# This variant assumes Claude plays every role. The context normally
# in a separate handoff doc lives in the ## Implementation Context
# section below.

task:
  id: SPEC-073
  type: story                      # epic | story | task | bug | chore
  cycle: ship  # frame | design | build | verify | ship
  blocked: false
  priority: medium
  complexity: M                    # S | M | L  (L means split it)

project:
  id: PROJ-003
  stage: STAGE-014
repo:
  id: animal-slots

agents:
  architect: claude-opus-4-8       # design/frame: Opus (judgement-heavy). See AGENTS §8.
  implementer: claude-sonnet-4-6   # build/verify: Sonnet (execution against the spec)
  created_at: 2026-07-23

references:
  decisions:
    - DEC-001   # engine-no-dom: the trophy is assembled from SpinResult fields; engine untouched
    - DEC-005   # no backend: topWins persists in the same localStorage blob, best-effort, never throws
    - DEC-020   # the session-stats model this spec extends (recordSpin, biggestWin, versioned storage)
    - DEC-024   # THIS spec authors it: the trophy model + additive-schema-evolution rule
  constraints:
    - engine-no-dom
  related_specs:
    - SPEC-054  # the sessionStats model + safe versioned storage this extends
    - SPEC-074  # the record-seam widening that will FEED grid + lineWins into these reducers (next spec)

value_link: >-
  The durable keystone of the trophy case: a pure, tested TopWin model + a forward-compatible
  read path that lets the stats blob gain a field without discarding a byte of existing history.
  Everything visible in STAGE-015 renders what this spec persists.

cost:
  sessions:
    - cycle: design
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: null   # design cycle runs on the orchestrator's main Opus loop — not separately metered
      recorded_at: 2026-07-23
      note: >-
        Design authored on the main Opus loop (un-metered). Pure model + storage spec — the Failing
        Tests carry concrete pinned values computed by hand from the reducer semantics (insert on
        strictly-greater, cap 10, sort desc, spinIndex = pre-increment spins). Authored DEC-024 (the
        trophy model + additive-schema-evolution rule) as part of this design. Build is transcription
        of the drop-in code in ## Notes.
    - cycle: build
      interface: claude-code
      model: claude-sonnet-4-6
      tokens_total: 99514    # from Agent result subagent_tokens
      estimated_usd: 0.66    # 99514 tok × $6.6/M (Sonnet list, no cache discount) — order-of-magnitude
      duration_minutes: 5.9  # 354440 ms
      recorded_at: 2026-07-23
      note: >-
        Transcribed the spec's drop-in code into sessionStats.ts/statsStorage.ts and added the
        Failing Tests to both *.test.ts files. One deviation: tier 'high' (used in a few Failing-Tests
        prose examples) isn't a valid WinTier ('none'|'small'|'big'|'jackpot') — substituted 'small'
        or 'jackpot' where a non-'big' tier was needed. Full gate green; src/engine/** diff empty.
    - cycle: verify
      interface: claude-code
      model: claude-sonnet-5
      tokens_total: 92869      # from Agent result subagent_tokens
      estimated_usd: 0.61      # 92869 tok × $6.6/M (Sonnet list, no cache discount) — order-of-magnitude
      duration_minutes: 104.2  # 6252823 ms
      recorded_at: 2026-07-23
      note: >-
        Cold review. All 13 ACs verified against code, ticked. All 5 guard-mutations broke
        their target test and reverted clean (cap-slice off-by-one also broke the tie test,
        and reversed-sort also broke the biggestWin-agreement test — expected blast radius,
        not fake tests). Confirmed the pre-topWins storage test uses a genuine literal old-shape
        object (no re-serialized emptyStats()). Scope clean: only src/stats/** + spec/decision
        docs changed; src/engine/** and src/ui/** untouched; STATS_VERSION=1; biggestWin intact.
        No .only/.skip/xit/todo. 'high'-tier deviation confirmed correct (not a valid WinTier).
        Full gate green (typecheck, test, build, validate, cost-audit); `npx eslint
        "src/**/*.{ts,tsx}"` exits 0; confirmed `just lint`'s 1458 errors originate entirely
        from git-ignored `.claude/worktrees/**`. Zero defects. One minor test-quality note (not
        blocking): the "normalizes a non-array topWins" test builds its blob from
        `{...emptyStats(), topWins: 'nope'}`, so its spins/series assertions can't distinguish
        "normalize topWins only" from "reset the whole record" — flagged for a future spec, not
        fixed here (out of scope for a verify cycle).
    - cycle: ship
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      recorded_at: 2026-07-23
      note: >-
        main-loop, not separately metered (AGENTS §4); ship cycle. Acted on verify's non-blocking
        flag rather than deferring it: tightened the "normalizes a non-array topWins" storage test
        to seed NON-DEFAULT spins/winningSpins/totalWagered/totalWon/cashIns/series, so a readStats()
        that wrongly reset the whole record now fails it (confirmed by re-running verify's
        guard-mutation #5 — the test previously passed under that mutation, now breaks). A weak test
        in the one spec whose entire thesis is "do not reset the record" was worth fixing in place.
        Then full gate, PR + CI-poll + squash-merge, archive, brag, cost bookkeeping.
  totals:
    tokens_total: 192383   # build 99514 + verify 92869 (design/ship un-metered main-loop)
    estimated_usd: 1.27    # build 0.66 + verify 0.61
    session_count: 4       # design, build, verify, ship
---

# SPEC-073: Trophy model and forward-compatible persisted schema

## Context

STAGE-014 is the durable half of the trophy case (PROJ-003). Today `recordSpin`
(`src/stats/sessionStats.ts`, SPEC-054/DEC-020) keeps a `biggestWin` — an *amount*
with a machine and tier, but **no reels**. The trophy case needs the actual `grid` and
`lineWins` so a win can be re-rendered later. This spec extends the session-stats model
with a bounded, sorted list of the session's best wins (`topWins`) that stores exactly
that, and — the riskier half — widens the storage read path so a `zany:stats` blob
written by *today's* build (which has no `topWins` key at all) still loads with every
existing field intact, normalizing the missing field to `[]` rather than being
discarded.

This is first in STAGE-014's backlog (model → record seam). It ships **no UI**:
SPEC-074 wires the seam that feeds it real data, and STAGE-015 renders it.

## Goal

Add a `TopWin` record and a bounded (cap 10), amount-descending `topWins: TopWin[]` to
`SessionStats`, inserted on a strictly-greater amount, and make `readStats()`/`isValid()`
tolerate and normalize a blob with a missing `topWins` **without bumping
`STATS_VERSION`** — so existing player history is preserved, not reset.

## Inputs

- **Files to read:**
  - `src/stats/sessionStats.ts` — the model this extends (recordSpin, biggestWin, emptyStats)
  - `src/stats/statsStorage.ts` — the safe versioned read/write path this widens
  - `src/stats/sessionStats.test.ts`, `src/stats/statsStorage.test.ts` — the test idiom to match
  - `src/engine/index.ts` — the `Grid`, `LineWin`, `WinTier`, `BetLevel` types (read-only)
- **Related code paths:** `src/stats/`
- **External APIs:** none.

## Outputs

- **Files modified:**
  - `src/stats/sessionStats.ts` — `TopWin` interface, `TOP_WINS_CAP = 10`, `topWins` on
    `SessionStats`, `insertTopWin` reducer, `emptyStats()` seeds `topWins: []`,
    `recordSpin` widened to accept `grid` + `lineWins` and update `topWins`.
  - `src/stats/statsStorage.ts` — `isValid()` accepts a blob with **or without**
    `topWins`; `readStats()` normalizes a missing/invalid `topWins` to `[]`.
  - `src/stats/sessionStats.test.ts`, `src/stats/statsStorage.test.ts` — new tests.
- **Files created:**
  - `decisions/DEC-024-trophy-model.md` — authored during design (already in tree).
- **New exports:** `TopWin`, `TOP_WINS_CAP`, `insertTopWin` (from `sessionStats.ts`).
- **Database changes:** none — same `zany:stats` localStorage key, same `STATS_VERSION`.

## Acceptance Criteria

- [x] `emptyStats()` returns `topWins: []` and is otherwise unchanged (still version 1).
- [x] `STATS_VERSION` is still `1`.
- [x] `recordSpin` accepts `grid` + `lineWins` on its input and records a `TopWin`
      `{ amount, machineId, tier, bet, grid, lineWins, spinIndex }` for a winning spin.
- [x] `spinIndex` on a recorded trophy equals the spin's **1-based ordinal** (the value
      of `stats.spins` *after* this spin — i.e. the 1st spin recorded is `spinIndex: 1`).
- [x] A losing spin (`totalWin === 0`) adds no trophy.
- [x] `topWins` is sorted by `amount` descending and capped at `TOP_WINS_CAP` (10).
- [x] Insert is **strictly-greater**: a win whose amount ties the current smallest entry
      does not displace it once the list is full; among equal amounts the earlier win
      keeps the higher rank.
- [x] `topWins[0]?.amount === biggestWin?.amount` after any sequence of recorded spins.
- [x] `recordSpin` remains immutable (does not mutate its input or nested `topWins`).
- [x] `readStats()` on a blob **missing** `topWins` returns every existing field intact
      with `topWins: []` (no discard, no version bump).
- [x] `readStats()` on a blob whose `topWins` is present-but-not-an-array normalizes it
      to `[]` while keeping the rest of the record.
- [x] `writeStats` → `readStats` round-trips a record that has trophies.
- [x] `src/engine/**` diff is empty; no new dependency.

## Failing Tests

Written during **design**, BEFORE build. Build makes these pass. Add to the existing
`src/stats/sessionStats.test.ts` and `src/stats/statsStorage.test.ts`.

- **`src/stats/sessionStats.test.ts`**
  - `"emptyStats seeds topWins to an empty array"` — asserts `emptyStats().topWins` is `[]`.
  - `"recordSpin records a TopWin for a winning spin with the full grid, lineWins, and 1-based spinIndex"`
    — record one `{ totalWin: 50, bet: 10, tier: 'big', grid: G, lineWins: LW }` on
    `'ocean'`; assert `topWins.length === 1` and the entry equals
    `{ amount: 50, machineId: 'ocean', tier: 'big', bet: 10, grid: G, lineWins: LW, spinIndex: 1 }`.
  - `"recordSpin records no TopWin for a losing spin"` — a `{ totalWin: 0 }` spin leaves
    `topWins` empty but still increments `spins` (so the *next* win has `spinIndex: 2`).
  - `"topWins is sorted by amount descending"` — record wins 50, 500, 200 (any bets);
    assert amounts are `[500, 200, 50]`.
  - `"topWins is capped at TOP_WINS_CAP, keeping the largest"` — record 12 distinct
    increasing wins (10,20,…,120); assert `topWins.length === TOP_WINS_CAP` and the
    smallest kept amount is `30` (10 and 20 dropped).
  - `"a tie does not displace an existing entry once full"` — fill the list with 10
    distinct wins whose smallest is `X`, then record another win of exactly `X`; assert
    length stays 10 and the original `X` entry (its `spinIndex`) is retained, not the newcomer.
  - `"topWins[0] agrees with biggestWin"` — after a mixed sequence, assert
    `topWins[0].amount === biggestWin!.amount` and same machineId + tier.
  - `"recordSpin does not mutate the input's topWins array"` — snapshot `before.topWins`
    (length + reference), record a win, assert `before.topWins` unchanged and
    `after.topWins !== before.topWins`.
- **`src/stats/statsStorage.test.ts`**
  - `"readStats preserves a pre-topWins blob and defaults topWins to []"` — write a
    **literal** object of the *old* shape (version 1, spins/winningSpins/totalWagered/
    totalWon/biggestWin/cashIns/series, **no `topWins` key**) via
    `localStorage.setItem(STATS_KEY, JSON.stringify(oldBlob))`; assert `readStats()`
    deep-equals `{ ...oldBlob, topWins: [] }` — every original field bit-for-bit, plus
    the defaulted array. (Use a literal, NOT a re-serialized `emptyStats()`.)
  - `"readStats normalizes a non-array topWins to []"` — write a valid blob whose
    `topWins` is `"nope"`; assert the result has `topWins: []` and the other fields intact.
  - `"writeStats round-trips a record carrying trophies"` — build stats with 2 trophies
    via `recordSpin`, `writeStats`, then `readStats` deep-equals it.
  - `"a version mismatch still discards (unchanged behavior)"` — a blob with
    `version: 999` still returns `emptyStats()`.

## Implementation Context

*Read this section (and the files it points to) before starting the build cycle.*

### Decisions that apply

- `DEC-024` — **the trophy model + additive-schema-evolution rule** (authored by this
  spec). Fixes cap = 10, strictly-greater insert, `spinIndex` = 1-based ordinal, and the
  rule: a purely *additive* persisted field normalizes on read instead of bumping
  `STATS_VERSION`; bump only when an existing field changes meaning/type or disappears.
- `DEC-020` — the session-stats model this extends. `biggestWin` stays; `topWins[0]`
  becomes the richer superset. Do not remove `biggestWin` (removing a field IS a
  breaking change — the opposite of this spec's point).
- `DEC-001` — engine-no-dom: `TopWin` stores `Grid`/`LineWin[]`/`WinTier`/`BetLevel`,
  all plain engine data types imported from `src/engine/index`. No engine change.
- `DEC-005` — no backend: same localStorage blob, guarded, never throws.

### Constraints that apply

- `engine-no-dom` — `src/stats/**` is pure TS; it imports engine *types* only, never the
  DOM or React. `src/engine/**` must not change (verify with an empty diff).

### Prior related work

- `SPEC-054` (shipped) — authored `sessionStats.ts` + `statsStorage.ts`; this is a
  direct, in-place extension of both. Match its immutable-reducer style and test idiom.

### Out of scope (for this spec specifically)

- The record-seam call site in `useSlotMachine.ts` — that is **SPEC-074**. This spec
  only widens the *reducer signature* and proves it with unit tests; it does not touch
  any UI file. (The existing `recordSpin` call in `useSlotMachine.ts` will not typecheck
  once `grid`/`lineWins` become required — see Notes for how to keep the tree green.)
- Any rendering of `topWins`. That is STAGE-015.
- Any change to `series`, `SERIES_CAP`, cash-in semantics, or analytics.

## Notes for the Implementer

**This spec is mostly transcription — the drop-in code is below. Match SPEC-054's style.**

### Keeping the whole tree green (important — read first)

Making `grid` + `lineWins` **required** on `SpinRecordInput` would break the existing
`recordSpin(...)` call in `src/ui/useSlotMachine.ts` (it passes only `{ totalWin, bet,
tier }`), and that file is out of scope here (it's SPEC-074). To keep `just typecheck`
and the full gate green at the end of *this* spec while still not touching UES:

- Make `grid` and `lineWins` **optional** on `SpinRecordInput` for now
  (`grid?: Grid; lineWins?: LineWin[]`). When absent, `recordSpin` records the counters
  and `biggestWin` exactly as today but adds **no** trophy (a trophy needs a grid).
- SPEC-074 then passes them from the outcome and flips the seam to always provide them.
- The unit tests in *this* spec always pass a grid, so they exercise the trophy path.

This keeps the change purely additive and the tree compiling. Do **not** edit
`useSlotMachine.ts` in this spec.

### `src/stats/sessionStats.ts` — drop-in additions

Add the imports for `Grid` and `LineWin` (already importing `SpinResult`, `WinTier`,
`BetLevel` from `../engine`):

```ts
import type { SpinResult, WinTier, BetLevel, Grid, LineWin } from '../engine';
```

Add near `SERIES_CAP`:

```ts
/** Trophy-case size: keep the N largest single-spin wins of the session (DEC-024). */
export const TOP_WINS_CAP = 10;

/** A saved winning spin — enough to re-render the reels later (DEC-024). */
export interface TopWin {
  amount: number;
  machineId: string;
  tier: WinTier;
  bet: BetLevel;
  /** The 5×3 grid this win landed on — re-rendered in the originating machine's symbols. */
  grid: Grid;
  /** The winning lines, so the trophy can light the same cells. */
  lineWins: LineWin[];
  /** 1-based ordinal of the spin that produced this win (stats.spins after the spin). */
  spinIndex: number;
}
```

Widen `SpinRecordInput` (keep the existing Pick, add the two optional fields):

```ts
export type SpinRecordInput = Pick<SpinResult, 'totalWin' | 'bet' | 'tier'> & {
  grid?: Grid;
  lineWins?: LineWin[];
};
```

Add `topWins: TopWin[]` to the `SessionStats` interface (after `series`), and seed it in
`emptyStats()`:

```ts
    series: [],
    topWins: [],
```

Add the pure insert reducer:

```ts
/**
 * Insert a candidate into a sorted-desc, capped trophy list (DEC-024). Immutable.
 * Strictly-greater semantics: the candidate is kept only if it beats the smallest
 * retained entry (or the list isn't full yet). Ties never displace — the earlier win
 * keeps the higher rank, matching biggestWin. Stable within equal amounts.
 */
export function insertTopWin(topWins: TopWin[], candidate: TopWin): TopWin[] {
  const next = [...topWins, candidate].sort((a, b) => b.amount - a.amount);
  return next.slice(0, TOP_WINS_CAP);
}
```

> Why this is correct for the tie rule: `Array.prototype.sort` is stable, and we append
> the candidate at the **end** before sorting, so on an amount tie the pre-existing
> entries sort ahead of the newcomer. When the list is already full and the newcomer
> ties the 10th place, the newcomer lands at index 10 and is sliced off. A newcomer that
> is strictly greater than the 10th sorts above it and the old 10th is sliced. ✔

In `recordSpin`, after computing `biggestWin` and `series`, compute the new spin ordinal
and conditionally add a trophy:

```ts
  const spins = stats.spins + 1;
  const topWins =
    input.totalWin > 0 && input.grid
      ? insertTopWin(stats.topWins, {
          amount: input.totalWin,
          machineId,
          tier: input.tier,
          bet: input.bet,
          grid: input.grid,
          lineWins: input.lineWins ?? [],
          spinIndex: spins,
        })
      : stats.topWins;
  return {
    ...stats,
    spins,
    winningSpins: stats.winningSpins + (isWin ? 1 : 0),
    totalWagered,
    totalWon,
    biggestWin,
    series,
    topWins,
  };
```

(Replace the existing `spins: stats.spins + 1` with the hoisted `spins` const so
`spinIndex` and the return use the same value.)

`recordCashIn` and `deriveMetrics` need no change (cash-in spreads `...stats`, which now
carries `topWins` unchanged — good).

### `src/stats/statsStorage.ts` — widen validation + normalize

The key subtlety: a **missing** `topWins` must NOT fail validation (old blobs), and
`readStats` must return the record with `topWins` defaulted, **not** `emptyStats()`.

```ts
function isValid(v: unknown): v is Omit<SessionStats, 'topWins'> & { topWins?: unknown } {
  if (typeof v !== 'object' || v === null) return false;
  const s = v as Record<string, unknown>;
  return (
    s.version === STATS_VERSION &&
    typeof s.spins === 'number' &&
    typeof s.winningSpins === 'number' &&
    typeof s.totalWagered === 'number' &&
    typeof s.totalWon === 'number' &&
    typeof s.cashIns === 'number' &&
    Array.isArray(s.series) &&
    (s.biggestWin === null || typeof s.biggestWin === 'object')
    // NOTE: topWins is intentionally NOT required — an old blob has none.
  );
}

export function readStats(): SessionStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (raw === null) return emptyStats();
    const parsed: unknown = JSON.parse(raw);
    if (!isValid(parsed)) return emptyStats();
    // Additive-field normalization (DEC-024): default a missing/invalid topWins to []
    // rather than discarding the whole record. No version bump.
    const topWins = Array.isArray((parsed as { topWins?: unknown }).topWins)
      ? ((parsed as { topWins: TopWin[] }).topWins)
      : [];
    return { ...(parsed as SessionStats), topWins };
  } catch {
    return emptyStats();
  }
}
```

Import `TopWin` alongside the existing type import:

```ts
import { emptyStats, STATS_VERSION, type SessionStats, type TopWin } from './sessionStats';
```

### Adversarial guard-mutations for verify (each should break exactly one new test)

1. `insertTopWin` slice `TOP_WINS_CAP` → `TOP_WINS_CAP + 1` ⇒ breaks the cap test.
2. `sort((a,b) => b.amount - a.amount)` → `a.amount - b.amount` ⇒ breaks the sort test.
3. Append candidate at the **front** (`[candidate, ...topWins]`) ⇒ breaks the tie test.
4. `input.totalWin > 0` → `>= 0` ⇒ breaks the "no trophy for a loss" test.
5. In `readStats`, return `emptyStats()` when `topWins` is missing ⇒ breaks the
   preserve-pre-topWins-blob test.

### Do NOT

- Do not bump `STATS_VERSION`.
- Do not remove or rename `biggestWin`.
- Do not touch `src/ui/**` or `src/engine/**`.
- Do not add a dependency.

---

## Build Completion

*Filled in at the end of the **build** cycle, before advancing to verify.*

- **Branch:** `feat/spec-073-trophy-model`
- **PR (if applicable):** none yet — orchestrator opens it.
- **All acceptance criteria met?** Yes. `emptyStats()` seeds `topWins: []`; `STATS_VERSION`
  stays `1`; `recordSpin` accepts optional `grid`/`lineWins` and records a `TopWin` with
  1-based `spinIndex` for winning spins only; `topWins` is sorted desc, capped at 10,
  strictly-greater insert (verified tie-does-not-displace); `topWins[0].amount` agrees
  with `biggestWin.amount`; `recordSpin` is immutable (input's `topWins` array unchanged,
  same reference; output is a new array); `readStats()` normalizes a missing or
  non-array `topWins` to `[]` without discarding the rest of the blob; `writeStats` →
  `readStats` round-trips a record with trophies; a version mismatch still discards
  (unchanged). `src/engine/**` diff is empty (`git diff --stat main..HEAD -- src/engine/`
  produced no output); no new dependency was added.
- **New decisions emitted:** none — this build only transcribes DEC-024 (authored during
  design) into code.
- **Deviations from spec:** The Failing Tests' prose examples use tier `'high'` for a
  couple of non-`'big'`/`'jackpot'` example wins, but `WinTier` (from `src/engine/tiers.ts`)
  is `'none' | 'small' | 'big' | 'jackpot'` — there is no `'high'` tier. Substituted
  `'small'` (or `'jackpot'` where a distinctly-largest win was wanted) in those tests;
  behavior asserted (sort order, cap, tie rule, biggestWin agreement) is unaffected by
  which valid tier label is used. Everything else in `## Notes for the Implementer` was
  transcribed as given.
- **Follow-up work identified:** none beyond the already-scheduled SPEC-074 (record-seam
  widening in `useSlotMachine.ts`, out of scope here).

### Build-phase reflection (3 questions, short answers)

1. **What was unclear in the spec that slowed you down?** — Only the `tier: 'high'`
   mismatch above; the drop-in code itself required no interpretation, just placement
   (hoisting `spins` before the trophy computation, matching import order/style).
2. **Was there a constraint or decision that should have been listed but wasn't?** — No;
   `DEC-024`, `DEC-020`, `DEC-001`, and `engine-no-dom` fully covered the surface touched.
   It might be worth a repo-wide note (not just this spec) that `WinTier`'s valid values
   should be quoted verbatim in specs to avoid the copy-paste drift seen here.
3. **If you did this task again, what would you do differently?** — Nothing structural;
   would just grep `WinTier`'s definition before transcribing example test data that uses
   tier literals, to catch the `'high'` mismatch before writing the tests instead of at
   typecheck time.

---

## Reflection (Ship)

1. **What would I do differently next time?** — Two things. (a) The spec's Failing-Tests
   prose invented a tier literal (`'high'`) that doesn't exist in `WinTier`; when a design
   pins example data against a union type, it should quote the union's actual members
   rather than plausible-sounding ones — the build caught it at typecheck, but it cost a
   round-trip. (b) More importantly: the spec specified *what* the forward-compat test
   should assert but not *what the fixture must not be*. The build's non-array-normalization
   test seeded its blob from `emptyStats()`, whose zeroes made the "record survived"
   assertions unfalsifiable — verify caught it only by mutation, not by reading. A test
   that guards against "the record got reset" must seed non-default values, and the spec
   should have said so explicitly. It now does for the literal-fixture test, but not for
   its sibling; that asymmetry is what let the weak test through.

2. **Does any template, constraint, or decision need updating?** — No template change, but
   a reusable lesson worth carrying: **for any test whose purpose is "X was preserved",
   the fixture must make preservation falsifiable** (non-default values), otherwise the
   test passes under the exact bug it exists to catch. This generalizes past this repo.
   DEC-024 already records the additive-schema rule itself and needs no amendment.
   Separately: `just lint` is currently unusable locally (1458 errors, all from git-ignored
   `.claude/worktrees/**` + `audio-spike.html`); CI is unaffected, but every cycle now pays
   a tax re-establishing that. Worth cleaning up the stale worktrees out-of-band.

3. **Is there a follow-up spec I should write now before I forget?** — No new spec. The one
   flagged gap (the weak normalization test) was fixed in this ship rather than deferred,
   and re-checked against verify's guard-mutation #5 to confirm it now has teeth. SPEC-074
   (the record seam) already exists in the backlog and is the direct next step: it flips
   `grid`/`lineWins` from optional-for-compat to actually supplied at the call site.
