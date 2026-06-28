# SPEC-023 timeline

Architect appends as cycles are designed. Executors update status as
they go. Status markers: `[ ]` not started · `[~]` in progress · `[x]` complete · `[?]` blocked.

Cycle prompts live in `prompts/SPEC-023-<cycle>.md`.

## Instructions

- [x] **design** — completed 2026-06-27 (Opus): spec + failing tests (5 ReelGrid + 1 Game + CSS-contract) + build prompt; paw markup/CSS designed (🐾 overlay, staggered pop keyframe via --reel-index, reduced-motion static).
- [x] **build** — gate green (167/167, +7 tests); engine untouched; preview-verified (3 paws on 3 win cells, symbols readable, 15 role=img intact); pushed, PR #23 (Sonnet sub-agent).
- [x] **verify** — ✅ APPROVED 2026-06-27 (Sonnet sub-agent): 167/167 tests, all 4 gates pass, 7 new paw tests non-vacuous, engine untouched, CSS contract confirmed, no raw hex, reduced-motion path present, replay key correct.
- [x] **ship** — PR #23 squash-merged to main 2026-06-27. Total: 136,409 tokens / ~$0.90 (5 sessions). STAGE-004 5/9.
