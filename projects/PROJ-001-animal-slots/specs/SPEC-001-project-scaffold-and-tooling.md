---
# Maps to ContextCore task.* semantic conventions.
# This variant assumes Claude plays every role. The context normally
# in a separate handoff doc lives in the ## Implementation Context
# section below.

task:
  id: SPEC-001
  type: story                      # epic | story | task | bug | chore
  cycle: verify  # frame | design | build | verify | ship
  blocked: false
  priority: high
  complexity: M                    # S | M | L  (L means split it)

project:
  id: PROJ-001
  stage: STAGE-001
repo:
  id: animal-slots

agents:
  architect: claude-opus-4-8
  implementer: claude-opus-4-8     # usually same Claude, different session
  created_at: 2026-06-18

references:
  decisions:
    - DEC-001
    - DEC-004
  constraints:
    - engine-no-dom
    - test-before-implementation
    - no-new-top-level-deps-without-decision
    - license-policy
    - one-spec-per-pr
  related_specs: []

# One sentence on what this spec contributes to its stage's
# value_contribution.
value_link: "Infrastructure enabling STAGE-001's themed-cabinet shell: stands up the buildable app and the mechanically-enforced engine/presentation boundary every later spec depends on."

# Self-reported AI cost per cycle.
cost:
  sessions:
    - cycle: design
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      duration_minutes: 30
      recorded_at: 2026-06-18
      notes: "main-loop, not separately metered (AGENTS §4); design cycle"
    - cycle: build
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: 91115
      estimated_usd: 3.0
      duration_minutes: 22
      recorded_at: 2026-06-18
      notes: "metered build subagent (subagent_tokens=91115, ~1309s); estimated_usd is order-of-magnitude at an assumed ~$33/M Opus-class blended rate, no cache discount (AGENTS §4)"
    - cycle: verify
      agent: claude-sonnet-4-6
      interface: claude-code
      tokens_total: 72668
      estimated_usd: 0.48
      duration_minutes: 14
      recorded_at: 2026-06-18
      notes: "metered verify subagent (Sonnet, subagent_tokens=72668, ~854s); estimated_usd order-of-magnitude at an assumed ~$6.6/M Sonnet blended rate, no cache discount (AGENTS §4)"
  totals:
    tokens_total: 0
    estimated_usd: 0
    session_count: 0
---

# SPEC-001: Project scaffold and tooling

## Context

This is the first spec of STAGE-001 (Scaffold & design system) and the first
spec of PROJ-001. Nothing else can be built until the app boots and the
toolchain runs. Its job is to stand up a Vite + React + TypeScript app skeleton
that builds, type-checks, lints, and tests — and, critically, to put the
**engine/presentation boundary** in place as an enforced ESLint rule *before*
any engine code exists, so the project's central thesis (logic cleanly
separable from presentation) is structurally true from the first commit rather
than retrofitted later.

It deliberately ships no game logic and almost no UI — just enough of an app
shell to render and smoke-test. Design tokens, the four-region layout, and the
desktop device frame are later STAGE-001 specs.

See parent stage `STAGE-001-scaffold-and-design-system.md` and project
`brief.md`.

## Goal

Stand up a buildable, testable, lintable Vite + React 18 + TypeScript (strict)
skeleton — with the `engine-no-dom` import boundary enforced by ESLint and CI
running lint + typecheck + test — and nothing else.

## Inputs

- **Files to read:** `docs/architecture.md` — the authoritative module layout
  (`src/engine/**`, `src/ui/**`, `src/styles/**`) this scaffold must create.
- **Files to read:** `AGENTS.md` §5 (tech stack) and §6 (commands) — the exact
  stack and the npm scripts the `just` recipes already wrap.
- **Related code paths:** none yet — this is the first code in the repo.

## Outputs

- **Files created (config):** `package.json`, `package-lock.json`,
  `tsconfig.json`, `tsconfig.node.json`, `vite.config.ts` (with the Vitest
  `test` block: `jsdom` environment + setup file), `eslint.config.js` (flat
  config), `.prettierrc`, `.gitignore` (`node_modules/`, `dist/`), `index.html`,
  and a Vitest setup file (`src/test/setup.ts` registering
  `@testing-library/jest-dom`).
- **Files created (app skeleton):**
  - `src/main.tsx` — React mount.
  - `src/ui/App.tsx` — minimal app shell: renders a `<main>` landmark with an
    accessible name "Animal Slots" and nothing else of substance.
  - `src/engine/.gitkeep` — the engine dir exists but is empty (guarded by the
    boundary rule).
  - `src/styles/.gitkeep` — styles dir exists for SPEC-002's tokens.
- **Files created (tests):** `src/ui/App.test.tsx`,
  `src/test/engine-boundary.test.ts` (see Failing Tests).
- **Files modified:** `.github/workflows/ci.yml` — add an `app-checks` job that
  runs `npm ci`, `npm run lint`, `npm run typecheck`, `npm test`, and
  `npm run build` on every push/PR, alongside the existing `cost-data` job.
- **package.json scripts (exact names the `just` recipes wrap):** `dev`,
  `build`, `preview`, `test`, `lint`, `typecheck`.
- **New exports:** `App` (default export from `src/ui/App.tsx`).
- **Database changes:** none.

## Acceptance Criteria

Testable outcomes. The first two are covered by the Failing Tests; the rest are
command-level checks (run the command, assert exit 0 / expected output).

- [ ] `npm install` succeeds and `npm run dev` serves the app locally (manual).
- [ ] `npm run build` produces a `dist/` static bundle with exit 0.
- [ ] `npm run typecheck` (tsc `--noEmit`, strict) exits 0.
- [ ] `npm run lint` exits 0 on the committed code.
- [ ] `npm test` runs Vitest and both failing tests below pass.
- [ ] The `engine-no-dom` rule is real: ESLint reports an error for a
      `react` / `react-dom` import from a `src/engine/**` path, and reports
      none for an equivalent clean engine module (proven by the boundary test).
- [ ] `just dev`, `just test`, `just lint`, `just typecheck`, `just build`
      invoke the matching npm scripts (already wired in the justfile).
- [ ] CI runs lint + typecheck + test + build on every PR (the new `app-checks`
      job) without disturbing the `cost-data` job.
- [ ] The directory skeleton matches `docs/architecture.md`: `src/engine/`
      (empty, guarded), `src/ui/` (App + main), `src/styles/` (empty).

## Failing Tests

Written during **design**, BEFORE build. Build's job is to make these pass.

- **`src/ui/App.test.tsx`**
  - `"renders the app shell with an accessible 'Animal Slots' main landmark"` —
    renders `<App />` with React Testing Library; asserts
    `screen.getByRole('main', { name: /animal slots/i })` is in the document.
    Fails until `src/ui/App.tsx` exists and renders the landmark.

- **`src/test/engine-boundary.test.ts`**
  - `"engine-no-dom flags a React import from src/engine/**"` — uses the ESLint
    Node API (`new ESLint({ ... })` with the repo's flat config) to
    `lintText("import 'react'\n", { filePath: 'src/engine/sample.ts' })`;
    asserts the result contains at least one error whose `ruleId` is
    `no-restricted-imports`. Fails until the boundary rule is configured.
  - `"engine-no-dom allows a clean engine module"` — `lintText` of a
    react-free module at `src/engine/sample.ts` (e.g. `export const x = 1\n`)
    asserts zero errors. Guards against the rule being too broad.

> Honest note (dogfood signal, see the project's `risks_to_thesis`): scaffolding
> resists TDD. The two tests above are the genuinely test-worthy invariants
> (the shell renders; the boundary rule actually fires). The remaining
> acceptance criteria are command-level checks, not Vitest unit tests — don't
> manufacture unit tests for `tsc`/`vite` exit codes.

## Implementation Context

*Read this section (and the files it points to) before starting the build
cycle. It is the handoff, folded into the spec.*

### Decisions that apply

- `DEC-001` (engine/presentation separation) — the reason the ESLint
  `engine-no-dom` boundary is wired now, while `src/engine/**` is still empty.
  The whole point of this spec is to make the wall exist before the engine does.
- `DEC-004` (CSS animation, no canvas/WebGL, no animation library) — informs a
  *negative*: do not add an animation/game/UI-component library to the stack.
  The dependency set stays the AGENTS §5 baseline.

### Constraints that apply

- `engine-no-dom` — this spec *implements* its enforcement: ESLint
  `no-restricted-imports` (flat config, scoped to `src/engine/**`) forbidding
  `react`, `react-dom`, and DOM-ish imports. The boundary test proves it.
- `test-before-implementation` — the two Failing Tests are written here in
  design; build makes them pass.
- `no-new-top-level-deps-without-decision` — the baseline stack
  (`react`, `react-dom`, `vite`, `@vitejs/plugin-react`, `typescript`,
  `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`,
  `eslint` + `typescript-eslint`, `prettier`, `eslint-config-prettier`) is the
  deliberated stack from the repo design (AGENTS §5 / `brief.md`) and does **not**
  need a per-package DEC. Anything *beyond* that baseline does — emit
  `DEC-008` for it during build.
- `license-policy` (advisory) — keep deps permissive-licensed (MIT/Apache-2.0/
  BSD/ISC/Zlib). Optionally wire a `license-checker` step; not required to ship
  this spec.
- `one-spec-per-pr` — this scaffold is one PR.

### Prior related work

- None — first spec in the repo.

### Out of scope (for this spec specifically)

If any of these feels necessary during build, write it as its own spec
rather than expanding this one:

- Design tokens / `tokens.css` — **SPEC-002**.
- The four-region (Header/Game/Status/Action) layout — **SPEC-003**.
- The desktop device-frame wrapper — **SPEC-004**.
- Any engine code (RNG, reels, paylines, balance) — **STAGE-002**.
- Any game UI, animation, particles, or audio — later stages.
- Deployment (GitHub Pages / Vercel) — out of MVP scope unless trivial.

## Notes for the Implementer

- Prefer Vite's `react-ts` shape but keep `App.tsx` deliberately bare — a single
  `<main aria-label="Animal Slots">` (or a heading inside `<main>` that names
  it) is enough to satisfy the render test and give SPEC-003 something to fill.
- Use ESLint **flat config** (`eslint.config.js`); the boundary test loads it
  via the ESLint Node API, so the config must be loadable headless.
- Put the Vitest `test` block in `vite.config.ts` (`environment: 'jsdom'`,
  `setupFiles: ['src/test/setup.ts']`) to avoid a second config file.
- The `just` recipes already exist and wrap `npm run dev|build|lint|typecheck`
  and `npm test` — just make the npm scripts match those names.
- Don't touch the `cost-data` CI job; add a sibling job.

---

## Build Completion

*Filled in at the end of the **build** cycle, before advancing to verify.*

- **Branch:** `feat/spec-001-project-scaffold-and-tooling`
- **PR (if applicable):** #1 — https://github.com/jysf/zany-animal-slots/pull/1
- **All acceptance criteria met?** yes — both Vitest tests pass; `just typecheck`,
  `just lint`, `just test`, `just build` all exit 0; the `engine-no-dom` rule
  was confirmed to fire `no-restricted-imports` on a React import from
  `src/engine/**` and to stay silent on a clean engine module. (Node here is
  v22.17 rather than the targeted Node 20; build verified clean regardless. The
  `npm run dev` criterion is manual and was not exercised in this headless run.)
- **New decisions emitted:**
  - None. The dependency set is exactly the AGENTS §5 / spec baseline. The only
    additions are `@eslint/js` and `eslint-config-prettier`, which the spec's
    baseline already names (`eslint` + `typescript-eslint`, `prettier`,
    `eslint-config-prettier`); `@eslint/js` is ESLint's own packaged recommended
    config (a flat-config requisite of the baseline `eslint`), not a new
    capability — so no DEC-008 was required.
- **Deviations from spec:**
  - The repo already ships a root `.gitignore` containing `node_modules/` and
    `dist/`, so a new `.gitignore` was not created (requirement already met).
  - `tsconfig.node.json` uses `emitDeclarationOnly` + an `outDir` under
    `node_modules/.tmp` instead of `noEmit`, because a `composite` referenced
    project may not disable emit (TS6310). Purely a tsconfig-plumbing detail; the
    type-check is still `tsc --noEmit` at the root and exits 0.
  - `package.json`'s `build` script runs `tsc --noEmit && vite build` so the
    production build also type-checks (matches the Vite react-ts template shape).
- **Follow-up work identified:**
  - SPEC-002 (design tokens / `tokens.css`) — already in the STAGE-001 backlog.
  - Optional: wire a `license-checker` CI step to mechanize the advisory
    `license-policy` constraint (deferred — not required to ship this spec).

### Build-phase reflection (3 questions, short answers)

1. **What was unclear in the spec that slowed you down?**
   — Almost nothing. The Implementation Context was unusually complete: it named
   the exact baseline dependency set, the exact npm script names, the two tests
   verbatim, and the out-of-scope list. The only friction was a stack detail the
   spec couldn't have known — the `composite` tsconfig + `noEmit` conflict
   (TS6310) — which is a generic Vite-react-ts gotcha, not a spec gap.

2. **Was there a constraint or decision that should have been listed but wasn't?**
   — No. `engine-no-dom`, `test-before-implementation`,
   `no-new-top-level-deps-without-decision`, `license-policy`, and
   `one-spec-per-pr` were exactly the relevant set, and DEC-001/DEC-004 gave the
   right framing (DEC-004 usefully as a *negative*: add no animation/game/UI
   library). The boundary test's design (lint a `src/engine/**` path via the
   ESLint Node API) made the acceptance criterion mechanically checkable.

3. **If you did this task again, what would you do differently?**
   — Reach for `emitDeclarationOnly` on the `tsconfig.node.json` from the start
   instead of `noEmit`, to skip the one TS6310 round-trip. Otherwise the order
   (configs → skeleton → tests → install → verify) worked cleanly first try.

---

## Reflection (Ship)

*Appended during the **ship** cycle.*

1. **What would I do differently next time?**
   — <answer>

2. **Does any template, constraint, or decision need updating?**
   — <answer>

3. **Is there a follow-up spec I should write now before I forget?**
   — <answer>
