# SPEC-043 — BUILD prompt (fresh session — Sonnet)

> Run on **claude-sonnet-4-6** (AGENTS §8). LOCAL ONLY: branch + local commits.
> NO push, NO PR, NO `gh`, NO `just advance-cycle`. Test-only spec — no production change.

```
Cycle: build. You are NOT the architect. The spec file is your only context.

Read in order:
1. /AGENTS.md (§5 build flow, §8 models, §12 tests).
2. /projects/PROJ-002-machines-and-metrics/specs/SPEC-043-machine-parity-contract-test.md
   — the ENTIRE Acceptance Criteria, Failing Tests, and Notes. The Notes contain the
   COMPLETE drop-in test file. Use it verbatim.
3. /decisions/DEC-002 + /decisions/DEC-015 (read only).
4. Source (read only, DO NOT modify): /src/engine/index.ts (spin + WILD_AND_WHIMSICAL_MATH
   re-export), /src/machines/registry.ts (getActiveMachine), /src/engine/spin-parity.test.ts
   + /src/engine/index.test.ts (the pinned values this consolidates).

Before coding, branch and mark build [~] in the SPEC-043 timeline.

Branch: git checkout main && git pull --ff-only && git checkout -b feat/spec-043-machine-parity-contract

Implement EXACTLY the spec (drop-in in the Notes):
- CREATE src/machines/machine-parity.contract.test.ts — the frozen-seed contract test
  VERBATIM from the spec Notes: the registry-resolves-default case, one case per seed
  (407947→2000/jackpot/2990/WOLF×5; 12345→0/none/990/exact grid; 276→55/big/1045/3 lines;
  12→10/small/1000/1 line) with grid-shape checks, and the registry==explicit-default loop.
- NO production code change. NO other file touched (besides the spec/timeline bookkeeping).

CRITICAL — this is a CONTRACT test, the values are FROZEN:
- All expected values are already-established frozen-seed contract values. If ANY assertion
  FAILS, that means a real behavior regression accreted across SPEC-038–042 — STOP, set the
  timeline build marker [?] with a one-line reason, and do NOT change the expected value to
  make the test pass. (A green run confirms parity; a red run is a finding, not a fixture bug.)

HARD CONSTRAINTS (verify before finishing):
- `git diff main..HEAD -- src/engine/ src/ui/` MUST be EMPTY (only the new test under
  src/machines/ is added — no production change anywhere).
- No new dependency. No new DEC. Do not modify spin-parity.test.ts or any existing test.

Repo toolchain gotchas: the test is a plain .ts (NO JSX — keep it .ts, do not make it .tsx);
tsconfig include is ["src"] so it's typechecked; ESLint has no react-hooks plugin (N/A here).

Gate (all exit 0): just typecheck && just lint && just test && just build
Then confirm: just validate passes; the new contract test ran and passed; the
`git diff main..HEAD -- src/engine/ src/ui/` guard is EMPTY.

When done:
1. Fill "## Build Completion" (incl. 3 honest reflection answers).
2. Append a build cost session (cycle: build, agent: claude-sonnet-4-6, interface:
   claude-code, tokens_total: null + "orchestrator to fill tokens_total from
   subagent_tokens" note, duration/notes).
3. Mark build [~] in the timeline.
4. Commit locally with a message referencing SPEC-043.
DO NOT git push / open a PR / run gh / run just advance-cycle.
```
