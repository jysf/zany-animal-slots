---
# Maps to ContextCore task.* semantic conventions.

task:
  id: SPEC-010
  type: story
  cycle: ship
  blocked: false
  priority: high
  complexity: S

project:
  id: PROJ-001
  stage: STAGE-002
repo:
  id: animal-slots

agents:
  architect: claude-opus-4-8
  implementer: claude-sonnet-4-6
  created_at: 2026-06-22

references:
  decisions:
    - DEC-001
    - DEC-003
  constraints:
    - engine-no-dom
    - test-before-implementation
    - one-spec-per-pr
  related_specs:
    - SPEC-006
    - SPEC-008

value_link: "STAGE-002's celebration signal — classifies a resolved spin as none/small/big/jackpot data the UI maps to a celebration (the engine itself fires nothing)."

cost:
  sessions:
    - cycle: design
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      duration_minutes: 20
      recorded_at: 2026-06-22
      notes: "main-loop, not separately metered (AGENTS §4); design cycle"
    - cycle: build
      agent: claude-sonnet-4-6
      interface: claude-code
      tokens_total: 55739
      estimated_usd: 0.37
      duration_minutes: 2.6
      recorded_at: 2026-06-22
      notes: "Sonnet sub-agent build (Agent subagent_tokens=55739, 153s). estimated_usd ~= tokens x $6.6/M Sonnet blended, no cache discount (order-of-magnitude, AGENTS §4)."
    - cycle: verify
      agent: claude-sonnet-4-6
      interface: claude-code
      tokens_total: 59883
      estimated_usd: 0.40
      duration_minutes: 3.3
      recorded_at: 2026-06-22
      notes: "Sonnet sub-agent verify (Agent subagent_tokens=59883, 196s). estimated_usd ~= tokens x $6.6/M Sonnet blended, no cache discount (order-of-magnitude, AGENTS §4)."
    - cycle: ship
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      duration_minutes: 8
      recorded_at: 2026-06-23
      notes: "main-loop, not separately metered (AGENTS §4); ship cycle"
  totals:
    tokens_total: 115622
    estimated_usd: 0.77
    session_count: 4
---

# SPEC-010: Win-tier classification

## Context

The sixth STAGE-002 engine spec. After a spin is scored (SPEC-008), the engine
labels it with a **win tier** the UI maps to a celebration: `none` / `small` /
`big` / `jackpot`. The thresholds come from the project's success criteria and the
AGENTS glossary: small `>0 and <5× total bet`, big `≥5× total bet`, and **jackpot
= five Wolves on a payline** (which takes precedence over the amount-based tiers).
This is pure data; the engine fires no animation or audio (that is STAGE-004).

See `STAGE-002-slot-engine.md`, the **Game-Design Spec** in `brief.md` (win-tier
classification), the AGENTS glossary ("Win tier"), and `DEC-003` (a jackpot is a
five-Wolf payline). Uses SPEC-008's `LineWin` and SPEC-006's `WOLF` symbol.

## Goal

Classify a resolved spin into a `WinTier` from its total win, total bet, and line
wins: `jackpot` if any line is five Wolves; else `none` (win 0), `small`
(`0 < win < 5 × bet`), or `big` (`win ≥ 5 × bet`).

## Inputs

- **Files to read:** `src/engine/paylines.ts` (`LineWin`), `src/engine/strips.ts`
  (`SymbolId`/`WOLF`); `brief.md` Game-Design Spec (win-tier table); AGENTS §14
  glossary ("Win tier").
- **Related code paths:** `src/engine/`.

## Outputs

- **Files created:**
  - `src/engine/tiers.ts` — win-tier classification.
  - `src/engine/tiers.test.ts` — the Failing Tests below.
- **New exports (from `tiers.ts`):**
  - `export type WinTier = 'none' | 'small' | 'big' | 'jackpot';`
  - `export function isJackpot(lineWins: LineWin[]): boolean;` — true iff some line
    win has `symbol === 'WOLF'` and `count === 5`.
  - `export function classifyWin(totalWin: number, totalBet: number,
    lineWins: LineWin[]): WinTier;` — `jackpot` if `isJackpot`; else `none` if
    `totalWin <= 0`; else `small` if `totalWin < 5 × totalBet`; else `big`.
- **Database changes:** none.

## Acceptance Criteria

- [ ] `isJackpot` is true exactly when a line win is `WOLF` with `count === 5`
      (a 3- or 4-Wolf line, or any non-Wolf line, is not a jackpot).
- [ ] `classifyWin` returns `jackpot` whenever `isJackpot` — even though such a win
      is also large by amount, jackpot takes precedence.
- [ ] With no jackpot: `none` iff `totalWin <= 0`; `small` iff
      `0 < totalWin < 5 × totalBet`; `big` iff `totalWin >= 5 × totalBet` (the
      `5×` boundary is `big`).
- [ ] `tiers.ts` imports only engine modules (`paylines`, `strips`); no React/DOM/
      `src/ui`; no `Math.random()`.
- [ ] `just typecheck`, `just lint`, `just test`, `just build` all exit 0.

## Failing Tests

Written during **design**, BEFORE build. `lw(symbol, count, amount)` below is
shorthand for a `LineWin`-shaped object `{ line:'L1', symbol, count, multiplier:0,
amount }` (only `symbol`/`count` matter to `isJackpot`; `totalWin` is passed
explicitly).

- **`src/engine/tiers.test.ts`**
  - `"classifies no win as none"` — `classifyWin(0, 10, [])` === `'none'`.
  - `"classifies a sub-5x win as small"` — `classifyWin(10, 10, [lw('BEAR',3,10)])`
    === `'small'`; and `classifyWin(49, 10, [...])` === `'small'` (just under 50).
  - `"classifies a >=5x win as big"` — `classifyWin(50, 10, [lw('DEER',5,50)])`
    === `'big'` (boundary is big); `classifyWin(100, 10, [lw('BISON',4,100)])`
    === `'big'`.
  - `"classifies five Wolves as jackpot"` — `classifyWin(2000, 10,
    [lw('WOLF',5,2000)])` === `'jackpot'`.
  - `"jackpot takes precedence over big"` — a result with a five-Wolf line among
    others still classifies as `'jackpot'`, not `'big'`.
  - `"isJackpot detects a five-Wolf line"` — `isJackpot([lw('WOLF',5,2000)])` is
    `true`; `isJackpot([lw('WOLF',3,80)])`, `isJackpot([lw('BISON',5,400)])`, and
    `isJackpot([])` are all `false`.
  - `"a large non-Wolf win is big, not jackpot"` — `classifyWin(400, 10,
    [lw('BISON',5,400)])` === `'big'` (5 Bison is a big win, not the jackpot).

## Implementation Context

### Decisions that apply

- `DEC-003` — the jackpot is specifically five Wolves on a payline (the engine
  already produces such a `LineWin` via SPEC-008).
- `DEC-001` — pure engine; imports only `paylines` (LineWin) and `strips` (WOLF).

### Constraints that apply

- `engine-no-dom` (blocking, lint-enforced), `test-before-implementation`,
  `one-spec-per-pr`.

### Prior related work

- `SPEC-008` (shipped, PR #8) — `LineWin` (`{ line, symbol, count, multiplier,
  amount }`); a five-Wolf line is `{ symbol:'WOLF', count:5, ... }`.
- `SPEC-006` (shipped, PR #6) — `WOLF` is the jackpot symbol.

### Out of scope (for this spec specifically)

- The composed public `spin()` that calls this (SPEC-011).
- Any celebration, animation, audio, or UI mapping of the tier (STAGE-004).
- Configurable thresholds — the small/big cut is fixed at 5× total bet for v1.

## Notes for the Implementer

- Order matters: check `isJackpot` FIRST (it outranks the amount tiers), then
  `none` (`totalWin <= 0`), then `small` (`< 5 × totalBet`), else `big`.
- `isJackpot`: `lineWins.some(w => w.symbol === 'WOLF' && w.count === 5)`.
- Keep it pure; no mutation. `WinTier` is a plain string union the UI switches on.

---

## Build Completion

*Filled in at the end of the **build** cycle, before advancing to verify.*

- **Branch:** feat/spec-010-win-tier
- **PR (if applicable):**
- **All acceptance criteria met?** yes
- **New decisions emitted:**
  - none
- **Deviations from spec:**
  - none
- **Follow-up work identified:**
  - none (SPEC-011 already planned for the public engine interface)

### Build-phase reflection (3 questions, short answers)

1. **What was unclear in the spec that slowed you down?**
   — Nothing was unclear; the spec was unusually precise. The `lw()` helper
   shorthand, the exact precedence ordering, and the import constraints were
   all spelled out. No hunting was needed.

2. **Was there a constraint or decision that should have been listed but wasn't?**
   — No. `engine-no-dom`, `test-before-implementation`, and `one-spec-per-pr`
   were all listed and all apply. The import of `SymbolId` from `./strips` is
   technically not required (the string literal `'WOLF'` resolves against the
   `SymbolId` union already embedded in `LineWin`), so I kept `strips` out of the
   implementation import list and imported only from `./paylines`, which is the
   minimum needed.

3. **If you did this task again, what would you do differently?**
   — Nothing material. The spec was tight enough that the first cut passed all
   four gate steps. I'd make the same choice to omit the `strips` import since
   `LineWin.symbol` already carries the `SymbolId` type.

---

## Verify

*Reviewed 2026-06-22 — cold session, Sonnet sub-agent.*

**Verdict: ✅ APPROVED**

Gate: `just typecheck && just lint && just test && just build` — all exit 0 (63/63 tests pass).

Checked items:

- **Acceptance criteria** ✅ All five criteria met: `isJackpot` true only for WOLF count===5; `classifyWin` checks jackpot first; boundary 5× is `big`; `none` iff `totalWin <= 0`; `tiers.ts` imports only `paylines`, no DOM/React; all gate commands exit 0.
- **Correctness** ✅ Precedence order is `jackpot → none → small → big` (confirmed in source). `classifyWin(50, 10, ...)` returns `'big'` (5× boundary is inclusive-big). `none` is `totalWin <= 0`. `isJackpot` uses `w.symbol === 'WOLF' && w.count === 5` — exact match, no partial.
- **Tests not vacuous** ✅ The 49-vs-50 boundary is explicitly tested (49 → small, 50 → big). Jackpot precedence is tested with a mixed line list (`[lw('WOLF',5,2000), lw('BISON',4,50)]`). `isJackpot` with count 3 Wolf and count 5 non-Wolf are separately asserted false. The large-non-Wolf-is-big case (`classifyWin(400,10,[lw('BISON',5,400)])`) is asserted `'big'`. These tests would catch a `<` vs `<=` slip, a missing jackpot-precedence path, and isJackpot matching count 3 or 4.
- **Constraints** ✅ `engine-no-dom`: `tiers.ts` imports only `import type { LineWin } from './paylines'` — no React, no DOM, no `src/ui`. `deterministic-rng`: no `Math.random(` calls in `src/engine/` (confirmed by grep; the only occurrence in strips.ts is a comment). `test-before-implementation` and `one-spec-per-pr` satisfied structurally.
- **strips import omission** ✅ The builder omitted `import { WOLF } from './strips'` and instead uses the string literal `'WOLF'`. This is a harmless simplification: `LineWin.symbol` is typed `SymbolId` (from `./paylines` → `./strips` via its own chain), so the comparison `w.symbol === 'WOLF'` is well-typed. TypeScript enforces that `'WOLF'` is a valid `SymbolId` member at compile time (confirmed by typecheck exit 0). Not a stringly-typed bug.
- **Decision drift** ✅ `just decisions-audit --changed main` flagged DEC-001 and DEC-002 as governing `src/engine/tiers.ts`. The build is consistent with DEC-001 (pure engine, no DOM). DEC-002 (no bare Math.random) is honored. No new non-trivial choices required a new DEC.
- **Build reflection** ✅ Three questions answered, non-empty, honest. Notably flagged the `strips` import omission with clear reasoning.
- **Cost sessions** ✅ Design session present (null numeric, main-loop note — acceptable per AGENTS §4). Build session present (null tokens, orchestrator-to-fill note — correct, awaiting orchestrator). No blocking issues; orchestrator fills at ship.

---

## Reflection (Ship)

*Appended during the **ship** cycle.*

1. **What would I do differently next time?**
   — Nothing. The thresholds were unambiguous; the value was pinning the boundary
   (49→small, 50→big) and jackpot precedence as explicit tests, which the build
   matched first try.

2. **Does any template, constraint, or decision need updating?**
   — No. The build correctly dropped the unnecessary `./strips` import (LineWin
   already carries the SymbolId type) — a harmless simplification, not drift.

3. **Is there a follow-up spec I should write now before I forget?**
   — No new spec. SPEC-011 (public engine interface) is the last STAGE-002 spec and
   composes rng→balance→spin→paylines→tiers into `spin()`; already planned.
