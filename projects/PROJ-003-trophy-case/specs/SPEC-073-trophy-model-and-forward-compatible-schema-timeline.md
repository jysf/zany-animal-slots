# SPEC-073 timeline

Architect appends as cycles are designed. Executors update status as they go.
Status markers: `[ ]` not started · `[~]` in progress · `[x]` complete · `[?]` blocked.

Cycle prompts live in `prompts/SPEC-073-<cycle>.md`.

## Instructions

- [x] **design** (Opus) — spec + failing tests + DEC-024 authored. 2026-07-23.
- [ ] **build** (Sonnet) — make the failing tests pass; drop-in code in the spec's Notes.
      See `prompts/SPEC-073-build.md`.
- [ ] **verify** (Sonnet) — cold review against acceptance criteria + guard-mutations.
      See `prompts/SPEC-073-verify.md`.
- [ ] **ship** (Opus) — gate, PR, CI, squash-merge, archive, brag, cost bookkeeping.
