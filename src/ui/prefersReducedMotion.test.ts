// Tests for the prefersReducedMotion helper (SPEC-022).
// The setup.ts default mock returns matches: false; individual tests override.
import { describe, it, expect, afterEach } from 'vitest';
import { prefersReducedMotion } from './prefersReducedMotion';

describe('prefersReducedMotion', () => {
  const originalMatchMedia = window.matchMedia;

  afterEach(() => {
    // Restore the original matchMedia after each test that overrides it.
    window.matchMedia = originalMatchMedia;
  });

  it('returns false by default', () => {
    // The setup.ts default mock returns matches: false.
    expect(prefersReducedMotion()).toBe(false);
  });

  it('returns true when the user prefers reduced motion', () => {
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

    expect(prefersReducedMotion()).toBe(true);
  });

  it('returns false when matchMedia is unavailable', () => {
    // Temporarily remove matchMedia to simulate environments that lack it.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).matchMedia = undefined;
    expect(prefersReducedMotion()).toBe(false);
  });
});
