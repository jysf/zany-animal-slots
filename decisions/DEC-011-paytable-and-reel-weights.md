---
# Maps to ContextCore insight.* semantic conventions.

insight:
  id: DEC-011
  type: decision
  confidence: 0.7                     # tuned for feel, not playtested yet — expect revision
  audience:
    - developer
    - agent

agent:
  id: claude-opus-4-8
  session_id: null

project:
  id: PROJ-001
repo:
  id: animal-slots

created_at: 2026-06-19
supersedes: null
superseded_by: null

affected_scope:
  - src/engine/strips.ts
  - src/engine/paylines.ts

tags:
  - engine
  - game-design
  - paytable
  - reel-weights
---

# DEC-011: v1 paytable and reel-strip weights

## Decision

v1 uses a fixed paytable (payout = multiple of **total bet**, per tier, for
3/4/5-of-a-kind) and a single symmetric reel-strip composition shared by all five
reels. The full tables are recorded in `brief.md`'s **Game-Design Spec** section;
this decision is their authoritative source and rationale.

Paytable (× total bet; `lineWin = floor(multiplier × totalBet)`):

| Tier | 3 | 4 | 5 |
|---|---|---|---|
| Low (Deer / Fox / Squirrel) | 0.5× | 2× | 5× |
| Mid (Bear / Eagle / Owl) | 1× | 4× | 12× |
| High (Bison) | 3× | 10× | 40× |
| Jackpot (Wolf) | 8× | 40× | 200× |

Reel-strip weights (relative counts, identical on every reel; per-reel total 35):

| Symbol | Tier | Weight |
|---|---|---|
| Deer / Fox | Low | 7 each |
| Squirrel | Low | 6 |
| Bear / Eagle / Owl | Mid | 4 each |
| Bison | High | 2 |
| Wolf | Jackpot | 1 |

## Context

STAGE-002's engine needs concrete numbers to evaluate paylines and resolve spins,
and its specs need *real* deterministic failing tests derived from them. Before
this decision the paytable and reel weights existed nowhere — `DEC-003`, the
STAGE-002 stage file, and `docs/architecture.md` all referenced a "game-design
spec section of `brief.md`" that had never been written. This decision (and the
brief section it backs) fills that gap so all seven engine specs derive their
tests from one source of truth instead of inventing numbers per spec.

Per `DEC-005`, these are **tuned for feel, not a regulated RTP** — frequent small
wins, occasional big wins, a rare jackpot — and we make **no RTP claim**.

## Alternatives Considered

- **Option A: Per-reel asymmetric strips (Wolf rarer on later reels).**
  - What it is: classic real-slot technique to push 5-of-a-kind odds down further.
  - Why rejected for v1: more state and more test surface for no MVP value; the
    symmetric strip already makes five-Wolf astronomically rare. A clean future
    spec can introduce per-reel strips without changing the evaluator's shape.

- **Option B: Per-symbol payouts (each animal its own line).**
  - What it is: every symbol gets distinct 3/4/5 payouts rather than per-tier.
  - Why rejected: four tiers give enough spread and far fewer numbers to tune and
    test; DEC-003 already notes per-symbol splits as a clean later spec.

- **Option C (chosen): Four-tier paytable + one symmetric strip composition.**
  - What it is: payouts keyed on the symbol's tier; identical weighted strip on
    all five reels.
  - Why selected: smallest coherent number set that still produces the full
    small / big / jackpot spread, trivially unit-testable, and an obvious tuning
    target after playtesting.

## Consequences

- **Positive:** Engine specs get concrete, derivable failing tests; one place to
  retune feel; small enough to test exhaustively.
- **Negative:** Symmetric strips + tier payouts are less "real-slot" than
  per-reel/per-symbol tuning; the natural jackpot rate is so low it is effectively
  only seen via chosen seeds or very long auto-spin runs.
- **Neutral:** The numbers are a first pass (confidence 0.7) — expect at least one
  retune pass once the game is playable (STAGE-003+).

## Validation

Right if: spins produce frequent small wins, occasional big wins, and a clearly
rare jackpot, and the balance drifts gently down over a long session (play-money
feel). Revisit if: playtesting shows wins feel too sparse or too generous, or the
balance crashes/skyrockets — retune weights and/or multipliers (this DEC, not the
evaluator).

## References

- Game rules: `/projects/PROJ-001-animal-slots/brief.md` (Game-Design Spec section)
- Related decisions: DEC-002 (seedable RNG), DEC-003 (fixed paylines),
  DEC-005 (play-money / no RTP), DEC-006 (emoji symbol set)
- Implements into: `src/engine/strips.ts`, `src/engine/paylines.ts` (STAGE-002)
