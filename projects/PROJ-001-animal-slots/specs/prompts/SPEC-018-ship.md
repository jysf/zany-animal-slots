# SPEC-018 — SHIP prompt (fresh session!)

> Copy everything in the box into a NEW Claude session. You are shipping
> an approved PR. The spec file and PR are your only context.

```
Cycle: ship. PR #18 for SPEC-018 is approved (verified 2026-06-26).

Read files in order:
1. /AGENTS.md — esp. §4 (cost tracking), §8 (cycle model), §15 (ship rules)
2. /projects/PROJ-001-animal-slots/specs/SPEC-018-winning-line-highlight.md — the spec (all sections)
3. /projects/PROJ-001-animal-slots/specs/SPEC-018-winning-line-highlight-timeline.md — current timeline state
4. /projects/PROJ-001-animal-slots/stages/STAGE-003-reels-ui-and-spin-flow.md — the parent stage

Before merging, mark ship `[~]` in:
  projects/PROJ-001-animal-slots/specs/SPEC-018-winning-line-highlight-timeline.md

Pre-ship checklist:
[ ] CI passing? (check all checks green on PR #18)
[ ] Deployment steps? (static SPA — no deploy step until STAGE-006 wires Cloudflare Pages)
[ ] Rollback plan? (git revert merge commit; app is not yet deployed so blast radius is zero)
[ ] CHANGELOG? (no CHANGELOG required for this project at this stage)

Merge PR #18:
  gh pr merge 18 --merge --delete-branch

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
   recorded_at: 2026-06-26,
   notes: "main-loop, not separately metered (AGENTS §4); ship cycle")
- Compute `cost.totals` from ALL sessions (design + build + verify + ship):
  * tokens_total = sum of non-null tokens_total across sessions
  * estimated_usd = sum of non-null estimated_usd across sessions
  * session_count = total number of sessions (including null-numeric ones)
- Mark ship `[x]` in the timeline with merge date and total cost
- Run: just advance-cycle SPEC-018 ship
- Run: just archive-spec SPEC-018  (moves spec + timeline into done/)
- REQUIRED: capture accomplishment — just brag "SPEC-018: winning-line highlight — after each resolved spin, the exact cells of every hitting payline glow gold (box-shadow using var(--color-coin) token); winningCellKeys() maps each LineWin to its first count reels at PAYLINES rows (left-anchored run, DEC-003); highlight is suppressed while spinning so no stale win flashes mid-spin; token-based, additive styling (no layout shift, no raw hex, DEC-010); lineWins threads App→Game→ReelGrid with [] default so all prior callers/tests remain unbroken; engine untouched (DEC-001); all 8 ReelGrid tests + 5 winningCells unit tests pass; 125/125 suite green; STAGE-003 complete — a fully playable slot with visible win feedback"
- THIS IS THE SEVENTH AND FINAL SPEC IN STAGE-003 — after archiving, the STAGE-003
  backlog is complete. Do NOT trigger a Stage Ship; the orchestrator handles the
  STAGE-003 boundary. Simply note it in your summary.

If any template/constraint/decision updates were mentioned in Reflection (Ship),
propose the edits now (do not commit without showing me).

If a follow-up spec was mentioned, add it to the backlog with a one-line
summary — do NOT write the full spec (that is a separate design cycle).

Note: The build and verify cost sessions have tokens_total: null with
"orchestrator to fill tokens_total from subagent_tokens" notes. If the
orchestrator's subagent_tokens are now available, fill them in before computing
totals. Otherwise leave as null — cost.totals will reflect partial data.

Decisions referenced: DEC-001 (engine/presentation separation — winningCellKeys
consumes PAYLINES/LineWin via src/engine/index.ts only; engine directory
untouched; no DOM imports in src/engine/**), DEC-003 (five fixed paylines + left-
anchored run rule — the first count reels at that line's rows are the winning
cells), DEC-010 (global CSS + design tokens — .reel__cell--win uses
var(--color-coin), no raw hex, additive box-shadow styling).
All honored; no new DEC-* emitted by this build.
```
