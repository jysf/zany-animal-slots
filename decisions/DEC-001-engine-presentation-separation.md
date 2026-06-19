---
# Maps to ContextCore insight.* semantic conventions.

insight:
  id: DEC-001
  type: decision
  confidence: 0.95
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

# This decision governs all engine code and the boundary the UI consumes.
affected_scope:
  - src/engine/**

tags:
  - architecture
  - separation-of-concerns
  - engine
---

# DEC-001: Engine and presentation are separated; the engine is pure TypeScript

## Decision

All game logic lives in `src/engine/**` as pure TypeScript with **no React and
no DOM imports**. The presentation layer consumes the engine only through a
typed public interface (`src/engine/index.ts`), receiving plain-data results.

## Context

Animal Slots is animation-heavy and non-CRUD. The project thesis is that such a
game can be delivered with game logic cleanly separable from presentation, and
that doing so exercises the spec-driven template on unfamiliar terrain. The
separation is therefore not just good hygiene — it is the load-bearing claim the
project is testing. It also makes the engine fully unit-testable without a
browser, which is one of the project's success criteria.

## Alternatives Considered

- **Option A: Logic interleaved with React components**
  - What it is: spin/payline/balance logic lives inside hooks and components.
  - Why rejected: couples math to rendering, makes the engine impossible to test
    without the DOM, and directly contradicts the project thesis.

- **Option B: Separation by convention only (no enforcement)**
  - What it is: keep logic in `src/engine/` but rely on discipline to keep React
    out.
  - Why rejected: conventions drift, especially across fresh per-cycle sessions.
    The wall must be mechanical.

- **Option C (chosen): Pure engine module + enforced import boundary**
  - What it is: `src/engine/**` is pure TS; an ESLint `no-restricted-imports`
    rule (`engine-no-dom`) forbids React/DOM imports there; the UI consumes a
    typed interface.
  - Why selected: makes the thesis structurally true and testable, and catches
    violations at lint time rather than review time.

## Consequences

- **Positive:** Engine is unit-testable in isolation; the UI can be rebuilt or
  re-themed without touching logic; the central thesis is verifiable.
- **Negative:** A typed interface must be maintained as the seam; some data the
  UI wants must be threaded through `SpinResult` rather than reached for
  directly.
- **Neutral:** Forces an explicit "what crosses the boundary" decision (the
  `SpinResult` shape).

## Validation

Right if: the engine ships with high coverage and zero React/DOM imports, and
the UI never imports engine internals. Revisit if: the interface becomes so wide
that the separation is nominal, or if a feature genuinely cannot be expressed as
"engine returns data, UI renders it."

## References

- Related decisions: DEC-002 (deterministic RNG makes the pure engine testable)
- Related constraint: `engine-no-dom` in `/guidance/constraints.yaml`
- Architecture: `/docs/architecture.md`
