# SPEC-011 timeline

Architect appends as cycles are designed. Executors update status as
they go. Status markers: `[ ]` not started · `[~]` in progress · `[x]` complete · `[?]` blocked.

Cycle prompts live in `prompts/SPEC-011-<cycle>.md`.

## Instructions

- [x] **design** — completed 2026-06-23 (Opus)
- [x] **build** — gate green (72/72); pushed, PR #11 opened 2026-06-23 (Sonnet sub-agent)
- [~] **verify** — Sonnet verify running on PR #11
- [ ] **ship** — prompt: pending (waiting on verify)
