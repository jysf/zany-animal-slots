---
stage:
  id: STAGE-021
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
  advances: "Second pass on STAGE-020's switcher, driven by the owner living with it: shorter machine name, app title restored, control moved to the deck."
  delivers:
    - "The default machine renamed to 'Whimsy' — display name only, so saved trophies and balance survive."
    - "The app title back in the header, with the machine switcher relocated between the readout and the spin controls."
  explicitly_does_not:
    - "Change any machine's id — ids are saved-data keys (trophies, biggestWin, active machine)."
    - "Change any machine's math, symbols, or theme values."
    - "Rewrite already-published changelog entries — history stays as players saw it."
---

# STAGE-021: Naming + header layout

## What This Stage Is
STAGE-020 shipped the switcher; the owner then lived with it and asked for two changes. This is
that second pass — a shorter default-machine name, and putting the app title back while moving the
machine control down next to the spin buttons.

## Why Now
Directly owner-driven, both from using the shipped result:

1. *"we could change wild & whimsical to just whimsy"* — the 16-character name was the reason
   SPEC-093 had to shrink the marquee font, so the rename fixes a styling compromise at its source.
2. *"move the machine control between the balance line and the spin button line. bring back the old
   title."* — promoting the machine name **into** the title slot cost the app its identity in the
   header. Putting the control near the spin buttons also puts it in the thumb zone, where the
   things you actually press live.

## Success Criteria
- Default machine reads "Whimsy" everywhere in the UI; **its id is unchanged**, so existing
  trophies, `biggestWin`, and the persisted active machine still resolve.
- The app title is back in the header; the switcher sits between the readout and the control deck.
- No machine math/symbol/theme change; no `src/engine/**` diff; `src/ui/audio/**` untouched.

## Spec Backlog
- [ ] SPEC-095 (design) — Rename the default machine to Whimsy (display name only) + changelog v1.3.
- [ ] SPEC-096 (design) — Restore the app title; relocate the switcher below the readout.

**Count:** 0 shipped / 2 active / 0 pending

## Design Notes

**The id is a saved-data key, not a label.** `wild-and-whimsical` is stored in every trophy, in
`biggestWin`, and in the persisted active-machine value. Renaming the *id* would orphan all of it.
Only `name` changes; the const and filename keep the old spelling to match the id. The parity test
asserts the id explicitly so a future "tidy-up" can't quietly break saved data.

**SPEC-094 stays reserved** for the machine picker sheet (planned, deferred — see the PROJ-006
brief). `just new-spec` will suggest 094 because no file claims it; renumber to the next free
number rather than taking the reservation.

## Dependencies

### Depends on
- STAGE-020 (shipped) — the switcher and framing this refines.

### Enables
- SPEC-094 (picker sheet), unchanged in scope.

## Stage-Level Reflection
*Filled in when status moves to shipped.*
