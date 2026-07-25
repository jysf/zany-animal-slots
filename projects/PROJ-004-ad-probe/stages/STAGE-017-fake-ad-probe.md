---
stage:
  id: STAGE-017
  status: shipped
  priority: low
  target_complete: null
project:
  id: PROJ-004
repo:
  id: animal-slots
created_at: 2026-07-24
shipped_at: 2026-07-24
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
- [x] SPEC-087 (built) — Config version guard: a redeployed default overrides testers' stale saved configs.
- [x] SPEC-088 (built) — In-app changelog ("What's new" footer link + sheet from releases.json). NOT an ad feature; bundled here at the owner's request.
- [x] SPEC-089 (built) — Rewarded ad: "📺 Free coins" → fake ad → credits play-money coins (no real money).

**Count:** 0 shipped / 7 active (on the PROJ-004 branch, draft) / 0 pending

## Stage-Level Reflection

*Shipped 2026-07-24 (default OFF).*

- **Delivered?** Yes, and well past the original "probe": 7 specs (SPEC-083–089) grew from three
  fake placements into a config model, an owner control panel (toggle placements/ads, set frequency
  + reward), a version guard, an in-app changelog, and a rewarded-ad→play-money mechanic.
- **What changed?** Scope expanded as the user played with it. Two things I'd flag: the changelog
  (SPEC-088) is NOT an ad feature and was bundled here at the owner's request — a scope stretch worth
  naming; and the "committed default + redeploy" model has a real dependency on the version guard
  (SPEC-087) that only surfaced on review.
- **Lessons:** a persisted config that "everyone sees" on a no-backend static site needs a version
  guard from day one, or overrides silently pin testers forever. And a rewarded-ad credit must NOT
  move session net/win-rate — it's a top-up, not a win.
- **Deferred:** frequency taming, behavior tests, small polish (roadmapped in the brief). The
  committed default ships OFF, so nothing is player-facing until the owner flips it + redeploys.
