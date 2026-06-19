---
# Maps to ContextCore insight.* semantic conventions.

insight:
  id: DEC-004
  type: decision
  confidence: 0.75
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

affected_scope:
  - src/ui/**

tags:
  - presentation
  - animation
  - performance
---

# DEC-004: Reel and celebration animation use CSS transforms/keyframes, not canvas/WebGL

## Decision

Reel spin/stop motion and win celebrations are implemented with CSS
transforms and keyframe animations on DOM elements, not a `<canvas>` or WebGL
renderer. Revisit only if a measured 60fps target demonstrably fails.

## Context

The game needs juicy 60fps animation on a mid-tier phone (a success signal), but
the visuals are emoji symbols and discrete effects (reel slides, bounces,
particle bursts, a jackpot scene) — not a continuous high-element-count scene
that demands a game-loop renderer. CSS transforms are GPU-composited, simple to
reason about, accessible (real DOM, easier reduced-motion handling), and need no
extra dependency.

## Alternatives Considered

- **Option A: Canvas 2D / WebGL game loop**
  - What it is: render reels and effects into a canvas via requestAnimationFrame.
  - Why rejected for now: heavier to build and test, worse accessibility, and
    unnecessary for this element count. Carries a dependency and a custom render
    loop.

- **Option B: A full animation/game library (e.g. GSAP, PixiJS)**
  - Why rejected: dependency weight and a `no-new-top-level-deps-without-decision`
    cost for capability the platform already provides.

- **Option C (chosen): CSS transforms + keyframes**
  - Why selected: GPU-composited, dependency-free, accessible, and sufficient
    for the effects in scope. Keeps a clean reduced-motion path.

## Consequences

- **Positive:** No extra dependency; GPU compositing; straightforward
  `prefers-reduced-motion` handling; testable DOM.
- **Negative:** Very large particle counts or complex physics would strain CSS;
  some effects are fiddlier than in a dedicated engine.
- **Neutral:** This is the lowest-confidence decision here (0.75) — it is a
  "start here, measure, revisit" choice, not a lock.

## Validation

Right if: the spin → win → reset cycle holds ~60fps on a mid-tier phone with CSS
alone (verified in STAGE-005's perf pass). Revisit if: profiling shows CSS can't
hit the frame budget for the celebration effects we want.

## References

- Related constraint: `perf-60fps`, `respect-reduced-motion`
- Related stages: STAGE-003 (reel motion), STAGE-004 (celebrations), STAGE-005
  (perf pass)
