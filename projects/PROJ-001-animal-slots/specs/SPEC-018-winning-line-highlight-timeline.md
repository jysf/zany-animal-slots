# SPEC-018 timeline

Architect appends as cycles are designed. Executors update status as
they go. Status markers: `[ ]` not started · `[~]` in progress · `[x]` complete · `[?]` blocked.

Cycle prompts live in `prompts/SPEC-018-<cycle>.md`.

## Instructions

- [x] **design** — completed 2026-06-26 (Opus)
- [x] **build** — gate green (125/125) + preview check (4-cell L1 win glows gold); pushed, PR #18 (Sonnet sub-agent)
- [~] **verify** — Sonnet verify running on PR #18
- [ ] **ship** — prompt: pending (waiting on verify)
