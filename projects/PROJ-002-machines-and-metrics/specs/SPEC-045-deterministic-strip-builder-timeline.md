# SPEC-045 timeline

Architect appends as cycles are designed. Executors update status as
they go. Status markers: `[ ]` not started · `[~]` in progress · `[x]` complete · `[?]` blocked.

Cycle prompts live in `prompts/SPEC-045-<cycle>.md`.

## Instructions

- [x] **design** — completed 2026-07-05 (Opus): a pure, deterministic
      `buildStrip(symbols, weights)` (new `src/engine/stripBuilder.ts`) that generates a reel
      strip from per-symbol weights — the mechanism SPEC-046's "generate strips from weights"
      retune consumes (the user's chosen tuning knob; SPEC-044 found the hand-authored strip
      made `reelWeights` inert). **Fractional-rank interleave → provably count-exact** (verified
      via vite-node: 0 count failures over 300 random weightsets) + an adjacency-fix pass (no
      linear adjacent dups on realistic weights). Pure additive infra — touches NO machine,
      NO behavior change, NO frozen-seed re-baseline (that's SPEC-046). Complete drop-in code +
      the exact pinned example (`{DEER:3,FOX:2,WOLF:1}` → `[DEER,FOX,DEER,WOLF,FOX,DEER]`) in
      the spec Notes; 7 failing tests specified. No new dep, no new DEC. Build prompt written.
- [ ] **build**
- [ ] **verify**
- [ ] **ship**
