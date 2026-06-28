# SPEC-025 — SHIP prompt (fresh session!)

> Copy everything in the box into a NEW Claude session. You are shipping
> an approved PR. The spec file and PR are your only context.

```
Cycle: ship. PR #25 for SPEC-025 is approved (verified 2026-06-27).

Read files in order:
1. /AGENTS.md — esp. §4 (cost tracking), §8 (cycle model), §15 (ship rules)
2. /projects/PROJ-001-animal-slots/specs/SPEC-025-wolf-jackpot-moment.md — the spec (all sections)
3. /projects/PROJ-001-animal-slots/specs/SPEC-025-wolf-jackpot-moment-timeline.md — current timeline state
4. /projects/PROJ-001-animal-slots/stages/STAGE-004-win-celebration-and-juice.md — the parent stage

Before merging, mark ship `[~]` in:
  projects/PROJ-001-animal-slots/specs/SPEC-025-wolf-jackpot-moment-timeline.md

Pre-ship checklist:
[ ] CI passing? (check all checks green on PR #25)
[ ] Deployment steps? (static SPA — no deploy step until STAGE-006 wires Cloudflare Pages)
[ ] Rollback plan? (git revert merge commit; app is not yet deployed so blast radius is zero)
[ ] CHANGELOG? (no CHANGELOG required for this project at this stage)

Merge PR #25:
  gh pr merge 25 --squash --delete-branch

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
    (build and verify have null with "orchestrator to fill" notes — if
     the orchestrator's subagent_tokens are now available for both, fill
     them in before summing; otherwise leave null and note partial data)
  * estimated_usd = sum of non-null estimated_usd across sessions
  * session_count = total number of sessions (including null-numeric ones)
- Mark ship `[x]` in the timeline with merge date and total cost
- Run: just advance-cycle SPEC-025 ship
- Run: just archive-spec SPEC-025  (moves spec + timeline into done/)
- REQUIRED: capture accomplishment — just brag "SPEC-025: wolf jackpot moment — on the five-Wolf jackpot (celebration.tier === 'jackpot'), a full-cabinet night-sky overlay fires: midnight-sky tint (--color-jackpot-sky via element opacity, no rgba literal), rising moon 🌕, howling wolf 🐺, and JACKPOT! banner, all animated via CSS @keyframes (transform/opacity only, GPU-composited, DEC-004); auto-dismisses after JACKPOT_MOMENT_MS (3500 ms) via useEffect keyed on [id, isJackpot] with clearTimeout cleanup; re-plays on a new jackpot id; scene shows statically under prefers-reduced-motion (DEC-004, respect-reduced-motion); pointer-events: none + role=status + aria-label (a11y); z-index 20 above paytable and particles; token-only CSS no raw hex (DEC-010); 🌕/🐺 emoji art (DEC-006); engine untouched (DEC-001); no new deps; 181/181 tests green (+6 tests); seventh STAGE-004 spec"
- THIS IS NOT THE LAST SPEC IN STAGE-004 — do NOT trigger a Stage Ship.
  STAGE-004 continues with SPEC-026 (mute toggle + first-gesture audio unlock)
  and SPEC-027 (tier-scaled synthesized win jingle).
  Simply note the stage remains active in your summary.

If any template/constraint/decision updates were mentioned in Reflection (Ship),
propose the edits now (do not commit without showing me).

If a follow-up spec was mentioned, add it to the backlog with a one-line
summary — do NOT write the full spec (that is a separate design cycle).

Decisions referenced: DEC-001 (engine/presentation separation — fires on the
engine's jackpot tier from celebration.tier; no engine change, no game math;
engine directory untouched; UI imports only via src/engine/index.ts), DEC-004
(CSS keyframe animation — sky/moon/wolf/banner animate via transform/opacity
@keyframes; static scene under @media prefers-reduced-motion: reduce; no JS
motion check), DEC-006 (🌕 🐺 emoji art consistent with symbol set; zero asset
pipeline), DEC-010 (global CSS + design tokens — jackpot.css with .jackpot-moment*
class names; all colors via var(--color-jackpot-sky)/var(--color-jackpot)/
var(--color-coin); no raw hex).
All honored; no new DEC-* emitted by this build.
```
