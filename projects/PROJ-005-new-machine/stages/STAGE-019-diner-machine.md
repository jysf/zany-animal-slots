---
stage:
  id: STAGE-019
  status: shipped
  priority: low
  target_complete: null
project:
  id: PROJ-005
repo:
  id: animal-slots
created_at: 2026-07-25
shipped_at: 2026-07-25
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
- [x] SPEC-091 (shipped on 2026-07-25) — Diner generous machine + DEC-027. PR #100.

**Count:** 1 shipped / 0 active / 0 pending

## Dependencies

### Depends on
- STAGE-018 (shipped) — the fifth machine and the measure-then-pin loop it re-proved.

### Enables
- The Space/Cosmic machine (roadmapped in the PROJ-005 brief) — the last named theme.

## Stage-Level Reflection

*Shipped 2026-07-25 (PR #100).*

- **Did we deliver the outcome?** Yes. Diner is the sixth selectable machine — food-and-drink
  symbols, warm amber theme, and generous math measuring ~44.9% hit-frequency at ~95.0% RTP. That
  is the roster's highest hit-rate, above Ocean's 37.6%, and it closes the personality gap DEC-026
  named. Engine diff empty; contracts pass; default machine unchanged.
- **How many specs did it take?** One, as planned.
- **What changed between starting and shipping?** Nothing in scope. The tuning took 9 simulator
  iterations rather than Farm's ~5, because the first guess (RTP 295%) missed that weights cap the
  paytable at a high hit rate — see SPEC-091's reflection.
- **Lessons worth promoting.** Two, both recorded in DEC-027: (a) **test-band width should follow
  measured variance**, not be inherited from the previous machine — Farm's 17-point RTP band was
  right for high variance and would have been a no-op here, where 7 points has teeth; verify with a
  mutation, not by reasoning. (b) **4-of-a-kind is the dominant RTP lever**, now confirmed on two
  opposite personalities — a reusable starting point for the next machine's tuning.
- **Bookkeeping note.** Shipped in the same session the code merged, deliberately: STAGE-018 left
  its spec un-archived for a day because the code landing felt like the end of the work. It isn't.
