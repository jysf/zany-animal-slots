# SPEC-014 — SHIP prompt (fresh session!)

> Copy everything in the box into a NEW Claude session. You are shipping
> an approved PR. The spec file and PR are your only context.

```
Cycle: ship. PR #14 for SPEC-014 is approved (verified 2026-06-23).

Read files in order:
1. /AGENTS.md — esp. §4 (cost tracking), §8 (cycle model), §15 (ship rules)
2. /projects/PROJ-001-animal-slots/specs/SPEC-014-bet-plus-minus-controls.md — the spec (all sections)
3. /projects/PROJ-001-animal-slots/specs/SPEC-014-bet-plus-minus-controls-timeline.md — current timeline state
4. /projects/PROJ-001-animal-slots/stages/STAGE-003-reels-ui-and-spin-flow.md — the parent stage

Before merging, mark ship `[~]` in:
  projects/PROJ-001-animal-slots/specs/SPEC-014-bet-plus-minus-controls-timeline.md

Pre-ship checklist:
[ ] CI passing? (check all checks green on PR #14)
[ ] Deployment steps? (static SPA — no deploy step until STAGE-006 wires Cloudflare Pages)
[ ] Rollback plan? (git revert merge commit; app is not yet deployed so blast radius is zero)
[ ] CHANGELOG? (no CHANGELOG required for this project at this stage)

Merge PR #14:
  gh pr merge 14 --merge --delete-branch

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
   recorded_at: 2026-06-23,
   notes: "main-loop, not separately metered (AGENTS §4); ship cycle")
- Compute `cost.totals` from ALL sessions (design + build + verify + ship):
  * tokens_total = sum of non-null tokens_total across sessions
  * estimated_usd = sum of non-null estimated_usd across sessions
  * session_count = total number of sessions (including null-numeric ones)
- Mark ship `[x]` in the timeline with merge date and total cost
- Run: just advance-cycle SPEC-014 ship
- Run: just archive-spec SPEC-014  (moves spec + timeline into done/)
- REQUIRED: capture accomplishment — just brag "SPEC-014: bet +/− controls — player can now choose their stake (10/25/50 coins) using − and + stepper buttons in the Action region; raisng the bet is blocked when the balance can't afford the next level (DEC-005 affordability guard); chosen bet flows into spin() so a 25-coin bet correctly debits 25; buttons are ≥44px with accessible aria-labels (touch-targets-44); bet stepping is pure UI wiring over the engine's nextBet/prevBet/canAfford (DEC-001, no game logic in UI); seed-12345+bet-25 → 975 fixture verified; all gates pass (92/92 tests, typecheck, lint, build); STAGE-003 continues"
- THIS IS THE THIRD SPEC IN STAGE-003 — after archiving, check the STAGE-003
  backlog; SPEC-015 (balance persistence + reset) is next. Do NOT trigger a Stage Ship;
  STAGE-003 continues.

If any template/constraint/decision updates were mentioned in Reflection (Ship),
propose the edits now (do not commit without showing me).

If a follow-up spec was mentioned, add it to the STAGE-003 backlog with
a one-line summary — do NOT write the full spec (that is a separate design cycle).

Note: The build and verify cost sessions have tokens_total: null with
"orchestrator to fill tokens_total from subagent_tokens" notes. If the
orchestrator's subagent_tokens are now available, fill them in before computing
totals. Otherwise leave as null — cost.totals will reflect partial data.

Decisions referenced: DEC-001 (engine/presentation separation — UI imports only
src/engine/index, no engine internals), DEC-005 (play-money — raising bet is blocked
when balance can't afford the higher level; canAfford guards canIncreaseBet).
All honored; no new DEC-* emitted by this build.
```
