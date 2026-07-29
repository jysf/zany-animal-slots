---
stage:
  id: STAGE-020
  status: active
  priority: medium
  target_complete: null
project:
  id: PROJ-006
repo:
  id: animal-slots
created_at: 2026-07-29
shipped_at: null
value_contribution:
  advances: "Makes the cabinet shell look like a machine, and gives the machine name a home in the UI."
  delivers:
    - "A framed reel window, a recessed readout panel, and a control deck with a defined edge — all per-machine token-driven."
    - "A cabinet that fills the phone as one unit instead of floating reels in dead space."
    - "Prev/next machine switching with the machine name promoted to the header marquee."
  explicitly_does_not:
    - "Touch the engine, any machine's math, or any machine's theme VALUES."
    - "Touch src/ui/audio/** (parked)."
    - "Build the machine picker sheet — planned as SPEC-094, deliberately deferred."
---

# STAGE-020: Cabinet chrome + switcher

## What This Stage Is
The whole of PROJ-006's first wave: framing + proportions (SPEC-092), then the switcher
(SPEC-093). Two specs, two PRs, both presentation-only.

## Success Criteria
- At 375px, the cabinet reads as one machine: framed reel window, readout as a recessed panel,
  control deck with a defined edge, one radius scale, no large empty bands.
- Machine switching is prev/next with the name as the header marquee; controls row goes 5 → 4 items.
- All six themes verified by real render; contrast tests green; 44px targets and reduced-motion
  unaffected; no raw hex (DEC-010).

## Spec Backlog
- [ ] SPEC-092 (design) — Cabinet framing + proportions. DEC-028.
- [ ] SPEC-093 (design) — Machine switcher: prev/next arrows + marquee name.
- [ ] SPEC-094 (planned, NOT built) — Machine picker sheet. Deferred by owner decision: ship the
  arrows first, plan for the sheet. See the PROJ-006 brief roadmap for the trigger conditions.

**Count:** 0 shipped / 2 active / 1 pending (deferred)

## Design Notes

**One framing language, not three.** SPEC-092 should introduce the bezel treatment once — as
tokens/shared rules — and apply it to the reel window, readout, and control deck, rather than
hand-styling each. The whole point is that the four regions currently share nothing.

**`--color-frame` is the bezel colour.** It already exists per-machine and is contrast-checked;
this stage is largely about *using* what the themes already define. No new colour values.

**Order matters.** Framing lands before the switcher: SPEC-093 promotes the machine name into the
header, and it should be promoted into a header that has already been given its final treatment.

## Dependencies

### Depends on
- PROJ-005 (shipped) — six distinct palettes are what make per-machine framing worth building.

### Enables
- SPEC-094 (picker sheet), and future theme work with a real chrome layer to hang on.

## Stage-Level Reflection
*Filled in when status moves to shipped.*
