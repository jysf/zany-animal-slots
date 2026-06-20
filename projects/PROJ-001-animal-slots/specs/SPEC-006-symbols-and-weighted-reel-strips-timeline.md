# SPEC-006 timeline

Architect appends as cycles are designed. Executors update status as
they go. Status markers: `[ ]` not started · `[~]` in progress · `[x]` complete · `[?]` blocked.

Cycle prompts live in `prompts/SPEC-006-<cycle>.md`.

## Instructions

- [x] **design** — completed 2026-06-19 (Opus)
- [x] **build** — gate green (28/28); pushed, PR #6 opened 2026-06-19 (Sonnet sub-agent)
- [x] **verify** — ✅ APPROVED 2026-06-19 (Sonnet sub-agent); all gates green, data correctness confirmed vs DEC-006/DEC-011
- [~] **ship** — prompt: `prompts/SPEC-006-ship.md`; merging PR #6 (squash) 2026-06-19
