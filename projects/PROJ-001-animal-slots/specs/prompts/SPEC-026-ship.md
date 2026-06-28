# SPEC-026 — SHIP prompt (fresh session!)

> Copy everything in the box into a NEW Claude session. You are shipping
> an approved PR. The spec file and PR are your only context.

```
Cycle: ship. PR #26 for SPEC-026 is approved (verified 2026-06-27).

Read files in order:
1. /AGENTS.md — esp. §4 (cost tracking), §8 (cycle model), §15 (ship rules)
2. /projects/PROJ-001-animal-slots/specs/SPEC-026-mute-toggle-and-audio-unlock.md — the spec (all sections)
3. /projects/PROJ-001-animal-slots/specs/SPEC-026-mute-toggle-and-audio-unlock-timeline.md — current timeline state
4. /projects/PROJ-001-animal-slots/stages/STAGE-004-win-celebration-and-juice.md — the parent stage

Before merging, mark ship `[~]` in:
  projects/PROJ-001-animal-slots/specs/SPEC-026-mute-toggle-and-audio-unlock-timeline.md

Pre-ship checklist:
[ ] CI passing? (check all checks green on PR #26)
[ ] Deployment steps? (static SPA — no deploy step until STAGE-006 wires Cloudflare Pages)
[ ] Rollback plan? (git revert merge commit; app is not yet deployed so blast radius is zero)
[ ] CHANGELOG? (no CHANGELOG required for this project at this stage)

Merge PR #26:
  gh pr merge 26 --squash --delete-branch

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
- Run: just advance-cycle SPEC-026 ship
- Run: just archive-spec SPEC-026  (moves spec + timeline into done/)
- REQUIRED: capture accomplishment — just brag "SPEC-026: mute toggle + first-gesture audio unlock — persisted global mute (localStorage key 'mute', default unmuted) + first-gesture unlock (pointerdown/keydown on document, { once: true } + cleanup, no listener leak); MuteToggle button (🔊/🔇, aria-pressed, aria-label, ≥44px via var(--space-7)=48px, token-only CSS, no raw hex, DEC-010) wired into the header flex row alongside PaytableSheet; useAudio hook (useState lazy-init from readMute, useCallback toggleMute flips+persists, useEffect gesture listener); no Tone.js, no sound, no new deps; engine untouched (DEC-001); audio gate satisfies audio-gesture-and-mute constraint + DEC-007 foundation for SPEC-027 jingle; 193/193 tests green (+12 tests); eighth SPEC in STAGE-004"
- THIS IS NOT THE LAST SPEC IN STAGE-004 — do NOT trigger a Stage Ship.
  STAGE-004 continues with SPEC-027 (tier-scaled synthesized win jingle via Tone.js),
  which is the final spec in this stage.
  Simply note the stage remains active in your summary.

If any template/constraint/decision updates were mentioned in Reflection (Ship),
propose the edits now (do not commit without showing me).

If a follow-up spec was mentioned, add it to the backlog with a one-line
summary — do NOT write the full spec (that is a separate design cycle).

Decisions referenced: DEC-007 (audio gated behind first gesture + persisted mute —
this spec implements that gate; src/ui/audio/** created; no sound yet, SPEC-027
adds the jingle), DEC-001 (pure UI concern — no engine involvement, engine
directory untouched, no game logic changes), DEC-010 (global CSS + design tokens —
audio.css with .mute-toggle prefix, all colors/sizes via var() tokens, no raw hex;
regions.css adds .cabinet__header-controls flex wrapper, also token-only).
All honored; no new DEC-* emitted by this build.
```
