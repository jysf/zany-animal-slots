# SPEC-038 timeline

Architect appends as cycles are designed. Executors update status as
they go. Status markers: `[ ]` not started · `[~]` in progress · `[x]` complete · `[?]` blocked.

Cycle prompts live in `prompts/SPEC-038-<cycle>.md`.

## Instructions

- [x] **design** — completed 2026-07-04 (Opus): the keystone of STAGE-007. Pinned the
      `Machine` type — a `math` slice (`MachineMath` in `src/engine/machine.ts`: symbols,
      tiers, weights, reelCount/rows, strips, paylines, paytable, jackpot `{symbol,count}`,
      tiers `{bigMultiple}`, betLevels, defaultBet, startingBalance) the engine consumes,
      and a `presentation` slice (`MachinePresentation` in `src/machines/types.ts`:
      `symbolDisplay` now; theme+audio deferred to SPEC-041) the UI consumes. Extracted
      today's game as the default machine "Wild & Whimsical" (`src/machines/
      wildAndWhimsical.ts`) whose data *references* the current engine constants
      byte-identically — NO engine signature changes (only new `machine.ts` + additive
      `index.ts` re-exports). Wrote the data-parity failing test
      (`src/machines/wildAndWhimsical.parity.test.ts`, 8 `it` blocks) + the build prompt.
      Emitted **DEC-015** (config-driven machine model — extends DEC-001, generalizes
      DEC-006/011/003). Migration note: machine references constants here (zero
      transcription risk); ownership inverts in SPEC-039..042 under frozen-seed parity.
- [~] **build** — Sonnet sub-agent (local only): create the four machine files + additive
      index.ts re-exports per the spec drop-in code; make the parity test green; keep the
      src/engine function files byte-unchanged and the engine-no-dom boundary intact.
- [x] **verify** — Sonnet sub-agent (cold review): PASS, 0 defects. Full gate green
      (typecheck/lint/286 tests incl. 8 parity/build/validate); all AC boxes confirmed
      file:line against spec; parity test is a real guard (8 `it` blocks map 1:1 to spec's
      Failing Tests, no `.only`/`.skip`/vacuous asserts); engine function-file diff
      (strips/paylines/tiers/spin/balance/rng) byte-empty, only new machine.ts + 2 additive
      index.ts re-exports; engine-no-dom intact (machine.ts imports only ./strips,
      ./paylines, ./balance; engine-boundary.test.ts passes; no import cycle — ui/reels/
      symbols.ts does not import machines); no new dependency; no UI/hook/component
      changes; out-of-scope list clean.
- [ ] **ship** — Opus (orchestrator): PR, CI-poll, squash-merge, cost totals, bookkeeping,
      archive; update STAGE-007 backlog line + count.
