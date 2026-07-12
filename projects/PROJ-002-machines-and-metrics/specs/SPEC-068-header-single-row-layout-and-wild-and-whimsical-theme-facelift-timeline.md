# SPEC-068 timeline

Architect appends as cycles are designed. Executors update status as
they go. Status markers: `[ ]` not started · `[~]` in progress · `[x]` complete · `[?]` blocked.

Cycle prompts live in `prompts/SPEC-068-<cycle>.md`.

## Instructions

_(Timeline will be populated as the architect writes each cycle's prompt.)_

## Instructions

- [x] **design+build+verify** — 2026-07-12 (Opus, orchestrator session): two user-reported facelift fixes
      from testing the live build. (1) Header: made the paytable/stats/help triggers icon-only (kept
      aria-label + title), reworked `.cabinet__header-controls` to a single non-wrapping row (selector
      flexes/truncates; icon triggers fixed ≥44px) — replaces SPEC-063's ragged 2-row wrap. (2) Gave Wild
      & Whimsical its own magical-plum theme (pink accent, gold coins) instead of the dull default
      campfire; updated the parity test (theme non-empty + AA contrast). Verified in-browser at 375px:
      one clean controls row; vibrant W&W theme with the colourful menagerie; Arctic switch confirms the
      theme is isolated. Full gate green (471, worktree excluded); engine diff EMPTY; no DEC. **[S]**
- [x] **ship** — shipped 2026-07-12 via PR #NN (squash-merged; CI green; branch deleted).
