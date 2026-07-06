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
