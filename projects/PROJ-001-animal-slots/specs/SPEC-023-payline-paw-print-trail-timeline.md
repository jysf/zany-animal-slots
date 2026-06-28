# SPEC-023 timeline

Architect appends as cycles are designed. Executors update status as
they go. Status markers: `[ ]` not started · `[~]` in progress · `[x]` complete · `[?]` blocked.

Cycle prompts live in `prompts/SPEC-023-<cycle>.md`.

## Instructions

- [x] **design** — completed 2026-06-27 (Opus): spec + failing tests (5 ReelGrid + 1 Game + CSS-contract) + build prompt; paw markup/CSS designed (🐾 overlay, staggered pop keyframe via --reel-index, reduced-motion static).
- [ ] **build** — Sonnet sub-agent; make the paw-trail tests pass; gate green; local branch only.
- [ ] **verify** — Sonnet sub-agent; cold review against ACs + constraints.
- [ ] **ship** — orchestrator (Opus): squash-merge, cost totals, archive.
