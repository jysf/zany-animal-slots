# SPEC-022 timeline

Architect appends as cycles are designed. Executors update status as
they go. Status markers: `[ ]` not started · `[~]` in progress · `[x]` complete · `[?]` blocked.

Cycle prompts live in `prompts/SPEC-022-<cycle>.md`.

## Instructions

- [x] **design** — completed 2026-06-27 (Opus): spec + DEC-012 (JS count-up tween) + prefersReducedMotion helper + useCountUp hook design + failing tests (3 helper + 7 hook + 1 Status) + build prompt.
- [x] **build** — gate green (160/160, +12 tests); engine untouched, no CSS/deps; preview-verified (small win ticked 870→875); pushed, PR #22 (Sonnet sub-agent).
- [x] **verify** — ✅ APPROVED 2026-06-27 (Sonnet cold review); 160/160 tests, all ACs met, engine untouched, DEC-012 honored, no CSS/deps added, no dangling eslint-disable.
- [ ] **ship** — orchestrator (Opus): squash-merge, cost totals, archive.
