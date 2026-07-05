# SPEC-042 timeline

Architect appends as cycles are designed. Executors update status as
they go. Status markers: `[ ]` not started · `[~]` in progress · `[x]` complete · `[?]` blocked.

Cycle prompts live in `prompts/SPEC-042-<cycle>.md`.

## Instructions

- [x] **design** — completed 2026-07-04 (Opus): closes the config-driven loop. New
      `src/machines/registry.ts` = the single source of the active machine (default only:
      MACHINES / DEFAULT_MACHINE_ID / getMachine / getActiveMachine). `useSlotMachine` resolves
      `opts.machine ?? getActiveMachine()`, threads `machine.math` into `spin`, inits balance/bet
      + reset from the machine, and returns the active machine. Game + PaytableSheet source
      symbolDisplay from `getActiveMachine()` (replacing SPEC-041's direct WILD_AND_WHIMSICAL
      import). Engine untouched (spin already took `machine` in SPEC-039). End-to-end parity:
      existing pinned-seed/balance hook tests stay green + a supplied-machine guard (variant
      startingBalance 5000 → initial balance 5000) proves it's machine-driven; preview play-check
      at ship. Bet-level stepping + paytable math-source left on engine constants (STAGE-008
      follow-ups, noted). Build prompt written. No new DEC.
- [x] **build** — completed 2026-07-04 (Sonnet, local only): created `src/machines/registry.ts`
      (MACHINES/DEFAULT_MACHINE_ID/getMachine/getActiveMachine) + `registry.test.ts` (3 cases);
      threaded `opts.machine ?? getActiveMachine()` through `useSlotMachine` (balance/bet init,
      reset, spin's `engineSpin` call, exposed `machine` on the result); swapped `Game.tsx` /
      `PaytableSheet.tsx` off the direct `WILD_AND_WHIMSICAL` import onto `getActiveMachine()`;
      added the supplied-machine guard test + a default-machine frozen-seed re-confirmation.
      Full gate green (301 tests passed); `just validate` green; `src/engine` diff empty; no
      `WILD_AND_WHIMSICAL` in the three target files; every pre-existing pinned-seed/balance
      assertion untouched (pure additions in the test diff). No new dependency, no new DEC.
- [x] **verify** — completed 2026-07-04 (Sonnet sub-agent, cold review): PASS, 0 defects. Full
      gate green (301 tests incl. registry.test.ts + useSlotMachine.test.tsx); `just validate`
      green; useSlotMachine.test.tsx diff confirmed additive-only (28 insertions, 0 deletions);
      supplied-machine guard adversarially confirmed real (fails with `expected 1000 to be 5000`
      when the hook's balance init is reverted to module `STARTING_BALANCE`, restored clean
      after); all ACs PASS; `src/engine` diff empty; no `WILD_AND_WHIMSICAL` in the three target
      files; no selector/persistence/2nd machine/new dependency/App.tsx change; bet-stepping +
      paytable math source still on engine constants as scoped; engine-boundary.test.ts passed;
      no re-render/reset churn risk (getActiveMachine() is a stable module-const reference).
- [x] **ship** — completed 2026-07-04 (Opus): squash-merged PR #52 (CI CLEAN — all 7 checks
      SUCCESS). **Preview play check** (UI spec): started the dev server, spun — balance
      initialized to 1000 from machine.math.startingBalance, a win of 10 registered, balance
      settled to 1000 (1000−10+10), no console errors — the machine-threaded hook drives the game
      live. Cost totals (200069 tok / $1.32 / 5 sessions), ship reflection, archived. Fifth
      STAGE-007 spec shipped (5/6) — config-driven loop closed. Only SPEC-043 (parity contract
      test) remains before Stage Ship.
