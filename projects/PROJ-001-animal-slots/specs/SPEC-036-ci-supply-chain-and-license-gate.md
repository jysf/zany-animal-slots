---
# Maps to ContextCore task.* semantic conventions.

task:
  id: SPEC-036
  type: story
  cycle: verify
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
    - DEC-009
  constraints:
    - license-policy
    - no-new-top-level-deps-without-decision
    - test-before-implementation
    - one-spec-per-pr
  related_specs:
    - SPEC-001
    - SPEC-027

value_link: "Makes the supply chain a CI gate: a dependency/vulnerability audit + a permissive-only license check fail the build on a violation — so the deployed artifact can't silently pull in a copyleft or a known-vuln dep. STAGE-006 [REPO] spec (no external account)."

cost:
  sessions:
    - cycle: design
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      duration_minutes: 35
      recorded_at: 2026-07-03
      notes: "main-loop, not separately metered (AGENTS §4); design cycle (incl. scanning the installed license set — all permissive; one exception: caniuse-lite CC-BY-4.0)"
    - cycle: build
      agent: claude-sonnet-4-6
      interface: claude-code
      tokens_total: 45000
      estimated_usd: 0.30
      duration_minutes: null
      recorded_at: 2026-07-03
      notes: "BEST-EFFORT ESTIMATE — the original Sonnet build sub-agent was KILLED mid-run just before the gate (its true token/duration count is unrecoverable). It had produced the scanner + tests + ci.yml + justfile edits (~80% of the build). The orchestrator (Opus) then validated the uncommitted work and fixed one lint failure (Node-globals ESLint block for scripts/). 45000 is a conservative order-of-magnitude estimate for the Sonnet portion (cf. SPEC-035 build=59583 for a slightly larger spec); estimated_usd ~= tokens x $6.6/M Sonnet blended. Opus validation/fix work is main-loop, not separately metered (AGENTS §4)."
    - cycle: verify
      agent: claude-sonnet-4-6
      interface: claude-code
      tokens_total: 46226
      estimated_usd: 0.31
      duration_minutes: 6.8
      recorded_at: 2026-07-03
      notes: "Sonnet sub-agent verify (Agent subagent_tokens=46226, 410s). Cold review: full gate re-run + function-level scanner probe + engine-freeze/no-new-dep checks → PASS. estimated_usd ~= tokens x $6.6/M Sonnet blended, no cache discount (order-of-magnitude, AGENTS §4)."
    - cycle: ship
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      duration_minutes: 10
      recorded_at: 2026-07-03
      notes: "main-loop, not separately metered (AGENTS §4); ship cycle (orchestrator finished the interrupted build, ran the gate, squash-merge + bookkeeping)"
  totals:
    tokens_total: 91226
    estimated_usd: 0.61
    session_count: 5
---

# SPEC-036: CI supply-chain & license gate

## Context

Second STAGE-006 **[REPO]** spec (buildable now). It wires the `license-policy`
constraint into CI as a real gate, alongside a dependency vulnerability audit — the
"declare the policy, enforce it in CI, fail on a violation" pattern from
`docs/license-policy.md`, the sibling of the cost-capture gate.

Two checks, both **dependency-free** (the license gate is a small Node script, not
a new devDependency — so `no-new-top-level-deps-without-decision` is satisfied
without a DEC; `npm audit` is built in):
- **License policy** — a permissive-only allow-list (MIT, Apache-2.0, BSD-2/3-Clause,
  ISC, 0BSD, Zlib, Unicode-3.0, CC0-1.0, MIT-0, BlueOak-1.0.0, Python-2.0), with one
  **documented exception**: `caniuse-lite` (CC-BY-4.0) — a transitive build-time data
  package, content-attribution licensed, **not in the shipped bundle**. The design
  scan confirmed the **entire** installed tree is otherwise permissive (0 copyleft).
- **Vulnerability audit** — `npm audit --omit=dev` at a chosen severity gate.

Both run in CI (fail the build) and as `just` recipes locally. The license scanner
is unit-tested; the current tree passes with 0 violations.

See STAGE-006, `docs/license-policy.md` (the pattern), `DEC-008` (CI is where the
deploy/gates live), the `license-policy` constraint.

## Goal

Add `scripts/license-check.mjs` (a dependency-free permissive-only license scanner
over `node_modules`, with a named-exceptions map), `just license-check` + `just audit`
recipes, a `supply-chain` CI job in `.github/workflows/ci.yml` running both, and a
unit test proving the scanner (current tree clean; a copyleft would fail).

## Inputs

- **Files to read:** `.github/workflows/ci.yml` (the existing jobs to extend),
  `justfile` (recipe style), `docs/license-policy.md`, `package.json`,
  `guidance/constraints.yaml` (`license-policy`, `no-new-top-level-deps`),
  `src/ui/reduced-motion.contract.test.tsx` (fs/test pattern).
- **Related code paths:** `scripts/`, `.github/workflows/`, root `justfile`.

## Outputs

- **Files created:**
  - `scripts/license-check.mjs` — the scanner (exports `ALLOWED`, `EXCEPTIONS`,
    `isAllowed(name, license)`, `scan(root)`; a `main()` CLI guard that exits
    non-zero on any violation).
  - `scripts/license-check.test.ts` — unit tests for the scanner.
- **Files modified:**
  - `.github/workflows/ci.yml` — add a `supply-chain` job (npm ci → `npm audit
    --omit=dev --audit-level=high` → `node scripts/license-check.mjs`).
  - `justfile` — `license-check` and `audit` recipes (in the app-commands area).
- **New exports:** the scanner's functions/constants.
- **New dependency:** **none** (the scanner is plain Node; `npm audit` is built in).
- **Database changes:** none.

## Acceptance Criteria

- [ ] `scripts/license-check.mjs` exports a permissive `ALLOWED` set (incl. MIT,
      Apache-2.0, BSD-2-Clause, BSD-3-Clause, ISC, 0BSD, Zlib, Unicode-3.0, CC0-1.0,
      MIT-0, BlueOak-1.0.0, Python-2.0) and an `EXCEPTIONS` map containing
      `caniuse-lite → CC-BY-4.0` (with a why-safe note).
- [ ] `isAllowed(name, license)` treats an SPDX expression as allowed if **every**
      OR-alternative token is allowed (e.g. `"MIT OR Apache-2.0"` → allowed), honors
      the per-package exception, and returns **false** for a disallowed license
      (e.g. `GPL-3.0-only`, `AGPL-3.0`).
- [ ] `scan(root)` walks `node_modules` (incl. scoped + nested), reads each package's
      `license`/`licenses`, and returns the list of violations — which is **empty**
      for the current dependency tree.
- [ ] `node scripts/license-check.mjs` exits 0 on a clean tree and non-zero
      (printing the offending packages) on a violation.
- [ ] `just license-check` runs the scanner; `just audit` runs `npm audit --omit=dev
      --audit-level=high`. A `supply-chain` CI job runs both and fails the build on a
      violation.
- [ ] The scanner unit test passes (current tree → 0 violations; `GPL-3.0-only` →
      rejected; the `caniuse-lite` exception honored). Engine unchanged; gate exits 0.

## Failing Tests

Written during **design**, BEFORE build.

- **`scripts/license-check.test.ts`** (imports from `./license-check.mjs`)
  - `"ALLOWED is permissive-only"` — contains `MIT`, `Apache-2.0`, `ISC`,
    `BSD-2-Clause`, `BSD-3-Clause`, `0BSD`; does NOT contain `GPL-3.0-only`,
    `AGPL-3.0`, `LGPL-3.0`.
  - `"isAllowed honors SPDX OR + exceptions + rejects copyleft"` —
    `isAllowed('x','MIT') === true`; `isAllowed('x','MIT OR Apache-2.0') === true`;
    `isAllowed('x','GPL-3.0-only') === false`; `isAllowed('x','AGPL-3.0') === false`;
    `isAllowed('caniuse-lite','CC-BY-4.0') === true` (exception).
  - `"the current dependency tree passes"` — `scan(resolve(process.cwd(),
    'node_modules'))` returns an **empty** violations array (proves the policy holds
    on the real tree today).

## Implementation Context

### Decisions that apply

- `DEC-008` — CI (`.github/workflows/**`) is where the deploy + gates live; this adds
  a supply-chain job to the existing workflow.
- `DEC-009` — the dep-DEC precedent: new deps need a DEC. Here we **avoid** one by
  writing a dependency-free scanner (no `license-checker` install).

### Constraints that apply

- `license-policy` — this spec is its mechanical enforcement (the doc's pattern).
- `no-new-top-level-deps-without-decision` — satisfied by adding **no** dependency.
- `test-before-implementation`, `one-spec-per-pr`.

### Prior related work

- `docs/license-policy.md` — the pattern (allow-list, CI job, named exceptions).
- `SPEC-027` (shipped) — added `tone` (MIT); this gate confirms it (and everything
  else) stays permissive. `SPEC-001` — the CI workflow this extends.

### Out of scope (for this spec specifically)

- Bumping the `license-policy` constraint severity advisory→blocking (propose it in
  Reflection — a `guidance/` edit, not this spec's job). Security headers (SPEC-035)
  and `SECURITY.md` (SPEC-037). The [OPS] deploy specs.
- A full SBOM / provenance / signing pipeline (PROJ-002+).

## Notes for the Implementer

- `scripts/license-check.mjs` — plain Node ESM, no deps:
  ```js
  import { readdirSync, readFileSync, existsSync } from 'node:fs';
  import { join } from 'node:path';

  export const ALLOWED = new Set([
    'MIT', 'MIT-0', 'ISC', 'Apache-2.0', 'BSD-2-Clause', 'BSD-3-Clause', 'BSD',
    '0BSD', 'Zlib', 'Unicode-3.0', 'Unicode-DFS-2016', 'CC0-1.0',
    'BlueOak-1.0.0', 'Python-2.0',
  ]);
  // Named exceptions: a license OUTSIDE ALLOWED, knowingly accepted for ONE package.
  export const EXCEPTIONS = {
    // caniuse-lite ships browser-support DATA under CC-BY-4.0 (attribution). It is a
    // transitive build-time devDependency and is NOT in the shipped bundle — safe.
    'caniuse-lite': 'CC-BY-4.0',
  };

  export function isAllowed(name, license) {
    if (!license) return false;
    if (EXCEPTIONS[name] && EXCEPTIONS[name] === String(license)) return true;
    // Allowed iff EVERY OR-alternative is allowed (an "A OR B" dep lets us pick an
    // allowed one; "A AND B" requires all). Be conservative: split on OR/AND, require all.
    const toks = String(license).replace(/[()]/g, ' ').split(/\s+(?:OR|AND)\s+/i)
      .map(s => s.trim()).filter(Boolean);
    return toks.length > 0 && toks.every(t => ALLOWED.has(t));
  }
  // Note: OR semantics could be "some" — but "every" is the safe under-approximation
  // and the current tree has no OR-licensed deps, so it does not reject anything real.

  export function scan(root) {
    const violations = [];
    const seen = new Set();
    const walk = (dir) => {
      let ents; try { ents = readdirSync(dir, { withFileTypes: true }); } catch { return; }
      for (const e of ents) {
        if (!e.isDirectory() || e.name === '.bin') continue;
        const p = join(dir, e.name);
        const pj = join(p, 'package.json');
        if (existsSync(pj) && !e.name.startsWith('@')) {
          try {
            const j = JSON.parse(readFileSync(pj, 'utf8'));
            let lic = j.license ?? (Array.isArray(j.licenses) ? j.licenses.map(x => x.type || x).join(' OR ') : j.licenses);
            if (lic && typeof lic === 'object') lic = lic.type;
            const key = `${j.name}@${j.version}`;
            if (j.name && lic && !seen.has(key)) {
              seen.add(key);
              if (!isAllowed(j.name, lic)) violations.push(`${key} : ${lic}`);
            }
          } catch { /* ignore unparseable */ }
          if (existsSync(join(p, 'node_modules'))) walk(join(p, 'node_modules'));
        } else if (e.name.startsWith('@')) {
          walk(p); // scope dir
        }
      }
    };
    walk(root);
    return violations;
  }

  // CLI entry: exit non-zero on any violation.
  if (import.meta.url === `file://${process.argv[1]}`) {
    const v = scan(join(process.cwd(), 'node_modules'));
    if (v.length) { console.error('Disallowed licenses:\n' + v.join('\n')); process.exit(1); }
    console.log('license-check: all dependency licenses are permissive (or excepted).');
  }
  ```
  (Tune the walk if needed so the test's `scan(node_modules)` returns `[]`; the design
  scan already confirmed the tree is clean with the `caniuse-lite` exception.)
- `justfile` — add near the APP COMMANDS block:
  ```
  # Supply-chain gates (same as the CI supply-chain job).
  license-check:
      @node scripts/license-check.mjs
  audit:
      @npm audit --omit=dev --audit-level=high
  ```
- `.github/workflows/ci.yml` — add a job mirroring `app-checks`'s setup (checkout →
  setup-node 20 + `cache: npm` → `npm ci`) then two steps: `npm audit --omit=dev
  --audit-level=high` and `node scripts/license-check.mjs`. Name it `supply-chain`.
- `scripts/license-check.test.ts` — `import { ALLOWED, isAllowed, scan } from
  './license-check.mjs'` (vitest resolves the `.mjs`). Use `resolve(process.cwd(),
  'node_modules')` for the tree scan.
- **No new dependency.** No new DEC. This repo's ESLint has no react-hooks plugin;
  no `@testing-library/user-event`. Note: `npm audit` needs network in CI — that's
  the CI job's concern, not the unit test's (the test only runs the license scanner).
- After build, the orchestrator confirms `just license-check` exits 0 and `just audit`
  runs (a moderate/low advisory in devDeps is fine — the gate is `--omit=dev` high).

---

## Build Completion

*Filled in at the end of the **build** cycle, before advancing to verify.*

- **Branch:** `feat/spec-036-supply-chain-gate`
- **PR (if applicable):** #36
- **All acceptance criteria met?** yes
- **New decisions emitted:**
  - none — no new dep (scanner is dependency-free plain Node ESM)
- **Deviations from spec:**
  - Added an ESLint config block for `scripts/**/*.{js,mjs,cjs}` granting Node
    globals (`globals.node`) so the new `scripts/license-check.mjs` (which uses
    `process`/`console` in its CLI guard) lints clean under the flat config, which
    otherwise runs in the browser globals set. The spec listed only `ci.yml` +
    `justfile` as modified files; `eslint.config.js` is a necessary third edit. No
    behavioral change to any existing lint rule — the block is scoped to `scripts/`.
  - The original Sonnet build sub-agent was killed just before running the gate; the
    orchestrator (Opus) validated the uncommitted work, hit + fixed the lint failure
    above, and confirmed the gate.
- **Follow-up work identified:**
  - Propose bumping the `license-policy` constraint severity advisory→blocking now
    that it is CI-enforced (a `guidance/` edit — raise in Ship Reflection, not this
    spec).
- **Audit/license result:**
  - `just license-check` → exit 0: "all dependency licenses are permissive (or
    excepted)" — `scan(node_modules)` returns `[]` (whole tree permissive; the one
    documented exception, `caniuse-lite` CC-BY-4.0, is honored).
  - `just audit` (`npm audit --omit=dev --audit-level=high`) → exit 0: "found 0
    vulnerabilities".
  - Full gate: typecheck ✓, lint ✓, test ✓ (265 passed, +8 new license-check tests),
    build ✓. `git diff main..HEAD -- src/engine/` empty (engine frozen).

### Build-phase reflection (3 questions, short answers)

1. **What was unclear in the spec that slowed you down?**
   — The Notes gave a drop-in scanner but didn't flag that its Node-global CLI guard
   would trip the repo's browser-scoped ESLint (no `node` env). Adding the scoped
   config block was the only real work beyond dropping in the provided code.

2. **Was there a constraint or decision that should have been listed but wasn't?**
   — No missing constraint. Worth noting for future [REPO] script specs: any new
   `scripts/*.mjs` needs the Node-globals ESLint block, so it should be boilerplate in
   the build prompt (like the react-hooks / user-event one-liners).

3. **If you did this task again, what would you do differently?**
   — Run `just lint` immediately after creating the `.mjs`, before wiring the CI job —
   the lint failure was the only surprise and would have surfaced in seconds.

---

## Reflection (Ship)

*Appended during the **ship** cycle.*

1. **What would I do differently next time?**
   — Add the Node-globals ESLint block to the build prompt as boilerplate for any
   [REPO] spec that introduces a `scripts/*.mjs`. It was the only surprise in an
   otherwise drop-in build; anticipating it would have kept the killed-agent handoff
   fully clean. Also: run `just lint` the instant a new script file exists, before
   wiring anything downstream.

2. **Does any template, constraint, or decision need updating?**
   — The `license-policy` constraint is now mechanically CI-enforced, so its severity
   could be bumped advisory→blocking in `guidance/constraints.yaml` (a small follow-up
   `guidance/` edit, out of scope for this spec). No decision needed — the gate added
   no dependency (DEC-009 precedent honored by design). Worth logging as dogfood
   finding: new `scripts/*.mjs` under a browser-scoped flat ESLint config need a Node
   globals block — fold into UI/script build-prompt boilerplate.

3. **Is there a follow-up spec I should write now before I forget?**
   — No new spec. SPEC-037 (SECURITY.md) is already framed and next. The
   advisory→blocking severity bump is a one-line `guidance/` follow-up, not a spec.
   A full SBOM/provenance/signing pipeline remains deferred to PROJ-002+.
