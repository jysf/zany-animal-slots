# SPEC-027 — BUILD prompt (fresh session — Sonnet)

> Run on **claude-sonnet-4-6** (AGENTS §8).

```
Cycle: build. You are NOT the architect. The spec file is your only context.

Read in order:
1. /AGENTS.md (§5, §11, §12 — UI tests are behavior/state).
2. /projects/PROJ-001-animal-slots/specs/SPEC-027-tier-scaled-win-jingle.md — the
   ENTIRE Implementation Context, Acceptance Criteria, Failing Tests, Notes (drop-in
   code for jingle.ts, useWinJingle.ts, the App wiring, and the test mocks).
3. /projects/PROJ-001-animal-slots/stages/STAGE-004-win-celebration-and-juice.md
4. /decisions/DEC-007 (authorizes Tone.js + the jingle), /decisions/DEC-001,
   /decisions/DEC-005, /decisions/DEC-009 (dep-DEC precedent).
5. /src/ui/audio/useAudio.ts (muted/unlocked), /src/ui/useSlotMachine.ts
   (Celebration, WinTier), /src/ui/App.tsx, /src/ui/useCountUp.ts (fire-once-per-id
   effect pattern), /package.json.
6. /guidance/constraints.yaml — audio-gesture-and-mute, no-new-top-level-deps-without-decision,
   license-policy, test-before-implementation, one-spec-per-pr.

Before coding, branch and mark build `[~]` in the SPEC-027 timeline. If something
needs architect judgment, set `[?]` with a one-line reason and stop.

Branch: git checkout main && git pull --ff-only && git checkout -b feat/spec-027-win-jingle

Install the dependency (DEC-007-authorized — this is the ONE allowed dep add):
  npm install tone
(Do NOT emit a new DEC; DEC-007 already authorizes Tone.js. tone is MIT — fine for
license-policy.)

Implement EXACTLY the spec (Notes give drop-in code):
- src/ui/audio/jingle.ts — export JINGLE_NOTES (small 3 < big 5 < jackpot 7 notes)
  + playJingle(tier): if 'none' no-op; else void start(); new Synth().toDestination();
  triggerAttackRelease each note staggered. Named Tone imports (start, now, Synth).
  A try/catch around the body (audio best-effort) is fine.
- src/ui/audio/useWinJingle.ts — useWinJingle(celebration, { muted, unlocked },
  play = playJingle): useEffect keyed on [celebration?.id] ONLY; inside, return early
  if !celebration || muted || !unlocked || tier==='none'; else play(celebration.tier).
- src/ui/App.tsx — destructure `unlocked` too from useAudio(); call
  useWinJingle(celebration, { muted, unlocked }).
- Tests:
  * useWinJingle.test.ts (renderHook; inject a vi.fn() as the `play` param — NO Tone):
    plays once on a win when unmuted+unlocked (with the tier); not when muted; not
    when locked; not without a celebration; re-plays on a new id; does NOT re-play
    when only mute toggles (same id).
  * jingle.test.ts (vi.mock('tone', …) with a shared triggerAttackRelease spy):
    JINGLE_NOTES lengths strictly increasing; playJingle('none') makes no Tone calls;
    playJingle('small') calls start() once + triggers small.length notes;
    playJingle('jackpot') triggers jackpot.length (more).
- Engine only via src/engine; do NOT modify engine. Keep ALL existing tests green.

NO new DEC. This repo's ESLint has NO react-hooks plugin — do NOT add an
exhaustive-deps disable. @testing-library/user-event is NOT installed — use
renderHook / fireEvent only.

Gate (all exit 0): just typecheck && just lint && just test && just build
(Do NOT attempt a browser/preview check — the orchestrator does the visual check.
 The build size will grow due to tone — that's expected/DEC-007-authorized.)

When done:
1. Fill "## Build Completion" (incl. 3 honest reflection answers). Note the tone
   version installed in Deviations/Follow-up if relevant.
2. Append a build cost session (cycle: build, agent: claude-sonnet-4-6, interface:
   claude-code, tokens_total null + "orchestrator to fill tokens_total from
   subagent_tokens" note).
3. Mark build `[~]` only.
4. Commit locally (message referencing SPEC-027; include package.json + lockfile).
DO NOT git push / open a PR / run gh / run just advance-cycle.
```
