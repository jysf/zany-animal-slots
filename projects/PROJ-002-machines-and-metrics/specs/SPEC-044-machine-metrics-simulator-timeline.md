# SPEC-044 timeline

Architect appends as cycles are designed. Executors update status as
they go. Status markers: `[ ]` not started · `[~]` in progress · `[x]` complete · `[?]` blocked.

Cycle prompts live in `prompts/SPEC-044-<cycle>.md`.

## Instructions

- [x] **design** — completed 2026-07-05 (Opus): the FIRST STAGE-008 spec — a seeded
      Monte-Carlo **machine-metrics simulator** (RTP / hit-frequency / win-tier
      distribution) so the retune is measured, not guessed (the brief's fun-proxy
      metric; answers the user's "can it be tuned?"). New `src/engine/metrics.ts`
      (`simulateMachine(math, opts)`, pure — DEC-001/002/015), `src/engine/metrics.test.ts`
      (determinism + exact-RTP on synthetic all-win/cold machines + a **pinned W&W
      baseline**), a thin `scripts/simulate.ts` CLI via `vite-node`, and a `just simulate`
      recipe. Baseline MEASURED during design (vite-node, exact algorithm): today's W&W is
      RTP **0.1295** / hitFreq **0.0999** / jackpotRate **0** @ 50k spins seed 20260705 —
      the quantified "too hard to win". Complete drop-in code + exact pins in the spec
      Notes; synthetic cases validated (all-win rtp=5, cold rtp=0). No production game
      behavior change; no new dep (vite-node bundled). No new DEC. Build prompt written.
- [x] **build** — completed 2026-07-05 (Sonnet sub-agent, local only): implemented
      `src/engine/metrics.ts` (`simulateMachine`) + `src/engine/metrics.test.ts` (6 tests)
      + `scripts/simulate.ts` verbatim from the spec's Notes drop-in code, plus the
      justfile `simulate` recipe. Pinned W&W baseline (50 000 spins, seed 20260705, bet 10)
      reproduced exactly on the first run — rtp 0.1295 / hitFreq 0.0999 / tierCounts
      {none:45003, small:4786, big:211, jackpot:0} / jackpots 0 / maxWin 500 — no deviation
      from the drop-in algorithm needed. Full gate green (typecheck/lint/test 313
      passed/build); `just simulate` and `just simulate wild-and-whimsical` both exit 0;
      `just validate` passes. Production-file diff guard (engine/machine files vs main)
      confirmed empty; no new dependency; no new DEC. Branch
      feat/spec-044-machine-metrics-simulator.
- [x] **verify** — completed 2026-07-05 (Sonnet sub-agent, COLD review, local only): full
      cold gate green — `just typecheck && just lint && just test && just build && just
      validate` all exit 0 (313 tests / 53 files passed, incl. the 6 `metrics.test.ts`
      cases; `just validate` confirms all 44 specs have valid front-matter). Spec
      conformance confirmed line-for-line: seed derivation
      `Math.floor(seedStream() * 0x1_0000_0000)`, spin path `spin({seed, balance: bet,
      bet, machine})`, `DEFAULT_SEED` `0x5eed`, `DEFAULT_SPINS` `100_000`, full
      `MachineMetrics` field set present, `metrics.ts` imports only `./index` + `./rng`
      (no DOM/React), not re-exported from `src/engine/index.ts`. No `.skip`/`.only`/`xit`
      in the test file; synthetic exact-RTP tests genuinely assert (allWin rtp=5/
      hitFreq=1/none=0/maxWin=50; coldWin rtp=0/hits=0/none===spins); pinned baseline
      asserts the exact measured values. **Adversarial guard-mutation (has teeth) —
      both mutations made the pinned baseline test FAIL as required, both reverted
      clean:** (a) `REEL_STRIP[0]` `'DEER'` → `'WOLF'` in `src/engine/strips.ts` moved
      rtp to 0.12541 (test failed as expected); revert left `git diff -- strips.ts`
      empty. (b) `PAYTABLE.low[2]` `5` → `50` in `src/engine/paylines.ts` moved rtp to
      0.30054 (test failed as expected); revert left `git diff -- paylines.ts` empty.
      The baseline genuinely guards the real outcome-drivers. No behavior/dep drift:
      `git diff main..HEAD` on all production engine/machine files is EMPTY;
      package.json/package-lock.json unchanged. `just simulate` and `just simulate
      wild-and-whimsical` both exit 0 and print reports. **Verdict: PASS, 0 defects.**
- [ ] **ship**
