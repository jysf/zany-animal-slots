# SPEC-054 — BUILD prompt (fresh session — Sonnet)

> Run on **claude-sonnet-4-6** (AGENTS §8). LOCAL ONLY: branch + local commits.
> NO push, NO PR, NO `gh`, NO `just advance-cycle`. A PURE model + storage spec — two new leaf
> modules under `src/stats/`, no wiring, no UI, no engine change.

```
Cycle: build. You are NOT the architect. The spec file is your only context.

Read in order:
1. /AGENTS.md (§5 build flow, §8 models, §12 tests).
2. /projects/PROJ-002-machines-and-metrics/specs/SPEC-054-session-stats-model-and-safe-storage.md
   — the ENTIRE Acceptance Criteria, Failing Tests, Implementation Context, and Notes. The Notes
   contain COMPLETE drop-in code for BOTH modules. Implement it VERBATIM.
3. /decisions/DEC-020 (the model semantics), DEC-001, DEC-005 (read only).
4. Source (read only, for types + pattern): src/engine/index.ts (SpinResult/WinTier/BetLevel),
   src/machines/activeMachineStorage.ts, src/ui/storage.ts.

Before coding, branch and mark build [~] in the SPEC-054 timeline.

Branch: git checkout main && git pull --ff-only && git checkout -b feat/spec-054-session-stats-model

Implement EXACTLY the spec (drop-ins in the Notes). New files (nothing modified):
- src/stats/sessionStats.ts — STATS_VERSION, SERIES_CAP, SessionStats, BiggestWin, SessionMetrics,
  SpinRecordInput, emptyStats(), recordSpin(stats, input, machineId), recordCashIn(stats),
  deriveMetrics(stats). All reducers IMMUTABLE (spread, never mutate input). biggestWin updates on a
  STRICT `>`; series appends cumulative net (totalWon − totalWagered) and FIFO-caps via .slice(-SERIES_CAP);
  deriveMetrics guards spins === 0.
- src/stats/statsStorage.ts — STATS_KEY='zany:stats', readStats(), writeStats(); single versioned JSON
  blob; absent/unparseable/wrong-version ⇒ emptyStats(); guarded try/catch, never throws (mirror
  activeMachineStorage.ts).
- src/stats/sessionStats.test.ts, src/stats/statsStorage.test.ts — make every test in the spec's
  Failing Tests section pass (plain .ts — no JSX). The storage test does localStorage.clear() in
  beforeEach/afterEach; the never-throw case uses vi.spyOn(Storage.prototype, 'setItem').

HARD CONSTRAINTS (verify before finishing):
- `git diff main..HEAD -- src/engine/` MUST be EMPTY (DEC-001 — src/stats only reads engine TYPES).
- No new dependency. No new DEC (DEC-020 already authored at design). No React/JSX, no wiring into
  useSlotMachine or the wallet Reset, no UI — those are SPEC-055/056/057. Do NOT modify any file
  outside src/stats/.

Repo toolchain gotchas: tsconfig include is ["src"]. jsdom provides localStorage (clear it per-test).
vitest globals (describe/it/expect/vi/beforeEach) are configured — no import needed if the existing
tests don't import them (match the repo's existing test style). Import engine types with
`import type { SpinResult, WinTier, BetLevel } from '../engine'`.

Gate (all exit 0): just typecheck && just lint && just test && just build
Then confirm: `just validate` and `just cost-audit` pass; the new tests ran and passed; the
`git diff main..HEAD -- src/engine/` guard is EMPTY.

When done:
1. Fill "## Build Completion" (incl. 3 honest reflection answers).
2. Append a build cost session (cycle: build, agent: claude-sonnet-4-6, interface: claude-code,
   tokens_total: null + "orchestrator to fill tokens_total from subagent_tokens" note,
   recorded_at: <today>, notes).
3. Mark build [~] in the timeline.
4. Commit locally with a message referencing SPEC-054.
DO NOT git push / open a PR / run gh / run just advance-cycle.
```
