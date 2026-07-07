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
