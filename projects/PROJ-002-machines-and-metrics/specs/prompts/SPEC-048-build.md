# SPEC-048 — BUILD prompt (fresh session — Sonnet)

> Run on **claude-sonnet-4-6** (AGENTS §8). LOCAL ONLY: branch + local commits.
> NO push, NO PR, NO `gh`, NO `just advance-cycle`. A pure PRESENTATION-slice extension —
> the DEFAULT machine's theme is empty overrides + its audio params ARE today's constants,
> so there is NO observable change and NO frozen-seed concern.

```
Cycle: build. You are NOT the architect. The spec file is your only context.

Read in order:
1. /AGENTS.md (§5 build flow, §8 models, §12 tests).
2. /projects/PROJ-002-machines-and-metrics/specs/SPEC-048-per-machine-theme-and-audio-slice.md
   — the ENTIRE Acceptance Criteria, Failing Tests, Implementation Context, and Notes. The
   Notes contain COMPLETE drop-in code for every file. Implement it VERBATIM.
3. /decisions/DEC-001, DEC-013, DEC-015 (read only).
4. Source (read to edit): src/machines/types.ts, src/machines/wildAndWhimsical.ts,
   src/ui/audio/audioEngine.ts, src/ui/audio/mixer.ts, src/ui/audio/ambientBed.ts,
   src/ui/App.tsx; (read only) src/styles/tokens.css, src/ui/reels/symbols.ts,
   src/machines/wildAndWhimsical.parity.test.ts.

Before coding, branch and mark build [~] in the SPEC-048 timeline.

Branch: git checkout main && git pull --ff-only && git checkout -b feat/spec-048-per-machine-theme-and-audio-slice

Implement EXACTLY the spec (drop-ins in the Notes). New files:
- src/ui/theme/machineTheme.ts (applyTheme + THEME_VARS), src/ui/theme/useMachineTheme.ts,
  src/ui/audio/useMachineAudio.ts — verbatim from the Notes.
Modified files:
- src/machines/types.ts — add ThemeVar, ThemeTokens, MachineAudio; extend MachinePresentation
  with required theme + audio.
- src/machines/wildAndWhimsical.ts — add theme:{} and audio:{channelGains:CHANNEL_GAINS, mix:MIX,
  music:DEFAULT_BED_MUSIC} by IMPORTING those constants (so parity holds by reference).
- src/ui/audio/audioEngine.ts — mutable activeGains + setChannelGains + getActiveChannelGain;
  getChannel creates at activeGains[name].
- src/ui/audio/mixer.ts — mutable activeMix + setMix; applyMix reads activeMix and restores to
  getActiveChannelGain('bed') (import it instead of CHANNEL_GAINS).
- src/ui/audio/ambientBed.ts — export DEFAULT_BED_MUSIC; mutable activeMusic + setBedMusic +
  getActiveBedMusic; startBed reads activeMusic (chord/noteDuration/loopInterval); remove the
  old top-level CHORD const.
- src/ui/App.tsx — destructure `machine` from useSlotMachine(); add stageRef on .device-stage;
  call useMachineTheme(stageRef, machine.presentation.theme) + useMachineAudio(machine.presentation.audio).

Tests (make them pass) — all named in the spec's Failing Tests section:
- NEW: src/ui/theme/machineTheme.test.ts, src/ui/theme/useMachineTheme.test.tsx,
  src/ui/audio/useMachineAudio.test.ts.
- ADD to: src/ui/audio/audioEngine.test.ts, src/ui/audio/mixer.test.ts,
  src/ui/audio/ambientBed.test.ts (each must RESTORE the default after mutating singleton state
  so later tests see the baseline).
- ADD to: src/machines/wildAndWhimsical.parity.test.ts — the default machine's audio equals
  CHANNEL_GAINS/MIX/{chord,noteDuration,loopInterval} and its theme equals {}.

HARD CONSTRAINTS (verify before finishing):
- `git diff main..HEAD -- src/engine/` MUST be EMPTY (theme/audio are presentation-only, DEC-001).
- No new dependency. No new DEC. No change to any machine's MATH.

Repo toolchain gotchas: ESLint has NO react-hooks plugin (no exhaustive-deps disables). NO
@testing-library/user-event — use renderHook/act + render/fireEvent. JSX test files are .tsx;
plain ones .ts. tsconfig include is ["src"]. All audio is best-effort (try/catch) — jsdom has no
real AudioContext, so tests must inject spies / stubs (mirror the existing audioEngine/mixer/
ambientBed tests' stubbing) rather than rely on real Tone nodes.

Gate (all exit 0): just typecheck && just lint && just test && just build
Then confirm: `just validate` and `just cost-audit` pass; the new/updated tests ran and passed;
the `git diff main..HEAD -- src/engine/` guard is EMPTY.

When done:
1. Fill "## Build Completion" (incl. 3 honest reflection answers).
2. Append a build cost session (cycle: build, agent: claude-sonnet-4-6, interface: claude-code,
   tokens_total: null + "orchestrator to fill tokens_total from subagent_tokens" note,
   recorded_at: <today>, notes).
3. Mark build [~] in the timeline.
4. Commit locally with a message referencing SPEC-048.
DO NOT git push / open a PR / run gh / run just advance-cycle.
```
