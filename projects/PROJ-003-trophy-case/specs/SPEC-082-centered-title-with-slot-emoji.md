---
task:
  id: SPEC-082
  type: chore
  cycle: ship  # design done inline; trivial cosmetic change
  blocked: false
  priority: low
  complexity: S

project:
  id: PROJ-003
  stage: STAGE-016
repo:
  id: animal-slots

agents:
  architect: claude-opus-4-8
  implementer: claude-opus-4-8     # built inline (trivial header/CSS tweak)
  created_at: 2026-07-24

references:
  decisions:
    - DEC-010   # design tokens, no raw hex; token-driven spacing
  constraints:
    - portrait-first
  related_specs:
    - SPEC-068  # the header controls-row layout this sits above

value_link: >-
  Small branding polish: centre the title and flank it with slot-machine emoji.

cost:
  sessions:
    - cycle: design
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: null
      recorded_at: 2026-07-24
      note: "Trivial cosmetic tweak — designed + built inline on the main loop."
    - cycle: build
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: 12000    # NOMINAL - inline, trivial
      estimated_usd: 0.24    # NOMINAL, 12000 tok x $20/M (Opus list)
      recorded_at: 2026-07-24
      note: >-
        Header title becomes a full-width centred flex row flanked by two 🎰 emoji (aria-hidden,
        so the accessible name stays "Zany Animal Slots"); controls wrap to the row below. Verified
        on the live dev server: computed justify-content:center, flex-basis:100%, clean a11y name.
        No test pins the title text; full gate green (1000 tests).
    - cycle: verify
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: 8000     # NOMINAL - inline
      estimated_usd: 0.16    # NOMINAL
      recorded_at: 2026-07-24
      note: "Inline: DOM-confirmed centred + emoji + clean accessible name on the live server; gate green. 0 defects."
    - cycle: ship
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      recorded_at: 2026-07-24
      note: "main-loop ship; rides in the STAGE-016 polish PR #93."
  totals:
    tokens_total: 20000
    estimated_usd: 0.40
    session_count: 4
---

# SPEC-082: Centered title with slot emoji

## Goal

Centre the header title and flank "Zany Animal Slots" with a 🎰 on each side.

## Changes

- `src/ui/regions/Header.tsx` — title becomes
  `🎰 <span class="cabinet__title-text">Zany Animal Slots</span> 🎰`; the emoji are
  `aria-hidden` decorative spans so the accessible name stays "Zany Animal Slots".
- `src/ui/regions/regions.css` — `.cabinet__title` is a full-width (`flex-basis: 100%`)
  centred flex row (`justify-content: center`, token `gap`); the controls cluster wraps to
  its own row below on all widths.

## Acceptance

- [x] Title text is centred and flanked by a slot emoji on each side.
- [x] Screen-reader accessible name is still "Zany Animal Slots" (emoji aria-hidden).
- [x] Token spacing only, no raw hex (DEC-010). Engine/audio diffs empty. Gate green.

## Reflection (Ship)

1. Trivial cosmetic change; no lessons.
2. No template/constraint/decision change.
3. No follow-up.
