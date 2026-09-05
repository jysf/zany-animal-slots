# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Read this first

`AGENTS.md` is the source of truth for **process** — the work hierarchy
(Repo → Project → Stage → Spec → Cycle), cost-tracking rules, cycle-specific
rules, git/PR conventions, and session hygiene. Read it every session before
doing spec work. This file covers only the **app** orientation that would
otherwise take several files to reconstruct.

Other entry points: `/guidance/constraints.yaml` (rules that gate work),
`/decisions/` (DEC-* rationale, repo-level and binding across projects),
`/projects/<active>/brief.md` (what's being built now). `just status` prints
current state.

## Commands

App commands are npm scripts wrapped as `just` recipes — prefer the `just`
form. Both are listed in `AGENTS.md` §6; these are the ones worth knowing
beyond the obvious:

```bash
just test src/engine/spin.test.ts   # single test file (npm test -- <path>)
just test -t "jackpot"              # single test by name
just lint                           # ESLint, incl. the engine-no-dom boundary rule
just typecheck                      # tsc --noEmit (strict; noUnusedLocals/Parameters on)
just simulate                       # RTP / hit-frequency / tier distribution for all machines
just simulate arctic --spins 200000 --seed 24301   # tune one machine's math
just license-check && just audit    # the CI supply-chain gate, locally
just validate                       # spec front-matter schema gate
just cost-audit                     # shipped specs have real build/verify cost
```

CI (`.github/workflows/ci.yml`) runs three jobs: `app-checks`
(lint → typecheck → test → build), `supply-chain` (`npm audit` +
`scripts/license-check.mjs` permissive-only allow-list), and `cost-data`
(`scripts/cost-audit.sh`). `npm run build` typechecks before it builds.

## Architecture

Three layers, one hard wall:

```
src/engine/**    pure TypeScript — RNG, strips, spin, paylines, balance, tiers, metrics
src/machines/**  the six machines as pure CONFIG data (math slice + presentation slice)
src/ui/**        React 18 — owns all time, animation, audio, and persistence
```

**The wall (`engine-no-dom`, DEC-001).** `src/engine/**` imports no React and
touches no DOM. This is enforced mechanically by a `no-restricted-imports`
block in `eslint.config.js`, and that enforcement is itself tested —
`src/test/engine-boundary.test.ts` lints a synthetic engine module through the
ESLint Node API and asserts the rule fires. The UI imports the engine **only**
through `src/engine/index.ts`, never internals.

**The engine returns data; the UI owns time.** `spin()` resolves a whole play
instantly and returns a plain `SpinOutcome` (grid, lineWins, totalWin, new
balance, win tier — or `{ ok: false, reason: 'insufficient-balance' }`; it
never throws on an unaffordable bet). The UI then *plays that result back*
through its own state machine: idle → spinning → resolved → celebration → idle.
No animation or timing concept exists inside the engine.

**Determinism (DEC-002).** All engine randomness flows through the injected
seedable PRNG (`createRng(seed)`, mulberry32). No bare `Math.random()` in
`src/engine/**`. This is what makes a pinned seed assert a known grid and
payout, and what makes `just simulate` reproducible.

**A machine is data, not code (DEC-015).** Adding a machine or retuning math
means adding a config object under `src/machines/` and registering it in
`src/machines/registry.ts` — no engine or UI changes. Each `Machine` has a
`math` slice the engine consumes (symbols, weights, paytable, jackpot rule,
tier boundaries) and a `presentation` slice the engine never sees (emoji +
labels, CSS-custom-property theme tokens, Tone.js audio params). `spin()`
takes an optional `machine` argument defaulting to `WILD_AND_WHIMSICAL_MATH`.

Read `docs/architecture.md` for the full module layout and the Mermaid
component/state diagrams — but see "Stale docs" below.

## Conventions worth knowing

- **Contract tests** (`*.contract.test.ts`) are a real pattern here: they read
  a shipped artifact and assert it can't silently drift — `SECURITY.contract.test.ts`
  against `SECURITY.md`, `src/deploy/headers.contract.test.ts` against
  `public/_headers`, `src/machines/machine-parity.contract.test.ts` across all
  six machines. When you add a machine or change a policy file, expect one of
  these to be the thing that fails.
- **Persistence** is localStorage only, no backend, and keys are namespaced
  `zany:*` — except two legacy ones. Current keys: `zany-animal-slots.balance`,
  `mute`, `zany:active-machine`, `zany:stats`, `zany:help-seen`,
  `zany:ad-config`. Every reader is guarded and never throws; absent, corrupt,
  or wrong-version data falls back to an empty/default value. Trophies are
  *derived* from `zany:stats`, not stored separately.
- **Styling** is vanilla CSS with design tokens in `src/styles/tokens.css`;
  per-machine theming swaps a subset of those custom properties at runtime
  (`src/ui/theme/machineTheme.ts`). No CSS-in-JS, no UI component library.
- **Audio** is fully synthesized via Tone.js (DEC-007) — no audio asset files.
  It must not sound before a user gesture, and mute persists.
- Diagrams are Mermaid fenced blocks in markdown; update the diagram in the
  same change as the code it describes.

## Constraints that will actually stop you

From `/guidance/constraints.yaml` (blocking unless noted):

- `no-real-money` — play-money only, forever. No wagering, IAP, or payment
  integration. If a task seems to imply real money, stop and flag it.
- `engine-no-dom`, `deterministic-rng` — see Architecture above.
- `one-spec-per-pr` — a PR references exactly one SPEC; bundled changes are
  rejected.
- `test-before-implementation` — failing tests are written during **design**
  (in the spec's `## Failing Tests`), made to pass during **build**.
- `no-new-top-level-deps-without-decision` (warning) — a new runtime dependency
  needs a `DEC-*` first. There are only three: `react`, `react-dom`, `tone`.
- `portrait-first` (warning) — must render correctly 375–430px wide.
- `respect-reduced-motion`, `touch-targets-44`, `audio-gesture-and-mute`
  (warnings) — every animation needs a non-animated feedback path.

## Ground truth

`AGENTS.md`, `docs/architecture.md`, `docs/data-model.md`, and
`.repo-context.yaml` were reconciled with the code on 2026-09-04 (six machines,
20 paylines, Workers Static Assets, six localStorage keys, no active project).
They drifted badly across PROJ-002…006 before that, so if you find a doc that
disagrees with the code, **the code wins** — and fix the doc in the same change.

`DEC-*` records are the exception: they are immutable history, not current
state. DEC-003 correctly records the original five paylines even though DEC-016
later widened them to 20. Read a DEC for *why*, never for *what is true now*.
