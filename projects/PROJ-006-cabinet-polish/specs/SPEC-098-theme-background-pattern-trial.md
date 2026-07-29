---
task:
  id: SPEC-098
  type: story
  cycle: ship
  blocked: false
  priority: medium
  complexity: S

project:
  id: PROJ-006
  stage: STAGE-021
repo:
  id: animal-slots

agents:
  architect: claude-opus-4-8
  implementer: claude-opus-4-8
  created_at: 2026-07-29

references:
  decisions:
    - DEC-010
    - DEC-015
    - DEC-021
    - DEC-028
  constraints:
    - portrait-first
    - respect-reduced-motion
  related_specs:
    - SPEC-092   # the cabinet face this sits on
    - SPEC-097   # the band alignment it must not disturb

value_link: "Gives each machine a themed background texture built from its own symbols."

cost:
  sessions:
    - cycle: design
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: null
      recorded_at: 2026-07-29
      note: >-
        Main-loop. The monochrome technique was PROVED IN THE BROWSER before any code was written
        (probe element + screenshot), because "make emoji monochrome" is not obviously possible.
    - cycle: build
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: 44000
      estimated_usd: 0.88
      recorded_at: 2026-07-29
      note: >-
        MachinePattern.tsx + machine-pattern.css; opt-in `presentation.pattern` on the Machine
        type, enabled on Whimsy only. Face block-padding widened so the watermark has visible
        band to occupy.
    - cycle: verify
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: 18000
      estimated_usd: 0.36
      recorded_at: 2026-07-29
      note: >-
        Live-CSS iteration found the first attempt rendered perfectly and was 100% invisible
        (centred behind the reel window). Verified on Whimsy at 430px; other five machines
        unchanged. Full gate green (1038).
    - cycle: ship
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      recorded_at: 2026-07-29
      note: "main-loop ship; own PR."
  totals:
    tokens_total: 62000
    estimated_usd: 1.24
    session_count: 4
---

# SPEC-098: Theme background pattern (one-machine trial)

## Goal

Owner: *"we should add theme related background pattern. can we do something like take the emoji,
make them monochrome and contrast with current background? maybe try it for one machine to start."*

A decorative watermark of the machine's **own reel symbols**, rendered monochrome in a theme token,
tiled across the cabinet face behind the reel window. Enabled on **Whimsy only** for now.

## The technique: monochrome emoji with no assets

Emoji glyphs carry their own colours and ignore `color`, so "make them monochrome" is not a CSS
`color` change — it needs the glyph re-rendered as a shape. The trick:

```css
color: transparent;
text-shadow: 0 0 0 var(--color-frame);
```

A zero-blur text-shadow paints the glyph's **silhouette** in the shadow colour. Result: a flat,
single-colour shape from the same emoji the machine already defines — **no image files, no new
assets, no per-machine artwork**. Because the colour is a theme token (`--color-frame`), every
machine's pattern contrasts against its own background automatically, satisfying the "contrast with
current background" half of the ask for free.

**This was proved in the browser before any code was written** — a probe element plus a screenshot
confirmed a real 🦌 rendering as a flat silhouette. "Make emoji monochrome" is the kind of request
that is easy to promise and might simply not be possible.

## Outputs

- `src/ui/reels/MachinePattern.tsx` + `machine-pattern.css` — the watermark.
- `src/machines/types.ts` — optional `presentation.pattern` opt-in flag.
- `src/machines/wildAndWhimsical.ts` — `pattern: true` (the trial machine).
- `src/ui/regions/Game.tsx` — render it behind the reel window when opted in.
- `src/ui/regions/regions.css` — face block-padding widened so the watermark has room to read.

## Acceptance

- [x] Whimsy shows a monochrome watermark of its own symbols; the other five are untouched.
- [x] Opt-in per machine as data (`presentation.pattern`), so rollout is a one-line change each.
- [x] Purely decorative: `aria-hidden`, `pointer-events: none`, no layout effect, no animation
      (so `respect-reduced-motion` is satisfied by construction).
- [x] SPEC-097's shared band edges are undisturbed; no raw hex; no `src/engine/**` diff.

## Reflection (Ship)

1. **What would I do differently next time?** — Nothing about the approach; the probe-first habit
   was right and I'd repeat it. The instructive failure was the *first placement*: the watermark
   rendered perfectly — correct glyphs, correct token colour, correct opacity — and was **100%
   invisible**, because `align-content: center` stacked every glyph directly behind the reel
   window, and the only visible face was a 24px margin. I confirmed via `getBoundingClientRect()`
   that the element existed and was correctly styled *before* concluding anything, which is what
   stopped me from "fixing" a rendering problem that did not exist. **A thing can be perfectly
   rendered and completely invisible**; when something doesn't show, measure whether it's absent,
   transparent, or merely occluded — they have opposite fixes.

2. **Does any template, constraint, or decision need updating?** — No new DEC. The opt-in flag is
   ordinary config-as-data (DEC-015) and the colour is an existing token (DEC-010). Worth flagging
   for the eventual rollout: the technique's cross-browser behaviour is **not** verified on real
   iOS Safari, and this repo's outstanding real-device check now covers a rendering trick as well
   as layout. If Safari paints the colour emoji instead of the silhouette, the pattern degrades to
   full-colour emoji at 40% opacity — noisy, not broken, but not the intent.

3. **Is there a follow-up spec I should write now before I forget?** — Two, both already raised
   with the owner rather than silently queued: **(a)** the winning paw-print change (off-centre +
   contrasting colour) requested before this and still outstanding — the same monochrome technique
   proved here is exactly what that needs, since the paw is also an emoji; **(b)** SPEC-097's
   `space-between` band alignment reads worse on desktop, where the frame's 40px corner radius
   curves away from the now edge-aligned controls. Rolling the pattern out to the other five
   machines is deliberately *not* queued — that is the owner's call after seeing it on one.
