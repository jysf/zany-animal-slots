# SPEC-033 — SHIP prompt (fresh session!)

> Copy everything in the box into a NEW Claude session. You are shipping
> an approved PR. The spec file and PR are your only context.

```
Cycle: ship. PR #33 for SPEC-033 is approved (verified 2026-06-28).

Read files in order:
1. /AGENTS.md — esp. §4 (cost tracking), §8 (cycle model), §15 (ship rules)
2. /projects/PROJ-001-animal-slots/specs/SPEC-033-colorblind-safe-state-cues.md — the spec (all sections)
3. /projects/PROJ-001-animal-slots/specs/SPEC-033-colorblind-safe-state-cues-timeline.md — current timeline state
4. /projects/PROJ-001-animal-slots/stages/STAGE-005-audio-suite-a11y-and-polish.md — the parent stage

Before merging, mark ship `[~]` in:
  projects/PROJ-001-animal-slots/specs/SPEC-033-colorblind-safe-state-cues-timeline.md

Pre-ship checklist:
[ ] CI passing? (check all checks green on PR #33)
[ ] Deployment steps? (static SPA — no deploy step until STAGE-006 wires Cloudflare Pages)
[ ] Rollback plan? (git revert merge commit; app is not yet deployed so blast radius is zero)
[ ] CHANGELOG? (no CHANGELOG required for this project at this stage)

Merge PR #33:
  gh pr merge 33 --squash --delete-branch

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
   recorded_at: 2026-06-28,
   notes: "main-loop, not separately metered (AGENTS §4); ship cycle")
- Compute `cost.totals` from ALL sessions (design + build + verify + ship):
  * tokens_total = sum of non-null tokens_total across sessions
    (build and verify have null with "orchestrator to fill" notes — fill
     them in from the orchestrator's subagent_tokens for those two Agent
     calls before summing; otherwise leave null and note partial data)
  * estimated_usd = sum of non-null estimated_usd across sessions
  * session_count = total number of sessions (including null-numeric ones)
- Mark ship `[x]` in the timeline with merge date and total cost
- Run: just advance-cycle SPEC-033 ship
- Run: just archive-spec SPEC-033  (moves spec + timeline into done/)
- REQUIRED: capture accomplishment — just brag "SPEC-033: Colorblind-safe state cues — WinBadge gains a tier word (WIN / BIG WIN / JACKPOT) before the amount, making win tier legible without relying on color; data-tier in the DOM for CSS targeting; redundant tier border color via --color-win-small/--color-win-big/--color-jackpot tokens (backup, not sole cue); Game threads celebration.tier; engine untouched, no new deps; 249/249 tests green (+5 tests); 6th of 7 SPECs in STAGE-005"

NOTE: This is NOT the last spec in STAGE-005 (6/7 — the remaining spec
is the perf pass: SPEC-034).
Do NOT trigger a Stage Ship after archiving.
Continue with SPEC-034 (Performance pass, ~60fps).

If any template/constraint/decision updates were mentioned in Reflection (Ship),
propose the edits now (do not commit without showing me).

If a follow-up spec was mentioned, add it to the backlog with a one-line
summary — do NOT write the full spec (that is a separate design cycle).

Decisions referenced: DEC-006 (emoji symbols already shape-distinct — this spec
adds the text tier word as the primary colorblind-safe cue), DEC-010 (tier border
colors use existing --color-win-* tokens, no raw hex), DEC-001 (pure presentation;
engine untouched; WinTier imported as a type-only from src/engine/index.ts);
no new DEC-* emitted by this build.
```
