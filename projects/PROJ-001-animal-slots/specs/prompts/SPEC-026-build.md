# SPEC-026 — BUILD prompt (fresh session — Sonnet)

> Run on **claude-sonnet-4-6** (AGENTS §8).

```
Cycle: build. You are NOT the architect. The spec file is your only context.

Read in order:
1. /AGENTS.md (§5, §11, §12 — UI tests are behavior/state).
2. /projects/PROJ-001-animal-slots/specs/SPEC-026-mute-toggle-and-audio-unlock.md —
   the ENTIRE Implementation Context, Acceptance Criteria, Failing Tests, Notes
   (drop-in code for every file).
3. /projects/PROJ-001-animal-slots/stages/STAGE-004-win-celebration-and-juice.md
4. /decisions/DEC-007, /decisions/DEC-001, /decisions/DEC-010.
5. /src/ui/storage.ts + storage.test.ts, /src/ui/regions/Header.tsx, /src/ui/App.tsx,
   /src/ui/PaytableSheet.tsx + /src/ui/paytable.css (header trigger + 44px pattern),
   /src/styles/tokens.css.
6. /guidance/constraints.yaml — audio-gesture-and-mute, touch-targets-44,
   test-before-implementation, one-spec-per-pr.

Before coding, branch and mark build `[~]` in the SPEC-026 timeline. If something
needs architect judgment, set `[?]` with a one-line reason and stop.

Branch: git checkout main && git pull --ff-only && git checkout -b feat/spec-026-mute-audio-unlock

Implement EXACTLY the spec (Notes give drop-in code). Create src/ui/audio/:
- muteStorage.ts — MUTE_KEY='mute', readMute() (default false, never throws),
  writeMute(boolean) (never throws). Mirror storage.ts try/catch.
- useAudio.ts — { muted, toggleMute, unlocked }: muted from readMute(); toggleMute
  flips + persists; unlocked starts false and flips true on the first document
  'pointerdown' or 'keydown' ({ once: true } + cleanup).
- MuteToggle.tsx — <button class="mute-toggle" aria-pressed={muted}
  aria-label={muted?'Unmute sound':'Mute sound'} onClick={onToggle}> 🔇/🔊.
- audio.css — .mute-toggle ≥44px (min-height/min-width var(--space-7)), token-only,
  no raw hex, focus-visible outline (mirror .paytable__trigger).
- Header.tsx — accept { muted, onToggleMute }; render <MuteToggle> next to
  <PaytableSheet> (simple flex row is fine; keep the title).
- App.tsx — const { muted, toggleMute } = useAudio(); pass to <Header>. Do NOT
  destructure `unlocked` yet (SPEC-027 uses it; avoid unused-var lint).
- Tests: muteStorage.test.ts (4), useAudio.test.ts (5, renderHook; dispatch a
  document 'pointerdown' to unlock), MuteToggle.test.tsx (aria-pressed both states,
  onToggle on click, CSS-contract reading audio.css for .mute-toggle + min-height/
  width + no raw hex). localStorage.clear() in beforeEach.
- NO Tone.js / audio dependency, NO sound. Engine only via src/engine; do NOT modify
  engine. Keep ALL existing tests green (Header/App still render).

NO new DEC — DEC-007 already governs the audio gate.
This repo's ESLint has NO react-hooks plugin — do NOT add an exhaustive-deps disable.

Gate (all exit 0): just typecheck && just lint && just test && just build
(Do NOT attempt a browser/preview check — the orchestrator does the visual check.)

When done:
1. Fill "## Build Completion" (incl. 3 honest reflection answers).
2. Append a build cost session (cycle: build, agent: claude-sonnet-4-6, interface:
   claude-code, tokens_total null + "orchestrator to fill tokens_total from
   subagent_tokens" note).
3. Mark build `[~]` only.
4. Commit locally (message referencing SPEC-026).
DO NOT git push / open a PR / run gh / run just advance-cycle.
```
