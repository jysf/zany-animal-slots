# SPEC-022 — SHIP prompt (fresh session!)

> Copy everything in the box into a NEW Claude session. You are shipping
> an approved PR. The spec file and PR are your only context.

```
Cycle: ship. PR #22 for SPEC-022 is approved (verified 2026-06-27).

Read files in order:
1. /AGENTS.md — esp. §4 (cost tracking), §8 (cycle model), §15 (ship rules)
2. /projects/PROJ-001-animal-slots/specs/SPEC-022-balance-count-up.md — the spec (all sections)
3. /projects/PROJ-001-animal-slots/specs/SPEC-022-balance-count-up-timeline.md — current timeline state
4. /projects/PROJ-001-animal-slots/stages/STAGE-004-win-celebration-and-juice.md — the parent stage

Before merging, mark ship `[~]` in:
  projects/PROJ-001-animal-slots/specs/SPEC-022-balance-count-up-timeline.md

Pre-ship checklist:
[ ] CI passing? (check all checks green on PR #22)
[ ] Deployment steps? (static SPA — no deploy step until STAGE-006 wires Cloudflare Pages)
[ ] Rollback plan? (git revert merge commit; app is not yet deployed so blast radius is zero)
[ ] CHANGELOG? (no CHANGELOG required for this project at this stage)

Merge PR #22:
  gh pr merge 22 --squash --delete-branch

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
   recorded_at: 2026-06-27,
   notes: "main-loop, not separately metered (AGENTS §4); ship cycle")
- Compute `cost.totals` from ALL sessions (design + build + verify + ship):
  * tokens_total = sum of non-null tokens_total across sessions
  * estimated_usd = sum of non-null estimated_usd across sessions
  * session_count = total number of sessions (including null-numeric ones)
- Mark ship `[x]` in the timeline with merge date and total cost
- Run: just advance-cycle SPEC-022 ship
- Run: just archive-spec SPEC-022  (moves spec + timeline into done/)
- REQUIRED: capture accomplishment — just brag "SPEC-022: balance count-up — on a win, the Status balance display ticks old→new over 800ms via a JS setInterval tween in useCountUp (DEC-012: deliberate numeric-tween exception to DEC-004); snaps instantly under prefers-reduced-motion via a defensive prefersReducedMotion() JS helper (returns false when matchMedia unavailable); tween is keyed on celebration.id (SPEC-021 signal) so it fires exactly once per win; target in deps means a no-win balance change snaps; in-flight tween interrupted by next spin snaps cleanly via effect cleanup; prefersReducedMotion.ts + useCountUp.ts are first consumer of the celebration signal; no new deps, no CSS file added; engine untouched (DEC-001); 160/160 tests green (+12 new: 3 prefersReducedMotion + 7 useCountUp + 1 Status count-up + 1 Status instant-snap guard); fourth STAGE-004 spec"
- THIS IS NOT THE LAST SPEC IN STAGE-004 — do NOT trigger a Stage Ship.
  STAGE-004 continues with SPEC-023 (paw-print trail), SPEC-024 (particles),
  SPEC-025 (jackpot moment), SPEC-026 (mute toggle), SPEC-027 (jingle).
  Simply note the stage remains active in your summary.

If any template/constraint/decision updates were mentioned in Reflection (Ship),
propose the edits now (do not commit without showing me).

If a follow-up spec was mentioned, add it to the backlog with a one-line
summary — do NOT write the full spec (that is a separate design cycle).

Note: The build and verify cost sessions have tokens_total: null with
"orchestrator to fill tokens_total from subagent_tokens" notes. If the
orchestrator's subagent_tokens are now available, fill them in before computing
totals. Otherwise leave as null — cost.totals will reflect partial data.

Decisions referenced: DEC-001 (engine/presentation separation — count-up reads
only the engine-derived celebration.totalWin and balance from useSlotMachine; no
game logic in the UI; engine directory untouched; UI imports engine only via
src/engine/index.ts), DEC-004 (CSS for celebrations — this spec is the narrow
numeric-tween exception documented in DEC-012; paw-print trail, particles, and
jackpot moment remain CSS per DEC-004), DEC-012 (the count-up is a JS setInterval
tween with a JS reduced-motion snap via prefersReducedMotion(); no CSS file added;
setInterval chosen over rAF for fake-timer testability).
All honored; no new DEC-* emitted by this build (DEC-012 was authored at design).
```
