// Tests for ParticleBurst (SPEC-024).
// Queries particles via container.querySelectorAll('.particle').
// Imports PARTICLE_COUNTS from the component — do NOT hard-code the numbers.
// For reduced-motion cases, window.matchMedia is overridden to { matches: true }
// and restored in afterEach (same pattern as prefersReducedMotion.test.ts).
import { describe, it, expect, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import ParticleBurst, { PARTICLE_COUNTS } from './ParticleBurst';
import type { Celebration } from '../useSlotMachine';

const originalMatchMedia = window.matchMedia;

afterEach(() => {
  window.matchMedia = originalMatchMedia;
});

/** Stub matchMedia to report prefers-reduced-motion: reduce = true. */
function stubReducedMotion() {
  window.matchMedia = (query: string) =>
    ({
      matches: true,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}

const SMALL_WIN: Celebration = { id: 1, tier: 'small', totalWin: 10, lineWins: [] };
const BIG_WIN: Celebration   = { id: 2, tier: 'big',   totalWin: 50, lineWins: [] };
const JACKPOT_WIN: Celebration = { id: 3, tier: 'jackpot', totalWin: 200, lineWins: [] };
const NONE_WIN: Celebration  = { id: 4, tier: 'none',  totalWin: 0,  lineWins: [] };

describe('ParticleBurst', () => {
  it('renders nothing without a celebration', () => {
    const { container } = render(<ParticleBurst />);
    expect(container.querySelectorAll('.particle')).toHaveLength(0);
  });

  it('renders nothing for tier none', () => {
    const { container } = render(<ParticleBurst celebration={NONE_WIN} />);
    expect(container.querySelectorAll('.particle')).toHaveLength(0);
  });

  it('renders PARTICLE_COUNTS[tier] particles for a small win', () => {
    const { container } = render(<ParticleBurst celebration={SMALL_WIN} />);
    expect(container.querySelectorAll('.particle')).toHaveLength(PARTICLE_COUNTS.small);
  });

  it('scales the burst by tier', () => {
    // Verify counts are strictly increasing and match the rendered DOM.
    expect(PARTICLE_COUNTS.small).toBeLessThan(PARTICLE_COUNTS.big);
    expect(PARTICLE_COUNTS.big).toBeLessThan(PARTICLE_COUNTS.jackpot);

    const { container: cs } = render(<ParticleBurst celebration={SMALL_WIN} />);
    expect(cs.querySelectorAll('.particle')).toHaveLength(PARTICLE_COUNTS.small);

    const { container: cb } = render(<ParticleBurst celebration={BIG_WIN} />);
    expect(cb.querySelectorAll('.particle')).toHaveLength(PARTICLE_COUNTS.big);

    const { container: cj } = render(<ParticleBurst celebration={JACKPOT_WIN} />);
    expect(cj.querySelectorAll('.particle')).toHaveLength(PARTICLE_COUNTS.jackpot);
  });

  it('renders nothing under reduced motion', () => {
    stubReducedMotion();
    const { container } = render(<ParticleBurst celebration={BIG_WIN} />);
    expect(container.querySelectorAll('.particle')).toHaveLength(0);
  });

  it('particles and the burst are decorative (aria-hidden)', () => {
    const { container } = render(<ParticleBurst celebration={SMALL_WIN} />);
    const burst = container.querySelector('.particle-burst');
    expect(burst).not.toBeNull();
    expect(burst!.getAttribute('aria-hidden')).toBe('true');

    const particles = container.querySelectorAll('.particle');
    expect(particles).toHaveLength(PARTICLE_COUNTS.small);
    for (const p of particles) {
      expect(p.getAttribute('aria-hidden')).toBe('true');
      // Each particle's text must be a leaf or acorn emoji.
      expect(['🍂', '🌰']).toContain(p.textContent);
    }
  });

  it('defines the fly keyframe + reduced-motion + no raw hex (CSS-contract)', () => {
    const cssPath = resolve(__dirname, 'particles.css');
    const css = readFileSync(cssPath, 'utf8');

    // The @keyframes particle-fly block must exist.
    expect(css).toMatch(/@keyframes\s+particle-fly/);

    // The keyframe must use transform.
    const keyframeBlock = css.match(/@keyframes\s+particle-fly\s*\{[\s\S]*?\}/);
    expect(keyframeBlock).not.toBeNull();
    expect(keyframeBlock![0]).toContain('transform');

    // A prefers-reduced-motion: reduce media query must exist.
    expect(css).toMatch(/@media\s*\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)/);

    // No raw hex colors (3- or 6- or 8-digit hex literals).
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
  });
});
