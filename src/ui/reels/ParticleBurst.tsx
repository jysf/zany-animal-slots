// ParticleBurst — leaves 🍂 / acorns 🌰 that erupt from the reel centre on a win (SPEC-024).
// Count is scaled to the win tier (small < big < jackpot). Renders nothing when there is no
// celebration, when tier is 'none', or under prefers-reduced-motion (DEC-004, respect-reduced-motion).
// Particles fly outward via a CSS @keyframes particle-fly on randomized per-particle trajectories
// expressed as inline CSS custom properties (DEC-004, DEC-010). Keyed on celebration.id so the
// burst remounts (replays) on each distinct win (SPEC-021). Emoji art per DEC-006.
import { useMemo } from 'react';
import type { Celebration } from '../useSlotMachine';
import { prefersReducedMotion } from '../prefersReducedMotion';
import './particles.css';

/** Tier-to-particle-count map. Strictly increasing: small < big < jackpot.
 *  Exported so tests can import without hard-coding the numbers. */
export const PARTICLE_COUNTS: Record<'small' | 'big' | 'jackpot', number> = {
  small: 10,
  big: 20,
  jackpot: 32,
};

const EMOJI = ['🍂', '🌰'];

export default function ParticleBurst({ celebration }: { celebration?: Celebration | null }) {
  const id = celebration?.id ?? null;
  const tier = celebration?.tier ?? 'none';
  const count = tier === 'none' ? 0 : PARTICLE_COUNTS[tier];

  // Memoize trajectories per win so unrelated re-renders don't reshuffle them.
  // Hook is called BEFORE the early return so hook order stays stable across renders.
  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const angle = (Math.PI * 2 * i) / Math.max(count, 1) + Math.random() * 0.6;
      const dist = 60 + Math.random() * 90; // px
      return {
        emoji: EMOJI[i % EMOJI.length],
        style: {
          ['--p-dx' as string]: `${Math.cos(angle) * dist}px`,
          ['--p-dy' as string]: `${Math.sin(angle) * dist}px`,
          ['--p-rot' as string]: `${Math.round(Math.random() * 360)}deg`,
          ['--p-delay' as string]: `${Math.round(Math.random() * 80)}ms`,
        } as React.CSSProperties,
      };
    });
  }, [id, count]);

  if (!celebration || count === 0 || prefersReducedMotion()) return null;

  return (
    <div className="particle-burst" aria-hidden="true" key={id}>
      {particles.map((p, i) => (
        <span key={i} className="particle" aria-hidden="true" style={p.style}>{p.emoji}</span>
      ))}
    </div>
  );
}
