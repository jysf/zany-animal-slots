# Security Policy

Zany Animal Slots is a play-money slot game deployed as a static site on
Cloudflare (Workers Static Assets — see STAGE-006 / DEC-014).

## Security posture

- **Play-money only** — no real currency, wagering, deposits, or payouts. The
  balance is a cosmetic number in `localStorage`; resetting it means nothing
  financially.
- **No PII** — the app collects, stores, and transmits no personal data. No
  accounts, no login, no ads, no third-party trackers.
- **Usage analytics: default-OFF, zero-network** — the codebase includes an
  optional, provider-agnostic usage-analytics *seam* (STAGE-011 Tier 1, DEC-023),
  but the shipped build ships it **off**: the default selects a no-op sink, so
  the app collects nothing, sets no cookie, uses no persistent identifier, honors
  `navigator.doNotTrack`, and makes **zero network requests** for analytics — the
  session posture is unchanged. Any *remote* sink (a self-hosted HTTP endpoint or
  the reference Cloudflare Worker+KV — "Tier 2") is deliberately **gated** and
  would require a separate decision amending the no-backend posture (a DEC
  amending DEC-005) plus a matching update to this file.
- **No backend / client-only** — a 100% client-side static SPA (Vite build →
  static assets). No server, database, API, or session — nothing to breach
  server-side.
- **No third-party runtime calls** — audio is synthesized in-browser (Web Audio
  / Tone.js); the default build makes no external network requests at runtime
  (the default-off analytics seam makes none either).
- **Client state** — a small set of non-sensitive `localStorage` keys: the
  play-money balance, a mute preference, the active-machine choice, session stats
  (spin/win counts — no PII), and a first-run "help seen" flag. All are
  cosmetic/local; tampering affects only the tamperer's own state. The analytics
  session id (only relevant if a sink is ever enabled) is **in-memory only**,
  never persisted.
- **RNG is not a security primitive** — the seedable mulberry32 RNG drives game
  visuals, not anything sensitive; it is not used for cryptography.

## Deployment hardening

- **Response headers** ship with the app via `public/_headers` (SPEC-035): a
  tight CSP (`default-src 'self'`), `X-Content-Type-Options: nosniff`,
  `frame-ancestors 'none'`, `Referrer-Policy`, `Permissions-Policy`, and cache
  rules. Cloudflare serves them (Workers Static Assets honors `_headers`).
- **HSTS** (`Strict-Transport-Security`) is served from `_headers` alongside the
  other response headers. It was originally planned at the **Cloudflare** zone/edge
  (STAGE-006 design), but a Worker custom domain owns its own responses, so the
  zone-level HSTS setting never reaches them — serving it from `_headers` is the
  reliable home for a Worker-hosted static site (DEC-014).
- **Supply chain** — dependencies are gated in CI (SPEC-036): a permissive-only
  license check + `npm audit` on production dependencies.

## Reporting a vulnerability

- **Report privately** — open a GitHub **Security Advisory** on this repository
  (Security → Advisories → *Report a vulnerability*). Please do **not** open a
  public issue for a security report.
- **Include** the affected URL/commit, the impact, and reproduction steps — no
  weaponized exploit needed.
- **Scope** — a play-money, no-PII, client-only app: the realistic surface is
  client-side (CSP/XSS, dependency vulnerabilities, `localStorage` tampering that
  only affects the tamperer).
- **Response** — best-effort, no bug bounty / no monetary reward. We acknowledge
  reports and coordinate a fix before public **disclosure**.
