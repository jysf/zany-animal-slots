# SPEC-052 timeline

Architect appends as cycles are designed. Executors update status as
they go. Status markers: `[ ]` not started · `[~]` in progress · `[x]` complete · `[?]` blocked.

Cycle prompts live in `prompts/SPEC-052-<cycle>.md`.

## Instructions

- [x] **design** — completed 2026-07-07 (Opus): **Desert**, the second themed machine, as pure data +
      **DEC-018** — a sibling of DEC-017 (Arctic), same mold. A `Machine` data file
      (`src/machines/desert.ts`): same 8-symbol vocabulary (`SYMBOL_DISPLAY`), a warm sand/amber
      **desert theme** (11 `--color-*` overrides, all pairs WCAG AA — text-on-bg 15.76:1), **warm dry
      audio** (fuller warm bed, a bright open **G-major** chord `['G3','B3','D4','A4']` on dry half
      notes), and its **own sparse, higher-variance tuned math**. Math MEASURED against the real
      simulator before pinning (SPEC-046/051 discipline): swept steep→flat weight profiles × paytable
      scales; steep overshot RTP (>110%), flat landed the sparse desert character. Chosen weights
      DEER8/FOX7/SQUIRREL6/BEAR5/EAGLE5/OWL4/BISON4/WOLF3 (sum 42, flatter than W&W and Arctic) +
      paytable low[1,2,8]/mid[2,8,21]/high[7,18,60]/jackpot[12,58,280] (stingy small wins, juicy
      high/jackpot) → **avg RTP 89.98% (10-seed range 87.4–94.0%), hit 27.65% (sparser than Arctic 30%
      / W&W 34%), jackpot ~1/21.7k**; strip (buildStrip) 0 adjacent dups. Pinned 20k/seed-1 = rtp
      0.9556 / hit 0.2797 for the sanity test. Registered third (W&W first/default, then Arctic). No
      engine change at all — `buildStrip`/`REEL_COUNT` already public since SPEC-051 (guard diff on
      `src/engine/` EMPTY). Complete drop-in code + DEC-018 body + 6 failing tests (registration /
      vocabulary / RTP-band / strip-integrity / distinct-from-W&W-AND-Arctic / theme-contrast). No new
      dep. **[M]** Build prompt written.
