---
# Maps to ContextCore project.* semantic conventions.
# A project is a bounded wave of work against the repo (the app).

project:
  id: PROJ-001
  status: active
  priority: high
  target_ship: null                 # play/dogfood project — no hard external date

repo:
  id: animal-slots

created_at: 2026-06-18
shipped_at: null

# Business value. Testable claim, not marketing copy.
value:
  thesis: >-
    An animation-heavy slot game can be delivered as a small web app with game
    logic cleanly separable from presentation — and doing so exercises the
    spec-driven template against a real-time, frontend-heavy, non-CRUD project,
    surfacing gaps the example CRUD flow doesn't.
  beneficiaries:
    - "Template maintainer (dogfooding the template against a non-CRUD app)"
    - "Frontend devs evaluating the template for real-time / animation work"
    - "Players wanting a quick, fun, play-money demo"
  success_signals:
    - "All five states (idle / spinning / small-win / big-win / jackpot) are reachable and visually distinct."
    - "The engine has high unit-test coverage and zero React/DOM imports."
    - "A full spin → win → reset cycle holds ~60fps on a mid-tier phone."
    - "At least one spec completes design → build → verify → ship without the cycle structure fighting the work."
    - "The first weekly review surfaces at least one concrete template improvement."
  risks_to_thesis:
    - "Subjective 'juice' work resists TDD, making the ## Failing Tests section feel like busywork."
    - "Verify can't meaningfully review feel, so the cycle adds overhead without catching much."
    - "Game-math tuning loops don't fit one-spec-per-branch cleanly."
---

# PROJ-001: Animal Slots — MVP

## What This Project Is

Animal Slots is a play-money, mobile-first web slot game themed on North
American wildlife ("Wild & Whimsical"). This wave of work — the MVP — delivers
a fully playable, juiced 5×3 slot: real spin/win logic plus the celebratory
feel from the design spec, built as a small web app whose game logic is cleanly
separable from its presentation. The engine (RNG, reels, paylines, paytable,
bet/balance state) is pure TypeScript with zero DOM coupling; the presentation
layer (React + CSS animation) consumes it through a typed interface.

## Why Now

This is the first project in the repo. It exists for two reasons at once. As a
product, it's a self-contained, shippable demo that needs no backend, accounts,
or payments. As a process, it is a deliberate dogfood vehicle: the spec-driven
template has so far only been exercised against an example CRUD flow, and a
real-time, animation-heavy, non-CRUD frontend is exactly the kind of project
that stress-tests whether the design → build → verify → ship cycle helps or
gets in the way. Building it now tells us where the template needs to bend
before we trust it on harder work.

## Success Criteria

- All five game states (idle, spinning, small-win, big-win, jackpot) are
  reachable and visually distinct in the running app.
- The engine is fully unit-tested with zero React/DOM imports — spins are
  deterministic under a seeded RNG.
- A full spin → win → reset cycle holds ~60fps on a mid-tier phone.
- At least one spec completes the full design → build → verify → ship loop
  without the cycle structure fighting the animation work.
- The first weekly review surfaces at least one concrete, actionable template
  improvement (the dogfood payoff).

## Scope

### In scope
- Playable 5×3 slot engine (seedable RNG, weighted reels, spin resolution).
- 5 fixed paylines + paytable evaluation; multiple lines can hit per spin.
- Bet levels x1 / x2 / x3 (total bet 10 / 25 / 50 coins).
- Balance (start 1000) with a Reset control; balance persists in localStorage.
- Auto-spin (default 10 spins; stops on jackpot, count exhaustion, or
  balance < bet).
- All five visual states with win celebrations, including the wolf jackpot
  moment.
- A tier-scaled synthesized win jingle (Tone.js) with a global mute toggle and
  first-gesture audio unlock.
- Design-token system (colors, type scale, spacing as CSS custom properties).
- Portrait-first layout that also centers nicely in a device frame on desktop.
- Emoji symbols (placeholder art).

### Explicitly out of scope (v1)
- Real money / IAP / payments of any kind. (See constraint `no-real-money`.)
- Custom illustrated / SVG art — emoji placeholders only.
- Configurable paylines (fixed set only).
- Multiple themes (Arctic / Desert are future projects).
- The full audio suite (ambient music bed, complete SFX set, dynamic mixing)
  beyond the single win jingle.
- Accounts / leaderboards / any backend.
- Internationalization (i18n).

## Stage Plan

- [ ] STAGE-001 (active) — Scaffold & design system (Vite + React + TS boots; design tokens; four-region portrait layout; no game logic).
- [ ] STAGE-002 (pending) — Slot engine: pure logic, zero DOM (RNG, reels, spin resolution, paylines/paytable, bet/balance, win-tier classification; fully unit-tested).
- [ ] STAGE-003 (pending) — Reels UI & spin flow (wire engine to UI; grid, spin button, bet controls, auto-spin; idle → spinning → stopped with reel-stop bounce).
- [ ] STAGE-004 (pending) — Win celebration & juice (small/big/jackpot states, payline trail, particles, wolf jackpot moment, balance count-up, tier-scaled win jingle + mute).
- [ ] STAGE-005 (stretch) — Audio suite, a11y, polish (full audio suite, prefers-reduced-motion, contrast/44px audit, colorblind-safe shapes, perf pass).

**Count:** 0 shipped / 1 active / 4 pending

## Dependencies

### Depends on
- None. This is the first project in the repo.

### Enables
- PROJ-002 (parked) — a fuller audio suite, anticipation reel-slowdown, haptics,
  day/night sky, theme-swap (Arctic / Desert), session stats, and other polish.
  Promote into a PROJ-002 frame only if this project gains momentum.

## Project-Level Reflection

*To be filled in when this project ships.*

- **Did we deliver the outcome in "What This Project Is"?** <not yet>
- **How many stages did it actually take?** <not yet>
- **What changed between starting and shipping?** <not yet>
- **Lessons that should update AGENTS.md, templates, or constraints?** <not yet>
- **What did we defer to the next project?** <not yet>
