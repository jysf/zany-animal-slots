---
# Maps to ContextCore epic-level conventions.
# A Stage is a coherent chunk of work within a Project.
# It has a spec backlog and ships as a unit when the backlog is done.

stage:
  id: STAGE-003                     # stable, zero-padded within the project
  status: proposed                  # proposed | active | shipped | cancelled | on_hold
  priority: high                    # critical | high | medium | low
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
    Proves the two halves of the thesis meet cleanly: the presentation layer
    consumes the STAGE-002 engine through its typed interface to produce a
    playable spin, demonstrating that an animation-heavy UI can sit on top of a
    DOM-free engine without leaking logic back across the boundary.
  delivers:
    - "A playable slot: wooden-frame 5×3 grid that spins and stops on real engine output."
    - "Campfire spin button, bet +/− controls, and an auto-spin toggle."
    - "The idle → spinning → stopped flow with a reel-stop bounce."
    - "Balance persisted to localStorage, with the Reset control restoring 1000."
  explicitly_does_not:
    - "Implement win celebrations beyond a basic winning-line highlight (STAGE-004)."
    - "Add particles, the wolf jackpot moment, balance count-up, or audio (STAGE-004)."
    - "Change any engine logic — the UI only consumes the engine's interface."
---

# STAGE-003: Reels UI & spin flow

## What This Stage Is

The game becomes playable. This stage wires STAGE-002's engine to the
presentation layer built in STAGE-001: a wooden-frame 5×3 reel grid rendering
emoji symbols, a campfire spin button, bet +/− controls, and an auto-spin
toggle. Pressing spin runs the engine, animates the reels through
idle → spinning → stopped with a reel-stop bounce, and settles on the real
landed grid. Balance now persists to localStorage and the Reset control
restores it to 1000. When this stage ships, a player can actually spin, bet,
and watch the balance move — but the celebratory payoff (particles, jackpot
moment, jingle) is intentionally still flat, reserved for STAGE-004.

## Why Now / Success Criteria / Scope / Design Notes / Dependencies

*Framed lightly for now. Expand via Prompt 1c (Stage Frame) when this stage
becomes active. Relevant decisions: `DEC-001` (engine/presentation separation —
the UI consumes the engine only through its typed interface), `DEC-004` (CSS
transform / keyframe animation for the reels), `DEC-005` (balance persistence
is local-only, play-money), `DEC-006` (emoji symbols).*

## Spec Backlog

One-liners only at this stage; expand each via Prompt 2b in its own session.

Format: `- [status] SPEC-ID (cycle) — one-line summary`

- [ ] (not yet written) — Reel grid component: render the engine's 5×3 emoji grid in the wooden frame.
- [ ] (not yet written) — Spin button (campfire) wired to the engine `spin()` call and bet/balance update.
- [ ] (not yet written) — Bet +/− controls cycling 10 / 25 / 50, disabled when balance < bet.
- [ ] (not yet written) — Reel spin/stop animation: idle → spinning → stopped with the reel-stop bounce (CSS transforms per DEC-004).
- [ ] (not yet written) — Auto-spin toggle: repeats with inter-spin delay; stops on jackpot, count exhaustion (default 10), or balance < bet.
- [ ] (not yet written) — Balance persistence to localStorage + Reset restoring 1000.
- [ ] (not yet written) — Basic winning-line highlight (no full celebration yet).

**Count:** 0 shipped / 0 active / 7 pending (estimate — refine at Stage Frame)

## Design Notes

Animation is CSS transform / keyframe based (`DEC-004`), not canvas/WebGL. Keep
the reduced-motion path in mind even here (constraint `respect-reduced-motion`)
so STAGE-005's audit isn't a rewrite.

## Dependencies

### Depends on
- STAGE-002 — the engine interface this UI drives.
- STAGE-001 — layout regions and design tokens.

### Enables
- STAGE-004 — celebrations hook onto the spin-resolved + win-tier output.

## Stage-Level Reflection

*Filled in when status moves to shipped. Run Prompt 1d (Stage Ship) to draft.*
