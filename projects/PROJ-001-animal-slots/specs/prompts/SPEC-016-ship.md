# SPEC-016 — SHIP prompt (fresh session!)

> Copy everything in the box into a NEW Claude session. You are shipping
> an approved PR. The spec file and PR are your only context.

```
Cycle: ship. PR #16 for SPEC-016 is approved (verified 2026-06-23).

Read files in order:
1. /AGENTS.md — esp. §4 (cost tracking), §8 (cycle model), §15 (ship rules)
2. /projects/PROJ-001-animal-slots/specs/SPEC-016-reel-spin-stop-animation.md — the spec (all sections)
3. /projects/PROJ-001-animal-slots/specs/SPEC-016-reel-spin-stop-animation-timeline.md — current timeline state
4. /projects/PROJ-001-animal-slots/stages/STAGE-003-reels-ui-and-spin-flow.md — the parent stage

Before merging, mark ship `[~]` in:
  projects/PROJ-001-animal-slots/specs/SPEC-016-reel-spin-stop-animation-timeline.md

Pre-ship checklist:
[ ] CI passing? (check all checks green on PR #16)
[ ] Deployment steps? (static SPA — no deploy step until STAGE-006 wires Cloudflare Pages)
[ ] Rollback plan? (git revert merge commit; app is not yet deployed so blast radius is zero)
[ ] CHANGELOG? (no CHANGELOG required for this project at this stage)

Merge PR #16:
  gh pr merge 16 --merge --delete-branch

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
- Run: just advance-cycle SPEC-016 ship
- Run: just archive-spec SPEC-016  (moves spec + timeline into done/)
- REQUIRED: capture accomplishment — just brag "SPEC-016: reel spin/stop animation — spin is now timed: pressing Spin immediately enters status 'spinning' (controls frozen, reel CSS animation plays), then after SPIN_DURATION_MS=700ms the engine outcome is revealed (grid + balance) and status returns to 'resolved'; the engine still computes the full outcome up front — the UI only delays the reveal (DEC-001); CSS keyframes use transform/translateY only (GPU-composited, DEC-004); reels stagger left→right via --reel-index custom property; prefers-reduced-motion block disables animation while keeping the reveal (respect-reduced-motion constraint); re-entrant spin is a no-op; unmount cleanup prevents state-update warnings; all four controls disabled while spinning; engine untouched; all gates pass (108/108 tests, typecheck, lint, build); STAGE-003 continues"
- THIS IS THE FIFTH SPEC IN STAGE-003 — after archiving, check the STAGE-003
  backlog; SPEC-017 (auto-spin toggle) and SPEC-018 (winning-line highlight) remain.
  Do NOT trigger a Stage Ship; STAGE-003 continues.

If any template/constraint/decision updates were mentioned in Reflection (Ship),
propose the edits now (do not commit without showing me).

If a follow-up spec was mentioned, add it to the STAGE-003 backlog with
a one-line summary — do NOT write the full spec (that is a separate design cycle).

Note: The build and verify cost sessions have tokens_total: null with
"orchestrator to fill tokens_total from subagent_tokens" notes. If the
orchestrator's subagent_tokens are now available, fill them in before computing
totals. Otherwise leave as null — cost.totals will reflect partial data.

Decisions referenced: DEC-001 (engine/presentation separation — engine computes
outcome up front; UI owns timing only; engine directory untouched, no DOM imports
in src/engine/**), DEC-004 (CSS transforms/keyframes for reel animation — transform
and opacity only; clean reduced-motion path; no canvas/WebGL).
All honored; no new DEC-* emitted by this build.
```
