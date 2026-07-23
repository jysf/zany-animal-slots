# SPEC-074 timeline

Architect appends as cycles are designed. Executors update status as they go.
Status markers: `[ ]` not started · `[~]` in progress · `[x]` complete · `[?]` blocked.

## Instructions

- [x] **design** (Opus) — spec + failing tests. 2026-07-23.
- [ ] **build** (Sonnet) — pass grid/lineWins at the seam; make them required; hook test.
- [ ] **verify** (Sonnet) — cold review + guard-mutations.
- [ ] **ship** (Opus) — gate, PR, CI, squash-merge, archive, brag, cost bookkeeping.
