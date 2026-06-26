# SPEC-017 timeline

Architect appends as cycles are designed. Executors update status as
they go. Status markers: `[ ]` not started · `[~]` in progress · `[x]` complete · `[?]` blocked.

Cycle prompts live in `prompts/SPEC-017-<cycle>.md`.

## Instructions

- [x] **design** — completed 2026-06-23 (Opus)
- [x] **build** — gate green (117/117) + preview check (auto loops, locks controls, toggle-off stops); pushed, PR #17 (Sonnet sub-agent)
- [x] **verify** — ✅ APPROVED 2026-06-25 (Sonnet cold review; 117/117 tests, all four gates pass; jackpot/count/balance/toggle-off stop fixtures confirmed non-vacuous)
- [x] **ship** — PR #17 squash-merged to main 2026-06-25. Total: 134,859 tokens / ~$0.89 (4 sessions).
