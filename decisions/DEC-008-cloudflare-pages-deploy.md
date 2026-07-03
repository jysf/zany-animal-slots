---
# Maps to ContextCore insight.* semantic conventions.

insight:
  id: DEC-008
  type: decision
  confidence: 0.8
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

created_at: 2026-06-18
supersedes: null
superseded_by: DEC-014

# Governs deploy/CI config added in STAGE-006.
affected_scope:
  - .github/workflows/**
  - public/_headers
  - wrangler.toml

tags:
  - deployment
  - hosting
  - security
  - cloudflare
---

# DEC-008: Deploy the static SPA to Cloudflare Pages

> **SUPERSEDED by [DEC-014](DEC-014-workers-static-assets-deploy.md) (2026-07-03).**
> The deploy target changed from Cloudflare Pages to **Cloudflare Workers Static
> Assets**: when we deployed in STAGE-006, the operator's dashboard did not surface
> the Pages create flow, and `npx wrangler deploy` failed because its Vite-plugin
> auto-config requires Vite ≥ 6 (we are on 5.4). An explicit `wrangler.jsonc`
> `assets` block fixes it. The `_headers` CSP strategy below is unchanged (Workers
> Static Assets honors `_headers`). Kept for history.

## Decision

Animal Slots is deployed as a static site to **Cloudflare Pages**, built by Vite
(`npm run build` → `dist/`) and shipped automatically by CI on merge to `main`.
Security headers are served via a Pages `_headers` file. This is the deploy
target for STAGE-006 (Release & deploy).

## Context

The app is a client-only static SPA — no backend, no server-side rendering, no
runtime API (see `DEC-005`, architecture doc). It needs a host that serves
static assets at the edge, is free for a small demo, and integrates with CI for
a push-button deploy. The project added a release stage (STAGE-006) to actually
put the game in front of players (a brief success criterion), so a target had to
be chosen.

## Alternatives Considered

- **Option A: GitHub Pages**
  - What it is: static hosting from the repo.
  - Why rejected: weaker control over custom HTTP headers (CSP etc.) without
    workarounds; no edge-function path if ever needed.

- **Option B: Vercel / Netlify**
  - What it is: static + serverless hosting with good DX.
  - Why rejected: fine choices, but no advantage over Cloudflare for a pure
    static SPA, and we have no serverless needs. One target is enough.

- **Option C: Cloudflare Workers Static Assets**
  - What it is: the newer Cloudflare way to serve static assets from a Worker.
  - Why deferred: viable and arguably the modern path, but Pages is the simpler
    mental model for a plain static SPA today. Noted as the upgrade path if we
    ever want edge logic.

- **Option D (chosen): Cloudflare Pages**
  - What it is: static hosting at the edge, free tier, Git/CI deploy, first-class
    `_headers`/`_redirects` support, easy custom domains later.
  - Why selected: best fit for a free, edge-served static SPA with full control
    over security headers, and a clean CI deploy.

## Consequences

- **Positive:** Free edge hosting; full control of CSP/security headers via
  `_headers`; simple CI deploy; trivial custom-domain path for PROJ-002.
- **Negative:** Ties deploy/CI config to Cloudflare specifics (`_headers`,
  wrangler / the Pages Action, a `CLOUDFLARE_API_TOKEN` CI secret). Migrating
  hosts later means redoing that glue.
- **Neutral:** The API token is a CI secret only, never committed
  (constraint `no-secrets-in-code`).

## Validation

Right if: the game is reachable at a `*.pages.dev` URL, deploys on merge, and the
served security headers (CSP etc.) check out. Revisit if: we need edge/serverless
logic (consider Workers Static Assets) or outgrow the free tier.

## References

- Related stage: STAGE-006 (Release & deploy)
- Related decisions: DEC-005 (play-money, no backend), DEC-006/DEC-007 (no
  external asset sources — lets CSP stay tight)
- Related constraints: `no-secrets-in-code`, `license-policy`
