---
# Maps to ContextCore insight.* semantic conventions.

insight:
  id: DEC-012
  type: decision
  confidence: 0.8
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

created_at: 2026-06-27
supersedes: null
superseded_by: null

affected_scope:
  - src/ui/useCountUp.ts
  - src/ui/prefersReducedMotion.ts

tags:
  - presentation
  - animation
  - accessibility
---

# DEC-012: The numeric balance count-up is a JS interval tween (not CSS), with a JS-side reduced-motion check

## Decision

The balance count-up celebration (SPEC-022) interpolates a **displayed integer**
from the pre-credit balance to the post-win balance using a JavaScript
`setInterval` tween in a `useCountUp` hook — not a CSS animation. Because the
effect is JS-driven, its `prefers-reduced-motion` path is also handled in JS via
a small `prefersReducedMotion()` helper (`window.matchMedia`), which snaps
straight to the target value. This is a deliberate, narrow exception to DEC-004
("celebrations use CSS transforms/keyframes").

## Context

DEC-004 chose CSS transforms/keyframes for reel motion and celebrations because
those are GPU-composited *visual* effects on DOM elements. A count-up is
different: it animates the **text content** of a number, which CSS cannot
interpolate in a way we can unit-test. (The `@property` + `counter()` trick can
animate an integer custom property in pure CSS, but its rendered value is not
readable by React Testing Library / jsdom, so the behavior could not be asserted
with `vi.useFakeTimers` the way the rest of the hook flow is.) A `setInterval`
tween keyed off the one-shot `celebration` signal (DEC-001 / SPEC-021) is
deterministic, testable with fake timers, and trivially honors reduced motion by
snapping. Only the count-up takes this exception; the paw-print trail (SPEC-023),
particles (SPEC-024), and jackpot moment (SPEC-025) remain CSS per DEC-004.

## Alternatives Considered

- **Option A: Pure CSS via `@property`/`counter()`** — animate a registered
  `<integer>` custom property and render it with `counter()`. Rejected: the
  animated value is not assertable in jsdom/RTL, breaking the project's
  fake-timer behavior-test pattern; also weaker cross-browser support.
- **Option B: `requestAnimationFrame` tween** — smoother, but rAF is not driven
  by `vi.useFakeTimers` without extra mocking, making the count-up hard to test
  deterministically. Rejected in favor of a timer the fake-clock controls.
- **Option C (chosen): `setInterval` step tween + JS reduced-motion snap** —
  deterministic, fake-timer-testable, and reduced-motion-correct by construction.

## Consequences

- **Positive:** Deterministic, unit-testable count-up; clean reduced-motion snap;
  no dependency; consistent with the hook's existing fake-timer test style.
- **Negative:** A fixed-step interval is marginally less smooth than rAF; the
  step cadence (`~40ms`) is a feel knob, not frame-locked. Acceptable for a short
  (~800ms) one-shot tick; revisit only if the perf pass (STAGE-005) flags it.
- **Neutral:** Introduces the first JS-side `prefers-reduced-motion` check in the
  UI (`prefersReducedMotion()`), reusable by any future JS-driven effect.

## Validation

Right if: the balance ticks old→new on a win, snaps instantly under reduced
motion, and the behavior is covered by fake-timer hook tests. Revisit if: the
count-up visibly stutters in the STAGE-005 perf pass (then consider rAF with a
test shim), or a later effect wants a shared rAF tween utility.

## References

- Related decisions: DEC-004 (CSS-for-celebrations — this is the narrow
  numeric-tween exception), DEC-001 (count-up reads only the engine-derived
  `celebration` signal; no game logic in the UI).
- Related constraint: `respect-reduced-motion`, `perf-60fps`.
- Related specs: SPEC-021 (the `celebration` signal it keys off), SPEC-022 (this
  count-up).
