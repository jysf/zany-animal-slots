# SPEC-027 timeline

Architect appends as cycles are designed. Executors update status as
they go. Status markers: `[ ]` not started · `[~]` in progress · `[x]` complete · `[?]` blocked.

Cycle prompts live in `prompts/SPEC-027-<cycle>.md`.

## Instructions

- [x] **design** — completed 2026-06-27 (Opus): spec + failing tests (6 useWinJingle gating + 3 jingle/Tone-mock) + build prompt; tier-scaled JINGLE_NOTES (3/5/7), gated by muted+unlocked, adds `tone` (DEC-007-authorized). Last STAGE-004 spec.
- [ ] **build** — Sonnet sub-agent; npm install tone; make the jingle/gating tests pass; gate green; local branch only.
- [ ] **verify** — Sonnet sub-agent; cold review against ACs + constraints (incl. dep authorized by DEC-007, MIT license).
- [ ] **ship** — orchestrator (Opus): squash-merge, cost totals, archive; then STOP at the STAGE-004 boundary.
