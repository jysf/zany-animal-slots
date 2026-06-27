---
# Maps to ContextCore epic-level conventions.
# A Stage is a coherent chunk of work within a Project.
# It has a spec backlog and ships as a unit when the backlog is done.

stage:
  id: STAGE-004                     # stable, zero-padded within the project
  status: active                    # proposed | active | shipped | cancelled | on_hold
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

## Why Now

STAGE-003 made the slot playable but the win feedback is intentionally flat: a
win just makes the balance jump, with only a basic cell highlight and no sense of
*how much* you won or *what pays*. This stage makes winning legible and felt. It's
activated now to answer two concrete gaps first — **showing the win amount** and a
**paytable sheet** — and it's the project's sharpest dogfood test: subjective
"juice" is exactly the non-CRUD work the design→build→verify→ship cycle has never
been exercised against. The engine's `tier`, `lineWins`, and `totalWin` outputs
(plus the exported `PAYTABLE`/`SYMBOL_TIER`) are the data this stage presents — no
new game math.

## Success Criteria

- On a winning spin the player sees **how much they won** — a prominent win-amount
  indicator (a pop-up over the reels) and a persistent last-win readout — both
  driven by the engine's `totalWin`/`lineWins`; cleared on the next spin.
- A **paytable** is available on demand (an "ℹ Paytable" control opens a slide-up
  sheet) listing each tier's 3/4/5-of-a-kind payouts read from the engine's
  `PAYTABLE`/`SYMBOL_TIER` — accurate to what actually pays, closable, and
  keyboard/`Esc` accessible.
- The three win celebrations — small / big / jackpot — are reachable and visually
  distinct (paw-print trail, tier-scaled particles, the wolf jackpot moment, balance
  count-up).
- A tier-scaled synthesized win jingle (Tone.js, DEC-007) keyed off the engine's
  win tier, gated behind a global persisted mute + first-gesture unlock
  (`audio-gesture-and-mute`); celebrations have a non-animated path under
  `prefers-reduced-motion`.
- Everything keys off symbols that **actually landed** — no engineered near-miss or
  faked anticipation (project taste note).
- UI consumes the engine only via `src/engine/index.ts`; no engine change; behavior
  unit-tested (RTL) and verified in the preview.

## Scope

### In scope
- **Win-amount display** (this stage's first spec): pop-up badge over the reels +
  a persistent last-win readout, from `totalWin`.
- **Paytable sheet** (second spec): a toggle-opened slide-up overlay listing tier
  payouts from `PAYTABLE`/`SYMBOL_TIER`, with the symbols' emoji.
- Win-state routing (small/big/jackpot) and the celebrations: paw-print payline
  trail, tier-scaled particles (leaves / acorns), balance count-up, wolf jackpot
  moment (howl + moon scene).
- The single tier-scaled synthesized win jingle (Tone.js) + global persisted mute +
  first-gesture audio unlock.
- A `prefers-reduced-motion` path for the celebrations.

### Explicitly out of scope
- The full audio suite — ambient bed, complete SFX set, dynamic mixing (STAGE-005 /
  PROJ-002).
- Any engineered near-miss / faked anticipation.
- The formal a11y / contrast / colorblind / perf audit (STAGE-005).
- Any change to engine logic, the paytable values, or reel weights (those are
  DEC-011; the UI only *displays* them).

## Build order note (current slice)

The user asked for win-legibility first, so the backlog leads with **SPEC-019
(win-amount display)** then **SPEC-020 (paytable sheet)** — both pure presentation
of existing engine outputs, independent of the heavier celebration/audio work that
follows. This slice ships, then the stage pauses for review before the celebration
specs.

## Spec Backlog

One-liners only at this stage; expand each via Prompt 2b in its own session.

Format: `- [status] SPEC-ID (cycle) — one-line summary`

- [x] SPEC-019 (shipped 2026-06-27) — **Win-amount display**: show `totalWin` on a win — a pop-up badge over the reels + a persistent last-win readout. **[M]**
- [x] SPEC-020 (shipped 2026-06-27) — **Paytable sheet**: an "ℹ Paytable" button opens a slide-up overlay listing each tier's 3/4/5 payouts (engine `PAYTABLE`/`SYMBOL_TIER` + emoji); ✕/backdrop/Esc close. **[M]**
- [~] SPEC-021 (build) — **Win-state router**: a one-shot `celebration` signal from `useSlotMachine` (monotonic `id` per resolved win, carrying tier/totalWin/lineWins; `null` on a no-win) so celebrations fire once per win. **[S]**
- [ ] (not yet written) — Payline paw-print trail tracing the winning line(s). **[M]**
- [ ] (not yet written) — Particle effects (leaves / acorns) scaled to win tier. **[M]**
- [ ] (not yet written) — Balance count-up animation on a win. **[S]**
- [ ] (not yet written) — Wolf jackpot moment: howl visual + moon scene on the five-Wolf hit. **[M]**
- [ ] (not yet written) — Tier-scaled synthesized win jingle (Tone.js) keyed off win-tier — **backlog rider [S]**.
- [ ] (not yet written) — Global mute toggle (persisted) + first-gesture audio unlock (constraint `audio-gesture-and-mute`). **[S]**

**Count:** 2 shipped / 0 active / 7 pending — sized at Stage Frame. **Current slice (DONE):**
SPEC-019 (win amount) + SPEC-020 (paytable sheet) first, then pause; the
celebration/audio specs follow later.

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
