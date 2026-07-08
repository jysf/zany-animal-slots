# SPEC-051 timeline

Architect appends as cycles are designed. Executors update status as
they go. Status markers: `[ ]` not started · `[~]` in progress · `[x]` complete · `[?]` blocked.

Cycle prompts live in `prompts/SPEC-051-<cycle>.md`.

## Instructions

- [x] **design** — completed 2026-07-07 (Opus): **Arctic**, the first themed machine, as pure data +
      **DEC-017**. A `Machine` data file (`src/machines/arctic.ts`): same 8-symbol vocabulary
      (`SYMBOL_DISPLAY`), a cool-blue **icy theme** (11 `--color-*` overrides, all pairs WCAG AA —
      text-on-bg 16.4:1), **colder audio** (quieter bed, hollow stacked-fifths pad `['D3','A3','E4','B4']`
      on slow whole notes), and its **own tuned math**. Math MEASURED against the real simulator before
      pinning (SPEC-046 discipline): weights DEER8/FOX8/SQUIRREL7/BEAR5/EAGLE4/OWL4/BISON3/WOLF3 (sum 42,
      flatter than W&W) + paytable low[1,3,9]/mid[2,7,21]/high[5,15,56]/jackpot[10,52,258] (bigger
      5-of-a-kind) → **avg RTP 90.9% (10-seed range 89.2–94.5%), hit 30.1%, jackpot ~1/31k**; strip
      (buildStrip) 0 adjacent dups. Pinned 20k/seed-1 = rtp 0.9435 for the sanity test. Registered in
      the registry (W&W stays default/first); `buildStrip` + `REEL_COUNT` exposed from `engine/index.ts`
      so machines build math via the public interface. No engine LOGIC change (guard diff on
      spin/paylines/tiers/balance/strips/machine EMPTY). Complete drop-in code + DEC-017 body + failing
      tests (registration / vocabulary / RTP-band / strip-integrity / distinct-from-W&W / theme-contrast).
      No new dep. **[M]** Build prompt written.
- [x] **build** — completed 2026-07-07 (Sonnet, branch `feat/spec-051-arctic-machine`): transcribed
      the spec's drop-in code verbatim — `engine/index.ts` (+`buildStrip`, +`REEL_COUNT` re-exports),
      `src/machines/arctic.ts` (`ARCTIC_WEIGHTS`, `ARCTIC_PAYTABLE`, `ARCTIC_STRIP`, `ARCTIC_MATH`,
      theme, audio), `registry.ts` (Arctic registered, W&W stays first/default), `DEC-017`, and the 6
      failing tests in `src/machines/arctic.test.ts`. No re-tuning, no engine-logic change (guard diff
      on spin/paylines/tiers/balance/strips/machine EMPTY). Gate green: typecheck, lint, test (362
      tests / 61 files), build, validate, cost-audit all pass; `just simulate arctic --spins 50000`
      reports RTP 89.92% / hit 29.82% / jackpot 1-in-50000. Local commits only — no push, no PR.
- [x] **verify** — completed 2026-07-07 (Opus, cold, single-agent overnight): re-ran the FULL gate on
      the rebased branch — typecheck, lint, test (362 tests / 61 files), build, validate, cost-audit all
      exit 0. Engine-logic guard diff (`git diff main..HEAD -- src/engine/spin.ts paylines.ts tiers.ts
      balance.ts strips.ts machine.ts stripBuilder.ts`) EMPTY — DEC-001 intact; only `engine/index.ts`
      gains two re-exports. Confirmed Arctic's math is genuinely tuned (weights DEER8/OWL4 vs W&W
      DEER9/OWL3; distinct paytable). **Adversarial guard-mutation (teeth):** reverted Arctic's
      weights+paytable to the W&W values → the "distinct from Wild & Whimsical" test FAILED as designed
      (`expected {low:[1,3,7],…} to not deeply equal {low:[1,3,7],…}`); restored, diff clean, all 6
      Arctic tests green again. `just simulate arctic --spins 50000` reproduces RTP 89.92% / hit 29.82%.
      **Preview sanity (dev server, port 5173):** the header `<select aria-label="Machine">` now lists
      BOTH "Wild & Whimsical" and "Arctic"; selecting Arctic applies its theme live on `.device-stage`
      (`--color-bg #0a1622`, `--color-accent #3fc4ec`, `--color-text #eaf4fb` — Arctic's exact palette),
      icy dark-blue background rendered, no console errors. **Defect count: 0.**
