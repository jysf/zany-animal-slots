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
- [x] **build** — gate green (54 files / 320 tests, +7); `stripBuilder.ts` +
      `stripBuilder.test.ts` implemented verbatim from the spec Notes; pinned example matched
      first try; hard guard (machine/production diff) empty.
- [x] **verify** — 2026-07-05 (Sonnet, cold review; **[?] finding resolved by Opus — not a
      defect**). Gate green: `just typecheck` clean,
      `just lint` clean, `just test` 54 files/320 tests passed (stripBuilder.test.ts 7/7),
      `just build` succeeded, `just validate` 45/45 specs valid. Code matches the spec's
      drop-in byte-for-byte (fractional keys `(k+0.5)/c`, sort `a.key-b.key || a.ord-b.ord`,
      adjacency-fix loop); type-only `SymbolId` import confirmed (no DOM/React, no RNG,
      no `Math.random`); `buildStrip` confirmed NOT re-exported from `src/engine/index.ts`.
      No `.skip`/`.only`/`xit` in the test file. Independently reproduced (vite-node, outside
      the test file) both key properties: count-exactness across 8 self-chosen weight
      profiles (uniform, extreme-skew e.g. `{DEER:100,FOX:1}` and `{DEER:1,WOLF:200}`,
      single-symbol, 8-way even split) all count-exact by construction; and the pinned example
      `buildStrip(SYMBOLS,{DEER:3,FOX:2,WOLF:1})` reproduced exactly as
      `['DEER','FOX','DEER','WOLF','FOX','DEER']`. Adversarial mutation (a) — changed
      `(k + 0.5)` to `(k + 1.5)`: pinned-example test FAILED as expected (produced
      `[DEER,FOX,DEER,FOX,DEER,WOLF]` instead); reverted, `git diff` on the file confirmed
      empty. **Defect found in mutation (b)** — removing the `|| a.ord - b.ord` tie-break
      (`items.sort((a,b) => a.key - b.key)`) did **NOT** fail any test: all 7
      stripBuilder tests and all 320 repo tests still passed. Root cause: `Array.prototype
      .sort` is spec-guaranteed stable (ES2019+, and V8/Node honor this), and the `items`
      array is built by iterating `symbols` in order, so insertion order already equals
      canonical `ord` order for any tied key — the explicit tie-break is fully redundant
      with native stable sort given this construction, so no realistic weight profile can
      make it observably differ (confirmed by trying a reversed-order `symbols` array too:
      still no diff, because per-symbol items are still inserted in `symbols` iteration
      order regardless of which order value each symbol carries). This is a real
      test-strength gap, not a functional bug — the code behaves correctly either way, but
      the "verify-cycle adversarial check" the spec's Notes prescribed for the tie-break
      does not have teeth as written. Reverted the mutation; `git diff` on the file
      confirmed empty. Hard guard confirmed EMPTY:
      `git diff main..HEAD -- src/machines/ src/engine/strips.ts src/engine/paylines.ts
      src/engine/machine.ts src/engine/spin.ts src/engine/index.ts` and
      `git diff main..HEAD -- package.json package-lock.json` both produced no output.
      Defect count: 1 (test-teeth gap on the tie-break mutation; no behavior/spec-conformance
      defect). Recommend either dropping the tie-break as dead code (with a comment
      explaining stability makes it redundant) or adding a test that actually exercises a
      case where insertion order and canonical order diverge (not achievable with the
      current `items` construction, since insertion always follows `symbols` order) —
      most practically, this may simply not be testable as constructed, in which case the
      spec's Notes should stop asserting this mutation "confirms" anything.
- [x] **verify-resolution** — 2026-07-05 (Opus). Confirmed the [?] is **not a functional
      defect and not a genuine test gap**: the tie-break IS redundant with the ES2019 stable-sort
      guarantee given insertion-in-`symbols`-order, so no input can distinguish its presence from
      its absence — the code is correct and the property is simply not observable, so it is not
      testable. Resolution: kept the explicit tie-break (defensive — keeps determinism from
      silently relying on sort stability) and added a code comment documenting exactly this, so
      the redundancy reads as deliberate. Re-gated: `just typecheck`/`lint`/`test` (54 files /
      320 tests) / `build` / `validate` all green after the comment. Mutation (a) retains real
      teeth. Lesson logged to the PROJ-002 signals set: adversarial-mutation checks must target
      code whose behavior an input can actually distinguish; a mutation on stable-sort-redundant
      code is a no-op by construction, not a test-strength failure.
- [ ] **ship**
