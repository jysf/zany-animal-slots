# SPEC-020 timeline

Architect appends as cycles are designed. Executors update status as
they go. Status markers: `[ ]` not started · `[~]` in progress · `[x]` complete · `[?]` blocked.

Cycle prompts live in `prompts/SPEC-020-<cycle>.md`.

## Instructions

- [x] **design** — completed 2026-06-27 (Opus)
- [x] **build** — gate green (142/142) + preview check (sheet opens w/ all tiers, Esc closes); pushed, PR #20 (Sonnet sub-agent)
- [~] **verify** — Sonnet verify running on PR #20
- [ ] **ship** — prompt: pending (waiting on verify)
