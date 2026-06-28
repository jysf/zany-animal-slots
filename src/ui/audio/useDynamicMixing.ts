// useDynamicMixing — applies bus-level gain automation once per win (SPEC-030).
// Mirrors useWinJingle exactly: keyed on celebration.id (fire-once-per-win),
// gated by muted and unlocked so audio respects the gesture policy (DEC-007,
// audio-gesture-and-mute). The `mix` parameter is injectable for tests.
import { useEffect } from 'react';
import type { Celebration } from '../useSlotMachine';
import type { WinTier } from '../../engine/index';
import { applyMix } from './mixer';

export function useDynamicMixing(
  celebration: Celebration | null,
  opts: { muted: boolean; unlocked: boolean },
  mix: (t: WinTier) => void = applyMix,
): void {
  const { muted, unlocked } = opts;
  useEffect(() => {
    if (!celebration || celebration.tier === 'none') return;
    if (muted || !unlocked) return;
    mix(celebration.tier);
    // Intentionally keyed on celebration.id ONLY (fire once per win); muted/
    // unlocked are read at fire time. This repo has no react-hooks ESLint plugin.
  }, [celebration?.id]);
}
