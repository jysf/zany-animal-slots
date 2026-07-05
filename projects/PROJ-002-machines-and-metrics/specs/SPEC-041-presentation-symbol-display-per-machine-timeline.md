# SPEC-041 timeline

Architect appends as cycles are designed. Executors update status as
they go. Status markers: `[ ]` not started · `[~]` in progress · `[x]` complete · `[?]` blocked.

Cycle prompts live in `prompts/SPEC-041-<cycle>.md`.

## Instructions

- [x] **design** — completed 2026-07-04 (Opus): first UI-touching STAGE-007 spec. Thread
      `symbolDisplay` (emoji/label) from the machine's presentation slice into ReelGrid (prop)
      + paytableRows (param), sourced from the default machine WILD_AND_WHIMSICAL — replacing
      the direct `SYMBOL_DISPLAY` imports in ReelGrid.tsx + paytable.ts. Extract a
      `SymbolDisplay` type. Visual parity (identical glyphs) via unchanged component-test
      expectations + a preview check at ship; added two "supplied map" cases proving the
      components render the passed map. **Scope decision: per-machine theme + audio DEFERRED to
      STAGE-008** (invasive runtime wiring, no payoff until a distinct machine exists) —
      recorded in the STAGE-007 Design Notes + brief STAGE-008 line. Build prompt written. No new DEC.
- [ ] **build** — Sonnet sub-agent (local only): apply the drop-in prop/param threading + test
      updates; keep every rendered expectation identical; src/engine diff empty; no theme/audio.
- [ ] **verify** — Sonnet sub-agent (cold review): full gate + AC-by-AC + visual-parity (no
      changed rendered expectations) + supplied-map-guard-is-real + no-SYMBOL_DISPLAY-in-consumers
      + engine-untouched + no-theme/audio-leak checks.
- [ ] **ship** — Opus (orchestrator): PR, CI-poll, squash-merge, **preview visual check** (UI
      spec), cost totals, bookkeeping, archive; update STAGE-007 backlog line + count.
