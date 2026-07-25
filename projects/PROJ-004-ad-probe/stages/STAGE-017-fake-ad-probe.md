---
stage:
  id: STAGE-017
  status: active
  priority: low
  target_complete: null
project:
  id: PROJ-004
repo:
  id: animal-slots
created_at: 2026-07-24
shipped_at: null
value_contribution:
  advances: "Lets us see three ad placements in-context before deciding whether the idea has legs."
  delivers:
    - "On-load interstitial, popup, and on-machine banner — all fake, dismissible, and gated OFF by default."
  explicitly_does_not:
    - "Ship ads to the deployed game, use any ad network/tracking, or involve real money."
---

# STAGE-017: Fake-ad probe

## What This Stage Is
The whole probe: three gated placements with fake, parody creatives. One spec.

## Success Criteria
- Three placements render fake ads, each dismissible (≥44px), reduced-motion-safe, tokens only.
- Gated behind `?ads=1`; default OFF ⇒ deployed game unchanged.
- No network, no tracking, no real money; each ad `aria-label`ed "Advertisement".

## Spec Backlog
- [x] SPEC-083 (built) — Fake-ad placements + parody creatives (three spots).
- [x] SPEC-084 (built) — Ad config model: committed default (OFF) + per-browser override, config-driven rendering.
- [x] SPEC-085 (built) — Ad control panel (⚙️ via ?ads=1): toggle placements/ads, set frequency, Copy-as-default.
- [x] SPEC-086 (built) — Popup plays over the reels; the banner hides while it's up and returns after.

**Count:** 0 shipped / 4 active (on the PROJ-004 branch, draft) / 0 pending

## Stage-Level Reflection
*Filled in if/when the probe concludes.*
