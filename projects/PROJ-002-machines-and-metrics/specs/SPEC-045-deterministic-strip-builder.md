---
# Maps to ContextCore task.* semantic conventions.
# This variant assumes Claude plays every role. The context normally
# in a separate handoff doc lives in the ## Implementation Context
# section below.

task:
  id: SPEC-045
  type: story                      # epic | story | task | bug | chore
  cycle: verify  # frame | design | build | verify | ship
  blocked: false
  priority: medium
  complexity: M                    # S | M | L  (L means split it)

project:
  id: PROJ-002
  stage: STAGE-008
repo:
  id: animal-slots

agents:
  architect: claude-opus-4-8       # design/frame: Opus (judgement-heavy). See AGENTS §8.
  implementer: claude-sonnet-4-6   # build/verify: Sonnet (execution against the spec)
  created_at: 2026-07-05

references:
  decisions:
    - DEC-001   # engine-no-dom: buildStrip is pure engine, no DOM
    - DEC-002   # determinism: buildStrip uses NO RNG — same inputs → same strip
    - DEC-011   # reel weights + strip composition (this generalizes the hand-authored strip)
    - DEC-015   # config-driven machine model: strips become derivable from a machine's weights
  constraints:
    - engine-no-dom
  related_specs:
    - SPEC-006  # symbols + the original hand-authored weighted reel strip
    - SPEC-044  # the simulator that measured the retune target (shipped)
    - SPEC-046  # the fun-retune that CONSUMES buildStrip (next)

value_link: >-
  Infrastructure enabling STAGE-008's fun-retune: a deterministic strip-builder makes a
  machine's reel weights the LIVE tuning knob (the user's "generate strips from weights"
  decision), so SPEC-046 retunes by editing weights, not by hand-authoring a strip.

cost:
  sessions:
    - cycle: design
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: null   # design cycle runs on the orchestrator's main Opus loop — not separately metered
      note: >-
        Design authored on the main Opus orchestrator loop (un-metered). Includes iterative
        tuning + a property check (300 random weightsets, 0 count failures) run via vite-node
        to lock the fractional-rank algorithm and pin the exact example output.
    - cycle: build
      interface: claude-code
      model: claude-sonnet-4-6
      tokens_total: null   # orchestrator to fill tokens_total from subagent_tokens
      duration_minutes: null   # orchestrator to fill from Agent result duration_ms
      note: >-
        Build ran as a metered subagent (Sonnet); orchestrator to fill tokens_total from
        subagent_tokens and duration_minutes from duration_ms per AGENTS §4. Implemented
        stripBuilder.ts + stripBuilder.test.ts verbatim from the spec Notes; all 7 tests
        passed first try (pinned example matched with no adjustment); full gate
        (typecheck/lint/test/build/validate) green; hard-guard diff against
        machine/production files confirmed empty.
    - cycle: verify
      interface: claude-code
      model: claude-sonnet-4-6
      tokens_total: null   # orchestrator to fill tokens_total from subagent_tokens
      duration_minutes: null   # orchestrator to fill from Agent result duration_ms
      note: >-
        Cold verify (Sonnet subagent); orchestrator to fill tokens_total from subagent_tokens
        and duration_minutes from duration_ms per AGENTS §4. Full gate green (54 files/320
        tests, stripBuilder.test.ts 7/7; build + validate clean). Confirmed spec conformance
        byte-for-byte (fractional keys, sort + tie-break, adjacency-fix loop; type-only
        SymbolId import; no RNG; not re-exported from engine/index.ts). Independently
        reproduced count-exactness (8 self-chosen weight profiles via vite-node, outside the
        test file) and the pinned example. Adversarial mutation (a) (k+0.5 -> k+1.5) failed
        the pinned-example test as expected; cleanly reverted. Adversarial mutation (b)
        (removing the `|| a.ord - b.ord` tie-break) did NOT fail any test (0/320) — root
        cause: native Array.sort is stable and item-insertion order already tracks the
        `symbols` iteration order, so the explicit tie-break is redundant with stable sort
        given this construction and the prescribed mutation has no observable effect;
        cleanly reverted. Flagged as a test-strength gap (not a functional defect) —
        verify marked [?]. Hard guard (machine/production + package.json/lock diff)
        confirmed EMPTY.
  totals:
    tokens_total: 0
    estimated_usd: 0
    session_count: 0
---

# SPEC-045: deterministic strip builder

## Context

STAGE-008 retunes the default machine for fun, and the retune's chosen tuning knob (a
product decision this session) is **reel weights**: SPEC-044 found that today's
`reelWeights` is **documentation-only** — the engine draws from the hand-authored
`REEL_STRIP` literal, so editing weights changes nothing. To make weights the *live*
knob, the machine's `strips` must be **generated from** its weights.

This spec adds that generator: a pure, deterministic `buildStrip(symbols, weights)` that
produces a reel strip containing exactly `weights[s]` copies of each symbol, evenly
spread, with no linear adjacent duplicates. It is **pure additive infrastructure** — it
touches no machine and changes no game behavior, so there is **no frozen-seed
re-baseline here**. SPEC-046 (the retune) wires `buildStrip` into Wild & Whimsical and
re-baselines once, under the retune DEC.

Splitting the builder out (rather than folding it into SPEC-046) keeps a genuinely novel
algorithm independently testable — its correctness (count-exactness, determinism,
adjacency) is proven without any re-baseline noise, exactly as SPEC-044's simulator was
proven before the retune consumed it.

## Goal

Add a pure, deterministic `buildStrip(symbols, weights)` to the engine that returns a
reel strip with exactly `weights[s]` occurrences of each symbol, evenly interleaved and
free of linear adjacent duplicates. No machine data changes; no game-behavior change.

## Inputs

- **Files to read:**
  - `src/engine/strips.ts` — `SymbolId`, `REEL_WEIGHTS`, and the hand-authored
    `REEL_STRIP`/`STRIPS` this generalizes (do NOT modify — SPEC-046 does).
  - `src/engine/index.ts` — the engine's public surface (buildStrip need not be
    re-exported; it's engine-internal infra consumed by `machine.ts` in SPEC-046).
- **Related code paths:** `src/engine/`.

## Outputs

- **Files created:**
  - `src/engine/stripBuilder.ts` — `buildStrip(symbols, weights)`.
  - `src/engine/stripBuilder.test.ts` — count-exactness, determinism, adjacency, degenerate
    + zero-weight handling, and a pinned small example.
- **Files modified:** none (purely additive).
- **New exports:** `buildStrip` from `src/engine/stripBuilder.ts`.
- **Database changes:** none.

## Acceptance Criteria

- [ ] `buildStrip(symbols, weights)` returns an array whose count of each symbol equals
      `weights[s]` (missing/zero keys omitted) — **count-exact by construction**.
- [ ] **Deterministic:** same `(symbols, weights)` → deep-equal output; no `Math.random()`,
      no RNG. Symbol *order* (both the set placed and the tie-break) comes from the
      `symbols` argument, so the result never depends on JS object key ordering.
- [ ] **No linear adjacent duplicates** on realistic multi-symbol weights (verified on the
      pinned example + the tuned-weights profile); the adjacency-fix pass reorders only, so
      counts stay exact.
- [ ] Degenerate single-symbol weights return that symbol repeated (adjacency unavoidable);
      zero/absent-weight symbols never appear.
- [ ] `buildStrip` is pure engine (DEC-001): imports only the `SymbolId` type, no DOM/React.
- [ ] `just test`, `just lint`, `just typecheck`, `just build`, `just validate` all pass.
      No machine data changes; `git diff main..HEAD -- src/machines/ src/engine/paylines.ts
      src/engine/machine.ts src/engine/spin.ts` is EMPTY (no behavior change).

## Failing Tests

Written now, BEFORE build. All in **`src/engine/stripBuilder.test.ts`** (imports
`buildStrip` from `./stripBuilder` and `SYMBOLS` from `./strips`). Build a small helper
`counts(strip)` that tallies symbol occurrences.

- **`src/engine/stripBuilder.test.ts`**
  - `"count-exact: output has exactly weights[s] copies of each symbol"`
    — for `SYMBOLS` with weights `{DEER:9,FOX:8,SQUIRREL:7,BEAR:5,EAGLE:4,OWL:3,BISON:3,WOLF:3}`,
      assert `counts(strip)` toEqual that weights map and `strip.length` toBe `42`.
  - `"count-exact across several weight profiles"`
    — for 3 more profiles (e.g. all-equal `{...:4}`, low-heavy, sparse), assert each
      symbol's count equals its weight and total length equals the weight sum.
  - `"deterministic: same inputs yield a deep-equal strip"`
    — `buildStrip(SYMBOLS, w)` toEqual a second identical call.
  - `"pinned example (locks the algorithm output)"`
    — `buildStrip(SYMBOLS, { DEER: 3, FOX: 2, WOLF: 1 })` toEqual
      `['DEER','FOX','DEER','WOLF','FOX','DEER']`.
  - `"no linear adjacent duplicates on realistic weights"`
    — for the tuned profile above and the pinned example, assert there is no index `i` with
      `strip[i] === strip[i+1]`.
  - `"zero / absent-weight symbols never appear"`
    — `buildStrip(SYMBOLS, { DEER: 2, WOLF: 1 })` contains no `FOX` (and no other zero-weight
      symbol); `counts` has only `DEER` and `WOLF`.
  - `"degenerate single-symbol weights repeat that symbol"`
    — `buildStrip(['DEER'], { DEER: 4 })` toEqual `['DEER','DEER','DEER','DEER']`
      (count-exact; adjacency unavoidable with one symbol).

## Implementation Context

*Read this section (and the files it points to) before starting the build cycle.*

### Decisions that apply

- `DEC-001` (engine-no-dom) — `stripBuilder.ts` imports only the `SymbolId` **type** from
  `./strips`; no React/DOM. ESLint's `no-restricted-imports` block on `src/engine/**`
  enforces this.
- `DEC-002` (determinism) — `buildStrip` uses **no RNG**. The spread is computed
  analytically (fractional ranks), so the output reproduces bit-for-bit; this is what lets
  SPEC-046 pin exact frozen-seed outcomes from the generated strip.
- `DEC-011` / `DEC-015` — this generalizes the hand-authored strip (SPEC-006) into a
  weights→strip function, so a machine's strip becomes derivable from its `reelWeights`.

### Constraints that apply

- `engine-no-dom` — see DEC-001. Pure engine, type-only import.

### Prior related work

- `SPEC-006` (shipped) — the original 8-symbol weights + the hand-authored 35-length
  `REEL_STRIP` (no adjacent duplicates, well-spread). `buildStrip` reproduces that
  discipline programmatically for any weights.
- `SPEC-044` (shipped) — surfaced that `reelWeights` was inert; this spec is the fix that
  makes it live. The simulator will measure the generated strip in SPEC-046.

### Out of scope (for this spec specifically)

- **Changing any machine** — `WILD_AND_WHIMSICAL_MATH`, `REEL_WEIGHTS`, `REEL_STRIP`,
  `STRIPS`, paylines, paytable all stay exactly as they are. Wiring `buildStrip` into W&W
  is **SPEC-046**, together with the retune and the single re-baseline.
- Any retune of numbers, any payline change, any frozen-seed re-baseline.
- Per-reel *distinct* strips (all reels still share one strip in W&W); `buildStrip`
  produces one strip — callers replicate it per reel as today.
- A universal "zero adjacent duplicates" guarantee: the adjacency-fix pass eliminates them
  for realistic weight sets but can leave one in pathological cases (verified: 0 on the
  tuned profile). Per-machine strips are checked when each machine is added.

## Notes for the Implementer

**Toolchain brief (read — these have bitten before):** ESLint has NO react-hooks plugin.
NO `@testing-library/user-event`. Test files with JSX must be `.tsx` — this test is plain
`.ts` (no JSX), keep it `.ts`. `tsconfig` `include` is `["src"]`, so the new files are
typechecked. No new dependency. Do not modify any existing file.

**Drop-in `src/engine/stripBuilder.ts`** (this exact algorithm produced the pinned example
and the strip SPEC-046 depends on — implement it faithfully):

```ts
// Deterministic reel-strip builder (STAGE-008 / SPEC-045).
// Turns per-symbol weights into a reel strip so a machine's `strips` can be GENERATED from
// its `reelWeights` (the retune's live tuning knob — SPEC-044 found the hand-authored strip
// made weights inert). Pure + deterministic (no RNG); DEC-001 (engine-no-dom): type-only import.
import type { SymbolId } from './strips';

/**
 * Build a deterministic reel strip from per-symbol weights.
 *
 * Fractional-rank interleave: symbol `s` with weight `c` contributes `c` occurrences at the
 * evenly spaced fractional positions (k + 0.5) / c for k in [0, c). All occurrences are then
 * sorted by position (ties broken by the canonical `symbols` order). Because the strip is
 * built FROM the exact multiset, it contains exactly `weights[s]` copies of every symbol.
 *
 * A final adjacency-fix pass swaps any linear adjacent duplicate forward to the nearest later
 * position whose neighbours differ (reorder only — counts stay exact). Adjacent duplicates are
 * eliminated for realistic weight sets; a single one may remain in pathological cases.
 *
 * Deterministic: no RNG, no Math.random — same (symbols, weights) → identical strip. The
 * `symbols` argument supplies BOTH the set to place (filtered to weight > 0) and the
 * tie-break order, so the result never depends on JS object key ordering.
 */
export function buildStrip(
  symbols: readonly SymbolId[],
  weights: Partial<Record<SymbolId, number>>,
): SymbolId[] {
  const items: { s: SymbolId; key: number; ord: number }[] = [];
  symbols.forEach((s, ord) => {
    const c = weights[s] ?? 0;
    for (let k = 0; k < c; k++) items.push({ s, key: (k + 0.5) / c, ord });
  });
  items.sort((a, b) => a.key - b.key || a.ord - b.ord);
  const out = items.map((it) => it.s);

  // Adjacency fix: move any element equal to its predecessor forward to the next slot whose
  // neighbours both differ from it. Pure reorder — symbol counts are unchanged.
  for (let i = 1; i < out.length; i++) {
    if (out[i] !== out[i - 1]) continue;
    let j = i + 1;
    while (j < out.length && (out[j] === out[i] || out[j] === out[i - 1])) j++;
    if (j < out.length) {
      const tmp = out[i];
      out[i] = out[j];
      out[j] = tmp;
    }
  }
  return out;
}
```

**`counts` test helper:**

```ts
function counts(strip: readonly SymbolId[]): Partial<Record<SymbolId, number>> {
  const c: Partial<Record<SymbolId, number>> = {};
  for (const s of strip) c[s] = (c[s] ?? 0) + 1;
  return c;
}
```

**Why the pinned example is `['DEER','FOX','DEER','WOLF','FOX','DEER']`:** with weights
`{DEER:3,FOX:2,WOLF:1}` the fractional keys are DEER @ .167/.5/.833, FOX @ .25/.75, WOLF @
.5; sorted (WOLF's .5 tie-breaks after DEER's .5 by canonical order) →
DEER,FOX,DEER,WOLF,FOX,DEER. No adjacency fix needed (already dup-free).

**Verify-cycle adversarial check (teeth):** confirm the count-exactness test is real —
temporarily break the builder (e.g. change `(k + 0.5)` to `(k + 1.5)` so the keys distort,
or drop the final `items.push`) and confirm a test FAILS, then revert. Also confirm the
pinned-example test fails if the tie-break `|| a.ord - b.ord` is removed (ordering becomes
unstable), then revert.

## Build Completion

Implemented `src/engine/stripBuilder.ts` and `src/engine/stripBuilder.test.ts` verbatim
from the spec's Notes (drop-in algorithm + `counts` helper), with no deviation. All 7
specified tests written and passing on the first run — the pinned example
(`buildStrip(SYMBOLS, { DEER: 3, FOX: 2, WOLF: 1 })` → `['DEER','FOX','DEER','WOLF','FOX','DEER']`)
matched immediately, confirming the algorithm was copied faithfully (fractional keys
`(k + 0.5) / c`, sort `a.key - b.key || a.ord - b.ord`, the adjacency-fix loop). No other
file touched. No new dependency. No new DEC.

Gate results (all exit 0):
- `just typecheck` — clean, no errors.
- `just lint` — clean, no errors.
- `just test` — 54 test files, 320 tests passed, including the new
  `src/engine/stripBuilder.test.ts` (7/7 passed).
- `just build` — production build succeeded (tsc --noEmit + vite build).
- `just validate` — 45 specs valid front-matter, passed.

Hard guard confirmed EMPTY: `git diff main..HEAD -- src/machines/ src/engine/strips.ts
src/engine/paylines.ts src/engine/machine.ts src/engine/spin.ts src/engine/index.ts`
produced no output. Only files changed: the two new `src/engine/stripBuilder.{ts,test.ts}`
files (added) and this spec + its timeline (documentation).

### Reflection

1. **Did anything in the spec's Implementation Context turn out to be wrong or
   incomplete?** No. The drop-in code, the `counts` helper, and the pinned-example
   walkthrough (fractional keys, tie-break by canonical order) were complete and accurate —
   the pinned test passed on the very first run with zero adjustment, which is the clearest
   possible signal the Notes were correct and sufficient.
2. **What would have made this build faster or safer?** Nothing meaningful — this was
   about as low-friction as a build gets: fully-specified drop-in code, a fully-specified
   test list, and a hard, mechanically-checkable guard (the empty git diff) instead of a
   prose "don't touch other files" instruction. The only manual judgment call was profile
   selection for the "several weight profiles" test (all-equal / low-heavy / sparse), which
   the spec left as illustrative examples rather than exact literals.
3. **Any deviation from the spec, and why?** None. `stripBuilder.ts` is byte-for-byte the
   Notes' drop-in (with the file-header comment retained), and the test file implements
   exactly the 7 named tests using the given `counts` helper. The hard guard diff came back
   empty, confirming no production/machine file was touched.
