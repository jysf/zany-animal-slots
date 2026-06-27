# SPEC-021 timeline

Architect appends as cycles are designed. Executors update status as
they go. Status markers: `[ ]` not started · `[~]` in progress · `[x]` complete · `[?]` blocked.

Cycle prompts live in `prompts/SPEC-021-<cycle>.md`.

## Instructions

- [x] **design** — completed 2026-06-27 (Opus): spec + 6 failing celebration tests + build prompt; seeds verified (276→big/55/3, 12345→none, 407947→jackpot/2000).
- [~] **build** — Sonnet sub-agent; make the celebration tests pass; gate green; local branch only.
- [ ] **verify** — Sonnet sub-agent; cold review against ACs + constraints.
- [ ] **ship** — orchestrator (Opus): squash-merge, cost totals, archive.
