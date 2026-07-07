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
