# SPEC-009 timeline

Architect appends as cycles are designed. Executors update status as
they go. Status markers: `[ ]` not started · `[~]` in progress · `[x]` complete · `[?]` blocked.

Cycle prompts live in `prompts/SPEC-009-<cycle>.md`.

## Instructions

- [x] **design** — completed 2026-06-21 (Opus)
- [x] **build** — gate green (53/53); pushed, PR #9 opened 2026-06-22 (Sonnet sub-agent)
- [x] **verify** — ✅ APPROVED 2026-06-22 (Sonnet cold review; all gates green, no punch list)
- [~] **ship** — prompt: `prompts/SPEC-009-ship.md`; merging PR #9 (squash) 2026-06-22
