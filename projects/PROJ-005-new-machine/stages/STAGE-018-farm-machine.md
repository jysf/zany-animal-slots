---
stage:
  id: STAGE-018
  status: active
  priority: low
  target_complete: null
project:
  id: PROJ-005
repo:
  id: animal-slots
created_at: 2026-07-24
shipped_at: null
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
- [ ] SPEC-090 (design) — Farm high-variance machine + DEC-026.

**Count:** 0 shipped / 1 active / 0 pending

## Stage-Level Reflection
*Filled in when status moves to shipped.*
