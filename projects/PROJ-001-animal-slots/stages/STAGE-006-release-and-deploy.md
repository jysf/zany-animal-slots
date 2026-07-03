---
# Maps to ContextCore epic-level conventions.
# A Stage is a coherent chunk of work within a Project.
# It has a spec backlog and ships as a unit when the backlog is done.

stage:
  id: STAGE-006                     # stable, zero-padded within the project
  status: active                    # proposed | active | shipped | cancelled | on_hold
  priority: high                    # critical | high | medium | low  (activated 2026-07-03)
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

Activated 2026-07-03, after STAGE-005 shipped — the last stage of PROJ-001, and
the one that turns a locally-playable build into a **public, safely-served** game
(a project success criterion). It's last because there's no point deploying before
there's a game worth playing; doing the security/headers/audit work here — once, at
the boundary where the app meets the public internet — keeps it out of every
earlier spec.

**Credential boundary (important).** This stage splits cleanly into two halves:
work that lives **in the repo** (security headers, cache policy, the CI audit +
license gate, `SECURITY.md`) which needs **no external accounts**, and work that
needs **the operator's Cloudflare account/DNS** (creating the Pages project, the
deploy wiring + any API token/CI secret, the custom sub-domain binding, and the
live prod smoke check). The agent builds the first half through the normal
design→build→verify→ship loop; the second half is **handoff** — the operator
performs the Cloudflare/DNS steps (the agent can't create accounts or set CI
secrets — `no-secrets-in-code`), then the smoke check confirms it.

## Success Criteria

- **The app is publicly reachable** at a Cloudflare Pages URL — the default
  `*.pages.dev` and the operator's chosen **custom sub-domain** (e.g.
  `slots.<domain>`) — and all five game states (idle / spinning / small / big /
  jackpot) are reachable there (prod smoke check).
- **Deploy is automated:** a production Vite build ships on merge to `main` (via
  Cloudflare Git integration or a CI `wrangler`/Pages-Action job), with **no
  secrets committed** (`no-secrets-in-code` — any API token is a CI/dashboard
  secret only).
- **The served app is hardened:** a Content-Security-Policy tuned to the app's real
  sources (`default-src 'self'` — no external scripts/fonts/images; emoji are
  Unicode, audio is synthesized) plus `X-Content-Type-Options`, frame-ancestors /
  `X-Frame-Options`, `Referrer-Policy`, and `Permissions-Policy`; a sensible static
  cache (immutable long-cache for hashed assets, no-cache for `index.html`). The
  served headers are verified.
- **CI gates the supply chain:** a dependency/vulnerability audit (`npm audit`
  prod) + the `license-policy` permissive-only check run in CI and fail the build
  on a violation (all current deps — incl. `tone`, MIT — pass).
- **`SECURITY.md` is present and accurate:** a disclosure policy + the deployed
  app's posture (play-money, no PII, no backend, client-only — a deliberately small
  attack surface).

## Scope

### In scope
**Repo-side (agent-buildable, no external account):**
- Security headers + static cache policy via a Pages `public/_headers` file (CSP
  tuned to Vite's real output; caching for hashed assets vs `index.html`).
- CI supply-chain gate: `npm audit` (prod deps) + a `license-policy` permissive-only
  license check, wired into the existing GitHub Actions workflow.
- `SECURITY.md`: disclosure policy + the client-only / play-money posture.

**Operator-side (handoff — needs the Cloudflare account/DNS):**
- Create the Cloudflare Pages project + wire the production deploy on merge to
  `main` (Git integration **recommended** for least secret-handling; the
  `wrangler`/Actions + `CLOUDFLARE_API_TOKEN` path is the in-repo alternative).
- Bind the custom **sub-domain** to the Pages project (dashboard custom-domain +
  DNS `CNAME`).
- Run the production smoke check against the live URL.

### Explicitly out of scope
- A backend, accounts, database, or SSR (still a static SPA).
- Real money / payments of any kind (`no-real-money` holds).
- New game features, symbols, or audio (STAGE-002..005 / PROJ-002).
- `tone` bundle-size optimization / code-splitting (a real ~407 KB-JS follow-up
  noted at STAGE-005 ship, but a PROJ-002 concern — not a release blocker).
- Analytics, error reporting, or a custom apex domain beyond the sub-domain.

## Spec Backlog

One-liners only at this stage; expand each via Prompt 2b in its own session.
Suggested order: build the three **repo-side** specs first (they're
account-independent and testable), then hand off the three **operator-side**
specs. Tag: **[REPO]** = agent-buildable · **[OPS]** = operator handoff.

Format: `- [status] SPEC-ID (cycle) — one-line summary` · sizing **[S/M/L]**

- [x] SPEC-035 (shipped 2026-07-03) — **[REPO]** Security headers + cache policy (`public/_headers`): a tight CSP (`default-src 'self'`; `style-src` allows inline style *attributes* for the dynamic `--reel-index`/particle custom props; `img-src 'self' data:` if needed) + `X-Content-Type-Options: nosniff`, `frame-ancestors 'none'`, `Referrer-Policy`, `Permissions-Policy`, and immutable-vs-no-cache rules; a contract test on the file. **[M]**
- [x] SPEC-036 (shipped 2026-07-03) — **[REPO]** CI supply-chain gate: `npm audit --omit=dev` + a dependency-free permissive-only license check (`scripts/license-check.mjs`; 1 exception: caniuse-lite CC-BY-4.0), as `just license-check`/`audit` recipes + a `supply-chain` GitHub Actions job; passes on the current dep set (incl. `tone`). **[M]**
- [ ] (not yet written) — **[REPO]** `SECURITY.md`: disclosure policy + the deployed posture (play-money, no PII, no backend, client-only); a small contract test that the required sections exist. **[S]**
- [ ] (not yet written) — **[OPS]** Cloudflare Pages project + automated deploy on merge to `main` (Git integration recommended; `wrangler`/Actions + `CLOUDFLARE_API_TOKEN` alternative). Operator creates the project/secret; the agent supplies any in-repo config (e.g. a `wrangler.toml` / Action) if the Actions path is chosen. **[M]**
- [ ] (not yet written) — **[OPS]** Custom sub-domain binding: add `slots.<domain>` as a Pages custom domain + DNS `CNAME`; does **not** change the deploy job. **[S]**
- [ ] (not yet written) — **[OPS]** Production smoke check: the live URL serves the app, the security headers check out (e.g. `curl -I` / an online header scan), and all five game states are reachable. **[S]**

**Count:** 2 shipped ([REPO]) / 4 pending — 1×[REPO] (SECURITY.md, S) buildable now,
3×[OPS] (1×M, 2×S) handoff. No L; within the 3–8 range. The agent builds the three
[REPO] specs this batch (2/3 done) and stops at the handoff boundary.

## Design Notes

- **CSP is the load-bearing header — tune it to Vite's real output.** No external
  scripts/fonts/images (emoji are Unicode glyphs; audio is synthesized via Web
  Audio / Tone.js with no asset files — DEC-006/DEC-007), so `default-src 'self'`
  is achievable. Two gotchas: (1) the app uses inline **style attributes** for
  dynamic CSS custom properties (`--reel-index`, particle `--p-*`), so `style-src`
  needs `'unsafe-inline'` (or `style-src-attr 'unsafe-inline'`) — this is style-only,
  low-risk, and unavoidable without refactoring to classes; (2) prefer no
  `'unsafe-inline'` for **script** — Vite's `type=module` output is external hashed
  JS, so `script-src 'self'` should hold (verify against the built `dist/index.html`).
- **`_headers` lives in `public/`** so Vite copies it to `dist/` root, where
  Cloudflare Pages reads it. The header contract test asserts the directives exist;
  the *served* verification is the OPS smoke check (headers can only be confirmed
  against the live edge).
- **No secrets in the repo (`no-secrets-in-code`).** Git integration needs no
  in-repo token at all (Cloudflare builds on its side); the Actions path needs a
  `CLOUDFLARE_API_TOKEN` **repo secret** the operator sets — never committed.
- **Sub-domain is orthogonal to CI/CD.** It's a project-level custom-domain +
  DNS binding; the deploy job is identical whether the site is served at
  `*.pages.dev` or `slots.<domain>`.
- **License gate** reuses the `license-policy` constraint's permissive-only list;
  `tone` (MIT) and all other deps already comply (confirmed at SPEC-027/032).
- Cloudflare Workers Static Assets is the modern alternative to Pages; DEC-008
  keeps Pages for simplicity and notes the upgrade path.

## Dependencies

### Depends on
- STAGE-004 — a complete, playable, juiced game is what gets deployed.
- STAGE-005 — the accessible, performant polish (nice to ship, though the core MVP
  was already deployable after STAGE-004).
- STAGE-001 — the production build (`npm run build` → `dist/`) and the CI workflow
  the audit gate extends.

### Enables
- The public demo URL (a project success criterion) → then a **PROJ-001 Project
  Ship** (Prompt 1e), the MVP complete.
- PROJ-002 work (themes, analytics, custom apex domain, `tone` code-splitting)
  against a live deployment.

## Stage-Level Reflection

*Filled in when status moves to shipped. Run Prompt 1d (Stage Ship) to draft.*
