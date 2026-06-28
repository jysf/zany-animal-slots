# SPEC-025 timeline

Architect appends as cycles are designed. Executors update status as
they go. Status markers: `[ ]` not started · `[~]` in progress · `[x]` complete · `[?]` blocked.

Cycle prompts live in `prompts/SPEC-025-<cycle>.md`.

## Instructions

- [x] **design** — completed 2026-06-27 (Opus): spec + failing tests (6 JackpotMoment incl. CSS-contract) + build prompt; full-cabinet moon/wolf/banner overlay, auto-dismiss (JACKPOT_MOMENT_MS), reduced-motion static, z-index 20.
- [x] **build** — gate green (181/181, +6 tests); engine untouched; preview-verified (injected overlay renders moon/wolf/JACKPOT at z-index 20 over the dimmed cabinet); pushed, PR #25 (Sonnet sub-agent).
- [ ] **verify** — Sonnet sub-agent; cold review against ACs + constraints.
- [ ] **ship** — orchestrator (Opus): squash-merge, cost totals, archive.
