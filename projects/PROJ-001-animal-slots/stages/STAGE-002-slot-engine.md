---
# Maps to ContextCore epic-level conventions.
# A Stage is a coherent chunk of work within a Project.
# It has a spec backlog and ships as a unit when the backlog is done.

stage:
  id: STAGE-002                     # stable, zero-padded within the project
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
    Directly proves the "game logic cleanly separable from presentation" half
    of the thesis: a complete, deterministic slot engine that is fully
    unit-tested with zero React/DOM imports, validating that the hard part of a
    slot game can live behind a typed interface with no UI coupling.
  delivers:
    - "A pure-TypeScript slot engine: seedable RNG, weighted reel strips, 5×3 spin resolution, 5-payline + paytable evaluation, bet/balance state machine, and win-tier classification (small / big / jackpot)."
    - "A typed interface the presentation layer will consume in STAGE-003."
    - "High unit-test coverage with deterministic spins under a seeded RNG."
  explicitly_does_not:
    - "Render anything or import React/DOM (enforced by the engine-no-dom boundary)."
    - "Add animation, timing, or any notion of a spin taking wall-clock time."
    - "Persist balance to localStorage — wiring persistence is STAGE-003's job."
    - "Fire any celebration or audio; it only classifies the win tier as data."
---

# STAGE-002: Slot engine (pure logic, zero DOM)

## What This Stage Is

The brain of the game, with no face. This stage delivers the complete slot
**engine** as pure TypeScript under `src/engine/**`, with zero React or DOM
imports: a single injected seedable PRNG (mulberry32-style) driving weighted
reel strips, a 5×3 spin resolver, evaluation of the five fixed paylines against
the tier paytable (summing all line wins), a bet/balance state machine, and
win-tier classification (small / big / jackpot). Because every source of
randomness is injected, spins are fully deterministic in tests — the engine is
unit-tested to high coverage. When this stage ships, you can drive a full
spin → evaluate → settle cycle from a test, with no browser in sight. It is the
load-bearing evidence for the project thesis.

## Why Now

The engine is the riskiest part of the thesis and the cheapest to test, so it
comes before any UI wiring. Establishing the typed engine interface now lets
STAGE-003 consume a stable contract rather than co-evolving logic and
presentation. It depends only on STAGE-001's scaffold and the `engine-no-dom`
boundary already being in place.

## Why Now / Success Criteria / Scope / Design Notes / Dependencies

*Framed lightly for now. Expand via Prompt 1c (Stage Frame) when this stage
becomes active. Authoritative game rules live in the project's design spec
section of `brief.md` and in `DEC-002` (seedable RNG), `DEC-003` (fixed
paylines), and `DEC-005` (play-money / no-RTP).*

## Spec Backlog

One-liners only at this stage; expand each via Prompt 2b in its own session.

Format: `- [status] SPEC-ID (cycle) — one-line summary`

- [ ] (not yet written) — Seedable RNG module (mulberry32) + injection seam; no bare `Math.random()` anywhere in `src/engine/**`.
- [ ] (not yet written) — Symbol set + weighted reel strips (common animals frequent, Wolf rare); strip-to-grid stop logic.
- [ ] (not yet written) — 5×3 spin resolver: given seed/strips, produce the visible grid.
- [ ] (not yet written) — Payline + paytable evaluation: 5 fixed lines, 3/4/5-of-a-kind per tier, sum of all line wins.
- [ ] (not yet written) — Bet/balance state machine: bet levels 10/25/50, balance debit/credit, reset to 1000.
- [ ] (not yet written) — Win-tier classification: small (<5× bet) / big (≥5× bet) / jackpot (five Wolves), exposed as data.
- [ ] (not yet written) — Public engine interface: typed `spin()` surface the UI consumes, with the engine's outputs fully described.

**Count:** 0 shipped / 0 active / 7 pending (estimate — refine at Stage Frame)

## Design Notes

See `DEC-001`, `DEC-002`, `DEC-003`, `DEC-005`. Reel-strip weights are tuned for
feel (wins land often enough to be fun; balance drifts down over a long
session), explicitly **not** a regulated RTP — do not advertise an RTP number.

## Dependencies

### Depends on
- STAGE-001 — scaffold, TypeScript config, and the `engine-no-dom` boundary.

### Enables
- STAGE-003 — the UI consumes this engine's typed interface.

## Stage-Level Reflection

*Filled in when status moves to shipped. Run Prompt 1d (Stage Ship) to draft.*
