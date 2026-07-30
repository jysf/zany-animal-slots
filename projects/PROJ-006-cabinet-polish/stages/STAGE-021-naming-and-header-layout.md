---
stage:
  id: STAGE-021
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

Planned as two specs; shipped as **eight**. Every addition after SPEC-096 came from the owner using
the previous one — see the reflection.

- [x] SPEC-095 (shipped 2026-07-29) — Rename the default machine to Whimsy + changelog v1.3. PR #107.
- [x] SPEC-096 (shipped 2026-07-29) — Restore the app title; relocate the switcher. PR #108.
- [x] SPEC-097 (shipped 2026-07-29) — One horizontal rhythm across the cabinet bands. PR #109.
- [x] SPEC-098 (shipped 2026-07-29) — Theme background pattern (monochrome watermark), one-machine
  trial. PR #110.
- [x] SPEC-099 (shipped 2026-07-29) — **bug:** desktop cabinet clipped its own controls. PR #111.
- [x] SPEC-100 (shipped 2026-07-29) — Watermark in the win band and control deck. PR #112.
- [x] SPEC-101 (shipped 2026-07-29) — **bug:** watermark glyphs sliced in half. PR #113.
- [x] SPEC-102 (shipped 2026-07-29) — Adaptive cabinet height. PR #114.

**Count:** 8 shipped / 0 active / 0 pending

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

*Shipped 2026-07-29. Eight specs against a planned two; two of them bugs I introduced.*

- **Did we deliver the outcome?** Yes, and then well past it. Planned: rename the default machine,
  restore the title, move the switcher. Delivered: those, plus a shared horizontal rhythm, a
  monochrome symbol watermark across three bands, adaptive height, and fixes for two defects the
  work itself created.
- **How many specs did it take?** **Eight, against a planned two.** Not scope creep in the bad
  sense — every addition after SPEC-096 came from the owner *using* the previous result and
  reporting back, on real devices we had never tested (iPhone Safari, Chrome iOS, DuckDuckGo/macOS).
  That is the loop working. But a stage scoped for two specs should have been closed and re-opened
  around SPEC-098 rather than absorbing six more.
- **The two bugs are the real lesson.** Both were mine, both invisible to a 1038-test suite, and
  both found only because the owner used the app somewhere we hadn't looked:
  - **SPEC-099** — `overflow: hidden` (added for rounded corners) plus a stale `max-height` from
    when the cabinet was viewport-sized silently truncated the machine. **The Spin button was
    unreachable on any desktop window under ~795px tall.** When a spec changes *how an element is
    sized*, every existing rule constraining that element has to be re-read; I saw the `height`
    rule, changed it to `max-height`, and preserved the bug in a quieter form.
  - **SPEC-101** — `flex-wrap` made a decorative row count depend on container width, slicing
    12-of-36 glyphs at *every* width. I had tuned the glyph count by eye at one width.
- **What this stage proves about verification.** The stage before it concluded "the render is the
  test". This one sharpens it twice over: **the render finds visual bugs, the DOM measures them**
  (SPEC-097's four conflicting band edges were invisible until `getBoundingClientRect` produced a
  table), and **rendering at 375/430px is not coverage** — both bugs lived outside that range.
  `portrait-first` makes phone primary; it does not make phone the only thing worth checking.
- **One thing I overstated.** SPEC-102's option preview promised "no scrolling at any height". The
  real behaviour is no scrolling to ~530px, then a readability floor. An option's preview is a
  commitment; that one overstated by omission and is corrected in the spec.
- **Carried forward, none started:** the winning paw-print change (requested early in the stage and
  genuinely not done), the watermark rollout decision for the other five machines, no sound on
  iPhone (parked `src/ui/audio/**`, needs an explicit go), and header button polish → STAGE-022.
