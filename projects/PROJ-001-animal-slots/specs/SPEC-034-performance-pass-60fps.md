---
# Maps to ContextCore task.* semantic conventions.

task:
  id: SPEC-034
  type: story
  cycle: build
  blocked: false
  priority: high
  complexity: M

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
    - perf-60fps
    - respect-reduced-motion
    - test-before-implementation
    - one-spec-per-pr
  related_specs:
    - SPEC-016
    - SPEC-031

value_link: "Closes STAGE-005: validates and locks in the ~60fps target — a guard that every keyframe stays GPU-compositable (transform/opacity only), a will-change hint on the most frequent animation, and a documented measurement — confirming DEC-004's CSS approach holds."

cost:
  sessions:
    - cycle: design
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      duration_minutes: 30
      recorded_at: 2026-06-28
      notes: "main-loop, not separately metered (AGENTS §4); design cycle (incl. the compositor-property survey)"
  totals:
    tokens_total: 0
    estimated_usd: 0
    session_count: 0
---

# SPEC-034: Performance pass (~60fps)

## Context

The final STAGE-005 spec: the performance pass. The design survey measured what
every animation actually animates — and **every `@keyframes` across the whole UI
(reels, win-badge, particles, jackpot, paytable) animates only `transform` and
`opacity`** — the two GPU-composited properties that don't trigger layout or paint.
So DEC-004's bet (CSS transforms hold 60fps) is already true *by construction*; the
heaviest moment (jackpot scene + a 32-particle burst + audio) composites on the GPU
without main-thread layout.

Rather than chase a number that's already met, this spec **locks it in**: (1) a
**compositor-only keyframe guard** — a sweep test that fails if any future
`@keyframes` animates a layout/paint-triggering property (width/height/top/left/
margin/…); (2) a single targeted **`will-change: transform`** hint on `.reel--spinning`
(the most frequent animation, every spin); and (3) a documented **measurement**
(`docs/perf-notes.md`) — methodology, the static guarantee, an in-preview frame
sample, and the honest caveat that the true mid-tier-phone confirmation is a manual
DevTools-CPU-throttle/device check (the automated guard is the property sweep). The
conclusion: DEC-004 holds; no revisit.

See `STAGE-005-…md`, `perf-60fps` (the constraint/target), `DEC-004` (CSS animation),
SPEC-016 (the spin animation), SPEC-031 (the sibling sweep-guard approach).

## Goal

Add `src/ui/perf.contract.test.ts` (every `@keyframes` block animates only
`transform`/`opacity` — GPU-compositable); add `will-change: transform` to
`.reel--spinning` in `reels.css`; write `docs/perf-notes.md` (methodology, static
guarantee, measurement, DEC-004 validation). No behavior change.

## Inputs

- **Files to read:** every animation CSS (`src/ui/reels/reels.css`, `win-badge.css`,
  `particles.css`, `src/ui/jackpot.css`, `src/ui/paytable.css`),
  `src/ui/reduced-motion.contract.test.tsx` (the sweep pattern to mirror),
  `decisions/DEC-004`, `guidance/constraints.yaml` (`perf-60fps`), `docs/` (where
  perf-notes.md goes).
- **Related code paths:** `src/ui/`, `docs/`.

## Outputs

- **Files created:**
  - `src/ui/perf.contract.test.ts` — the compositor-only keyframe guard.
  - `docs/perf-notes.md` — the documented perf pass.
- **Files modified:**
  - `src/ui/reels/reels.css` — `will-change: transform;` on `.reel--spinning`.
- **New exports:** none.
- **Database changes:** none.

## Acceptance Criteria

- [ ] `perf.contract.test.ts` discovers every `src/**/*.css`, and for each
      `@keyframes` block asserts the **only** animated properties are in the allowed
      compositor set (`transform`, `opacity`; `filter` tolerated) — i.e. no
      `width/height/top/left/right/bottom/margin/padding/inset/font-size` etc. inside
      any keyframe step. Assert ≥5 keyframe-bearing files were checked.
- [ ] The guard is **load-bearing**: a clearly layout-triggering property inside a
      keyframe (e.g. `height`) would make it fail (prove via a unit on a small inline
      sample string, so we don't have to add bad CSS).
- [ ] `.reel--spinning` declares `will-change: transform;` (a compositor hint for the
      most frequent animation); `reels.css` still has no raw hex.
- [ ] `docs/perf-notes.md` documents: the methodology, the compositor-only static
      guarantee + the guard test, an in-preview frame-interval sample, the honest
      mid-tier-device caveat, and the conclusion that DEC-004 holds (no revisit).
- [ ] Engine unchanged; no new dependency; reduced-motion paths unaffected; gate
      exits 0.

## Failing Tests

Written during **design**, BEFORE build.

- **`src/ui/perf.contract.test.ts`**
  - `"every keyframe animates only compositor-friendly properties"` — gather all
    `src/**/*.css` (`import.meta.glob('/src/**/*.css', { query: '?raw', eager: true })`
    or a Node `fs` walk); for each file, extract each `@keyframes name { … }` block,
    and within it collect the property names that appear inside the percentage steps
    (`/([a-z-]+)\s*:/`), filtered to declared properties (not the `0%`/`from` keys).
    Assert every such property is in `ALLOWED = new Set(['transform','opacity','filter'])`.
    Track and assert `>= 5` keyframe files were checked.
  - `"the guard is load-bearing"` — run the same extraction over an inline string
    `'@keyframes bad { from { height: 0 } to { height: 100px } }'` and assert it would
    FAIL (i.e. detects `height` as not-allowed) — proving the check isn't vacuous.
  - `"the spin animation has a compositor hint"` — `reels.css` (read via fs) contains
    `.reel--spinning` with a `will-change` declaration including `transform`.

## Implementation Context

### Decisions that apply

- `DEC-004` — CSS transforms/keyframes for animation; this spec **validates** it (the
  compositor-only guard is the mechanical proof) and adds a `will-change` hint, not a
  change of approach. Revisit DEC-004 only if a measured target failed — it didn't.
- `DEC-010` — `reels.css` stays token-only / no raw hex; `will-change` is colorless.
- `DEC-001` — pure UI; engine untouched.

### Constraints that apply

- `perf-60fps` — this spec is its measurement + structural enforcement.
- `respect-reduced-motion` — unaffected; the guard sweeps keyframes, the global
  reduced-motion net (SPEC-031) still neutralizes them for reduced-motion users.
- `test-before-implementation`, `one-spec-per-pr`.

### Prior related work

- `SPEC-016` (shipped) — `.reel--spinning` (the spin keyframes the hint targets).
- `SPEC-024` (shipped) — particles already declare `will-change: transform, opacity`.
- `SPEC-031` (shipped) — the reduced-motion sweep; mirror its glob/fs sweep + ≥5
  assertion + load-bearing proof shape.

### Out of scope (for this spec specifically)

- Re-architecting any animation (none needs it). Adding `will-change` broadly
  (overuse hurts — only the per-spin reel hint is justified here; particles already
  have theirs). A real-device benchmark harness (the manual DevTools/device check is
  documented, not automated). Bundle-size optimization of `tone` (noted as a
  STAGE-006/future concern).

## Notes for the Implementer

- `perf.contract.test.ts` — reuse the SPEC-031 discovery approach (glob `?raw` or fs
  walk). For each file, match `@keyframes\s+[\w-]+\s*\{ … \}` (balance braces or use a
  permissive `[^]*?\n\}` up to the closing brace at column 0). Inside a block, the
  *declarations* are the `prop: value;` pairs inside the `0% { … }` steps — collect
  property names with `/([a-z-]+)\s*:/g` but EXCLUDE the step selectors. Simplest
  robust approach: within each keyframe block, find every `{ … }` step body and scan
  those for `([a-z-]+)\s*:`. Assert each ∈ `{transform, opacity, filter}`.
  ```ts
  const ALLOWED = new Set(['transform', 'opacity', 'filter']);
  // for each keyframes block body, for each "prop:" inside step braces:
  //   expect(ALLOWED.has(prop)).toBe(true)  // include the file+prop in the message
  ```
- `reels.css` — add `will-change: transform;` to the `.reel--spinning` rule (next to
  its `animation:` declaration). Leave the reduced-motion `@media` block as-is
  (`will-change` on a non-animating element is harmless; optional: also set
  `will-change: auto` under reduced motion — not required).
- `docs/perf-notes.md` — short and honest. Suggested sections:
  - **Target:** ~60fps spin + celebration on a mid-tier phone (`perf-60fps`).
  - **Approach (DEC-004):** CSS transforms/keyframes; every keyframe animates only
    `transform`/`opacity` (GPU-composited) — enforced by `perf.contract.test.ts`.
  - **Static guarantee:** the compositor-only sweep (list the 5 files); particles +
    `.reel--spinning` carry `will-change`.
  - **In-preview measurement:** rAF frame-interval sampling during a spin + a win
    celebration (the orchestrator records the numbers — e.g. "median frame ≈ 16–17ms,
    no long frames > 50ms on the dev profile").
  - **Caveat:** the automated sample runs on the dev machine; a true mid-tier-phone
    pass needs DevTools CPU 4–6× throttle or a real device — the durable guarantee is
    the property guard + DEC-004.
  - **Conclusion:** target met; DEC-004 holds; no revisit.
  (Leave a clearly marked placeholder for the measured numbers; the orchestrator fills
  it from the preview at verify/ship.)
- No new dependency. No new DEC (this validates DEC-004). This repo's ESLint has **no
  react-hooks plugin** and **no `@testing-library/user-event`**.

---

## Build Completion

*Filled in at the end of the **build** cycle, before advancing to verify.*

- **Branch:**
- **PR (if applicable):**
- **All acceptance criteria met?** yes/no
- **New decisions emitted:**
  - none expected — validates DEC-004
- **Deviations from spec:**
  - [list]
- **Follow-up work identified:**
  - [any new specs for the stage's backlog]
- **Perf result:**
  - [which keyframe files swept; confirm all compositor-only; will-change added]

### Build-phase reflection (3 questions, short answers)

1. **What was unclear in the spec that slowed you down?**
   — <answer>

2. **Was there a constraint or decision that should have been listed but wasn't?**
   — <answer>

3. **If you did this task again, what would you do differently?**
   — <answer>

---

## Reflection (Ship)

*Appended during the **ship** cycle.*

1. **What would I do differently next time?**
   — <answer>

2. **Does any template, constraint, or decision need updating?**
   — <answer>

3. **Is there a follow-up spec I should write now before I forget?**
   — <answer>
