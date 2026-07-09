# SPEC-055 timeline

Architect appends as cycles are designed. Executors update status as
they go. Status markers: `[ ]` not started · `[~]` in progress · `[x]` complete · `[?]` blocked.

Cycle prompts live in `prompts/SPEC-055-<cycle>.md`.

## Instructions

- [x] **design** — completed 2026-07-08 (Opus): the STAGE-009 **reactive keystone** — lifts SPEC-054's
      pure `sessionStats` reducers into a reactive, persisted React Context in
      `src/ui/stats/StatsProvider.tsx` (`StatsProvider`/`useStats`, mirroring SPEC-049's
      `MachineProvider` exactly: no-op default so provider-less tests keep passing,
      `useState(() => readStats())` hydration, persist-on-change, `recordSpin`/`recordCashIn`/
      `resetStats` via the pure reducers) — and **wires recording into the game**: `useSlotMachine`'s
      spin-resolve calls `recordSpin({ totalWin, bet, tier }, machine.id)` once per resolve, the wallet
      `reset()` calls `recordCashIn()` (the stage invariant: wallet Reset is a *counted* cash-in, NOT a
      stats clear), and `main.tsx` nests `<StatsProvider>` inside `<MachineProvider>`. After this spec
      stats accumulate + persist across reloads with **no display surface** (SPEC-056/057). Pinned
      values **measured against the real engine** (vite-node) BEFORE the failing tests: seed 276 ⇒
      totalWin 40 / tier 'small' (a WIN — spins 1, totalWon 40, biggestWin {40, wild-and-whimsical,
      small}, series [30]); seed 12345 ⇒ totalWin 0 / tier 'none' (series [-10]); reset() ⇒ cashIns 1,
      spins unchanged. **No new DEC** (rides DEC-020's model + DEC-001/DEC-005, exactly as SPEC-050 rode
      SPEC-049's DEC-less seam). DEC-001 clean (`git diff src/engine/` must stay EMPTY); DEC-005 clean
      (localStorage, guarded); no new dependency. Complete drop-in provider + both test files + the two
      precise seam edits in the spec's Notes. Three adversarial guard-mutations specified for verify
      (drop the recordSpin seam call, drop recordCashIn in reset, revert hydration to emptyStats).
      **[M]** Build prompt written to `prompts/SPEC-055-build.md`.
