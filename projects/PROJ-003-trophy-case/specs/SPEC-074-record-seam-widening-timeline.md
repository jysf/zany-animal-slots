# SPEC-074 timeline

Architect appends as cycles are designed. Executors update status as they go.
Status markers: `[ ]` not started · `[~]` in progress · `[x]` complete · `[?]` blocked.

## Instructions

- [x] **design** (Opus) — spec + failing tests. 2026-07-23.
- [x] **build** (Sonnet) — seam wired, fields required, 17 call sites fixed, hook test added. 2026-07-23.
- [x] **verify** (Sonnet) — APPROVED, 0 defects; call-site-revert mutation proved the hook test has teeth. 2026-07-23.
- [x] **ship** (Opus) — gate, PR, CI 7/7, squash-merge, archive, brag. 2026-07-23.
