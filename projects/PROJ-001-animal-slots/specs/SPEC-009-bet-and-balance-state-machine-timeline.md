# SPEC-009 timeline

Architect appends as cycles are designed. Executors update status as
they go. Status markers: `[ ]` not started · `[~]` in progress · `[x]` complete · `[?]` blocked.

Cycle prompts live in `prompts/SPEC-009-<cycle>.md`.

## Instructions

- [x] **design** — completed 2026-06-21 (Opus)
- [x] **build** — gate green (53/53); pushed, PR #9 opened 2026-06-22 (Sonnet sub-agent)
- [~] **verify** — Sonnet verify running on PR #9
- [ ] **ship** — prompt: pending (waiting on verify)
