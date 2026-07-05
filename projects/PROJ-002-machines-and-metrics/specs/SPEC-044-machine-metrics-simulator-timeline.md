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
- [ ] **verify**
- [ ] **ship**
