---
# Maps to ContextCore epic-level conventions.
# A Stage is a coherent chunk of work within a Project.
# It has a spec backlog and ships as a unit when the backlog is done.

stage:
  id: STAGE-005                     # stable, zero-padded within the project
  status: proposed                  # proposed | active | shipped | cancelled | on_hold
  priority: medium                  # critical | high | medium | low  (stretch)
  target_complete: null             # optional: YYYY-MM-DD

project:
  id: PROJ-001                      # parent project
repo:
  id: animal-slots

created_at: 2026-06-18
shipped_at: null

# What part of the project's value thesis this stage advances.
value_contribution:
  advances: >-
    Hardens the thesis rather than extending it: takes the playable, juiced
    game from a demo toward something defensible — a full audio bed, motion and
    contrast accessibility, and a measured 60fps pass — which is also where the
    template's verify cycle is most likely to earn its keep on non-CRUD work.
  delivers:
    - "The full audio suite: generative ambient music bed, complete SFX set (spin whoosh, reel-stop clunk, win tings), and dynamic mixing (swell on big win, duck for the jackpot howl), building on STAGE-004's jingle."
    - "prefers-reduced-motion support with non-animated win-feedback paths."
    - "A contrast + 44px touch-target audit and colorblind-safe symbol shapes."
    - "A performance pass holding the ~60fps spin/celebration target on a mid-tier phone."
  explicitly_does_not:
    - "Introduce new game mechanics, themes, or symbols (those are PROJ-002)."
    - "Replace synthesized audio with an asset pipeline (still no audio files; see DEC-007)."
    - "Add accounts, persistence beyond local, or any backend."
---

# STAGE-005: Audio suite, a11y & polish (stretch)

## What This Stage Is

The stretch hardening stage. It builds STAGE-004's single win jingle out into a
full **synthesized audio suite** — a generative ambient music bed, a complete
SFX set (spin whoosh, reel-stop clunk, win tings), and dynamic mixing (swell on
a big win, duck under the jackpot howl) — still with no audio asset files
(`DEC-007`). Alongside the audio, it does the accessibility and performance work
the earlier stages deliberately deferred: `prefers-reduced-motion` with
non-animated win-feedback paths, a contrast and 44px touch-target audit,
colorblind-safe symbol shapes, and a measured 60fps performance pass on a
mid-tier phone. When this stage ships, the game is not just playable and juicy
but accessible and performant — the difference between a demo and something you
could put in front of anyone.

## Why Now / Success Criteria / Scope / Design Notes / Dependencies

*Framed lightly for now. This is a stretch stage — only frame and schedule it
(via Prompt 1c) if STAGE-001…004 land with momentum to spare. Relevant
decisions: `DEC-004` (animation approach feeds the perf pass), `DEC-007`
(synthesized audio, no asset pipeline). Relevant constraints:
`respect-reduced-motion`, `touch-targets-44`, `perf-60fps`,
`audio-gesture-and-mute`.*

## Spec Backlog

One-liners only at this stage; expand each via Prompt 2b in its own session.

Format: `- [status] SPEC-ID (cycle) — one-line summary`

- [ ] (not yet written) — Generative ambient music bed (Tone.js), gated by the existing mute + gesture unlock.
- [ ] (not yet written) — Complete SFX set: spin whoosh, reel-stop clunk, win tings.
- [ ] (not yet written) — Dynamic mixing: swell on big win, duck for the jackpot howl.
- [ ] (not yet written) — `prefers-reduced-motion`: non-animated feedback paths for spin and celebrations.
- [ ] (not yet written) — Contrast + 44px touch-target audit and fixes.
- [ ] (not yet written) — Colorblind-safe symbol shapes (distinguishable beyond color).
- [ ] (not yet written) — Performance pass: measure and hold ~60fps spin/celebration on a mid-tier phone.

**Count:** 0 shipped / 0 active / 7 pending (estimate — refine at Stage Frame)

## Design Notes

All audio stays synthesized (no asset pipeline) per `DEC-007`; the one possible
exception (a single CC0 wolf-howl sample) is parked for PROJ-002, not promised
here. Accessibility work formalizes paths the earlier stages were asked to keep
open rather than retrofitting from scratch.

## Dependencies

### Depends on
- STAGE-004 — the win jingle and juice this stage generalizes.
- STAGE-003 — the spin flow whose motion gets a reduced-motion path and perf pass.

### Enables
- PROJ-002 — anticipation reel-slowdown, haptics, theme-swap, day/night sky, etc.

## Stage-Level Reflection

*Filled in when status moves to shipped. Run Prompt 1d (Stage Ship) to draft.*
