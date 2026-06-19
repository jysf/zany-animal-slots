---
# Maps to ContextCore epic-level conventions.
# A Stage is a coherent chunk of work within a Project.
# It has a spec backlog and ships as a unit when the backlog is done.

stage:
  id: STAGE-004                     # stable, zero-padded within the project
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
    Completes the "animation-heavy slot game" half of the thesis and is the
    sharpest dogfood test: the celebratory feel work (juice + the one shipping
    audio piece) is exactly the subjective, non-CRUD work the template's
    design→build→verify→ship cycle has never been exercised against.
  delivers:
    - "The three win celebrations — small, big, and jackpot — as distinct, reachable states."
    - "Payline paw-print trail and particle effects (leaves / acorns)."
    - "The wolf jackpot moment (howl visual + moon scene) and a balance count-up."
    - "A tier-scaled synthesized win jingle (Tone.js) keyed off the engine's existing win-tier output, with a global mute toggle and first-gesture audio unlock."
  explicitly_does_not:
    - "Build the full audio suite — ambient bed, complete SFX set, dynamic mixing are STAGE-005 / PROJ-002."
    - "Add any engineered near-miss or faked anticipation; celebrations reflect only what actually landed."
    - "Do the formal a11y / contrast / colorblind / perf audit (STAGE-005)."
---

# STAGE-004: Win celebration & juice

## What This Stage Is

The payoff. This stage makes winning *feel* like winning. Building on
STAGE-003's playable spin, it adds the three celebration states — small, big,
and jackpot — each visually distinct: a payline paw-print trail tracing the
winning line, particle effects (leaves / acorns), a balance count-up, and the
showpiece wolf jackpot moment (howl + moon scene) on the five-Wolf 200× hit.
It also ships the **one** piece of audio that belongs in a core stage: a
tier-scaled synthesized win jingle (Tone.js) keyed off the engine's existing
win-tier classification — a short arpeggio for small, a longer flourish for
big, a triumphant run for jackpot — gated behind a global mute toggle and a
first-gesture audio unlock. Everything else audio-related is STAGE-005 /
PROJ-002. When this stage ships, all five game states are reachable and
visually (and, for wins, audibly) distinct.

## Why Now / Success Criteria / Scope / Design Notes / Dependencies

*Framed lightly for now. Expand via Prompt 1c (Stage Frame) when this stage
becomes active. Relevant decisions: `DEC-004` (CSS transform / keyframe
animation for celebrations), `DEC-007` (synthesized Tone.js audio, win-jingle
only in v1, gated behind first gesture + global mute). The win jingle is the
backlog rider spec called out in the project plan (S).*

## Spec Backlog

One-liners only at this stage; expand each via Prompt 2b in its own session.

Format: `- [status] SPEC-ID (cycle) — one-line summary`

- [ ] (not yet written) — Win-state router: map engine win-tier (small / big / jackpot) to the celebration to fire.
- [ ] (not yet written) — Payline paw-print trail tracing the winning line(s).
- [ ] (not yet written) — Particle effects (leaves / acorns) scaled to win tier.
- [ ] (not yet written) — Balance count-up animation on a win.
- [ ] (not yet written) — Wolf jackpot moment: howl visual + moon scene on the five-Wolf hit.
- [ ] (not yet written) — Tier-scaled synthesized win jingle (Tone.js) keyed off win-tier — **backlog rider [S]**.
- [ ] (not yet written) — Global mute toggle (persisted) + first-gesture audio unlock (constraint `audio-gesture-and-mute`).

**Count:** 0 shipped / 0 active / 7 pending (estimate — refine at Stage Frame)

## Design Notes

The jingle is **keyed off the engine's existing win-tier output** — no new game
math, no faked closeness. Per the project's taste note, anticipation/celebration
must be driven by symbols that actually landed; engineered near-misses are out
even with play money. Audio must respect the browser autoplay policy (no sound
before a user gesture) and the always-available, persisted mute
(`audio-gesture-and-mute`), and celebrations need a non-animated feedback path
for reduced motion (`respect-reduced-motion`).

## Dependencies

### Depends on
- STAGE-003 — the spin flow and the engine's win-tier output that celebrations key off.

### Enables
- STAGE-005 — the full audio suite and polish build on this stage's jingle and juice.

## Stage-Level Reflection

*Filled in when status moves to shipped. Run Prompt 1d (Stage Ship) to draft.*
