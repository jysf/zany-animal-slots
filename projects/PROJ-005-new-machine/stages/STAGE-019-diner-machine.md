---
stage:
  id: STAGE-019
  status: active
  priority: low
  target_complete: null
project:
  id: PROJ-005
repo:
  id: animal-slots
created_at: 2026-07-25
shipped_at: null
value_contribution:
  advances: "Closes the roster's last obvious math-personality gap — a generous, high-hit-rate machine — as pure config."
  delivers:
    - "Diner: a sixth selectable machine with a food-and-drink theme and generous tuned math (hits on ~45% of spins, the roster's highest)."
  explicitly_does_not:
    - "Change the engine, the default machine, or any existing machine's math."
    - "Add the Space/Cosmic machine (still roadmapped, separate stage)."
---

# STAGE-019: Diner machine

## What This Stage Is
The Diner machine: a food-and-drink theme + generous, high-hit-rate math, tuned via the simulator,
registered, tested. The friendly counterpoint to Farm's swingy feast-or-famine.

## Why Now
DEC-026 explicitly rejected a generous / high-hit-rate personality when tuning Farm, in favour of
high-variance. That rejection left the roster with steady (Ocean), moderate (W&W / Arctic / Desert),
and swingy (Farm) — but nothing that simply pays out *often*. It is the last gap a player would
notice, and the sixth pass through the config-as-data model is nearly all tuning.

## Success Criteria
- Diner is selectable (6th option), renders its own food symbols + warm amber theme, and measures
  GENEROUS: hit-frequency ~45% (the roster's highest, above Ocean's ~37.6%) at ~95% RTP.
- Symbol-uniqueness + machine-parity contracts pass; default machine unchanged; engine diff empty.
- The metrics-sanity RTP band is *tight* (≤ ~7 points), not the near-no-op width Farm's needed —
  low variance measures quietly, so the band can have real teeth (SPEC-090's ship reflection).

## Spec Backlog
- [ ] SPEC-091 (ship) — Diner generous machine + DEC-027.

**Count:** 0 shipped / 1 active / 0 pending

## Dependencies

### Depends on
- STAGE-018 (shipped) — the fifth machine and the measure-then-pin loop it re-proved.

### Enables
- The Space/Cosmic machine (roadmapped in the PROJ-005 brief) — the last named theme.

## Stage-Level Reflection
*Filled in when status moves to shipped.*
