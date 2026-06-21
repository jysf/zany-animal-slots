# SPEC-008 — SHIP prompt (fresh session!)

> Copy everything in the box into a NEW Claude session. You are shipping
> an approved PR. The spec file and PR are your only context.

```
Cycle: ship. PR #8 for SPEC-008 is approved (verified 2026-06-20).

Read files in order:
1. /AGENTS.md — esp. §4 (cost tracking), §8 (cycle model), §15 (ship rules)
2. /projects/PROJ-001-animal-slots/specs/SPEC-008-payline-and-paytable-evaluation.md — the spec (all sections)
3. /projects/PROJ-001-animal-slots/specs/SPEC-008-payline-and-paytable-evaluation-timeline.md — current timeline state
4. /projects/PROJ-001-animal-slots/stages/STAGE-002-slot-engine.md — the parent stage

Before merging, mark ship `[~]` in:
  projects/PROJ-001-animal-slots/specs/SPEC-008-payline-and-paytable-evaluation-timeline.md

Pre-ship checklist:
[ ] CI passing? (check all checks green on PR #8)
[ ] Deployment steps? (static SPA — no deploy step until STAGE-006 wires Cloudflare Pages)
[ ] Rollback plan? (git revert merge commit; app is not yet deployed so blast radius is zero)
[ ] CHANGELOG? (no CHANGELOG required for this project at this stage)

Merge PR #8:
  gh pr merge 8 --merge --delete-branch

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
   recorded_at: 2026-06-20,
   notes: "main-loop, not separately metered (AGENTS §4); ship cycle")
- Compute `cost.totals` from ALL sessions (design + build + verify + ship):
  * tokens_total = sum of non-null tokens_total across sessions
  * estimated_usd = sum of non-null estimated_usd across sessions
  * session_count = total number of sessions (including null-numeric ones)
- Mark ship `[x]` in the timeline with merge date and total cost
- Run: just advance-cycle SPEC-008 ship
- Run: just archive-spec SPEC-008  (moves spec + timeline into done/)
- REQUIRED: capture accomplishment — just brag "SPEC-008: delivered payline + paytable evaluation — evaluatePaylines scores all five fixed paylines (DEC-003) against the tier paytable (DEC-011), left-anchored run ≥3 from reel 0, floor(multiplier × totalBet) rounding; lineSymbols, PAYLINES, PAYTABLE exported; 11/11 tests green, all gates pass"
- STAGE-002 continues — do NOT trigger a Stage Ship (SPEC-008 is the fourth spec in STAGE-002, not the last)

If any template/constraint/decision updates were mentioned in Reflection (Ship),
propose the edits now (do not commit without showing me).

If a follow-up spec was mentioned, add it to the STAGE-002 backlog with
a one-line summary — do NOT write the full spec (that is Prompt 2b).

Note: The build and verify cost sessions have tokens_total: null with
"orchestrator to fill tokens_total from subagent_tokens" notes. If the
orchestrator's subagent_tokens are now available, fill them in before computing
totals. Otherwise leave as null — cost.totals will reflect partial data.

Decisions referenced: DEC-001 (engine/presentation separation), DEC-003 (five fixed paylines),
DEC-011 (paytable + reel-strip weights).
All three honored; no new DEC-* emitted by this build (implementation followed the spec exactly).
```
