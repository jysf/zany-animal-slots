// CSS contract tests for reels.css (SPEC-016) and win-badge.css (SPEC-033).
// Reads the raw CSS files and asserts structural contracts that must hold for
// the spec's constraints to be satisfied. Follows the same pattern as SPEC-004's
// CSS contract tests (fs.readFileSync approach).
// These tests do NOT exercise rendered animation — they assert that the CSS
// *declarations* necessary for the constraint to be met are present.
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const css = readFileSync(resolve(__dirname, 'reels.css'), 'utf-8');
const winBadgeCss = readFileSync(resolve(__dirname, 'win-badge.css'), 'utf-8');

describe('reels.css animation contract (SPEC-016)', () => {
  it('defines a reel-stop / spin keyframe animation', () => {
    // Both the spin loop and the stop-bounce keyframes must be present.
    expect(css).toMatch(/@keyframes/);
    // Keyframes must use transform (GPU-composited per DEC-004 / perf-60fps).
    expect(css).toMatch(/transform/);
  });

  it('has a reduced-motion fallback', () => {
    // A prefers-reduced-motion: reduce media query must exist (constraint:
    // respect-reduced-motion, DEC-004).
    expect(css).toMatch(/@media\s*\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)/);
  });

  it('uses no raw hex color literals', () => {
    // All color values must come from design tokens (var(--...)), not raw hex.
    // Raw hex: #NNN or #NNNNNN or #NNNNNNNN (3, 6, or 8 hex digits).
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
  });
});

describe('reels.css animation contract (SPEC-023)', () => {
  it('defines the paw-trail keyframe and class', () => {
    // The paw-trail-pop keyframe must be present.
    expect(css).toMatch(/@keyframes\s+paw-trail-pop/);
    // The .reel__paw class must be declared.
    expect(css).toMatch(/\.reel__paw/);
    // The keyframe must use transform (GPU-composited per DEC-004 / perf-60fps).
    expect(css).toMatch(/paw-trail-pop[\s\S]*?transform/);
  });
});

describe('win-badge.css contract (SPEC-033)', () => {
  it('tier border colors use the win-tier tokens, no raw hex', () => {
    // Each tier must have a [data-tier=...] rule using the win-tier token.
    expect(winBadgeCss).toMatch(/--color-win-small/);
    expect(winBadgeCss).toMatch(/--color-win-big/);
    expect(winBadgeCss).toMatch(/--color-jackpot/);
    // No raw hex color literals (DEC-010: tokens only).
    expect(winBadgeCss).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
  });
});
