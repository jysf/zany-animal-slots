# SPEC-022 timeline

Architect appends as cycles are designed. Executors update status as
they go. Status markers: `[ ]` not started · `[~]` in progress · `[x]` complete · `[?]` blocked.

Cycle prompts live in `prompts/SPEC-022-<cycle>.md`.

## Instructions

- [x] **design** — completed 2026-06-27 (Opus): spec + DEC-012 (JS count-up tween) + prefersReducedMotion helper + useCountUp hook design + failing tests (3 helper + 7 hook + 1 Status) + build prompt.
- [~] **build** — Sonnet sub-agent; make the count-up tests pass; gate green; local branch only.
- [ ] **verify** — Sonnet sub-agent; cold review against ACs + constraints + DEC-012.
- [ ] **ship** — orchestrator (Opus): squash-merge, cost totals, archive.
