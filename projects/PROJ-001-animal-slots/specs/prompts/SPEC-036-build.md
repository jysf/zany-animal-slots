# SPEC-036 — BUILD prompt (fresh session — Sonnet)

> Run on **claude-sonnet-4-6** (AGENTS §8).

```
Cycle: build. You are NOT the architect. The spec file is your only context.

Read in order:
1. /AGENTS.md (§5, §11, §12).
2. /projects/PROJ-001-animal-slots/specs/SPEC-036-ci-supply-chain-and-license-gate.md
   — the ENTIRE Implementation Context, Acceptance Criteria, Failing Tests, Notes
   (the Notes give the exact scanner + recipes + CI job).
3. /projects/PROJ-001-animal-slots/stages/STAGE-006-release-and-deploy.md
4. /docs/license-policy.md, /decisions/DEC-008, /decisions/DEC-009.
5. /.github/workflows/ci.yml (extend it), /justfile (recipe style), /package.json,
   /guidance/constraints.yaml (license-policy, no-new-top-level-deps).
6. /src/ui/reduced-motion.contract.test.tsx (fs/test pattern).

Before coding, branch and mark build `[~]` in the SPEC-036 timeline. If something
needs architect judgment, set `[?]` with a one-line reason and stop.

Branch: git checkout main && git pull --ff-only && git checkout -b feat/spec-036-supply-chain-gate

Implement EXACTLY the spec (Notes give the scanner code):
- scripts/license-check.mjs — the dependency-free permissive-only license scanner:
  export ALLOWED (MIT, MIT-0, ISC, Apache-2.0, BSD-2-Clause, BSD-3-Clause, BSD, 0BSD,
  Zlib, Unicode-3.0, Unicode-DFS-2016, CC0-1.0, BlueOak-1.0.0, Python-2.0); export
  EXCEPTIONS = { 'caniuse-lite': 'CC-BY-4.0' } (with a why-safe comment: transitive
  build-time data dep, not in the shipped bundle); export isAllowed(name, license)
  (honors the exception; splits SPDX on OR/AND and requires EVERY token allowed;
  rejects GPL/AGPL/LGPL); export scan(root) (walks node_modules incl. scoped + nested,
  reads license/licenses per package, returns the violation list); a `main()` CLI
  guard that scans process.cwd()/node_modules and process.exit(1) printing violations,
  else prints an OK message.
- justfile — add `license-check:` (@node scripts/license-check.mjs) and `audit:`
  (@npm audit --omit=dev --audit-level=high) recipes near the app-commands block.
- .github/workflows/ci.yml — add a `supply-chain` job mirroring app-checks's setup
  (checkout → setup-node 20 + cache:npm → npm ci), then two steps: `npm audit
  --omit=dev --audit-level=high` and `node scripts/license-check.mjs`.
- scripts/license-check.test.ts — import { ALLOWED, isAllowed, scan } from
  './license-check.mjs'; assert: ALLOWED is permissive-only (has MIT/Apache-2.0/ISC/
  BSD-2-Clause/BSD-3-Clause/0BSD; lacks GPL-3.0-only/AGPL-3.0/LGPL-3.0); isAllowed
  honors SPDX OR + the caniuse-lite exception + rejects GPL-3.0-only/AGPL-3.0; and
  scan(resolve(process.cwd(),'node_modules')) returns an EMPTY array (the current tree
  is clean — verified at design).
- Do NOT modify src/engine or app code. NO new dependency (the scanner is plain Node).
  Keep ALL existing tests green.

Verify locally: `just license-check` exits 0; `just audit` runs (a devDep advisory is
fine — the gate is --omit=dev high). NO new DEC (no new dep). This repo's ESLint has
NO react-hooks plugin — no exhaustive-deps disable.

Gate (all exit 0): just typecheck && just lint && just test && just build

When done:
1. Fill "## Build Completion" (incl. the Audit/license result line + 3 honest reflection answers).
2. Append a build cost session (cycle: build, agent: claude-sonnet-4-6, interface:
   claude-code, tokens_total null + "orchestrator to fill tokens_total from
   subagent_tokens" note).
3. Mark build `[~]` only.
4. Commit locally (message referencing SPEC-036).
DO NOT git push / open a PR / run gh / run just advance-cycle.
```
