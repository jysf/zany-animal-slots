---
insight:
  id: DEC-026
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

created_at: 2026-07-24
supersedes: null
superseded_by: null

affected_scope:
  - src/machines/farm.ts

tags:
  - machine
  - game-math
  - high-variance
  - config-as-data
---

# DEC-026: Farm machine (high-variance)

## Decision

Add a fifth machine, **Farm** — a barnyard reskin over the shared 8-symbol engine vocabulary with
its own green/earthy theme and a deliberately **high-variance** tuned math: fewer, bigger hits and
a rarer, fatter jackpot. Measured (measure-then-pin, `just simulate farm`, 200k spins): **RTP ~94%**
(93.9–95.6% across seeds — the wide band is the variance signature), **hit-frequency ~23.2%** (vs
Ocean's 37%), **big-tier ~6.6%** (vs Ocean's 4.6%), **jackpot ~1-in-200k** (WOLF weight 2). Pure
data (DEC-015); no engine change (DEC-001).

## Context

PROJ-005 adds one new machine for variety. The user chose a **Farm** theme and a **high-variance**
personality — the swingy counterpoint to Ocean's steady, low-variance feel, which the roster
otherwise lacked. Machines are config-as-data (DEC-015), so this is a new `src/machines/farm.ts`
plus registry registration, a test, and this DEC — no engine or presentation-framework change.

## Alternatives Considered

- **Reskin reusing an existing machine's math** — cheapest, but adds no *play* variety, only a new
  skin. Rejected: the point was a distinct feel.
- **Generous / high-hit-rate math** — the opposite profile (frequent small wins). Rejected in
  favour of high-variance, which the four existing machines don't cover (Ocean is the steadiest;
  none are notably swingy).
- **High-variance Farm (chosen)** — lower hit-frequency + a fatter high end, tuned to ~94% RTP so
  it stays as generous *on average* as the others while feeling much swingier moment to moment.

## The levers (how the variance was achieved)

- **Flatter, lower reel weights** at the common end (DEER/FOX 7 each vs Ocean's 10/9) → fewer cheap
  3-of-a-kind hits, so hit-frequency drops to ~23%.
- **A rarer jackpot symbol** (WOLF weight 2 vs Ocean's 3) → jackpot ~1-in-200k, a genuine rarity.
- **A fatter paytable high end** (5-of-a-kind and jackpot multiples well above Ocean's) → the rarer
  hits pay bigger, keeping RTP ~94% despite fewer of them. Tuned empirically: the 4-of-a-kind values
  proved the dominant RTP lever and were the last thing dialled in.

## Consequences

- **Positive:** Real play variety — a swingy machine for players who want bigger, rarer thrills;
  the config-as-data model (DEC-015) is exercised a fifth time with zero engine change.
- **Positive:** The frozen-seed machine-parity contract (default = Wild & Whimsical) is untouched,
  so this is purely additive and can't regress existing machines.
- **Negative / accepted:** High-variance RTP is noisier to measure (the ~2-point seed spread), so
  the metrics-sanity test asserts a wide RTP band and a tight *low* hit-frequency band (the real
  signature) rather than a pinned RTP.
- **Neutral:** 8 new emoji (🐔🐷🐑🐮🦆🐐🐴🚜), verified distinct from all other machines by the
  cross-machine symbol-uniqueness contract. Theme contrast verified (text-on-bg 16.13:1, WCAG AAA).

## Validation

Right if the machine measures high-variance (hit-frequency distinctly below the steady machines,
RTP ~94%) and passes the symbol-uniqueness + machine-parity contracts. Revisit if the RTP band
proves too loose to catch real drift, or if a future engine change shifts the measured metrics.

## References

- Related specs: SPEC-090 (implements)
- Related decisions: DEC-015 (config-driven machines), DEC-016 (measure-then-pin retune), DEC-019
  (Ocean — the low-variance contrast), DEC-021 (per-machine symbol identity), DEC-001 (engine-no-dom)
- Tooling: `just simulate farm` (the offline metrics simulator)
