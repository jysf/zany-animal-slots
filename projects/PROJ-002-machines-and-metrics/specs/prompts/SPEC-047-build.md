# SPEC-047 — BUILD prompt (fresh session — Sonnet)

> Run on **claude-sonnet-4-6** (AGENTS §8). LOCAL ONLY: branch + local commits.
> NO push, NO PR, NO `gh`, NO `just advance-cycle`. A pure SEAM parameterization — it
> changes NO game behavior for the default machine, so there is NO frozen-seed re-baseline.

```
Cycle: build. You are NOT the architect. The spec file is your only context.

Read in order:
1. /AGENTS.md (§5 build flow, §8 models, §12 tests).
2. /projects/PROJ-002-machines-and-metrics/specs/SPEC-047-parameterize-residual-engine-reads.md
   — the ENTIRE Acceptance Criteria, Failing Tests, Implementation Context, and Notes. The
   Notes contain the COMPLETE drop-in code for balance.ts (nextBet/prevBet), paytable.ts
   (paytableRows + paylineCount), PaytableSheet.tsx, and useSlotMachine.ts. Implement them
   VERBATIM.
3. /decisions/DEC-001, DEC-011, DEC-015 (read only).
4. Source (read to edit): src/engine/balance.ts, src/ui/paytable.ts, src/ui/PaytableSheet.tsx,
   src/ui/useSlotMachine.ts; (read only) src/engine/machine.ts, src/engine/index.ts,
   src/machines/wildAndWhimsical.ts.

Before coding, branch and mark build [~] in the SPEC-047 timeline.

Branch: git checkout main && git pull --ff-only && git checkout -b feat/spec-047-parameterize-residual-engine-reads

Implement EXACTLY the spec (drop-ins in the Notes):
- EDIT src/engine/balance.ts — nextBet/prevBet gain `levels: readonly BetLevel[] = BET_LEVELS`
  and index `levels` instead of `BET_LEVELS` (drop-in in Notes). Nothing else in the file changes.
- EDIT src/ui/paytable.ts — `paytableRows(math, symbolDisplay)` reads symbols/tiers/multipliers
  from `math`; ADD `paylineCount(math)`; REMOVE the `PAYLINE_COUNT` const and the
  `{ SYMBOLS, SYMBOL_TIER, PAYTABLE, PAYLINES }` value import (switch to a type-only import of
  `MachineMath` + `Tier`).
- EDIT src/ui/PaytableSheet.tsx — import `paylineCount`; `const machine = getActiveMachine();`
  once; `paytableRows(machine.math, machine.presentation.symbolDisplay)`; replace `{PAYLINE_COUNT}`
  with `{paylineCount(machine.math)}`.
- EDIT src/ui/useSlotMachine.ts — pass `machine.math.betLevels` to nextBet/prevBet at all three
  call sites (canIncreaseBet, canDecreaseBet, increaseBet/decreaseBet); add `machine` to the two
  useCallback deps.

Then the failing tests (make them pass):
- src/engine/balance.test.ts — ADD the two custom-levels tests (keep the existing default-arg
  tests — they prove the BET_LEVELS default still holds).
- src/ui/paytable.test.ts — UPDATE every `paytableRows(DEFAULT_DISPLAY)` call to
  `paytableRows(DEFAULT_MATH, DEFAULT_DISPLAY)` with `DEFAULT_MATH = WILD_AND_WHIMSICAL.math`;
  import `paylineCount`; ADD the `paylineCount(DEFAULT_MATH)===20` test and the stub-math
  data-driven test ([9,9,9] multipliers + paylineCount===3).
- src/ui/useSlotMachine.test.tsx — ADD the "steps the bet through the active machine's bet
  levels" test (betLevels [10,50] → increaseBet steps 10→50 skipping 25).

HARD CONSTRAINTS (verify before finishing):
- `git diff main..HEAD -- src/engine/machine.ts src/engine/paylines.ts src/engine/spin.ts
  src/engine/strips.ts src/engine/tiers.ts src/machines/` MUST be EMPTY (no data / engine-math
  change — no frozen-seed re-baseline).
- No new dependency. No new DEC. NO retune of any number.

Repo toolchain gotchas: ESLint has NO react-hooks plugin (no exhaustive-deps disables).
NO @testing-library/user-event — use renderHook/act. JSX test files stay .tsx. tsconfig
include is ["src"].

Gate (all exit 0): just typecheck && just lint && just test && just build
Then confirm: `just validate` passes; the new/updated tests ran and passed; the
`git diff main..HEAD` engine-math/machine guard above is EMPTY.

When done:
1. Fill "## Build Completion" (incl. 3 honest reflection answers).
2. Append a build cost session (cycle: build, agent: claude-sonnet-4-6, interface:
   claude-code, tokens_total: null + "orchestrator to fill tokens_total from
   subagent_tokens" note, duration/notes).
3. Mark build [~] in the timeline.
4. Commit locally with a message referencing SPEC-047.
DO NOT git push / open a PR / run gh / run just advance-cycle.
```
