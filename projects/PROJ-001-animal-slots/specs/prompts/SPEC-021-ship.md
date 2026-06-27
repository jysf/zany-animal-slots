# SPEC-021 — SHIP prompt (fresh session!)

> Copy everything in the box into a NEW Claude session. You are shipping
> an approved PR. The spec file and PR are your only context.

```
Cycle: ship. PR #21 for SPEC-021 is approved (verified 2026-06-27).

Read files in order:
1. /AGENTS.md — esp. §4 (cost tracking), §8 (cycle model), §15 (ship rules)
2. /projects/PROJ-001-animal-slots/specs/SPEC-021-win-state-router.md — the spec (all sections)
3. /projects/PROJ-001-animal-slots/specs/SPEC-021-win-state-router-timeline.md — current timeline state
4. /projects/PROJ-001-animal-slots/stages/STAGE-004-win-celebration-and-juice.md — the parent stage

Before merging, mark ship `[~]` in:
  projects/PROJ-001-animal-slots/specs/SPEC-021-win-state-router-timeline.md

Pre-ship checklist:
[ ] CI passing? (check all checks green on PR #21)
[ ] Deployment steps? (static SPA — no deploy step until STAGE-006 wires Cloudflare Pages)
[ ] Rollback plan? (git revert merge commit; app is not yet deployed so blast radius is zero)
[ ] CHANGELOG? (no CHANGELOG required for this project at this stage)

Merge PR #21:
  gh pr merge 21 --squash --delete-branch

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
- Run: just advance-cycle SPEC-021 ship
- Run: just archive-spec SPEC-021  (moves spec + timeline into done/)
- REQUIRED: capture accomplishment — just brag "SPEC-021: win-state router — exports a Celebration interface { id, tier, totalWin, lineWins } from useSlotMachine; celebration is set (with monotonically-increasing id) on a winning spin resolve and null on a loss; celebrationIdRef is a useRef never reset, so ids stay strictly increasing across resets; reset() clears celebration to null; pure UI state derived from SpinResult — engine untouched (DEC-001); no faked anticipation (DEC-005); 148/148 tests green including 6 new celebration tests covering null-start, win (seed 276 big/55/3), loss (seed 12345), jackpot (seed 407947/2000), id monotonicity, and reset; foundation for SPEC-022–027 celebration consumers"
- THIS IS THE THIRD SPEC IN STAGE-004 — do NOT trigger a Stage Ship.
  STAGE-004 continues with remaining win-celebration specs (SPEC-022 balance
  count-up, SPEC-023 paw-print trail, SPEC-024 particles, SPEC-025 jackpot
  moment, SPEC-027 jingle). Simply note the stage remains active in your summary.

If any template/constraint/decision updates were mentioned in Reflection (Ship),
propose the edits now (do not commit without showing me).

If a follow-up spec was mentioned, add it to the backlog with a one-line
summary — do NOT write the full spec (that is a separate design cycle).

Note: The build and verify cost sessions have tokens_total: null with
"orchestrator to fill tokens_total from subagent_tokens" notes. If the
orchestrator's subagent_tokens are now available, fill them in before computing
totals. Otherwise leave as null — cost.totals will reflect partial data.

Decisions referenced: DEC-001 (engine/presentation separation — celebration is
derived solely from SpinResult fields tier/totalWin/lineWins returned by the
engine; no game logic in the hook; engine directory untouched; UI imports engine
only via src/engine/index.ts), DEC-005 (play-money model — celebration fires only
on totalWin > 0; a no-win yields null; no faked or anticipated celebration).
All honored; no new DEC-* emitted by this build.
```
