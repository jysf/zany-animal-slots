---
# Maps to ContextCore task.* semantic conventions.
# This variant assumes Claude plays every role. The context normally
# in a separate handoff doc lives in the ## Implementation Context
# section below.

task:
  id: SPEC-059
  type: story                      # epic | story | task | bug | chore
  cycle: build  # frame | design | build | verify | ship
  blocked: false
  priority: medium
  complexity: S                    # S | M | L  (L means split it)

project:
  id: PROJ-002
  stage: STAGE-010
repo:
  id: animal-slots

agents:
  architect: claude-opus-4-8       # design/frame: Opus (judgement-heavy). See AGENTS §8.
  implementer: claude-sonnet-4-6   # build/verify: Sonnet (execution against the spec)
  created_at: 2026-07-09

references:
  decisions:
    - DEC-001   # engine-no-dom: pure presentation seam; the engine is untouched
    - DEC-005   # no backend: the seen flag is localStorage only, best-effort, never throws
    - DEC-022   # the first-run help onboarding model this spec authors + implements (seen flag, degrade, one-sheet-two-entry)
  constraints:
    - engine-no-dom
  related_specs:
    - SPEC-054  # the versioned safe-storage blob pattern (statsStorage.ts) this mirrors
    - SPEC-055  # the no-op-default reactive Context (StatsProvider) this seam mirrors
    - SPEC-049  # the zany:* namespace + activeMachineStorage.ts safe-storage idiom
    - SPEC-060  # the HelpSheet UI + header trigger + first-run auto-open that CONSUMES this seam (next spec)

value_link: >-
  The infrastructure keystone for STAGE-010's "legible on first contact": a safe, versioned
  first-run-seen flag (zany:help-seen) plus a no-op-default reactive Context (useHelpSeen), over
  which SPEC-060's HelpSheet (header trigger + auto-open-once) builds. No UI, no content, no engine
  change — but the whole stage is a thin layer over this seam.

# Self-reported AI cost per cycle. Each cycle (design, build, verify,
# ship) appends one entry to sessions[]. Totals are computed at ship.
cost:
  sessions:
    - cycle: design
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: null   # design cycle runs on the orchestrator's main Opus loop — not separately metered
      recorded_at: 2026-07-09
      note: >-
        Design authored on the main Opus loop (un-metered). PURE seam spec — no RTP/strip simulation
        to pin; "measure-then-pin" reduces to the deterministic storage contract, so the Failing Tests
        carry concrete pinned values from the DEC-022 semantics (absent ⇒ false; round-trip true ⇒ true;
        corrupt/wrong-version/non-boolean ⇒ false; provider hydrates from the flag; markSeen flips +
        persists). Authored DEC-022 (the onboarding model) as part of this design. Build is transcription
        of the two drop-in modules in ## Notes. Two adversarial guard-mutations specified for verify.
    - cycle: build
      interface: claude-code
      model: claude-sonnet-4-6
      tokens_total: 93769    # from the build sub-agent's subagent_tokens
      estimated_usd: 0.62    # 93769 tok × $6.6/M (Sonnet)
      duration_minutes: 6.4  # 386954 ms
      recorded_at: 2026-07-09
      note: >-
        Build delegated to a fresh Sonnet sub-agent (local-only, branch feat/spec-059-first-run-seen-seam).
        Transcribed both drop-in modules (helpSeenStorage.ts, HelpSeenProvider.tsx) and their two test
        files verbatim from the spec's Notes, plus the one-line main.tsx wiring; all 12 new tests pass;
        full gate (typecheck/lint/test 420/build/validate/cost-audit) green; engine diff empty; only
        src/ui/help/** + the one main.tsx line touched. No deviations, no new dep, no new DEC.
    - cycle: verify
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: 90000    # nominal — see note
      estimated_usd: 0.59    # nominal, 90000 tok × $6.6/M
      recorded_at: 2026-07-09
      note: >-
        Cold re-verification on the main Opus loop (single-agent, not separately metered — nominal
        90000-tok estimate per the run's cost convention). Reconciled the build against git/disk: read
        both source modules (byte-for-byte the spec drop-ins) + the main.tsx wiring; only src/ui/help/**
        + main.tsx + spec bookkeeping changed. Re-ran the FULL gate green (typecheck/lint/test 420/build/
        validate/cost-audit). Ran both adversarial guard-mutations — each broke EXACTLY its target test
        and reverted clean (12/12 help tests green after): (1) dropping the version clause in isValid
        broke "version mismatch"; (2) flipping the no-op default seen true→false broke "without a provider
        returns seen:true". Guards have teeth. git diff main..HEAD -- src/engine/ empty; no .only/.skip in
        src/ui/help/. Defect count: 0.
    - cycle: ship
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: null
      estimated_usd: null
      recorded_at: 2026-07-09
      note: >-
        main-loop, not separately metered (AGENTS §4); ship cycle. Reconciled build + cold-verify
        against git/disk, filled build cost from the sub-agent's subagent_tokens (93769) and verify as
        a nominal main-loop estimate, PR + CI-poll + squash-merge + backlog rollup + archive.
  totals:
    tokens_total: 183769   # build 93769 + verify 90000 (nominal)
    estimated_usd: 1.21    # build 0.62 + verify 0.59 (nominal)
    session_count: 4       # design, build, verify, ship
---

# SPEC-059: First-run-seen storage and seam

## Context

STAGE-010 makes the game **legible to a first-timer**: a new player is shown a short
how-to-play explainer **once** (auto-opened on first visit, remembered so it never nags),
re-openable anytime from a **"How to play"** header trigger. The observed PROJ-001 tester
failure — "couldn't understand it" — is the brief's top-line comprehension criterion.

This is the stage's **infrastructure keystone**, first in the backlog (safe storage seam →
sheet UI, the same infra-before-UI order as SPEC-054→056). It ships a **safe, versioned
first-run-seen flag** — `src/ui/help/helpSeenStorage.ts` (mirroring `src/stats/statsStorage.ts`
under the `zany:help-seen` key) — and a **no-op-default reactive Context** —
`src/ui/help/HelpSeenProvider.tsx` exposing `useHelpSeen()` (mirroring SPEC-055's
`StatsProvider`) — plus wiring the provider into `main.tsx`. **No UI, no help content, no
trigger** — that is SPEC-060 (the HelpSheet + header trigger + first-run auto-open).

It authors and implements **DEC-022**, which pins the model's cross-cutting semantics: first
run = the **absence of a truthy `zany:help-seen` flag**; the flag is a **single versioned JSON
blob** (`{ version, seen }`) that **degrades to "not seen"** (false) when absent/corrupt/stale;
the provider's **no-op default is `seen: true`** so provider-less consumers (App.test) never
auto-open. DEC-001 holds (pure presentation — the engine is untouched); DEC-005 holds
(`localStorage` only, best-effort, never throws).

## Goal

Ship a safe `src/ui/help/helpSeenStorage.ts` (the `HELP_SEEN_KEY`, `HELP_SEEN_VERSION`,
`readHelpSeen`, `writeHelpSeen` — versioned single blob, never throws) and a reactive
`src/ui/help/HelpSeenProvider.tsx` (`HelpSeenProvider`, `useHelpSeen` with a no-op default),
wired into `main.tsx`, each fully unit-tested. No help content, no sheet, no trigger, no
display surface.

## Inputs

- **Files to read:**
  - `src/stats/statsStorage.ts` — the versioned safe-storage blob pattern to mirror (guarded
    try/catch, never throws, `isValid` narrowing, `zany:*` key, degrade-to-default).
  - `src/ui/stats/StatsProvider.tsx` — the no-op-default reactive Context to mirror
    (`useState(() => read…())` hydration, persist-on-change effect, `useCallback`/`useMemo`).
  - `src/machines/activeMachineStorage.ts` — the original `zany:*` safe-storage idiom.
  - `src/main.tsx` — where `MachineProvider`/`StatsProvider` are composed; the new provider nests here.
  - `src/ui/stats/StatsProvider.test.tsx` — the `renderHook`/`act`/`wrapper` test idiom to mirror.
  - `decisions/DEC-022-first-run-help-onboarding.md` — the semantics this spec implements.
- **Related code paths:** `src/ui/help/` (new), `src/main.tsx` (modified — one provider added).

## Outputs

- **Files created:**
  - `src/ui/help/helpSeenStorage.ts` — safe versioned `localStorage` for the seen flag.
  - `src/ui/help/helpSeenStorage.test.ts` — persistence unit tests (round-trip, absent, corrupt,
    version, non-boolean, never-throw).
  - `src/ui/help/HelpSeenProvider.tsx` — reactive Context + `useHelpSeen` (no-op default).
  - `src/ui/help/HelpSeenProvider.test.tsx` — provider hydrate + `markSeen` persist + no-provider default.
- **Files modified:**
  - `src/main.tsx` — nest `<HelpSeenProvider>` inside `<StatsProvider>` (inert until SPEC-060 consumes it).
- **New exports:**
  - `helpSeenStorage.ts`: `HELP_SEEN_KEY`, `HELP_SEEN_VERSION`, `readHelpSeen()`, `writeHelpSeen(seen)`.
  - `HelpSeenProvider.tsx`: `HelpSeenProvider`, `useHelpSeen()`, `HelpSeenContextValue`.
- **Database changes:** none (localStorage only; DEC-005).

## Acceptance Criteria

Testable outcomes. Cover happy path, error cases, edge cases.

- [ ] `HELP_SEEN_KEY === 'zany:help-seen'` and `HELP_SEEN_VERSION === 1`.
- [ ] `readHelpSeen()` returns `false` when the key is absent, unparseable, `version`-mismatched,
      or has a missing/`non-boolean` `seen` — and **never throws**.
- [ ] `writeHelpSeen(true)` then `readHelpSeen()` returns `true`; `writeHelpSeen(false)` then
      `readHelpSeen()` returns `false` (round-trips a versioned blob under the key).
- [ ] `writeHelpSeen` never throws when `localStorage.setItem` throws (quota / unavailable).
- [ ] `useHelpSeen()` **without a provider** returns `{ seen: true, markSeen: <no-op> }` — calling
      `markSeen()` is a safe no-op and does not throw (keeps App.test green: no auto-open).
- [ ] With a `HelpSeenProvider`, `useHelpSeen()` **hydrates** `seen` from `readHelpSeen()`
      (seeded `writeHelpSeen(true)` ⇒ `seen === true`; clean storage ⇒ `seen === false`).
- [ ] With a provider, calling `markSeen()` flips `seen` to `true` **and persists**
      (`readHelpSeen()` is then `true`); `markSeen()` is idempotent.

## Failing Tests

Written during **design**, BEFORE build. The implementer's job in **build** is to make these pass.
Pinned values are the deterministic storage contract from DEC-022 (no simulation needed).

- **`src/ui/help/helpSeenStorage.test.ts`** *(with `localStorage.clear()` in `beforeEach`)*
  - `"HELP_SEEN_KEY is the namespaced key and version is 1"` — asserts
    `HELP_SEEN_KEY === 'zany:help-seen'` and `HELP_SEEN_VERSION === 1`.
  - `"readHelpSeen returns false when absent"` — clean storage ⇒ `readHelpSeen() === false`.
  - `"writeHelpSeen(true) round-trips to true"` — `writeHelpSeen(true)`; `readHelpSeen() === true`;
    and assert the stored raw blob deep-equals `{ version: 1, seen: true }`
    (`JSON.parse(localStorage.getItem(HELP_SEEN_KEY)!)`).
  - `"writeHelpSeen(false) round-trips to false"` — `writeHelpSeen(false)`; `readHelpSeen() === false`.
  - `"readHelpSeen returns false on an unparseable blob (never throws)"` —
    `localStorage.setItem(HELP_SEEN_KEY, 'not json{')`; `readHelpSeen() === false`.
  - `"readHelpSeen returns false on a version mismatch"` —
    `localStorage.setItem(HELP_SEEN_KEY, JSON.stringify({ version: 999, seen: true }))`;
    `readHelpSeen() === false`.
  - `"readHelpSeen returns false on a non-boolean seen"` —
    `localStorage.setItem(HELP_SEEN_KEY, JSON.stringify({ version: 1, seen: 'yes' }))`;
    `readHelpSeen() === false`.
  - `"writeHelpSeen never throws when setItem throws"` — `vi.spyOn(Storage.prototype, 'setItem')
    .mockImplementation(() => { throw new Error('quota'); })`;
    `expect(() => writeHelpSeen(true)).not.toThrow()`; restore the spy.

- **`src/ui/help/HelpSeenProvider.test.tsx`** *(`renderHook` + `act`; `localStorage.clear()` in `beforeEach`)*
  - `"useHelpSeen without a provider returns seen:true and a no-op markSeen"` —
    `renderHook(() => useHelpSeen())`; `result.current.seen === true`; `act(() => result.current.markSeen())`
    does not throw and leaves `result.current.seen === true`; `readHelpSeen()` is still `false`
    (no provider ⇒ nothing persisted).
  - `"provider hydrates seen:false from clean storage"` — clean storage;
    `renderHook(() => useHelpSeen(), { wrapper: HelpSeenProvider })`; `result.current.seen === false`.
  - `"provider hydrates seen:true from a seeded flag"` — `writeHelpSeen(true)`;
    `renderHook(() => useHelpSeen(), { wrapper: HelpSeenProvider })`; `result.current.seen === true`.
  - `"markSeen flips seen to true and persists"` — clean storage, wrapped;
    `expect(result.current.seen).toBe(false)`; `act(() => result.current.markSeen())`;
    `expect(result.current.seen).toBe(true)`; `expect(readHelpSeen()).toBe(true)`; a second
    `act(() => result.current.markSeen())` keeps `seen === true` (idempotent).

## Implementation Context

*Read this section (and the files it points to) before starting the build cycle.*

### Decisions that apply

- `DEC-022` — the first-run help onboarding model: this spec IMPLEMENTS its storage/seam half
  (seen = absence of a truthy `zany:help-seen` blob; versioned blob; degrade-to-false;
  provider no-op default `seen: true`). The UI half (auto-open-once, header trigger) is SPEC-060.
- `DEC-001` — engine-no-dom: the seam lives in `src/ui/help/`; `git diff main..HEAD -- src/engine/`
  MUST be empty.
- `DEC-005` — no backend: persistence is `localStorage` only, best-effort, never throws.

### Constraints that apply

- `engine-no-dom` — `src/ui/help/` is a new leaf UI module; it imports nothing from `src/engine`
  (it needs no engine types) and the engine gains no import of it.

### Prior related work

- `SPEC-054` (shipped) — `src/stats/statsStorage.ts`: the versioned-blob safe-storage pattern
  (`isValid` narrowing, absent/corrupt/stale ⇒ default, guarded, never throws) this mirrors.
- `SPEC-055` (shipped) — `src/ui/stats/StatsProvider.tsx`: the no-op-default reactive Context
  (`useState(() => read…())` hydration + persist-on-change effect + `useCallback`/`useMemo`) this
  mirrors; and its `main.tsx` wiring pattern.
- `SPEC-049` (shipped) — `src/machines/activeMachineStorage.ts` + the `zany:*` namespace.

### Out of scope (for this spec specifically)

- Any help content, copy, or sheet — SPEC-060.
- The "How to play" header trigger and the first-run **auto-open** behavior — SPEC-060 (it reads
  this seam's `seen` + calls `markSeen()` on dismiss).
- Any CSS (no visual surface ships here).
- Reporting whether onboarding was seen anywhere (that would be STAGE-011 analytics, opt-in).

## Notes for the Implementer

This is transcription of the two drop-in modules below, the two test files from ## Failing Tests,
and a one-line `main.tsx` edit. Keep `src/ui/help/` a leaf module; no engine import. The storage
test is `.test.ts` (no JSX); the provider test is `.test.tsx` (renderHook). Mirror
`StatsProvider.test.tsx` for the renderHook/act/wrapper idiom (no `@testing-library/user-event`).

**Adversarial guard-mutations to run in verify** (each should break the named test; revert after):
1. In `helpSeenStorage.ts`, remove the `b.version === HELP_SEEN_VERSION &&` clause in `isValid`
   → breaks the "version mismatch" test (a `version: 999` blob would read as `seen`).
2. In `HelpSeenProvider.tsx`, change the no-op default context `seen` from `true` to `false`
   → breaks the "without a provider returns seen:true" test (and would auto-open in App.test).

### `src/ui/help/helpSeenStorage.ts` (drop-in)

```ts
// helpSeenStorage.ts — safe versioned localStorage for the "help seen" first-run flag (SPEC-059, DEC-022).
// Mirrors src/stats/statsStorage.ts: namespaced zany:* key, single versioned JSON blob, guarded,
// never throws (DEC-005). Absent / corrupt / wrong-version ⇒ "not seen" (false) so the explainer shows.

export const HELP_SEEN_KEY = 'zany:help-seen';

/** Bumped only on a breaking change to the persisted blob shape. */
export const HELP_SEEN_VERSION = 1;

interface HelpSeenBlob {
  version: number;
  seen: boolean;
}

/** Narrow an unknown parse result to a well-formed, current-version blob. */
function isValid(v: unknown): v is HelpSeenBlob {
  if (typeof v !== 'object' || v === null) return false;
  const b = v as Record<string, unknown>;
  return b.version === HELP_SEEN_VERSION && typeof b.seen === 'boolean';
}

/**
 * Whether the how-to-play explainer has been seen. Returns false when absent / corrupt /
 * wrong-version so a first-timer (or a broken store) is shown the explainer. Never throws.
 */
export function readHelpSeen(): boolean {
  try {
    const raw = localStorage.getItem(HELP_SEEN_KEY);
    if (raw === null) return false;
    const parsed: unknown = JSON.parse(raw);
    return isValid(parsed) ? parsed.seen : false;
  } catch {
    return false;
  }
}

/** Persist the seen flag as a versioned blob. Silently ignores quota / unavailable storage. Never throws. */
export function writeHelpSeen(seen: boolean): void {
  try {
    localStorage.setItem(HELP_SEEN_KEY, JSON.stringify({ version: HELP_SEEN_VERSION, seen }));
  } catch {
    // ignore quota / unavailable
  }
}
```

### `src/ui/help/HelpSeenProvider.tsx` (drop-in)

```tsx
// HelpSeenProvider — reactive, persisted "help seen" first-run context (SPEC-059, DEC-022).
// Lifts the helpSeenStorage flag into a React Context backed by localStorage, mirroring SPEC-055's
// StatsProvider: a no-op default (seen: true) so provider-less consumers (App.test) never auto-open,
// useState(() => readHelpSeen()) hydration, and persist-on-change. Client-only; never throws (DEC-005).
// No display surface — the HelpSheet that consumes this seam is SPEC-060.
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { readHelpSeen, writeHelpSeen } from './helpSeenStorage';

export interface HelpSeenContextValue {
  seen: boolean;
  markSeen: () => void;
}

// No-op default: provider-less consumers behave as "already seen" so nothing auto-opens
// (keeps App.test green without wrapping it — the rail StatsProvider/MachineProvider follow).
const HelpSeenContext = createContext<HelpSeenContextValue>({
  seen: true,
  markSeen: () => {},
});

export function HelpSeenProvider({ children }: { children: ReactNode }) {
  const [seen, setSeen] = useState<boolean>(() => readHelpSeen());

  // Persist on change (guarded, never throws — DEC-005). The mount write is a harmless
  // round-trip of the just-read value (mirrors StatsProvider's persist-on-change effect).
  useEffect(() => {
    writeHelpSeen(seen);
  }, [seen]);

  const markSeen = useCallback(() => setSeen(true), []);

  const value = useMemo<HelpSeenContextValue>(() => ({ seen, markSeen }), [seen, markSeen]);

  return <HelpSeenContext.Provider value={value}>{children}</HelpSeenContext.Provider>;
}

/** Subscribe to the first-run "help seen" flag. Returns seen=true + a no-op markSeen without a provider. */
export function useHelpSeen(): HelpSeenContextValue {
  return useContext(HelpSeenContext);
}
```

### `src/main.tsx` (edit — nest the provider)

Add the import and nest `<HelpSeenProvider>` inside `<StatsProvider>`, wrapping `<App />`:

```tsx
import { HelpSeenProvider } from './ui/help/HelpSeenProvider';
// ...
createRoot(rootElement).render(
  <StrictMode>
    <MachineProvider>
      <StatsProvider>
        <HelpSeenProvider>
          <App />
        </HelpSeenProvider>
      </StatsProvider>
    </MachineProvider>
  </StrictMode>,
);
```

---

## Build Completion

*Filled in at the end of the **build** cycle, before advancing to verify.*

- **Branch:** `feat/spec-059-first-run-seen-seam`
- **PR (if applicable):** none until ship
- **All acceptance criteria met?** yes — all 7 acceptance criteria satisfied; all 12 Failing Tests
  (8 in `helpSeenStorage.test.ts` + 4 in `HelpSeenProvider.test.tsx`) pass; full gate
  (typecheck/lint/test/build/validate/cost-audit) green; `git diff main..HEAD -- src/engine/` is empty.
- **New decisions emitted:**
  - `DEC-022` — the first-run help onboarding model (authored at design; no NEW dec emitted at build)
- **Deviations from spec:**
  - none — both drop-in modules and the `main.tsx` edit transcribed verbatim from the Notes.
- **Follow-up work identified:**
  - SPEC-060 (HelpSheet UI + header trigger + auto-open) already framed — the natural next step.

### Build-phase reflection (3 questions, short answers)

1. **What was unclear in the spec that slowed you down?** — Nothing; the Notes section's drop-in
   code and Failing Tests were complete and unambiguous, so this cycle was pure transcription.
2. **Was there a constraint or decision that should have been listed but wasn't?** — No; DEC-001,
   DEC-005, DEC-022 fully covered the boundaries this spec touches.
3. **If you did this task again, what would you do differently?** — Nothing; the mirror-an-existing-
   pattern approach (statsStorage.ts / StatsProvider.tsx) made this a fast, low-risk build.

---

## Reflection (Ship)

*Appended during the **ship** cycle. Outcome-focused reflection, distinct
from the process-focused build reflection above.*

1. **What would I do differently next time?** —
   Nothing structural. The seam-mirrors-a-proven-pattern approach (helpSeenStorage ← statsStorage;
   HelpSeenProvider ← StatsProvider) meant the drop-ins pasted in cleanly and the build had zero
   deviations. The one judgement call worth remembering: the no-op default `seen: true` (not `false`)
   is what keeps App.test green without wrapping it — the inert default must mean "don't auto-open",
   which is the opposite of the storage default (`false` = "not seen"). Getting those two defaults
   pointing opposite directions right the first time is the whole spec.

2. **Does any template, constraint, or decision need updating?** —
   No. DEC-022 held cleanly through build + verify (no new decisions needed). DEC-001 (empty engine
   diff) and DEC-005 (guarded, never-throw storage) both stayed clean. The pattern is now proven a
   third time (machine → stats → help), which is itself the signal: the Context-over-safe-storage seam
   is the repo's standard shape for any small persisted client flag — worth a one-line AGENTS note but
   not a template change.

3. **Is there a follow-up spec I should write now before I forget?** —
   No new spec — SPEC-060 (the HelpSheet UI + "How to play" header trigger + first-run auto-open) is
   already framed and is the natural next step, consuming this seam's `seen` + `markSeen()` exactly as
   designed. It is the last spec in STAGE-010's backlog.
