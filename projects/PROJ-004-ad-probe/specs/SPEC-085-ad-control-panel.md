---
task:
  id: SPEC-085
  type: story
  cycle: ship
  blocked: false
  priority: medium
  complexity: M
project:
  id: PROJ-004
  stage: STAGE-017
repo:
  id: animal-slots
agents:
  architect: claude-opus-4-8
  implementer: claude-opus-4-8
  created_at: 2026-07-24
references:
  decisions:
    - DEC-001
    - DEC-005
    - DEC-010
  constraints:
    - touch-targets-44
    - respect-reduced-motion
  related_specs:
    - SPEC-084  # the config this edits
value_link: "The owner's ad control panel: toggle placements + ads, set frequency, and export the config to commit as the new default."
cost:
  sessions:
    - cycle: design
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: null
      recorded_at: 2026-07-24
      note: "Designed + built inline with SPEC-084."
    - cycle: build
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: 40000
      estimated_usd: 0.80
      recorded_at: 2026-07-24
      note: >-
        AdSettingsSheet: master + per-placement toggles, popup-frequency stepper (clamped), the 6
        built-ins as on/off checkboxes (no copy editing per the user), Copy-as-default (clipboard
        export of the DEFAULT_AD_CONFIG literal), Reset-to-default. Gated behind ?ads=1 via a header
        gear (useAdAdmin). Tokens only; ≥44px controls; Esc/backdrop/focus like StatsSheet.
    - cycle: verify
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: 18000
      estimated_usd: 0.36
      recorded_at: 2026-07-24
      note: "Real render: panel opens at ?ads=1, toggles persist, banner renders after enabling. 0 defects."
    - cycle: ship
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      recorded_at: 2026-07-24
      note: "main-loop ship; on the PROJ-004 branch (draft)."
  totals:
    tokens_total: 58000
    estimated_usd: 1.16
    session_count: 4
---

# SPEC-085: Ad control panel

## Goal
An owner-only control panel (⚙️ in the header when ?ads=1) to toggle ads/placements, set popup
frequency, pick which built-in ads show, and export the config to commit as the new default.

## Outputs
- `src/ui/ads/AdSettingsSheet.tsx` + ads.css additions; mounted in `Header` when `adAdmin`.

## Acceptance
- [x] Reached only via ?ads=1 (visitors never see the gear). Master + per-placement toggles,
      popup-frequency stepper, 6 ad on/off checkboxes.
- [x] Copy-as-default exports the exact DEFAULT_AD_CONFIG literal; Reset-to-default clears the
      override. Changes preview in this browser only; the note explains the redeploy flow.
- [x] ≥44px controls, tokens only, no raw hex. Engine/audio diffs empty.
