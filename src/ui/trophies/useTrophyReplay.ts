// useTrophyReplay — the per-card replay state machine (SPEC-078).
// Card-local by design: each card that calls this hook gets its own independent
// idle -> spinning -> settled state. There is no shared/lifted state anywhere, which is
// what makes replaying one trophy leave every sibling trophy's grid untouched BY
// CONSTRUCTION rather than by coordination (see the spec's sibling-isolation test).
//
// DEC-001 / engine-no-dom: this hook never calls the engine or useSlotMachine. The grid
// being replayed is already-known, stored data (DEC-024); nothing is spun, and nothing
// stored is ever mutated. It only re-renders the saved grid through ReelGrid's existing
// spinning/trailKey animation props (SPEC-016/SPEC-023), which were already CSS-driven
// (DEC-004) — no JS animation loop is added here either.
import { useEffect, useRef, useState } from 'react';
import { SPIN_DURATION_MS } from '../useSlotMachine';
import { prefersReducedMotion } from '../prefersReducedMotion';

// Reuse the live spin's reveal timing so a replay feels like the original spin did.
// This imports only a constant value from useSlotMachine — the hook itself is never
// called, and the engine is never touched.
const REPLAY_MS = SPIN_DURATION_MS;

export interface TrophyReplayState {
  /** True only during the animated spin phase; suppressed entirely under reduced motion. */
  spinning: boolean;
  /** Passed straight through to ReelGrid's trailKey — null until the first replay, then
   *  incremented on every activation so the paw-pop remounts and replays (SPEC-023 idiom). */
  trailKey: number | null;
  /** Activate (or restart) the replay. Safe to call while already spinning. */
  replay: () => void;
}

export function useTrophyReplay(): TrophyReplayState {
  const [spinning, setSpinning] = useState(false);
  const [trailKey, setTrailKey] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function replay() {
    // Clear any pending settle timer FIRST — this is what makes re-activating mid-replay
    // safe (restart semantics) rather than stacking a second timeout that could fire after
    // a stale one and fight over `spinning`.
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setTrailKey((k) => (k ?? 0) + 1);

    if (prefersReducedMotion()) {
      // No spinning phase at all — settle immediately (respect-reduced-motion).
      setSpinning(false);
      return;
    }

    setSpinning(true);
    timerRef.current = setTimeout(() => {
      setSpinning(false);
      timerRef.current = null;
    }, REPLAY_MS);
  }

  // Unmount cleanup: clear any pending timer so it never fires a state update on an
  // unmounted component.
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { spinning, trailKey, replay };
}
