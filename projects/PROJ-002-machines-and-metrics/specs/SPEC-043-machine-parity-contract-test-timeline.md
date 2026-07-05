# SPEC-043 timeline

Architect appends as cycles are designed. Executors update status as
they go. Status markers: `[ ]` not started · `[~]` in progress · `[x]` complete · `[?]` blocked.

Cycle prompts live in `prompts/SPEC-043-<cycle>.md`.

## Instructions

- [x] **design** — completed 2026-07-04 (Opus): the final STAGE-007 spec — the durable
      frozen-seed machine-parity CONTRACT test. One new `src/machines/machine-parity.contract.test.ts`
      runs the four seeds (407947/12345/276/12) through the registry-resolved default machine
      (`getActiveMachine()`) and pins the full outcome — grid shape, lineWins, totalWin, tier,
      AND balance (990/1000/1045/2990) + the exact seed-12345 grid — plus registry==explicit-default.
      Consolidates SPEC-039's spin-parity into the named durable guard. Test-only, no production
      change; complete drop-in in the spec Notes. All pinned values already established (frozen-seed
      contract + index.test.ts) — a red run is a real regression, not a fixture bug. Build prompt
      written. No new DEC.
- [x] **build** — completed 2026-07-05 (Sonnet, local only): added
      `src/machines/machine-parity.contract.test.ts` verbatim from the spec's drop-in — 6 new
      tests, all green (no regression). Full gate green (typecheck, lint, test [307 passed],
      build); `just validate` passed; `git diff main..HEAD -- src/engine/ src/ui/` confirmed
      EMPTY. No production change, no new dep, no new DEC.
- [x] **verify** — completed 2026-07-05 (Sonnet, cold review): PASS, 0 defects. Full gate green
      (typecheck, lint, test [307 passed/52 files, incl. the 6 new contract cases], build,
      validate); `git diff main..HEAD -- src/engine/ src/ui/` confirmed EMPTY (only the new
      `src/machines/machine-parity.contract.test.ts` added); contract confirmed real/non-vacuous
      — pinned scalars cross-check exactly against `spin-parity.test.ts` + `index.test.ts`, the
      `getActiveMachine().math === WILD_AND_WHIMSICAL_MATH` check is a genuine identity (not
      tautological — `wildAndWhimsical.ts` references the same object), no `.skip`/`.only`/xit; no
      new dep, no new DEC.
- [ ] **ship** — Opus (orchestrator): PR, CI-poll, squash-merge, cost totals, bookkeeping,
      archive; update STAGE-007 backlog line + count → STAGE-007 complete, then run Stage Ship.
