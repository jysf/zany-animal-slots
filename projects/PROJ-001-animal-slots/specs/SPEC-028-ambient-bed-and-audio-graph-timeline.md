# SPEC-028 timeline

Architect appends as cycles are designed. Executors update status as
they go. Status markers: `[ ]` not started · `[~]` in progress · `[x]` complete · `[?]` blocked.

Cycle prompts live in `prompts/SPEC-028-<cycle>.md`.

## Instructions

- [x] **design** — completed 2026-06-27 (Opus): spec + DEC-013 (audio-graph architecture) + failing tests (5 useAmbientBed hook + 2 audioEngine + 3 ambientBed + jingle re-route) + build prompt; shared master bus + bed/sfx/jingle channels + generative Transport bed, gated.
- [x] **build** — gate green (214/214, +11 tests); engine untouched, no new deps; jingle re-routed onto its channel; preview-verified (graph runs through gesture+mute+spins, no console errors); pushed, PR #28 (Sonnet sub-agent).
- [x] **verify** — completed 2026-06-27 (Sonnet sub-agent): ✅ APPROVED; 35 test files / 214 tests / gate clean; DEC-013 honored; engine untouched; no new deps; all ACs met.
- [ ] **ship** — orchestrator (Opus): squash-merge, cost totals, archive.
