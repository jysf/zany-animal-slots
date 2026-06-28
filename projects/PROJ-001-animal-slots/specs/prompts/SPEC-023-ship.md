# SPEC-023 — SHIP prompt (fresh session!)

> Copy everything in the box into a NEW Claude session. You are shipping
> an approved PR. The spec file and PR are your only context.

```
Cycle: ship. PR #23 for SPEC-023 is approved (verified 2026-06-27).

Read files in order:
1. /AGENTS.md — esp. §4 (cost tracking), §8 (cycle model), §15 (ship rules)
2. /projects/PROJ-001-animal-slots/specs/SPEC-023-payline-paw-print-trail.md — the spec (all sections)
3. /projects/PROJ-001-animal-slots/specs/SPEC-023-payline-paw-print-trail-timeline.md — current timeline state
4. /projects/PROJ-001-animal-slots/stages/STAGE-004-win-celebration-and-juice.md — the parent stage

Before merging, mark ship `[~]` in:
  projects/PROJ-001-animal-slots/specs/SPEC-023-payline-paw-print-trail-timeline.md

Pre-ship checklist:
[ ] CI passing? (check all checks green on PR #23)
[ ] Deployment steps? (static SPA — no deploy step until STAGE-006 wires Cloudflare Pages)
[ ] Rollback plan? (git revert merge commit; app is not yet deployed so blast radius is zero)
[ ] CHANGELOG? (no CHANGELOG required for this project at this stage)

Merge PR #23:
  gh pr merge 23 --squash --delete-branch

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
- Run: just advance-cycle SPEC-023 ship
- Run: just archive-spec SPEC-023  (moves spec + timeline into done/)
- REQUIRED: capture accomplishment — just brag "SPEC-023: payline paw-print trail — a 🐾 pops onto each winning cell after a spin resolves, staggered left→right via CSS @keyframes paw-trail-pop (transform/opacity, GPU-composited per DEC-004) with per-reel delay driven by the --reel-index custom property already set by the reel container; paw is aria-hidden + pointer-events: none (decorative); keyed on celebration.id (SPEC-021) so identical back-to-back wins re-animate; prefers-reduced-motion path shows paws statically (animation: none falls through to the base opacity: 0.85 rule); .reel__cell gets position: relative as containing block without disturbing SPEC-018 box-shadow; CSS is token-only, no raw hex (DEC-010), lives in reels.css (no new file, DEC-010); engine untouched (DEC-001); no new deps; 167/167 tests green (+7 paw tests: 5 ReelGrid, 1 Game, 1 CSS-contract); fifth STAGE-004 spec"
- THIS IS NOT THE LAST SPEC IN STAGE-004 — do NOT trigger a Stage Ship.
  STAGE-004 continues with SPEC-024 (particle effects), SPEC-025 (jackpot moment),
  SPEC-026 (mute toggle), SPEC-027 (tier-scaled jingle).
  Simply note the stage remains active in your summary.

If any template/constraint/decision updates were mentioned in Reflection (Ship),
propose the edits now (do not commit without showing me).

If a follow-up spec was mentioned, add it to the backlog with a one-line
summary — do NOT write the full spec (that is a separate design cycle).

Note: The build and verify cost sessions have tokens_total: null with
"orchestrator to fill tokens_total from subagent_tokens" notes. If the
orchestrator's subagent_tokens are now available, fill them in before computing
totals. Otherwise leave as null — cost.totals will reflect partial data.

Decisions referenced: DEC-001 (engine/presentation separation — paws mark cells
from lineWins via the existing winningCellKeys helper; no engine change, no game
math; engine directory untouched; UI imports only via src/engine/index.ts),
DEC-004 (CSS keyframe animation — paw-trail-pop uses transform/opacity only,
GPU-composited; reduced-motion path sets animation: none in the existing
prefers-reduced-motion block), DEC-006 (🐾 emoji art as placeholder, consistent
with the symbol set; zero asset pipeline), DEC-010 (global CSS + design tokens —
paw CSS lives in reels.css with the other cell styles; .reel__paw class is
prefixed per BEM-ish convention; all values use var(--token), no raw hex).
All honored; no new DEC-* emitted by this build.
```
