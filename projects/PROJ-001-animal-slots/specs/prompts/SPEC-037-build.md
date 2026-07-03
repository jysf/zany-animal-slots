# SPEC-037 — BUILD prompt (fresh session — Sonnet)

> Run on **claude-sonnet-4-6** (AGENTS §8).

```
Cycle: build. You are NOT the architect. The spec file is your only context.

Read in order:
1. /AGENTS.md (§5, §11, §12).
2. /projects/PROJ-001-animal-slots/specs/SPEC-037-security-md-disclosure-policy-and-posture.md
   — the ENTIRE Implementation Context, Acceptance Criteria, Failing Tests, Notes
   (the Notes give the SECURITY.md skeleton + the test's file-reading style).
3. /projects/PROJ-001-animal-slots/stages/STAGE-006-release-and-deploy.md
   (the HSTS-at-the-zone design note).
4. /SECURITY.md (the scaffold default you will REPLACE), /public/_headers (SPEC-035,
   the headers this policy references), /decisions/DEC-008.
5. /src/ui/reduced-motion.contract.test.tsx — the doc/fs contract-test pattern
   (__dirname via import.meta.url; readFileSync; plain assertions).

Before coding, branch and mark build `[~]` in the SPEC-037 timeline. If something
needs architect judgment, set `[?]` with a one-line reason and stop.

Branch: git checkout main && git pull --ff-only && git checkout -b feat/spec-037-security-md

Implement EXACTLY the spec:
- SECURITY.md — REPLACE the scaffold-default content wholesale with the deployed
  posture + disclosure policy. Keep these three `##` headings EXACTLY so the test
  matches: "## Security posture", "## Deployment hardening", "## Reporting a
  vulnerability". Content must include: play-money (no real currency/wagering), no
  PII / no personal data, no backend / client-only static SPA, no third-party
  runtime/analytics calls; the response headers (public/_headers / CSP, SPEC-035),
  the supply-chain gate (SPEC-036), and an EXPLICIT note that HSTS is applied at the
  Cloudflare zone/edge (NOT in _headers); and a private coordinated-disclosure path
  (GitHub Security Advisory / not a public issue, best-effort, no bug bounty,
  coordinate a fix before disclosure). The spec's Notes give a ready skeleton — use
  it, write real prose.
- SECURITY.contract.test.ts (REPO ROOT) — a vitest test that reads SECURITY.md and
  asserts: file exists non-empty; the three `##` headings match (case-insensitive,
  ^##\s+...); posture claims (/play-money/i, /no PII|personal data/i,
  /no backend|client-only|client-side/i); deployment claims (/_headers|CSP/,
  /SPEC-036|supply-chain/i, AND BOTH /HSTS/ and /Cloudflare/); reporting claims
  (/security advisory/i or the private-report phrasing, and /disclosure/i).
  Derive the repo root from import.meta.url:
    import { readFileSync } from 'node:fs';
    import { resolve, dirname } from 'node:path';
    import { fileURLToPath } from 'node:url';
    import { describe, it, expect } from 'vitest';
    const __dirname = dirname(fileURLToPath(import.meta.url));  // repo root
    const text = readFileSync(resolve(__dirname, 'SECURITY.md'), 'utf-8');
  DO NOT use `process` anywhere — the root file is outside the scripts/** ESLint
  Node-globals block, so `process` trips no-undef (dogfood finding #15).
  import.meta.url keeps it clean.
- Do NOT modify src/engine or app code. NO new dependency. NO new DEC.

Repo gotchas (apply even though this is a docs spec):
- This repo's ESLint has NO react-hooks plugin and NO @testing-library/user-event.
- Root-level *.test.ts is run by vitest but NOT typechecked by tsc (include is
  ["src"]) — same as scripts/license-check.test.ts. That's expected; don't try to
  add it to tsconfig.

Gate (all exit 0): just typecheck && just lint && just test && just build
Confirm: git diff main..HEAD -- src/engine/ is EMPTY.

When done:
1. Fill "## Build Completion" (incl. 3 honest reflection answers).
2. Append a build cost session (cycle: build, agent: claude-sonnet-4-6, interface:
   claude-code, tokens_total null + "orchestrator to fill tokens_total from
   subagent_tokens" note).
3. Mark build `[~]` only.
4. Commit locally (message referencing SPEC-037).
DO NOT git push / open a PR / run gh / run just advance-cycle.
```
