# SPEC-031 timeline

Architect appends as cycles are designed. Executors update status as
they go. Status markers: `[ ]` not started · `[~]` in progress · `[x]` complete · `[?]` blocked.

Cycle prompts live in `prompts/SPEC-031-<cycle>.md`.

## Instructions

- [x] **design** — completed 2026-06-28 (Opus): audit survey (all 5 @keyframes CSS already have reduced-motion; audio not motion-gated) + spec + failing tests (sweep guard + global net + audio-not-gated + App-under-reduced-motion) + build prompt.
- [x] **build** — gate green (241/241, +4 tests); global net + sweep guard added; audit clean (5/5 keyframes CSS already compliant); engine untouched; pushed, PR #31 (Sonnet sub-agent).
- [x] **verify** — ✅ APPROVED (2026-06-28, Sonnet): all gates green (241/241); sweep is real (fs walk, not hardcoded); independent greps confirm 5/5 @keyframes files pass + audio clean; engine + package.json unchanged; deviation (.ts→.tsx) correct; no decision drift.
- [ ] **ship** — orchestrator (Opus): squash-merge, cost totals, archive.
