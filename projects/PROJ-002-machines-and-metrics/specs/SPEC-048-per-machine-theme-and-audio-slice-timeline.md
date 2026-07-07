# SPEC-048 timeline

Architect appends as cycles are designed. Executors update status as
they go. Status markers: `[ ]` not started · `[~]` in progress · `[x]` complete · `[?]` blocked.

Cycle prompts live in `prompts/SPEC-048-<cycle>.md`.

## Instructions

- [x] **design** — completed 2026-07-06 (Opus): extend `MachinePresentation` with a **theme** slice
      (`ThemeTokens` = `Partial<Record<ThemeVar, string>>` over the `--color-*` semantic tokens,
      applied at runtime to the `.device-stage` root via a self-clearing `applyTheme` + `useMachineTheme`)
      and an **audio** slice (`MachineAudio` = channel gains / mix / generative-bed music), wiring the
      audio singleton (`audioEngine.setChannelGains`/`getActiveChannelGain`, `mixer.setMix`,
      `ambientBed.setBedMusic`) + `useMachineAudio` to read the active machine. The DEFAULT machine's
      theme is `{}` (defers to the static `tokens.css` campfire palette) and its audio params ARE
      today's constants (imported by reference so parity holds), so the change is a **provable no-op**
      — no observable change, no frozen-seed concern. DEC-001 stays clean (presentation-only; `git diff
      src/engine/` must be EMPTY); DEC-013 graph unchanged (params only). The active machine is not yet
      reactive (SPEC-049) and there's no selector (SPEC-050): this applies the default machine's
      theme/audio at load and establishes the seam those specs light up. Complete drop-in code for all
      ~10 files + failing tests (machineTheme / useMachineTheme / useMachineAudio / audioEngine / mixer /
      ambientBed / default-machine parity). No new dep, no new DEC. **[L]** — two independent slices
      shipped together per the stage plan. Build prompt written.
- [~] **build** — in progress (Sonnet): implementing the theme + audio slice verbatim per spec Notes.
- [~] **verify** — (Sonnet, cold review) re-ran the full gate independently: `just typecheck &&
      just lint && just test && just build && just validate && just cost-audit` all exit 0 — 57
      test files, 340 tests passed. Conformance confirmed by reading the changed source: `types.ts`
      has `ThemeVar` (the 11 `--color-*` tokens), `ThemeTokens = Partial<Record<ThemeVar,string>>`,
      `MachineAudio {channelGains, mix, music}`, and `MachinePresentation` with required `theme` +
      `audio`; `wildAndWhimsical.ts` sets `theme: {}` and imports `CHANNEL_GAINS`/`MIX`/
      `DEFAULT_BED_MUSIC` by reference (not re-typed literals); `machineTheme.ts`'s `applyTheme`
      iterates `THEME_VARS`, `setProperty` for present vars, `removeProperty` for absent
      (self-clearing), touches only `THEME_VARS`; `useMachineTheme.ts` applies the theme to
      `ref.current` in an effect keyed on `[ref, theme]`; `audioEngine.ts` has mutable `activeGains`,
      `getActiveChannelGain` returns `activeGains[name]`, `setChannelGains` reassigns `activeGains`
      and updates existing channels, `getChannel` creates at `activeGains[name]` (not
      `CHANNEL_GAINS[name]`); `mixer.ts` has mutable `activeMix` + `setMix`, `applyMix` uses
      `activeMix` levels/timings and restores to `getActiveChannelGain('bed')` (not
      `CHANNEL_GAINS.bed`); `ambientBed.ts` exports `DEFAULT_BED_MUSIC`, has mutable `activeMusic` +
      `setBedMusic`/`getActiveBedMusic`, `startBed` reads `activeMusic.chord`/`noteDuration`/
      `loopInterval`, the old top-level `CHORD` const is gone; `useMachineAudio.ts`'s effect pushes
      `audio.channelGains`→`setGains`, `audio.mix`→`setMix`, `audio.music`→`setMusic`, setters
      injectable; `App.tsx` destructures `machine`, refs `.device-stage` via `stageRef`, calls
      `useMachineTheme(stageRef, machine.presentation.theme)` +
      `useMachineAudio(machine.presentation.audio)`. No `.skip`/`.only`/`xit` in any touched test
      file. All three adversarial guard-mutations had teeth: (a) made `applyTheme`'s else-branch a
      no-op (never `removeProperty`) — `machineTheme.test.ts` "removes theme vars absent from the
      new theme (self-clearing switch)" FAILED (expected `''`, got `'#012'`); reverted via `git
      checkout --`, diff confirmed empty. (b) made `getChannel` read `CHANNEL_GAINS[name]` instead
      of `activeGains[name]` — `audioEngine.test.ts` "getChannel creates a not-yet-created channel
      at the active (machine-overridden) gain" FAILED (expected `Gain` called with `0.42`, got
      `0.25`); reverted via `git checkout --`, diff confirmed empty. (c) made `applyMix` restore to
      `CHANNEL_GAINS.bed` (imported directly) instead of `getActiveChannelGain('bed')` —
      `mixer.test.ts` "restores to the ACTIVE bed gain, not the static CHANNEL_GAINS baseline"
      FAILED (expected last call `[0.42, 0.6]`, got `[0.25, 0.6]`); reverted via `git checkout --`,
      diff confirmed empty. Hard guards both EMPTY: `git diff main..HEAD -- src/engine/` and `git
      diff main..HEAD -- src/machines/machine.ts src/machines/registry.ts` (note: `machine.ts` does
      not exist in this repo — the math slice lives in `wildAndWhimsical.ts`/`types.ts`, neither of
      which touches engine math; `registry.ts` diff confirmed empty). Full gate re-run green after
      all reverts. Defect count: 0. Left `[~]` for the orchestrator to flip to `[x]`.
