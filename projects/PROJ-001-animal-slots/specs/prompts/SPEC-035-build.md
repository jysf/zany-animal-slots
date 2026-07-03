# SPEC-035 — BUILD prompt (fresh session — Sonnet)

> Run on **claude-sonnet-4-6** (AGENTS §8).

```
Cycle: build. You are NOT the architect. The spec file is your only context.

Read in order:
1. /AGENTS.md (§5, §11, §12).
2. /projects/PROJ-001-animal-slots/specs/SPEC-035-security-headers-and-cache-policy.md
   — the ENTIRE Implementation Context, Acceptance Criteria, Failing Tests, Notes
   (the Notes give the exact _headers file).
3. /projects/PROJ-001-animal-slots/stages/STAGE-006-release-and-deploy.md
4. /decisions/DEC-008, /decisions/DEC-005, /decisions/DEC-006, /decisions/DEC-007.
5. /vite.config.ts, and run `npm run build` then read /dist/index.html to confirm the
   built script is external + type=module (no inline script/style).
6. /guidance/constraints.yaml — test-before-implementation, one-spec-per-pr.

Before coding, branch and mark build `[~]` in the SPEC-035 timeline. If something
needs architect judgment, set `[?]` with a one-line reason and stop.

Branch: git checkout main && git pull --ff-only && git checkout -b feat/spec-035-security-headers

Implement EXACTLY the spec:
- public/_headers — create it exactly per the spec Notes: a `/*` block with
  X-Content-Type-Options: nosniff, X-Frame-Options: DENY, Referrer-Policy:
  strict-origin-when-cross-origin, Permissions-Policy: camera=(), microphone=(),
  geolocation=(), payment=(), a single-line Content-Security-Policy (default-src
  'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;
  font-src 'self'; connect-src 'self'; media-src 'self'; object-src 'none'; base-uri
  'self'; form-action 'self'; frame-ancestors 'none'), and Cache-Control: no-cache;
  then a `/assets/*` block with Cache-Control: public, max-age=31536000, immutable.
  The CSP MUST be one line (no wrapping); script-src MUST NOT contain unsafe-inline/eval.
- src/deploy/headers.contract.test.ts — read public/_headers via
  readFileSync(resolve(process.cwd(), 'public/_headers'), 'utf-8') and assert: the CSP
  directives (default-src/script-src/style-src/img-src/connect-src/object-src/base-uri/
  frame-ancestors); script-src has no 'unsafe-inline'/'unsafe-eval'; the standard
  headers (nosniff, DENY, Referrer-Policy, Permissions-Policy with camera/microphone/
  geolocation/payment); the /assets/* immutable max-age=31536000 rule; the default
  no-cache rule; and (optional) if dist/_headers exists, it equals public/_headers
  (skip gracefully if dist/ is absent).
- Run `npm run build` and confirm dist/_headers is produced (Vite copies public/).
- Do NOT modify src/engine or app code. NO new dependency. Keep ALL existing tests green.

NO new DEC (DEC-008 governs). This repo's ESLint has NO react-hooks plugin — no
exhaustive-deps disable. @testing-library/user-event is NOT installed.

Gate (all exit 0): just typecheck && just lint && just test && just build

When done:
1. Fill "## Build Completion" (incl. confirming dist/_headers is produced + 3 honest
   reflection answers).
2. Append a build cost session (cycle: build, agent: claude-sonnet-4-6, interface:
   claude-code, tokens_total null + "orchestrator to fill tokens_total from
   subagent_tokens" note).
3. Mark build `[~]` only.
4. Commit locally (message referencing SPEC-035).
DO NOT git push / open a PR / run gh / run just advance-cycle.
```
