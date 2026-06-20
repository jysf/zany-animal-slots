---
# Maps to ContextCore task.* semantic conventions.
# This variant assumes Claude plays every role. The context normally
# in a separate handoff doc lives in the ## Implementation Context
# section below.

task:
  id: SPEC-005
  type: story                      # epic | story | task | bug | chore
  cycle: verify  # frame | design | build | verify | ship
  blocked: false
  priority: high
  complexity: S                    # S | M | L  (L means split it)

project:
  id: PROJ-001
  stage: STAGE-002
repo:
  id: animal-slots

agents:
  architect: claude-opus-4-8       # design/frame: Opus (judgement-heavy). See AGENTS §8.
  implementer: claude-sonnet-4-6   # build/verify: Sonnet (execution against the spec)
  created_at: 2026-06-19

references:
  decisions:
    - DEC-001
    - DEC-002
  constraints:
    - engine-no-dom
    - deterministic-rng
    - test-before-implementation
    - one-spec-per-pr
  related_specs: []

value_link: "Infrastructure enabling STAGE-002's deterministic spins — the single injected seedable PRNG every other engine module draws from (DEC-002)."

cost:
  sessions:
    - cycle: design
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      duration_minutes: 20
      recorded_at: 2026-06-19
      notes: "main-loop, not separately metered (AGENTS §4); design cycle"
    - cycle: build
      agent: claude-sonnet-4-6
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      duration_minutes: null
      recorded_at: 2026-06-19
      notes: "sub-agent build cycle — orchestrator to fill tokens_total/estimated_usd/duration from Agent result"
    - cycle: verify
      agent: claude-sonnet-4-6
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      duration_minutes: null
      recorded_at: 2026-06-19
      notes: "sub-agent verify cycle — orchestrator to fill tokens_total/estimated_usd/duration from Agent result"
  totals:
    tokens_total: 0
    estimated_usd: 0
    session_count: 0
---

# SPEC-005: Seedable RNG (mulberry32)

## Context

The first spec of STAGE-002 (the slot engine) and the foundation every other
engine module depends on. The project's thesis — game logic cleanly separable
from presentation, and *deterministic* so it can be unit-tested without a browser
— rests on a single **seedable, injected** pseudo-random number generator
(`DEC-002`). This spec delivers that PRNG (mulberry32) and the typed seam through
which `strips`/`spin` will draw, so that no engine code ever reaches for the bare
global `Math.random()` (constraint `deterministic-rng`). It establishes the
`Rng` type and the integer-drawing helper the reel-strip and spin specs build on.

See the parent `STAGE-002-slot-engine.md`, `DEC-002` (seedable injected RNG), and
the **Game-Design Spec** in `brief.md` (the draw model the RNG feeds).

## Goal

Provide a deterministic, seedable PRNG for the engine: `createRng(seed)` returns
an `Rng` (a `() => number` yielding floats in `[0, 1)`) implementing mulberry32,
plus `randomInt(rng, maxExclusive)` for drawing an integer in `[0, maxExclusive)`.
Same seed ⇒ identical sequence; all randomness in the engine flows through this.

## Inputs

- **Files to read:** `decisions/DEC-002-seedable-injected-rng.md` (the mandate);
  `projects/PROJ-001-animal-slots/brief.md` Game-Design Spec (how stops are drawn);
  `eslint.config.js` (the `engine-no-dom` boundary the new file lives behind).
- **Related code paths:** `src/engine/` (currently empty but for `.gitkeep`).

## Outputs

- **Files created:**
  - `src/engine/rng.ts` — the PRNG module.
  - `src/engine/rng.test.ts` — its unit tests (the Failing Tests below).
- **New exports (from `rng.ts`):**
  - `export type Rng = () => number;` — returns the next float in `[0, 1)`.
  - `export function createRng(seed: number): Rng;` — mulberry32, seeded.
  - `export function randomInt(rng: Rng, maxExclusive: number): number;` —
    `Math.floor(rng() * maxExclusive)`; consumes exactly one draw.
- **Database changes:** none.

## Acceptance Criteria

- [ ] `createRng(seed)` returns a function; calling it repeatedly yields floats in
      `[0, 1)`.
- [ ] **Deterministic:** `createRng(s)` and a second `createRng(s)` produce
      identical sequences; two different seeds produce different sequences.
- [ ] The output matches the **canonical mulberry32** sequence for a pinned seed
      (locks the exact algorithm, per DEC-002).
- [ ] `randomInt(rng, n)` returns an integer in `[0, n)`, is deterministic for a
      pinned seed, and throws on `n < 1` (programmer error — AGENTS §11).
- [ ] No bare `Math.random()` anywhere in `src/engine/**`; `rng.ts` imports nothing
      from React/DOM or `src/ui/**` (constraints `deterministic-rng`,
      `engine-no-dom`).
- [ ] `just typecheck`, `just lint`, `just test`, `just build` all exit 0.

## Failing Tests

Written during **design**, BEFORE build. Build's job is to make these pass.
Expected values were computed from the canonical mulberry32 reference, so they
pin the exact algorithm (a different PRNG, or a subtly wrong one, fails test 4/6).

- **`src/engine/rng.test.ts`**
  - `"createRng yields floats in [0, 1)"` — pull 1000 values from `createRng(7)`;
    assert every value `>= 0` and `< 1`.
  - `"is deterministic — same seed yields the same sequence"` — pull 10 values
    each from two independent `createRng(42)` instances; assert the arrays are
    deeply equal.
  - `"different seeds yield different sequences"` — assert
    `createRng(1)()  !== createRng(2)()` (first draws differ), and that the
    first-10 sequences for seeds 1 and 2 are not deeply equal.
  - `"matches the canonical mulberry32 sequence for seed 12345"` — from
    `createRng(12345)`, the first five values are (each `toBeCloseTo(_, 10)`):
    `[0.979728267760947, 0.306752264499664, 0.484205421525985, 0.817934412509203,
    0.509428369347006]`.
  - `"randomInt returns integers within [0, maxExclusive)"` — for `createRng(99)`,
    draw `randomInt(rng, 35)` 1000 times; assert every result is an integer with
    `0 <= r < 35`.
  - `"randomInt is deterministic for a pinned seed"` — from `createRng(12345)`,
    ten successive `randomInt(rng, 35)` calls equal
    `[34, 10, 16, 28, 17, 12, 2, 26, 34, 28]` (these are the strip stops a
    35-length reel would draw — ties the RNG to the DEC-011 strip length).
  - `"randomInt throws on a non-positive bound"` — `randomInt(createRng(1), 0)`
    and `randomInt(createRng(1), -3)` each throw (RangeError).

## Implementation Context

*Read this section (and the files it points to) before starting the build cycle.*

### Decisions that apply

- `DEC-002` (seedable injected RNG) — **the** mandate: one seedable PRNG
  (mulberry32-style), injected, so spins are reproducible. This spec is its
  implementation. Do not add a second randomness source.
- `DEC-001` (engine/presentation separation) — `rng.ts` is pure engine; no
  React/DOM, no `src/ui/**` imports.

### Constraints that apply

- `deterministic-rng` (blocking) — all engine randomness via this injected PRNG;
  **no bare `Math.random()`** anywhere under `src/engine/**`.
- `engine-no-dom` (blocking) — lint-enforced; `rng.ts` imports nothing DOM/React.
- `test-before-implementation`, `one-spec-per-pr`.

### Prior related work

- None in the engine yet — this is the first `src/engine/**` module. The
  `engine-no-dom` ESLint boundary (SPEC-001, `eslint.config.js`) already guards it.

### Out of scope (for this spec specifically)

- Reel strips, the symbol set, grid resolution, payline/paytable, balance, tiers
  (later STAGE-002 specs). `randomInt` is provided here because it is pure
  RNG mechanics; *using* it to pick reel stops belongs to `strips`/`spin`.
- A cryptographically secure RNG — not needed; mulberry32 is chosen for speed,
  small size, and seedability (play-money, no RTP claim — DEC-005).
- Re-seeding / saving generator state across calls beyond what closure captures.

## Notes for the Implementer

- Canonical mulberry32 (use exactly this so the pinned-sequence test passes):

  ```ts
  export function createRng(seed: number): Rng {
    let a = seed;
    return () => {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  ```

- `randomInt(rng, maxExclusive)`: validate `maxExclusive >= 1` (else `throw new
  RangeError(...)` — genuine programmer error, AGENTS §11), then
  `return Math.floor(rng() * maxExclusive);`. It must consume exactly one `rng()`
  draw so downstream draw-order stays predictable.
- Keep the module tiny and dependency-free. `Math.imul`/`Math.floor` are not DOM.
- Explain *why* in a comment only where non-obvious (e.g. one line noting this is
  mulberry32 and why it's seedable); don't narrate the bit-twiddling.

---

## Build Completion

*Filled in at the end of the **build** cycle, before advancing to verify.*

- **Branch:** `feat/spec-005-seedable-rng`
- **PR (if applicable):**
- **All acceptance criteria met?** yes
- **New decisions emitted:**
  - none
- **Deviations from spec:**
  - none — the exact mulberry32 code from the spec was used verbatim; all seven failing tests implemented as specified; no extra exports or deps added.
- **Follow-up work identified:**
  - none beyond the existing STAGE-002 backlog (strips, spin, paylines, etc.)

### Build-phase reflection (3 questions, short answers)

1. **What was unclear in the spec that slowed you down?**
   — Nothing was unclear. The spec provided the exact mulberry32 implementation code and pinned canonical fixture values, so there was no ambiguity about algorithm or expected output.

2. **Was there a constraint or decision that should have been listed but wasn't?**
   — No missing constraints. The relevant ones (`deterministic-rng`, `engine-no-dom`) were all listed and straightforward to satisfy with a pure module containing no imports at all.

3. **If you did this task again, what would you do differently?**
   — Nothing material. The spec was complete and self-contained. The only micro-optimization would be verifying the pinned fixture values before coding (to catch any arithmetic surprise early), but the spec-provided values were correct on first run.

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

Reviewer: claude-sonnet-4-6, 2026-06-19. Cold review; did not participate in design or build.

### Gate commands (all exit 0)

- `just typecheck` — PASS
- `just lint` — PASS
- `just test` — PASS (20/20; rng.test.ts contributes all 7 specified tests)
- `just build` — PASS (Vite production build, 37 modules)
- `just decisions-audit --changed` — no changed files in working tree (build is committed); repo-wide `just decisions-audit` shows 14 pre-existing scope-overlap warnings, 0 errors — none attributable to this spec

### Per-criterion findings

- **Acceptance criteria — all met:**
  - [x] `createRng(seed)` returns a function yielding floats in `[0, 1)` — test 1 verifies 1000 draws
  - [x] Deterministic: same seed → same sequence (test 2); different seeds → different sequences (test 3)
  - [x] Canonical mulberry32 fixture for seed 12345 (test 4) — pinned 5-value sequence with `toBeCloseTo(_,10)`
  - [x] `randomInt` range, determinism, and throw on `n < 1` (tests 5, 6, 7)
  - [x] No bare `Math.random()` anywhere in `src/engine/**` — grep confirmed zero matches
  - [x] `rng.ts` has zero import statements — no React/DOM/ui imports possible
  - [x] All gate commands exit 0

- **Tests not vacuous:**
  - All 7 tests from the spec's `## Failing Tests` section are present, uncommitted, and asserting real values. The pinned-fixture tests (tests 4 and 6) would fail with any wrong or substitute algorithm — the bit-twiddling produces unique outputs that cannot pass by accident. `randomInt` throw-on-non-positive is explicitly tested for both `0` and `-3`.

- **Algorithm correctness:**
  - `createRng` in `rng.ts` is byte-for-byte identical to the spec's reference implementation (canonical mulberry32). `randomInt` validates `maxExclusive >= 1`, throws `RangeError`, and returns `Math.floor(rng() * maxExclusive)` — exactly one draw, as specified.

- **Constraints:**
  - `deterministic-rng`: no `Math.random()` in `src/engine/**` — confirmed
  - `engine-no-dom`: `rng.ts` has no import statements at all — trivially satisfied; lint also passes
  - `DEC-001`: module is pure engine, no presentation coupling
  - `DEC-002`: mulberry32 implemented exactly; one seeded PRNG; no second randomness source

- **Decision drift:** none. No non-trivial build decisions that lack a DEC-*. The only decision was to copy the spec's exact reference implementation verbatim, which requires no new DEC.

- **Build Completion:** all 3 reflection questions answered with substantive, honest content (not placeholder text).

- **Cost sessions:** design (null, main-loop, noted — correct per AGENTS §4) and build (null, orchestrator-to-fill, noted — correct per §4). Verify session appended above. No blocking concern; orchestrator fills numerics at ship.

- **one-spec-per-pr:** only `src/engine/rng.ts` and `src/engine/rng.test.ts` are new files on this branch. Confirmed.
