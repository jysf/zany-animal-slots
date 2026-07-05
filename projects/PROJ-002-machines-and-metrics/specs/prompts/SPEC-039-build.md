# SPEC-039 — BUILD prompt (fresh session — Sonnet)

> Run on **claude-sonnet-4-6** (AGENTS §8). LOCAL ONLY: branch + local commits.
> NO push, NO PR, NO `gh`, NO `just advance-cycle`. This is the RISKIEST spec of the
> stage (first engine signature change) — parity is the gate.

```
Cycle: build. You are NOT the architect. The spec file is your only context.

Read in order:
1. /AGENTS.md (§5 build flow, §8 models, §11 typed-results, §12 tests, §14 pure-data).
2. /projects/PROJ-002-machines-and-metrics/specs/SPEC-039-parameterize-resolvegrid-and-evaluatepaylines.md
   — the ENTIRE Implementation Context, Acceptance Criteria, Failing Tests, and Notes.
   The Notes contain COMPLETE drop-in code for spin.ts, paylines.ts, index.ts + the exact
   test call-site updates. Use it as-is.
3. /decisions/DEC-015 (config-driven machine model) and /decisions/DEC-002 (deterministic
   RNG — the frozen seeds are the parity contract). Read only.
4. Source: /src/engine/spin.ts, /src/engine/paylines.ts, /src/engine/index.ts,
   /src/engine/machine.ts (WILD_AND_WHIMSICAL_MATH — SPEC-038), /src/engine/tiers.ts
   (READ ONLY — must stay byte-identical), and the three engine test files you will update
   (/src/engine/spin.test.ts, /src/engine/paylines.test.ts, /src/engine/index.test.ts).

Before coding, branch and mark build [~] in the SPEC-039 timeline. If ANY pinned
grid/stop/totalWin/tier value would have to change to make a test pass, STOP and set the
build marker [?] with a one-line reason — a changed fixture means a behavior change, which
this spec forbids.

Branch: git checkout main && git pull --ff-only && git checkout -b feat/spec-039-parameterize-grid-payline

Implement EXACTLY the spec (drop-in code is in the spec Notes):
- src/engine/spin.ts — resolveStops(rng, strips) loses the `= STRIPS` default;
  resolveGrid(rng, math: MachineMath) reads math.strips. `import type { MachineMath } from
  './machine'`. Remove the now-unused STRIPS import.
- src/engine/paylines.ts — evaluatePaylines(grid, totalBet, math: MachineMath) reads
  math.paylines / math.symbolTier / math.paytable. `import type { MachineMath } from
  './machine'`. Remove the now-unused SYMBOL_TIER *value* import (keep type Tier, type
  SymbolId). LEAVE the PAYLINES / PAYTABLE consts defined + exported (the machine references
  them; index.ts re-exports them) — evaluatePaylines just stops reading them.
- src/engine/index.ts — spin({ seed, balance, bet, machine = WILD_AND_WHIMSICAL_MATH })
  threads machine into resolveGrid + evaluatePaylines. classifyWin call UNCHANGED. Import
  WILD_AND_WHIMSICAL_MATH (value) + MachineMath (type) from './machine'.
- src/engine/spin-parity.test.ts (NEW) — the frozen-seed guard: 407947→2000/jackpot/5-WOLF,
  12345→0/none, 276→55/big/3 lines, 12→10/small; and for each seed, spin(default) deep-equals
  spin(explicit WILD_AND_WHIMSICAL_MATH). (.ts, no JSX.)
- src/engine/spin.test.ts / paylines.test.ts — update call sites to pass the machine slice
  (WILD_AND_WHIMSICAL_MATH or .strips). DO NOT change any expected value.
- src/engine/index.test.ts — ADD a jackpot case: spin({seed:407947,balance:1000,bet:10}) →
  totalWin 2000, tier 'jackpot', balance 2990. Leave existing cases as-is.

HARD CONSTRAINTS (verify before finishing):
- Type-only import: use `import type { MachineMath }` in spin.ts AND paylines.ts (a
  value import would create a runtime module cycle paylines↔machine). 
- `git diff main..HEAD -- src/engine/tiers.ts` MUST be EMPTY (classifyWin untouched).
- No STRIPS/PAYLINES/PAYTABLE/SYMBOL_TIER read inside resolveGrid/resolveStops/
  evaluatePaylines bodies — the machine slice is the only runtime source.
- No UI/hook change (useSlotMachine still calls spin({seed,balance,bet}) — the default
  machine keeps it working). No new dependency. No new DEC.
- The engine-no-dom boundary stays green (src/test/engine-boundary.test.ts).
- PARITY IS THE GATE: every pre-existing pinned value (stops [34,10,16,28,17] for seed
  12345; the seed-12345 grid; 276→55/3 lines; 12→10; the paylines.test expected amounts)
  stays byte-identical. If one must change, you've broken parity — STOP.

Repo toolchain gotchas: ESLint has NO react-hooks plugin (no exhaustive-deps disables); NO
@testing-library/user-event; vi.fn() factories use no named params; JSX test files must be
.tsx (all engine tests are .ts, no JSX — correct); tsconfig include is ["src"].

Gate (all exit 0): just typecheck && just lint && just test && just build
Then confirm: just validate passes; the src/engine/tiers.ts diff is EMPTY.

When done:
1. Fill "## Build Completion" in the spec (incl. 3 honest reflection answers).
2. Append a build cost session (cycle: build, agent: claude-sonnet-4-6, interface:
   claude-code, tokens_total: null + "orchestrator to fill tokens_total from
   subagent_tokens" note, duration/notes).
3. Mark build [~] in the timeline.
4. Commit locally with a message referencing SPEC-039.
DO NOT git push / open a PR / run gh / run just advance-cycle.
```
