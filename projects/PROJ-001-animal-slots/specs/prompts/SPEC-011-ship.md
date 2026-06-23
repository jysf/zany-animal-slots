# SPEC-011 — SHIP prompt (fresh session!)

> Copy everything in the box into a NEW Claude session. You are shipping
> an approved PR. The spec file and PR are your only context.

```
Cycle: ship. PR #11 for SPEC-011 is approved (verified 2026-06-23).

Read files in order:
1. /AGENTS.md — esp. §4 (cost tracking), §8 (cycle model), §15 (ship rules)
2. /projects/PROJ-001-animal-slots/specs/SPEC-011-public-engine-interface.md — the spec (all sections)
3. /projects/PROJ-001-animal-slots/specs/SPEC-011-public-engine-interface-timeline.md — current timeline state
4. /projects/PROJ-001-animal-slots/stages/STAGE-002-slot-engine.md — the parent stage

Before merging, mark ship `[~]` in:
  projects/PROJ-001-animal-slots/specs/SPEC-011-public-engine-interface-timeline.md

Pre-ship checklist:
[ ] CI passing? (check all checks green on PR #11)
[ ] Deployment steps? (static SPA — no deploy step until STAGE-006 wires Cloudflare Pages)
[ ] Rollback plan? (git revert merge commit; app is not yet deployed so blast radius is zero)
[ ] CHANGELOG? (no CHANGELOG required for this project at this stage)

Merge PR #11:
  gh pr merge 11 --merge --delete-branch

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
- Run: just advance-cycle SPEC-011 ship
- Run: just archive-spec SPEC-011  (moves spec + timeline into done/)
- REQUIRED: capture accomplishment — just brag "SPEC-011: delivered the public engine interface — spin() composing debit→resolveGrid→evaluatePaylines→credit→classifyWin into one typed SpinOutcome; full re-export surface (BET_LEVELS, PAYLINES, PAYTABLE, SYMBOLS, nextBet, prevBet, canAfford + all types) so UI imports only src/engine/index.ts; 9/9 tests green incl. 3 pinned full-spin fixtures; all gates pass — STAGE-002 backlog complete"
- THIS IS THE LAST SPEC IN STAGE-002 — after archiving, the STAGE-002 backlog
  is complete. Do NOT trigger the Stage Ship yourself; the orchestrator handles
  the STAGE-002 boundary (prompt: STAGE-002 boundary stop + summary, task #10).

If any template/constraint/decision updates were mentioned in Reflection (Ship),
propose the edits now (do not commit without showing me).

If a follow-up spec was mentioned, add it to the STAGE-003 backlog with
a one-line summary — do NOT write the full spec (that is Prompt 2b).

Note: The build and verify cost sessions have tokens_total: null with
"orchestrator to fill tokens_total from subagent_tokens" notes. If the
orchestrator's subagent_tokens are now available, fill them in before computing
totals. Otherwise leave as null — cost.totals will reflect partial data.

Decisions referenced: DEC-001 (engine/presentation separation — index.ts IS the boundary),
DEC-002 (injected seed — spin takes seed, no Math.random()),
DEC-005 (play-money — unaffordable spin is typed outcome, never throw).
All honored; no new DEC-* emitted by this build.
```
