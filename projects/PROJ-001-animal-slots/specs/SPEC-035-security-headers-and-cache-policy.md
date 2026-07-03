---
# Maps to ContextCore task.* semantic conventions.

task:
  id: SPEC-035
  type: story
  cycle: build
  blocked: false
  priority: high
  complexity: M

project:
  id: PROJ-001
  stage: STAGE-006
repo:
  id: animal-slots

agents:
  architect: claude-opus-4-8
  implementer: claude-sonnet-4-6
  created_at: 2026-07-03

references:
  decisions:
    - DEC-008
    - DEC-005
    - DEC-006
    - DEC-007
  constraints:
    - no-real-money
    - test-before-implementation
    - one-spec-per-pr
  related_specs:
    - SPEC-001

value_link: "Hardens the served app: a tight CSP + security headers + a sane static cache policy in a Cloudflare Pages _headers file, so the public deploy is safe by construction. First STAGE-006 [REPO] spec (no external account needed)."

cost:
  sessions:
    - cycle: design
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      duration_minutes: 30
      recorded_at: 2026-07-03
      notes: "main-loop, not separately metered (AGENTS §4); design cycle (incl. CSP tuning against the built dist/index.html)"
    - cycle: build
      agent: claude-sonnet-4-6
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      duration_minutes: null
      recorded_at: 2026-07-03
      notes: "orchestrator to fill tokens_total from subagent_tokens at ship"
  totals:
    tokens_total: 0
    estimated_usd: 0
    session_count: 0
---

# SPEC-035: Security headers & cache policy

## Context

First STAGE-006 **[REPO]** spec (buildable now — no Cloudflare account needed). It
adds the HTTP hardening the public deploy needs, as a Cloudflare Pages `_headers`
file: a **Content-Security-Policy** tuned to the app's real sources, the standard
security headers (nosniff / anti-clickjacking / referrer / permissions), and a
**static-asset cache** policy (immutable long-cache for hashed assets, no-cache for
navigations). The file lives at `public/_headers` so Vite copies it to `dist/_headers`,
where Cloudflare Pages reads it (DEC-008).

The CSP can be tight: the app is a client-only static SPA (DEC-005) with **no
external scripts/fonts/images** — emoji are Unicode glyphs (DEC-006), audio is
synthesized via Web Audio / Tone.js with no asset files (DEC-007). The built
`dist/index.html` has only an **external** `type=module` script + an external
stylesheet (no inline `<script>`/`<style>`), so `script-src 'self'` holds. The one
concession: the app sets inline **style *attributes*** at runtime for CSS custom
properties (`--reel-index`, particle `--p-*`), so `style-src` needs `'unsafe-inline'`
(style-only, no script — low risk).

The *served* headers are confirmed later by the **[OPS]** production smoke check
(headers only exist at the live edge); this spec ships the file + a contract test.

See STAGE-006, `DEC-008` (Cloudflare Pages + `_headers`), `DEC-005`/`DEC-006`/`DEC-007`
(why the CSP can stay tight).

## Goal

Create `public/_headers` with (1) a tight CSP + `X-Content-Type-Options`,
`X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`; and (2) cache rules —
`immutable` long-cache for `/assets/*`, `no-cache` default for everything else; and
add a contract test asserting the directives. Confirm the file lands in `dist/`
after `npm run build`.

## Inputs

- **Files to read:** `dist/index.html` (after `npm run build` — the real script/style
  shape), `vite.config.ts` (public dir handling), `decisions/DEC-008`,
  `src/ui/reduced-motion.contract.test.tsx` (the fs contract-test pattern),
  `guidance/constraints.yaml`. Cloudflare Pages `_headers` docs.
- **Related code paths:** `public/`, project root, `src/`.

## Outputs

- **Files created:**
  - `public/_headers` — the Cloudflare Pages headers + cache file.
  - `src/deploy/headers.contract.test.ts` — asserts the CSP + headers + cache rules.
- **Files modified:** none (Vite auto-copies `public/` to `dist/`).
- **New exports:** none.
- **Database changes:** none.

## Acceptance Criteria

- [ ] `public/_headers` sets, for all paths (`/*`), a CSP of at least:
      `default-src 'self'`; `script-src 'self'`; `style-src 'self' 'unsafe-inline'`;
      `img-src 'self' data:`; `font-src 'self'`; `connect-src 'self'`;
      `object-src 'none'`; `base-uri 'self'`; `frame-ancestors 'none'`.
- [ ] It also sets `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`,
      `Referrer-Policy: strict-origin-when-cross-origin`, and a `Permissions-Policy`
      that disables at least `camera`, `microphone`, `geolocation`, `payment`.
- [ ] Cache: `/assets/*` → `Cache-Control: public, max-age=31536000, immutable`;
      the default (`/*`) → a `no-cache` (or `no-store`) `Cache-Control` so
      `index.html`/navigations are always revalidated.
- [ ] `script-src` does **not** contain `'unsafe-inline'` or `'unsafe-eval'` (the
      built script is external + `type=module`); `style-src`'s `'unsafe-inline'` is
      allowed **only** for style (documented as the inline-custom-property concession).
- [ ] After `npm run build`, `dist/_headers` exists and equals `public/_headers`
      (Vite copies it). The contract test passes; gate exits 0.

## Failing Tests

Written during **design**, BEFORE build. Read `public/_headers` via `fs`
(`readFileSync(resolve(process.cwd(), 'public/_headers'), 'utf-8')`).

- **`src/deploy/headers.contract.test.ts`**
  - `"defines a tight CSP"` — the file matches `Content-Security-Policy` and
    contains each required directive (`default-src 'self'`, `object-src 'none'`,
    `frame-ancestors 'none'`, `base-uri 'self'`, `script-src 'self'`,
    `style-src 'self' 'unsafe-inline'`, `connect-src 'self'`).
  - `"script-src has no unsafe-inline/eval"` — the `script-src` directive does not
    contain `'unsafe-inline'` or `'unsafe-eval'` (assert the CSP has `script-src 'self'`
    and that the substring `script-src` is not followed by `unsafe`).
  - `"sets the standard security headers"` — matches `X-Content-Type-Options: nosniff`,
    `X-Frame-Options: DENY`, `Referrer-Policy:`, `Permissions-Policy:` (with
    camera/microphone/geolocation/payment disabled).
  - `"caches hashed assets immutably and revalidates html"` — an `/assets/*` block
    with `max-age=31536000` + `immutable`; a `/*` (or `/index.html`) block with
    `no-cache`/`no-store`.
  - `"the built dist includes _headers"` (optional, if a `dist/` exists in CI) —
    skip gracefully if `dist/_headers` is absent (the build job produces it); when
    present, assert it equals `public/_headers`.

## Implementation Context

### Decisions that apply

- `DEC-008` — deploy is Cloudflare Pages; security headers are served via a
  `_headers` file (this spec creates it). `affected_scope` includes `_headers`.
- `DEC-005` — client-only, no backend → `connect-src 'self'`, no external origins.
- `DEC-006`/`DEC-007` — emoji (no image/font fetches) + synthesized audio (no media
  files) → `img-src`/`font-src`/`media-src` need no external sources; keep tight.

### Constraints that apply

- `no-real-money` — the SECURITY posture (documented in SPEC-037) is play-money;
  the CSP/headers reduce the (already small) attack surface.
- `test-before-implementation`, `one-spec-per-pr`.

### Prior related work

- `SPEC-001` (shipped) — the Vite scaffold + `dist/` build this deploys.
- (STAGE-006 [OPS] specs) — the live smoke check verifies these headers on the edge.

### Out of scope (for this spec specifically)

- The Cloudflare Pages project / deploy wiring / CI deploy job ([OPS] — needs the
  account). The CI audit gate (SPEC-036) and `SECURITY.md` (SPEC-037). Confirming the
  *served* headers (that's the [OPS] smoke check — headers only exist at the edge).
- HSTS: Cloudflare Pages serves HTTPS and can enforce HSTS at the zone level; leave
  the `Strict-Transport-Security` header to the Cloudflare/zone config (note it, don't
  hard-code a max-age here) — mention in SPEC-037/handoff.

## Notes for the Implementer

- `public/_headers` (Cloudflare Pages format — a path line, then indented
  `Header: value` lines; later/more-specific rules win for a repeated header):
  ```
  /*
    X-Content-Type-Options: nosniff
    X-Frame-Options: DENY
    Referrer-Policy: strict-origin-when-cross-origin
    Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
    Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; media-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'
    Cache-Control: no-cache

  /assets/*
    Cache-Control: public, max-age=31536000, immutable
  ```
  (One CSP line — do not wrap it; `_headers` values are single-line. The `/assets/*`
  block re-sets `Cache-Control` so hashed assets are immutable while everything else
  revalidates.)
- The test reads the file from the repo root: `readFileSync(resolve(process.cwd(),
  'public/_headers'), 'utf-8')`. Put it in `src/deploy/` (create the dir); test files
  are not bundled into `dist`.
- After writing, run `npm run build` and confirm `dist/_headers` appears (Vite copies
  `public/` verbatim). The "built dist includes _headers" test should skip if `dist/`
  isn't present (so the test passes in a fresh checkout too).
- No new dependency. No new DEC (DEC-008 governs). This repo's ESLint has no
  react-hooks plugin; no `@testing-library/user-event`.
- After build, the orchestrator confirms `dist/_headers` is produced by the build
  (the *served* headers are the [OPS] smoke check's job, not previewable locally —
  the Vite dev server doesn't apply `_headers`).

---

## Build Completion

*Filled in at the end of the **build** cycle, before advancing to verify.*

- **Branch:** feat/spec-035-security-headers
- **PR (if applicable):** local only (no push per spec instructions)
- **All acceptance criteria met?** yes
- **New decisions emitted:**
  - none — DEC-008 governs
- **Deviations from spec:**
  - none
- **Follow-up work identified:**
  - none beyond the already-planned STAGE-006 [OPS] specs

### dist/_headers confirmed

`npm run build` produced `dist/_headers` (533B); the contract test's "the built dist
includes _headers" assertion passed — `dist/_headers` equals `public/_headers` byte-for-byte.

### Build-phase reflection (3 questions, short answers)

1. **What was unclear in the spec that slowed you down?**
   — Nothing meaningfully slow. The Notes section gave the exact file content and the
   test described the parsing approach clearly. The only moment of care was confirming
   the `dist/index.html` truly had no inline scripts before trusting `script-src 'self'`
   — but the spec told me to verify that, and `dist/index.html` confirmed it.

2. **Was there a constraint or decision that should have been listed but wasn't?**
   — No missing constraints. DEC-008/DEC-005/DEC-006/DEC-007 collectively justify every
   CSP directive. The `vite.config.ts` public-dir default (copies `public/` to `dist/`
   verbatim) is implicit knowledge but obvious from the Vite docs and confirmed by the
   build output.

3. **If you did this task again, what would you do differently?**
   — Nothing structural. The spec was well-scoped and the Notes gave enough detail to
   implement without guessing. I might pre-run the build before writing the test so the
   dist check runs on the first `npm test` pass rather than skipping, but the skip-if-absent
   guard is correct behaviour for a fresh checkout.

---

## Reflection (Ship)

*Appended during the **ship** cycle.*

1. **What would I do differently next time?**
   — <answer>

2. **Does any template, constraint, or decision need updating?**
   — <answer>

3. **Is there a follow-up spec I should write now before I forget?**
   — <answer>
