# SPEC-001 — SHIP prompt (fresh session!)

> Copy everything in the box into a NEW Claude session. You are shipping
> an approved PR. The spec file and PR are your only context.

```
Cycle: ship. PR #1 for SPEC-001 is approved.

Read files in order:
1. /AGENTS.md — esp. §4 (cost tracking), §8 (cycle model)
2. /projects/PROJ-001-animal-slots/specs/SPEC-001-project-scaffold-and-tooling.md — the spec (all sections)
3. /projects/PROJ-001-animal-slots/specs/SPEC-001-project-scaffold-and-tooling-timeline.md — current timeline state
4. /projects/PROJ-001-animal-slots/stages/STAGE-001-scaffold-and-design-system.md — the parent stage

Before merging, mark ship `[~]` in:
  projects/PROJ-001-animal-slots/specs/SPEC-001-project-scaffold-and-tooling-timeline.md

Pre-ship checklist:
[ ] CI passing? (4/4 checks green on PR #1)
[ ] Deployment steps? (static SPA — no deploy step until STAGE-006 wires Cloudflare Pages)
[ ] Rollback plan? (git revert merge commit; app is not yet deployed so blast radius is zero)
[ ] CHANGELOG? (no CHANGELOG required for this project at this stage)

Merge PR #1:
  gh pr merge 1 --merge --delete-branch

After merge, answer the three Reflection (Ship) questions below and
paste your answers where indicated:

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
   recorded_at: 2026-06-18,
   notes: "main-loop, not separately metered (AGENTS §4); ship cycle")
- Compute `cost.totals` from ALL sessions (design + build + verify + ship):
  * tokens_total = sum of non-null tokens_total across sessions
  * estimated_usd = sum of non-null estimated_usd across sessions
  * session_count = total number of sessions (including null-numeric ones)
- Mark ship `[x]` in the timeline with merge date and total cost
- Run: just advance-cycle SPEC-001 ship
- Run: just archive-spec SPEC-001  (moves spec + timeline into done/)
- REQUIRED: capture accomplishment — just brag "SPEC-001: stood up Vite + React 18 + TS strict skeleton with enforced engine-no-dom ESLint boundary and CI (lint/typecheck/test/build)"
- Update STAGE-001 backlog: mark SPEC-001 as shipped

If any template/constraint/decision updates were mentioned in Reflection (Ship),
propose the edits now (do not commit without showing me).

If a follow-up spec was mentioned, add it to the STAGE-001 backlog with a
one-line summary — do NOT write the full spec (that is Prompt 2b).

SPEC-001 is NOT the last spec in STAGE-001 (SPEC-002, SPEC-003, SPEC-004 are
pending) — do not run Prompt 1d yet.
```
