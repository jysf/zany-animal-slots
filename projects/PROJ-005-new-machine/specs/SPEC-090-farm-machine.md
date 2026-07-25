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
