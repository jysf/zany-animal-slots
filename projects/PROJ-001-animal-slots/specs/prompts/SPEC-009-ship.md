# SPEC-009 — SHIP prompt (fresh session!)

> Copy everything in the box into a NEW Claude session. You are shipping
> an approved PR. The spec file and PR are your only context.

```
Cycle: ship. PR #9 for SPEC-009 is approved (verified 2026-06-22).

Read files in order:
1. /AGENTS.md — esp. §4 (cost tracking), §8 (cycle model), §15 (ship rules)
2. /projects/PROJ-001-animal-slots/specs/SPEC-009-bet-and-balance-state-machine.md — the spec (all sections)
3. /projects/PROJ-001-animal-slots/specs/SPEC-009-bet-and-balance-state-machine-timeline.md — current timeline state
4. /projects/PROJ-001-animal-slots/stages/STAGE-002-slot-engine.md — the parent stage

Before merging, mark ship `[~]` in:
  projects/PROJ-001-animal-slots/specs/SPEC-009-bet-and-balance-state-machine-timeline.md

Pre-ship checklist:
[ ] CI passing? (check all checks green on PR #9)
[ ] Deployment steps? (static SPA — no deploy step until STAGE-006 wires Cloudflare Pages)
[ ] Rollback plan? (git revert merge commit; app is not yet deployed so blast radius is zero)
[ ] CHANGELOG? (no CHANGELOG required for this project at this stage)

Merge PR #9:
  gh pr merge 9 --merge --delete-branch

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
   recorded_at: 2026-06-22,
   notes: "main-loop, not separately metered (AGENTS §4); ship cycle")
- Compute `cost.totals` from ALL sessions (design + build + verify + ship):
  * tokens_total = sum of non-null tokens_total across sessions
  * estimated_usd = sum of non-null estimated_usd across sessions
  * session_count = total number of sessions (including null-numeric ones)
- Mark ship `[x]` in the timeline with merge date and total cost
- Run: just advance-cycle SPEC-009 ship
- Run: just archive-spec SPEC-009  (moves spec + timeline into done/)
- REQUIRED: capture accomplishment — just brag "SPEC-009: delivered bet/balance state machine — STARTING_BALANCE=1000, BET_LEVELS=[10,25,50], DEFAULT_BET=10; nextBet/prevBet clamped stepping; canAfford exact-balance check; debit returns typed DebitResult (never throws, AGENTS §11 / DEC-005); credit adds; 7/7 tests green, all gates pass"
- STAGE-002 continues — do NOT trigger a Stage Ship (SPEC-009 is the fifth spec in STAGE-002, not the last)

If any template/constraint/decision updates were mentioned in Reflection (Ship),
propose the edits now (do not commit without showing me).

If a follow-up spec was mentioned, add it to the STAGE-002 backlog with
a one-line summary — do NOT write the full spec (that is Prompt 2b).

Note: The build and verify cost sessions have tokens_total: null with
"orchestrator to fill tokens_total from subagent_tokens" notes. If the
orchestrator's subagent_tokens are now available, fill them in before computing
totals. Otherwise leave as null — cost.totals will reflect partial data.

Decisions referenced: DEC-001 (engine/presentation separation), DEC-005 (play-money model).
Both honored; no new DEC-* emitted by this build (implementation followed the spec exactly).
```
