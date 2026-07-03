# SPEC-035 timeline

Architect appends as cycles are designed. Executors update status as
they go. Status markers: `[ ]` not started · `[~]` in progress · `[x]` complete · `[?]` blocked.

Cycle prompts live in `prompts/SPEC-035-<cycle>.md`.

## Instructions

- [x] **design** — completed 2026-07-03 (Opus): CSP tuned against the built dist/index.html (external module script → script-src 'self'; inline style attrs → style-src 'unsafe-inline') + spec + failing contract tests + build prompt. First [REPO] spec.
- [~] **build** — Sonnet sub-agent; public/_headers + contract test; gate green; local branch only.
- [ ] **verify** — Sonnet sub-agent; cold review against ACs + constraints.
- [ ] **ship** — orchestrator (Opus): squash-merge, cost totals, archive.
