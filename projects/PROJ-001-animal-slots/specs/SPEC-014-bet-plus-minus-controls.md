---
# Maps to ContextCore task.* semantic conventions.

task:
  id: SPEC-014
  type: story
  cycle: verify
  blocked: false
  priority: high
  complexity: S

project:
  id: PROJ-001
  stage: STAGE-003
repo:
  id: animal-slots

agents:
  architect: claude-opus-4-8
  implementer: claude-sonnet-4-6
  created_at: 2026-06-23

references:
  decisions:
    - DEC-001
    - DEC-005
  constraints:
    - portrait-first
    - touch-targets-44
    - test-before-implementation
    - one-spec-per-pr
  related_specs:
    - SPEC-009
    - SPEC-013

value_link: "Lets the player choose a stake — bet +/− across 10/25/50 (engine nextBet/prevBet), bounded by what the balance can afford, feeding the existing spin flow."

cost:
  sessions:
    - cycle: design
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      duration_minutes: 20
      recorded_at: 2026-06-23
      notes: "main-loop, not separately metered (AGENTS §4); design cycle"
    - cycle: build
      agent: claude-sonnet-4-6
      interface: claude-code
      tokens_total: 69510
      estimated_usd: 0.46
      duration_minutes: 3.9
      recorded_at: 2026-06-23
      notes: "Sonnet sub-agent build (Agent subagent_tokens=69510, 235s). estimated_usd ~= tokens x $6.6/M Sonnet blended, no cache discount (order-of-magnitude, AGENTS §4)."
    - cycle: verify
      agent: claude-sonnet-4-6
      interface: claude-code
      tokens_total: 65488
      estimated_usd: 0.43
      duration_minutes: 3.6
      recorded_at: 2026-06-23
      notes: "Sonnet sub-agent verify (Agent subagent_tokens=65488, 213s). estimated_usd ~= tokens x $6.6/M Sonnet blended, no cache discount (order-of-magnitude, AGENTS §4)."
  totals:
    tokens_total: 0
    estimated_usd: 0
    session_count: 0
---

# SPEC-014: Bet +/− controls

## Context

The third STAGE-003 spec. SPEC-013 fixed the bet at 10; this adds the player's
choice of stake: **bet +/−** stepping through the three levels (10 / 25 / 50)
using the engine's `nextBet`/`prevBet` (DEC-009 cap/floor) and `canAfford`. Raising
the bet is blocked when the balance can't cover the higher level; lowering is
blocked at the floor. The chosen bet flows into the existing `spin()` (the spin
debits the current bet). Pure control wiring — no new game logic (DEC-001).

See `STAGE-003-reels-ui-and-spin-flow.md`, `DEC-005` (play-money), and the engine's
`nextBet`/`prevBet`/`canAfford`/`BET_LEVELS` (SPEC-009, re-exported via
`src/engine/index.ts`). Builds on SPEC-013's `useSlotMachine` + Action region.

## Goal

Add bet stepping to `useSlotMachine` (`increaseBet`/`decreaseBet` + `canIncreaseBet`/
`canDecreaseBet`) driven by the engine's `nextBet`/`prevBet`/`canAfford`, and render
**−**/**+** bet buttons in the Action region (disabled at the affordable cap/floor),
with the live bet shown in the Status readout.

## Inputs

- **Files to read:** `src/engine/index.ts` (`nextBet`, `prevBet`, `canAfford`,
  `BET_LEVELS`, `BetLevel`), `src/ui/useSlotMachine.ts`, `src/ui/regions/Action.tsx`
  + `Status.tsx` + `controls.css`, `src/ui/App.tsx`.
- **Related code paths:** `src/ui/`.

## Outputs

- **Files modified:**
  - `src/ui/useSlotMachine.ts` — make `bet` stateful; add `increaseBet()`,
    `decreaseBet()`, `canIncreaseBet`, `canDecreaseBet` to the result.
  - `src/ui/regions/Action.tsx` — render bet **−** and **+** buttons (≥44px) from new
    props `{ onBetDown, onBetUp, canBetDown, canBetUp }` alongside Spin.
  - `src/ui/App.tsx` — thread the new hook fields into `Action`.
  - `src/ui/useSlotMachine.test.tsx`, `src/ui/regions/Action.test.tsx` — extend.
  - `src/ui/regions/controls.css` — style the bet stepper (tokens, no raw hex).
- **New exports:** the extended `UseSlotMachineResult` fields above.
- **Database changes:** none.

## Acceptance Criteria

- [ ] `increaseBet()` steps `bet` 10→25→50 and clamps at 50; `decreaseBet()` steps
      50→25→10 and clamps at 10 (engine `nextBet`/`prevBet`).
- [ ] `canIncreaseBet` is true only when not at 50 **and** `canAfford(balance,
      nextBet(bet))`; `canDecreaseBet` is true only when not at 10. `increaseBet`/
      `decreaseBet` are no-ops when their flag is false.
- [ ] The chosen `bet` is what `spin()` uses (a spin debits the current bet).
- [ ] The Action region renders accessible **−**/**+** bet buttons (≥44px,
      `touch-targets-44`), disabled per `canBetDown`/`canBetUp`; the Status readout
      shows the current bet.
- [ ] UI imports the engine only via `src/engine`; engine unchanged; gate
      (`typecheck`/`lint`/`test`/`build`) exits 0.

## Failing Tests

Written during **design**, BEFORE build. RTL/`renderHook`; bet stepping is logic,
the look is a preview check.

- **`src/ui/useSlotMachine.test.tsx`** (extended)
  - `"increaseBet steps up and clamps at 50"` — `useSlotMachine()` (balance 1000):
    after `act(increaseBet)` `bet === 25`; again `=== 50`; again `=== 50`;
    `canIncreaseBet === false` at 50.
  - `"decreaseBet steps down and clamps at 10"` — from 50, `decreaseBet` →25 →10
    →10; `canDecreaseBet === false` at 10.
  - `"cannot raise the bet beyond the affordable balance"` —
    `useSlotMachine({ initialBalance: 20 })`: `canIncreaseBet === false` (can't
    afford 25); `act(increaseBet)` leaves `bet === 10`.
  - `"spin uses the chosen bet"` — `useSlotMachine({ nextSeed: () => 12345 })`:
    `act(increaseBet)` (bet 25), then `act(spin)` → `balance === 975` (1000 − 25 + 0
    for the losing seed 12345).

- **`src/ui/regions/Action.test.tsx`** (extended)
  - `"renders bet − and + buttons wired to handlers"` — render `<Action>` with the
    bet props; the −/+ buttons (accessible names like /decrease bet/i and
    /increase bet/i) call `onBetDown`/`onBetUp` when clicked.
  - `"disables bet buttons per can-bet flags"` — with `canBetUp={false}` the + is
    `disabled`; with `canBetDown={false}` the − is `disabled`.

## Implementation Context

### Decisions that apply

- `DEC-005` (play-money) — bets are play coins; raising is bounded by the balance.
- `DEC-001` — bet stepping uses the engine's `nextBet`/`prevBet`/`canAfford`; the UI
  adds no betting rules of its own.

### Constraints that apply

- `touch-targets-44` — the −/+ buttons (and Spin) are ≥44px.
- `portrait-first`, `test-before-implementation`, `one-spec-per-pr`.

### Prior related work

- `SPEC-009` (shipped) — `BET_LEVELS [10,25,50]`, `nextBet`/`prevBet` (clamped),
  `canAfford`. `SPEC-013` (shipped) — `useSlotMachine` + Action region's Spin button.

### Out of scope (for this spec specifically)

- Balance persistence + Reset (SPEC-015); reel animation (SPEC-016); auto-spin
  (SPEC-017); line highlight (SPEC-018).
- Disabling controls *during* a spin — there is no spinning phase yet (SPEC-016).

## Notes for the Implementer

- Hook: `const [bet, setBet] = useState<BetLevel>(DEFAULT_BET);`
  `canIncreaseBet = nextBet(bet) !== bet && canAfford(balance, nextBet(bet));`
  `canDecreaseBet = prevBet(bet) !== bet;`
  `increaseBet = () => { if (canIncreaseBet) setBet(nextBet(bet)); };`
  `decreaseBet = () => { if (canDecreaseBet) setBet(prevBet(bet)); };`
  (wrap in `useCallback` with the right deps; keep `spin`'s `bet` dependency).
- Action: two extra `<button>`s with `aria-label` "Decrease bet" / "Increase bet"
  (show "−"/"+" or "–"/"＋" as text), `disabled={!canBetDown}` / `{!canBetUp}`, ≥44px.
  Lay them out as a small stepper near Spin; keep Spin the prominent control.
- The bet value stays displayed in `Status` (already wired) — it updates reactively
  as `bet` changes. No need to move it.
- After building, the orchestrator does a preview check (tap + to 25/50, confirm the
  readout updates and + disables at 50 / when unaffordable).

---

## Build Completion

*Filled in at the end of the **build** cycle, before advancing to verify.*

- **Branch:** `feat/spec-014-bet-controls`
- **PR (if applicable):**
- **All acceptance criteria met?** yes
- **New decisions emitted:**
  - none
- **Deviations from spec:**
  - none
- **Follow-up work identified:**
  - none beyond the already-planned SPEC-015–018

### Build-phase reflection (3 questions, short answers)

1. **What was unclear in the spec that slowed you down?**
   — Nothing material. The spec's "Notes for the Implementer" section was precise enough that the hook logic was a direct transcription. The one thing I double-checked was whether `--radius-md` was a defined token (it is).

2. **Was there a constraint or decision that should have been listed but wasn't?**
   — No. `touch-targets-44`, `portrait-first`, DEC-001 and DEC-005 were all the relevant constraints; they were listed. The only minor gap is that there's no explicit note about `--radius-md` being available for the bet buttons, but the token exists in `tokens.css` so it wasn't a real blocker.

3. **If you did this task again, what would you do differently?**
   — Nothing significant. The spec was small and well-specified. I would still read all the engine source before touching the hook, which confirmed `nextBet`/`prevBet` clamp behaviour and saved any guessing about the no-op condition.

---

## Reflection (Ship)

*Appended during the **ship** cycle.*

1. **What would I do differently next time?**
   — <answer>

2. **Does any template, constraint, or decision need updating?**
   — <answer>

3. **Is there a follow-up spec I should write now before I forget?**
   — <answer>

---

## Verify

**Verdict: ✅ APPROVED**

Reviewed by: claude-sonnet-4-6 (sub-agent, cold session) on 2026-06-23.

### Gate
- [x] `just typecheck` — exit 0
- [x] `just lint` — exit 0
- [x] `just test` — exit 0 (92/92 tests passed; 8 in useSlotMachine.test.tsx, 4 in Action.test.tsx)
- [x] `just build` — exit 0

### Acceptance Criteria
- [x] `increaseBet()` steps 10→25→50 and clamps at 50; `decreaseBet()` steps 50→25→10 and clamps at 10 — implemented via engine `nextBet`/`prevBet`; verified by test assertions.
- [x] `canIncreaseBet = nextBet(bet)!==bet && canAfford(balance, nextBet(bet))`; `canDecreaseBet = prevBet(bet)!==bet`; both step fns are no-ops when their flag is false — exact formula used (useSlotMachine.ts lines 63–67); no-op guards in useCallback.
- [x] The chosen `bet` is what `spin()` uses — `spin` useCallback captures `bet` as a dependency; seed-12345+bet-25 → balance 975 assertion passes.
- [x] Action region renders accessible −/+ buttons (≥44px, `touch-targets-44`), disabled per flags; Status readout shows live bet — `aria-label="Decrease bet"` / `"Increase bet"` present; `.bet-btn` min-height/width 2.75rem (44px) in controls.css; all tokens-only (no raw hex).
- [x] UI imports engine only via `src/engine/index`; `git diff main..HEAD -- src/engine/` empty (engine unchanged); gate exits 0.

### Bet Logic
- [x] Steps 10→25→50, clamp at 50: `nextBet(50)===50` so `canIncreaseBet` becomes false and `increaseBet` is a no-op. Confirmed by test "increaseBet steps up and clamps at 50".
- [x] Steps 50→25→10, clamp at 10: `prevBet(10)===10` so `canDecreaseBet` becomes false. Confirmed by test "decreaseBet steps down and clamps at 10".
- [x] Affordability guard: `initialBalance: 20` → `canIncreaseBet === false` (can't afford 25); `increaseBet()` leaves `bet === 10`. Confirmed by test "cannot raise the bet beyond the affordable balance".
- [x] Spin uses chosen bet: seed 12345 + bet 25 → balance 975 (1000 − 25 + 0). Confirmed by test "spin uses the chosen bet".

### Wiring
- [x] App.tsx line 14 destructures all four fields and passes them as `onBetDown/onBetUp/canBetDown/canBetUp` to `<Action>`. Exact match to spec.
- [x] + button `disabled={!canBetUp}`, − button `disabled={!canBetDown}` — correct.
- [x] Accessible names "Decrease bet" / "Increase bet" via `aria-label`.

### Tests Not Vacuous
- [x] Missing clamp: the clamp tests assert bet stays at 50/10 after extra calls — would fail if `nextBet`/`prevBet` didn't clamp.
- [x] Missing affordability guard: `initialBalance: 20` test would fail if the `canAfford` check were absent from `canIncreaseBet`.
- [x] Wrong button disabled: Action.test.tsx "disables bet buttons per can-bet flags" passes `canBetUp={false}` / `canBetDown={false}` and asserts `toBeDisabled()` — directly caught by the test.
- [x] Spin ignoring chosen bet: the 975 fixture is genuine — a mismatched bet would produce 990 (default 10) instead.

### A11y / Constraints
- [x] `.bet-btn` min-height: 2.75rem (44px), min-width: 2.75rem (44px) — satisfies `touch-targets-44`.
- [x] Accessible names "Decrease bet" / "Increase bet" present.
- [x] controls.css uses only CSS custom properties (tokens); no raw hex, rgb, hsl values.
- [x] Existing Spin button unchanged and tested.

### DEC-001 Boundary
- [x] `git diff main..HEAD -- src/engine/` is empty — engine untouched.
- [x] UI imports only from `../engine/index` (verified by grep); no engine internals accessed.

### Decision Drift
- [x] `just decisions-audit --changed` — no changed files in governing scope. Pre-existing 14 scope-overlap warnings are repo-wide, predating this spec, and none cover the UI files changed here.
- [x] No non-trivial build choices requiring a new DEC-*. Builder confirmed none emitted — correct.

### Build Reflection
- [x] Three questions answered honestly and non-empty. Answers are specific (mentions `--radius-md` token check, spec precision). Not boilerplate.

### Cost Sessions
- [x] design: null-with-note (main-loop — correct per AGENTS §4).
- [x] build: null-with-note ("orchestrator to fill" — correct; sub-agent, real cost filled at ship).
- [x] verify: appended by this cycle (null-with-note, orchestrator to fill at ship).
- Note: build tokens_total will be filled by orchestrator from subagent_tokens at ship — not a blocker for approval.
