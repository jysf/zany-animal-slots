---
stage:
  id: STAGE-022
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
  advances: "The header's icon row is the last part of the cabinet that still looks unstyled."
  delivers:
    - "A header control row that reads as deliberate chrome rather than four outlined boxes."
  explicitly_does_not:
    - "Change what the controls DO, their labels, or their ≥44px hit areas."
    - "Touch src/ui/audio/** (parked) — including the mute toggle's behaviour."
    - "Revisit the cabinet framing, switcher, or height work (STAGE-020/021, shipped)."
---

# STAGE-022: Header controls polish

## What This Stage Is
The header's four icon triggers (mute / paytable / record / help). STAGE-020 gave the cabinet a
framing language and STAGE-021 sorted its layout and rhythm; this row never got the same attention
and now reads as four generic outlined squares sitting under a styled marquee.

## Why Now
Owner: *"can we improve the look of the top row of buttons?"* — the last unstyled thing in a cabinet
that is otherwise finished.

Deliberately a **new stage**: STAGE-021 was scoped for two specs and absorbed eight, because each
owner reaction fed the next spec. Rather than let that continue, this starts clean with one concern.

## Success Criteria
- The four triggers read as part of the cabinet's chrome — consistent with the bezel/well language
  from DEC-028 rather than default-looking outlines.
- Hit areas stay ≥44px (`touch-targets-44`); labels and behaviour unchanged.
- Verified across all six machine themes and at both ends of the portrait range, plus a short
  desktop window (the gap STAGE-021's two bugs both hid in).

## Spec Backlog
- [ ] SPEC-103 (design) — Header control row visual treatment.

**Count:** 0 shipped / 1 active / 0 pending

## Design Notes

**Reuse, don't invent.** DEC-028 already established shell → face → well depth with `--bezel-width`,
`--shadow-well`, and `--shadow-deck`. These buttons should join that language, not add a fifth one.
The mute toggle's *styling* lives in `src/ui/audio/audio.css`, which is inside the parked audio
directory — treat any change there as needing an explicit go, or style it from the header side.

**Verify wider than the change.** Both of STAGE-021's bugs escaped a 1038-test suite and 375/430px
renders. Check a short desktop window and at least Whimsy + Diner + Arctic.

## Dependencies

### Depends on
- STAGE-020, STAGE-021 (both shipped) — the framing language and layout this must match.

## Stage-Level Reflection
*Filled in when status moves to shipped.*
