---
task:
  id: SPEC-090
  type: story
  cycle: ship
  blocked: false
  priority: low
  complexity: M
project:
  id: PROJ-005
  stage: STAGE-018
repo:
  id: animal-slots
agents:
  architect: claude-opus-4-8
  implementer: claude-opus-4-8
  created_at: 2026-07-24
references:
  decisions:
    - DEC-001
    - DEC-015
    - DEC-021
    - DEC-026
  constraints:
    - engine-no-dom
  related_specs:
    - SPEC-053   # Ocean — the machine template + measure-then-pin discipline
value_link: "The Farm machine — the high-variance fifth machine, as pure config."
cost:
  sessions:
    - cycle: design
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: null
      recorded_at: 2026-07-24
      note: >-
        Designed + built inline: the tuning is an iterative simulator loop (measure-then-pin) tightly
        coupled to `just simulate`, so it was done on the main loop rather than handed to a subagent.
        Authored DEC-026.
    - cycle: build
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: 70000
      estimated_usd: 1.40
      recorded_at: 2026-07-24
      note: >-
        farm.ts (barnyard symbols, green theme — contrast 16.13:1, audio params) + high-variance
        math tuned over ~5 simulator iterations to RTP ~94% / hit ~23% / big-tier ~6.6% / jackpot
        ~1-in-200k. Registered in registry.ts (selector auto-lists it). farm.test.ts (6 tests:
        registration, vocabulary, metrics-sanity, strip integrity, distinctness, theme a11y).
        Full gate green; symbol-uniqueness + machine-parity contracts pass; engine diff empty.
    - cycle: verify
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: 20000
      estimated_usd: 0.40
      recorded_at: 2026-07-24
      note: "Real render: Farm selectable (5 options), green theme + barnyard creatures, distinct. Contracts + full gate green. 0 defects."
    - cycle: ship
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      recorded_at: 2026-07-24
      note: "main-loop ship; own PR."
  totals:
    tokens_total: 90000
    estimated_usd: 1.80
    session_count: 4
---

# SPEC-090: Farm machine (high-variance)

## Goal
A fifth machine — Farm — with a barnyard identity, a green/earthy theme, and high-variance tuned
math (~94% RTP, ~23% hit-frequency). Pure config; no engine change.

## Outputs
- `src/machines/farm.ts` — the machine (symbols, weights, paytable, theme, audio).
- `src/machines/registry.ts` — register FARM (selector auto-lists it).
- `src/machines/farm.test.ts` — registration, vocabulary, metrics-sanity, strip, distinctness, a11y.
- `decisions/DEC-026-farm-machine.md`.

## Acceptance
- [x] Farm is the 5th selectable machine; own creatures (🐔🐷🐑🐮🦆🐐🐴🚜) + green theme.
- [x] Measures HIGH-VARIANCE: RTP ~94%, hit-frequency ~23% (distinctly below the steady machines),
      jackpot ~1-in-200k. Pinned via `just simulate farm`.
- [x] Passes symbol-uniqueness + machine-parity contracts; default machine unchanged; engine diff empty.
- [x] Theme contrast ≥ WCAG AA (measured 16.13:1). Tokens only, no raw hex in CSS (theme is data).

## Reflection (Ship)

1. **What would I do differently next time?** — Two things. (a) **Ship the spec, not just the
   code.** SPEC-090's code merged in PR #97, but the ship bookkeeping (this reflection, the brag,
   `archive-spec`, closing STAGE-018) never ran — the PROJ-004 close-out landed on top of it and
   masked the gap. `just status` had been showing the tell the whole time: `ship (1)` alongside
   `Shipped (archived): 0`. A spec sitting in the `ship` cycle un-archived is unfinished work, not
   finished work. (b) **The metrics-sanity RTP band is close to a no-op.** The test asserts
   `0.85 ≤ rtp ≤ 1.02` — a 17-point window around a measured ~94%. DEC-026 accepts the width
   deliberately (high variance is noisy), and the *hit-frequency* band (0.20–0.28) is the assertion
   with real teeth, but the RTP line reads like a guard while catching almost nothing. If a band
   has to be that wide to be stable, either raise the test's spin count (it simulates 20k; tuning
   used 200k) or say plainly in the test that hit-frequency is the guard and RTP is a smoke check.

2. **Does any template, constraint, or decision need updating?** — No template or constraint
   change. One decision-shaped note: DEC-026's "Alternatives Considered" explicitly rejected a
   **generous / high-hit-rate** math personality in favour of high-variance. That rejection is
   still the roster's most legible gap, and it is now the direct next spec rather than a someday
   idea. DEC-026 itself needs no amendment — it recorded the trade-off correctly.

3. **Is there a follow-up spec I should write now before I forget?** — Yes: **SPEC-091, the
   generous / high-hit-rate machine** (Food & Drink theme, per the PROJ-005 roadmap) under a new
   STAGE-019. It closes the personality gap DEC-026 named, and the measure-then-pin loop plus the
   symbol-uniqueness / machine-parity contracts are now well-worn enough that a sixth machine is
   mostly tuning. Written in this same session.
