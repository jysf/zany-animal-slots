# SPEC-035 timeline

Architect appends as cycles are designed. Executors update status as
they go. Status markers: `[ ]` not started · `[~]` in progress · `[x]` complete · `[?]` blocked.

Cycle prompts live in `prompts/SPEC-035-<cycle>.md`.

## Instructions

- [x] **design** — completed 2026-07-03 (Opus): CSP tuned against the built dist/index.html (external module script → script-src 'self'; inline style attrs → style-src 'unsafe-inline') + spec + failing contract tests + build prompt. First [REPO] spec.
- [x] **build** — gate green (257/257, +5 contract tests); public/_headers (tight CSP, no script unsafe-inline; cache policy); dist/_headers matches; engine untouched; pushed, PR #35 (Sonnet sub-agent).
- [x] **verify** — ✅ APPROVED 2026-07-03 (Sonnet sub-agent): 257/257 green (+5 contract tests); dist/_headers == public/_headers (533B identical); CSP correct (script-src 'self' only; inline style attrs justify style-src 'unsafe-inline'); engine + package.json untouched; no new DEC.
- [x] **ship** — PR #35 squash-merged to main 2026-07-03. Total: 131,117 tokens / ~$0.86 (5 sessions). STAGE-006 1/6.
