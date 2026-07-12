# SPEC-069 timeline

Architect appends as cycles are designed. Executors update status as
they go. Status markers: `[ ]` not started · `[~]` in progress · `[x]` complete · `[?]` blocked.

Cycle prompts live in `prompts/SPEC-069-<cycle>.md`.

## Instructions

_(Timeline will be populated as the architect writes each cycle's prompt.)_

## Instructions

- [x] **design+build+verify** — 2026-07-12 (Opus, orchestrator session): fixed a user-reported bug where
      the first-run help sheet clipped its title + close off the top. Diagnosed in-browser
      (getBoundingClientRect vs innerHeight): SPEC-063's `@media(min-width:640px)` desktop override made
      the sheets position:absolute inside the centered overflow:hidden cabinet, where `bottom:0` didn't
      resolve to the cabinet bottom → clipped. Fix: removed that override from help/paytable/stats.css so
      all sizes use the base `position:fixed` (viewport-anchored, max-width 430px centred, max-height
      100dvh, box-sizing border-box, overflow-y auto). Verified first-run help at 918×1054 / 918×600 /
      390×667 — title + close always visible, body scrolls. CSS-only; engine diff EMPTY; the SPEC-063
      contract test still passes (base rule unchanged). Full gate green (471, worktree excluded). **[S]**
- [x] **ship** — shipped 2026-07-12 via PR #80 (squash-merged; CI green; branch deleted).
