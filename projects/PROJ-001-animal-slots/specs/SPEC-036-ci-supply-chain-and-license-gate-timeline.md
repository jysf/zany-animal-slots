# SPEC-036 timeline

Architect appends as cycles are designed. Executors update status as
they go. Status markers: `[ ]` not started · `[~]` in progress · `[x]` complete · `[?]` blocked.

Cycle prompts live in `prompts/SPEC-036-<cycle>.md`.

## Instructions

- [x] **design** — completed 2026-07-03 (Opus): scanned the installed license set (all permissive; 1 exception caniuse-lite CC-BY-4.0) + spec (dependency-free scanner + npm audit, CI job + just recipes) + failing tests + build prompt. Second [REPO] spec.
- [~] **build** — Sonnet sub-agent; license-check.mjs + recipes + CI job + tests; gate green; local branch only.
- [ ] **verify** — Sonnet sub-agent; cold review against ACs + constraints.
- [ ] **ship** — orchestrator (Opus): squash-merge, cost totals, archive.
