# SPEC-019 timeline

Architect appends as cycles are designed. Executors update status as
they go. Status markers: `[ ]` not started · `[~]` in progress · `[x]` complete · `[?]` blocked.

Cycle prompts live in `prompts/SPEC-019-<cycle>.md`.

## Instructions

- [x] **design** — completed 2026-06-26 (Opus)
- [x] **build** — gate green (133/133) + preview check (WIN +5 badge + WIN readout on a live win); pushed, PR #19 (Sonnet sub-agent)
- [~] **verify** — Sonnet verify running on PR #19
- [ ] **ship** — prompt: pending (waiting on verify)
