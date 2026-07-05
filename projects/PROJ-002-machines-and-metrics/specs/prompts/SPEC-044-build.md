# SPEC-044 — BUILD prompt (fresh session — Sonnet)

> Run on **claude-sonnet-4-6** (AGENTS §8). LOCAL ONLY: branch + local commits.
> NO push, NO PR, NO `gh`, NO `just advance-cycle`. This is the first STAGE-008 spec —
> a dev/tuning TOOL: it MEASURES a machine, it does NOT change any game behavior.

```
Cycle: build. You are NOT the architect. The spec file is your only context.

Read in order:
1. /AGENTS.md (§5 build flow, §8 models, §12 tests).
2. /projects/PROJ-002-machines-and-metrics/specs/SPEC-044-machine-metrics-simulator.md
   — the ENTIRE Acceptance Criteria, Failing Tests, Implementation Context, and Notes.
   The Notes contain COMPLETE drop-in code for src/engine/metrics.ts, scripts/simulate.ts,
   the synthetic test machines, and the justfile recipe. Use them faithfully — the pinned
   W&W baseline was MEASURED with the exact metrics.ts algorithm in the Notes, so implement
   it verbatim or the baseline test will not reproduce.
3. /decisions/DEC-001 + /decisions/DEC-002 + /decisions/DEC-015 (read only).
4. Source (read only, DO NOT modify): /src/engine/index.ts (spin, MachineMath, WinTier,
   BetLevel), /src/engine/rng.ts (createRng), /src/engine/machine.ts (WILD_AND_WHIMSICAL_MATH),
   /src/machines/registry.ts (MACHINES). Precedent: /scripts/license-check.mjs + its .test.ts
   (a repo script with a colocated vitest test + a `just` recipe).

Before coding, branch and mark build [~] in the SPEC-044 timeline.

Branch: git checkout main && git pull --ff-only && git checkout -b feat/spec-044-machine-metrics-simulator

Implement EXACTLY the spec (drop-ins in the Notes):
- CREATE src/engine/metrics.ts — `MachineMetrics` type + `simulateMachine(math, opts)`,
  VERBATIM from the spec Notes (pure: imports only ./index + ./rng; DEC-001 engine-no-dom).
- CREATE src/engine/metrics.test.ts — the six tests from the Failing Tests section:
  determinism (deep-equal), seed-changes-outcome (not deep-equal), exact-RTP on the
  synthetic `allWin` machine (rtp 5, hitFreq 1, none 0, jackpots 0, maxWin 50), zero-RTP on
  `coldWin` (rtp 0, hits 0, none === spins), tier-counts-sum-to-spins, and the PINNED W&W
  baseline (spins 50000, seed 20260705, bet 10 →
  rtp≈0.1295, hitFreq≈0.0999, tierCounts {none:45003,small:4786,big:211,jackpot:0},
  jackpots 0, maxWin 500, totalWagered 500000). Build the synthetic machines with the
  spread-and-override snippet in the Notes.
- CREATE scripts/simulate.ts — the thin CLI VERBATIM from the Notes (run via vite-node;
  it's a .ts so no ESLint Node-globals block is needed — no-undef is off for TS).
- MODIFY justfile — add the `simulate *ARGS` recipe from the Notes.
- NO change to any src/engine/*.ts production file besides the two NEW metrics files. NO
  change to machine data. NO retune (that's SPEC-045).

CRITICAL — the baseline is a MEASURED pin, not an arbitrary one:
- The pinned baseline numbers come from running the exact metrics.ts algorithm in the Notes.
  If the baseline test FAILS, you deviated from the drop-in algorithm (seed derivation:
  `Math.floor(seedStream() * 0x1_0000_0000)`; spin path: `spin({seed, balance: bet, bet,
  machine})`; DEFAULT_SEED 0x5eed) — fix the code to match the Notes, do NOT edit the pin.

HARD CONSTRAINTS (verify before finishing):
- `git diff main..HEAD -- src/engine/index.ts src/engine/spin.ts src/engine/paylines.ts
  src/engine/strips.ts src/engine/balance.ts src/engine/tiers.ts src/machines/` MUST be
  EMPTY (no existing production/machine file changes — only the two new metrics files + CLI +
  justfile + spec/timeline bookkeeping).
- No new dependency (vite-node is already at node_modules/.bin/vite-node).
- No new DEC.

Repo toolchain gotchas: ESLint has NO react-hooks plugin; NO @testing-library/user-event;
JSX test files must be .tsx (these tests are plain .ts — no JSX, keep .ts). tsconfig include
is ["src"] so metrics.ts + metrics.test.ts are typechecked, but scripts/simulate.ts is NOT
(vite-node compiles it) — keep it correct anyway. vi.fn() N/A here. Do not import metrics
from src/engine/index.ts (keep it off the UI public interface).

Gate (all exit 0): just typecheck && just lint && just test && just build
Then confirm: `just simulate` prints a metrics report and exits 0; `just simulate
wild-and-whimsical` limits to that machine; `just validate` passes; the
`git diff` production guard above is EMPTY.

When done:
1. Fill "## Build Completion" (incl. 3 honest reflection answers).
2. Append a build cost session (cycle: build, agent: claude-sonnet-4-6, interface:
   claude-code, tokens_total: null + "orchestrator to fill tokens_total from
   subagent_tokens" note, duration/notes).
3. Mark build [~] in the timeline.
4. Commit locally with a message referencing SPEC-044.
DO NOT git push / open a PR / run gh / run just advance-cycle.
```
