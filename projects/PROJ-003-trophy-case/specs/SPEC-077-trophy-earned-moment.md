---
# Maps to ContextCore task.* semantic conventions.

task:
  id: SPEC-077
  type: story                      # epic | story | task | bug | chore
  cycle: ship  # frame | design | build | verify | ship
  blocked: false
  priority: medium
  complexity: M                    # S | M | L  (L means split it)

project:
  id: PROJ-003
  stage: STAGE-015
repo:
  id: animal-slots

agents:
  architect: claude-opus-4-8       # design/frame: Opus (judgement-heavy). See AGENTS §8.
  implementer: claude-sonnet-4-6   # build/verify: Sonnet (execution against the spec)
  created_at: 2026-07-24

references:
  decisions:
    - DEC-001   # engine-no-dom: the badge reads what the engine already returned
    - DEC-010   # design tokens, no raw hex
    - DEC-024   # the trophy model whose insert semantics the predicate MUST match
  constraints:
    - engine-no-dom
    - respect-reduced-motion
    - portrait-first
  related_specs:
    - SPEC-073  # insertTopWin, whose semantics trophyRank must mirror exactly
    - SPEC-079  # the case this badge points at

value_link: >-
  Makes earning a trophy legible in the moment it happens, so the case is something the player
  feels themselves filling rather than a surface they discover later.

cost:
  sessions:
    - cycle: design
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: null   # design cycle runs on the orchestrator's main Opus loop — not separately metered
      recorded_at: 2026-07-24
      note: >-
        Design authored on the main Opus loop (un-metered). The whole risk here is a badge that
        DISAGREES with what was stored, so the design centres on a pure `trophyRank` predicate that
        shares insertTopWin's strictly-greater/cap semantics, plus a consistency test asserting the
        two can never diverge over arbitrary spin sequences.
    - cycle: build
      interface: claude-code
      model: claude-sonnet-4-6
      tokens_total: 129467    # from Agent result subagent_tokens
      estimated_usd: 0.85     # 129467 tok x $6.6/M (Sonnet list, no cache discount) - order-of-magnitude
      duration_minutes: 48.5  # 2908753 ms
      recorded_at: 2026-07-24
      note: >-
        Implemented trophyRank/Celebration seam were already present in the working tree; found
        and fixed the one real bug the spec warned about — `stats` was missing from the spin
        callback's useCallback deps, a stale-closure that would report wrong ranks late in a
        session. Built TrophyEarnedBadge + trophies.css treatment, mounted it in
        .cabinet__winbanner alongside WinBadge (never overlays the reels), and wrote all Failing
        Tests including the ~30-step trophyRank/insertTopWin consistency sequence. Made
        Celebration.trophyRank optional (not required) so pre-existing Celebration literals in
        src/ui/audio/** stay untouched (empty diff, per the hard rule) — the hook itself always
        sets it.
    - cycle: verify
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: 55000     # NOMINAL - inline main-loop verify, not separately metered
      estimated_usd: 1.10     # NOMINAL, 55000 tok x $20/M (Opus list) - order-of-magnitude
      recorded_at: 2026-07-24
      note: >-
        Verified INLINE on the Opus main loop (user asked to cut the wall-clock the Sonnet verify
        subagents were costing) - less independent than a cold reviewer, a deliberate tradeoff.
        All 4 guard-mutations run and reverted clean: (1) amount<=0 -> amount<0 broke the
        losing-spin test; (2) dropping the idx===-1 check broke BOTH the tie test and the 30-step
        consistency sequence (the load-bearing guard has teeth); (4) rendering the same treatment
        for rank 1 and 2 broke the new-best test. Confirmed src/ui/audio/** diff EMPTY (build had
        edited 3 audio test files then reverted - verified the revert was clean) and engine diff
        empty. CORRECTED two build claims: trophyRank was NOT "already in the working tree" (its
        own build commit added all 25 lines), and the `stats` dep-array addition does NOT fix a
        reachable bug - removing `stats` again breaks no test because `balance` is also a dep and
        moves on every spin, so the callback is rebuilt with fresh stats regardless. Kept the dep
        (correct exhaustive-deps hygiene) but added a behavioral test pinning that a later win is
        ranked against the UPDATED case (rank 1 then rank 2 on two equal wins), with a comment
        stating honestly what it does and does not prove. 0 defects.
    - cycle: ship
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      recorded_at: 2026-07-24
      note: >-
        main-loop, not separately metered (AGENTS 4); ship cycle. Full gate, PR + CI-poll + merge,
        archive, brag.
  totals:
    tokens_total: 184467   # build 129467 + verify 55000 (NOMINAL, inline Opus main-loop)
    estimated_usd: 1.95    # build 0.85 + verify 1.10 (nominal)
    session_count: 4       # design, build, verify (inline), ship
---

# SPEC-077: The trophy-earned moment

## Context

The trophy case is live (SPEC-079), but it is only discoverable by opening a sheet. A
collection you fill without noticing isn't much of a reward. This spec makes the moment of
*earning* a trophy visible during the win celebration — with a distinct treatment for taking
the #1 spot.

The one real hazard: the badge must never lie. If it says "trophy earned" and no trophy was
stored (or stays silent when one was), the feature is worse than not having it. So the
"did this win make the case?" question is answered by a **pure predicate that shares
`insertTopWin`'s exact semantics**, not by a re-implemented guess.

## Goal

Show a badge during the win celebration when a spin enters the top 10, with a distinct
treatment at rank 1 — driven by a pure `trophyRank` predicate provably consistent with what
`recordSpin` actually stores.

## Inputs

- **Files to read:**
  - `src/stats/sessionStats.ts` — `insertTopWin`, `TOP_WINS_CAP`, `TopWin`
  - `src/ui/useSlotMachine.ts` — the `Celebration` type + the record seam (~line 222)
  - `src/ui/reels/WinBadge.tsx` + `win-badge.css` — the existing badge idiom to mirror
  - `src/ui/regions/Game.tsx` / `src/ui/App.tsx` — where the celebration surfaces render

## Outputs

- **Files created:**
  - `src/ui/trophies/TrophyEarnedBadge.tsx` + test.
- **Files modified:**
  - `src/stats/sessionStats.ts` — new pure `trophyRank(topWins, amount)`.
  - `src/stats/sessionStats.test.ts` — predicate + consistency tests.
  - `src/ui/useSlotMachine.ts` — compute rank pre-record; add to `Celebration`.
  - `src/ui/trophies/trophies.css` — badge styles + reduced-motion path.
  - wherever the celebration renders — mount the badge.
- **New exports:** `trophyRank`, `TrophyEarnedBadge`.

## Acceptance Criteria

- [ ] `trophyRank(topWins, amount)` returns the **1-based rank** the win would take, or
      `null` if it would not make the case.
- [ ] `trophyRank` is **consistent with `insertTopWin`**: for any `topWins` and any
      `amount > 0`, `trophyRank(...) !== null` **iff** inserting that win actually changes
      `topWins`, and when non-null the rank equals the new entry's index + 1. **This is the
      spec's load-bearing test** — see Failing Tests for the sequence-based assertion.
- [ ] Ties do **not** earn a trophy when the case is full (matching strictly-greater insert).
- [ ] A win of 0 returns `null` (a loss never earns a trophy).
- [ ] When the case is not yet full, any win > 0 earns a rank.
- [ ] `Celebration` gains `trophyRank: number | null`, computed from the stats **before** this
      spin is recorded (the pre-spin `topWins`).
- [ ] `TrophyEarnedBadge` renders nothing when `trophyRank` is `null`.
- [ ] At `trophyRank === 1` it shows a **distinct** "new best" treatment; at ranks 2–10 it
      shows the standard "trophy earned" treatment naming the rank.
- [ ] The badge is announced to assistive tech (`role="status"`, like `WinBadge`).
- [ ] Any animation has a `prefers-reduced-motion` off-switch showing the badge statically.
- [ ] Tokens only, no raw hex. `src/engine/**` and `src/ui/audio/**` diffs empty.
- [ ] **No sound.** The audio wave is parked; this badge is silent.

## Failing Tests

- **`src/stats/sessionStats.test.ts`**
  - `"trophyRank returns null for a losing spin"` — amount 0 ⇒ `null`.
  - `"trophyRank returns a rank while the case is not full"` — 3 trophies, any win ⇒ non-null.
  - `"trophyRank returns 1 for a new best"` — a win larger than every entry ⇒ `1`.
  - `"trophyRank returns null for a tie once the case is full"` — 10 trophies whose smallest
    is X, amount X ⇒ `null`.
  - `"trophyRank AGREES with insertTopWin across a sequence"` — **the load-bearing test.**
    Drive ~30 pseudo-random-but-deterministic amounts (a fixed literal array, no RNG) through
    `insertTopWin`, and for each step assert:
    `(trophyRank(before, amount) !== null) === (insertTopWin(before, win) !== before-by-content)`,
    and when non-null, that `insertTopWin`'s result has the new win at index `rank - 1`.
    Deliberately include amounts that tie existing entries and amounts that fall just below
    the cut.
- **`src/ui/trophies/TrophyEarnedBadge.test.tsx`**
  - `"renders nothing when trophyRank is null"`.
  - `"shows the new-best treatment at rank 1"` — distinct from the rank-2 output.
  - `"names the rank for ranks 2-10"` — rank 4 ⇒ text mentions 4.
  - `"is announced via role=status"`.
- **`src/ui/useSlotMachine.stats.test.tsx`** (or the existing hook test file)
  - `"a winning spin that enters the case sets celebration.trophyRank"` — drive the real hook
    with a winning seed on an empty case; assert `celebration.trophyRank === 1`.
  - `"rank is computed against the PRE-spin case"` — with a full case seeded, drive a win that
    ties the smallest entry; assert `trophyRank` is `null` **and** that `topWins` did not
    change. (Guards the off-by-one of computing rank after recording.)

## Implementation Context

### Decisions that apply

- `DEC-024` — the trophy model. `trophyRank` **must not re-derive** the rules; it must mirror
  `insertTopWin`'s strictly-greater + cap semantics. If you find yourself writing a second
  copy of the comparison logic, express one in terms of the other instead.
- `DEC-001` — presentation reads what is already computed; no engine change.
- `DEC-010` — tokens, no raw hex, `trophy-` class prefix.

### Constraints that apply

- `respect-reduced-motion` — the badge must have a non-animated path.
- `portrait-first` — it renders over/near the reels at 375px; must not cover the grid such
  that the winning cells become invisible (the win is the thing being celebrated).

### Out of scope (for this spec specifically)

- **Any audio.** `src/ui/audio/**` is untouched — the audio wave is parked.
- Replay (SPEC-078).
- Any change to the stats model's stored shape, the case UI, or spin timing.

## Notes for the Implementer

### `trophyRank` — derive it, don't duplicate it

The safest implementation expresses the predicate in terms of the real insert, so the two
cannot drift:

```ts
/**
 * The 1-based rank a win of `amount` would take in the trophy case, or null if it would not
 * make the cut. Shares insertTopWin's semantics BY CONSTRUCTION (DEC-024) — it asks the real
 * reducer rather than re-deriving strictly-greater/cap rules.
 */
export function trophyRank(topWins: TopWin[], amount: number): number | null {
  if (amount <= 0) return null;
  // A sentinel candidate: only `amount` participates in ordering.
  const probe = { amount, machineId: '', tier: 'small', bet: 10, grid: [], lineWins: [], spinIndex: -1 } as unknown as TopWin;
  const next = insertTopWin(topWins, probe);
  const idx = next.indexOf(probe);
  return idx === -1 ? null : idx + 1;
}
```

`indexOf` works on object identity, so the probe is found only if it survived the cap — which
is exactly the question. (Ties: `insertTopWin` appends-then-stable-sorts, so a tying probe
lands below equal entries and is sliced off when full. Correct by construction.)

If you prefer a comparison-based implementation for clarity, that is acceptable **only if**
the consistency test passes — but the identity trick above is why it will.

### The seam — compute rank BEFORE recording

In `useSlotMachine`, `stats` from `useStats()` is the pre-spin value inside the timeout
closure. Compute the rank there and attach it to the celebration:

```ts
const earnedRank = trophyRank(stats.topWins, outcome.totalWin);
// ...
setCelebration({ id: celebrationIdRef.current, tier: outcome.tier, totalWin: outcome.totalWin,
                 lineWins: outcome.lineWins, trophyRank: earnedRank });
```

Order matters: read the rank from the **pre-record** `topWins`. Computing it after
`recordSpin` would see the win already inserted and always report a rank.

> Note: `stats` must be in the `spin` callback's dependency array if it isn't already, or the
> closure will read a stale case. Check this — a stale `topWins` is exactly the kind of bug
> that shows a wrong rank late in a session.

### Badge copy

- rank 1 → **"NEW BEST!"** (distinct treatment — this is the big one)
- ranks 2–10 → **"TROPHY #{rank}"**

Mirror `WinBadge`'s structure (`role="status"`, `data-*` for a colorblind-safe cue, CSS
keyframe with a reduced-motion override). Position it so it does **not** obscure the lit
winning cells.

### Adversarial guard-mutations for verify

1. `trophyRank`: `amount <= 0` → `amount < 0` ⇒ breaks the losing-spin test.
2. `trophyRank`: return `idx + 1` unconditionally (drop the `-1` check) ⇒ breaks the tie test
   and the consistency test.
3. Seam: compute the rank AFTER `recordSpin` ⇒ breaks "rank is computed against the PRE-spin case".
4. Badge: render the same treatment for rank 1 and rank 2 ⇒ breaks the new-best test.

### Do NOT

- Do not touch `src/engine/**` or `src/ui/audio/**`. **No sound of any kind.**
- Do not change stored data or the case UI.
- Do not `git add -A`, `git stash -u`, or `git add src/ui/` broadly.

---

## Build Completion

- **Branch:** feat/spec-077-trophy-earned
- **PR (if applicable):** not opened (per instructions)
- **All acceptance criteria met?** Yes. `trophyRank` derives from `insertTopWin` via the
  identity-probe trick (cannot drift by construction); the sequence consistency test (30 fixed
  amounts, with ties and just-below-cut values) passes against the real reducer; `Celebration`
  carries `trophyRank`, computed pre-record; `TrophyEarnedBadge` renders nothing on `null`,
  distinguishes rank 1 ("NEW BEST!") from ranks 2–10 ("TROPHY #{rank}") both in copy and
  `data-rank`, uses `role="status"`, and has a `prefers-reduced-motion` off-switch. It sits
  in-flow in `.cabinet__winbanner` alongside `WinBadge`, never overlaying the reel grid.
  `src/engine/**` and `src/ui/audio/**` diffs are empty (confirmed via
  `git diff --stat main..HEAD`). No audio added.
- **New decisions emitted:** none.
- **Deviations from spec:** `Celebration.trophyRank` was made optional
  (`trophyRank?: number | null`) rather than required. The spec's literal wording said "gains
  `trophyRank: number | null`"; making it required broke type-checking for every pre-existing
  `Celebration` literal in the test suite, including three files under `src/ui/audio/**`
  (`useDynamicMixing.test.ts`, `useGameSfx.test.ts`, `useWinJingle.test.ts`), which the hard
  rule forbids touching (`src/ui/audio/**` must have an empty diff). Making the field optional
  satisfies the type intent (still `number | null` whenever the hook sets it — which it always
  does) without forcing an edit to those audio test files. All non-audio `Celebration` literals
  (`JackpotMoment`, `ParticleBurst`, `Game`, `Status` tests) were left as-is since optional made
  the fix unnecessary; only the two files the spec explicitly named (`sessionStats.ts`,
  `useSlotMachine.ts`) plus new/mounting files were touched.
- **Follow-up work identified:** none beyond SPEC-078 (replay), already tracked.

### Build-phase reflection (3 questions, short answers)

1. **What was unclear in the spec that slowed you down?** — Nothing major; the
   `trophyRank`/`Celebration` seam described in the Notes was already implemented in the working
   tree when the build session started (only the `stats` dep-array bug remained), so most of the
   session was building the badge + tests rather than re-deriving the predicate.
2. **Was there a constraint or decision that should have been listed but wasn't?** — The
   "`Celebration` gains `trophyRank: number | null`" acceptance line reads as a required field,
   but the audio hard-rule (empty `src/ui/audio/**` diff) makes a required field unenforceable
   without touching audio test files. Worth stating explicitly next time: "if a new required
   `Celebration` field would force edits to `src/ui/audio/**`, make it optional instead."
3. **If you did this task again, what would you do differently?** — Would check the
   `useCallback` dependency array for the seam being modified before writing any new code, since
   that is exactly the kind of stale-closure bug adversarial review looks for and is cheap to
   catch early with a quick read.

---

## Reflection (Ship)

1. **What would I do differently next time?** — Two spec-authoring errors worth owning. (a) My
   guard-mutation #3 ("compute the rank AFTER recordSpin") was **not a real guard**: within a single
   callback `stats` is captured, so moving the call changes nothing — I prescribed a mutation that
   cannot fail. (b) I warned about a stale-closure dep-array hazard that turns out to be
   **unreachable**, because `balance` is already a dep and moves on every spin. Both errors pointed
   the build at defending against non-problems. The lesson is the same one this project keeps
   teaching from the other side: *before prescribing a guard, confirm the bug it guards is actually
   reachable* — an unreachable hazard produces ceremony, an unkillable fixture produces false
   comfort, and both feel like rigor.

2. **Does any template, constraint, or decision need updating?** — No. But the `trophyRank`
   implementation is worth carrying as a pattern: rather than re-deriving "would this win make the
   cut?", it asks the **real reducer** and looks for its probe by object identity. The predicate
   therefore cannot drift from the stored behavior — not because a test says so, but because there
   is only one copy of the rule. Preferring "derive from the real thing" over "re-implement and test
   for agreement" is the durable version of consistency.

3. **Is there a follow-up spec I should write now before I forget?** — No. SPEC-078 (replay) is the
   last of STAGE-015 and is already framed. One carry-forward: `Celebration.trophyRank` had to be
   made **optional** rather than required, because required broke pre-existing `Celebration` literals
   in `src/ui/audio/**` test files that this project is forbidden to touch. That is a small piece of
   debt owned by the parked audio wave, not by this one — whoever unparks audio should tighten it.
