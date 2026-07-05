# SPEC-046 timeline

Architect appends as cycles are designed. Executors update status as
they go. Status markers: `[ ]` not started · `[~]` in progress · `[x]` complete · `[?]` blocked.

Cycle prompts live in `prompts/SPEC-046-<cycle>.md`.

## Instructions

- [x] **design** — completed 2026-07-05 (Opus): the BEHAVIOR-CHANGING centerpiece — retune
      Wild & Whimsical **in place** to a measured generous target. Three DATA levers (DEC-015,
      no engine logic): reweighted symbols (sum 42, WOLF 1→3 for a reachable jackpot) with
      `strips` GENERATED from the weights via SPEC-045's `buildStrip`; a richer paytable; and
      **paylines 5 → 20** (the structural lever for hit-frequency — the brief's "more ways to
      win"). Measured RTP **93.8%** / hit **34.4%** / jackpot ~1-in-25k / big-band 4.5% (SPEC-044
      simulator, 50k spins) vs. the old 13% / 10% / never. **Re-baselines** the frozen-seed
      contract + metrics baseline + 8 test files to the tuned outcomes (a changed fixture is
      INTENDED) — every value computed via vite-node against the real buildStrip + engine and
      pinned in the spec. Emits DEC-016 (supersedes DEC-003/011 specifics for W&W). Complete
      drop-in code + all pins in the spec; build prompt written. **[L]**
- [x] **build** — completed 2026-07-05 (Sonnet): applied the pinned DATA (REEL_WEIGHTS sum 42,
      generated REEL_STRIP via buildStrip, 20 PAYLINES, retuned PAYTABLE), wrote DEC-016,
      re-baselined the 8 named test files to the spec's exact pins + 4 unlisted fixtures the
      retune also moved (spin.test.ts, PaylineMap.test.tsx, paytable.test.ts,
      PaytableSheet.test.tsx). Full gate green (54 files / 321 tests); simulator confirms
      RTP 93.79% / hit 34.43%. No engine-logic file body changed (spin.ts/tiers.ts/rng.ts
      untouched; evaluatePaylines body unchanged). Local commit only — no push/PR.
- [x] **verify** — completed 2026-07-05 (Sonnet, COLD review): **PASS, 0 defects.** Cold gate
      green: `just typecheck && just lint && just test && just build && just validate &&
      just cost-audit` — 54 files / 321 tests, no `.skip`/`.only`/`xit`. Confirmed only DATA
      changed: `git diff main..HEAD -- src/engine/spin.ts src/engine/tiers.ts src/engine/rng.ts`
      and `src/machines/machine.ts` are EMPTY; in `paylines.ts` the `lineSymbols` and
      `evaluatePaylines` function bodies are byte-identical to main (diffed the extracted
      function-body regions directly) — only comments, the `LineId` type, `PAYLINES`, and
      `PAYTABLE` changed. Simulator confirms the target: seed 20260705/50000 spins → RTP
      93.79% / hit 34.43% (≈ spec's 93.8%/34.4%); a second seed (12345/50000 spins) →
      RTP 94.65% / hit 34.66%, within the generous 0.90–0.98 band, proving the tune isn't a
      single-seed artifact. Independently reproduced the pinned contract via vite-node against
      the REAL engine (`spin()` + `getActiveMachine()`, bypassing the test suite entirely,
      balance 1000/bet 10): seed 68357 → jackpot, totalWin 2500, balance 3490, a WOLF×5 line
      (L11); seed 6 → big, totalWin 70, balance 1060; seed 1 → small, totalWin 10, balance 1000;
      seed 2 → loss, totalWin 0, balance 990 — all four match exactly. Confirmed the generated
      `REEL_STRIP` (`buildStrip(SYMBOLS, REEL_WEIGHTS)`) is exactly the spec's pinned 42-symbol
      strip (byte-for-byte array comparison via vite-node) and weights sum to 42. Read all 12
      re-baselined files (8 pinned + spin.test.ts, PaylineMap.test.tsx, paytable.test.ts,
      PaytableSheet.test.tsx) end-to-end — every assertion reflects the tuned machine (20
      paylines, DEC-016 paytable, 42-length strip/indices 40-41, retuned representative seeds);
      no stale 5-payline or old-paytable assertion found (the one `[0.5, 2, 5]` hit in
      metrics.test.ts is a machine-independent synthetic override the spec explicitly says to
      leave). **Adversarial guard-mutation**: reverted `REEL_WEIGHTS.WOLF` 3→1 in
      `src/engine/strips.ts` — both target tests FAILED as required: the metrics baseline
      (`rtp` moved from 0.9379 to 0.98966, well outside tolerance) and the machine-parity
      jackpot case (seed 68357 `totalWin` became 10, tier no longer jackpot; seeds 6 and 2 also
      failed as a side effect of the strip regenerating differently) — confirms the re-baselined
      contract pins the TUNED machine. Reverted the mutation; `git diff -- src/engine/strips.ts`
      is empty and both tests pass again post-revert. `decisions/DEC-016-fun-retune-wild-and-whimsical.md`
      exists, front-matter validated by `just validate`, and thoroughly records the three levers,
      the measured target (RTP 93.8%/hit 34.4%/jackpot ~1-in-25k), and the DEC-003/DEC-011
      supersession (mechanics unchanged, only specifics superseded for W&W). Working-tree diff
      at verify start was exactly the expected orchestrator cycle-flip (build→verify) in the
      spec front-matter — included in this verify commit.
- [ ] **ship**
