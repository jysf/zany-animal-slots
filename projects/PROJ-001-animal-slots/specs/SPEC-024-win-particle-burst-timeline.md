# SPEC-024 timeline

Architect appends as cycles are designed. Executors update status as
they go. Status markers: `[ ]` not started · `[~]` in progress · `[x]` complete · `[?]` blocked.

Cycle prompts live in `prompts/SPEC-024-<cycle>.md`.

## Instructions

- [x] **design** — completed 2026-06-27 (Opus): spec + failing tests (7 ParticleBurst incl. CSS-contract + 1 Game) + build prompt; tier→count map (10/20/32), reduced-motion renders nothing.
- [x] **build** — gate green (175/175, +8 tests); engine untouched; preview-verified (small win → 10 particles, particle-fly, 15 role=img intact); pushed, PR #24 (Sonnet sub-agent).
- [x] **verify** — 2026-06-27 (Sonnet sub-agent): ✅ APPROVED — 175/175 tests, engine untouched, all ACs met, DEC-004/006/010 consistent, no eslint-disable, no raw hex, useMemo before early return, role=img count intact at 15.
- [ ] **ship** — orchestrator (Opus): squash-merge, cost totals, archive.
