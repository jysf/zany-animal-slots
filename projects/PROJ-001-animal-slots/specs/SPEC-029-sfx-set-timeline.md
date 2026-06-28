# SPEC-029 timeline

Architect appends as cycles are designed. Executors update status as
they go. Status markers: `[ ]` not started · `[~]` in progress · `[x]` complete · `[?]` blocked.

Cycle prompts live in `prompts/SPEC-029-<cycle>.md`.

## Instructions

- [x] **design** — completed 2026-06-27 (Opus): spec + failing tests (7 useGameSfx + 4 sfx) + build prompt; spin/reelStop(×5)/win SFX on the sfx channel, event-wired (isSpinning edges + celebration), gated.
- [ ] **build** — Sonnet sub-agent; make the SFX + event-wiring tests pass; gate green; local branch only.
- [ ] **verify** — Sonnet sub-agent; cold review against ACs + constraints.
- [ ] **ship** — orchestrator (Opus): squash-merge, cost totals, archive.
