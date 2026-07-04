---
# Maps to ContextCore epic-level conventions.
# A Stage is a coherent chunk of work within a Project.
# It has a spec backlog and ships as a unit when the backlog is done.

stage:
  id: STAGE-006                     # stable, zero-padded within the project
  status: shipped                   # proposed | active | shipped | cancelled | on_hold
  priority: high                    # critical | high | medium | low  (activated 2026-07-03)
  target_complete: null             # optional: YYYY-MM-DD

project:
  id: PROJ-001                      # parent project
repo:
  id: animal-slots

created_at: 2026-06-18
shipped_at: 2026-07-03

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
- [x] SPEC-037 (shipped 2026-07-03) — **[REPO]** `SECURITY.md`: replaced the scaffold default with the deployed posture (play-money, no PII, no backend, client-only) + coordinated-disclosure policy; documents the headers/HSTS split (headers in `_headers`/SPEC-035, HSTS at the Cloudflare zone); a root-level `SECURITY.contract.test.ts` (5 tests) asserts the required sections + posture/HSTS/reporting claims. **[S]**
- [x] (done 2026-07-03, operator + agent) — **[OPS]** Cloudflare **Workers Static Assets** deploy (**DEC-014**, supersedes the Pages plan). The agent supplied `wrangler.jsonc` (`assets.directory: ./dist`, no Worker script); the operator's `npx wrangler deploy` now uploads the build cleanly. **LIVE at `https://zany-animal-slots.jyashinsky.workers.dev`.** **[M]**
- [x] (done 2026-07-03, operator + agent) — **[OPS]** Custom sub-domain binding: **`zany-animal-slots.jysf.org`** bound as a Cloudflare custom domain on the Worker (proxied, auto-provisioned TLS). **HSTS** turned out NOT to reach a Worker-owned custom domain via the zone toggle, so it is now served from `_headers` (`Strict-Transport-Security: max-age=15552000`, PR #39; DEC-014). Verified live. **[S]**
- [x] (done 2026-07-03, agent smoke check) — **[OPS]** Production smoke check: `curl` of the live URL → **200**, all six SPEC-035 security headers served and matching `public/_headers` exactly (CSP, `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`, `Cache-Control`); HTML is CSP-clean (external module script + CSS, empty `#root`, zero inline); `/assets/*` serve 200 with the immutable rule. Minor nit: Workers Assets **appends** the `/*` `no-cache` onto `/assets/*` (`no-cache, …, immutable`) rather than letting the specific rule win — harmless on content-hashed assets; optional `_headers` tidy. Game bundle is byte-identical to the tested local build (same asset hashes). **[S]**

**Count:** 3 shipped [REPO] + 3 [OPS] done (deploy live + smoke check + custom
domain/HSTS) = **6/6 complete**. The game is live at
**`https://zany-animal-slots.jysf.org`** (and `*.workers.dev`), auto-deploying on
push to `main`, with all seven security headers (incl. HSTS) verified served.
STAGE-006 is ready to be shipped as a stage; PROJ-001 is ready for its Project Ship.

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

*Shipped 2026-07-03. Drafted via Prompt 1d (Stage Ship).*

### Success Criteria — all met

- **Publicly reachable + all 5 states:** ✅ live at
  `https://zany-animal-slots.jysf.org` (and the default `*.workers.dev`). Prod
  smoke check confirmed HTTP 200, the app HTML (CSP-clean, external module script +
  CSS), and reachable game states (idle → spinning → small/big/jackpot win → loss;
  win badge verified in-app).
- **Automated deploy, no secrets:** ✅ every push to `main` triggers a Cloudflare
  build+deploy (verified twice by watching a commit go live in ~30–40s). No API
  token or secret is committed — the only in-repo deploy artifact is `wrangler.jsonc`.
- **Hardened, headers verified:** ✅ `curl` confirmed the full set on the custom
  domain — a tight CSP (`default-src 'self'`), `X-Content-Type-Options: nosniff`,
  `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`, HSTS, and the
  cache split (`immutable` on `/assets/*`, `no-cache` on HTML).
- **CI supply-chain gate:** ✅ SPEC-036 — `npm audit --omit=dev` + the
  dependency-free permissive-only license check run as a `supply-chain` CI job.
- **`SECURITY.md` accurate:** ✅ SPEC-037 — deployed posture (play-money, no PII, no
  backend, client-only) + coordinated-disclosure policy, pinned by a contract test.

### value_contribution check

Every "delivers" bullet landed. One wording drift, not a gap: the stage was framed
around **Cloudflare Pages**, but the actual deploy uses **Cloudflare Workers Static
Assets** (DEC-014, supersedes DEC-008) — same outcome (edge-served static SPA, free,
`_headers`-driven headers, custom domain), different product. The `explicitly_does_not`
boundaries all held: no backend, no accounts, no real money, no new game features.

### 3-sentence summary

Built vs planned: all five success criteria delivered; the three [REPO] specs
(headers, supply-chain gate, SECURITY.md) shipped exactly as framed, and the three
[OPS] items (deploy, custom domain + HSTS, smoke check) were completed with the
operator. Speed: the [REPO] specs were fast, near drop-in builds; the friction was
entirely in the [OPS] half — Cloudflare steered us off Pages onto Workers Static
Assets, which broke the first deploy (Vite-plugin auto-config needs Vite ≥6) and
required an explicit `wrangler.jsonc`. Emergent behavior: two hardening assumptions
turned out to be Worker-specific — zone-level HSTS never reaches a Worker-owned
custom domain (moved HSTS into `_headers`), and Workers Static Assets **merges**
`_headers` rules rather than letting the specific rule win (had to scope `no-cache`
off `/*` so `/assets/*` stays cleanly immutable).

### Reflection answers

1. **What would we do differently?** — Pick the hosting *product* (Pages vs Workers
   Static Assets) up front by checking what the target account actually offers, rather
   than framing on Pages and discovering at deploy time that new projects are steered
   to Workers. It would have avoided the Vite-6 failure and the DEC-008→DEC-014 churn.
2. **Does the template/guidance need updating?** — Yes, two small things: (a) the
   scaffold ships a generic local-tooling `SECURITY.md`; a deploy stage should replace
   it with the deployed posture (now captured as a template note candidate); (b) the
   `license-policy` constraint is now CI-enforced, so its severity could move
   advisory→blocking in `guidance/constraints.yaml` (a one-line follow-up).
3. **Follow-ups.** — Optional, all deferred: a `.well-known/security.txt` (RFC 9116)
   pointing at the policy now that a domain is bound; `includeSubDomains`/`preload` on
   HSTS once the whole `jysf.org` zone is HTTPS-only; and the constraint-severity bump.
   None block the project ship.

### Post-ship polish (after the stage's specs shipped)

Two small UX/hardening items were done directly on `main` (not as formal specs) once
the app was live: the win display moved below the title into a reserved banner band so
it no longer covers the reels (#40), and a version + build-id "About" section was added
to the Paytable sheet (#41) so the live commit is identifiable. Both are noted here for
completeness; neither changes the engine (still frozen since SPEC-011).
