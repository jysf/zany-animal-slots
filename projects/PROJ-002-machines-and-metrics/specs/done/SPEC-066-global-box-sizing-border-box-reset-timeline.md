# SPEC-066 timeline

Architect appends as cycles are designed. Executors update status as
they go. Status markers: `[ ]` not started · `[~]` in progress · `[x]` complete · `[?]` blocked.

Cycle prompts live in `prompts/SPEC-066-<cycle>.md`.

## Instructions

- [x] **design+build+verify** — 2026-07-12 (Opus, orchestrator session): added a global
      `*, *::before, *::after { box-sizing: border-box }` reset in a new `src/styles/reset.css`, imported
      before `tokens.css` in `main.tsx`; added `src/styles/reset.contract.test.ts` (3 assertions);
      removed the now-redundant per-sheet `box-sizing` decls SPEC-063 had added to
      `paytable.css` / `stats/stats.css` / `help/help.css`. Preview-verified at 375×812, 375×500, and
      1100×760 — with the local decls removed, the help sheet on a 375×500 viewport measures
      `box-sizing:border-box`, `top 0`, `height 500 == innerHeight` (no top clip); sampled
      cabinet/header/body/reel-grid/reel__cell/status-readout all `border-box`; zero horizontal overflow;
      all 3 sheets open with title+close visible on phone and inside the framed cabinet on desktop.
      Full gate green (467 tests). Presentation-only — engine untouched; no new DEC (inside DEC-010). **[S]**
- [x] **ship** — shipped 2026-07-12 via PR #77 (squash-merged; CI green; branch deleted).
