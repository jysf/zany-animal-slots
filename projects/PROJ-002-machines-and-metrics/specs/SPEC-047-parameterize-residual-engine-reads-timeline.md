# SPEC-047 timeline

Architect appends as cycles are designed. Executors update status as
they go. Status markers: `[ ]` not started · `[~]` in progress · `[x]` complete · `[?]` blocked.

Cycle prompts live in `prompts/SPEC-047-<cycle>.md`.

## Instructions

- [x] **design** — completed 2026-07-06 (Opus): parameterize the last two engine reads that
      ignored the active machine (deferred from STAGE-007). (1) `nextBet`/`prevBet`
      (`src/engine/balance.ts`) gain an optional `levels: readonly BetLevel[] = BET_LEVELS` and
      step through the SUPPLIED array — the hook passes `machine.math.betLevels`. (2) the paytable
      view (`src/ui/paytable.ts`): `paytableRows(math, symbolDisplay)` reads symbols/tiers/
      multipliers from the machine's `math`; a new `paylineCount(math)` replaces the
      `PAYLINE_COUNT = PAYLINES.length` const; `PaytableSheet` resolves the active machine once and
      passes `machine.math`. Same "optional param defaulting to the default" pattern as SPEC-039/040.
      NO behavior change for the default machine (its betLevels/paytable/paylines ARE today's
      constants) → **NO frozen-seed re-baseline**; enforced by an empty `git diff` guard on
      engine-math/machine/data files. Measured against the real engine via vite-node BEFORE writing
      the tests: BET_LEVELS [10,25,50], default paylines 20, paytable per DEC-016; the custom
      [10,50] levels array gives nextBet(10)->50 / prevBet(50)->10 (skips 25) — the adversarial-guard
      teeth. Complete drop-in code + failing tests (balance / paytable / useSlotMachine) in the spec.
      No new dep, no new DEC. Build prompt written.
- [~] **build** — (Sonnet) implemented the four source edits (balance.ts, paytable.ts,
      PaytableSheet.tsx, useSlotMachine.ts) and the three test-file updates (balance.test.ts,
      paytable.test.ts, useSlotMachine.test.tsx) verbatim per the spec's Notes, plus one type-only
      `as const` fix on the stub-math test literal to satisfy `MachineMath`'s tuple type. Ran both
      adversarial guard-mutations by hand and confirmed they fail the new tests as specified, then
      restored. Gate green: `just typecheck && just lint && just test && just build && just
      validate` — 54 test files, 326 tests passed. Hard guard (`git diff main..HEAD` on
      engine-math/machine/data files) confirmed EMPTY — no frozen-seed re-baseline needed. Branch
      `feat/spec-047-parameterize-residual-engine-reads`. Left `[~]` for the orchestrator to flip
      to `[x]`.
- [~] **verify** — (Sonnet, cold review) re-ran the full gate independently: `just typecheck &&
      just lint && just test && just build && just validate` all exit 0 — 54 test files, 326
      tests passed. Conformance confirmed by reading the changed source: `balance.ts`
      `nextBet`/`prevBet` take `levels: readonly BetLevel[] = BET_LEVELS`, index `levels` (not
      `BET_LEVELS`), clamp correctly, pure (no DOM); `paytable.ts` `paytableRows(math,
      symbolDisplay)` reads `math.symbols`/`math.symbolTier`/`math.paytable`, `paylineCount(math)`
      returns `math.paylines.length`, `PAYLINE_COUNT` const is gone, the value import of
      SYMBOLS/SYMBOL_TIER/PAYTABLE/PAYLINES is gone (type-only `MachineMath`/`Tier` import per
      DEC-001); `PaytableSheet.tsx` resolves `getActiveMachine()` once and passes `machine.math`
      to both functions, rules copy uses `paylineCount(machine.math)`; `useSlotMachine.ts` passes
      `machine.math.betLevels` to `nextBet`/`prevBet` at all three call sites, `machine` is in the
      `increaseBet`/`decreaseBet` useCallback deps. No `.skip`/`.only`/`xit` in the touched test
      files. Adversarial guard-mutations both had teeth: (a) reverting `nextBet`/`prevBet` to index
      `BET_LEVELS` instead of `levels` made `src/engine/balance.test.ts` fail 2/9 ("nextBet steps
      through a machine's custom bet levels": expected 50 got 25; "prevBet steps through a
      machine's custom bet levels": expected 10 got 25) and `src/ui/useSlotMachine.test.tsx` fail
      1/35 ("steps the bet through the active machine's bet levels": expected 50 got 25) — reverted
      via `git checkout --`, diff confirmed empty. (b) reverting `paytableRows`/`paylineCount` to
      read engine `PAYTABLE`/`SYMBOL_TIER`/`SYMBOLS`/`PAYLINES` made `src/ui/paytable.test.ts` fail
      1/7 ("paytableRows is machine-driven: multipliers and line-count come from the supplied
      math": expected `[9,9,9]` got `[10,50,250]`, the engine's real jackpot row) — reverted via
      `git checkout --`, diff confirmed empty. Hard-guard diffs both EMPTY: `git diff main..HEAD --
      src/engine/machine.ts src/engine/paylines.ts src/engine/spin.ts src/engine/strips.ts
      src/engine/tiers.ts src/machines/` and `git diff main..HEAD -- package.json
      package-lock.json`. Full gate re-run green after all reverts. Defect count: 0. Left `[~]` for
      the orchestrator to flip to `[x]`.
