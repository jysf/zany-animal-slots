---
# Maps to ContextCore task.* semantic conventions.
# This variant assumes Claude plays every role. The context normally
# in a separate handoff doc lives in the ## Implementation Context
# section below.

task:
  id: SPEC-048
  type: story                      # epic | story | task | bug | chore
  cycle: build  # frame | design | build | verify | ship
  blocked: false
  priority: medium
  complexity: L                    # S | M | L  (L: two independent slices — theme + audio — shipped together per the stage plan)

project:
  id: PROJ-002
  stage: STAGE-008
repo:
  id: animal-slots

agents:
  architect: claude-opus-4-8       # design/frame: Opus (judgement-heavy). See AGENTS §8.
  implementer: claude-sonnet-4-6   # build/verify: Sonnet (execution against the spec)
  created_at: 2026-07-06

references:
  decisions:
    - DEC-001   # engine-no-dom: theme/audio live in the PRESENTATION slice; the engine never sees them
    - DEC-013   # audio-engine graph: the graph is unchanged — only its params (gains/mix/music) become per-machine
    - DEC-015   # config-driven machine model: presentation grows theme + audio, still pure data
  constraints:
    - engine-no-dom
  related_specs:
    - SPEC-041  # presentation symbolDisplay — the slice this extends with theme + audio
    - SPEC-047  # parameterized the last engine reads; this parameterizes the last PRESENTATION reads
    - SPEC-049  # reactive active-machine context — makes a theme/audio SWITCH re-render (this only wires the read)
    - SPEC-050  # machine selector — the UI that will exercise a live theme/audio swap

value_link: >-
  Infrastructure enabling STAGE-008's variety: extends MachinePresentation with theme (runtime
  CSS-var overrides) + audio (channel gains / mix / generative-bed music) and wires the UI and the
  audio singleton to read the active machine — so the themed machines (SPEC-051/052/053) look and
  sound distinct as pure data, closing the STAGE-007/SPEC-041 theme+audio deferral.

cost:
  sessions:
    - cycle: design
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: null   # design cycle runs on the orchestrator's main Opus loop — not separately metered
      recorded_at: 2026-07-06
      note: >-
        Design authored on the main Opus orchestrator loop (un-metered). Transcribed the DEFAULT
        machine's theme (empty overrides — defers to the static tokens.css campfire palette) and
        audio (CHANNEL_GAINS {bed:0.25,sfx:0.6,jingle:0.8}; MIX {duck:0.05,swell:0.45,rampS:0.2,
        restoreS:0.6,holdMs:3000}; music {chord:[C3,G3,C4,E4],noteDuration:2n,loopInterval:2m})
        directly from the current source, so the default machine is a provable no-op and the build
        is transcription.
    - cycle: build
      interface: claude-code
      model: claude-sonnet-4-6
      tokens_total: 138540   # from Agent result subagent_tokens
      estimated_usd: 0.91    # 138540 tok × $6.6/M (Sonnet)
      duration_minutes: 13.2 # 793403 ms
      recorded_at: 2026-07-06
      note: >-
        Implemented the spec's Notes verbatim: new src/ui/theme/{machineTheme,useMachineTheme}.ts
        and src/ui/audio/useMachineAudio.ts; extended src/machines/types.ts with ThemeVar/
        ThemeTokens/MachineAudio and the required theme+audio fields on MachinePresentation;
        wired the default machine (wildAndWhimsical.ts) to theme:{} + audio referencing
        CHANNEL_GAINS/MIX/DEFAULT_BED_MUSIC by import; added mutable active-state layers +
        setters to audioEngine.ts/mixer.ts/ambientBed.ts; wired App.tsx's stageRef +
        useMachineTheme/useMachineAudio. Added/updated tests per the Failing Tests section
        (machineTheme.test.ts, useMachineTheme.test.tsx, useMachineAudio.test.ts new; audioEngine/
        mixer/ambientBed/wildAndWhimsical.parity tests extended, each restoring singleton defaults
        after mutating). Ran the spec's three adversarial mutation checks locally (self-clearing
        applyTheme, getChannel's activeGains read, applyMix's active-gain restore target) —
        all three broke a test as required, then reverted. Gate green: typecheck, lint, test
        (340 tests / 57 files), build, validate, cost-audit all exit 0.
        `git diff main..HEAD -- src/engine/` confirmed EMPTY.
    - cycle: verify
      interface: claude-code
      agent: claude-sonnet-4-6
      tokens_total: 93332    # from Agent result subagent_tokens
      estimated_usd: 0.62    # 93332 tok × $6.6/M (Sonnet)
      duration_minutes: 11.7 # 704734 ms
      recorded_at: 2026-07-06
      note: >-
        Cold, independent re-verification. Re-ran the full gate (typecheck, lint, test, build,
        validate, cost-audit) — all exit 0; 340 tests / 57 files. Confirmed spec conformance by
        reading every changed source file against the spec's Notes (types.ts, wildAndWhimsical.ts,
        machineTheme.ts, useMachineTheme.ts, audioEngine.ts, mixer.ts, ambientBed.ts,
        useMachineAudio.ts, App.tsx) — all match verbatim. No .skip/.only/xit in touched test files.
        Ran all three adversarial guard-mutations by hand: (a) applyTheme's clear-branch made a
        no-op broke machineTheme.test.ts's self-clearing test; (b) getChannel reading
        CHANNEL_GAINS[name] instead of activeGains[name] broke audioEngine.test.ts's
        machine-overridden-gain test; (c) applyMix restoring to CHANNEL_GAINS.bed instead of
        getActiveChannelGain('bed') broke mixer.test.ts's active-bed-gain restore test. All three
        had teeth; all three cleanly reverted (git diff empty after each). Hard guards confirmed
        EMPTY: `git diff main..HEAD -- src/engine/` and `git diff main..HEAD --
        src/machines/machine.ts src/machines/registry.ts`. Full gate re-run green after all
        reverts. Defect count: 0.
    - cycle: ship
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      duration_minutes: 14
      recorded_at: 2026-07-06
      note: >-
        main-loop, not separately metered (AGENTS §4); ship cycle. Reconciled both sub-agents
        against git/disk (reviewed the full diff, re-ran the gate + engine guard, confirmed the
        two build-added mutation-teeth assertions are legitimate), filled build+verify cost from
        subagent_tokens, ran a preview check (default machine renders the campfire palette
        unchanged — .device-stage carries 0 inline theme vars, --color-bg resolves to #1a1008),
        PR + CI-poll + squash-merge + backlog rollup + archive.
  totals:
    tokens_total: 231872   # build 138540 + verify 93332
    estimated_usd: 1.53    # build $0.91 + verify $0.62
    session_count: 4       # design, build, verify, ship
---

# SPEC-048: Per-machine theme + audio slice

## Context

STAGE-007 shipped only `symbolDisplay` in `MachinePresentation` and explicitly deferred the
theme + audio halves (SPEC-041's Notes) — because per-machine theming and audio have no payoff
until a machine that *differs* exists, which the themed machines (SPEC-051/052/053) will add.
This spec builds that infrastructure so those machines are pure data:

1. **Theme.** `tokens.css` is a static `:root { --color-*: … }` campfire palette. A machine
   distinguishes itself by **overriding** those CSS custom properties at runtime on the app root
   element, so the whole cabinet re-colors. Today nothing applies per-machine overrides.
2. **Audio.** The audio singleton hard-codes its params: `CHANNEL_GAINS` (`audioEngine.ts`),
   `MIX` (`mixer.ts`), and the generative bed's `CHORD` + loop timing (`ambientBed.ts`). A
   themed machine should be able to vary its mix and its musical bed. The DEC-013 audio *graph*
   stays; only its *params* become per-machine.

This mirrors SPEC-047 (which parameterized the last engine reads) on the presentation side: it
parameterizes the last presentation reads that ignored the active machine. It is a **pure seam
extension** — the DEFAULT machine's theme is *empty overrides* (it defers to `tokens.css`) and
its audio params *are* today's constants, so there is **no observable change** and no frozen-seed
concern. The active machine is not yet reactive (SPEC-049) and there is no selector yet
(SPEC-050): this spec applies the **default** machine's theme/audio at load — a no-op today — and
establishes the seam those specs light up. DEC-001 stays clean: theme + audio are **presentation**
data; the engine never sees them.

## Goal

Extend `MachinePresentation` with a `theme` slice (CSS custom-property overrides applied at
runtime to the app root) and an `audio` slice (channel gains / mix / generative-bed music), wire
the UI to apply the active machine's theme and the audio singleton to read its audio params, and
give the default machine values equal to today's (empty theme overrides + today's audio
constants) so there is **no observable change**.

## Inputs

- **Files to read:**
  - `src/machines/types.ts` — `MachinePresentation` (extend it), `SymbolDisplay`.
  - `src/machines/wildAndWhimsical.ts` — the default machine (add `theme` + `audio`).
  - `src/styles/tokens.css` — the `--color-*` semantic tokens that theme overrides target.
  - `src/ui/App.tsx` — the app root (`.device-stage`); wires the two new hooks.
  - `src/ui/audio/audioEngine.ts` — `CHANNEL_GAINS`, `getChannel` (make gains per-machine).
  - `src/ui/audio/mixer.ts` — `MIX`, `applyMix` (make mix per-machine; restore to active bed gain).
  - `src/ui/audio/ambientBed.ts` — `CHORD` + loop timing (make the bed music per-machine).
  - `src/machines/machine-parity.contract.test.ts` — the contract test (a new presentation shape assertion may be needed).
- **Related code paths:** `src/machines/`, `src/ui/`, `src/ui/audio/`.

## Outputs

- **Files created:**
  - `src/ui/theme/machineTheme.ts` — `ThemeVar`/`ThemeTokens` re-home is in `types.ts`; this file
    holds `applyTheme(el, theme)` (pure DOM writer) + `THEME_VARS` (the full known var set).
  - `src/ui/theme/useMachineTheme.ts` — a hook applying a machine's theme to a ref'd root element.
  - `src/ui/theme/machineTheme.test.ts`, `src/ui/theme/useMachineTheme.test.tsx`.
  - `src/ui/audio/useMachineAudio.ts` — a hook pushing a machine's audio params into the singleton.
  - `src/ui/audio/useMachineAudio.test.ts`.
- **Files modified:**
  - `src/machines/types.ts` — add `ThemeVar`, `ThemeTokens`, `MachineAudio`; extend `MachinePresentation`.
  - `src/machines/wildAndWhimsical.ts` — add `theme: {}` + the default `audio`.
  - `src/ui/audio/audioEngine.ts` — mutable active gains + `setChannelGains` + `getActiveChannelGain`.
  - `src/ui/audio/mixer.ts` — mutable active mix + `setMix`; restore to the active bed gain.
  - `src/ui/audio/ambientBed.ts` — mutable active music + `setBedMusic`; `startBed` reads it.
  - `src/ui/App.tsx` — a `stageRef` on `.device-stage`; call `useMachineTheme` + `useMachineAudio`.
  - Test files: `audioEngine.test.ts`, `mixer.test.ts`, `ambientBed.test.ts`, plus the machine parity/default-machine test as needed.
- **New exports:** `ThemeVar`, `ThemeTokens`, `MachineAudio` (types.ts); `applyTheme`, `THEME_VARS`
  (machineTheme.ts); `useMachineTheme`; `useMachineAudio`; `setChannelGains`, `getActiveChannelGain`
  (audioEngine.ts); `setMix` (mixer.ts); `setBedMusic` (ambientBed.ts).
- **Database changes:** none.

## Acceptance Criteria

- [ ] `MachinePresentation` has required `theme: ThemeTokens` and `audio: MachineAudio` fields;
      `ThemeTokens` is `Partial<Record<ThemeVar, string>>` over the `--color-*` semantic tokens.
- [ ] The DEFAULT machine (Wild & Whimsical) has `theme: {}` (no overrides → defers to `tokens.css`)
      and `audio` equal to today's constants (`CHANNEL_GAINS`, `MIX`, and `{chord:['C3','G3','C4','E4'],
      noteDuration:'2n', loopInterval:'2m'}`), so applying it is a no-op.
- [ ] `applyTheme(el, theme)` sets each var in `theme` on `el.style` and **removes** any `THEME_VARS`
      entry absent from `theme` — so switching machines fully resets (idempotent, self-clearing).
      `applyTheme(el, {})` leaves no theme custom properties set on `el`.
- [ ] `useMachineTheme(ref, theme)` applies the theme to `ref.current` on mount and whenever `theme`
      changes; a machine with a non-empty theme sets those custom properties on the root element.
- [ ] The audio singleton reads per-machine params: `setChannelGains(g)` makes `getChannel`/
      `getActiveChannelGain` reflect `g` (and updates any already-created channel); `setMix(m)` makes
      `applyMix` ramp to `m`'s levels and restore to the **active** bed gain; `setBedMusic(m)` makes the
      next `startBed` use `m.chord`/timings. Called with the defaults, behavior is unchanged.
- [ ] `useMachineAudio(audio)` pushes `audio.channelGains` → `setChannelGains`, `audio.mix` → `setMix`,
      `audio.music` → `setBedMusic` in an effect keyed on the audio object.
- [ ] `App` renders unchanged visually/aurally for the default machine (applies `theme:{}` and the
      default audio); no crash in jsdom (all audio is best-effort, guarded).
- [ ] DEC-001 holds: `git diff main..HEAD -- src/engine/` is EMPTY (theme/audio are presentation-only).
- [ ] `just typecheck && just lint && just test && just build && just validate && just cost-audit` all pass.

## Failing Tests

Written now, BEFORE build. All exact paths + assertions below.

- **`src/ui/theme/machineTheme.test.ts`** (jsdom; build a `document.createElement('div')`):
  - `"applyTheme sets each supplied custom property on the element"` — `applyTheme(el, { '--color-bg':
    '#012', '--color-accent': '#0ff' })`; assert `el.style.getPropertyValue('--color-bg')` toBe `'#012'`
    and `'--color-accent'` toBe `'#0ff'`.
  - `"applyTheme removes theme vars absent from the new theme (self-clearing switch)"` — apply a theme
    setting `--color-bg`, then `applyTheme(el, {})`; assert `el.style.getPropertyValue('--color-bg')`
    toBe `''` (removed). Assert every `THEME_VARS` entry is `''` after `applyTheme(el, {})`.
  - `"applyTheme only touches THEME_VARS, never arbitrary properties"` — set a non-theme inline prop
    (`el.style.color = 'red'`) then `applyTheme(el, {})`; assert `el.style.color` still `'red'`.

- **`src/ui/theme/useMachineTheme.test.tsx`** (renderHook + a real element ref):
  - `"applies a machine's theme overrides to the ref'd element"` — render the hook with a ref to a
    mounted div and a theme `{ '--color-bg': '#123' }`; assert the div has `--color-bg: #123`.
  - `"re-applies (and clears) when the theme changes"` — rerender with `{}`; assert `--color-bg` is `''`.

- **`src/ui/audio/audioEngine.test.ts`** (add):
  - `"setChannelGains changes what getActiveChannelGain reports"` — `setChannelGains({ bed: 0.1, sfx:
    0.2, jingle: 0.3 })`; assert `getActiveChannelGain('bed')` toBe `0.1` etc.; then restore the default
    with `setChannelGains(CHANNEL_GAINS)` (so later tests see the baseline).
  - (keep existing tests green — default gains still `CHANNEL_GAINS` until `setChannelGains` is called.)

- **`src/ui/audio/mixer.test.ts`** (add):
  - `"setMix changes the levels applyMix ramps to"` — with a stub channel/gain (mirror the existing
    mixer test's stubbing), `setMix({ ...MIX, swellLevel: 0.9 })`; `applyMix('big')`; assert the ramp
    target is `0.9`; restore `setMix(MIX)`.

- **`src/ui/audio/useMachineAudio.test.ts`** (renderHook; inject spies):
  - `"pushes a machine's audio params into the singleton"` — render `useMachineAudio(audio, { setGains,
    setMix, setMusic })` with spy setters; assert each spy was called once with the machine's
    `channelGains` / `mix` / `music`.

- **`src/ui/audio/ambientBed.test.ts`** (add):
  - `"setBedMusic changes the chord the next startBed uses"` — `setBedMusic({ chord: ['A2'],
    noteDuration: '4n', loopInterval: '1m' })`; assert (via an exported `getActiveBedMusic()` getter or
    a spy on the synth) that `startBed` triggers with `['A2']`; restore the default afterward.

- **Default-machine parity** (`src/machines/wildAndWhimsical.parity.test.ts` OR
  `machine-parity.contract.test.ts` — whichever holds the presentation assertions; ADD):
  - `"the default machine's audio equals today's engine/audio constants"` — assert
    `WILD_AND_WHIMSICAL.presentation.audio.channelGains` toEqual `CHANNEL_GAINS`,
    `.audio.mix` toEqual `MIX`, and `.audio.music` toEqual `{ chord: ['C3','G3','C4','E4'],
    noteDuration: '2n', loopInterval: '2m' }`.
  - `"the default machine's theme is empty (defers to tokens.css)"` — assert
    `WILD_AND_WHIMSICAL.presentation.theme` toEqual `{}`.

## Implementation Context

### Decisions that apply

- `DEC-001` (engine-no-dom) — theme + audio live in **presentation**, never in `MachineMath`; the
  engine import boundary is untouched. `git diff main..HEAD -- src/engine/` must be EMPTY.
- `DEC-013` (audio-engine graph) — the master→channel graph is unchanged; only the *param values*
  (gains, mix, bed music) become machine-supplied. No new nodes, no new audio deps.
- `DEC-015` (config-driven machine model) — presentation grows, still pure data; no new DEC needed
  (this is the deferred SPEC-041 slice, not a new decision).

### Constraints that apply

- `engine-no-dom` — presentation-only change; the engine never sees theme/audio.

### Prior related work

- `SPEC-041` (shipped) — introduced `MachinePresentation` with `symbolDisplay` and deferred theme +
  audio to STAGE-008; this is that deferral.
- `SPEC-047` (shipped) — the analogous "parameterize the last reads" spec on the ENGINE side; this is
  its presentation-side twin. Same "default equals today → no observable change" discipline.

### Out of scope (for this spec specifically)

- **Reactivity** — the active machine is still a module const (`getActiveMachine()`); a *switch* does
  not yet re-render. `App` reads the active machine once and applies its theme/audio at load. Making a
  switch live is **SPEC-049**; a selector to trigger it is **SPEC-050**.
- **The themed machines themselves** (Arctic/Desert/Ocean) — **SPEC-051/052/053**. This spec ships
  only the seam + the default (no-op) values.
- **New audio nodes / effects / assets** — DEC-013's graph and DEC-007's synth-only posture stand.
- **Theming non-color tokens** (fonts, spacing, type scale) — out of scope; only the `--color-*`
  semantic tokens are themeable (they are what distinguishes a machine). Structural tokens stay static.
- **Restarting a live bed on `setBedMusic`** — the new chord/timing applies on the *next* `startBed`
  (a machine switch re-gates the bed anyway via SPEC-049/050); no mid-loop hot-swap.

## Notes for the Implementer

**Toolchain brief:** ESLint has NO react-hooks plugin (no exhaustive-deps disables). NO
`@testing-library/user-event` — use `renderHook`/`act` + `render`/`fireEvent`. JSX test files are
`.tsx`; non-JSX are `.ts`. `tsconfig` include is `["src"]`. No new dependency. No new DEC. All audio
stays best-effort (try/catch) so jsdom never throws.

**`src/machines/types.ts` — extend the presentation slice** (append the types; extend the interface):

```ts
/** The themeable semantic color tokens (a subset of tokens.css :root vars). */
export type ThemeVar =
  | '--color-bg'
  | '--color-surface'
  | '--color-frame'
  | '--color-text'
  | '--color-text-muted'
  | '--color-accent'
  | '--color-coin'
  | '--color-win-small'
  | '--color-win-big'
  | '--color-jackpot'
  | '--color-jackpot-sky';

/** Runtime CSS custom-property overrides applied on the app root (theme swap). Empty = use tokens.css. */
export type ThemeTokens = Partial<Record<ThemeVar, string>>;

/** Per-machine audio params the singleton reads (DEC-013 graph unchanged — params only). */
export interface MachineAudio {
  /** Bus gains for the bed / sfx / jingle channels. */
  channelGains: { bed: number; sfx: number; jingle: number };
  /** Bed automation levels + timings for big-win swell / jackpot duck. */
  mix: { duckLevel: number; swellLevel: number; rampS: number; restoreS: number; holdMs: number };
  /** Generative ambient bed: the chord and its note/loop timing (Tone notation). */
  music: { chord: string[]; noteDuration: string; loopInterval: string };
}

export interface MachinePresentation {
  symbolDisplay: SymbolDisplay;
  theme: ThemeTokens;
  audio: MachineAudio;
}
```

**`src/machines/wildAndWhimsical.ts` — the default (no-op) presentation values.** Import the current
constants so the default is provably today's, not a re-typed copy:

```ts
import { WILD_AND_WHIMSICAL_MATH } from '../engine/index';
import { SYMBOL_DISPLAY } from '../ui/reels/symbols';
import { CHANNEL_GAINS } from '../ui/audio/audioEngine';
import { MIX } from '../ui/audio/mixer';
import { DEFAULT_BED_MUSIC } from '../ui/audio/ambientBed';
import type { Machine } from './types';

export const WILD_AND_WHIMSICAL: Machine = {
  id: 'wild-and-whimsical',
  name: 'Wild & Whimsical',
  math: WILD_AND_WHIMSICAL_MATH,
  presentation: {
    symbolDisplay: SYMBOL_DISPLAY,
    theme: {}, // no overrides — defers to the static tokens.css campfire palette
    audio: { channelGains: CHANNEL_GAINS, mix: MIX, music: DEFAULT_BED_MUSIC },
  },
};
```

(Reference-importing `CHANNEL_GAINS`/`MIX`/`DEFAULT_BED_MUSIC` keeps the parity test's `toEqual`
true by construction and prevents drift — same discipline as the math slice referencing the engine
constants.)

**`src/ui/theme/machineTheme.ts` — pure DOM writer + the full var set:**

```ts
import type { ThemeVar, ThemeTokens } from '../../machines/types';

/** Every themeable var — applyTheme clears any of these absent from a new theme (symmetric switch). */
export const THEME_VARS: readonly ThemeVar[] = [
  '--color-bg', '--color-surface', '--color-frame', '--color-text', '--color-text-muted',
  '--color-accent', '--color-coin', '--color-win-small', '--color-win-big', '--color-jackpot',
  '--color-jackpot-sky',
];

/**
 * Apply a machine's theme overrides to `el`'s inline style. Idempotent and self-clearing:
 * every THEME_VAR present in `theme` is set; every THEME_VAR absent is removed — so switching
 * from a themed machine back to one with {} fully restores the static tokens.css palette.
 * Only touches THEME_VARS; never other inline styles.
 */
export function applyTheme(el: HTMLElement, theme: ThemeTokens): void {
  for (const v of THEME_VARS) {
    const value = theme[v];
    if (value != null) el.style.setProperty(v, value);
    else el.style.removeProperty(v);
  }
}
```

**`src/ui/theme/useMachineTheme.ts`:**

```ts
import { useEffect, type RefObject } from 'react';
import type { ThemeTokens } from '../../machines/types';
import { applyTheme } from './machineTheme';

/** Apply the active machine's theme to a root element whenever the theme changes. */
export function useMachineTheme(ref: RefObject<HTMLElement | null>, theme: ThemeTokens): void {
  useEffect(() => {
    const el = ref.current;
    if (el) applyTheme(el, theme);
  }, [ref, theme]);
}
```

**`src/ui/audio/audioEngine.ts` — mutable active gains** (keep `CHANNEL_GAINS` as the exported
default/baseline; add the active layer):

```ts
export const CHANNEL_GAINS: Record<'bed' | 'sfx' | 'jingle', number> = { bed: 0.25, sfx: 0.6, jingle: 0.8 };

let activeGains: Record<'bed' | 'sfx' | 'jingle', number> = { ...CHANNEL_GAINS };

/** The current (possibly machine-overridden) gain for a channel. */
export function getActiveChannelGain(name: keyof typeof CHANNEL_GAINS): number {
  return activeGains[name];
}

/** Set the active per-machine channel gains; ramps any already-created channel to the new value. */
export function setChannelGains(gains: Record<'bed' | 'sfx' | 'jingle', number>): void {
  activeGains = { ...gains };
  for (const [name, ch] of channels) {
    try { ch.gain.value = activeGains[name as keyof typeof CHANNEL_GAINS]; } catch { /* best-effort */ }
  }
}
```

and in `getChannel`, create the channel at the ACTIVE gain: `new Gain(activeGains[name])` (was
`CHANNEL_GAINS[name]`). Leave `getMaster`/`ensureAudio` untouched.

**`src/ui/audio/mixer.ts` — mutable active mix; restore to the active bed gain:**

```ts
import { getChannel, getActiveChannelGain } from './audioEngine';
import type { WinTier } from '../../engine/index';

export const MIX = { duckLevel: 0.05, swellLevel: 0.45, rampS: 0.2, restoreS: 0.6, holdMs: 3000 };

let activeMix = { ...MIX };

/** Set the active per-machine bed-automation params. */
export function setMix(mix: typeof MIX): void { activeMix = { ...mix }; }

export function applyMix(tier: WinTier): void {
  if (tier !== 'big' && tier !== 'jackpot') return;
  try {
    const gain = getChannel('bed').gain;
    const target = tier === 'jackpot' ? activeMix.duckLevel : activeMix.swellLevel;
    gain.rampTo(target, activeMix.rampS);
    setTimeout(() => {
      try { gain.rampTo(getActiveChannelGain('bed'), activeMix.restoreS); } catch { /* best-effort */ }
    }, activeMix.holdMs);
  } catch { /* best-effort */ }
}
```

(Note: `applyMix` now imports `getActiveChannelGain` instead of `CHANNEL_GAINS` — the restore
baseline follows the active machine's bed gain.)

**`src/ui/audio/ambientBed.ts` — mutable active music; export the default:**

```ts
export const DEFAULT_BED_MUSIC = { chord: ['C3', 'G3', 'C4', 'E4'], noteDuration: '2n', loopInterval: '2m' };

let activeMusic = { ...DEFAULT_BED_MUSIC };

/** Set the active per-machine bed music; applies on the next startBed. */
export function setBedMusic(music: typeof DEFAULT_BED_MUSIC): void { activeMusic = { ...music }; }

/** Test/inspection helper: the current active bed music. */
export function getActiveBedMusic(): typeof DEFAULT_BED_MUSIC { return activeMusic; }
```

and `startBed` uses `activeMusic`: `new Loop((time) => pad?.triggerAttackRelease(activeMusic.chord,
activeMusic.noteDuration, time), activeMusic.loopInterval)`. Keep the `if (loop) return` guard and
the try/catch. Remove the old top-level `const CHORD = …` (replaced by `DEFAULT_BED_MUSIC.chord`).

**`src/ui/audio/useMachineAudio.ts` — push params into the singleton (setters injectable for tests):**

```ts
import { useEffect } from 'react';
import type { MachineAudio } from '../../machines/types';
import { setChannelGains as defaultSetGains } from './audioEngine';
import { setMix as defaultSetMix } from './mixer';
import { setBedMusic as defaultSetMusic } from './ambientBed';

/** Push the active machine's audio params into the singleton whenever they change. */
export function useMachineAudio(
  audio: MachineAudio,
  ctl: {
    setGains?: (g: MachineAudio['channelGains']) => void;
    setMix?: (m: MachineAudio['mix']) => void;
    setMusic?: (m: MachineAudio['music']) => void;
  } = {},
): void {
  const setGains = ctl.setGains ?? defaultSetGains;
  const setMix = ctl.setMix ?? defaultSetMix;
  const setMusic = ctl.setMusic ?? defaultSetMusic;
  useEffect(() => {
    setGains(audio.channelGains);
    setMix(audio.mix);
    setMusic(audio.music);
  }, [audio]);
}
```

**`src/ui/App.tsx` — ref the stage, wire the hooks.** Destructure `machine` from `useSlotMachine()`
(the hook already returns it), add a ref to `.device-stage`, and call the two hooks:

```tsx
import { useRef } from 'react';
import { useMachineTheme } from './theme/useMachineTheme';
import { useMachineAudio } from './audio/useMachineAudio';
// ...
const { machine, grid, balance, /* …existing… */ } = useSlotMachine();
const stageRef = useRef<HTMLDivElement>(null);
useMachineTheme(stageRef, machine.presentation.theme);
useMachineAudio(machine.presentation.audio);
// ...
return (
  <div className="device-stage" data-testid="device-stage" ref={stageRef}>
    {/* …unchanged… */}
```

**Verify-cycle adversarial checks (teeth):** (a) change `applyTheme`'s clear-branch to a no-op
(never `removeProperty`) → the "self-clearing switch" test must FAIL; revert. (b) make `getChannel`
keep reading `CHANNEL_GAINS[name]` instead of `activeGains[name]` (or make `setChannelGains` not
update existing channels) → the `setChannelGains` test must FAIL; revert. (c) make `applyMix` restore
to `CHANNEL_GAINS.bed` instead of `getActiveChannelGain('bed')` → add/confirm a test that a changed
bed gain changes the restore target fails; revert. Each mutation must break a test; if not, the guard
has no teeth.

---

## Build Completion

*Filled in at the end of the **build** cycle, before advancing to verify.*

- **Branch:** `feat/spec-048-per-machine-theme-and-audio-slice`
- **All acceptance criteria met?** yes
- **New decisions emitted:** none (deferred SPEC-041 slice under DEC-015, as expected).
- **Deviations from spec:** none — every file (new + modified) implements the Notes' drop-in
  code verbatim. Tests were written to the exact scenarios in Failing Tests (assertion-for-
  assertion where code was given; author's judgment only for the light scaffolding around
  `renderHook`/mock wiring the spec didn't spell out char-for-char, e.g. the `useThemedDiv`
  wrapper in `useMachineTheme.test.tsx` and the loop-callback invocation in the added
  `ambientBed.test.ts` case).
- **Follow-up work identified:** none beyond what SPEC-049/050/051-053 already own (reactive
  active-machine, selector UI, themed machines) — this spec's own scope is fully closed.

### Build-phase reflection (3 questions, short answers)

1. **What was unclear in the spec that slowed you down?** — Nothing unclear; the Notes'
   drop-in code was complete and unambiguous. The only judgment calls were filling test
   scaffolding the spec described by assertion but didn't spell out as full source (e.g.
   how exactly to mount a ref'd element for `useMachineTheme.test.tsx`, and how to assert
   the ambient-bed loop callback uses the new chord in `ambientBed.test.ts`).
2. **Was there a constraint or decision that should have been listed but wasn't?** — No.
   DEC-001/013/015 fully covered the relevant boundaries; the "verify-cycle adversarial
   checks" section in the Notes was a useful sanity script even though it wasn't strictly a
   constraint.
3. **If you did this task again, what would you do differently?** — Nothing material;
   the transcription-style implementation (import constants by reference rather than
   retyping them) made the "no observable change" property easy to keep true throughout.

Ran the spec's own adversarial mutation checks locally before finalizing (not committed):
reverted `applyTheme`'s clear branch to a no-op → the self-clearing test failed as expected;
made `getChannel` read `CHANNEL_GAINS[name]` instead of `activeGains[name]` → the
`setChannelGains` test failed as expected; made `applyMix` restore to `CHANNEL_GAINS.bed`
instead of `getActiveChannelGain('bed')` → the `setMix` restore-target assertion failed as
expected. All three guards have teeth; reverted after confirming.

---

## Reflection (Ship)

*Appended during the **ship** cycle. Outcome-focused, distinct from the build reflection.*

1. **What would I do differently next time?**
   — Prescribe the adversarial mutations against tests that already have teeth. The build agent
     found that two of the three mutations the spec named (getChannel's active-gain read; applyMix's
     active-bed restore) weren't distinguished by the spec's *literal* test text, and added one
     assertion each to close the gap — a good catch, but the design should have paired each "revert
     X → test Y fails" with a test Y that actually pins X. Same lesson SPEC-045 logged
     ([[adversarial-mutation-must-be-behavior-distinguishing]]): write the distinguishing assertion
     first, then name the mutation that breaks it.

2. **Does any template, constraint, or decision need updating?**
   — No new DEC (deferred SPEC-041 slice under DEC-015; DEC-013 graph untouched — params only). No
     template/constraint change. The `recorded_at` gate added earlier this session did its job: all
     four sessions carry it and `cost-audit` stayed green throughout.

3. **Is there a follow-up spec I should write now before I forget?**
   — No new spec. The seam is inert until reactive: **SPEC-049** lifts the active machine into a
     React Context + localStorage so a *switch* re-runs `useMachineTheme`/`useMachineAudio` (today
     they read the module-const default once at load); **SPEC-050** adds the selector that triggers
     it; then **SPEC-051/052/053** supply real `theme`/`audio` values. One note for SPEC-049 to
     honor: `applyTheme` is self-clearing and `setChannelGains`/`setMix`/`setBedMusic` are
     idempotent, so a switch back to Wild & Whimsical (`theme:{}`) correctly restores the campfire
     palette + default audio — no extra reset logic needed.
