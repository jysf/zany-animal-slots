# SPEC-019 — SHIP prompt (fresh session!)

> Copy everything in the box into a NEW Claude session. You are shipping
> an approved PR. The spec file and PR are your only context.

```
Cycle: ship. PR #19 for SPEC-019 is approved (verified 2026-06-27).

Read files in order:
1. /AGENTS.md — esp. §4 (cost tracking), §8 (cycle model), §15 (ship rules)
2. /projects/PROJ-001-animal-slots/specs/SPEC-019-win-amount-display.md — the spec (all sections)
3. /projects/PROJ-001-animal-slots/specs/SPEC-019-win-amount-display-timeline.md — current timeline state
4. /projects/PROJ-001-animal-slots/stages/STAGE-004-win-celebration-and-juice.md — the parent stage

Before merging, mark ship `[~]` in:
  projects/PROJ-001-animal-slots/specs/SPEC-019-win-amount-display-timeline.md

Pre-ship checklist:
[ ] CI passing? (check all checks green on PR #19)
[ ] Deployment steps? (static SPA — no deploy step until STAGE-006 wires Cloudflare Pages)
[ ] Rollback plan? (git revert merge commit; app is not yet deployed so blast radius is zero)
[ ] CHANGELOG? (no CHANGELOG required for this project at this stage)

Merge PR #19:
  gh pr merge 19 --merge --delete-branch

After merge, answer the three Reflection (Ship) questions below and
paste your answers where indicated in the spec's "## Reflection (Ship)" section:

1. What would I do differently next time?
   [REPLACE: answer]

2. Does any template, constraint, or decision need updating?
   [REPLACE: answer]

3. Is there a follow-up spec to write before I forget?
   [REPLACE: answer]

After you have the answers:
- Format as ## Reflection (Ship) block in the spec
- Append a ship cost session entry to `cost.sessions` in the spec
  (cycle: ship, agent: <your model>, interface: claude-code,
   tokens_total: null, estimated_usd: null, duration_minutes: <estimate>,
   recorded_at: 2026-06-27,
   notes: "main-loop, not separately metered (AGENTS §4); ship cycle")
- Compute `cost.totals` from ALL sessions (design + build + verify + ship):
  * tokens_total = sum of non-null tokens_total across sessions
  * estimated_usd = sum of non-null estimated_usd across sessions
  * session_count = total number of sessions (including null-numeric ones)
- Mark ship `[x]` in the timeline with merge date and total cost
- Run: just advance-cycle SPEC-019 ship
- Run: just archive-spec SPEC-019  (moves spec + timeline into done/)
- REQUIRED: capture accomplishment — just brag "SPEC-019: win-amount display — after each resolved spin, a pop-up WIN +N badge animates over the reel grid (CSS keyframe, transform/opacity, DEC-004) and the Status bar shows a persistent WIN readout; both feed from the engine's SpinResult.totalWin via the new lastWin field on useSlotMachine; badge is position: absolute inside cabinet__game (position: relative) so no layout shift; clears mid-spin via show={!spinning}; prefers-reduced-motion path shows badge statically; zero raw hex (tokens only, DEC-010); engine untouched (DEC-001); 133/133 tests green including 4 lastWin hook tests and 3 WinBadge tests covering both null cases; first STAGE-004 spec — win-celebration stage underway"
- THIS IS THE FIRST SPEC IN STAGE-004 — do NOT trigger a Stage Ship.
  STAGE-004 continues with SPEC-020 (paytable sheet). Simply note the
  stage remains active in your summary.

If any template/constraint/decision updates were mentioned in Reflection (Ship),
propose the edits now (do not commit without showing me).

If a follow-up spec was mentioned, add it to the backlog with a one-line
summary — do NOT write the full spec (that is a separate design cycle).

Note: The build and verify cost sessions have tokens_total: null with
"orchestrator to fill tokens_total from subagent_tokens" notes. If the
orchestrator's subagent_tokens are now available, fill them in before computing
totals. Otherwise leave as null — cost.totals will reflect partial data.

Decisions referenced: DEC-001 (engine/presentation separation — lastWin is
outcome.totalWin from SpinResult; engine directory untouched; no DOM imports
added to src/engine/**), DEC-004 (CSS keyframe animation for the badge pop-in;
prefers-reduced-motion drops the animation and restores the final transform),
DEC-010 (global CSS + design tokens — win-badge.css uses var(--color-coin),
var(--color-surface), var(--radius-lg) etc.; no raw hex; .win-badge class is
prefixed per BEM-ish convention).
All honored; no new DEC-* emitted by this build.
```
