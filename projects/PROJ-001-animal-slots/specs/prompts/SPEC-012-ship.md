# SPEC-012 — SHIP prompt (fresh session!)

> Copy everything in the box into a NEW Claude session. You are shipping
> an approved PR. The spec file and PR are your only context.

```
Cycle: ship. PR #12 for SPEC-012 is approved (verified 2026-06-23).

Read files in order:
1. /AGENTS.md — esp. §4 (cost tracking), §8 (cycle model), §15 (ship rules)
2. /projects/PROJ-001-animal-slots/specs/SPEC-012-reel-grid-component.md — the spec (all sections)
3. /projects/PROJ-001-animal-slots/specs/SPEC-012-reel-grid-component-timeline.md — current timeline state
4. /projects/PROJ-001-animal-slots/stages/STAGE-003-reels-ui-and-spin-flow.md — the parent stage

Before merging, mark ship `[~]` in:
  projects/PROJ-001-animal-slots/specs/SPEC-012-reel-grid-component-timeline.md

Pre-ship checklist:
[ ] CI passing? (check all checks green on PR #12)
[ ] Deployment steps? (static SPA — no deploy step until STAGE-006 wires Cloudflare Pages)
[ ] Rollback plan? (git revert merge commit; app is not yet deployed so blast radius is zero)
[ ] CHANGELOG? (no CHANGELOG required for this project at this stage)

Merge PR #12:
  gh pr merge 12 --merge --delete-branch

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
- Run: just advance-cycle SPEC-012 ship
- Run: just archive-spec SPEC-012  (moves spec + timeline into done/)
- REQUIRED: capture accomplishment — just brag "SPEC-012: delivered the ReelGrid component — first STAGE-003 spec; 5×3 emoji board rendering engine Grid data in the Game region; SYMBOL_DISPLAY maps all 8 DEC-006 symbols (🦌🦊🐿️🐻🦅🦉🦬🐺); token-driven layout (no raw hex), portrait-first; pure function of grid prop so SPEC-013 can feed live spins; 6/6 new tests green across ReelGrid.test.tsx + Game.test.tsx; all gates pass — STAGE-003 UI surface now visible"
- THIS IS THE FIRST SPEC IN STAGE-003 — after archiving, check the STAGE-003
  backlog; SPEC-013 (spin button + flow) is next. Do NOT trigger a Stage Ship;
  STAGE-003 continues.

If any template/constraint/decision updates were mentioned in Reflection (Ship),
propose the edits now (do not commit without showing me).

If a follow-up spec was mentioned, add it to the STAGE-003 backlog with
a one-line summary — do NOT write the full spec (that is a separate design cycle).

Note: The build and verify cost sessions have tokens_total: null with
"orchestrator to fill tokens_total from subagent_tokens" notes. If the
orchestrator's subagent_tokens are now available, fill them in before computing
totals. Otherwise leave as null — cost.totals will reflect partial data.

Decisions referenced: DEC-001 (engine/presentation separation — UI imports only
src/engine/index, engine is glyph-free), DEC-006 (emoji symbol set — 8 wildlife
emoji mapped in SYMBOL_DISPLAY), DEC-010 (global CSS + tokens — reels.css uses
var(--…) throughout, no raw hex, BEM-ish class names .reel-grid/.reel/.reel__cell).
All honored; no new DEC-* emitted by this build.
```
