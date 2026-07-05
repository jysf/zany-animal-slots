# SPEC-046 — BUILD prompt (fresh session — Sonnet)

> Run on **claude-sonnet-4-6** (AGENTS §8). LOCAL ONLY: branch + local commits.
> NO push, NO PR, NO `gh`, NO `just advance-cycle`.
>
> ⚠ This is the BEHAVIOR-CHANGING retune. Frozen-seed / metrics fixtures are DELIBERATELY
> re-baselined — **a changed fixture here is INTENDED**, not a regression. Every new value is
> pinned in the spec (computed against the real engine); apply the data and make them pass.

```
Cycle: build. You are NOT the architect. The spec file is your only context.

Read in order:
1. /AGENTS.md (§5 build flow, §8 models, §12 tests).
2. /projects/PROJ-002-machines-and-metrics/specs/SPEC-046-fun-retune-wild-and-whimsical.md
   — the ENTIRE spec. The Failing Tests section lists EXACT re-baselined values for every
   fixture; the Notes contain drop-in code for strips.ts, paylines.ts, PaylineMap.tsx and the
   DEC-016 content. All values were computed via vite-node against the real buildStrip + engine.
3. /decisions/DEC-015 + /decisions/DEC-003 + /decisions/DEC-011 + /decisions/_template.md (read).
4. Source (read; you WILL edit the ones listed under Outputs): src/engine/strips.ts,
   src/engine/paylines.ts, src/engine/machine.ts, src/engine/stripBuilder.ts (SPEC-045),
   src/ui/PaylineMap.tsx, and every test under Failing Tests.

Before coding, branch and mark build [~] in the SPEC-046 timeline.
Branch: git checkout main && git pull --ff-only && git checkout -b feat/spec-046-fun-retune-wild-and-whimsical

Implement EXACTLY the spec:
A. PRODUCTION DATA (drop-ins in the Notes):
   - src/engine/strips.ts: REEL_WEIGHTS → tuned (sum 42); REEL_STRIP = buildStrip(SYMBOLS,
     REEL_WEIGHTS) (delete the old hand-authored literal); STRIPS unchanged in form.
   - src/engine/paylines.ts: LineId → `L${number}`; PAYLINES → the 20 lines; PAYTABLE → tuned.
   - src/ui/PaylineMap.tsx: replace the two Record<LineId,string> maps with per-line labels from
     the map index (`Line ${i+1}` / `Payline ${i+1}`); delete LINE_LABELS/LINE_ARIA.
   - src/machines/machine.ts: expected UNCHANGED — confirm it still compiles (it references the
     updated constants). Do NOT edit unless an import genuinely breaks.
B. NEW DEC: decisions/DEC-016-fun-retune-wild-and-whimsical.md per the Notes (template = DEC-015).
C. RE-BASELINE the 8 test files to the EXACT values in Failing Tests (strips.test, paylines.test,
   index.test, spin-parity.test, metrics.test, machine-parity.contract.test,
   wildAndWhimsical.parity.test, useSlotMachine.test).

CRITICAL — re-baseline discipline:
- The pinned values were computed against the real engine, so they reproduce. If a test fails on
  a value that DISAGREES with the spec, you applied the DATA wrong — fix the data, not the pin.
- If a test fails on a value the spec did NOT list (e.g. a synthetic-grid or UI assertion the
  20-line change also moved), re-derive the correct value from the deterministic engine, update
  it, and note it in Build Completion. That IS an intended re-baseline.
- Do NOT change engine LOGIC (spin.ts, evaluatePaylines body, tiers.ts, rng.ts). Only DATA +
  the LineId type + PaylineMap labels + fixtures.

Guards (must hold before finishing):
- `just simulate wild-and-whimsical --spins 50000 --seed 20260705` reports RTP ≈ 0.94 / hit ≈ 0.34.
- No new dependency. Engine-no-dom holds (no DOM import in src/engine).

Gate (all exit 0): just typecheck && just lint && just test && just build && just validate && just cost-audit
Confirm the simulator output above; confirm `git diff` touches only data/fixtures/PaylineMap/DEC
(no engine-logic bodies).

When done:
1. Fill "## Build Completion" (incl. 3 honest reflection answers + list any fixtures you
   re-derived beyond the spec's pinned set).
2. Append a build cost session (cycle: build, agent: claude-sonnet-4-6, interface: claude-code,
   tokens_total: null + "orchestrator to fill tokens_total from subagent_tokens" note, duration/notes).
3. Mark build [~] in the timeline.
4. Commit locally with a message referencing SPEC-046 (note: intended re-baseline).
DO NOT git push / open a PR / run gh / run just advance-cycle.
```
