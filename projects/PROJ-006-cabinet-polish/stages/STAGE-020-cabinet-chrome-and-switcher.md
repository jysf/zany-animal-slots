---
stage:
  id: STAGE-020
  status: shipped
  priority: medium
  target_complete: null
project:
  id: PROJ-006
repo:
  id: animal-slots
created_at: 2026-07-29
shipped_at: 2026-07-29
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
- [x] SPEC-092 (shipped on 2026-07-29) — Cabinet framing + proportions. DEC-028. PR #103.
- [x] SPEC-093 (shipped on 2026-07-29) — Machine switcher: prev/next arrows + marquee name. PR #105.
- [ ] SPEC-094 (planned, NOT built) — Machine picker sheet. Deferred by owner decision: ship the
  arrows first, plan for the sheet. See the PROJ-006 brief roadmap for the trigger conditions.

**Count:** 2 shipped / 0 active / 1 pending (deferred to a future stage)

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

*Shipped 2026-07-29. Two specs, one DEC, four PRs (#103, #104, #105 + this close-out).*

- **Did we deliver the outcome?** Yes, both halves. The cabinet has a real framing language
  (framed shell → lit face → recessed wells) driven entirely by tokens the six machine themes
  already defined, so every machine got its own chrome with **zero per-machine code**. And machine
  switching is `◀ Name ▶` with the name as the header's headline, controls row down from 5 items
  to 4 icons. No `src/engine/**` diff across the stage; `src/ui/audio/**` untouched.
- **How many specs did it take?** Two, as planned. SPEC-094 (picker sheet) was deferred by owner
  decision at the outset and stayed deferred — it is not unfinished work, it is a scoped-out item
  with recorded trigger conditions.
- **What changed between starting and shipping?** The design was wrong three times, and every
  correction came from a render rather than from reasoning: (1) bordering the cabinet face
  *outlined the void*, making the emptiness more prominent; (2) bordering face **and** window gave a
  doubled ring; (3) the promoted marquee inherited the old title's `font-size: xl` and flanking
  emoji, truncating the longest machine name **worse than the `<select>` it replaced**.
- **The lesson worth promoting.** **For visual work, a proposed treatment is a hypothesis and the
  render is the test.** This stage produced that lesson twice independently, which is the strongest
  signal it generalises. Concretely, two rules: *(a)* never assert a visual fix in prose before
  seeing it; *(b)* when promoting an element, re-derive its sizing from what it must now hold —
  inherited styling encodes the **old** content's constraints. Nothing in the spec templates needs
  changing; this is a working habit, not a process gap.
- **Honest caveats carried out of the stage.** The owner's verdict on the chrome was *"could be
  nicer, but I think this is ok"* — a pass, not a win. The heavier arcade treatment they declined
  remains cheap to revisit on the token layer without restructuring. Separately, the switcher
  **lost the `<select>`'s random access**, which is a genuine regression softened by wrap-around and
  properly fixed only by SPEC-094. And `overflow: hidden` on `.cabinet` is now load-bearing for the
  rounded corners (DEC-028) — a trap for any future overlay needing to escape the cabinet bounds.
