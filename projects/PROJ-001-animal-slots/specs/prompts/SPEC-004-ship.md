# SPEC-004 — SHIP prompt (fresh session!)

> Copy everything in the box into a NEW Claude session. You are shipping
> an approved PR. The spec file and PR are your only context.

```
Cycle: ship. PR #4 for SPEC-004 is approved (verified 2026-06-19).

Read files in order:
1. /AGENTS.md — esp. §4 (cost tracking), §8 (cycle model), §15 (ship rules)
2. /projects/PROJ-001-animal-slots/specs/SPEC-004-desktop-device-frame.md — the spec (all sections)
3. /projects/PROJ-001-animal-slots/specs/SPEC-004-desktop-device-frame-timeline.md — current timeline state
4. /projects/PROJ-001-animal-slots/stages/STAGE-001-scaffold-and-design-system.md — the parent stage

Before merging, mark ship `[~]` in:
  projects/PROJ-001-animal-slots/specs/SPEC-004-desktop-device-frame-timeline.md

Pre-ship checklist:
[ ] CI passing? (check all checks green on PR #4)
[ ] Deployment steps? (static SPA — no deploy step until STAGE-006 wires Cloudflare Pages)
[ ] Rollback plan? (git revert merge commit; app is not yet deployed so blast radius is zero)
[ ] CHANGELOG? (no CHANGELOG required for this project at this stage)

Merge PR #4:
  gh pr merge 4 --merge --delete-branch

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
   recorded_at: 2026-06-19,
   notes: "main-loop, not separately metered (AGENTS §4); ship cycle")
- Compute `cost.totals` from ALL sessions (design + build + verify + ship):
  * tokens_total = sum of non-null tokens_total across sessions
  * estimated_usd = sum of non-null estimated_usd across sessions
  * session_count = total number of sessions (including null-numeric ones)
- Mark ship `[x]` in the timeline with merge date and total cost
- Run: just advance-cycle SPEC-004 ship
- Run: just archive-spec SPEC-004  (moves spec + timeline into done/)
- REQUIRED: capture accomplishment — just brag "SPEC-004: delivered desktop device frame — portrait cabinet centered in a phone-shaped, rounded, shadowed frame on large screens; STAGE-001 complete (13/13 tests, all gates green)"
- Update STAGE-001 status: mark as shipped (SPEC-004 is the last spec in the backlog)
- Run the Stage Ship prompt (STAGE-001 is now complete)

If any template/constraint/decision updates were mentioned in Reflection (Ship),
propose the edits now (do not commit without showing me).

If a follow-up spec was mentioned, add it to the appropriate stage backlog with
a one-line summary — do NOT write the full spec (that is Prompt 2b).

Note: The build and verify cost sessions have tokens_total: null with
"orchestrator to fill tokens_total from subagent_tokens" notes. If the
orchestrator's subagent_tokens are now available, fill them in before computing
totals. Otherwise leave as null — cost.totals will reflect partial data.

SPEC-004 is the LAST spec in STAGE-001 — after archiving the spec, run the
Stage Ship prompt for STAGE-001.
```
