# SPEC-058 timeline

Architect appends as cycles are designed. Executors update status as
they go. Status markers: `[ ]` not started · `[~]` in progress · `[x]` complete · `[?]` blocked.

Cycle prompts live in `prompts/SPEC-058-<cycle>.md`.

## Instructions

- [x] **design** — completed 2026-07-09 (Opus): STAGE-012's single spec — gives Arctic/Desert/Ocean
      their own reel creatures via per-machine `presentation.symbolDisplay` maps (Arctic = polar,
      Desert = arid, Ocean = marine; W&W keeps the forest-animal default). **Corrects an autonomous
      decision**: DEC-017/018's shared-vocabulary clause (authored by an overnight run, not the user,
      and later cited by SPEC-053 to reject a per-machine-symbols prototype) is superseded by the
      newly-authored **DEC-021**, which records the user's actual intent. Presentation-only: verified
      the plumbing already exists — `ReelGrid` (SPEC-041) and `paytableRows`/`PaytableSheet` already
      read the ACTIVE machine's `symbolDisplay`, so per-machine maps propagate to reels + paytable with
      zero wiring; the engine alphabet (8 `SymbolId`s) + every machine's math stay byte-identical
      (engine diff must be EMPTY). Complete drop-in code for the three themed maps + machine edits + the
      three flipped vocabulary guard-tests (own map, all 8 keys, a pinned signature `WOLF.label` —
      Polar Bear / Sidewinder / Shark) in the spec Notes. W&W's parity test is UNCHANGED. Three
      adversarial guard-mutations specified for verify (revert each machine's `symbolDisplay` to
      `SYMBOL_DISPLAY` ⇒ its test fails). **[S]** Build prompt written to `prompts/SPEC-058-build.md`.
- [x] **build** — completed 2026-07-09 (Opus, single-agent, branch feat/spec-058-per-machine-symbols):
      added the ARCTIC/DESERT/OCEAN_SYMBOLS themed maps to the three machine files, pointed each
      `presentation.symbolDisplay` at its own (swapped the `SYMBOL_DISPLAY` import for the `SymbolDisplay`
      type), and flipped the three vocabulary guard-tests (own map, all 8 keys, pinned `WOLF.label` —
      Polar Bear / Sidewinder / Shark). Full gate green: typecheck, lint, test (69 files / 408 tests),
      build, validate, cost-audit. Boundary diffs vs main EMPTY: `src/engine/` (DEC-001) and W&W
      (`wildAndWhimsical.ts` + parity test); no math line changed in any themed machine. Preview-verified
      all four machines: Arctic (Caribou…Polar Bear), Desert (Camel…Sidewinder), Ocean (Dolphin…Shark, +
      paytable), W&W (forest animals, unchanged). Process note: an initial mutation pass reverted the
      uncommitted machine files via `git checkout`; recovered by re-applying and committing the build
      before re-running mutations.
- [x] **verify** — completed 2026-07-09 (Opus, cold review): full gate re-run green (typecheck, lint,
      test 69 files / 408 tests, build, validate, cost-audit). Three adversarial guard-mutations (revert
      each machine's `presentation.symbolDisplay` to `SYMBOL_DISPLAY`, import + pointer) each failed
      EXACTLY that machine's vocabulary test (1 failed | 5 passed), then reverted clean to the committed
      build. `git diff main` on `src/engine/` + W&W EMPTY; no math changed. Preview: switched all four
      machines — Arctic/Desert/Ocean show their own creatures on the reels (+ Ocean paytable), W&W
      unchanged (parity). Zero defects.
- [x] **ship** — shipped 2026-07-09 via PR #68 (squash-merged to main, commit `a4ef6ad`). CI CLEAN, all
      7 checks SUCCESS. Post-merge: cycle → ship, STAGE-012 backlog SPEC-058 [x] (1/1 — backlog
      complete), archived, +2 template signals (autonomous-override-of-user-intent; commit-build-before-
      mutation-testing). Nominal build/verify cost (single-agent run, ~$1.18 / 4 sessions). The only
      spec of STAGE-012 — the stage-ship follows this closeout.
