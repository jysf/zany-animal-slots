# SPEC-027 timeline

Architect appends as cycles are designed. Executors update status as
they go. Status markers: `[ ]` not started · `[~]` in progress · `[x]` complete · `[?]` blocked.

Cycle prompts live in `prompts/SPEC-027-<cycle>.md`.

## Instructions

- [x] **design** — completed 2026-06-27 (Opus): spec + failing tests (6 useWinJingle gating + 3 jingle/Tone-mock) + build prompt; tier-scaled JINGLE_NOTES (3/5/7), gated by muted+unlocked, adds `tone` (DEC-007-authorized). Last STAGE-004 spec.
- [x] **build** — gate green (203/203, +10 tests); tone@15.1.22 (MIT) added; engine untouched; preview-verified (live win runs jingle path, no console errors); pushed, PR #27 (Sonnet sub-agent).
- [x] **verify** — 2026-06-27 (Sonnet): ✅ APPROVED — 203/203 tests, all gates exit 0, all ACs met, DEC-007 authorizes tone (MIT), engine untouched, useEffect keyed on [celebration?.id] correct.
- [x] **ship** — PR #27 squash-merged to main 2026-06-27. Total: 143,642 tokens / ~$0.95 (5 sessions). STAGE-004 9/9 — backlog complete; stage ready for Stage Ship (Prompt 1d).
