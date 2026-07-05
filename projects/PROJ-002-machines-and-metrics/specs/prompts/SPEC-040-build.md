# SPEC-040 — BUILD prompt (fresh session — Sonnet)

> Run on **claude-sonnet-4-6** (AGENTS §8). LOCAL ONLY: branch + local commits.
> NO push, NO PR, NO `gh`, NO `just advance-cycle`. Parity is the gate.

```
Cycle: build. You are NOT the architect. The spec file is your only context.

Read in order:
1. /AGENTS.md (§5 build flow, §8 models, §11 typed-results, §12 tests, §14 pure-data).
2. /projects/PROJ-002-machines-and-metrics/specs/SPEC-040-parameterize-win-tier-and-jackpot-rule.md
   — the ENTIRE Implementation Context, Acceptance Criteria, Failing Tests, Notes. The
   Notes contain COMPLETE drop-in code for tiers.ts + the index.ts one-liner + the
   tiers.test.ts updates. Use it verbatim.
3. /decisions/DEC-015 + /decisions/DEC-003 (read only).
4. Source: /src/engine/tiers.ts, /src/engine/index.ts, /src/engine/machine.ts
   (WILD_AND_WHIMSICAL_MATH — has .jackpot {symbol:'WOLF',count:5} and .tiers
   {bigMultiple:5}), /src/engine/tiers.test.ts, /src/engine/spin-parity.test.ts (the
   SPEC-039 frozen-seed guard — must stay green).

Before coding, branch and mark build [~] in the SPEC-040 timeline. If any pinned
tiers.test.ts expected value would have to change to pass, STOP and set build [?] with a
one-line reason (a changed fixture = a behavior regression).

Branch: git checkout main && git pull --ff-only && git checkout -b feat/spec-040-parameterize-tier-jackpot

Implement EXACTLY the spec (drop-in code is in the spec Notes):
- src/engine/tiers.ts — isJackpot(lineWins, jackpot: JackpotRule) uses jackpot.symbol/
  jackpot.count; classifyWin(totalWin, totalBet, lineWins, math: MachineMath) uses
  isJackpot(lineWins, math.jackpot) + math.tiers.bigMultiple. `import type { MachineMath,
  JackpotRule } from './machine'`. NO hard-coded 'WOLF' / 5 / 5× left.
- src/engine/index.ts — change ONLY the classifyWin call to
  `classifyWin(totalWin, bet, lineWins, machine)` (machine already in scope from SPEC-039).
  Nothing else in index.ts changes.
- src/engine/tiers.test.ts — add `import { WILD_AND_WHIMSICAL_MATH } from './machine'`;
  append `, WILD_AND_WHIMSICAL_MATH` to every classifyWin(...) call and
  `, WILD_AND_WHIMSICAL_MATH.jackpot` to every isJackpot(...) call (expected values
  UNCHANGED); add the new describe('reads the rule from the machine (SPEC-040)') block
  with the two variant-machine tests from the spec Failing Tests (reuse the existing `lw`
  helper).

HARD CONSTRAINTS (verify before finishing):
- Use `import type { MachineMath, JackpotRule }` (type-only) in tiers.ts.
- `git diff main..HEAD -- src/engine/spin.ts src/engine/paylines.ts src/engine/strips.ts
  src/engine/balance.ts src/engine/rng.ts` MUST be EMPTY — only tiers.ts + index.ts change
  among engine source.
- `grep -nE "WOLF|5 \* totalBet" src/engine/tiers.ts` finds NOTHING (rule fully from math).
- spin-parity.test.ts (SPEC-039) stays GREEN unchanged — it is the end-to-end tier-parity
  guard (407947→jackpot, 12345→none, 276→big, 12→small).
- No UI/hook change; no new dependency; no new DEC. engine-no-dom boundary stays green.
- PARITY: every pre-existing tiers.test.ts expected value stays byte-identical.

Repo toolchain gotchas: ESLint has NO react-hooks plugin (no exhaustive-deps disables); NO
@testing-library/user-event; vi.fn() factories use no named params; JSX test files must be
.tsx (tiers.test.ts is .ts, no JSX — correct); tsconfig include is ["src"].

Gate (all exit 0): just typecheck && just lint && just test && just build
Then confirm: just validate passes; the 5-file engine diff guard above is EMPTY; the grep
finds nothing.

When done:
1. Fill "## Build Completion" (incl. 3 honest reflection answers).
2. Append a build cost session (cycle: build, agent: claude-sonnet-4-6, interface:
   claude-code, tokens_total: null + "orchestrator to fill tokens_total from
   subagent_tokens" note, duration/notes).
3. Mark build [~] in the timeline.
4. Commit locally with a message referencing SPEC-040.
DO NOT git push / open a PR / run gh / run just advance-cycle.
```
