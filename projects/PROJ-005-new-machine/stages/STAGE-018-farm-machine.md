---
stage:
  id: STAGE-018
  status: shipped
  priority: low
  target_complete: null
project:
  id: PROJ-005
repo:
  id: animal-slots
created_at: 2026-07-24
shipped_at: 2026-07-25
value_contribution:
  advances: "Adds the high-variance machine the roster lacked, as pure config."
  delivers:
    - "Farm: a fifth selectable machine with a barnyard theme and high-variance tuned math."
  explicitly_does_not:
    - "Change the engine, the default machine, or any existing machine's math."
---

# STAGE-018: Farm machine

## What This Stage Is
The Farm machine: barnyard theme + high-variance math, tuned via the simulator, registered, tested.

## Success Criteria
- Farm is selectable (5th option), renders its own creatures + green theme, measures high-variance
  (~94% RTP, ~23% hit-frequency). Symbol-uniqueness + machine-parity contracts pass; engine diff empty.

## Spec Backlog
- [x] SPEC-090 (shipped) — Farm high-variance machine + DEC-026. PR #97.

**Count:** 1 shipped / 0 active / 0 pending

## Stage-Level Reflection

*Shipped 2026-07-25 (code merged in PR #97 on 2026-07-24; bookkeeping closed out 2026-07-25).*

- **Delivered?** Yes. Farm is the fifth selectable machine — barnyard creatures, green theme,
  measured high-variance math (~94% RTP, ~23% hit-frequency, jackpot ~1-in-200k). Engine diff
  empty; symbol-uniqueness and machine-parity contracts pass; the default machine is unchanged.
  A single spec, as planned.
- **What changed?** Nothing in scope. The one process failure was at the seam, not in the work:
  the code shipped and the spec didn't — no reflection, no archive, stage left `active` — and the
  next project's close-out landed on top of it. Caught here by reading `just status` (`ship (1)`
  with `Shipped (archived): 0`) rather than by any gate.
- **What's next?** DEC-026 rejected a generous / high-hit-rate personality in favour of
  high-variance; that is still the roster's clearest gap and becomes STAGE-019 / SPEC-091.
