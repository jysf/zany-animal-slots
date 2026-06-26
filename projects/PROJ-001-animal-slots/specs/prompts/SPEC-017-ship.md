# SPEC-017 — SHIP prompt (fresh session!)

> Copy everything in the box into a NEW Claude session. You are shipping
> an approved PR. The spec file and PR are your only context.

```
Cycle: ship. PR #17 for SPEC-017 is approved (verified 2026-06-25).

Read files in order:
1. /AGENTS.md — esp. §4 (cost tracking), §8 (cycle model), §15 (ship rules)
2. /projects/PROJ-001-animal-slots/specs/SPEC-017-auto-spin-toggle.md — the spec (all sections)
3. /projects/PROJ-001-animal-slots/specs/SPEC-017-auto-spin-toggle-timeline.md — current timeline state
4. /projects/PROJ-001-animal-slots/stages/STAGE-003-reels-ui-and-spin-flow.md — the parent stage

Before merging, mark ship `[~]` in:
  projects/PROJ-001-animal-slots/specs/SPEC-017-auto-spin-toggle-timeline.md

Pre-ship checklist:
[ ] CI passing? (check all checks green on PR #17)
[ ] Deployment steps? (static SPA — no deploy step until STAGE-006 wires Cloudflare Pages)
[ ] Rollback plan? (git revert merge commit; app is not yet deployed so blast radius is zero)
[ ] CHANGELOG? (no CHANGELOG required for this project at this stage)

Merge PR #17:
  gh pr merge 17 --merge --delete-branch

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
   recorded_at: 2026-06-25,
   notes: "main-loop, not separately metered (AGENTS §4); ship cycle")
- Compute `cost.totals` from ALL sessions (design + build + verify + ship):
  * tokens_total = sum of non-null tokens_total across sessions
  * estimated_usd = sum of non-null estimated_usd across sessions
  * session_count = total number of sessions (including null-numeric ones)
- Mark ship `[x]` in the timeline with merge date and total cost
- Run: just advance-cycle SPEC-017 ship
- Run: just archive-spec SPEC-017  (moves spec + timeline into done/)
- REQUIRED: capture accomplishment — just brag "SPEC-017: auto-spin toggle — pressing Auto starts back-to-back timed spins (each SPIN_DURATION_MS=700ms spin + AUTO_SPIN_DELAY_MS=400ms inter-spin delay); stops automatically on jackpot, count exhaustion (AUTO_SPIN_COUNT=10), or balance < bet (DEC-005 affordability); toggling Auto off at any time clears the inter-spin timer immediately; ref-based continuation (autoRef + spinRef) eliminates stale-closure bugs across 10 sequential spins; Spin/bet±/Reset locked during auto-spin while Auto button stays enabled (escape hatch); aria-pressed reflects active state; all touch targets ≥44px; engine untouched (DEC-001); all six new tests plus full suite pass (117/117); STAGE-003 continues"
- THIS IS THE SIXTH SPEC IN STAGE-003 — after archiving, check the STAGE-003
  backlog; SPEC-018 (winning-line highlight) remains before STAGE-003 can ship.
  Do NOT trigger a Stage Ship; STAGE-003 continues.

If any template/constraint/decision updates were mentioned in Reflection (Ship),
propose the edits now (do not commit without showing me).

If a follow-up spec was mentioned, add it to the STAGE-003 backlog with
a one-line summary — do NOT write the full spec (that is a separate design cycle).

Note: The build and verify cost sessions have tokens_total: null with
"orchestrator to fill tokens_total from subagent_tokens" notes. If the
orchestrator's subagent_tokens are now available, fill them in before computing
totals. Otherwise leave as null — cost.totals will reflect partial data.

Decisions referenced: DEC-001 (engine/presentation separation — auto-spin is a
pure UI loop over spin(); engine directory untouched; UI imports via
src/engine/index.ts only; no DOM imports in src/engine/**), DEC-005 (play-money
model — balance < bet is the affordability stop guard; no real currency).
All honored; no new DEC-* emitted by this build.
```
