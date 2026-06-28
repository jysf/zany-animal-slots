# SPEC-034 timeline

Architect appends as cycles are designed. Executors update status as
they go. Status markers: `[ ]` not started · `[~]` in progress · `[x]` complete · `[?]` blocked.

Cycle prompts live in `prompts/SPEC-034-<cycle>.md`.

## Instructions

- [x] **design** — completed 2026-06-28 (Opus): compositor survey (every @keyframes animates transform/opacity only — DEC-004 holds by construction) + spec + failing tests (compositor-only sweep + load-bearing + will-change hint) + build prompt; last STAGE-005 spec.
- [~] **build** — Sonnet sub-agent; perf sweep guard + .reel--spinning will-change + perf-notes.md; gate green; local branch only.
- [ ] **verify** — Sonnet sub-agent; cold review against ACs + constraints.
- [ ] **ship** — orchestrator (Opus): squash-merge, cost totals, archive; then STOP at the STAGE-005 boundary.
