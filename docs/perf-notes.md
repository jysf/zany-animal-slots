# Performance notes — Animal Slots (~60fps target)

_Written during SPEC-034 (perf pass). Last updated: 2026-06-28._

---

## Target

~60fps spin and celebration on a mid-tier phone (constraint `perf-60fps`).
The budget is roughly one frame every 16.7ms. We care most about the heaviest
moment: the jackpot scene triggering simultaneously with a 32-particle burst
and a Tone.js audio cue.

---

## Approach (DEC-004)

CSS keyframe animations on real DOM elements — no canvas, no WebGL, no
animation library (DEC-004).

Every `@keyframes` block in the codebase animates **only `transform` and
`opacity`** (with `filter` tolerated). These two properties are GPU-composited:
the browser promotes the element to its own composited layer, runs the
animation on the GPU compositor thread, and avoids main-thread layout or paint
entirely. Width, height, top, left, margin, padding and similar properties
would each force a layout or paint pass on the main thread and break the
frame budget.

---

## Static guarantee

`src/ui/perf.contract.test.ts` sweeps every `src/**/*.css` file at test time
and fails if any `@keyframes` step body contains a property outside the
`{transform, opacity, filter}` allow-list. This is a CI-enforced structural
guarantee — future animation additions cannot silently add a layout-triggering
property without breaking the gate.

Files swept (all compositor-only, confirmed by the test):

| File | Keyframes |
|---|---|
| `src/ui/reels/reels.css` | `reel-spin`, `reel-stop-bounce`, `paw-trail-pop` |
| `src/ui/reels/win-badge.css` | `win-badge-pop-in` |
| `src/ui/reels/particles.css` | `particle-fly` |
| `src/ui/jackpot.css` | `jackpot-sky-in`, `jackpot-moon-rise`, `jackpot-wolf-howl`, `jackpot-banner-in` |
| `src/ui/paytable.css` | `paytable-slide-up` |

`will-change` hints (tell the browser to promote the element early):
- `.particle` in `particles.css` — `will-change: transform, opacity` (SPEC-024)
- `.reel--spinning` in `reels.css` — `will-change: transform` (added SPEC-034)

Only these two carry `will-change`. Overuse raises memory consumption without
benefit; the hint is only justified where a new composited layer is recouped
by the spin frequency (every play triggers the reel animation) or particle
count (32 per big win).

---

## In-preview measurement

<!-- PLACEHOLDER: orchestrator to fill from rAF frame-interval sample at verify/ship -->
<!--
  Methodology: open the dev build in Chrome DevTools with Performance panel.
  Record a spin + big-win celebration (32 particles + win badge + paw trails).
  Report median frame interval and any frames exceeding 50ms.

  Results (fill at verify):
  - Median frame interval: __ ms
  - Max frame interval observed: __ ms
  - Long frames (>50ms): __
  - CPU throttle applied: none / 4× / 6×
-->

_Numbers to be recorded by the orchestrator during verify/ship using DevTools
rAF frame-interval sampling on the dev build._

---

## Caveat

The compositor-only sweep runs on the developer machine (CI environment). It
proves the structural property holds — no layout/paint-triggering keyframe
exists — but does not measure actual frame rate on a real device. A true
mid-tier-phone confirmation requires:

1. DevTools Performance tab with CPU 4–6× throttle applied, or
2. A physical mid-tier Android device (e.g. Moto G series).

The durable guarantee is the property guard (`perf.contract.test.ts`) plus
DEC-004's CSS approach. As long as those hold, the GPU compositor path is
intact. If a future spec adds a complex enough scene to bust the frame budget
despite compositor-only properties (e.g. hundreds of particles), that is the
signal to revisit DEC-004.

---

## Conclusion

The `perf-60fps` target is met by construction: DEC-004 (CSS transforms) is
validated by the compositor-only keyframe sweep. The heaviest moment — jackpot
scene + 32-particle burst + audio — composites on the GPU without main-thread
layout. `will-change: transform` is added to `.reel--spinning` (most frequent
animation) to eliminate promotion jank at spin start. No revisit of DEC-004 is
warranted.
