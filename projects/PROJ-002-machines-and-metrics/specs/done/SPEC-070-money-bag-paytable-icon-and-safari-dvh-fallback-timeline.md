# SPEC-070 timeline

Architect appends as cycles are designed. Executors update status as
they go. Status markers: `[ ]` not started · `[~]` in progress · `[x]` complete · `[?]` blocked.

Cycle prompts live in `prompts/SPEC-070-<cycle>.md`.

## Instructions

_(Timeline will be populated as the architect writes each cycle's prompt.)_

## Instructions

- [x] **design+build+verify** — 2026-07-12 (Opus, orchestrator session): changed the Paytable header icon
      ℹ → 💰 (+ the matching help-sheet reference), and added a `max-height: 100vh` fallback before
      `100dvh` on all three overlay sheets for older Safari (<15.4) that ignores dvh. Verified in-browser:
      💰 renders in the header (one clean row kept) and "💰 Paytable" in the help sheet. Engine diff EMPTY;
      full gate green (471, worktree excluded). The Safari overlay clip itself is fixed by SPEC-069
      (position:fixed); this is the vh-fallback insurance — needs a real-Safari re-test (not drivable from
      the Chromium preview). **[S]**
- [x] **ship** — shipped 2026-07-12 via PR #81 (squash-merged; CI green; branch deleted).
