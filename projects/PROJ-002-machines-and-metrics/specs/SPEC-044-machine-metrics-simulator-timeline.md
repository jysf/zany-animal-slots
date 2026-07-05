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
- [ ] **build**
- [ ] **verify**
- [ ] **ship**
