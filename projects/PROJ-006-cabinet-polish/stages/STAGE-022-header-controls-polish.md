---
stage:
  id: STAGE-022
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
- [x] SPEC-103 (shipped 2026-07-29) — Header control row visual treatment. PR #116.

**Count:** 1 shipped / 0 active / 0 pending

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

*Shipped 2026-07-29. One spec, as scoped — which was the entire point.*

- **Did we deliver the outcome?** Yes. The four header triggers now read as recessed keys in the
  cabinet's existing depth language, with each machine's own bezel colour and no per-machine code.
- **How many specs did it take?** **One, against a planned one.** Deliberately noted: the previous
  stage was scoped for two and absorbed eight. Opening a fresh stage for a single concern, shipping
  it, and closing it the same session is the corrective, and it worked.
- **The useful diagnosis.** "These look unstyled" meant "these are styled four times, identically,
  by default" — the same rule copy-pasted across four component stylesheets. The duplication was
  the cause, not a side detail. When sibling controls look generic, check for a copied rule before
  reaching for a new visual idea.
- **A constraint that improved the design.** `src/ui/audio/**` is parked, and the mute toggle's
  styling lives there. Being unable to touch it forced styling from the *parent* (the grouped
  selector in `regions.css`) — which is also the better answer: one place instead of four, and each
  component keeps its standalone appearance. The restriction produced a cleaner result than free
  rein would have.
- **Verification habit stuck.** Both of STAGE-021's bugs hid outside the 375/430px renders, so this
  stage checked a short desktop window as routine rather than as a special case. Clipping 0, Spin
  above the fold, keys measured 48×48.
- **Not fixed, only bypassed.** The four components still each carry the old transparent style for
  use outside the header. A fifth trigger would arrive with the same copied rule and look wrong
  until added to the grouped selector; a shared `.icon-trigger` class is the real fix and would
  have to touch the parked `audio.css`.
- **Carried forward, none started:** the winning paw-print change (now the oldest open request), the
  watermark rollout decision for the other five machines, and no sound on iPhone (parked audio,
  needs an explicit go).
