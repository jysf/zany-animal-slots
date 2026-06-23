# SPEC-012 timeline

Architect appends as cycles are designed. Executors update status as
they go. Status markers: `[ ]` not started · `[~]` in progress · `[x]` complete · `[?]` blocked.

Cycle prompts live in `prompts/SPEC-012-<cycle>.md`.

## Instructions

- [x] **design** — completed 2026-06-23 (Opus)
- [x] **build** — gate green (78/78) + preview check (375px/desktop) passed; pushed, PR #12 (Sonnet sub-agent)
- [x] **verify** — ✅ APPROVED 2026-06-23 (Sonnet sub-agent); all gates pass, 78/78 tests, no drift
- [ ] **ship** — prompt: pending (waiting on verify)
