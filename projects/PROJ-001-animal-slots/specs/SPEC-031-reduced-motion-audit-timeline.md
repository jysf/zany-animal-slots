# SPEC-031 timeline

Architect appends as cycles are designed. Executors update status as
they go. Status markers: `[ ]` not started · `[~]` in progress · `[x]` complete · `[?]` blocked.

Cycle prompts live in `prompts/SPEC-031-<cycle>.md`.

## Instructions

- [x] **design** — completed 2026-06-28 (Opus): audit survey (all 5 @keyframes CSS already have reduced-motion; audio not motion-gated) + spec + failing tests (sweep guard + global net + audio-not-gated + App-under-reduced-motion) + build prompt.
- [~] **build** — Sonnet sub-agent; add the global net + sweep test; gate green; local branch only.
- [ ] **verify** — Sonnet sub-agent; cold review against ACs + constraints.
- [ ] **ship** — orchestrator (Opus): squash-merge, cost totals, archive.
