/**
 * CSS-contract tests for src/ui/device-frame.css (SPEC-004).
 *
 * Why parse source instead of computed layout:
 * jsdom does not evaluate media queries or compute layout, so we cannot unit-test
 * "the frame appears only on desktop." Instead we assert the CSS *contract*: the
 * frame is gated behind a min-width media query, it consumes the radius/shadow
 * tokens via var(), and it carries no raw hex color literals (all themed values
 * route through tokens — see DEC-010). Actual responsive appearance is a manual
 * (screenshot) review check.
 *
 * Reads via Node fs (not a Vite ?raw import) for the same reason as
 * tokens.test.ts: Vite transforms CSS in jsdom before ?raw can return raw text.
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { describe, it, expect } from 'vitest';

const CSS_PATH = resolve(__dirname, 'device-frame.css');
const cssSource = readFileSync(CSS_PATH, 'utf-8');

describe('src/ui/device-frame.css', () => {
  it('gates the device frame behind a min-width media query', () => {
    // The desktop gate: a @media block keyed on min-width.
    const mediaPattern = /@media[^{]*min-width[^{]*\{/;
    expect(
      mediaPattern.test(cssSource),
      'Frame CSS has no `@media (min-width: …)` gate — it could affect the phone layout',
    ).toBe(true);
  });

  it('styles the frame with radius and shadow tokens', () => {
    expect(
      cssSource.includes('var(--radius-frame)'),
      'Frame CSS does not consume var(--radius-frame)',
    ).toBe(true);
    expect(
      cssSource.includes('var(--shadow-frame)'),
      'Frame CSS does not consume var(--shadow-frame)',
    ).toBe(true);
  });

  it('uses no raw hex color literals', () => {
    // All themed values must route through tokens (DEC-010), so the frame CSS
    // itself contains no #rgb / #rrggbb / #rrggbbaa literals.
    const hexPattern = /#[0-9a-fA-F]{3,8}\b/;
    expect(
      hexPattern.test(cssSource),
      'Frame CSS contains a raw hex color literal; route it through a token instead',
    ).toBe(false);
  });
});
