---
task:
  id: SPEC-083
  type: story
  cycle: build   # probe: designed + built inline for a quick visual
  blocked: false
  priority: low
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
    - DEC-001   # engine-no-dom: ads are pure UI
    - DEC-005   # no backend / no PII — first-party, offline, no tracking
    - DEC-010   # design tokens, no raw hex
  constraints:
    - no-real-money
    - touch-targets-44
    - respect-reduced-motion
    - portrait-first
  related_specs: []
value_link: "The probe itself — three gated fake-ad placements to see how advertising looks in-game."
cost:
  sessions:
    - cycle: design
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: null
      recorded_at: 2026-07-24
      note: "Probe designed + built inline for a fast visual; not slated for main."
    - cycle: build
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: 60000    # NOMINAL - built inline
      estimated_usd: 1.20    # NOMINAL, 60000 tok x $20/M (Opus list)
      recorded_at: 2026-07-24
      note: >-
        Built src/ui/ads/: fakeAds data (parody invented brands), AdInterstitial (on-load),
        AdPopup (triggered), AdBanner (on-machine), useAdProbe gate (?ads=1, default OFF), ads.css
        (tokens only). Mounted in App behind the gate. Dismissible, reduced-motion-safe,
        aria-label="Advertisement". No network/tracking/real-money. Previewed with ?ads=1.
  totals:
    tokens_total: 0
    estimated_usd: 0
    session_count: 0
---

# SPEC-083: Fake-ad placements (gated probe)

## Goal
Three gated, dismissible fake-ad placements — on-load interstitial, popup, on-machine banner —
with parody creatives, to see how ads look in the game. OFF by default (`?ads=1` to enable).

## Outputs
- `src/ui/ads/fakeAds.ts` — parody creative data (invented brands; tokens for color).
- `src/ui/ads/useAdProbe.ts` — the `?ads=1` gate (default OFF).
- `src/ui/ads/AdInterstitial.tsx` — on-load overlay (dismissible, once per session).
- `src/ui/ads/AdPopup.tsx` — a popup ad (triggered after a few spins).
- `src/ui/ads/AdBanner.tsx` — an on-machine banner (persistent, dismissible).
- `src/ui/ads/ads.css` — tokens only.
- `src/ui/App.tsx` — mount all three behind the gate.

## Acceptance
- [ ] With no `?ads=1`, nothing renders — deployed game unchanged.
- [ ] With `?ads=1`, all three placements appear with fake creatives; each is dismissible (≥44px).
- [ ] Every ad is `aria-label`/role-marked as an advertisement; parody disclaimers on any "prize".
- [ ] No network request, no third-party script, no real-money surface. Tokens only, no raw hex.
- [ ] Reduced-motion paths; engine/audio diffs empty.

## Notes
Probe only — not for main. Draft PR; the user decides whether the idea has legs.
