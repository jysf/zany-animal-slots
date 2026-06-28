---
# Maps to ContextCore task.* semantic conventions.

task:
  id: SPEC-024
  type: story
  cycle: verify
  blocked: false
  priority: high
  complexity: M

project:
  id: PROJ-001
  stage: STAGE-004
repo:
  id: animal-slots

agents:
  architect: claude-opus-4-8
  implementer: claude-sonnet-4-6
  created_at: 2026-06-27

references:
  decisions:
    - DEC-001
    - DEC-004
    - DEC-006
    - DEC-010
  constraints:
    - respect-reduced-motion
    - perf-60fps
    - portrait-first
    - test-before-implementation
    - one-spec-per-pr
  related_specs:
    - SPEC-021
    - SPEC-022
    - SPEC-023

value_link: "A burst of leaves/acorns erupts over the reels on a win, its size scaled to the win tier (small/big/jackpot) — the celebration that makes a *bigger* win feel bigger."

cost:
  sessions:
    - cycle: design
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      duration_minutes: 30
      recorded_at: 2026-06-27
      notes: "main-loop, not separately metered (AGENTS §4); design cycle"
    - cycle: build
      agent: claude-sonnet-4-6
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      duration_minutes: null
      recorded_at: 2026-06-27
      notes: "orchestrator to fill tokens_total from subagent_tokens at ship"
  totals:
    tokens_total: 0
    estimated_usd: 0
    session_count: 0
---

# SPEC-024: Win particle burst

## Context

The fourth celebration. Building on the count-up (SPEC-022) and paw trail
(SPEC-023), this adds a **particle burst** — leaves 🍂 and acorns 🌰 that erupt
from the centre of the reel area and fly outward on a win, with the **number of
particles scaled to the win tier** (small < big < jackpot). It's the first
celebration that makes a *bigger* win look bigger, keying off the engine's
`tier` (carried on SPEC-021's `celebration`), so nothing is faked — the burst
size reflects the tier that actually landed (DEC-005 taste note, DEC-001).

CSS celebration (DEC-004): each particle is a DOM element animated by a
`transform`/`opacity` keyframe along a randomized trajectory (random is a UI
concern — the engine's determinism rule applies only to `src/engine/**`). Under
`prefers-reduced-motion` the burst renders **nothing** (particles are inherently
motion; the non-animated win feedback — the win badge, the count-up snap, the paw
glow — still stands, satisfying `respect-reduced-motion`). Emoji art (DEC-006),
token-only CSS, no raw hex (DEC-010). The burst is keyed on `celebration.id` so it
fires once per win and replays each win (SPEC-021).

See `STAGE-004-win-celebration-and-juice.md`, `DEC-004`, `DEC-006`, `DEC-010`,
SPEC-021 (`celebration` — `id` + `tier`), SPEC-022 (`prefersReducedMotion()`).

## Goal

On a win, render a `ParticleBurst` over the reel area: N leaf/acorn particles
(N from a tier→count map: small < big < jackpot) that fly outward via a CSS
keyframe along randomized trajectories, keyed on `celebration.id`. Render nothing
when there is no celebration, when the tier is `none`, or under
`prefers-reduced-motion`.

## Inputs

- **Files to read:** `src/ui/regions/Game.tsx` (+ `Game.test.tsx`) — already
  receives `celebration` (SPEC-023) and is the celebration host;
  `src/ui/reels/WinBadge.tsx` + `win-badge.css` (the overlay + CSS pattern to
  mirror); `src/ui/prefersReducedMotion.ts` (SPEC-022); `src/ui/useSlotMachine.ts`
  (`Celebration` — `id`, `tier`); `src/styles/tokens.css`;
  `src/ui/regions/regions.css` (`.cabinet__game { position: relative }`).
- **Related code paths:** `src/ui/reels/`, `src/ui/regions/`.

## Outputs

- **Files created:**
  - `src/ui/reels/ParticleBurst.tsx` — the burst component + exported
    `PARTICLE_COUNTS` map.
  - `src/ui/reels/ParticleBurst.test.tsx` — behavior + CSS-contract tests.
  - `src/ui/reels/particles.css` — `.particle-burst` / `.particle` styles, the
    `@keyframes particle-fly`, and the `prefers-reduced-motion` block.
- **Files modified:**
  - `src/ui/regions/Game.tsx` — render `<ParticleBurst celebration={celebration} />`
    inside `.cabinet__game` (over the grid), alongside `<WinBadge>`.
  - `src/ui/regions/Game.test.tsx` — extend (below).
- **New exports:** `ParticleBurst` (default), `PARTICLE_COUNTS`.
- **Database changes:** none.

## Acceptance Criteria

- [ ] `ParticleBurst` renders nothing (no `.particle`) when `celebration` is
      null/undefined, when `celebration.tier === 'none'`, or under
      `prefers-reduced-motion`.
- [ ] On a win it renders exactly `PARTICLE_COUNTS[tier]` `.particle` elements;
      the counts are strictly increasing: `small < big < jackpot`.
- [ ] Each particle is a leaf 🍂 or acorn 🌰 (DEC-006), `aria-hidden`, and the
      burst container is `aria-hidden` + `pointer-events: none` (decorative; no
      a11y/layout impact).
- [ ] Particles fly outward via a CSS `@keyframes particle-fly` using
      `transform`/`opacity` (DEC-004); trajectories are randomized per particle via
      inline CSS custom properties.
- [ ] The burst is keyed on `celebration.id` so it remounts (replays) each win;
      particle positions are stable across re-renders of the same win (memoized on
      the id) — they don't jump on an unrelated parent re-render.
- [ ] `particles.css` has a `@media (prefers-reduced-motion: reduce)` block and no
      raw hex (CSS-contract test). Engine unchanged; gate exits 0.

## Failing Tests

Written during **design**, BEFORE build. Query particles via
`container.querySelectorAll('.particle')`. Import `PARTICLE_COUNTS` from the
component (don't hard-code the numbers). For reduced motion, override
`window.matchMedia` to `{ matches: true }` and restore in `afterEach`.

- **`src/ui/reels/ParticleBurst.test.tsx`**
  - `"renders nothing without a celebration"` — `<ParticleBurst />` → `.particle`
    count `=== 0`.
  - `"renders nothing for tier none"` — `celebration={{ id:1, tier:'none',
    totalWin:0, lineWins:[] }}` → `0`.
  - `"renders PARTICLE_COUNTS[tier] particles for a small win"` — `tier:'small'` →
    count `=== PARTICLE_COUNTS.small`.
  - `"scales the burst by tier"` — render small / big / jackpot and assert
    `PARTICLE_COUNTS.small < PARTICLE_COUNTS.big < PARTICLE_COUNTS.jackpot`, each
    matching the rendered `.particle` count.
  - `"renders nothing under reduced motion"` — matchMedia matches:true,
    `tier:'big'` → `.particle` count `=== 0`.
  - `"particles and the burst are decorative (aria-hidden)"` — the
    `.particle-burst` and every `.particle` have `aria-hidden="true"`; each
    particle's text is 🍂 or 🌰.
  - `"defines the fly keyframe + reduced-motion + no raw hex"` (CSS-contract,
    reads `particles.css`) — matches `/@keyframes\s+particle-fly/`, the keyframe
    uses `transform`, a `/@media\s*\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)/`
    block exists, and no `/#[0-9a-fA-F]{3,8}\b/`.

- **`src/ui/regions/Game.test.tsx`** (extended)
  - `"renders a particle burst on a win"` — `<Game grid={INITIAL_GRID}
    celebration={{ id:1, tier:'small', totalWin:10, lineWins:[] }} />` →
    `.particle` count `=== PARTICLE_COUNTS.small`; without `celebration` → `0`.

## Implementation Context

### Decisions that apply

- `DEC-004` — particle motion is a CSS `transform`/`opacity` keyframe; reduced
  motion renders no burst (the static badge/glow remain the non-animated path).
- `DEC-006` — particles are 🍂 / 🌰 emoji.
- `DEC-010` — token-only CSS, prefixed `.particle`/`.particle-burst`, no raw hex.
- `DEC-001` — burst size is driven by the engine's `tier` (via `celebration`); no
  engine change, no UI game math. (UI-side `Math.random()` for trajectory is fine
  — `deterministic-rng` governs only `src/engine/**`.)

### Constraints that apply

- `respect-reduced-motion` — no burst under reduced motion (other feedback stands).
- `perf-60fps` — transform/opacity only; jackpot's count stays modest (~30).
- `portrait-first`, `test-before-implementation`, `one-spec-per-pr`.

### Prior related work

- `SPEC-021` (shipped) — `celebration.id` + `celebration.tier`; the burst's
  fire-once key and tier source.
- `SPEC-022` (shipped) — `prefersReducedMotion()` (reuse it) + the matchMedia test
  mock in `src/test/setup.ts`.
- `SPEC-023` (shipped) — Game already receives `celebration`; the burst is another
  overlay in `.cabinet__game` (which is `position: relative` since SPEC-019).
- `SPEC-019` (shipped) — `WinBadge` overlay + `win-badge.css`: mirror its
  absolute-overlay + token-CSS + reduced-motion pattern.

### Out of scope (for this spec specifically)

- The wolf jackpot moment (full-cabinet howl + moon overlay) — SPEC-025. This
  spec only scales particle *count* by tier; the jackpot still gets a (larger)
  particle burst here, with the showpiece scene added next.
- Audio (SPEC-026/027). Per-tier particle *colors/shapes/emojis* beyond leaf/acorn,
  or physics beyond a simple outward fly — keep it simple.

## Notes for the Implementer

- `ParticleBurst.tsx`:
  ```tsx
  import { useMemo } from 'react';
  import type { Celebration } from '../useSlotMachine';
  import { prefersReducedMotion } from '../prefersReducedMotion';
  import './particles.css';

  export const PARTICLE_COUNTS: Record<'small' | 'big' | 'jackpot', number> = {
    small: 10, big: 20, jackpot: 32,
  };
  const EMOJI = ['🍂', '🌰'];

  export default function ParticleBurst({ celebration }: { celebration?: Celebration | null }) {
    const id = celebration?.id ?? null;
    const tier = celebration?.tier ?? 'none';
    const count = tier === 'none' ? 0 : PARTICLE_COUNTS[tier];
    // Memoize trajectories per win so unrelated re-renders don't reshuffle them.
    const particles = useMemo(() => {
      return Array.from({ length: count }, (_, i) => {
        const angle = (Math.PI * 2 * i) / Math.max(count, 1) + Math.random() * 0.6;
        const dist = 60 + Math.random() * 90; // px
        return {
          emoji: EMOJI[i % EMOJI.length],
          style: {
            ['--p-dx' as string]: `${Math.cos(angle) * dist}px`,
            ['--p-dy' as string]: `${Math.sin(angle) * dist}px`,
            ['--p-rot' as string]: `${Math.round(Math.random() * 360)}deg`,
            ['--p-delay' as string]: `${Math.round(Math.random() * 80)}ms`,
          } as React.CSSProperties,
        };
      });
    }, [id, count]);

    if (!celebration || count === 0 || prefersReducedMotion()) return null;

    return (
      <div className="particle-burst" aria-hidden="true" key={id}>
        {particles.map((p, i) => (
          <span key={i} className="particle" aria-hidden="true" style={p.style}>{p.emoji}</span>
        ))}
      </div>
    );
  }
  ```
  Keep the `useMemo` BEFORE the early return so hook order is stable.
- `particles.css`:
  ```css
  .particle-burst {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
    z-index: 8;            /* above paws (5), below the win badge (10) */
  }
  .particle {
    position: absolute;
    top: 50%; left: 50%;
    font-size: var(--font-size-lg);
    opacity: 0;
    will-change: transform, opacity;
    animation: particle-fly 1s ease-out var(--p-delay, 0ms) forwards;
  }
  @keyframes particle-fly {
    0%   { transform: translate(-50%, -50%) scale(0.4);                                              opacity: 0; }
    15%  { opacity: 1; }
    100% { transform: translate(calc(-50% + var(--p-dx, 0px)), calc(-50% + var(--p-dy, 0px))) rotate(var(--p-rot, 0deg)); opacity: 0; }
  }
  @media (prefers-reduced-motion: reduce) {
    .particle { animation: none; }   /* belt-and-suspenders; the component also renders nothing */
  }
  ```
- `Game.tsx`: render `<ParticleBurst celebration={celebration} />` inside
  `.cabinet__game` (sibling of `<ReelGrid>` and `<WinBadge>`). No App change — Game
  already gets `celebration` (SPEC-023).
- No new DEC — DEC-004/006/010 cover this.
- After build, the orchestrator previews: a small win → a modest leaf/acorn burst;
  confirm bigger tiers throw more (force a bigger win via repeated spins or check
  the jackpot path in SPEC-025's preview later). Tune counts if it feels sparse/busy.

---

## Build Completion

*Filled in at the end of the **build** cycle, before advancing to verify.*

- **Branch:** feat/spec-024-particle-burst
- **PR (if applicable):** local only (no push per instructions)
- **All acceptance criteria met?** yes
- **New decisions emitted:**
  - none (DEC-004/006/010 cover everything as expected)
- **Deviations from spec:**
  - None. Drop-in code from "Notes for the Implementer" was used verbatim; the only change was removing an `// eslint-disable-line react-hooks/exhaustive-deps` comment that the project's ESLint config flagged as an unknown rule.
- **Follow-up work identified:**
  - None beyond what's already in the stage backlog (SPEC-025 wolf jackpot, SPEC-026/027 audio).

### Build-phase reflection (3 questions, short answers)

1. **What was unclear in the spec that slowed you down?**
   — Nothing materially slowed me down. The "Notes for the Implementer" provided drop-in code for all three new files. The one friction point was the `// eslint-disable-line react-hooks/exhaustive-deps` comment in the sample code: the project's ESLint config doesn't have the `react-hooks` plugin configured, so the rule reference was invalid and caused a lint error. I caught it on the first lint run and removed the comment.

2. **Was there a constraint or decision that should have been listed but wasn't?**
   — No missing decisions. The ESLint note above is a build-time "gotcha" worth documenting in the spec template: sample ESLint-disable comments should be checked against the project's actual ESLint plugin set before being dropped in.

3. **If you did this task again, what would you do differently?**
   — I'd lint-check the "Notes for the Implementer" code snippets mentally before copy-pasting, specifically to catch eslint-disable comments that reference rules not in the project. Everything else — file layout, useMemo-before-early-return discipline, CSS-contract test reading the real file — was clean.

---

## Reflection (Ship)

*Appended during the **ship** cycle.*

1. **What would I do differently next time?**
   — <answer>

2. **Does any template, constraint, or decision need updating?**
   — <answer>

3. **Is there a follow-up spec I should write now before I forget?**
   — <answer>
