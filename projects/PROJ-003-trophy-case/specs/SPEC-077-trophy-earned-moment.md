---
# Maps to ContextCore task.* semantic conventions.

task:
  id: SPEC-077
  type: story                      # epic | story | task | bug | chore
  cycle: design                    # frame | design | build | verify | ship
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
  totals:
    tokens_total: 0
    estimated_usd: 0
    session_count: 0
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
