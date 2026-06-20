// Seedable PRNG for the slot engine (DEC-002). All engine randomness flows
// through an injected Rng so spins are deterministic and testable.

/** A pseudo-random number generator: each call returns the next float in [0, 1). */
export type Rng = () => number;

/**
 * Create a seedable mulberry32 PRNG. Same seed → identical sequence, which
 * lets tests pin a seed and assert known outcomes.
 */
export function createRng(seed: number): Rng {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Draw a random integer in [0, maxExclusive) from `rng`.
 * Consumes exactly one rng() draw so downstream draw-order stays predictable.
 * Throws RangeError if maxExclusive < 1 (programmer error — AGENTS §11).
 */
export function randomInt(rng: Rng, maxExclusive: number): number {
  if (maxExclusive < 1) {
    throw new RangeError(
      `randomInt: maxExclusive must be >= 1, got ${maxExclusive}`,
    );
  }
  return Math.floor(rng() * maxExclusive);
}
