---
task:
  id: SPEC-084
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
    - DEC-005   # no backend — config is a committed default + per-browser override, no server
    - DEC-010
  constraints:
    - no-real-money
    - touch-targets-44
    - respect-reduced-motion
  related_specs:
    - SPEC-083  # the probe this makes configurable
    - SPEC-085  # the control panel that edits this config
value_link: "A committed default ad config (what everyone sees) + a per-browser override, so the owner controls ads without a backend."
cost:
  sessions:
    - cycle: design
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: null
      recorded_at: 2026-07-24
      note: "Designed + built inline. User chose committed-default+redeploy (no backend; DEC-005 intact)."
    - cycle: build
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: 55000
      estimated_usd: 1.10
      recorded_at: 2026-07-24
      note: >-
        adConfig (DEFAULT_AD_CONFIG = OFF + calm), adConfigStorage (guarded, normalizes/clamps,
        drops unknown ids), AdConfigProvider (reactive context), rewired App + the 3 ad components
        to render per config, ?ads render-gate replaced by config.enabled (useAdProbe→useAdAdmin).
        adConfigStorage.test.ts 8/8. Engine/audio diffs empty; no raw hex; no network/tracking.
    - cycle: verify
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: 20000
      estimated_usd: 0.40
      recorded_at: 2026-07-24
      note: "Inline + real render: default OFF => no ads even at ?ads=1; storage normalize/clamp tested. 0 defects."
    - cycle: ship
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      recorded_at: 2026-07-24
      note: "main-loop ship; on the PROJ-004 branch (draft), not for main yet."
  totals:
    tokens_total: 75000
    estimated_usd: 1.50
    session_count: 4
---

# SPEC-084: Ad config model + config-driven rendering

## Goal
A committed `DEFAULT_AD_CONFIG` (what every visitor sees; default OFF) plus a guarded per-browser
override, driving whether/which/how-often ads render. No backend (DEC-005).

## Outputs
- `src/ui/ads/adConfig.ts` — AdConfig, DEFAULT_AD_CONFIG (OFF, calm), activeAds(), freq clamps.
- `src/ui/ads/adConfigStorage.ts` — read/write/clear override; normalize + clamp; never throws.
- `src/ui/ads/AdConfigProvider.tsx` — reactive context (config + update + resetToDefault).
- Rewired `App.tsx` + `AdBanner/AdInterstitial/AdPopup` to render per config.
- `useAdProbe` → `useAdAdmin` (the ?ads=1 gate now reveals the panel, not the ads).
- `adConfigStorage.test.ts`.

## Acceptance
- [x] Default OFF ⇒ no ads render for anyone (even at ?ads=1). Merging is a no-op for players.
- [x] Override persists per browser; corrupt/partial/old blobs normalize; freq clamps [3..50];
      unknown ad ids dropped.
- [x] Placements + frequency + active-ad set all drive rendering. Engine/audio diffs empty.
