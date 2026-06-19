# SPEC-003 — SHIP prompt (fresh session!)

> Copy everything in the box into a NEW Claude session. You are shipping
> an approved PR. The spec file and PR are your only context.

```
Cycle: ship. PR #3 for SPEC-003 is approved (verified SHA 50807c9).

Read files in order:
1. /AGENTS.md — esp. §4 (cost tracking), §8 (cycle model)
2. /projects/PROJ-001-animal-slots/specs/SPEC-003-four-region-layout.md — the spec (all sections)
3. /projects/PROJ-001-animal-slots/specs/SPEC-003-four-region-layout-timeline.md — current timeline state
4. /projects/PROJ-001-animal-slots/stages/STAGE-001-scaffold-and-design-system.md — the parent stage

Before merging, mark ship `[~]` in:
  projects/PROJ-001-animal-slots/specs/SPEC-003-four-region-layout-timeline.md

Pre-ship checklist:
[ ] CI passing? (4/4 checks green on PR #3)
[ ] Deployment steps? (static SPA — no deploy step until STAGE-006 wires Cloudflare Pages)
[ ] Rollback plan? (git revert merge commit; app is not yet deployed so blast radius is zero)
[ ] CHANGELOG? (no CHANGELOG required for this project at this stage)

Merge PR #3:
  gh pr merge 3 --merge --delete-branch

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
- Run: just advance-cycle SPEC-003 ship
- Run: just archive-spec SPEC-003  (moves spec + timeline into done/)
- REQUIRED: capture accomplishment — just brag "SPEC-003: delivered four-region portrait cabinet layout (Header/Game/Status/Action) consuming design tokens, all gates green (9/9 tests)"
- Update STAGE-001 backlog: mark SPEC-003 as shipped

If any template/constraint/decision updates were mentioned in Reflection (Ship),
propose the edits now (do not commit without showing me).

If a follow-up spec was mentioned, add it to the STAGE-001 backlog with a
one-line summary — do NOT write the full spec (that is Prompt 2b). Note:
SPEC-004 (desktop device-frame wrapper) is already in the backlog as a pending
spec — do not add a duplicate.

Note: The build and verify cost sessions have tokens_total: null with
"orchestrator to fill tokens_total from subagent_tokens" notes. If the
orchestrator's subagent_tokens are now available, fill them in before computing
totals. Otherwise leave as null — cost.totals will reflect partial data.

SPEC-003 is NOT the last spec in STAGE-001 (SPEC-004 device-frame wrapper is
still pending) — do not run the Stage Ship prompt (Prompt 1d) yet.
```
