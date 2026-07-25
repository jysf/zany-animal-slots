---
project:
  id: PROJ-004
  status: shipped                    # proposed | active | shipped | cancelled
  priority: low
  target_ship: null                 # a PROBE — explicitly not slated for main soon

repo:
  id: animal-slots

created_at: 2026-07-24
shipped_at: 2026-07-24

value:
  thesis: >-
    A design/UX PROBE, not a monetization feature: build fake, obviously-invented house ads in
    three placements (on-load interstitial, a popup, and an on-machine banner) so we can SEE and
    FEEL what advertising does to the game's layout, pacing, and tone — cheaply, first-party, and
    reversibly. The question is "what could this look like," not "should we run ads."
  beneficiaries:
    - "The owner — a concrete look at ad placements in-context before deciding whether the idea has legs"
  success_signals:
    - "All three placements render with fake, clearly-parody creatives and are dismissible."
    - "The probe is GATED (opt-in) and OFF by default, so the deployed game is unchanged."
    - "No ad network, no third-party script, no external request, no tracking, no real money — posture intact."
  risks_to_thesis:
    - "Ads on a gambling-styled game are touchy even when fake; the creatives must read as obvious parody, never as a real business."
    - "'For fun' can drift toward realism; the moment it needs a network or a payment it stops being this probe (see boundary)."
---

# PROJ-004: Fake-ad probe

## What This Project Is

A **probe** (user-requested 2026-07-24). Build mock advertisements in three spots — an **on-load
interstitial**, a **popup**, and an **on-machine banner** — with **fabricated, obviously-fake house
ads** (invented animal-themed brands), purely to see how ad placements look and feel in the game.
It is a design experiment, **not** monetization.

## Why Now

The idea was parked at PROJ-003 with its boundary written down; the user greenlit a look. It's
cheap, self-contained, and reversible, and seeing it in-context is the only way to judge whether
the idea is worth anything.

## The boundary (non-negotiable — carried from the PROJ-003 parked note)

- **First-party and offline only.** Creatives are local markup/emoji shipped with the app. **No ad
  network, no third-party script, no external request, no tracking pixel.** Keeps DEC-005
  (no backend / no PII) intact.
- **No real money.** `no-real-money` is absolute — no IAP, no revenue, no payment surface. Any
  "prize" ad is parody with a disclaimer.
- **Obviously fake.** Invented brands only; never impersonate a real business.
- **Gated / OFF by default.** The probe ships behind an opt-in flag so the deployed game is
  unchanged. Enabling a *real* ad network would be a posture reversal needing its own DEC + explicit
  go — **not** covered by this probe.
- **Not slated for main.** User: "see how it could look, but not something we should push to main
  quickly." Lives on a branch / draft PR until the user decides.

## Scope

### In scope
- Three gated placements: on-load interstitial, popup, on-machine banner.
- A small set of fake, parody, animal/slots-themed creatives (local data only).
- An opt-in gate (`?ads=1` query param) — default OFF.
- Dismiss controls (≥44px), reduced-motion paths, tokens only (DEC-010), `aria-label`ed as ads.

### Explicitly out of scope
- Any ad network, SDK, third-party script, external request, or tracking.
- Real money / IAP / rewarded-with-real-value anything.
- Targeting, personalization, or any use of player data.
- Shipping to `main` / the deployed game by default.

## Stage Plan

- [x] STAGE-017 (shipped 2026-07-24) — **Fake-ad probe**: the three gated placements + fake creatives. 1 spec (SPEC-083).

**Count:** 1 shipped / 0 active — 7 specs (SPEC-083–089); merged default-OFF (PR #96)

## Dependencies

### Depends on
- PROJ-003 (shipped) — the cabinet/header/sheet UI + design tokens these sit within.

### Enables
- A go/no-go conversation on whether ads (even fake, even as a bit) belong in this game at all.

## Roadmap / potential ideas (deferred, not built)

Surfaced reviewing the probe (2026-07-24); parked for later at the owner's call. None affect the
first-party/offline/no-real-money boundary.

- **Tame the frequency** — the on-load interstitial shows on *every* reload (a `sessionStorage`
  "seen" flag would make it once-per-session); the popup re-fires at every Nth spin with no cap (a
  per-session cap or a cooldown would keep it from nagging).
- **Behavior tests** — the config→render wiring (enabled gate, per-placement toggles, and the
  "banner hides while popup is up" coordination) has no automated coverage yet; only the config
  *storage* is tested. Worth locking if the feature sticks.
- **Small polish** — dim the reels behind the popup; rotate the banner through active ads (it
  always shows the first); warn in the panel when all six ads are unticked; optional popup
  auto-dismiss timer. The fake CTAs are deliberate no-ops.

## Project-Level Reflection

*Shipped 2026-07-24, merged to main with ads default OFF (PR #96).*

- **Did we answer "what could ads look like"?** Yes — and then some. It started as a look and became
  a small, owner-controllable ad system: three placements, a config-driven panel, a rewarded
  play-money mechanic, plus (off-theme, by request) an in-app changelog. All first-party/offline; no
  ad network, no tracking, no real money; DEC-005 intact.
- **Boundary held?** Yes. The one place it could have slipped — "control what everyone sees" on a
  static no-backend site — was resolved with the committed-default + redeploy model, not a backend.
- **Deferred:** frequency taming, behavior tests, small polish (see Roadmap). A real ad network
  remains a posture reversal needing its own DEC + go — not covered here.
