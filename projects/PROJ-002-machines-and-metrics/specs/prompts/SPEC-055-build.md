# SPEC-055 — BUILD prompt (fresh session — Sonnet)

> Run on **claude-sonnet-4-6** (AGENTS §8). LOCAL ONLY: branch + local commits.
> NO push, NO PR, NO `gh`, NO `just advance-cycle`. A reactive React-Context seam + two wiring
> edits — pure UI/presentation (DEC-001), localStorage-only + never-throws (DEC-005), no new dep.

```
Cycle: build. You are NOT the architect. The spec file is your only context.

Read in order:
1. /AGENTS.md (§5 build flow, §8 models, §12 tests).
2. /projects/PROJ-002-machines-and-metrics/specs/SPEC-055-reactive-stats-context-and-recording-seam.md
   — the ENTIRE Acceptance Criteria, Failing Tests, Implementation Context, and Notes. The Notes have
   COMPLETE drop-in code for the provider + both test files, and the two PRECISE seam edits for
   useSlotMachine.ts + the main.tsx nesting. Implement it VERBATIM.
3. /decisions/DEC-001, DEC-005, DEC-020 (read only).
4. Source (read to edit): src/ui/useSlotMachine.ts, src/main.tsx;
   (read only, to mirror) src/ui/machine/MachineProvider.tsx, src/ui/machine/MachineProvider.test.tsx,
   src/stats/sessionStats.ts, src/stats/statsStorage.ts.

Before coding, branch and mark build [~] in the SPEC-055 timeline.

Branch: git checkout main && git pull --ff-only && git checkout -b feat/spec-055-reactive-stats-context

Implement EXACTLY the spec (drop-ins in the Notes). New files:
- src/ui/stats/StatsProvider.tsx — StatsProvider + useStats + StatsContextValue. Mirror
  MachineProvider.tsx: no-op default context, useState(() => readStats()) hydration, useEffect persist
  on [stats], recordSpin/recordCashIn/resetStats via the pure reducers, useMemo value.
- src/ui/stats/StatsProvider.test.tsx — the 5 tests from Failing Tests (no-op-without-provider,
  hydrate, recordSpin+persist, recordCashIn, resetStats).
- src/ui/useSlotMachine.stats.test.tsx — the 3 integration tests (win 276, loss 12345, reset→cash-in).
Modified files:
- src/ui/useSlotMachine.ts — import { useStats }; const { recordSpin, recordCashIn } = useStats();
  add recordSpin({ totalWin: outcome.totalWin, bet, tier: outcome.tier }, machine.id) in the
  spin-resolve setTimeout (once per resolve); add recordCashIn() in reset(); add recordSpin /
  recordCashIn to the respective useCallback dep arrays.
- src/main.tsx — nest <StatsProvider> inside <MachineProvider> around <App/>.

HARD CONSTRAINTS (verify before finishing):
- `git diff main..HEAD -- src/engine/` MUST be EMPTY (DEC-001).
- No new dependency. No new DEC. No change to src/stats/** (SPEC-054 is shipped/frozen).
- useStats() default MUST be no-op so every existing provider-less useSlotMachine/App test stays green
  (do NOT wrap those tests in a provider).

Repo toolchain gotchas: ESLint has NO react-hooks plugin (do NOT add exhaustive-deps disables — just
list the stable callbacks in the dep arrays). NO @testing-library/user-event (use renderHook + act).
JSX test files are .tsx (both new test files are .tsx). tsconfig include is ["src"]. Pinned seeds were
MEASURED against the real engine at design: seed 276 ⇒ totalWin 40 / tier 'small' (a WIN); seed 12345
⇒ totalWin 0 / tier 'none'. Advance fake timers by SPIN_DURATION_MS inside act() so the resolve fires.

Gate (all exit 0): just typecheck && just lint && just test && just build
Then confirm: `just validate` and `just cost-audit` pass; the new tests ran and passed; the full
existing suite is still green (no provider-less test regressed); `git diff main..HEAD -- src/engine/`
is EMPTY.

When done:
1. Fill "## Build Completion" (incl. 3 honest reflection answers).
2. Append a build cost session (cycle: build, agent: claude-sonnet-4-6, interface: claude-code,
   tokens_total: null + "orchestrator to fill tokens_total from subagent_tokens" note,
   recorded_at: 2026-07-08, notes).
3. Mark build [~] in the timeline.
4. Commit locally with a message referencing SPEC-055.
DO NOT git push / open a PR / run gh / run just advance-cycle.
```
