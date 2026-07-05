---
# Maps to ContextCore task.* semantic conventions.
# This variant assumes Claude plays every role. The context normally
# in a separate handoff doc lives in the ## Implementation Context
# section below.

task:
  id: SPEC-040
  type: story                      # epic | story | task | bug | chore
  cycle: build  # frame | design | build | verify | ship
  blocked: false
  priority: medium
  complexity: M                    # S | M | L  (L means split it)  — [S–M] per stage backlog

project:
  id: PROJ-002
  stage: STAGE-007
repo:
  id: animal-slots

agents:
  architect: claude-opus-4-8       # design/frame: Opus (judgement-heavy). See AGENTS §8.
  implementer: claude-sonnet-4-6   # build/verify: Sonnet (execution against the spec)
  created_at: 2026-07-04

references:
  decisions:
    - DEC-015                       # config-driven machine model — engine consumes the math slice
    - DEC-001                       # engine-no-dom boundary must survive
    - DEC-002                       # deterministic RNG — frozen seeds are the parity contract
    - DEC-003                       # jackpot = WOLF×5 + the win-tier model — now read from the machine
  constraints:
    - engine-no-dom
    - test-before-implementation
    - one-spec-per-pr
    - no-new-top-level-deps-without-decision
  related_specs:
    - SPEC-038                       # pinned the Machine type (jackpot rule + tier boundary fields)
    - SPEC-039                       # parameterized resolveGrid + evaluatePaylines; same pattern
    - SPEC-010                       # the original win-tier classification being parameterized

# One sentence on what this spec contributes to its stage's
# value_contribution. For plumbing: "infrastructure enabling
# STAGE-007's <capability>". Optional; null is acceptable.
value_link: "Finishes the engine parameterization: classifyWin + isJackpot read the jackpot rule ({symbol,count}) and big-win boundary (bigMultiple) from the machine instead of hard-coded WOLF×5 / 5×, so after this spec no engine function reads a hard-coded symbol/weight/strip/payline/paytable/tier constant. Guarded by the frozen seeds' tiers plus a variant-machine test proving the rule is truly machine-driven."

# Self-reported AI cost per cycle. Each cycle (design, build, verify,
# ship) appends one entry to sessions[]. Totals are computed at ship.
# Record a REAL tokens_total for metered cycles (build/verify) — the
# orchestrator fills it from the Agent result's subagent_tokens at ship
# (or /cost interactively). Only un-metered main-loop cycles (design/ship)
# may be null-with-note. `just cost-audit` enforces this on shipped specs.
# See AGENTS.md §4 and docs/cost-tracking.md. interface: claude-code |
# claude-ai | api | ollama | other.
cost:
  sessions:
    - cycle: design
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      duration_minutes: 25
      recorded_at: 2026-07-04
      notes: "main-loop, not separately metered (AGENTS §4); design cycle (parameterize classifyWin + isJackpot to read the machine's jackpot rule + bigMultiple; spin() threads the machine into classifyWin; update tiers.test.ts call sites; add a variant-machine guard proving the rule is machine-driven; build prompt). Completes the engine parameterization — after this no engine fn reads a hard-coded tier/jackpot constant."
    - cycle: build
      agent: claude-sonnet-4-6
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      duration_minutes: null
      recorded_at: 2026-07-04
      notes: "orchestrator to fill tokens_total from subagent_tokens (AGENTS §4); build cycle run as a metered sub-agent — applied the spec's drop-in tiers.ts (isJackpot/classifyWin parameterized on JackpotRule/MachineMath), the index.ts classifyWin one-liner, and the tiers.test.ts call-site updates + new variant-machine describe block, verbatim from the spec Notes. Full gate green (typecheck/lint/test/build), just validate green, 5-file engine diff guard empty, WOLF/5-boundary grep guard empty, spin-parity.test.ts green unchanged, all pre-existing tiers.test.ts expected values byte-identical."
  totals:
    tokens_total: 0
    estimated_usd: 0
    session_count: 0
---

# SPEC-040: parameterize win tier and jackpot rule

## Context

Third engine-parameterization spec of `STAGE-007`, and the one that **completes** the
engine's transition to config-driven. SPEC-038 pinned the `Machine` type (including
`jackpot: { symbol, count }` and `tiers: { bigMultiple }`); SPEC-039 made `resolveGrid`
+ `evaluatePaylines` consume the machine's strips/paylines/paytable. The one engine
function still reading hard-coded constants is `classifyWin` (and its helper
`isJackpot`) in `src/engine/tiers.ts`: the jackpot rule is hard-coded `WOLF` × `5`, and
the big-win boundary is a hard-coded `5×`. This spec moves both into machine data —
`isJackpot(lineWins, jackpot)` and `classifyWin(totalWin, totalBet, lineWins, math)` —
and threads the machine through `spin()`.

After this spec, **no engine function reads a hard-coded symbol/weight/strip/payline/
paytable/tier constant** (a STAGE-007 success criterion). The change is guarded by the
four frozen seeds' tiers (already asserted end-to-end in `spin-parity.test.ts` from
SPEC-039) plus a new **variant-machine** test that proves the rule is genuinely
machine-driven (a machine with a different jackpot symbol/count and `bigMultiple`
classifies differently) — not still hard-coded behind a machine-shaped façade.

See `STAGE-007` (backlog slot 3 of 6), `PROJ-002`, DEC-015, DEC-003 (the WOLF×5 jackpot
rule + win-tier model, now data), DEC-002 (the frozen seeds).

## Goal

Make `classifyWin` and `isJackpot` read the jackpot rule (`math.jackpot`) and the
big-win boundary (`math.tiers.bigMultiple`) from the machine instead of hard-coded
`WOLF` / `5` / `5×`, and thread the machine through `spin()` — changing no observable
behavior for the default machine (proven by the frozen seeds' tiers) while making the
rule genuinely data-driven (proven by a variant-machine test).

## Inputs

- **Files to read:**
  - `src/engine/tiers.ts` — `classifyWin` + `isJackpot` (the hard-coded `WOLF`/`5`/`5×`
    to parameterize).
  - `src/engine/machine.ts` — `MachineMath` (`jackpot: JackpotRule`, `tiers:
    TierBoundaries`) + `WILD_AND_WHIMSICAL_MATH` (SPEC-038).
  - `src/engine/index.ts` — `spin()` composition (thread the machine into `classifyWin`).
  - `src/engine/tiers.test.ts` — the unit tests whose call sites change (outcomes unchanged).
  - `src/engine/spin-parity.test.ts` — the SPEC-039 frozen-seed guard (already asserts
    `tier` for all four seeds; it must stay green as the end-to-end tier-parity proof).
- **External APIs:** none.
- **Related code paths:** `src/engine/` only. No UI/hook change (SPEC-042).

## Outputs

- **Files modified:**
  - `src/engine/tiers.ts` — `isJackpot(lineWins, jackpot: JackpotRule)` uses
    `jackpot.symbol` / `jackpot.count`; `classifyWin(totalWin, totalBet, lineWins, math:
    MachineMath)` calls `isJackpot(lineWins, math.jackpot)` and uses
    `math.tiers.bigMultiple` for the small/big boundary. `import type { MachineMath,
    JackpotRule } from './machine'`. No hard-coded `WOLF` / `5` / `5×` remain.
  - `src/engine/index.ts` — `spin()` passes the (already-threaded) `machine` into
    `classifyWin`: `classifyWin(totalWin, bet, lineWins, machine)`.
  - `src/engine/tiers.test.ts` — update call sites to pass `WILD_AND_WHIMSICAL_MATH`
    (classifyWin) / `WILD_AND_WHIMSICAL_MATH.jackpot` (isJackpot); **expected outcomes
    unchanged**. Add a `describe('reads the rule from the machine (SPEC-040)')` block with
    the variant-machine assertions (see Failing Tests).
- **New exports:** none new; `classifyWin` / `isJackpot` signatures change (see above).
- **Database changes:** none. **New dependency:** none. **New decision:** none (DEC-015 covers it).

## Acceptance Criteria

- [ ] **`isJackpot` reads the machine's jackpot rule:** `isJackpot(lineWins, jackpot:
      JackpotRule)` returns true iff some line win has `symbol === jackpot.symbol` and
      `count === jackpot.count`. No hard-coded `'WOLF'` or `5` remains in the function.
- [ ] **`classifyWin` reads the machine:** `classifyWin(totalWin, totalBet, lineWins,
      math: MachineMath)` returns `'jackpot'` when `isJackpot(lineWins, math.jackpot)`,
      else `'none'` for `totalWin <= 0`, else `'small'` for `totalWin < math.tiers.
      bigMultiple * totalBet`, else `'big'`. No hard-coded `5` boundary remains.
- [ ] **`spin` threads the machine into `classifyWin`:** `spin()` calls `classifyWin(
      totalWin, bet, lineWins, machine)` with the same `machine` (default
      `WILD_AND_WHIMSICAL_MATH`) it already threads into grid/payline eval.
- [ ] **Frozen-seed tier parity:** through the default machine, `spin-parity.test.ts`
      still passes — 407947 → jackpot, 12345 → none, 276 → big, 12 → small — unchanged.
- [ ] **Genuinely machine-driven (the new guard):** with a variant machine `{ ...WILD_AND_
      WHIMSICAL_MATH, jackpot: { symbol: 'BISON', count: 5 }, tiers: { bigMultiple: 3 } }`,
      `classifyWin`/`isJackpot` classify **differently** from the default: five BISON is
      `jackpot` under the variant but `big` under the default; and a win at `3×`–under-`5×`
      bet is `big` under the variant but `small` under the default.
- [ ] **No hard-coded tier/jackpot constant left in the engine:** `grep -nE "'WOLF'|WOLF|
      5 \* totalBet|count === 5" src/engine/tiers.ts` finds nothing in `classifyWin`/
      `isJackpot` bodies (the rule comes only from `math`). Combined with SPEC-038/039,
      no engine function reads a hard-coded symbol/weight/strip/payline/paytable/tier constant.
- [ ] **DEC-001 intact / engine freeze scope:** `machine` is plain data; `import type`
      only; `engine-boundary.test.ts` passes; only `tiers.ts` + `index.ts` (+ their tests)
      change — `spin.ts`/`paylines.ts`/`strips.ts`/`balance.ts`/`rng.ts` unchanged.
- [ ] Full gate green (`just typecheck && just lint && just test && just build`); no new
      dependency; `just validate` passes.

## Failing Tests

Written during **design**, BEFORE build. Existing `tiers.test.ts` cases keep their exact
expected values (that identity is the parity proof); the new `describe` block proves the
rule is data-driven.

- **`src/engine/tiers.test.ts`** (update call sites + add a describe block):
  - All existing `classifyWin(a, b, c)` calls become `classifyWin(a, b, c,
    WILD_AND_WHIMSICAL_MATH)`; all `isJackpot(x)` calls become `isJackpot(x,
    WILD_AND_WHIMSICAL_MATH.jackpot)`. Every existing expected value is unchanged (none →
    none, WOLF×5 → jackpot, 49→small, 50→big, five BISON → big, etc.).
  - **New** `describe('reads the rule from the machine (SPEC-040)')`:
    - `"jackpot symbol/count come from the machine"` — with `const variant = { ...WILD_AND_
      WHIMSICAL_MATH, jackpot: { symbol: 'BISON', count: 5 } }`: `isJackpot([lw('BISON', 5,
      400)], variant.jackpot)` is `true`, while `isJackpot([lw('BISON', 5, 400)],
      WILD_AND_WHIMSICAL_MATH.jackpot)` is `false`; and `classifyWin(400, 10, [lw('BISON',
      5, 400)], variant)` is `'jackpot'` while the default machine gives `'big'`.
    - `"the big-win boundary comes from the machine"` — with `const variant = { ...WILD_AND_
      WHIMSICAL_MATH, tiers: { bigMultiple: 3 } }`: `classifyWin(30, 10, [lw('DEER', 3,
      30)], variant)` is `'big'` (30 ≥ 3×10) while `classifyWin(30, 10, [lw('DEER', 3,
      30)], WILD_AND_WHIMSICAL_MATH)` is `'small'` (30 < 5×10).
- **`src/engine/spin-parity.test.ts`** (SPEC-039, unchanged) — must stay green: it already
  asserts the four seeds' tiers through the default machine, which is the end-to-end
  tier-parity guard for this change.

## Implementation Context

*Read this section (and the files it points to) before starting the build cycle.*

### Decisions that apply

- `DEC-015` — the engine consumes the machine's math slice; this spec moves the last
  hard-coded rule (jackpot + big boundary) into that slice.
- `DEC-003` — the WOLF×5 jackpot rule + the win-tier model. Its *values* live on inside
  `WILD_AND_WHIMSICAL_MATH.jackpot` / `.tiers`; the logic now reads them from data.
- `DEC-001` / `DEC-002` — plain-data config, no DOM; deterministic seeds unchanged.

### Constraints that apply

- `engine-no-dom` — no React/DOM; keep the boundary test green.
- `test-before-implementation` — the updated call sites + variant-machine block are the
  design's failing tests.
- `one-spec-per-pr` — only `tiers.ts` + the `classifyWin` call in `index.ts` + their
  tests. No UI change; no `resolveGrid`/`evaluatePaylines` change (SPEC-039 already did those).
- `no-new-top-level-deps-without-decision` — none.

### Prior related work

- `SPEC-039` (shipped) — set the pattern: thread `machine` from `spin()`, default it to
  `WILD_AND_WHIMSICAL_MATH`, keep pinned fixtures identical. `spin-parity.test.ts` (its
  guard) already covers the four seeds' tiers.
- `SPEC-010` (the win-tier classification) and `SPEC-038` (the `jackpot`/`tiers` fields).

### Out of scope (for this spec specifically)

- **UI / hook plumbing** — SPEC-042. `useSlotMachine` still calls `spin({ seed, balance,
  bet })` (default machine).
- **`resolveGrid` / `evaluatePaylines`** — already parameterized in SPEC-039; do not touch.
- **Presentation (emoji/theme/audio)** — SPEC-041.
- **Retuning the actual jackpot/tier values** — STAGE-008. This spec is behavior-preserving
  for the default machine.
- **Deleting the module `STRIPS`/`PAYLINES`/… constants** — later cleanup (still referenced
  by the machine).

## Notes for the Implementer

- **Parity anchor is identity.** Every existing `tiers.test.ts` expected value stays the
  same after adding the machine arg. If a pinned value changes, you changed behavior — stop
  and set the timeline `[?]`.
- **Type-only import.** `tiers.ts` needs `MachineMath` + `JackpotRule` as **types** only:
  `import type { MachineMath, JackpotRule } from './machine'`. (No runtime cycle here anyway
  — `machine.ts` does not import `tiers.ts` — but keep it type-only for consistency and to
  make the erasure explicit.)
- **Drop-in — `src/engine/tiers.ts`:**
  ```ts
  // Win-tier classification for the slot engine.
  // DEC-015: the jackpot rule + big-win boundary are read from the machine's math slice.
  // DEC-001: pure engine — imports only types (LineWin + the machine math types).
  import type { LineWin } from './paylines';
  import type { MachineMath, JackpotRule } from './machine';

  export type WinTier = 'none' | 'small' | 'big' | 'jackpot';

  /** True iff some line win matches the machine's jackpot rule (symbol × count). */
  export function isJackpot(lineWins: LineWin[], jackpot: JackpotRule): boolean {
    return lineWins.some(
      (w) => w.symbol === jackpot.symbol && w.count === jackpot.count,
    );
  }

  /**
   * Classify a resolved spin into a WinTier, using the machine's jackpot rule and
   * big-win boundary. Precedence: jackpot → none → small → big.
   *   1. jackpot — isJackpot(lineWins, math.jackpot)
   *   2. none    — totalWin <= 0
   *   3. small   — 0 < totalWin < math.tiers.bigMultiple × totalBet
   *   4. big     — totalWin >= math.tiers.bigMultiple × totalBet
   */
  export function classifyWin(
    totalWin: number,
    totalBet: number,
    lineWins: LineWin[],
    math: MachineMath,
  ): WinTier {
    if (isJackpot(lineWins, math.jackpot)) return 'jackpot';
    if (totalWin <= 0) return 'none';
    if (totalWin < math.tiers.bigMultiple * totalBet) return 'small';
    return 'big';
  }
  ```
- **Drop-in — `src/engine/index.ts`** (the only change to `spin()` — the `classifyWin` call):
  ```ts
  const tier = classifyWin(totalWin, bet, lineWins, machine);
  ```
  `machine` is already in scope (SPEC-039 added `machine = WILD_AND_WHIMSICAL_MATH` to the
  destructure). No other `index.ts` change; `classifyWin` is imported already.
- **`tiers.test.ts` updates:** `import { WILD_AND_WHIMSICAL_MATH } from './machine';` at the
  top. Append `, WILD_AND_WHIMSICAL_MATH` to every `classifyWin(...)` call and `,
  WILD_AND_WHIMSICAL_MATH.jackpot` to every `isJackpot(...)` call. Then add the new
  `describe('reads the rule from the machine (SPEC-040)')` block per Failing Tests. The `lw`
  helper already exists in the file — reuse it.
- **Repo toolchain gotchas:** ESLint has NO react-hooks plugin (no exhaustive-deps disables);
  NO `@testing-library/user-event`; JSX test files must be `.tsx` — `tiers.test.ts` has no
  JSX, keep `.ts`. `tsconfig` `include` is `["src"]`. No new dependency; touch only
  `src/engine/**`.
- **Self-check before finishing:** `git diff main..HEAD -- src/engine/spin.ts
  src/engine/paylines.ts src/engine/strips.ts src/engine/balance.ts src/engine/rng.ts` is
  EMPTY (only `tiers.ts` + `index.ts` change among engine source), and `grep -nE
  "WOLF|5 \* totalBet" src/engine/tiers.ts` finds nothing (the rule is fully machine-driven).

---

## Build Completion

*Filled in at the end of the **build** cycle, before advancing to verify.*

- **Branch:** `feat/spec-040-parameterize-tier-jackpot`
- **PR (if applicable):** not opened — build cycle is local-only per this run's scope; ship cycle opens the PR.
- **All acceptance criteria met?** yes
- **New decisions emitted:**
  - none (DEC-015 already covers this)
- **Deviations from spec:**
  - none — the drop-in code for `tiers.ts`, the `index.ts` one-liner, and the `tiers.test.ts`
    updates were used verbatim from the spec Notes.
- **Follow-up work identified:**
  - none new; SPEC-041 (presentation) and SPEC-042 (UI/hook wiring) remain as already scoped
    out of this spec.

### Build-phase reflection (3 questions, short answers)

Process-focused: how did the build go? What friction did the spec create?

1. **What was unclear in the spec that slowed you down?**
   — Nothing; the spec's Notes section had complete drop-in code for all three files, so this
   was closer to careful transcription + verification than open-ended implementation.

2. **Was there a constraint or decision that should have been listed but wasn't?**
   — No, the constraint list (5-file diff guard, grep guard, type-only import, byte-identical
   fixtures) was exhaustive and directly checkable.

3. **If you did this task again, what would you do differently?**
   — Nothing procedurally different; the spec's precision (drop-in code + explicit self-check
   commands) made this a very low-risk, mechanical build.

---

## Reflection (Ship)

*Appended during the **ship** cycle. Outcome-focused reflection, distinct
from the process-focused build reflection above.*

1. **What would I do differently next time?**
   — <answer>

2. **Does any template, constraint, or decision need updating?**
   — <answer>

3. **Is there a follow-up spec I should write now before I forget?**
   — <answer>
