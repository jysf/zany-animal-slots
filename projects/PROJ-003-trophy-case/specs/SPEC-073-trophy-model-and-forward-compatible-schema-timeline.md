# SPEC-073 timeline

Architect appends as cycles are designed. Executors update status as they go.
Status markers: `[ ]` not started · `[~]` in progress · `[x]` complete · `[?]` blocked.

Cycle prompts live in `prompts/SPEC-073-<cycle>.md`.

## Instructions

- [x] **design** (Opus) — spec + failing tests + DEC-024 authored. 2026-07-23.
- [x] **build** (Sonnet) — implemented; full gate green, engine diff empty. 2026-07-23.
- [x] **verify** (Sonnet) — APPROVED, 0 defects; 5/5 guard-mutations have teeth. 2026-07-23.
- [x] **ship** (Opus) — tightened weak normalization test; PR + CI + squash-merge. 2026-07-23.