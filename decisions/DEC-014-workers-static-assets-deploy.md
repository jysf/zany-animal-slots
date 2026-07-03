---
# Maps to ContextCore insight.* semantic conventions.

insight:
  id: DEC-014
  type: decision
  confidence: 0.85
  audience:
    - developer
    - operator
    - agent

agent:
  id: claude-opus-4-8
  session_id: null

project:
  id: PROJ-001
repo:
  id: animal-slots

created_at: 2026-07-03
supersedes: DEC-008
superseded_by: null

# Governs the deploy config added in STAGE-006. Same scope DEC-008 held,
# now pointing at Workers Static Assets (wrangler.jsonc) instead of Pages.
affected_scope:
  - .github/workflows/**
  - public/_headers
  - wrangler.jsonc
  - wrangler.toml

tags:
  - deployment
  - hosting
  - security
  - cloudflare
---

# DEC-014: Deploy the static SPA via Cloudflare Workers Static Assets

## Decision

Animal Slots is deployed as a static site via **Cloudflare Workers Static
Assets** — `npm run build` → `dist/`, uploaded by `npx wrangler deploy` using an
explicit `wrangler.jsonc` `assets` block (no Worker script). Security headers are
still served via a `_headers` file (honored by Workers Static Assets); HSTS is set
at the Cloudflare zone/edge. This **supersedes DEC-008** (Cloudflare Pages).

## Context

DEC-008 chose Cloudflare **Pages** and explicitly listed Workers Static Assets as
"the modern path… noted as the upgrade path." Two things forced the switch when we
actually deployed in STAGE-006:

1. **Cloudflare has de-emphasized Pages for new projects** — the dashboard's
   create flow steers new work to Workers, and the Pages "Connect to Git" entry
   point was not discoverable in the operator's account.
2. **The first deploy failed on the Pages/Workers-builds path**: the configured
   deploy command `npx wrangler deploy` auto-detected the Vite framework and tried
   to apply the Cloudflare Vite plugin, which requires **Vite ≥ 6**. This project
   is on Vite 5.4, so the deploy aborted:
   `The version of Vite ("5.4.21") cannot be automatically configured.`

Adding an explicit `wrangler.jsonc` with an `assets.directory` makes `wrangler
deploy` treat the build as a static-assets upload and skip framework auto-config —
which both fixes the error and lands us on Cloudflare's current recommended path.
The client-only, no-backend nature of the app (DEC-005) is unchanged; only the
hosting product changes.

## Alternatives Considered

- **Option A: Stay on Cloudflare Pages (DEC-008)**
  - What it is: Pages Git integration uploads `dist/` with no deploy command.
  - Why rejected now: still technically possible, but the operator's dashboard did
    not surface the Pages create flow, and Cloudflare is steering new projects to
    Workers. Fighting the platform's default for no functional gain.

- **Option B: Upgrade Vite to ≥ 6 and keep the Pages/Vite-plugin path**
  - What it is: bump the build tool so the auto-config succeeds.
  - Why rejected: a major-version build-tool bump (risk to the whole app + tests)
    purely to satisfy a deploy auto-detector we don't need. Out of proportion to a
    static-asset upload; would also touch the frozen-engine-era stability we've kept.

- **Option C (chosen): Cloudflare Workers Static Assets**
  - What it is: `wrangler deploy` uploads `dist/` as static assets via an explicit
    `wrangler.jsonc`; `_headers`/`_redirects` are honored; custom domains supported.
  - Why selected: fixes the deploy with one in-repo config file, no dependency or
    build-tool change, keeps our tight-CSP `_headers` strategy intact, and matches
    Cloudflare's current default. It was already DEC-008's sanctioned upgrade path.

## Consequences

- **Positive:** Deploy works with a single committed config file; no new dependency
  (wrangler is invoked via `npx` on Cloudflare's builder, not added to
  `package.json`); `_headers` CSP strategy unchanged; on Cloudflare's supported path.
- **Negative:** Ties deploy glue to Workers specifics (`wrangler.jsonc`, an assets
  binding). A `_headers` file is honored but is a slightly younger feature on
  Workers Assets than on Pages.
- **Neutral:** The `*.workers.dev` URL replaces `*.pages.dev`; custom-domain binding
  and HSTS-at-the-zone are unchanged. Any deploy API token remains a CI/dashboard
  secret, never committed (`no-secrets-in-code`).

## Validation

Right if: `npx wrangler deploy` uploads `dist/` without the Vite-config error, the
game is reachable at its Cloudflare URL, deploys on merge, and the served security
headers (CSP etc.) check out. Revisit if: Workers Static Assets stops honoring
`_headers`, or we need edge/serverless logic (a real Worker script, at which point
`main` gets added to this config).

## References

- Supersedes: DEC-008 (Cloudflare Pages)
- Related stage: STAGE-006 (Release & deploy); related specs: SPEC-035 (`_headers`),
  SPEC-037 (SECURITY.md posture + HSTS-at-zone)
- Related decisions: DEC-005 (play-money, no backend)
- Related constraints: `no-secrets-in-code`, `license-policy`
- External: Cloudflare Workers Static Assets docs; the Vite-6 auto-config error came
  from `@cloudflare/vite-plugin` framework detection during `wrangler deploy`
