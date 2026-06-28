# SPEC-028 timeline

Architect appends as cycles are designed. Executors update status as
they go. Status markers: `[ ]` not started · `[~]` in progress · `[x]` complete · `[?]` blocked.

Cycle prompts live in `prompts/SPEC-028-<cycle>.md`.

## Instructions

- [x] **design** — completed 2026-06-27 (Opus): spec + DEC-013 (audio-graph architecture) + failing tests (5 useAmbientBed hook + 2 audioEngine + 3 ambientBed + jingle re-route) + build prompt; shared master bus + bed/sfx/jingle channels + generative Transport bed, gated.
- [ ] **build** — Sonnet sub-agent; make the audio-graph + bed tests pass; gate green; local branch only.
- [ ] **verify** — Sonnet sub-agent; cold review against ACs + constraints + DEC-013.
- [ ] **ship** — orchestrator (Opus): squash-merge, cost totals, archive.
