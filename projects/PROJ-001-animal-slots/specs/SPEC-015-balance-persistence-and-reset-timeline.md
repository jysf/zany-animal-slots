# SPEC-015 timeline

Architect appends as cycles are designed. Executors update status as
they go. Status markers: `[ ]` not started · `[~]` in progress · `[x]` complete · `[?]` blocked.

Cycle prompts live in `prompts/SPEC-015-<cycle>.md`.

## Instructions

- [x] **design** — completed 2026-06-23 (Opus)
- [x] **build** — gate green (100/100) + preview check (spin→990 persists across reload, Reset→1000); pushed, PR #15 (Sonnet sub-agent)
- [~] **verify** — Sonnet verify running on PR #15
- [ ] **ship** — prompt: pending (waiting on verify)
