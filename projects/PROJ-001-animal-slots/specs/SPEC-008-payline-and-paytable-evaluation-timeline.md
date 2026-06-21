# SPEC-008 timeline

Architect appends as cycles are designed. Executors update status as
they go. Status markers: `[ ]` not started · `[~]` in progress · `[x]` complete · `[?]` blocked.

Cycle prompts live in `prompts/SPEC-008-<cycle>.md`.

## Instructions

- [x] **design** — completed 2026-06-19 (Opus)
- [x] **build** — gate green (46/46); pushed, PR #8 opened 2026-06-20 (Sonnet sub-agent)
- [x] **verify** — ✅ APPROVED 2026-06-20 (Sonnet cold sub-agent); all gates green, 7 hand-checked expectations correct
- [~] **ship** — prompt: `prompts/SPEC-008-ship.md`; merging PR #8 (squash) 2026-06-20
