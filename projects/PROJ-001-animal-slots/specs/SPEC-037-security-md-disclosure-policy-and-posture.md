---
# Maps to ContextCore task.* semantic conventions.
# This variant assumes Claude plays every role. The context normally
# in a separate handoff doc lives in the ## Implementation Context
# section below.

task:
  id: SPEC-037
  type: story                      # epic | story | task | bug | chore
  cycle: verify  # frame | design | build | verify | ship
  blocked: false
  priority: medium
  complexity: S                    # S | M | L  (L means split it)

project:
  id: PROJ-001
  stage: STAGE-006
repo:
  id: animal-slots

agents:
  architect: claude-opus-4-8       # design/frame: Opus (judgement-heavy). See AGENTS §8.
  implementer: claude-sonnet-4-6   # build/verify: Sonnet (execution against the spec)
  created_at: 2026-07-03

references:
  decisions:
    - DEC-008
  constraints:
    - test-before-implementation
    - one-spec-per-pr
  related_specs:
    - SPEC-035
    - SPEC-036

value_link: "Publishes the deployed app's security posture (play-money, no PII, no backend, client-only) + a coordinated-disclosure path, and pins it with a contract test so the posture and the headers/HSTS split can't silently drift. Last STAGE-006 [REPO] spec before the [OPS] handoff."

cost:
  sessions:
    - cycle: design
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      duration_minutes: 20
      recorded_at: 2026-07-03
      notes: "main-loop, not separately metered (AGENTS §4); design cycle (replace the scaffold-default SECURITY.md with the deployed posture + disclosure policy; write the contract test)"
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

# SPEC-037: SECURITY.md disclosure policy and posture

## Context

Third and final STAGE-006 **[REPO]** spec (buildable now, no external account).
The repo ships a **scaffold-default** `SECURITY.md` describing the *template's*
threat model (local-first markdown/`justfile`/bash tooling) — not the deployed
artifact. Now that STAGE-006 is putting the app on Cloudflare Pages, the public
`SECURITY.md` should describe the **real** deployed posture and a
coordinated-disclosure path.

This spec replaces `SECURITY.md` with a policy tailored to what is actually
deployed — a play-money, no-PII, no-backend, client-only static SPA — and pins
the required sections + key posture claims with a contract test, the same
"declare it, then test that it holds" pattern used for the headers (SPEC-035),
the supply-chain gate (SPEC-036), and the a11y/perf guards. It also records the
headers/HSTS split: response headers ship in `public/_headers` (SPEC-035), while
**HSTS** is applied at the Cloudflare zone/edge layer (STAGE-006 design), not in
`_headers`.

See `STAGE-006` (this spec's backlog slot), `PROJ-001`, `DEC-008` (Cloudflare
Pages is the deploy target), SPEC-035 (headers), SPEC-036 (supply-chain gate).

## Goal

Replace the scaffold-default `SECURITY.md` with a policy documenting the deployed
security posture (play-money, no PII, no backend, client-only) and a
coordinated-disclosure process, and add a contract test asserting the required
sections and key posture claims are present so the policy can't silently drift.

## Inputs

- **Files to read:** `SECURITY.md` (the current scaffold default — to replace),
  `public/_headers` (SPEC-035 — the shipped headers this policy references),
  `src/ui/reduced-motion.contract.test.tsx` (the doc/fs contract-test pattern —
  `__dirname` via `import.meta.url`, `readFileSync`, plain assertions),
  `projects/PROJ-001-animal-slots/stages/STAGE-006-release-and-deploy.md`
  (the HSTS-at-the-zone design note), `AGENTS.md`.
- **Related code paths:** repo root (`SECURITY.md`, the new test), `public/`.

## Outputs

- **Files created:**
  - `SECURITY.contract.test.ts` (repo root) — a vitest contract test that reads
    `SECURITY.md` and asserts the required sections + posture claims exist.
- **Files modified:**
  - `SECURITY.md` — replaced with the deployed-posture policy (sections:
    **Security posture**, **Deployment hardening**, **Reporting a vulnerability**).
- **New exports:** none.
- **Database changes:** none.
- **New dependency:** **none** (test uses built-in `node:fs`/`node:path`/`node:url`
  + vitest, already present).

## Acceptance Criteria

- [ ] `SECURITY.md` contains three required section headings (case-insensitive,
      `##`-level): "Security posture", "Deployment hardening", "Reporting a
      vulnerability".
- [ ] The **Security posture** section states the deployed posture: play-money
      (no real currency/wagering), no PII / no personal data collected, no backend
      / client-only static SPA, and no third-party runtime/analytics calls.
- [ ] The **Deployment hardening** section references the shipped response headers
      (`public/_headers` / CSP, SPEC-035) and the supply-chain gate (SPEC-036), and
      **explicitly** notes that **HSTS** is applied at the Cloudflare zone/edge
      layer (not in `_headers`).
- [ ] The **Reporting a vulnerability** section gives a coordinated-disclosure
      path: report privately (a GitHub Security Advisory / not a public issue),
      best-effort response, no bug bounty, coordinate a fix before disclosure.
- [ ] `SECURITY.contract.test.ts` passes: it reads `SECURITY.md` and asserts the
      three headings + the posture/HSTS/reporting claims above. A future edit that
      drops a required section or claim fails the test.
- [ ] Full gate green (`just typecheck && just lint && just test && just build`);
      no new dependency; engine unchanged (empty `git diff main..HEAD -- src/engine/`).

## Failing Tests

Written during **design**, BEFORE build. The implementer's job in **build** is to
make these pass (the new `SECURITY.md` content makes them green).

- **`SECURITY.contract.test.ts`** (repo root; resolves the repo root from
  `import.meta.url` — do NOT use `process`, so it lints clean under the
  browser-scoped ESLint config; cf. `src/ui/reduced-motion.contract.test.tsx`)
  - `"SECURITY.md exists and is non-empty"` — `readFileSync(resolve(ROOT,
    'SECURITY.md'), 'utf-8')` has length > 0.
  - `"has the three required ## sections"` — the text matches
    `/^##\s+Security posture/im`, `/^##\s+Deployment hardening/im`, and
    `/^##\s+Reporting a vulnerability/im`.
  - `"posture section declares play-money / no-PII / no-backend / client-only"` —
    text matches `/play-money/i`, `/no PII|personal data/i`, and
    `/no backend|client-only|client-side/i`.
  - `"deployment section documents the headers + the HSTS-at-the-zone split"` —
    text matches `/_headers|CSP/`, `/SPEC-036|supply-chain/i`, and BOTH `/HSTS/`
    AND `/Cloudflare/` (the HSTS-at-zone note).
  - `"reporting section gives a private coordinated-disclosure path"` — text
    matches `/security advisory/i` (or `/report .* privately|not .* public issue/i`)
    and `/disclosure/i`.

## Implementation Context

*Read this section (and the files it points to) before starting the build cycle.*

### Decisions that apply

- `DEC-008` — Cloudflare Pages is the deploy target; the headers ship via
  `public/_headers` and HSTS lives at the zone/edge, which this policy documents.

### Constraints that apply

- `test-before-implementation` — the contract test is written here at design; build
  makes it pass by writing the policy.
- `one-spec-per-pr` — SECURITY.md + its test only; no unrelated changes.

### Prior related work

- `SPEC-035` (shipped) — `public/_headers`: the CSP + security headers this policy
  references. `SPEC-036` (shipped) — the CI supply-chain + license gate.
- The a11y/perf/headers contract tests (`src/ui/reduced-motion.contract.test.tsx`,
  `src/styles/contrast.test.ts`, `src/ui/perf.contract.test.ts`) — the same
  "test that the declared thing holds" pattern this test follows.

### Out of scope (for this spec specifically)

- Actually setting HSTS / configuring the Cloudflare zone (that's an **[OPS]**
  handoff task, needs the operator's account). This spec only *documents* the split.
- Bumping the `license-policy` constraint severity advisory→blocking (a `guidance/`
  follow-up noted at SPEC-036 ship).
- A `.well-known/security.txt` (RFC 9116) — could be a later [OPS]/[REPO] follow-up
  once the domain is bound; not needed for the disclosure policy itself.
- Any code/engine/UI change.

## Notes for the Implementer

- **Replace** `SECURITY.md` wholesale — the current content is the template's
  local-tooling threat model and does not describe the deployed app. Write it for
  the deployed artifact.
- Suggested `SECURITY.md` skeleton (fill with real prose; keep the three `##`
  headings exactly so the test matches):
  ```markdown
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
  ```
- The **test** mirrors `src/ui/reduced-motion.contract.test.tsx`'s file-reading
  style: derive `ROOT` via `const __dirname = dirname(fileURLToPath(import.meta.url))`
  then `resolve(__dirname)` (the test sits at repo root, so ROOT is `__dirname`).
  Use `import { readFileSync } from 'node:fs'`, `import { resolve, dirname } from
  'node:path'`, `import { fileURLToPath } from 'node:url'`, `import { describe, it,
  expect } from 'vitest'`. **Do not use `process`** — the root file is outside the
  `scripts/**` ESLint block that grants Node globals, so `process` would trip
  `no-undef` (dogfood finding #15). `import.meta.url` keeps it clean.
- Root-level `*.test.ts` is run by vitest (default include) but is NOT in
  `tsconfig.json`'s `include: ["src"]`, so it is not typechecked by `tsc` — exactly
  like `scripts/license-check.test.ts`. That's fine; vitest exercises it.
- No new dependency, no new DEC. Do not touch `src/engine/**` or app code.

---

## Build Completion

*Filled in at the end of the **build** cycle, before advancing to verify.*

- **Branch:** `feat/spec-037-security-md`
- **PR (if applicable):** none (local only)
- **All acceptance criteria met?** yes
- **New decisions emitted:**
  - none — docs + a contract test only, no new dep
- **Deviations from spec:**
  - none; SECURITY.md skeleton from spec Notes used verbatim with real prose
- **Follow-up work identified:**
  - none beyond what was already listed as out-of-scope (`.well-known/security.txt`, HSTS zone config, `license-policy` severity bump)

### Build-phase reflection (3 questions, short answers)

1. **What was unclear in the spec that slowed you down?**
   — Nothing slowed the build; the Notes section provided a complete SECURITY.md skeleton and the exact test patterns. The dogfood finding #15 (`process` → `import.meta.url`) was clearly called out in both the spec and the build prompt.

2. **Was there a constraint or decision that should have been listed but wasn't?**
   — No missing constraints. The ESLint browser-scope note (no `process` at repo root) is specific enough to warrant a constraint entry, but the inline callout in Notes + the build prompt was sufficient here.

3. **If you did this task again, what would you do differently?**
   — Nothing significant. Reading the spec's Notes skeleton first and using it directly (rather than drafting from scratch) was the right call and eliminated any content ambiguity.

---

## Reflection (Ship)

*Appended during the **ship** cycle. Outcome-focused reflection, distinct
from the process-focused build reflection above.*

1. **What would I do differently next time?**
   — <answer>

2. **Does any template, constraint, or decision need updating?**
   — <answer>

3. **Is there a follow-up spec I should write now before I forget?**
   — <answer>
