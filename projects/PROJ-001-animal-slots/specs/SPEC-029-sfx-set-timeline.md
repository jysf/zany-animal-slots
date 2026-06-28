# SPEC-029 timeline

Architect appends as cycles are designed. Executors update status as
they go. Status markers: `[ ]` not started · `[~]` in progress · `[x]` complete · `[?]` blocked.

Cycle prompts live in `prompts/SPEC-029-<cycle>.md`.

## Instructions

- [x] **design** — completed 2026-06-27 (Opus): spec + failing tests (7 useGameSfx + 4 sfx) + build prompt; spin/reelStop(×5)/win SFX on the sfx channel, event-wired (isSpinning edges + celebration), gated.
- [x] **build** — gate green (225/225, +11 tests); engine untouched, no new deps; SFX route through the sfx channel; preview-verified (4 spins, no console errors); pushed, PR #29 (Sonnet sub-agent).
- [x] **verify** — ✅ APPROVED 2026-06-27 (Sonnet sub-agent); 225/225 tests, all ACs confirmed, engine clean, no new deps, decisions audit clean.
- [ ] **ship** — orchestrator (Opus): squash-merge, cost totals, archive.
