---
# Maps to ContextCore epic-level conventions.
# A Stage is a coherent chunk of work within a Project.
# It has a spec backlog and ships as a unit when the backlog is done.

stage:
  id: STAGE-003                     # stable, zero-padded within the project
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

## Why Now

The engine (STAGE-002) is complete and frozen behind `src/engine/index.ts`, and
the cabinet (STAGE-001) gives us the four layout regions and tokens. This is the
stage where the two halves meet: the thesis claim — an animation-heavy UI sitting
on a DOM-free engine without leaking logic back — only becomes *true* once a real
spin renders. Doing it now, before the celebration layer (STAGE-004), keeps the
hard wiring (state machine, engine calls, persistence) separate from the
subjective juice work, so each gets the right kind of review.

## Success Criteria

- Pressing **Spin** calls the engine `spin({ seed, balance, bet })` once, renders
  the returned 5×3 grid in the reel frame, and updates the displayed balance to the
  engine's new balance — the UI never recomputes game outcomes itself (DEC-001).
- The spin flow moves through explicit states **idle → spinning → resolved** and
  back to idle, with a reel-stop bounce; controls are disabled mid-spin.
- **Bet** +/− cycles 10 / 25 / 50 and is blocked when the balance can't cover the
  next bet; **Spin** is disabled when `balance < bet`.
- **Auto-spin** repeats with an inter-spin delay and stops on jackpot, count
  exhaustion (default 10), or `balance < bet`.
- **Balance persists** to localStorage across reloads; **Reset** restores 1000.
- Winning lines from the engine's `lineWins` get a basic highlight (no particles,
  count-up, jackpot moment, or audio — those are STAGE-004).
- Behavior is unit-tested (RTL: state transitions, control enable/disable, engine
  called with the right args, persistence) and visually verified in the preview at
  phone (375px) and desktop; `prefers-reduced-motion` is respected from the start
  (constraint `respect-reduced-motion`) so STAGE-005's audit isn't a rewrite.

## Scope

### In scope
- A reel-grid component rendering the engine's `Grid` as emoji (DEC-006), mapping
  `SymbolId → emoji` in the **UI** (the engine stays glyph-free).
- The spin-flow state machine (idle/spinning/resolved) wired to `spin()`, including
  UI-side seed generation per spin (the engine only consumes a provided seed).
- Spin button, bet +/− controls, auto-spin toggle, Reset — all ≥44px
  (constraint `touch-targets-44`, inherited from STAGE-001).
- Reel spin/stop CSS-transform animation + reel-stop bounce (DEC-004), with a
  reduced-motion path.
- Balance persistence to localStorage and rehydration on load.
- A basic winning-line highlight driven by `lineWins`.

### Explicitly out of scope
- Win celebrations beyond the basic line highlight — particles, the wolf jackpot
  moment, balance count-up, tier-scaled feel (STAGE-004).
- Any audio (STAGE-004 / STAGE-005).
- Any change to engine logic — the UI consumes `src/engine/index.ts` only and adds
  no game rules.
- The full a11y audit (contrast, colorblind-safe shapes, the formal reduced-motion
  pass) — STAGE-005; here we only avoid actively breaking reduced-motion.

## Build order & dependencies (within the stage)

Suggested order: **reel grid** (render a static `Grid`) → **spin button + flow**
(wire `spin()`, idle→spinning→resolved, balance update) → **bet controls** →
**balance persistence + Reset** → **reel spin/stop animation** (layer feel onto the
working flow) → **auto-spin** (loop over the flow) → **winning-line highlight**.
Rendering + the spin-flow state machine are the spine; animation, auto-spin, and
the highlight layer onto a flow that already works and is testable.

## Testing approach (note — differs from STAGE-002)

Unlike the pure-logic engine, this stage's specs are tested with **React Testing
Library** for *behavior and state* — spin transitions idle→spinning→resolved, the
engine is called with the expected `{ seed, balance, bet }`, controls
enable/disable correctly, balance persists/rehydrates — **not** pixel-exact
animation or feel (AGENTS §12). The animation and overall look are verified with a
**preview screenshot** check (375px + desktop), the same way SPEC-004 was. Failing
Tests in each spec are real RTL assertions; the visual/feel parts are called out
explicitly as review/screenshot checks, not unit tests.

## Spec Backlog

One-liners only at this stage; expand each via Prompt 2b in its own session.

Format: `- [status] SPEC-ID (cycle) — one-line summary`

- [x] SPEC-012 (shipped 2026-06-23) — Reel grid component: render the engine's 5×3 `Grid` as emoji (`SymbolId → emoji` map in the UI) in the wooden frame. **[S]**
- [x] SPEC-013 (shipped 2026-06-23) — Spin button + spin-flow wired to `spin()`: UI-side seed per spin, balance/grid update, Spin disabled when balance < bet (animated spinning phase deferred to the animation spec). **[M]**
- [x] SPEC-014 (shipped 2026-06-23) — Bet +/− controls cycling 10 / 25 / 50 (engine `nextBet`/`prevBet`/`canAfford`), disabled at the affordable cap/floor. **[S]**
- [x] SPEC-015 (shipped 2026-06-23) — Balance persistence to localStorage + rehydrate on load + Reset restoring 1000 (DEC-005). **[S]**
- [x] SPEC-016 (shipped 2026-06-23) — Reel spin/stop animation: idle → spinning → stopped with the reel-stop bounce (CSS transforms per DEC-004), reduced-motion path. **[M]**
- [x] SPEC-017 (shipped 2026-06-25) — Auto-spin toggle: repeats with inter-spin delay; stops on jackpot, count exhaustion (default 10), or balance < bet. **[M]**
- [ ] (not yet written) — Basic winning-line highlight driven by `lineWins` (no full celebration yet). **[S]**

**Count:** 6 shipped / 0 active / 1 pending — sized at Stage Frame (4×S, 3×M; no L). Reordered so the renderable spin flow lands before animation/auto-spin/highlight layer onto it.

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
