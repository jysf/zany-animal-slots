# SPEC-040 timeline

Architect appends as cycles are designed. Executors update status as
they go. Status markers: `[ ]` not started · `[~]` in progress · `[x]` complete · `[?]` blocked.

Cycle prompts live in `prompts/SPEC-040-<cycle>.md`.

## Instructions

- [x] **design** — completed 2026-07-04 (Opus): third engine-parameterization spec, completes
      the transition. classifyWin/isJackpot now read the jackpot rule (`math.jackpot`) + big
      boundary (`math.tiers.bigMultiple`) instead of hard-coded WOLF×5 / 5×; spin() threads the
      machine into classifyWin (machine already in scope from SPEC-039). Behavior-preserving for
      the default machine (guarded by SPEC-039's spin-parity.test.ts tiers, kept green) + a new
      variant-machine guard proving the rule is genuinely data-driven (jackpot {BISON,5} +
      bigMultiple 3 classify differently). tiers.test.ts call sites updated (outcomes identical).
      Type-only MachineMath/JackpotRule import. Build prompt written. No new DEC (DEC-015 covers).
- [x] **build** — completed 2026-07-04 (Sonnet, local-only): applied the drop-in tiers.ts +
      the index.ts classifyWin one-liner + tiers.test.ts updates verbatim from the spec Notes.
      Full gate green (typecheck/lint/test [294 passed]/build); just validate green; 5-file
      engine diff guard empty; WOLF/5-boundary grep guard empty; spin-parity.test.ts green
      unchanged; all pre-existing tiers.test.ts values byte-identical. Branch
      feat/spec-040-parameterize-tier-jackpot, committed locally (no push/PR).
- [x] **verify** — completed 2026-07-04 (Sonnet sub-agent, cold review): PASS, 0 defects. Full
      gate green (typecheck/lint/test [294 passed, tiers.test.ts 12 + spin-parity.test.ts 5
      both green]/build/validate). Confirmed genuinely machine-driven via an adversarial mutation
      test (temporarily hard-coded isJackpot/classifyWin behind the same signature — both new
      SPEC-040 variant assertions failed as expected, proving the test block is not vacuous).
      spin-parity.test.ts diff vs main is empty; tiers.test.ts diff shows only the import +
      appended machine args + new describe block, zero changed expected values. 5-file engine
      freeze diff (spin/paylines/strips/balance/rng) empty; index.ts diff is only the
      classifyWin one-liner. Grep guard clean; type-only import confirmed; no dep changes;
      useSlotMachine.ts untouched (still `engineSpin({ seed, balance, bet })`).
- [ ] **ship** — Opus (orchestrator): PR, CI-poll, squash-merge, cost totals, bookkeeping,
      archive; update STAGE-007 backlog line + count.
