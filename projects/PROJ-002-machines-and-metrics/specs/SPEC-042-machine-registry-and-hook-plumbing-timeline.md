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
- [ ] **build** — Sonnet sub-agent (local only): create the registry + tests; thread the machine
      through the hook + init/reset; swap the two UI sources to getActiveMachine(); keep every
      pinned-seed/balance expectation identical; src/engine diff empty; no WILD_AND_WHIMSICAL in
      the three files.
- [ ] **verify** — Sonnet sub-agent (cold review): full gate + AC-by-AC + frozen-seed/balance
      parity + supplied-machine-guard-is-real + engine-untouched + no-selector/persistence +
      no-direct-WILD import checks.
- [ ] **ship** — Opus (orchestrator): PR, CI-poll, squash-merge, **preview play check** (UI
      spec), cost totals, bookkeeping, archive; update STAGE-007 backlog line + count.
