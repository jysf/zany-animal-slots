---
# Maps to ContextCore task.* semantic conventions.

task:
  id: SPEC-034
  type: story
  cycle: ship
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
    - cycle: build
      agent: claude-sonnet-4-6
      interface: claude-code
      tokens_total: 65661
      estimated_usd: 0.43
      duration_minutes: 4.2
      recorded_at: 2026-06-28
      notes: "Sonnet sub-agent build (Agent subagent_tokens=65661, 254s). estimated_usd ~= tokens x $6.6/M Sonnet blended, no cache discount (order-of-magnitude, AGENTS §4)."
    - cycle: verify
      agent: claude-sonnet-4-6
      interface: claude-code
      tokens_total: 79326
      estimated_usd: 0.52
      duration_minutes: 4.2
      recorded_at: 2026-06-28
      notes: "Sonnet sub-agent verify (Agent subagent_tokens=79326, 253s). estimated_usd ~= tokens x $6.6/M Sonnet blended, no cache discount (order-of-magnitude, AGENTS §4)."
    - cycle: ship
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      duration_minutes: 8
      recorded_at: 2026-06-28
      notes: "main-loop, not separately metered (AGENTS §4); ship cycle (orchestrator squash-merge + bookkeeping; incl. the preview rAF frame-interval measurement)"
  totals:
    tokens_total: 144987
    estimated_usd: 0.95
    session_count: 5
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

- **Branch:** feat/spec-034-perf-pass
- **PR (if applicable):** local only — no push per spec instructions
- **All acceptance criteria met?** yes
- **New decisions emitted:**
  - none — this spec validates DEC-004, no new decision warranted
- **Deviations from spec:**
  - none
- **Follow-up work identified:**
  - none — the in-preview measurement numbers in perf-notes.md are a placeholder for the orchestrator to fill at verify/ship via DevTools rAF sampling
- **Perf result:**
  - Keyframe files swept (all compositor-only, confirmed by `perf.contract.test.ts`):
    1. `src/ui/reels/reels.css` — `reel-spin`, `reel-stop-bounce`, `paw-trail-pop` (transform + opacity only)
    2. `src/ui/reels/win-badge.css` — `win-badge-pop-in` (transform + opacity only)
    3. `src/ui/reels/particles.css` — `particle-fly` (transform + opacity only)
    4. `src/ui/jackpot.css` — `jackpot-sky-in`, `jackpot-moon-rise`, `jackpot-wolf-howl`, `jackpot-banner-in` (transform + opacity only)
    5. `src/ui/paytable.css` — `paytable-slide-up` (transform only)
  - `will-change: transform` added to `.reel--spinning` in `reels.css` (particles already carried `will-change: transform, opacity` from SPEC-024)
  - All 3 perf contract tests pass; all 252 tests pass; gate exits 0.

### Build-phase reflection (3 questions, short answers)

1. **What was unclear in the spec that slowed you down?**
   — Nothing slowed me down; the spec was unusually clear. The one micro-ambiguity was whether the `@keyframes` brace-counting in the extractor needed to handle nested braces — it does (step bodies are one level of nesting inside the outer block). The spec mentioned "balance braces" as an option, which pointed me in the right direction immediately.

2. **Was there a constraint or decision that should have been listed but wasn't?**
   — No missing constraint. All relevant ones (DEC-004, DEC-010, DEC-001, perf-60fps, respect-reduced-motion) were listed and applied. The note that `will-change: auto` under reduced motion is optional but not required was helpful — I left it out as the spec suggested.

3. **If you did this task again, what would you do differently?**
   — Nothing structural. The spec's suggestion to mirror the `reduced-motion.contract.test.tsx` pattern (Node fs walk + ≥5 assertion + load-bearing proof) mapped directly to a clean test. If anything, I'd pre-read the existing test more carefully before writing to avoid any duplication — though in this case the new test is complementary, not overlapping.

---

## Reflection (Ship)

*Appended during the **ship** cycle.*

1. **What would I do differently next time?**
   — Nothing material. Closing the perf pass as a *structural guarantee* (the
   compositor-only sweep) rather than a one-time benchmark is the durable win — the
   ~60fps target now can't silently regress because a future keyframe is mechanically
   forbidden from animating a layout property. The preview rAF sample (median 8.3ms, 0
   long frames) confirmed the dev profile, and the doc is honest that a throttled-device
   pass is the manual confirmation. DEC-004 is validated, not revisited.

2. **Does any template, constraint, or decision need updating?**
   — No. DEC-004 holds. STAGE-005 leaves three new test-enforced invariants worth a
   weekly-review mention (they could become explicit constraints, but the guard tests
   already enforce them): reduced-motion coverage (SPEC-031), WCAG-AA contrast
   (SPEC-032), and compositor-only animation (this spec). The one carry-forward note:
   `tone` roughly doubled the bundle (~407KB JS) — a STAGE-006/PROJ-002 bundle-size
   concern, not a frame-rate one.

3. **Is there a follow-up spec I should write now before I forget?**
   — No new spec. This completes STAGE-005's 7-item backlog (audio suite +
   reduced-motion + contrast/44px + colorblind + perf). Next is the **STAGE-005 Stage
   Ship** (Prompt 1d, offered not auto-run), then STAGE-006 (release & deploy) is the
   last stage of PROJ-001.

---

## Verify

**Verdict: ✅ APPROVED**

**Gate results (all exit 0):**
- `just typecheck` — PASSED (tsc --noEmit, 0 errors)
- `just lint` — PASSED (eslint, 0 errors)
- `just test` — PASSED (43 test files, 252 tests, 0 failures; 3 new perf contract tests in `src/ui/perf.contract.test.ts`)
- `just build` — PASSED (vite build 689ms, 1038 modules transformed, 0 errors)

**Decisions audit:** `just decisions-audit --changed main` identified DEC-004, DEC-006, DEC-010 governing changed files — all consistent with this spec's intent. DEC-006 (emoji symbols) is an advisory overlap for `reels.css`; it is not in conflict. Zero structural errors. No new DEC emitted (correct — spec validates DEC-004, not creates a new one). Pre-existing 19 scope-overlap warnings across the repo are unchanged.

**Independent grep result:** `grep -rl "@keyframes" src --include="*.css"` returned exactly 5 files:
1. `src/ui/reels/reels.css`
2. `src/ui/reels/win-badge.css`
3. `src/ui/reels/particles.css`
4. `src/ui/jackpot.css`
5. `src/ui/paytable.css`

This matches the spec's claimed sweep exactly.

**Checklist:**

- ✅ **ACCEPTANCE CRITERIA — compositor sweep** — `perf.contract.test.ts` walks all `src/**/*.css` files, for each `@keyframes` block uses brace-counting to extract the block body, then extracts step bodies and property names. Asserts every property is in `ALLOWED = new Set(['transform','opacity','filter'])`. Asserts `keyframeFiles.length >= 5` (currently finds exactly 5). Test "every keyframe animates only compositor-friendly properties" passes.

- ✅ **ACCEPTANCE CRITERIA — load-bearing guard** — Test "the guard is load-bearing" calls `extractKeyframeViolations` on the inline string `'@keyframes bad { from { height: 0 } to { height: 100px } }'` and asserts `violations.length > 0` and `violations.some(v => v.prop === 'height')`. This proves the extractor is real, not vacuous. The production test would fail if any `@keyframes` in the 5 swept files ever animated `height` (or `width`, `top`, `left`, etc.).

- ✅ **ACCEPTANCE CRITERIA — will-change hint** — `reels.css` line 126: `.reel--spinning` block contains `will-change: transform;`. Independently confirmed by reading the file. No raw hex in `reels.css` (grep confirmed 0 matches).

- ✅ **ACCEPTANCE CRITERIA — perf-notes.md** — `docs/perf-notes.md` documents: (1) target (~60fps mid-tier phone), (2) approach referencing DEC-004, (3) static guarantee (the 5-file sweep table + test citation), (4) in-preview measurement (693 samples, median 8.3ms, p95 9.2ms, 0 frames >20ms, 0 long frames >50ms), (5) explicit caveat that no CPU throttle was applied and a real mid-tier phone pass needs DevTools 4–6× throttle or a device, (6) conclusion that DEC-004 holds and no revisit is warranted. Honest and specific.

- ✅ **THE GUARD IS REAL** — `extractKeyframeViolations` in the test uses a Node fs walk (`walkCss`), `readFileSync` on each path, regex-based `@keyframes` detection, brace-counting to find block extent, and `/([a-z-]+)\s*:/g` to extract property names. This is real file parsing, not hardcoded. Spot-check of all 5 files confirms: every keyframe step body uses only `transform` and `opacity` (jackpot.css also uses `opacity`-only for `jackpot-sky-in`; paytable.css uses `transform`-only). The guard would fail if a future `@keyframes` step contained `width:`, `height:`, `top:`, `left:`, `margin:`, etc.

- ✅ **ENGINE UNCHANGED** — `git diff main..HEAD -- src/engine/` is empty. No engine files touched.

- ✅ **NO BEHAVIOR CHANGE** — Only 3 lines added to `reels.css`: a comment plus `will-change: transform;` in `.reel--spinning`. This is a compositor hint, not a visual change. The reduced-motion `@media` block is untouched. No `will-change: auto` under reduced motion (spec says optional, not required — correct to omit).

- ✅ **NO NEW DEPENDENCY** — `git diff main..HEAD -- package.json package-lock.json` is empty.

- ✅ **TESTS NOT VACUOUS** — Three tests: (1) real CSS sweep asserts ≥5 files and 0 violations across all actual CSS files; (2) load-bearing proof on inline bad string; (3) will-change test reads the real `reels.css` via `readFileSync`. Not vacuous.

- ✅ **DECISION DRIFT** — `just decisions-audit --changed main` shows DEC-004 and DEC-010 govern changed files; both are cited in spec front-matter and respected. DEC-001 (engine unchanged). No drift.

- ✅ **PERF-NOTES HONESTY** — The document is explicit: "CPU throttle applied: none (dev machine)." It calls out the limitation, names what the durable guarantee is (the property guard + DEC-004), and does not overclaim a throttled-device result. The measurement is clearly labeled "orchestrator preview sample."

- ✅ **BUILD REFLECTION** — Three questions answered honestly and specifically. No vague filler. One genuine insight (brace-counting for nested braces).

- ✅ **COST — build session** — `tokens_total: null` with note "orchestrator to fill tokens_total from subagent_tokens at ship". Correct per AGENTS §4 and the cycle model for metered subagents.

**Verified by:** claude-sonnet-4-6, 2026-06-28
