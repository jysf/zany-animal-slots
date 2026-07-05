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
- [ ] **build** — Sonnet sub-agent (local only): apply the drop-in tiers.ts + the index.ts
      classifyWin one-liner + tiers.test.ts updates; keep spin-parity green + pinned fixtures
      identical; only tiers.ts/index.ts change among engine source.
- [ ] **verify** — Sonnet sub-agent (cold review): full gate + AC-by-AC + frozen-seed tier
      parity + variant-machine-guard-is-real + no-hard-coded-WOLF/5 + engine-diff-scope +
      DEC-001 checks.
- [ ] **ship** — Opus (orchestrator): PR, CI-poll, squash-merge, cost totals, bookkeeping,
      archive; update STAGE-007 backlog line + count.
