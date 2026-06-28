# SPEC-033 timeline

Architect appends as cycles are designed. Executors update status as
they go. Status markers: `[ ]` not started · `[~]` in progress · `[x]` complete · `[?]` blocked.

Cycle prompts live in `prompts/SPEC-033-<cycle>.md`.

## Instructions

- [x] **design** — completed 2026-06-28 (Opus): colorblind audit (symbols already shape-distinct, amount numeric; gap = tier not stated in words) + spec + failing tests (tier word + data-tier + Game thread + win-tier-token CSS) + build prompt.
- [~] **build** — Sonnet sub-agent; tier word + redundant tier border + Game thread; gate green; local branch only.
- [ ] **verify** — Sonnet sub-agent; cold review against ACs + constraints.
- [ ] **ship** — orchestrator (Opus): squash-merge, cost totals, archive.
