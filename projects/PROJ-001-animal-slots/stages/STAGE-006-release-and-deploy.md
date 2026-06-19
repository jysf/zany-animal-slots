---
# Maps to ContextCore epic-level conventions.
# A Stage is a coherent chunk of work within a Project.
# It has a spec backlog and ships as a unit when the backlog is done.

stage:
  id: STAGE-006                     # stable, zero-padded within the project
  status: proposed                  # proposed | active | shipped | cancelled | on_hold
  priority: medium                  # critical | high | medium | low
  target_complete: null             # optional: YYYY-MM-DD

project:
  id: PROJ-001                      # parent project
repo:
  id: animal-slots

created_at: 2026-06-18
shipped_at: null

# What part of the project's value thesis this stage advances.
value_contribution:
  advances: >-
    Completes the "deliver as a small web app" claim by actually shipping it:
    the static SPA is built and served at a public URL, proving the
    client-only architecture deploys cleanly and reaches the "players wanting a
    quick fun demo" beneficiary — not just a dev server on someone's laptop.
  delivers:
    - "A public URL (Cloudflare Pages) where the game is playable."
    - "Automated deploy: a production build ships on merge to main via CI."
    - "Security headers (CSP, anti-clickjacking, MIME-sniff protection, referrer/permissions policy) on the served app."
    - "A dependency/license/vulnerability audit gate in CI, and an updated SECURITY.md disclosure posture."
    - "A sensible static-asset cache strategy (immutable hashed assets, no-cache index)."
  explicitly_does_not:
    - "Add a backend, accounts, database, or server-side rendering (still a static SPA)."
    - "Introduce real money / payments of any kind (constraint no-real-money holds)."
    - "Add new game features, symbols, or audio (those are STAGE-002..005 / PROJ-002)."
    - "Require a custom domain / DNS beyond the default *.pages.dev unless trivial."
---

# STAGE-006: Release & deploy

## What This Stage Is

The release stage: it takes the finished game and puts it on the internet,
securely. The static Vite build is deployed to **Cloudflare Pages** (the natural
fit for a client-only SPA — free tier, edge-served, simple static hosting), with
the deploy automated through CI on merge to `main`. Alongside the deploy it does
the security and hardening work a public app needs but the earlier stages
deferred: HTTP security headers (a Content-Security-Policy tuned to the app's
real sources, anti-clickjacking, MIME-sniff protection, referrer/permissions
policy), a dependency + license + vulnerability audit gate in CI, a static-asset
cache strategy, and an updated `SECURITY.md` describing the (deliberately small)
attack surface — play-money, no PII, no backend. When this stage ships, anyone
can open Animal Slots at a public URL and it is served safely.

## Why Now

It is the last stage because there is no point deploying before there is a game
worth playing. It depends on a complete, playable core (through STAGE-004); the
STAGE-005 stretch polish is independent, so STAGE-006 can release the core MVP
without waiting on it. Doing the security/headers/audit work here — once, at the
boundary where the app meets the public internet — keeps it from being smeared
across every earlier spec.

## Why Now / Success Criteria / Scope / Design Notes / Dependencies

*Framed for now; expand via Prompt 1c (Stage Frame) when this stage becomes
active. Authoritative target decision: `DEC-008` (Cloudflare Pages). Relevant
constraints: `no-real-money`, `no-secrets-in-code` (the Cloudflare API token is
a CI secret, never committed), `license-policy` (wire the audit here).*

## Spec Backlog

One-liners only at this stage; expand each via Prompt 2b in its own session.

Format: `- [status] SPEC-ID (cycle) — one-line summary`

- [ ] (not yet written) — Cloudflare Pages project + production build wiring; deploy `dist/` as a static site (wrangler / Pages config). See `DEC-008`.
- [ ] (not yet written) — CI deploy job: build + deploy to Cloudflare Pages on merge to `main`, using a `CLOUDFLARE_API_TOKEN` CI secret (constraint `no-secrets-in-code`).
- [ ] (not yet written) — Security headers via Pages `_headers`: a CSP tuned to the app's real sources (self + Web Audio, no external scripts), plus `X-Content-Type-Options`, frame-ancestors/`X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`; verify the served headers.
- [ ] (not yet written) — Static-asset cache strategy: immutable long-cache for hashed assets, no-cache for `index.html`.
- [ ] (not yet written) — Dependency/security audit gate in CI: `npm audit` (prod) + the `license-policy` check (permissive-only).
- [ ] (not yet written) — `SECURITY.md` update: disclosure policy + the deployed app's posture (play-money, no PII, no backend, client-only).
- [ ] (not yet written) — Production smoke check: the deployed URL serves the app and all five game states are reachable.

**Count:** 0 shipped / 0 active / 7 pending (estimate — refine at Stage Frame)

## Design Notes

- **CSP is the load-bearing header and needs tuning to Vite's output.** The app
  has no external scripts/fonts/images (emoji are Unicode, audio is synthesized
  via Web Audio / Tone.js, no asset files — see `DEC-006`, `DEC-007`), so the
  policy can be tight (`default-src 'self'`); watch for any inline styles/scripts
  Vite injects and prefer hashes over `'unsafe-inline'`.
- **No secrets in the repo.** The Cloudflare API token lives only as a CI secret
  (`no-secrets-in-code`). Cloudflare's git integration is an alternative to a
  wrangler/Action token — decide at Stage Frame.
- Modern alternative to Pages is Cloudflare Workers Static Assets; `DEC-008`
  picks Pages for simplicity but notes the option.

## Dependencies

### Depends on
- STAGE-004 — a complete, playable, juiced game is what gets deployed.
- STAGE-001 — the production build (`npm run build` → `dist/`) and CI established there.

### Enables
- A public demo URL (a project success criterion) and PROJ-002 work (custom
  domain, themes, analytics) against a live deployment.

## Stage-Level Reflection

*Filled in when status moves to shipped. Run Prompt 1d (Stage Ship) to draft.*
