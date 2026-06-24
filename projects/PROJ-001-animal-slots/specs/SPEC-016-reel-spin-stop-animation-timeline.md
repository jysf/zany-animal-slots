# SPEC-016 timeline

Architect appends as cycles are designed. Executors update status as
they go. Status markers: `[ ]` not started · `[~]` in progress · `[x]` complete · `[?]` blocked.

Cycle prompts live in `prompts/SPEC-016-<cycle>.md`.

## Instructions

- [x] **design** — completed 2026-06-23 (Opus)
- [x] **build** — gate green (108/108) + preview check (mid-spin lockout + delayed reveal, eval-confirmed); pushed, PR #16 (Sonnet sub-agent)
- [~] **verify** — Sonnet verify running on PR #16
- [ ] **ship** — prompt: pending (waiting on verify)
