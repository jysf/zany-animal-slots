# SPEC-013 timeline

Architect appends as cycles are designed. Executors update status as
they go. Status markers: `[ ]` not started · `[~]` in progress · `[x]` complete · `[?]` blocked.

Cycle prompts live in `prompts/SPEC-013-<cycle>.md`.

## Instructions

- [x] **design** — completed 2026-06-23 (Opus)
- [x] **build** — gate green (86/86) + preview check (clicked Spin: 1000→990, fresh grid); pushed, PR #13 (Sonnet sub-agent)
- [~] **verify** — Sonnet verify running on PR #13
- [ ] **ship** — prompt: pending (waiting on verify)
