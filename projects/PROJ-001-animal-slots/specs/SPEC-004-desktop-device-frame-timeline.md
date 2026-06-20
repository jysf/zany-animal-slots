# SPEC-004 timeline

Architect appends as cycles are designed. Executors update status as
they go. Status markers: `[ ]` not started · `[~]` in progress · `[x]` complete · `[?]` blocked.

Cycle prompts live in `prompts/SPEC-004-<cycle>.md`.

## Instructions

- [x] **design** — completed 2026-06-19
- [~] **build** — prompt: `prompts/SPEC-004-build.md` (run on Sonnet) — built + gate green (13/13) + visual check passed (375px / 1280px) 2026-06-19; push/PR pending
- [x] **verify** — APPROVED 2026-06-19; all gates EXIT 0 (13/13 tests); no AC failures; no constraint/decision violations
- [ ] **ship** — prompt: pending (waiting on verify)
