# SPEC-020 — SHIP prompt (fresh session!)

> Copy everything in the box into a NEW Claude session. You are shipping
> an approved PR. The spec file and PR are your only context.

```
Cycle: ship. PR #20 for SPEC-020 is approved (verified 2026-06-27).

Read files in order:
1. /AGENTS.md — esp. §4 (cost tracking), §8 (cycle model), §15 (ship rules)
2. /projects/PROJ-001-animal-slots/specs/SPEC-020-paytable-sheet.md — the spec (all sections)
3. /projects/PROJ-001-animal-slots/specs/SPEC-020-paytable-sheet-timeline.md — current timeline state
4. /projects/PROJ-001-animal-slots/stages/STAGE-004-win-celebration-and-juice.md — the parent stage

Before merging, mark ship `[~]` in:
  projects/PROJ-001-animal-slots/specs/SPEC-020-paytable-sheet-timeline.md

Pre-ship checklist:
[ ] CI passing? (check all checks green on PR #20)
[ ] Deployment steps? (static SPA — no deploy step until STAGE-006 wires Cloudflare Pages)
[ ] Rollback plan? (git revert merge commit; app is not yet deployed so blast radius is zero)
[ ] CHANGELOG? (no CHANGELOG required for this project at this stage)

Merge PR #20:
  gh pr merge 20 --merge --delete-branch

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
- Run: just advance-cycle SPEC-020 ship
- Run: just archive-spec SPEC-020  (moves spec + timeline into done/)
- REQUIRED: capture accomplishment — just brag "SPEC-020: paytable sheet — an always-present 'ℹ Paytable' trigger in the header opens a slide-up overlay sheet listing all four symbol tiers (jackpot → high → mid → low) with their emoji and 3/4/5-of-a-kind multipliers read straight from the engine PAYTABLE (DEC-011 values: jackpot 8×/40×/200×, low 0.5×/2×/5×); closable by ✕, backdrop click, or Esc; conditional render so no dialog in the DOM until opened; slide-up @keyframes with prefers-reduced-motion: reduce fallback; trigger and close button ≥44px (--space-7=48px); .cabinet { position: relative } scopes the absolute overlay to the cabinet frame without breaking flex layout; zero raw hex (tokens only, DEC-010); engine untouched (DEC-001); 142/142 tests green including 4 paytableRows unit tests and 5 PaytableSheet RTL tests covering all three close paths; second STAGE-004 spec — win-celebration stage continues"
- THIS IS THE SECOND SPEC IN STAGE-004 — do NOT trigger a Stage Ship.
  STAGE-004 continues with remaining win-celebration specs. Simply note the
  stage remains active in your summary.

If any template/constraint/decision updates were mentioned in Reflection (Ship),
propose the edits now (do not commit without showing me).

If a follow-up spec was mentioned, add it to the backlog with a one-line
summary — do NOT write the full spec (that is a separate design cycle).

Note: The build and verify cost sessions have tokens_total: null with
"orchestrator to fill tokens_total from subagent_tokens" notes. If the
orchestrator's subagent_tokens are now available, fill them in before computing
totals. Otherwise leave as null — cost.totals will reflect partial data.

Decisions referenced: DEC-001 (engine/presentation separation — paytableRows()
reads PAYTABLE/SYMBOL_TIER/SYMBOLS only via src/engine/index.ts; engine directory
untouched; no DOM imports added to src/engine/**), DEC-004 (CSS keyframe
animation — slide-up @keyframes paytable-slide-up with prefers-reduced-motion
fallback), DEC-006 (emoji from SYMBOL_DISPLAY in UI layer; engine uses IDs),
DEC-010 (global CSS + design tokens — paytable.css uses only var(--token) values;
prefixed .paytable__* class names), DEC-011 (PAYTABLE values jackpot [8,40,200]
high [3,10,40] mid [1,4,12] low [0.5,2,5] — read from engine, never re-stated).
All honored; no new DEC-* emitted by this build.
```
