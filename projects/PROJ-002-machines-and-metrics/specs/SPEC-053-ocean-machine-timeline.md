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
- [ ] **verify**
- [ ] **ship**
