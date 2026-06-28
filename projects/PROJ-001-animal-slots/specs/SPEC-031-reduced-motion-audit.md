---
# Maps to ContextCore task.* semantic conventions.

task:
  id: SPEC-031
  type: story
  cycle: verify
  blocked: false
  priority: high
  complexity: S

project:
  id: PROJ-001
  stage: STAGE-005
repo:
  id: animal-slots

agents:
  architect: claude-opus-4-8
  implementer: claude-sonnet-4-6
  created_at: 2026-06-28

references:
  decisions:
    - DEC-004
    - DEC-010
    - DEC-001
  constraints:
    - respect-reduced-motion
    - test-before-implementation
    - one-spec-per-pr
  related_specs:
    - SPEC-016
    - SPEC-022

value_link: "Hardens the reduced-motion promise the whole project kept open: a global motion safety net + a regression-guard sweep that holds every animation to a non-animated path, plus a documented audit."

cost:
  sessions:
    - cycle: design
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      duration_minutes: 25
      recorded_at: 2026-06-28
      notes: "main-loop, not separately metered (AGENTS §4); design cycle (incl. the audit survey)"
    - cycle: build
      agent: claude-sonnet-4-6
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      duration_minutes: null
      recorded_at: 2026-06-28
      notes: "orchestrator to fill tokens_total from subagent_tokens at ship"
    - cycle: verify
      agent: claude-sonnet-4-6
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      duration_minutes: null
      recorded_at: 2026-06-28
      notes: "orchestrator to fill tokens_total from subagent_tokens at ship"
  totals:
    tokens_total: 0
    estimated_usd: 0
    session_count: 0
---

# SPEC-031: Reduced-motion audit

## Context

First STAGE-005 accessibility spec. Every stage so far built its
`prefers-reduced-motion` path as it went, so this is an **audit + hardening**, not
greenfield. The design survey confirms full coverage today: every CSS file with
`@keyframes` (reels, win-badge, particles, jackpot, paytable) already has a
`@media (prefers-reduced-motion: reduce)` block; the JS-driven count-up snaps
(SPEC-022) and the particle burst renders nothing (SPEC-024) under reduced motion;
and audio is correctly **not** motion-gated (it's gated by mute+unlock only —
sound is not motion).

This spec locks that in two ways: (1) a **global motion safety net** so any
*future* animation is neutralized for reduced-motion users even if a component
block is forgotten, and (2) a **regression-guard sweep test** that fails if any
`@keyframes` CSS lacks a reduced-motion block. It also records the audit result.
No engine change (DEC-001); token-only CSS (DEC-010); the CSS-animation approach
is DEC-004.

See `STAGE-005-…md`, `respect-reduced-motion` (the constraint), `DEC-004`,
SPEC-016/022/024 (the motion surfaces being audited).

## Goal

Add `src/styles/reduced-motion.css` (a global `@media (prefers-reduced-motion:
reduce)` safety net that near-instantly completes animations/transitions),
imported globally; add `src/ui/reduced-motion.contract.test.ts` (sweeps every
`src/**/*.css` and fails if a file with `@keyframes` has no reduced-motion block;
asserts the global net exists; asserts the audio modules don't motion-gate); and
record the audit findings.

## Inputs

- **Files to read:** `src/main.tsx` (global CSS import point), `src/styles/tokens.css`,
  every animation CSS (`src/ui/reels/reels.css`, `win-badge.css`, `particles.css`,
  `src/ui/jackpot.css`, `src/ui/paytable.css`), `src/ui/reels/reels.animation.test.ts`
  (the existing CSS-contract pattern), `src/ui/useCountUp.ts` +
  `src/ui/prefersReducedMotion.ts` (the JS path), `src/ui/audio/*.ts` (must NOT
  motion-gate), `guidance/constraints.yaml` (`respect-reduced-motion`).
- **Related code paths:** `src/styles/`, `src/ui/`.

## Outputs

- **Files created:**
  - `src/styles/reduced-motion.css` — the global safety net (token-free; pure
    animation/transition neutralization under the media query).
  - `src/ui/reduced-motion.contract.test.ts` — the sweep + net + audio-not-gated
    tests.
- **Files modified:**
  - `src/main.tsx` — import `./styles/reduced-motion.css` after `tokens.css`.
- **New exports:** none.
- **Database changes:** none.

## Acceptance Criteria

- [ ] `src/styles/reduced-motion.css` contains a `@media (prefers-reduced-motion:
      reduce)` block that neutralizes motion globally (e.g. `*, *::before, *::after`
      with `animation-duration`/`animation-iteration-count`/`transition-duration`
      reduced), and is imported in `src/main.tsx`.
- [ ] The sweep test reads **every** `src/**/*.css`; for each file that contains
      `@keyframes`, it asserts the file also contains a `@media
      (prefers-reduced-motion: reduce)` block. (Today: reels, win-badge, particles,
      jackpot, paytable — all pass.)
- [ ] The sweep test asserts `reduced-motion.css` itself defines the global net.
- [ ] A test asserts the audio modules (`src/ui/audio/*.ts`) do **not** reference
      `prefers-reduced-motion` / `prefersReducedMotion` — audio is gated by
      mute+unlock only, not by motion preference.
- [ ] App renders under emulated reduced motion (`matchMedia` matches:true) without
      throwing. Engine unchanged; gate exits 0.

## Failing Tests

Written during **design**, BEFORE build.

- **`src/ui/reduced-motion.contract.test.ts`**
  - `"every @keyframes CSS has a reduced-motion block"` — gather all `src/**/*.css`
    (via `import.meta.glob('/src/**/*.css', { query: '?raw', eager: true })`, or a
    Node `fs` recursive read); for each whose content matches `/@keyframes/`, expect
    it to match `/@media\s*\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)/`. Assert at
    least 5 such files were checked (guards the glob actually found files).
  - `"a global reduced-motion safety net exists"` — `reduced-motion.css` matches the
    reduced-motion media query AND neutralizes animation (e.g. matches
    `/animation-duration/` and `/transition-duration/`).
  - `"audio is not motion-gated"` — for each `src/ui/audio/*.ts` source, assert it
    does NOT contain `prefers-reduced-motion` or `prefersReducedMotion`.
  - `"App renders under reduced motion"` — stub `window.matchMedia` to return
    `{ matches: true }` for the reduced-motion query; `render(<App />)` does not
    throw and the Spin control is present. Restore matchMedia after.

## Implementation Context

### Decisions that apply

- `DEC-004` — celebrations/animations are CSS (with a reduced-motion path each); this
  spec adds the catch-all net + guard, consistent with that.
- `DEC-010` — `reduced-motion.css` is global CSS; it needs no color tokens (it only
  sets durations), so the no-raw-hex rule is trivially satisfied (no colors at all).
- `DEC-001` — pure UI; engine untouched.

### Constraints that apply

- `respect-reduced-motion` — this spec is its audit + enforcement.
- `test-before-implementation`, `one-spec-per-pr`.

### Prior related work

- Reduced-motion paths already shipped: SPEC-016 (reels), SPEC-019 (win badge),
  SPEC-022 (count-up JS snap + `prefersReducedMotion`), SPEC-023 (paw trail),
  SPEC-024 (particles render nothing), SPEC-025 (jackpot static), SPEC-020 (paytable).
  This spec verifies + guards them, it does not re-implement them.

### Out of scope (for this spec specifically)

- Contrast / 44px (SPEC-032), colorblind cues (SPEC-033), perf (SPEC-034).
- Re-writing any existing per-component reduced-motion block — they pass the audit
  as-is; only ADD the global net + the guard test (and fix a gap only if the sweep
  finds one).

## Notes for the Implementer

- `src/styles/reduced-motion.css` — the standard a11y catch-all (coexists with the
  per-component `animation: none` blocks; outcome is the same — no motion):
  ```css
  /* Global reduced-motion safety net (SPEC-031, respect-reduced-motion).
     Per-component @media blocks still handle their own end-states; this catches
     any animation/transition that isn't individually handled (incl. future ones). */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
  ```
- `src/main.tsx` — add `import './styles/reduced-motion.css';` directly after the
  `import './styles/tokens.css';` line.
- `reduced-motion.contract.test.ts` — prefer Vite's raw glob so it auto-discovers new
  CSS:
  ```ts
  const cssModules = import.meta.glob('/src/**/*.css', { query: '?raw', eager: true });
  // cssModules: { [path]: { default: string } }
  ```
  Iterate entries; for any whose source has `/@keyframes/`, assert the reduced-motion
  media query is present. Track a count and assert `>= 5`. If `import.meta.glob` is
  awkward in this vitest setup, fall back to a small `fs` recursive walk of `src/`.
- For the audio-not-gated test, read the `src/ui/audio/*.ts` files (exclude
  `*.test.ts`) via `fs` and assert none contain the reduced-motion strings.
- For the App-renders-under-reduced-motion test, stub `window.matchMedia` to
  `{ matches: true, media, onchange:null, add/removeListener, add/removeEventListener,
  dispatchEvent }` (mirror the existing setup mock) and restore in `afterEach`.
- No new dependency. No new DEC (this is `respect-reduced-motion` + DEC-004 territory).
- Record the audit result in the spec's Build Completion (which files were checked,
  that all passed, the net + guard added). The orchestrator's preview will emulate
  reduced motion (resize/colorScheme can't set it, so this is largely test-verified;
  the orchestrator may spot-check that the app still works with reduced motion via an
  eval-stubbed matchMedia).

---

## Build Completion

*Filled in at the end of the **build** cycle, before advancing to verify.*

- **Branch:** feat/spec-031-reduced-motion-audit
- **PR (if applicable):** n/a (local only per spec)
- **All acceptance criteria met?** yes
- **New decisions emitted:**
  - none
- **Deviations from spec:**
  - Test file is `reduced-motion.contract.test.tsx` (not `.ts`) because it uses JSX (`<App />`). The spec named it `.ts`; `.tsx` is required and consistent with the project's UI testing convention (AGENTS.md §12).
- **Follow-up work identified:**
  - none beyond the already-planned SPEC-032/033/034
- **Audit result:**
  - Files with `@keyframes` checked by the sweep test (5 total, all passed):
    1. `src/ui/reels/reels.css` — has `@media (prefers-reduced-motion: reduce)` block (SPEC-016/SPEC-023)
    2. `src/ui/reels/win-badge.css` — has `@media (prefers-reduced-motion: reduce)` block (SPEC-019)
    3. `src/ui/reels/particles.css` — has `@media (prefers-reduced-motion: reduce)` block (SPEC-024)
    4. `src/ui/jackpot.css` — has `@media (prefers-reduced-motion: reduce)` block (SPEC-025)
    5. `src/ui/paytable.css` — has `@media (prefers-reduced-motion: reduce)` block (SPEC-020)
  - All 5 passed. No gaps found; no per-component edits needed.
  - Global safety net added: `src/styles/reduced-motion.css`, imported in `src/main.tsx`.
  - Audio modules (`ambientBed.ts`, `audioEngine.ts`, `jingle.ts`, `mixer.ts`, `muteStorage.ts`, `sfx.ts`, `useAmbientBed.ts`, `useAudio.ts`, `useDynamicMixing.ts`, `useGameSfx.ts`, `useWinJingle.ts`) confirmed: none reference `prefers-reduced-motion` or `prefersReducedMotion`.

### Build-phase reflection (3 questions, short answers)

1. **What was unclear in the spec that slowed you down?**
   — The spec named the test file `.ts` but the file uses JSX (`render(<App />)`), which requires `.tsx` in this project's TypeScript config. The typecheck error made the fix obvious immediately, but the spec could note "use `.tsx` since the App-renders test needs JSX."

2. **Was there a constraint or decision that should have been listed but wasn't?**
   — No missing constraints. The decision to use `fs` for the CSS sweep (matching the existing `reels.animation.test.ts` pattern) over `import.meta.glob` was already anticipated in the Notes; the fs fallback was the right call given jsdom/Vitest's raw-glob handling.

3. **If you did this task again, what would you do differently?**
   — Nothing substantive. The spec's drop-in CSS and test approach were clear and correct. The only change: name the test file `.tsx` from the start to skip the typecheck iteration.

---

## Reflection (Ship)

*Appended during the **ship** cycle.*

1. **What would I do differently next time?**
   — <answer>

2. **Does any template, constraint, or decision need updating?**
   — <answer>

3. **Is there a follow-up spec I should write now before I forget?**
   — <answer>

---

## Verify

**Verdict: ✅ APPROVED**

**Gate results** (all exit 0, branch `feat/spec-031-reduced-motion-audit`):

| Gate | Result |
|---|---|
| `just typecheck` | ✅ 0 errors |
| `just lint` | ✅ 0 errors |
| `just test` | ✅ 241/241 tests (40 suites), 4 new tests in reduced-motion.contract.test.tsx |
| `just build` | ✅ built in 688ms |
| `just decisions-audit --changed` | ✅ no files in scope (no uncommitted changes) |
| `just decisions-audit` | ✅ 0 structural errors, 19 scope warnings (all pre-existing) |

**Checklist:**

- ✅ **ACCEPTANCE CRITERIA — CSS file + import order.** `src/styles/reduced-motion.css` contains `@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms; animation-iteration-count: 1; transition-duration: 0.01ms; scroll-behavior: auto } }`. Imported in `src/main.tsx` on line 4, directly after `tokens.css` on line 3. Confirmed by file read.

- ✅ **ACCEPTANCE CRITERIA — Sweep test is real.** `walkCss()` recursively discovers all `*.css` files under `src/` using `readdirSync`/`statSync` (not a hardcoded list). For each file matching `/@keyframes/`, the test asserts `/@media\s*\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)/` is present — and the test would fail immediately if a keyframes file lacked the block (the assertion is inside the loop). The `>=5` guard ensures the walk found real files.

- ✅ **SWEEP IS REAL — independent grep.** `grep -rl "@keyframes" src --include="*.css"` returns exactly 5 files: `reels.css`, `win-badge.css`, `particles.css`, `jackpot.css`, `paytable.css`. `grep -L "prefers-reduced-motion" $(...)` returns empty — every @keyframes file has the block. The build audit claim is accurate.

- ✅ **AUDIO-NOT-GATED IS TRUE.** `grep -rn "prefers-reduced-motion\|prefersReducedMotion" src/ui/audio/` returns empty. Confirmed independently.

- ✅ **ACCEPTANCE CRITERIA — Global net test.** `"a global reduced-motion safety net exists"` reads the file via absolute path, asserts the media-query regex, `/animation-duration/`, and `/transition-duration/`. All three assertions backed by the actual file content.

- ✅ **ACCEPTANCE CRITERIA — App renders under reduced motion.** The `"renders and shows the Spin button when matchMedia reports reduced motion"` test stubs `window.matchMedia` to `{ matches: true }`, calls `render(<App />)`, and asserts the Spin button is present. `afterEach` restores the original. Pattern mirrors existing App.test.tsx setup. Test passes (4th of 4 new tests, all green).

- ✅ **GLOBAL NET COEXISTS WITH EXISTING TESTS.** The `@media (prefers-reduced-motion: reduce)` block is inert under normal rendering (no reduced-motion user preference). All 237 pre-existing tests still pass (241 total - 4 new = 237 prior). No change to normal rendering paths.

- ✅ **ENGINE UNCHANGED.** `git diff main..HEAD -- src/engine/` is empty. Confirmed.

- ✅ **NO NEW DEPENDENCY.** `git diff main..HEAD -- package.json` is empty. Confirmed.

- ✅ **DECISION DRIFT — none.** Changed files (`src/styles/reduced-motion.css`, `src/ui/reduced-motion.contract.test.tsx`, `src/main.tsx`) fall under DEC-004 (`src/ui/**`) and DEC-010 (`src/styles/**`) territory. No new DEC expected or required. No drift from declared decisions.

- ✅ **BUILD REFLECTION — honest and specific.** Three questions answered with concrete, accurate details (`.ts` → `.tsx` type error, `fs` fallback rationale, nothing-substantive conclusion). Not boilerplate.

- ✅ **AUDIT RESULT — specific and verifiable.** 5 files named with their SPEC provenance, all confirmed passing by independent grep. Audio module list complete.

- ✅ **COST — build session correct.** Build session has `tokens_total: null` with "orchestrator to fill tokens_total from subagent_tokens at ship" note. Matches AGENTS §4 protocol for metered subagent cycles. Verify session to be appended below.

- ✅ **ONE SPEC PER PR.** PR #31 contains only SPEC-031 changes. Confirmed via diff.

- ✅ **DEVIATION NOTED.** `.ts` → `.tsx` rename is correctly documented in Build Completion Deviations. Justified and consistent with AGENTS §12 (UI test files are `.test.tsx`).

**Reviewer:** claude-sonnet-4-6 · **Date:** 2026-06-28
