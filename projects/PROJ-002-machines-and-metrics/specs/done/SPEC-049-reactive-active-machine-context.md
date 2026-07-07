---
# Maps to ContextCore task.* semantic conventions.
# This variant assumes Claude plays every role. The context normally
# in a separate handoff doc lives in the ## Implementation Context
# section below.

task:
  id: SPEC-049
  type: story                      # epic | story | task | bug | chore
  cycle: ship  # frame | design | build | verify | ship
  blocked: false
  priority: medium
  complexity: M                    # S | M | L  (L means split it)

project:
  id: PROJ-002
  stage: STAGE-008
repo:
  id: animal-slots

agents:
  architect: claude-opus-4-8       # design/frame: Opus (judgement-heavy). See AGENTS §8.
  implementer: claude-sonnet-4-6   # build/verify: Sonnet (execution against the spec)
  created_at: 2026-07-06

references:
  decisions:
    - DEC-001   # engine-no-dom: the reactive seam is UI/machines layer; the engine never sees it
    - DEC-005   # no backend: persistence is localStorage only, best-effort, never throws
    - DEC-015   # config-driven machine model: the active machine becomes a reactive, persisted selection
  constraints:
    - engine-no-dom
  related_specs:
    - SPEC-042  # registry + getActiveMachine seam this makes reactive
    - SPEC-047  # parameterized engine reads — a switch now re-runs them
    - SPEC-048  # theme/audio slice — a switch now re-applies theme + audio
    - SPEC-050  # machine selector UI that will CALL setActiveMachineId (this ships the context it needs)

value_link: >-
  The keystone for STAGE-008's variety: lifts the active machine into a React Context backed by
  localStorage so a switch re-renders the reels, paytable, theme, and audio together and the choice
  survives a reload — the reactive seam SPEC-050's selector drives and the themed machines
  (SPEC-051/052/053) are chosen through. Without it a machine switch could not re-render.

cost:
  sessions:
    - cycle: design
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: null   # design cycle runs on the orchestrator's main Opus loop — not separately metered
      recorded_at: 2026-07-06
      note: >-
        Design authored on the main Opus orchestrator loop (un-metered). No numeric pins to measure —
        "no behavior change" is provable structurally: only ONE machine is registered, so the context
        always resolves to the default (empty/unknown localStorage → default), and the existing suite
        + an empty `git diff src/engine/` are the proof. Verified the consumers (useSlotMachine,
        PaytableSheet, Game) and their tests render without a provider, so a default context value
        keeps them green.
    - cycle: build
      interface: claude-code
      model: claude-sonnet-4-6
      tokens_total: 124405   # from Agent result subagent_tokens
      estimated_usd: 0.82    # 124405 tok × $6.6/M (Sonnet)
      duration_minutes: 13.8 # 826008 ms
      recorded_at: 2026-07-07
      note: >-
        Implemented the spec's drop-in code verbatim: src/machines/activeMachineStorage.ts (+ test,
        4 cases), src/ui/machine/MachineProvider.tsx (+ test, 4 cases), registry.ts's getActiveMachine
        repointed to getMachine(readActiveMachineId() ?? DEFAULT_MACHINE_ID) (+ 3 new registry.test.ts
        cases under a localStorage.clear() beforeEach/afterEach), useSlotMachine/PaytableSheet/Game
        swapped to useActiveMachine().machine, main.tsx wrapped in <MachineProvider>. Gate green:
        typecheck, lint, test (59 files / 351 tests, up from 56/338), build, validate, cost-audit all
        exit 0. `git diff main..HEAD -- src/engine/` confirmed EMPTY. Ran all three verify-cycle
        adversarial mutations from the spec's Notes: (a) skip writeActiveMachineId → broke the
        "persists and updates" test as predicted; (b) normalizeId returns id unconditionally → broke
        the "normalizes an unknown persisted id" test as predicted; (c) getActiveMachine ignores
        storage → did NOT break the "reflects the persisted id" registry test, because that test
        persists 'wild-and-whimsical', which IS today's DEFAULT_MACHINE_ID (only one machine is
        registered), so the mutation is unobservable through that specific assertion — independently
        confirmed via a throwaway spy test that getActiveMachine() does call readActiveMachineId()
        (wiring is correct); see Build Completion deviations for the honest writeup. All mutations
        reverted; final diff matches the spec's drop-ins exactly.
    - cycle: verify
      interface: claude-code
      model: claude-sonnet-4-6
      tokens_total: 95435    # from Agent result subagent_tokens
      estimated_usd: 0.63    # 95435 tok × $6.6/M (Sonnet)
      duration_minutes: 30   # active work est.; raw duration_ms (~500 min) is inflated by idle wait, not compute (cf. SPEC-045 verify)
      recorded_at: 2026-07-07
      note: >-
        Cold, independent re-verification on feat/spec-049-reactive-active-machine-context. Re-ran the
        full gate: typecheck, lint, test (59 files / 352 tests, up from 351 after the new structural
        test), build, validate, cost-audit — all exit 0. Confirmed spec conformance by reading every
        changed file (activeMachineStorage.ts, MachineProvider.tsx, registry.ts, useSlotMachine.ts,
        PaytableSheet.tsx, Game.tsx, main.tsx) against the Acceptance Criteria and Notes' drop-in code —
        byte-for-byte match. No .skip/.only/xit in touched tests. git diff main..HEAD -- src/engine/
        EMPTY; machine-parity.contract.test.ts untouched and green. Re-ran all three adversarial
        mutations from Notes: (a) and (b) failed their target tests as predicted, reverted clean. (c)
        (getActiveMachine ignores storage, returns the const default) confirmed the build agent's
        finding — no existing test failed, because the "reflects the persisted id" test's fixture id
        equals DEFAULT_MACHINE_ID in this single-machine registry. Closed this teeth gap permanently:
        added "getActiveMachine delegates to readActiveMachineId (structural spy)" to
        src/machines/registry.test.ts, using vi.spyOn on `import * as activeMachineStorage from
        './activeMachineStorage'` to assert getActiveMachine() calls readActiveMachineId(). The spyOn
        approach worked on the first attempt in this Vitest/Vite SSR-transform setup — no vi.mock
        fallback needed. New test passes on correct code, fails under mutation (c)
        ("expected readActiveMachineId to be called at least once"). Mutation (c) reverted; full gate
        re-run green after adding the test. Defect count: 0 (the (c) gap was a disclosed, expected
        coverage limitation, not an undisclosed defect — now closed with a permanent structural test).
    - cycle: ship
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      duration_minutes: 14
      recorded_at: 2026-07-07
      note: >-
        main-loop, not separately metered (AGENTS §4); ship cycle. Reconciled both sub-agents against
        git/disk (reviewed the full diff, re-ran the gate + engine guard, confirmed the new structural
        spy test gives mutation (c) teeth), filled build+verify cost from subagent_tokens (verify
        duration recorded as active-work estimate — raw duration_ms was idle-inflated), PR + CI-poll +
        squash-merge + backlog rollup + archive.
  totals:
    tokens_total: 219840   # build 124405 + verify 95435
    estimated_usd: 1.45    # build $0.82 + verify $0.63
    session_count: 4       # design, build, verify, ship
---

# SPEC-049: Reactive active-machine context

## Context

The active machine is resolved by `getActiveMachine()` in `src/machines/registry.ts`, which returns
a **module const** (`MACHINES[DEFAULT_MACHINE_ID]`). Three React consumers read it at render —
`useSlotMachine` (the engine-driving hook), `PaytableSheet`, and `Game` — but because it is a const,
a *switch* to another machine could never re-render them. STAGE-008's whole variety payoff (a
selector, per-machine theme/audio, four machines) is inert until the active machine is a **reactive,
persisted** value.

This spec is the keystone. It lifts the active machine into a **React Context** backed by
**localStorage** (namespaced key `zany:active-machine`, so STAGE-009's stats keys can't collide):
the three consumers subscribe to it, `getActiveMachine()` stops being a hard-wired const (it reads
the persisted id), the chosen machine survives a reload, and an unknown/absent id falls back to the
default. It ships the seam **without a selector** (SPEC-050) — with only one machine registered the
context always resolves to the default, so there is **no observable change today**; it is proven a
no-op by the existing suite staying green + an empty `git diff src/engine/`. DEC-001 holds (UI/
machines layer only); DEC-005 holds (localStorage, best-effort, no backend).

## Goal

Lift the active machine into a React Context backed by localStorage: a `MachineProvider` holds the
active machine id (initialized from and persisted to `zany:active-machine`, falling back to the
default for an absent/unknown id), exposes `{ machine, activeMachineId, setActiveMachineId }` via a
`useActiveMachine()` hook, and `useSlotMachine`/`PaytableSheet`/`Game` subscribe to it. `getActiveMachine()`
reads the persisted id instead of being a const. No observable change today (one machine registered).

## Inputs

- **Files to read:**
  - `src/machines/registry.ts` — `getActiveMachine`, `getMachine`, `MACHINES`, `DEFAULT_MACHINE_ID`.
  - `src/ui/storage.ts` / `src/ui/audio/muteStorage.ts` — the safe-localStorage helper pattern to mirror.
  - `src/ui/useSlotMachine.ts` — resolves `opts?.machine ?? getActiveMachine()` (line ~100).
  - `src/ui/PaytableSheet.tsx` — reads `getActiveMachine()` at render (line ~45).
  - `src/ui/regions/Game.tsx` — reads `getActiveMachine()` at render (line ~30).
  - `src/main.tsx` — the app entry (`<StrictMode><App/></StrictMode>`); wrap in the provider.
  - `src/machines/machine-parity.contract.test.ts` — uses `getActiveMachine()` (stays green: empty storage → default).
- **Related code paths:** `src/machines/`, `src/ui/`.

## Outputs

- **Files created:**
  - `src/machines/activeMachineStorage.ts` — `ACTIVE_MACHINE_KEY`, `readActiveMachineId`, `writeActiveMachineId` (safe localStorage, mirrors `storage.ts`).
  - `src/machines/activeMachineStorage.test.ts`.
  - `src/ui/machine/MachineProvider.tsx` — the Context, `MachineProvider`, and `useActiveMachine()`.
  - `src/ui/machine/MachineProvider.test.tsx`.
- **Files modified:**
  - `src/machines/registry.ts` — `getActiveMachine()` reads the persisted id.
  - `src/machines/registry.test.ts` — add persisted-id-reading assertions.
  - `src/ui/useSlotMachine.ts` — resolve the machine from `useActiveMachine()` (keep the `opts.machine` test override).
  - `src/ui/PaytableSheet.tsx` — read `useActiveMachine().machine`.
  - `src/ui/regions/Game.tsx` — read `useActiveMachine().machine`.
  - `src/main.tsx` — wrap `<App/>` in `<MachineProvider>`.
- **New exports:** `ACTIVE_MACHINE_KEY`, `readActiveMachineId`, `writeActiveMachineId` (activeMachineStorage.ts);
  `MachineProvider`, `useActiveMachine`, `ActiveMachineContextValue` (MachineProvider.tsx).
- **Database changes:** none (localStorage only; DEC-005).

## Acceptance Criteria

- [ ] `ACTIVE_MACHINE_KEY === 'zany:active-machine'`; `readActiveMachineId()` returns the stored id
      or `null` (absent / storage unavailable — never throws); `writeActiveMachineId(id)` persists it
      (best-effort, never throws).
- [ ] `MachineProvider` initializes the active id from `readActiveMachineId()`, normalizing an
      absent/unknown id to `DEFAULT_MACHINE_ID`; it exposes `{ machine, activeMachineId, setActiveMachineId }`.
- [ ] `useActiveMachine()` returns the default machine when rendered WITHOUT a provider (default
      context value) — so existing consumers/tests keep working (no-op).
- [ ] `setActiveMachineId(id)` updates the context (re-rendering subscribers) AND persists via
      `writeActiveMachineId`; an unknown id resolves `machine` to the default (via `getMachine`).
- [ ] The persisted choice survives a reload: a fresh `MachineProvider` mount reads the stored id.
- [ ] `getActiveMachine()` reads the persisted id (`getMachine(readActiveMachineId() ?? DEFAULT_MACHINE_ID)`)
      — no longer a module const; with empty storage it still returns the default.
- [ ] `useSlotMachine`, `PaytableSheet`, `Game` source the active machine from `useActiveMachine()`;
      `useSlotMachine` still honors `opts.machine` (tests) first.
- [ ] No observable change today: the full existing suite passes; `git diff main..HEAD -- src/engine/`
      is EMPTY (DEC-001). `just typecheck && just lint && just test && just build && just validate && just cost-audit` pass.

## Failing Tests

Written now, BEFORE build.

- **`src/machines/activeMachineStorage.test.ts`** (jsdom; `beforeEach(() => localStorage.clear())`):
  - `"ACTIVE_MACHINE_KEY is the namespaced key"` — `expect(ACTIVE_MACHINE_KEY).toBe('zany:active-machine')`.
  - `"read returns null when absent"` — `expect(readActiveMachineId()).toBeNull()`.
  - `"write then read round-trips the id"` — `writeActiveMachineId('wild-and-whimsical')`;
    `expect(readActiveMachineId()).toBe('wild-and-whimsical')`; and assert
    `localStorage.getItem('zany:active-machine') === 'wild-and-whimsical'`.
  - `"read/write never throw when storage is unavailable"` — temporarily stub `localStorage.getItem`/
    `setItem` to throw; assert `readActiveMachineId()` toBe `null` and `writeActiveMachineId('x')`
    does not throw; restore.

- **`src/machines/registry.test.ts`** (ADD; `beforeEach/afterEach(() => localStorage.clear())`):
  - `"getActiveMachine returns the default when nothing is persisted"` — `expect(getActiveMachine()).toBe(WILD_AND_WHIMSICAL)`.
  - `"getActiveMachine reflects the persisted id"` — `writeActiveMachineId('wild-and-whimsical')`;
    `expect(getActiveMachine().id).toBe('wild-and-whimsical')`.
  - `"getActiveMachine falls back to the default for an unknown persisted id"` —
    `writeActiveMachineId('nope')`; `expect(getActiveMachine()).toBe(WILD_AND_WHIMSICAL)`.

- **`src/ui/machine/MachineProvider.test.tsx`** (renderHook with a wrapper; `beforeEach(() => localStorage.clear())`):
  - `"useActiveMachine without a provider returns the default machine"` — render the hook with no
    wrapper; `expect(result.current.machine).toBe(WILD_AND_WHIMSICAL)` and
    `result.current.activeMachineId` toBe `DEFAULT_MACHINE_ID`.
  - `"provider initializes activeMachineId from localStorage"` — `writeActiveMachineId('wild-and-whimsical')`;
    render the hook wrapped in `<MachineProvider>`; `expect(result.current.activeMachineId).toBe('wild-and-whimsical')`.
  - `"provider normalizes an unknown persisted id to the default"` — `writeActiveMachineId('nope')`;
    wrapped render; `expect(result.current.activeMachineId).toBe(DEFAULT_MACHINE_ID)` and
    `result.current.machine` toBe `WILD_AND_WHIMSICAL`.
  - `"setActiveMachineId persists and updates the context"` — wrapped render;
    `act(() => result.current.setActiveMachineId('wild-and-whimsical'))`; assert
    `readActiveMachineId()` toBe `'wild-and-whimsical'` and `result.current.activeMachineId` toBe it
    (proves re-render + persistence — the "survives reload" guarantee).

## Implementation Context

### Decisions that apply

- `DEC-001` (engine-no-dom) — the context + storage live in `src/ui` / `src/machines`; the engine is
  untouched. `git diff main..HEAD -- src/engine/` must be EMPTY.
- `DEC-005` (no backend) — persistence is localStorage only, guarded (never throws), no network.
- `DEC-015` (config-driven machine model) — the active machine becomes a reactive, persisted
  selection; still pure data + registry lookup, no engine logic.

### Constraints that apply

- `engine-no-dom` — presentation/registry layer only.

### Prior related work

- `SPEC-042` (shipped) — introduced the registry + `getActiveMachine()` seam "STAGE-008's selector
  plugs into." This is that plug: it makes the seam reactive + persisted.
- `SPEC-047` / `SPEC-048` (shipped) — parameterized the engine reads and added the theme/audio slice;
  both read the active machine each render, so once the context makes a switch re-render, reels +
  paytable + theme + audio all update together (the SPEC-050 payoff).

### Out of scope (for this spec specifically)

- **The selector UI** — **SPEC-050**. This spec ships the context + `setActiveMachineId`; nothing in
  the app calls the setter yet.
- **The themed machines** — SPEC-051/052/053. Only the default is registered, so a "switch" resolves
  to the default today; the switch is exercised end-to-end once a second machine exists.
- **Resetting balance/bet on a machine switch** — the wallet persists across a switch for now; any
  switch-time reset semantics belong to SPEC-050's selector UX, not this seam.
- **Cross-tab sync** (a `storage` event listener) — not needed; a reload reads the persisted id.

## Notes for the Implementer

**Toolchain brief:** ESLint has NO react-hooks plugin (no exhaustive-deps disables). NO
`@testing-library/user-event` — use `renderHook`/`act` + a `wrapper`. JSX/`renderHook` test files are
`.tsx`; the storage test is plain `.ts`. `tsconfig` include is `["src"]`. No new dependency. No new DEC.
All localStorage access is guarded (try/catch → null / no-op), mirroring `src/ui/storage.ts`.

**`src/machines/activeMachineStorage.ts`** (mirror `storage.ts` exactly):

```ts
// activeMachineStorage.ts — safe localStorage for the active-machine selection (SPEC-049).
// Namespaced key (zany:*) so STAGE-009's stats keys can't collide. Never throws (DEC-005).

export const ACTIVE_MACHINE_KEY = 'zany:active-machine';

/** The persisted active-machine id, or null when absent / storage unavailable. Never throws. */
export function readActiveMachineId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_MACHINE_KEY);
  } catch {
    return null;
  }
}

/** Persist the active-machine id. Silently ignores quota / unavailable storage. Never throws. */
export function writeActiveMachineId(id: string): void {
  try {
    localStorage.setItem(ACTIVE_MACHINE_KEY, id);
  } catch {
    // ignore quota / unavailable
  }
}
```

**`src/machines/registry.ts`** — repoint `getActiveMachine()` (add the import; keep everything else):

```ts
import { readActiveMachineId } from './activeMachineStorage';
// ...
/** The active machine — resolves the persisted selection (SPEC-049), default when absent/unknown. */
export function getActiveMachine(): Machine {
  return getMachine(readActiveMachineId() ?? DEFAULT_MACHINE_ID);
}
```

(`getMachine` already falls back to the default for an unknown id, so an unknown persisted id is safe.)

**`src/ui/machine/MachineProvider.tsx`** — the Context (default value = default machine, so consumers
work with no provider):

```tsx
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { Machine } from '../../machines/types';
import { getMachine, MACHINES, DEFAULT_MACHINE_ID } from '../../machines/registry';
import { readActiveMachineId, writeActiveMachineId } from '../../machines/activeMachineStorage';

export interface ActiveMachineContextValue {
  machine: Machine;
  activeMachineId: string;
  setActiveMachineId: (id: string) => void;
}

/** Normalize a candidate id to a KNOWN machine id (unknown/absent → default). */
function normalizeId(id: string | null): string {
  return id && MACHINES[id] ? id : DEFAULT_MACHINE_ID;
}

const ActiveMachineContext = createContext<ActiveMachineContextValue>({
  machine: getMachine(DEFAULT_MACHINE_ID),
  activeMachineId: DEFAULT_MACHINE_ID,
  setActiveMachineId: () => {}, // no-op default — real behavior comes from the provider
});

export function MachineProvider({ children }: { children: ReactNode }) {
  const [activeMachineId, setId] = useState<string>(() => normalizeId(readActiveMachineId()));

  const setActiveMachineId = useCallback((id: string) => {
    const next = normalizeId(id);
    setId(next);
    writeActiveMachineId(next);
  }, []);

  const machine = getMachine(activeMachineId);
  const value = useMemo<ActiveMachineContextValue>(
    () => ({ machine, activeMachineId, setActiveMachineId }),
    [machine, activeMachineId, setActiveMachineId],
  );

  return <ActiveMachineContext.Provider value={value}>{children}</ActiveMachineContext.Provider>;
}

/** Subscribe to the active machine. Returns the default (no-op setter) when used without a provider. */
export function useActiveMachine(): ActiveMachineContextValue {
  return useContext(ActiveMachineContext);
}
```

(Note `setActiveMachineId` normalizes, so an unknown id snaps to the default id — satisfying "unknown
id falls back to the default" at the id level, not just the resolved machine.)

**`src/ui/useSlotMachine.ts`** — replace the `getActiveMachine()` import + call:

```ts
import { useActiveMachine } from './machine/MachineProvider';
// ...remove: import { getActiveMachine } from '../machines/registry';
// inside useSlotMachine, BEFORE the useState calls (hooks run unconditionally):
const activeMachine = useActiveMachine().machine;
const machine = opts?.machine ?? activeMachine;
```

**`src/ui/PaytableSheet.tsx`** and **`src/ui/regions/Game.tsx`** — replace
`const machine = getActiveMachine();` with `const machine = useActiveMachine().machine;` and swap the
import (`import { useActiveMachine } from '../machine/MachineProvider';` /
`'../../machine/MachineProvider'` — mind the relative depth: PaytableSheet is `src/ui/`, Game is
`src/ui/regions/`). Remove the now-unused `getActiveMachine` import from each.

**`src/main.tsx`** — wrap the app so the whole tree shares one provider:

```tsx
import { MachineProvider } from './ui/machine/MachineProvider';
// ...
createRoot(rootElement).render(
  <StrictMode>
    <MachineProvider>
      <App />
    </MachineProvider>
  </StrictMode>,
);
```

**Why no observable change:** only `WILD_AND_WHIMSICAL` is registered, so `normalizeId` and
`getMachine` always resolve to the default; localStorage starts empty → default. Every existing test
renders its consumer without a provider → the default context value → default machine. So the app is
byte-identical today; the reactivity only manifests once SPEC-050 adds a selector and SPEC-051+ add
machines.

**Verify-cycle adversarial checks (teeth):** (a) make `MachineProvider`'s `setActiveMachineId` skip
`writeActiveMachineId` → the "persists and updates" test must FAIL; revert. (b) make `normalizeId`
return `id` unconditionally (no unknown→default) → the "normalizes an unknown persisted id" test must
FAIL; revert. (c) make `getActiveMachine()` ignore storage and return the const default → the
"reflects the persisted id" registry test must FAIL; revert. Each mutation must break a test.

---

## Build Completion

*Filled in at the end of the **build** cycle, before advancing to verify.*

- **Branch:** `feat/spec-049-reactive-active-machine-context`
- **All acceptance criteria met?** yes
- **New decisions emitted:** none (reactive seam under DEC-015; DEC-005 unchanged).
- **Deviations from spec:** None in the shipped code — every file matches the Notes' drop-in code
  verbatim. One honest note on the verify-cycle adversarial checks: mutation (c) ("make
  `getActiveMachine()` ignore storage and return the const default") does NOT fail the "reflects the
  persisted id" registry test today, because that test's fixture value (`'wild-and-whimsical'`) is
  identical to `DEFAULT_MACHINE_ID` — with only one machine registered, persisting the default id and
  ignoring storage are indistinguishable through that specific assertion. This is the same
  "no-observable-change-today" property the spec calls out elsewhere (single-machine registry), so it
  isn't a functional bug — the wiring is real (independently confirmed with a throwaway spy asserting
  `getActiveMachine()` calls `readActiveMachineId()`) — but the test as specified has a coverage gap
  until a second machine exists (SPEC-051+). Flagging for verify rather than silently deviating from
  the spec's exact test text.
- **Follow-up work identified:** Once a second machine is registered (SPEC-051+), consider
  strengthening the "reflects the persisted id" registry test to persist an id that differs from
  `DEFAULT_MACHINE_ID` so mutation (c) is actually caught — not required for this spec since no second
  machine exists yet.

### Build-phase reflection (3 questions, short answers)

1. **What was unclear in the spec that slowed you down?** — Nothing was unclear; the Notes' drop-in
   code was complete and unambiguous for every file, including the relative-import depths for
   PaytableSheet vs. Game. The only friction was procedural: verifying the mutation-test predictions
   required actually running them, and one (mutation c) doesn't reproduce today given the
   single-machine registry — worth flagging explicitly rather than silently declaring all three "as
   predicted."
2. **Was there a constraint or decision that should have been listed but wasn't?** — No. DEC-001,
   DEC-005, and DEC-015 fully covered the seam; no additional constraint was needed.
3. **If you did this task again, what would you do differently?** — I'd suggest the design cycle add
   a second, distinct fixture id (even one not registered, used only to prove fallback) to the
   "reflects the persisted id" test's mutation coverage, so the adversarial check in Notes is fully
   provable pre-SPEC-051 rather than deferred to "once a second machine exists."

---

## Reflection (Ship)

*Appended during the **ship** cycle. Outcome-focused, distinct from the build reflection.*

1. **What would I do differently next time?**
   — Anticipate that a "no-op seam" spec has un-observable guards while only one machine is
     registered, and design the teeth accordingly UP FRONT. The design named three adversarial
     mutations, but (c) — "getActiveMachine ignores storage" — can't be distinguished by any
     return-value assertion when the only registered id equals the default. Both the build and
     verify agents caught it; verify closed it with a `vi.spyOn` structural test ("getActiveMachine
     delegates to readActiveMachineId"). Next time, for a single-registered-item reactive seam,
     write the structural/delegation test in the spec's Failing Tests from the start rather than
     discovering the gap in build/verify. This is the third instance of the adversarial-mutation
     lesson ([[adversarial-mutation-must-be-behavior-distinguishing]]) — now N=3.

2. **Does any template, constraint, or decision need updating?**
   — No new DEC (reactive seam under DEC-015; DEC-005 no-backend intact — localStorage only,
     guarded). No template/constraint change. Worth reinforcing in the signals set: when a spec's
     "prove it's wired" guard is unobservable via behavior under current data (single machine),
     specify a delegation/spy test as the teeth, not a return-value assertion.

3. **Is there a follow-up spec I should write now before I forget?**
   — No new spec. The reactive seam is live but un-exercised until there's something to switch to:
     **SPEC-050** (the selector UI) calls `setActiveMachineId` — it should preview-verify that a
     switch re-renders reels + paytable + theme + audio together and persists across reload;
     **SPEC-051/052/053** register the second/third/fourth machines that finally give a switch an
     observable destination (and retroactively give mutation (c) behavioral teeth, not just
     structural). One note for SPEC-050: it will need a list of registered machines to render
     options — `MACHINES` (from the registry) + the context's `activeMachineId`/`setActiveMachineId`
     are the exact surface it consumes.
