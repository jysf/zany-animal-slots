# SPEC-017 timeline

Architect appends as cycles are designed. Executors update status as
they go. Status markers: `[ ]` not started · `[~]` in progress · `[x]` complete · `[?]` blocked.

Cycle prompts live in `prompts/SPEC-017-<cycle>.md`.

## Instructions

- [x] **design** — completed 2026-06-23 (Opus)
- [x] **build** — gate green (117/117) + preview check (auto loops, locks controls, toggle-off stops); pushed, PR #17 (Sonnet sub-agent)
- [~] **verify** — Sonnet verify running on PR #17
- [ ] **ship** — prompt: pending (waiting on verify)
