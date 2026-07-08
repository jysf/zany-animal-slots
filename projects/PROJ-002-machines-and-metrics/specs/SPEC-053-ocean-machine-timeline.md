# SPEC-053 timeline

Architect appends as cycles are designed. Executors update status as
they go. Status markers: `[ ]` not started · `[~]` in progress · `[x]` complete · `[?]` blocked.

Cycle prompts live in `prompts/SPEC-053-<cycle>.md`.

## Instructions

- [x] **design** — completed 2026-07-07 (Opus): **Ocean**, the fourth and final themed machine, as pure
      data + **DEC-019** — a sibling of DEC-017 (Arctic) / DEC-018 (Desert), same mold. A `Machine` data
      file (`src/machines/ocean.ts`): same 8-symbol vocabulary (`SYMBOL_DISPLAY`), a teal/deep-blue
      **ocean theme** (11 `--color-*` overrides, text-on-bg 16.14:1, every foreground pair ≥ 7.29:1),
      **flowing spacious audio** (gentle bed, slow swells, a shimmering open **A-major** chord
      `['A2','E3','C#4','E4']` on long whole notes over a wide 3m loop), and its **own steady,
      low-variance tuned math**. Ocean's identity is the INVERSE of Desert's sparseness — "flowing/
      steady": the HIGHEST hit-frequency of the four with the GENTLEST high/jackpot payouts. Math
      MEASURED against the real simulator before pinning (SPEC-046/051/052 discipline): swept ~10 weight
      profiles × paytable scales × 10 seeds × 50k spins; concentrating weight on low symbols to lift hit-
      frequency drove RTP up fast (first candidates 112–128%), so the paytable multipliers were pulled
      down to land the band. Chosen weights DEER10/FOX9/SQUIRREL7/BEAR4/EAGLE3/OWL3/BISON3/WOLF3 (sum 42,
      steeper low-end than the others) + paytable low[1,2,6]/mid[2,4,12]/high[3,9,32]/jackpot[6,30,150]
      (the gentlest highs — low variance) → **avg RTP 94.21% (10-seed range 92.88–95.74%), hit 37.45%
      (the highest — vs W&W 34% / Arctic 30% / Desert 28%), jackpot ~1/26.3k**; strip (buildStrip) 0
      adjacent dups. Pinned 20k/seed-1 = rtp 0.94185 / hit 0.37165 (big 0.04595, 3 jackpots) for the
      sanity test; hit-band [0.35, 0.40] (above the other machines), RTP-band [0.88, 1.00]. Registered
      fourth (W&W first/default, then Arctic, Desert). No engine change at all — `buildStrip`/`REEL_COUNT`
      already public since SPEC-051 (guard diff on `src/engine/` EMPTY). Complete drop-in code + DEC-019
      body + 6 failing tests (registration / vocabulary / RTP-band / strip-integrity /
      distinct-from-W&W-AND-Arctic-AND-Desert / theme-contrast). No new dep. **[M]** Build prompt written.
- [x] **build** — completed 2026-07-07 (Sonnet): created `src/machines/ocean.ts` + `src/machines/
      ocean.test.ts` verbatim from the spec Notes; registered `OCEAN` in `src/machines/registry.ts`
      (after Desert). DEC-019 already existed from design and verified to match the Notes exactly — left
      unchanged. Gate green: `just typecheck && just lint && just test && just build && just validate &&
      just cost-audit` all exit 0 (374 tests / 63 files, incl. 6 new Ocean tests). `just simulate ocean
      --spins 50000` → RTP 94.10% / hit 37.70% (in band). `git diff main..HEAD -- src/engine/` EMPTY — no
      engine change. Local commit only (no push/PR per build-cycle scope).
- [x] **verify** — completed 2026-07-07 (Sonnet, cold): re-ran the FULL gate — `typecheck && lint && test &&
      build && validate && cost-audit` all exit 0 (374 tests / 63 files, incl. Ocean's 6). Engine guard diff
      (`git diff main..HEAD -- src/engine/`) EMPTY — DEC-001 intact; `--stat` vs main shows only `ocean.ts`
      (new), `ocean.test.ts` (new), a 2-line `registry.ts` edit, and the two SPEC-053 docs — Wild & Whimsical/
      Arctic/Desert and their tests untouched. Reconciled pins in `ocean.ts`: weights DEER10/FOX9/SQUIRREL7/
      BEAR4/EAGLE3/OWL3/BISON3/WOLF3 (sum 42), paytable low[1,2,6]/mid[2,4,12]/high[3,9,32]/jackpot[6,30,150],
      chord `['A2','E3','C#4','E4']` — all match the spec verbatim; `simulateMachine(OCEAN.math,{spins:20000,
      seed:1})` reproduces rtp 0.94185 / hit 0.37165 exactly (bands [0.88,1.00]/[0.35,0.40]). **Four
      adversarial guard-mutations, all bit as designed:** (a) reverted weights+paytable to Desert's →
      hit-band test FAILED (`expected 0.27975 to be greater than or equal to 0.35`) AND distinct-test FAILED
      on paytable; (b) `theme: {}` → distinct-test FAILED (`expected {} to not deeply equal {}`) AND
      theme-contrast test FAILED (`expected undefined to be truthy`); (c) chord → Desert's `['G3','B3','D4',
      'A4']` → distinct-test FAILED on the chord assertion; (d) removed `[OCEAN.id]: OCEAN` from
      `registry.ts` → registration test FAILED (`getMachine('ocean')` fell back to the default machine).
      All four reverted (`git checkout --`); full suite re-confirmed green (374/374); working tree clean
      after each. `just simulate ocean --spins 50000` → RTP 94.10% / hit 37.70% (in band). **0 defects.**
      **Preview sanity (Opus orchestrator, dev server port 5173):** the header selector now lists all FOUR
      machines (Wild & Whimsical / Arctic / Desert / Ocean); switching to Ocean applied its teal theme live
      on `.device-stage` (`--color-bg #041a26`, `--color-accent #25c7c9`, `--color-text #e6f7fb` — Ocean's
      exact palette) and persisted `localStorage['zany:active-machine']='ocean'`; the 8-animal symbol
      vocabulary is unchanged (deer/bear/bison/squirrel/owl/fox/eagle/wolf — the shared `SYMBOL_DISPLAY`);
      an unknown persisted id (`nonexistent-xyz`) correctly falls back to the default Wild & Whimsical (no
      theme override); no console errors.
- [~] **ship** — closeout committed (cost sessions filled: build 94856 tok / verify 79873 tok, both
      metered Sonnet; ship on Opus loop; totals 174729 tok / $1.16 / 4 sessions), branch pushed, PR
      opening + CI-poll next.
