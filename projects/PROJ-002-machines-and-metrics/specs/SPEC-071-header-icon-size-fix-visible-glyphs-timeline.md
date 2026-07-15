# SPEC-071 timeline

Architect appends as cycles are designed. Executors update status as
they go. Status markers: `[ ]` not started · `[~]` in progress · `[x]` complete · `[?]` blocked.

Cycle prompts live in `prompts/SPEC-071-<cycle>.md`.

## Instructions

_(Timeline will be populated as the architect writes each cycle's prompt.)_

## Instructions

- [x] **design+build+verify** — 2026-07-12 (Opus, orchestrator session): the 💰 Paytable icon wasn't
      visible because the paytable/stats/help header triggers were still at 12.8px (font-size-sm from the
      text-label era, vs the mute toggle's 16px). Fix: `font-size: var(--font-size-lg)` + `line-height:1`
      on the four header icon triggers. Verified in-browser at 375px — 💰/📊/❓ clear + consistent, one
      row kept. Engine diff EMPTY; full gate green (471, worktree excluded). **[S]**
- [x] **ship** — shipped 2026-07-12 via PR #NN (squash-merged; CI green; branch deleted).
