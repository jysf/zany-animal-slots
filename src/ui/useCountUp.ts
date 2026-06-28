// useCountUp — balance count-up hook (SPEC-022).
// Animates a displayed integer from (target - amount) to target over
// COUNT_UP_DURATION_MS when a new win signal arrives, keyed on signal.id so it
// fires exactly once per win (SPEC-021). Snaps instantly under reduced motion
// (DEC-012 — JS-side check via prefersReducedMotion()).
// Uses setInterval (not rAF) so vi.useFakeTimers() can drive it in tests.
import { useState, useRef, useEffect } from 'react';
import { prefersReducedMotion } from './prefersReducedMotion';

export const COUNT_UP_DURATION_MS = 800;
const STEP_MS = 40; // ~20 ticks; smooth enough, and fake-timer friendly

export function useCountUp(
  target: number,
  signal: { id: number; amount: number } | null,
): number {
  const [display, setDisplay] = useState(target);
  const lastIdRef = useRef<number | null>(null);

  useEffect(() => {
    // New win to animate?
    if (signal && signal.id !== lastIdRef.current) {
      lastIdRef.current = signal.id;
      if (prefersReducedMotion()) {
        setDisplay(target);
        return;
      }
      const from = target - signal.amount;
      setDisplay(from);
      let elapsed = 0;
      const iv = setInterval(() => {
        elapsed += STEP_MS;
        const t = Math.min(1, elapsed / COUNT_UP_DURATION_MS);
        setDisplay(t >= 1 ? target : Math.round(from + (target - from) * t));
        if (t >= 1) clearInterval(iv);
      }, STEP_MS);
      return () => clearInterval(iv);
    }
    // No new win (loss, reset, bet, or unrelated rerender): snap to target.
    // Also interrupts an in-flight tween if target changes while signal is null.
    setDisplay(target);
    return undefined;
  }, [signal?.id, target]);

  return display;
}
