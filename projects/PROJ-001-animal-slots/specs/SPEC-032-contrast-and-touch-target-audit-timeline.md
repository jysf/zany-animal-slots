# SPEC-032 timeline

Architect appends as cycles are designed. Executors update status as
they go. Status markers: `[ ]` not started · `[~]` in progress · `[x]` complete · `[?]` blocked.

Cycle prompts live in `prompts/SPEC-032-<cycle>.md`.

## Instructions

- [x] **design** — completed 2026-06-28 (Opus): measured every contrast pair + 44px survey; found 1 failure (muted/frame 4.06) → fix --_raw-muted #b89a6e→#ccb084 (5.21); spec + failing tests (contrast guard + load-bearing + 44px guard) + build prompt.
- [x] **build** — gate green (245/245, +4 tests); muted fix applied (#ccb084), contrast + 44px guards added (load-bearing); engine untouched; preview-verified (lighter muted live); pushed, PR #32 (Sonnet sub-agent).
- [ ] **verify** — Sonnet sub-agent; cold review against ACs + constraints.
- [ ] **ship** — orchestrator (Opus): squash-merge, cost totals, archive.
