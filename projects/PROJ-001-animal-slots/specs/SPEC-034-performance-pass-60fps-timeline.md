# SPEC-034 timeline

Architect appends as cycles are designed. Executors update status as
they go. Status markers: `[ ]` not started · `[~]` in progress · `[x]` complete · `[?]` blocked.

Cycle prompts live in `prompts/SPEC-034-<cycle>.md`.

## Instructions

- [x] **design** — completed 2026-06-28 (Opus): compositor survey (every @keyframes animates transform/opacity only — DEC-004 holds by construction) + spec + failing tests (compositor-only sweep + load-bearing + will-change hint) + build prompt; last STAGE-005 spec.
- [x] **build** — gate green (252/252, +3 tests); compositor-only sweep guard + will-change hint + perf-notes.md; engine untouched; preview-measured (median 8.3ms / 0 long frames); pushed, PR #34 (Sonnet sub-agent).
- [x] **verify** — APPROVED 2026-06-28 (Sonnet sub-agent); 252/252 tests green (+3 perf contract), 0 engine changes, guard load-bearing confirmed, perf-notes honest; ✅ APPROVED.
- [ ] **ship** — orchestrator (Opus): squash-merge, cost totals, archive; then STOP at the STAGE-005 boundary.
