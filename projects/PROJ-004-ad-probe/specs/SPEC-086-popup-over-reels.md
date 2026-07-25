---
task:
  id: SPEC-086
  type: chore
  cycle: ship
  blocked: false
  priority: low
  complexity: S
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
    - DEC-010
  constraints:
    - respect-reduced-motion
    - portrait-first
  related_specs:
    - SPEC-084
    - SPEC-085
value_link: "Popup ad plays OVER the reels, and the on-machine banner hides while it's up (one ad at a time)."
cost:
  sessions:
    - cycle: design
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: null
      recorded_at: 2026-07-24
      note: "User refinement, built inline."
    - cycle: build
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: 15000
      estimated_usd: 0.30
      recorded_at: 2026-07-24
      note: >-
        AdPopup reports visibility up (onVisibilityChange); App hides the banner while the popup is
        up and restores it after. Popup repositioned to overlay the reel grid (centred). Removed the
        now-unused ad-slide-up keyframe. Verified on a real render: popup overlaps reels, banner
        hidden while up, banner returns on dismiss. Gate green.
    - cycle: verify
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: 8000
      estimated_usd: 0.16
      recorded_at: 2026-07-24
      note: "Real render round-trip: popup over reels + banner hidden -> dismiss -> banner back. 0 defects."
    - cycle: ship
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      recorded_at: 2026-07-24
      note: "main-loop ship; on the PROJ-004 draft branch."
  totals:
    tokens_total: 23000
    estimated_usd: 0.46
    session_count: 4
---

# SPEC-086: Popup over the reels; banner yields to it

## Goal
The popup ad plays over the reel grid, and the on-machine banner (under the reels) hides while the
popup is showing, returning when it closes — so only one ad is on screen at a time.

## Changes
- `AdPopup` — `onVisibilityChange(visible)` callback (resets false on unmount).
- `App` — `popupActive` state; banner renders only when `!popupActive`.
- `ads.css` — `.ad--popup` centred over the reels (was bottom-anchored); dropped unused keyframe.

## Acceptance
- [x] Popup overlaps the reel grid. Banner hidden while popup is up; back on dismiss.
- [x] Reduced-motion path intact; tokens only. Engine/audio diffs empty; gate green.
