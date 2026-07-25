---
insight:
  id: DEC-027
  type: decision
  confidence: 0.9
  audience:
    - developer
    - agent

agent:
  id: claude-opus-4-8
  session_id: null

project:
  id: PROJ-005
repo:
  id: animal-slots

created_at: 2026-07-25
supersedes: null
superseded_by: null

affected_scope:
  - src/machines/diner.ts

tags:
  - machine
  - game-math
  - generous
  - config-as-data
---

# DEC-027: Diner machine (generous / high-hit-rate)

## Decision

Add a sixth machine, **Diner** — a food-and-drink reskin over the shared 8-symbol engine vocabulary
with its own warm amber/red palette and a deliberately **generous** tuned math: wins land on nearly
half of all spins, and land small. Measured (measure-then-pin, `just simulate diner`, 200k spins ×
6 seeds): **RTP ~95.0%** (94.77–95.19% — a 0.42-point spread, the *tightest* of the roster),
**hit-frequency ~44.9%** (vs Ocean's 37.6%, the previous high), **big-tier ~4.5%**, **jackpot
~1-in-30k** (WOLF weight 3 — the roster's friendliest). Pure data (DEC-015); no engine change
(DEC-001).

## Context

DEC-026 considered a generous / high-hit-rate personality while tuning Farm and **explicitly
rejected it** in favour of high-variance, because the roster had no swingy machine. That left the
opposite gap: Ocean is *steady* but not *generous*, and nothing in the roster simply pays out often.
This is the machine DEC-026 deferred. Machines are config-as-data (DEC-015), so it is a new
`src/machines/diner.ts` plus registry registration, a test, and this DEC.

## Alternatives Considered

- **Space / Cosmic theme first** — the other roadmapped theme, and the bolder visual departure.
  Deferred: it is a *look*, not a math personality, so it doesn't close the roster gap. Still queued.
- **Generous via BIG payouts** — raise the paytable instead of the hit rate. Rejected: that is just
  a higher-RTP Farm, and it collides with the swingy machine's identity. "Generous" here means
  *frequent*, deliberately.
- **Generous via hit-frequency (chosen)** — the steepest low-end weighting on the roster with a
  deliberately shallow paytable, so wins arrive constantly but small.

## The levers (how the generosity was achieved)

- **Steep low-end weights** (DEER 10 / FOX 9 / SQUIRREL 8 of 42) → hit-frequency ~44.9%.
- **A deliberately shallow paytable** — a low 3-of-a-kind pays **1×**, a push. This is what makes
  the high hit rate affordable at all: at ~45% hit-frequency the low tier alone dominates RTP.
- **The friendliest WOLF** (weight 3) → jackpot ~1-in-30k, the most attainable on the roster.
- **The 4-of-a-kind rung is the dominant RTP lever** — the same finding DEC-026 reported for Farm,
  now confirmed across a second, opposite personality: low 4ok `2 → 3` alone moved RTP ~+10 points
  (95% → 105%) with hit-frequency completely unchanged. Treat it as the fine-tuning dial.

## Consequences

- **Positive:** The roster now spans a real spectrum — swingy (Farm, 23% hits) → moderate → steady
  (Ocean, 38%) → generous (Diner, 45%) — and the config-as-data model (DEC-015) is exercised a sixth
  time with zero engine change.
- **Positive / a correction to DEC-026's posture:** a *low*-variance machine measures **quietly**.
  Diner's RTP spread across six 200k seeds is 0.42 points, where Farm's was ~2. So its
  metrics-sanity band can be genuinely tight (0.92–0.99, ~7 points) rather than the near-no-op
  0.85–1.02 (17 points) Farm's variance forced. Verified with teeth: the two tuning iterations that
  measured 87.5% and 105.4% both fail this band. Band width should follow the machine's measured
  variance, not be copied from the previous machine.
- **Negative / accepted:** an integer paytable puts a hard floor under RTP at this hit rate — a low
  3-of-a-kind cannot pay less than 1×, so ~45% is close to the highest hit-frequency reachable
  without RTP drifting over 100%. A more generous machine would need fractional payouts or a
  larger bet denominator. Recorded so a future "even friendlier" machine doesn't re-derive it.
- **Neutral:** 8 new emoji (🍕🍔🌮🍩🍜🥤🍣🎂), verified distinct from all five other machines by
  the cross-machine symbol-uniqueness contract — no collision risk, since every existing machine is
  animal/nature themed. Theme contrast verified (text-on-bg 16.78:1, WCAG AAA; every foreground
  token ≥ 9.21:1).

## Validation

Right if the machine measures generous (hit-frequency distinctly above Ocean's ~37.6%, RTP ~95%)
and passes the symbol-uniqueness + machine-parity contracts. Revisit if a future engine change
shifts the measured metrics, or if players read "frequent 1× pushes" as unsatisfying rather than
generous — in which case the fix is a slightly deeper paytable at a slightly lower hit rate, not a
higher RTP.

## References

- Related specs: SPEC-091 (implements)
- Related decisions: DEC-026 (Farm — the high-variance opposite, and the alternative this decision
  takes up), DEC-015 (config-driven machines), DEC-016 (measure-then-pin retune), DEC-019 (Ocean —
  the previous hit-frequency high), DEC-021 (per-machine symbol identity), DEC-001 (engine-no-dom)
- Tooling: `just simulate diner` (the offline metrics simulator)
