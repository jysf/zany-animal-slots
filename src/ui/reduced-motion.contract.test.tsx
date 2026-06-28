// CSS-contract + audio-guard tests for the reduced-motion audit (SPEC-031).
// Tests the structural promises the spec locks in:
//   1. Every @keyframes CSS file has a prefers-reduced-motion block (regression guard).
//   2. The global reduced-motion safety net exists and neutralizes motion.
//   3. Audio modules do NOT motion-gate (sound is gated by mute+unlock only).
//   4. App renders without throwing under emulated reduced motion.
//
// Uses fs for CSS and audio source reads (same pattern as reels.animation.test.ts).
import { readFileSync, readdirSync, statSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { render, screen } from '@testing-library/react';
import App from './App';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC_ROOT = resolve(__dirname, '..');

/** Recursively collect all *.css paths under a directory. */
function walkCss(dir: string): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      results.push(...walkCss(full));
    } else if (entry.endsWith('.css')) {
      results.push(full);
    }
  }
  return results;
}

const REDUCED_MOTION_RE = /@media\s*\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)/;
const KEYFRAMES_RE = /@keyframes/;

describe('reduced-motion contract (SPEC-031)', () => {
  it('every @keyframes CSS has a reduced-motion block', () => {
    const allCss = walkCss(SRC_ROOT);
    const filesWithKeyframes: string[] = [];

    for (const filePath of allCss) {
      const source = readFileSync(filePath, 'utf-8');
      if (KEYFRAMES_RE.test(source)) {
        filesWithKeyframes.push(filePath);
        // Each file with @keyframes must have a reduced-motion media query.
        expect(
          REDUCED_MOTION_RE.test(source),
          `${filePath} has @keyframes but no @media (prefers-reduced-motion: reduce) block`,
        ).toBe(true);
      }
    }

    // Guard: the glob must have found at least 5 @keyframes files.
    // (reels, win-badge, particles, jackpot, paytable — all shipped per-stage.)
    expect(filesWithKeyframes.length).toBeGreaterThanOrEqual(5);
  });

  it('a global reduced-motion safety net exists', () => {
    const netPath = resolve(SRC_ROOT, 'styles/reduced-motion.css');
    const source = readFileSync(netPath, 'utf-8');
    expect(source).toMatch(REDUCED_MOTION_RE);
    expect(source).toMatch(/animation-duration/);
    expect(source).toMatch(/transition-duration/);
  });

  it('audio is not motion-gated', () => {
    const audioDir = resolve(SRC_ROOT, 'ui/audio');
    const audioTs = readdirSync(audioDir).filter(
      (f) => f.endsWith('.ts') && !f.endsWith('.test.ts'),
    );

    for (const file of audioTs) {
      const source = readFileSync(join(audioDir, file), 'utf-8');
      expect(source).not.toContain('prefers-reduced-motion');
      expect(source).not.toContain('prefersReducedMotion');
    }
  });

  describe('App renders under reduced motion', () => {
    const originalMatchMedia = window.matchMedia;

    afterEach(() => {
      window.matchMedia = originalMatchMedia;
    });

    it('renders and shows the Spin button when matchMedia reports reduced motion', () => {
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

      // Must not throw; the Spin control must be present.
      render(<App />);
      expect(screen.getByRole('button', { name: /spin/i })).toBeInTheDocument();
    });
  });
});
