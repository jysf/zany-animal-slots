# SPEC-032 timeline

Architect appends as cycles are designed. Executors update status as
they go. Status markers: `[ ]` not started · `[~]` in progress · `[x]` complete · `[?]` blocked.

Cycle prompts live in `prompts/SPEC-032-<cycle>.md`.

## Instructions

- [x] **design** — completed 2026-06-28 (Opus): measured every contrast pair + 44px survey; found 1 failure (muted/frame 4.06) → fix --_raw-muted #b89a6e→#ccb084 (5.21); spec + failing tests (contrast guard + load-bearing + 44px guard) + build prompt.
- [ ] **build** — Sonnet sub-agent; apply the muted fix + add the guard tests; gate green; local branch only.
- [ ] **verify** — Sonnet sub-agent; cold review against ACs + constraints.
- [ ] **ship** — orchestrator (Opus): squash-merge, cost totals, archive.
