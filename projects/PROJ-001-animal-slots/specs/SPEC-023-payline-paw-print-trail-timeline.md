# SPEC-023 timeline

Architect appends as cycles are designed. Executors update status as
they go. Status markers: `[ ]` not started · `[~]` in progress · `[x]` complete · `[?]` blocked.

Cycle prompts live in `prompts/SPEC-023-<cycle>.md`.

## Instructions

- [x] **design** — completed 2026-06-27 (Opus): spec + failing tests (5 ReelGrid + 1 Game + CSS-contract) + build prompt; paw markup/CSS designed (🐾 overlay, staggered pop keyframe via --reel-index, reduced-motion static).
- [x] **build** — gate green (167/167, +7 tests); engine untouched; preview-verified (3 paws on 3 win cells, symbols readable, 15 role=img intact); pushed, PR #23 (Sonnet sub-agent).
- [ ] **verify** — Sonnet sub-agent; cold review against ACs + constraints.
- [ ] **ship** — orchestrator (Opus): squash-merge, cost totals, archive.
