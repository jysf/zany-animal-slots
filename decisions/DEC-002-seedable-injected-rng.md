---
# Maps to ContextCore insight.* semantic conventions.

insight:
  id: DEC-002
  type: decision
  confidence: 0.9
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

created_at: 2026-06-18
supersedes: null
superseded_by: null

# Governs all randomness in the engine.
affected_scope:
  - src/engine/**

tags:
  - engine
  - rng
  - determinism
  - testing
---

# DEC-002: All engine randomness flows through a single injected seedable PRNG

## Decision

The engine uses one seedable pseudo-random number generator (mulberry32 or
similar), **injected** into the engine. No code in `src/engine/**` calls
`Math.random()` directly. A given seed produces a fully reproducible sequence of
spins.

## Context

Spins must be testable: a test needs to assert "this seed lands five Wolves on
line L1 and pays 200×." That is only possible if randomness is both
deterministic and injectable, so tests can pin the seed. Bare `Math.random()` is
neither. Reel strips are weighted arrays of symbol IDs; each reel's stop index
is drawn from the injected PRNG.

## Alternatives Considered

- **Option A: `Math.random()` directly**
  - What it is: call the platform RNG wherever a draw is needed.
  - Why rejected: non-deterministic, untestable, and impossible to reproduce a
    reported spin.

- **Option B: A crypto-grade RNG**
  - What it is: `crypto.getRandomValues`.
  - Why rejected: not seedable/reproducible, and overkill — this is play-money,
    not a regulated or security-sensitive draw.

- **Option C (chosen): One small seedable PRNG (mulberry32), injected**
  - What it is: a tiny deterministic generator passed into the engine; tests
    pin the seed, production seeds from time/entropy at startup.
  - Why selected: deterministic in tests, trivially fast, no dependency weight,
    and keeps the single-source-of-randomness rule enforceable.

## Consequences

- **Positive:** Deterministic, reproducible spins; easy property/edge tests;
  one place to reason about fairness/feel.
- **Negative:** Everything that draws randomness must receive the PRNG rather
  than reaching for a global — a small amount of plumbing.
- **Neutral:** Production seeding strategy (entropy source) is a UI/startup
  concern, not an engine concern.

## Validation

Right if: every engine test is deterministic and no `Math.random()` appears in
`src/engine/**` (the `deterministic-rng` constraint guards this). Revisit if: we
ever need a cryptographically fair draw (we do not, for play-money).

## References

- Related decisions: DEC-001 (pure engine), DEC-005 (play-money — weights are
  for feel, not RTP)
- Related constraint: `deterministic-rng` in `/guidance/constraints.yaml`
