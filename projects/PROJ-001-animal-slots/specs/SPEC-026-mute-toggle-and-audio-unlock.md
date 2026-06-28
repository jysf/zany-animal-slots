---
# Maps to ContextCore task.* semantic conventions.

task:
  id: SPEC-026
  type: story
  cycle: verify
  blocked: false
  priority: high
  complexity: S

project:
  id: PROJ-001
  stage: STAGE-004
repo:
  id: animal-slots

agents:
  architect: claude-opus-4-8
  implementer: claude-sonnet-4-6
  created_at: 2026-06-27

references:
  decisions:
    - DEC-007
    - DEC-001
    - DEC-010
  constraints:
    - audio-gesture-and-mute
    - touch-targets-44
    - test-before-implementation
    - one-spec-per-pr
  related_specs:
    - SPEC-015
    - SPEC-020
    - SPEC-027

value_link: "Audio FOUNDATION (no sound yet): a persisted global mute toggle + first-gesture unlock, satisfying the audio-gesture-and-mute constraint so SPEC-027's win jingle can ship gated and autoplay-compliant."

cost:
  sessions:
    - cycle: design
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      duration_minutes: 25
      recorded_at: 2026-06-27
      notes: "main-loop, not separately metered (AGENTS §4); design cycle"
    - cycle: build
      agent: claude-sonnet-4-6
      interface: claude-code
      tokens_total: 75223
      estimated_usd: 0.50
      duration_minutes: 4.4
      recorded_at: 2026-06-27
      notes: "Sonnet sub-agent build (Agent subagent_tokens=75223, 262s). estimated_usd ~= tokens x $6.6/M Sonnet blended, no cache discount (order-of-magnitude, AGENTS §4)."
    - cycle: verify
      agent: claude-sonnet-4-6
      interface: claude-code
      tokens_total: 71858
      estimated_usd: 0.47
      duration_minutes: 4.3
      recorded_at: 2026-06-27
      notes: "Sonnet sub-agent verify (Agent subagent_tokens=71858, 257s). estimated_usd ~= tokens x $6.6/M Sonnet blended, no cache discount (order-of-magnitude, AGENTS §4)."
    - cycle: ship
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      duration_minutes: 8
      recorded_at: 2026-06-27
      notes: "main-loop, not separately metered (AGENTS §4); ship cycle (orchestrator squash-merge + bookkeeping; incl. preview mute-toggle check)"
  totals:
    tokens_total: 147081
    estimated_usd: 0.97
    session_count: 5
---

# SPEC-026: Mute toggle and audio unlock

## Context

The **audio foundation** — and the prerequisite for SPEC-027's win jingle.
DEC-007 says all audio must be gated behind a **first user gesture** (browser
autoplay policy) and an **always-available, persisted global mute** (constraint
`audio-gesture-and-mute`, paths `src/ui/audio/**`). This spec builds exactly that
plumbing **with no sound yet**: a `useAudio` hook exposing `muted` (persisted to
`localStorage` key `mute`) + `toggleMute` + an `unlocked` flag that flips on the
first pointer/key gesture, and a `MuteToggle` button in the header. SPEC-027 will
consume `muted` + `unlocked` to gate the actual Tone.js jingle.

Pure UI concern (DEC-001 — no engine involvement). The mute persistence mirrors
the balance `storage.ts` pattern (SPEC-015); the header button mirrors the
paytable trigger's touch-target/token styling (SPEC-020). No Tone.js dependency
is added here — that arrives with the jingle in SPEC-027.

See `STAGE-004-win-celebration-and-juice.md`, `DEC-007` (synthesized audio,
gesture + mute gating), `DEC-001`, `DEC-010`, and the localStorage `mute` key
noted in the stage's KEY FACTS.

## Goal

Add `src/ui/audio/`: a `muteStorage` (read/write the `mute` key, default
unmuted), a `useAudio` hook (`{ muted, toggleMute, unlocked }` — `muted` persisted,
`unlocked` flips true on the first user gesture), and a `MuteToggle` button
(🔊/🔇, `aria-pressed`, ≥44px), wired into the header via `App`. No audio is
produced — this is the gated foundation SPEC-027 builds on.

## Inputs

- **Files to read:** `src/ui/storage.ts` (+ `storage.test.ts`) — the localStorage
  helper pattern to mirror; `src/ui/regions/Header.tsx`; `src/ui/App.tsx`;
  `src/ui/PaytableSheet.tsx` + `src/ui/paytable.css` (the header trigger button +
  touch-target pattern); `src/styles/tokens.css`; `guidance/constraints.yaml`
  (`audio-gesture-and-mute`, `touch-targets-44`).
- **Related code paths:** `src/ui/audio/`, `src/ui/regions/`.

## Outputs

- **Files created:**
  - `src/ui/audio/muteStorage.ts` (+ `muteStorage.test.ts`) — `MUTE_KEY = 'mute'`,
    `readMute()` (default `false`), `writeMute(boolean)` — never throws.
  - `src/ui/audio/useAudio.ts` (+ `useAudio.test.ts`) — `{ muted, toggleMute,
    unlocked }`.
  - `src/ui/audio/MuteToggle.tsx` (+ `MuteToggle.test.tsx`) — the toggle button.
  - `src/ui/audio/audio.css` — `.mute-toggle` button styling (≥44px touch target,
    token-only, no raw hex).
- **Files modified:**
  - `src/ui/regions/Header.tsx` — accept `muted` + `onToggleMute`, render
    `<MuteToggle>` alongside the paytable trigger.
  - `src/ui/App.tsx` — call `useAudio()`, thread `muted` + `toggleMute` into Header.
- **New exports:** `MUTE_KEY`, `readMute`, `writeMute`; `useAudio`; `MuteToggle`.
- **Database changes:** none (localStorage key `mute`).

## Acceptance Criteria

- [ ] `readMute()` returns `false` when the key is absent or storage is
      unavailable (never throws); returns `true` only for a stored `'true'`.
      `writeMute(b)` persists `'true'`/`'false'` and never throws.
- [ ] `useAudio()` starts `muted = false` by default, rehydrates `muted` from
      `localStorage` (`mute === 'true'` → `true`), and `toggleMute()` flips `muted`
      AND persists it.
- [ ] `useAudio()` starts `unlocked = false` and flips it to `true` on the first
      user gesture (a `pointerdown` or `keydown` on `document`); subsequent
      gestures keep it `true` (listener fires once, then is removed).
- [ ] `MuteToggle` renders a `<button>` with `aria-pressed` reflecting `muted`,
      shows 🔇 when muted / 🔊 when not, has an accessible name, and calls
      `onToggle` when clicked.
- [ ] The mute button hit area is ≥44px (`audio.css` min-height/width via
      `--space-7`/≥44px); `audio.css` has no raw hex.
- [ ] No Tone.js / audio dependency added; no sound is produced. Engine unchanged;
      existing Header/App tests still pass; gate exits 0.

## Failing Tests

Written during **design**, BEFORE build. `localStorage.clear()` in `beforeEach`.

- **`src/ui/audio/muteStorage.test.ts`**
  - `"defaults to false when absent"` — `readMute() === false`.
  - `"round-trips true"` — `writeMute(true)`; `readMute() === true`; localStorage
    `mute === 'true'`.
  - `"round-trips false"` — `writeMute(false)`; `readMute() === false`.
  - `"treats any non-'true' value as false"` — `localStorage.setItem('mute','x')`
    → `readMute() === false`.

- **`src/ui/audio/useAudio.test.ts`** (renderHook)
  - `"starts unmuted by default"` — `result.current.muted === false`.
  - `"rehydrates muted from storage"` — pre-set `mute='true'` → `muted === true`.
  - `"toggleMute flips and persists"` — `act(toggleMute)` → `muted === true` and
    `readMute() === true`; toggle again → `false`.
  - `"starts locked"` — `result.current.unlocked === false`.
  - `"unlocks on the first gesture"` — `act(() => document.dispatchEvent(new
    Event('pointerdown')))` → `unlocked === true` (and stays true after another).

- **`src/ui/audio/MuteToggle.test.tsx`**
  - `"reflects muted state via aria-pressed"` — `<MuteToggle muted onToggle={}/>`
    → button `aria-pressed="true"`, text contains 🔇; `muted={false}` →
    `aria-pressed="false"`, text contains 🔊.
  - `"calls onToggle when clicked"` — click → `onToggle` called once.
  - `"defines a ≥44px touch target with no raw hex"` (CSS-contract, reads
    `audio.css`) — matches `.mute-toggle`, a `min-height`/`min-width` declaration,
    and no `/#[0-9a-fA-F]{3,8}\b/`.

## Implementation Context

### Decisions that apply

- `DEC-007` — audio is gated behind a first gesture + a persisted global mute;
  this spec is that gate (no sound yet). `affected_scope: src/ui/audio/**`.
- `DEC-001` — pure UI concern; the engine is not involved in audio.
- `DEC-010` — `audio.css` is token-only, prefixed `.mute-toggle`, no raw hex.

### Constraints that apply

- `audio-gesture-and-mute` — the deliverable: persisted mute (key `mute`) +
  first-gesture unlock, both implemented here.
- `touch-targets-44` — the mute button is ≥44px (mirror `.paytable__trigger`'s
  `min-height/width: var(--space-7)`).
- `test-before-implementation`, `one-spec-per-pr`.

### Prior related work

- `SPEC-015` (shipped) — `storage.ts` (balance localStorage helper); mirror its
  try/catch-never-throw pattern for `muteStorage.ts` (different key, boolean value).
- `SPEC-020` (shipped) — the `.paytable__trigger` header button (touch-target +
  token styling) to mirror; both controls live in the header.
- `SPEC-027` (next) — consumes `muted` + `unlocked` to gate the Tone.js jingle.

### Out of scope (for this spec specifically)

- Any sound / Tone.js / AudioContext creation — SPEC-027. `unlocked` here is just
  a boolean flag that a gesture happened; resuming/creating an audio context is
  SPEC-027's job.
- Per-sound volume, an audio settings panel, SFX — out (STAGE-005 / PROJ-002).

## Notes for the Implementer

- `muteStorage.ts` — mirror `storage.ts`:
  ```ts
  export const MUTE_KEY = 'mute';
  export function readMute(): boolean {
    try { return localStorage.getItem(MUTE_KEY) === 'true'; } catch { return false; }
  }
  export function writeMute(muted: boolean): void {
    try { localStorage.setItem(MUTE_KEY, muted ? 'true' : 'false'); } catch { /* ignore */ }
  }
  ```
- `useAudio.ts`:
  ```ts
  import { useState, useEffect, useCallback } from 'react';
  import { readMute, writeMute } from './muteStorage';

  export function useAudio() {
    const [muted, setMuted] = useState<boolean>(() => readMute());
    const [unlocked, setUnlocked] = useState(false);

    const toggleMute = useCallback(() => {
      setMuted(prev => { const next = !prev; writeMute(next); return next; });
    }, []);

    useEffect(() => {
      if (unlocked) return;
      const onGesture = () => setUnlocked(true);
      document.addEventListener('pointerdown', onGesture, { once: true });
      document.addEventListener('keydown', onGesture, { once: true });
      return () => {
        document.removeEventListener('pointerdown', onGesture);
        document.removeEventListener('keydown', onGesture);
      };
    }, [unlocked]);

    return { muted, toggleMute, unlocked };
  }
  ```
  (`{ once: true }` auto-removes after the first fire; the cleanup covers the
  not-yet-fired case. Either gesture type unlocks.)
- `MuteToggle.tsx`:
  ```tsx
  import './audio.css';
  export default function MuteToggle({ muted, onToggle }: { muted: boolean; onToggle: () => void }) {
    return (
      <button
        type="button"
        className="mute-toggle"
        aria-pressed={muted}
        aria-label={muted ? 'Unmute sound' : 'Mute sound'}
        onClick={onToggle}
      >
        {muted ? '🔇' : '🔊'}
      </button>
    );
  }
  ```
- `audio.css` — mirror `.paytable__trigger`: `min-height: var(--space-7);
  min-width: var(--space-7);` transparent bg, token border/color, focus-visible
  outline. No raw hex.
- `Header.tsx` — take `{ muted, onToggleMute }`; render `<MuteToggle muted={muted}
  onToggle={onToggleMute} />` next to `<PaytableSheet />`. (A simple flex row for
  the two header controls is fine; keep the title.)
- `App.tsx` — `const { muted, toggleMute } = useAudio();` then `<Header
  muted={muted} onToggleMute={toggleMute} />`. (`unlocked` is unused until
  SPEC-027 — don't destructure it yet to avoid an unused-var lint; the hook still
  installs the listener internally.)
- No new DEC — DEC-007 already governs the audio gate. No new dependency.
- **This repo's ESLint has no `react-hooks` plugin** — do NOT add an
  `exhaustive-deps` disable comment.
- After build, the orchestrator previews: a 🔊 button in the header toggles to 🔇
  and back, persists across reload, and `aria-pressed` flips; no sound (none yet).

---

## Build Completion

*Filled in at the end of the **build** cycle, before advancing to verify.*

- **Branch:** feat/spec-026-mute-audio-unlock
- **PR (if applicable):** n/a (local only per instructions)
- **All acceptance criteria met?** yes
- **New decisions emitted:**
  - none (DEC-007 already governs audio gate; DEC-010 covers the CSS approach)
- **Deviations from spec:**
  - Used `fireEvent` from `@testing-library/react` instead of `userEvent` for the click test in `MuteToggle.test.tsx` because `@testing-library/user-event` is not installed in this project. The test behaviour is equivalent for a simple click assertion.
  - Added `.cabinet__header-controls` flex wrapper in `regions.css` (and converted `.cabinet__header` from `text-align: center` to flex row) to house MuteToggle + PaytableSheet side-by-side. The spec said "a simple flex row for the controls is fine"; this is that.
- **Follow-up work identified:**
  - none beyond what's already in the backlog (SPEC-027 consumes `muted` + `unlocked`)

### Build-phase reflection (3 questions, short answers)

1. **What was unclear in the spec that slowed you down?**
   — The spec's MuteToggle test used `userEvent.click` but the project doesn't have `@testing-library/user-event` installed. The spec could note which click utility to use; I switched to `fireEvent` which is already available.

2. **Was there a constraint or decision that should have been listed but wasn't?**
   — No missing constraints. One implicit layout decision: converting `.cabinet__header` from `text-align: center` to a flex row to accommodate the two-control group. This is cosmetic and consistent with how `.paytable__trigger` already sits in the header, but it would have been helpful if the spec had mentioned it explicitly rather than just "a simple flex row for the controls is fine."

3. **If you did this task again, what would you do differently?**
   — Check the project's installed testing utilities before writing test imports. The spec's drop-in code assumed `userEvent`; a quick `ls node_modules/@testing-library/` before writing would have saved one typecheck-fail-and-fix loop.

---

## Reflection (Ship)

*Appended during the **ship** cycle.*

1. **What would I do differently next time?**
   — Nothing material. Mirroring `storage.ts` for `muteStorage` and the
   `.paytable__trigger` button for `MuteToggle` made this fast and consistent.
   Splitting the audio gate (mute + unlock) into its own spec before the jingle was
   the right call — SPEC-027 now has `muted`/`unlocked` ready to gate Tone.js with
   zero plumbing, and the autoplay-policy compliance is proven independently of any
   sound. Preview confirmed the header toggle + persistence across reload.

2. **Does any template, constraint, or decision need updating?**
   — No. DEC-007 already specified the gate; this implements it. Two recurring
   build-agent frictions worth a future template note (already logged as dogfood
   findings): (a) the missing `react-hooks` ESLint plugin (agents add invalid
   exhaustive-deps disables), and (b) `@testing-library/user-event` is NOT installed
   — agents reach for `userEvent.click` and must fall back to `fireEvent`. A
   one-line "use fireEvent; no user-event in this repo" in UI build prompts would
   save a typecheck loop.

3. **Is there a follow-up spec I should write now before I forget?**
   — No new spec. SPEC-027 (the tier-scaled Tone.js win jingle) is the last
   STAGE-004 spec; it consumes this spec's `muted` + `unlocked` and the engine win
   tier, and adds the `tone` dependency (DEC-007-authorized). After it ships,
   STAGE-004's 9-item backlog is complete.

---

## Verify

**Reviewer:** claude-sonnet-4-6 (cold, separate session) — 2026-06-27

### Gate results

| Check | Result |
|---|---|
| `just typecheck` | ✅ exit 0 |
| `just lint` | ✅ exit 0 |
| `just test` | ✅ 193 tests pass, 30 files (+12 new tests: 4 muteStorage + 5 useAudio + 3 MuteToggle) |
| `just build` | ✅ exit 0 (155.29 kB / 50.22 kB gzip) |
| `just decisions-audit --changed main` | ✅ advisory only — DEC-004/DEC-007/DEC-010 flagged as expected; 0 structural errors, no contradiction |

### Verdict: ✅ APPROVED

**Checklist (evidence cited)**

- **AC: readMute default false / 'true'→true / never throws** — `muteStorage.ts`: `try { return localStorage.getItem(MUTE_KEY) === 'true'; } catch { return false; }`. Tests: "defaults to false when absent", "round-trips true", "treats any non-'true' value as false" — all pass.

- **AC: writeMute persists 'true'/'false' / never throws** — `muteStorage.ts`: `try { localStorage.setItem(MUTE_KEY, muted ? 'true' : 'false'); } catch { /* ignore */ }`. Test "round-trips true" asserts `localStorage.getItem(MUTE_KEY) === 'true'`; round-trip false test confirms.

- **AC: useAudio starts muted=false, rehydrates, toggleMute flips+persists** — `useState<boolean>(() => readMute())` (lazy init). Tests "starts unmuted by default", "rehydrates muted from storage" (pre-sets `mute='true'`), "toggleMute flips and persists" (calls `readMute()` after toggle to verify persistence) — all pass.

- **AC: unlocked starts false, flips on first gesture, stays true** — `useState(false)` + `useEffect` with `{ once: true }` on both `pointerdown` and `keydown`. Test "starts locked" + "unlocks on the first gesture" (dispatches `pointerdown`, then a second one to confirm stays true) — both pass. The `if (unlocked) return` early-exit prevents re-registration after unlock. Cleanup `removeEventListener` in the return function covers the not-yet-fired case; `{ once: true }` covers the post-fire case. No listener leak, no state update after unmount.

- **AC: MuteToggle aria-pressed / emojis / accessible name / calls onToggle** — `<button aria-pressed={muted} aria-label={muted ? 'Unmute sound' : 'Mute sound'} onClick={onToggle}>`. Tests "reflects muted state via aria-pressed" (checks both true and false states + emoji text), "calls onToggle when clicked" (mock verifies called once) — pass.

- **AC: mute button ≥44px, audio.css no raw hex** — `min-height: var(--space-7)` (3rem = 48px) and `min-width: var(--space-7)` confirmed in `audio.css`. No `#[0-9a-fA-F]{3,8}` literal in file. Test "defines a ≥44px touch target with no raw hex" reads the file and asserts all three — passes.

- **AC: No Tone.js / audio dep / no sound / engine unchanged** — `git diff main..HEAD -- src/engine/` empty. `git diff main..HEAD -- package.json` empty. `grep` for `tone|Tone|AudioContext` in src/ returns nothing. Confirmed.

- **AUDIO-GESTURE-AND-MUTE constraint** — key is `'mute'` (`MUTE_KEY = 'mute'`). First-gesture unlock via `pointerdown`/`keydown` with `{ once: true }` — auto-removes after firing. Cleanup function removes the not-yet-fired listener. No leak, no state-update-after-unmount.

- **ENGINE UNCHANGED** — `git diff main..HEAD -- src/engine/` produces no output. Confirmed empty.

- **NO NEW DEPENDENCY** — `git diff main..HEAD -- package.json` produces no output. No Tone.js or audio import anywhere in the diff.

- **NO SCOPE CREEP** — Only `src/ui/audio/` (new), `src/ui/regions/Header.tsx`, `src/ui/regions/regions.css`, `src/ui/App.tsx`, and spec/timeline docs changed. The flex layout change to `.cabinet__header` and new `.cabinet__header-controls` wrapper is the expected "simple flex row" called out in the spec's implementer notes; disclosed honestly in build reflection.

- **TESTS NOT VACUOUS** — muteStorage: real round-trip assertions + localStorage key check. useAudio: `renderHook` + real `document.dispatchEvent(new Event('pointerdown'))` gesture to test unlock; toggle test calls `readMute()` to verify persistence side-effect. MuteToggle: aria-pressed in both states, emoji content, `fireEvent.click` verifies callback. Tests would fail if behavior were wrong.

- **NO BAD ESLINT-DISABLE** — zero `eslint-disable` comments in any `src/ui/audio/` file. Confirmed.

- **fireEvent vs userEvent** — build used `fireEvent` (RTL built-in) after noting `@testing-library/user-event` is not installed. This is correct and the deviation is honestly disclosed in the build reflection. Tests pass.

- **CSS CONTRACT** — `.mute-toggle` present, `min-height: var(--space-7)` (48px) and `min-width: var(--space-7)`, all tokens (`var(--color-text-muted)`, `var(--color-text)`, `var(--color-accent)`, `var(--radius-md)`, `var(--font-family-body)`, `var(--font-size-base)`, spacing vars), no raw hex. Confirmed.

- **DECISION DRIFT** — `just decisions-audit --changed main` flags DEC-004, DEC-007, DEC-010 as advisory (expected). No contradiction: DEC-007 is the spec's own purpose; DEC-010 is honored (global CSS, tokens, prefixed classes); DEC-004 (CSS animation) is irrelevant to this change. No new DEC needed.

- **BUILD REFLECTION** — Honest and specific: identifies the `userEvent` assumption in the spec's drop-in code and the implicit layout decision for the flex header. Both are real observations, not boilerplate.

- **COST** — build session present with `tokens_total: null` and "orchestrator to fill" note. Correct per AGENTS §4.

**No punch list items.** All acceptance criteria met, all constraints honored, gate clean.
