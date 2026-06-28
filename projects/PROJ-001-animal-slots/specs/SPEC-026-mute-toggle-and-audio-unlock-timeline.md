# SPEC-026 timeline

Architect appends as cycles are designed. Executors update status as
they go. Status markers: `[ ]` not started · `[~]` in progress · `[x]` complete · `[?]` blocked.

Cycle prompts live in `prompts/SPEC-026-<cycle>.md`.

## Instructions

- [x] **design** — completed 2026-06-27 (Opus): spec + failing tests (4 muteStorage + 5 useAudio + 3 MuteToggle incl. CSS-contract) + build prompt; audio foundation (mute key 'mute', first-gesture unlock), no sound.
- [x] **build** — gate green (193/193, +12 tests); engine untouched, no new deps; preview-verified (header mute toggle flips 🔊/🔇, aria-pressed, persists across reload); pushed, PR #26 (Sonnet sub-agent).
- [ ] **verify** — Sonnet sub-agent; cold review against ACs + constraints.
- [ ] **ship** — orchestrator (Opus): squash-merge, cost totals, archive.
