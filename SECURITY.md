# Security Policy

Zany Animal Slots is a play-money slot game deployed as a static site on
Cloudflare Pages (see STAGE-006 / DEC-008).

## Security posture

- **Play-money only** — no real currency, wagering, deposits, or payouts. The
  balance is a cosmetic number in `localStorage`; resetting it means nothing
  financially.
- **No PII** — the app collects, stores, and transmits no personal data. No
  accounts, no login, no analytics, no trackers, no ads.
- **No backend / client-only** — a 100% client-side static SPA (Vite build →
  static assets). No server, database, API, or session — nothing to breach
  server-side.
- **No third-party runtime calls** — audio is synthesized in-browser (Web Audio
  / Tone.js); there are no external network requests at runtime.
- **Client state** — only a play-money balance + a mute preference in
  `localStorage`. Tampering affects only the tamperer's own cosmetic state.
- **RNG is not a security primitive** — the seedable mulberry32 RNG drives game
  visuals, not anything sensitive; it is not used for cryptography.

## Deployment hardening

- **Response headers** ship with the app via `public/_headers` (SPEC-035): a
  tight CSP (`default-src 'self'`), `X-Content-Type-Options: nosniff`,
  `frame-ancestors 'none'`, `Referrer-Policy`, `Permissions-Policy`, and cache
  rules. Cloudflare Pages serves them.
- **HSTS** is intentionally NOT in `_headers` — it is applied at the **Cloudflare
  zone/edge** configuration (STAGE-006 design) so it covers the whole domain,
  not a single response.
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
