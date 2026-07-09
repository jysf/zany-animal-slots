# SPEC-054 timeline

Architect appends as cycles are designed. Executors update status as
they go. Status markers: `[ ]` not started · `[~]` in progress · `[x]` complete · `[?]` blocked.

Cycle prompts live in `prompts/SPEC-054-<cycle>.md`.

## Instructions

- [x] **design** — completed 2026-07-08 (Opus): the STAGE-009 **infrastructure keystone** — a PURE,
      engine-independent session-stats model in `src/stats/sessionStats.ts` (the `SessionStats` record;
      immutable `emptyStats`/`recordSpin`/`recordCashIn` reducers; `deriveMetrics`) plus safe versioned
      `localStorage` in `src/stats/statsStorage.ts` (`STATS_KEY='zany:stats'`, `readStats`/`writeStats`,
      single JSON blob, never throws — mirrors `activeMachineStorage.ts`). **No React, no wiring, no UI**
      (those are SPEC-055/056/057). Authored **DEC-020** as part of design, pinning: a cash-in = a wallet
      Reset (counted, not cleared); AGGREGATE (not per-machine) metrics; `net = totalWon − totalWagered`;
      `winRate = winningSpins ÷ spins` (winning spin = `totalWin > 0`); `biggestWin = { amount, machineId,
      tier }` on a STRICT `>`; the winnings-over-time series = **cumulative net per spin, bounded to the
      last 200 (FIFO)**; persistence = one versioned blob degrading to `emptyStats()`. Pure spec ⇒ no
      RTP/strip simulation; Failing Tests carry deterministic pinned values (e.g. spins {bet:10,win:0}
      then {bet:10,win:50} ⇒ net 30, series [-10, 30], winRate 0.5). DEC-001 clean (`src/stats` reads
      engine TYPES only; `git diff src/engine/` must stay EMPTY); DEC-005 clean (localStorage, guarded).
      Complete drop-in code for both modules + all failing tests in the spec's Notes. Four
      adversarial guard-mutations specified for verify (biggestWin `>`→`>=`, drop FIFO trim, drop
      spins===0 guard, drop version check). No new dependency. **[M]** Build prompt written.

- [x] **build** — completed 2026-07-08 (Sonnet, claude-code, local-only, branch
      `feat/spec-054-session-stats-model`): both drop-in modules transcribed verbatim; 13 new tests
      (7 sessionStats + 6 statsStorage), all passing; full gate (typecheck/lint/test/build/
      validate/cost-audit) green; `git diff main..HEAD -- src/engine/` empty; no new dependency.
      One deviation (FIFO test's `bet:1` swapped for a valid `BetLevel` — see Build Completion).

- [ ] **verify** — not started.

- [ ] **ship** — not started.
