# SPEC-032 timeline

Architect appends as cycles are designed. Executors update status as
they go. Status markers: `[ ]` not started · `[~]` in progress · `[x]` complete · `[?]` blocked.

Cycle prompts live in `prompts/SPEC-032-<cycle>.md`.

## Instructions

- [x] **design** — completed 2026-06-28 (Opus): measured every contrast pair + 44px survey; found 1 failure (muted/frame 4.06) → fix --_raw-muted #b89a6e→#ccb084 (5.21); spec + failing tests (contrast guard + load-bearing + 44px guard) + build prompt.
- [x] **build** — gate green (245/245, +4 tests); muted fix applied (#ccb084), contrast + 44px guards added (load-bearing); engine untouched; preview-verified (lighter muted live); pushed, PR #32 (Sonnet sub-agent).
- [x] **verify** — APPROVED 2026-06-28 (Sonnet sub-agent): all 5 ACs met; 245/245 gate green; contrast 5.21:1 (#ccb084/frame) confirmed; load-bearing guard real (old 4.06 < 4.5); 6/6 touch targets ≥44px; engine + deps unchanged; minor Build Completion prose label error (text/surface ≈11.9, not 8.6) — tests correct, not a blocker.
- [ ] **ship** — orchestrator (Opus): squash-merge, cost totals, archive.
