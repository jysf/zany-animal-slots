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
- [ ] **build**
- [ ] **verify**
- [ ] **ship**
