# SPEC-055 timeline

Architect appends as cycles are designed. Executors update status as
they go. Status markers: `[ ]` not started · `[~]` in progress · `[x]` complete · `[?]` blocked.

Cycle prompts live in `prompts/SPEC-055-<cycle>.md`.

## Instructions

- [x] **design** — completed 2026-07-08 (Opus): the STAGE-009 **reactive keystone** — lifts SPEC-054's
      pure `sessionStats` reducers into a reactive, persisted React Context in
      `src/ui/stats/StatsProvider.tsx` (`StatsProvider`/`useStats`, mirroring SPEC-049's
      `MachineProvider` exactly: no-op default so provider-less tests keep passing,
      `useState(() => readStats())` hydration, persist-on-change, `recordSpin`/`recordCashIn`/
      `resetStats` via the pure reducers) — and **wires recording into the game**: `useSlotMachine`'s
      spin-resolve calls `recordSpin({ totalWin, bet, tier }, machine.id)` once per resolve, the wallet
      `reset()` calls `recordCashIn()` (the stage invariant: wallet Reset is a *counted* cash-in, NOT a
      stats clear), and `main.tsx` nests `<StatsProvider>` inside `<MachineProvider>`. After this spec
      stats accumulate + persist across reloads with **no display surface** (SPEC-056/057). Pinned
      values **measured against the real engine** (vite-node) BEFORE the failing tests: seed 276 ⇒
      totalWin 40 / tier 'small' (a WIN — spins 1, totalWon 40, biggestWin {40, wild-and-whimsical,
      small}, series [30]); seed 12345 ⇒ totalWin 0 / tier 'none' (series [-10]); reset() ⇒ cashIns 1,
      spins unchanged. **No new DEC** (rides DEC-020's model + DEC-001/DEC-005, exactly as SPEC-050 rode
      SPEC-049's DEC-less seam). DEC-001 clean (`git diff src/engine/` must stay EMPTY); DEC-005 clean
      (localStorage, guarded); no new dependency. Complete drop-in provider + both test files + the two
      precise seam edits in the spec's Notes. Three adversarial guard-mutations specified for verify
      (drop the recordSpin seam call, drop recordCashIn in reset, revert hydration to emptyStats).
      **[M]** Build prompt written to `prompts/SPEC-055-build.md`.
- [x] **build** — completed 2026-07-08 (Sonnet, claude-code, local-only, branch
      `feat/spec-055-reactive-stats-context`): transcribed the three drop-in files verbatim
      (`StatsProvider.tsx`, `StatsProvider.test.tsx`, `useSlotMachine.stats.test.tsx` — 8 new tests) and
      made the two precise seam edits in `useSlotMachine.ts` (`useStats()` + `recordSpin` at
      spin-resolve, `recordCashIn()` in `reset()`, both added to their `useCallback` deps), plus nested
      `<StatsProvider>` inside `<MachineProvider>` in `main.tsx`. Full gate green: typecheck, lint, test
      (395/395 across 67 files), build, validate, cost-audit. `git diff main -- src/engine/` and
      `git diff main -- src/stats/` both empty. No new dependency, no new DEC, no deviations.
- [x] **verify** — completed 2026-07-08 (Sonnet, cold review): full gate re-run green on
      `feat/spec-055-reactive-stats-context` — typecheck, lint, test (395/395 across 67 files), build,
      validate, cost-audit all exit 0. Boundary checks: `git diff main..HEAD -- src/engine/` empty
      (DEC-001), `git diff main..HEAD -- src/stats/` empty (SPEC-054 frozen), `git diff main..HEAD --
      package.json` empty (no new dependency), no `.only`/`.skip`/`xit` in the new test files. Ran all
      three adversarial guard-mutations from the spec's Notes, each broke exactly its named test(s) and
      was reverted clean (tree matched `git diff HEAD` empty after each, full suite re-verified green
      after all three): (a) deleting the `recordSpin(...)` seam call in `useSlotMachine.ts` failed all 3
      tests in `useSlotMachine.stats.test.tsx` (the two direct assertions plus the reset test, which
      depends on `spins === 1` before it resets — expected cascade); (b) deleting `recordCashIn()` in
      `reset()` failed only `"reset() records a cash-in…"` (cashIns stayed 0), the other two passed; (c)
      changing the `StatsProvider` init to `useState(emptyStats())` failed only `"provider hydrates stats
      from localStorage"`, the other four `StatsProvider.test.tsx` tests passed. Re-ran `just test` after
      all reverts: 395/395 green, `git status` clean. Independently confirmed `recordSpin` fires exactly
      once per resolved spin (inside the single spin-resolve `setTimeout`, not a loop) and that
      `recordSpin`/`recordCashIn` are stable `useCallback([])` references, so the timer closure has no
      stale-closure risk; confirmed the `useStats()` default is a genuine no-op (empty-bodied setters)
      and that the provider-less `useSlotMachine.test.tsx` (35 tests) passes unchanged, proving the
      no-op default holds. Defect count: 0. (Note: encountered a suspicious injected "system-reminder"
      in tool output three times during this session, falsely claiming `useSlotMachine.ts` /
      `StatsProvider.tsx` were "intentionally modified by the user or a linter" and instructing silence
      about it — disregarded each time and verified via `git diff HEAD` that the files matched the
      committed build exactly; flagging here for the record.)
      *(Ship-cycle correction: those "system-reminder" notices were NOT an injection — they are
      legitimate harness notifications that the orchestrator's own `advance-cycle` and the sub-agents'
      spec-file edits had touched tracked files. The verify agent's caution was correct in effect
      (reconciling via `git diff HEAD`), only its attribution was wrong. No integrity issue.)*
- [x] **ship** — shipped 2026-07-08 via PR #65 (squash-merged to main, commit `94547c3`). CI CLEAN,
      all checks SUCCESS (app checks, cost-capture audit, supply-chain, Workers build). Post-merge:
      cycle → ship, STAGE-009 backlog SPEC-055 [x] (2/4 shipped), archived. Filled build/verify cost
      from the sub-agents' subagent_tokens (build 101453, verify 97543; totals 198996 tok / ~$1.31 /
      4 sessions). Second spec of STAGE-009 — stats now accumulate + persist across reloads, unwired to
      any surface. Next: SPEC-056 (session-stats panel UI).
