---
stage:
  id: STAGE-023
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
  advances: "Finishes the two visual items still open, so the project can close without known-ugly bits."
  delivers:
    - "The symbol watermark on all six machines, not just the trial one."
    - "A winning paw-print that looks deliberate rather than pasted over the symbol."
  explicitly_does_not:
    - "Touch src/ui/audio/** — the no-sound-on-iPhone report goes to the next project's backlog."
    - "Build the machine picker sheet (SPEC-094) or the heavier chrome pass — both resolved at project ship."
---

# STAGE-023: Watermark rollout + paw polish

## What This Stage Is
The last two visual items before PROJ-006 closes: roll the watermark out past its one-machine trial,
and fix the winning paw-print, which the owner described as *"not the worst, it just doesn't look
good."*

## Why Now
Both are the owner's calls, made after living with the shipped result. Closing a project whose
thesis is "the cabinet looks finished" while a known-ugly element remains would undercut the thesis.

## Success Criteria
- All six machines show their own symbol watermark; each reads against its own palette.
- The paw-print no longer sits dead-centre over the symbol, and its colour contrasts the cell.
- Full gate green; no `src/engine/**` diff; `src/ui/audio/**` untouched.

## Spec Backlog
- [ ] SPEC-104 (design) — Watermark rollout to all six machines.
- [ ] SPEC-105 (design) — Winning paw-print: off-centre + contrasting colour.

**Count:** 0 shipped / 2 active / 0 pending

## Design Notes

**The paw is an emoji**, so `color` does nothing to it — the same constraint SPEC-098 hit. The
monochrome technique proved there (`color: transparent` + zero-blur `text-shadow`) is what gives it
a token-driven contrasting colour, and SPEC-101's lesson applies too: emoji ink boxes overflow their
line boxes, so anything positioned tightly needs slack.

**Watermark contrast is deliberately low** (measured 1.78–2.52:1 face). It is `aria-hidden`
decoration carrying no information, so text-contrast rules do not apply — but Arctic is the faintest
and is the one to eyeball rather than trust the number.

## Dependencies

### Depends on
- STAGE-021 (shipped) — SPEC-098/100/101 built and fixed the watermark this rolls out.

## Stage-Level Reflection
*Filled in when status moves to shipped.*
