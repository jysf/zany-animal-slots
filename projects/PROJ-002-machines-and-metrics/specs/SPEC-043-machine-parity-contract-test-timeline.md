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
- [ ] **build** — Sonnet sub-agent (local only): add the contract test verbatim; keep it .ts;
      `git diff -- src/engine/ src/ui/` EMPTY (no production change); full gate green.
- [ ] **verify** — Sonnet sub-agent (cold review): full gate + confirm the contract asserts the
      frozen values (not vacuous), the diff is test-only, and the pinned values match the
      established contract; check nothing in production changed.
- [ ] **ship** — Opus (orchestrator): PR, CI-poll, squash-merge, cost totals, bookkeeping,
      archive; update STAGE-007 backlog line + count → STAGE-007 complete, then run Stage Ship.
