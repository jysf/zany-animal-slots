# SPEC-027 — SHIP prompt (fresh session!)

> Copy everything in the box into a NEW Claude session. You are shipping
> an approved PR. The spec file and PR are your only context.

```
Cycle: ship. PR #27 for SPEC-027 is approved (verified 2026-06-27).

Read files in order:
1. /AGENTS.md — esp. §4 (cost tracking), §8 (cycle model), §15 (ship rules)
2. /projects/PROJ-001-animal-slots/specs/SPEC-027-tier-scaled-win-jingle.md — the spec (all sections)
3. /projects/PROJ-001-animal-slots/specs/SPEC-027-tier-scaled-win-jingle-timeline.md — current timeline state
4. /projects/PROJ-001-animal-slots/stages/STAGE-004-win-celebration-and-juice.md — the parent stage

Before merging, mark ship `[~]` in:
  projects/PROJ-001-animal-slots/specs/SPEC-027-tier-scaled-win-jingle-timeline.md

Pre-ship checklist:
[ ] CI passing? (check all checks green on PR #27)
[ ] Deployment steps? (static SPA — no deploy step until STAGE-006 wires Cloudflare Pages)
[ ] Rollback plan? (git revert merge commit; app is not yet deployed so blast radius is zero)
[ ] CHANGELOG? (no CHANGELOG required for this project at this stage)

Merge PR #27:
  gh pr merge 27 --squash --delete-branch

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
    (build and verify have null with "orchestrator to fill" notes — fill
     them in from the orchestrator's subagent_tokens for those two Agent
     calls before summing; otherwise leave null and note partial data)
  * estimated_usd = sum of non-null estimated_usd across sessions
  * session_count = total number of sessions (including null-numeric ones)
- Mark ship `[x]` in the timeline with merge date and total cost
- Run: just advance-cycle SPEC-027 ship
- Run: just archive-spec SPEC-027  (moves spec + timeline into done/)
- REQUIRED: capture accomplishment — just brag "SPEC-027: tier-scaled synthesized win jingle (Tone.js) — JINGLE_NOTES (small=3/big=5/jackpot=7 notes), playJingle() with Tone.start() + Synth.triggerAttackRelease(); useWinJingle() fires once per celebration.id, gated by !muted && unlocked (reads at effect time, keyed on id only); wired into App; tone@15.1.22 (MIT, DEC-007-authorized) added to dependencies; engine untouched; 203/203 tests green (+10 tests); 9th and final SPEC in STAGE-004"

THIS IS THE LAST SPEC IN STAGE-004 (9/9). After archiving:
  STOP at the stage boundary.
  Do NOT auto-run a Stage Ship.
  Instead, offer the Stage Ship (Prompt 1d) to the orchestrator/user with
  a one-line summary: "STAGE-004 backlog is complete (9/9 specs shipped).
  Ready for Stage Ship — run Prompt 1d to reflect, brag, and mark
  STAGE-004 shipped."

If any template/constraint/decision updates were mentioned in Reflection (Ship),
propose the edits now (do not commit without showing me).

If a follow-up spec was mentioned, add it to the backlog with a one-line
summary — do NOT write the full spec (that is a separate design cycle).

Decisions referenced: DEC-007 (synthesized Tone.js audio, win-jingle only, gated
by first-gesture unlock + persisted mute — this spec IS that jingle; tone dep
explicitly authorized by this decision), DEC-001 (engine unchanged; WinTier
imported from src/engine/index public interface, not internals), DEC-005 (jingle
plays only on real wins via celebration.tier !== 'none'; nothing faked).
All honored; no new DEC-* emitted by this build.
```
