// CSS-contract guard for the global box-sizing reset (SPEC-066).
// Locks the reset in source: `src/styles/reset.css` must set `box-sizing: border-box` on the universal
// selector (incl. ::before/::after), and main.tsx must import it globally. Its absence was the root of the
// max-height-vs-padding trap SPEC-063 patched locally on the three overlay sheets — this makes border-box
// the repo-wide default. Same fs-read CSS-contract pattern as tokens.test.ts / overlay-sheet-scroll.contract.
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { describe, it, expect } from 'vitest';

const RESET_PATH = resolve(__dirname, 'reset.css');
const MAIN_PATH = resolve(__dirname, '../main.tsx');

const resetSource = readFileSync(RESET_PATH, 'utf-8');
const mainSource = readFileSync(MAIN_PATH, 'utf-8');

describe('global box-sizing reset (SPEC-066)', () => {
  it('sets box-sizing: border-box on the universal selector incl. pseudo-elements', () => {
    // Matches `*, *::before, *::after { ... box-sizing: border-box; ... }` (whitespace-tolerant).
    const pattern =
      /\*\s*,\s*\*::before\s*,\s*\*::after\s*\{[^}]*box-sizing:\s*border-box;[^}]*\}/;
    expect(
      pattern.test(resetSource),
      'reset.css must apply box-sizing: border-box to *, *::before, *::after',
    ).toBe(true);
  });

  it('is imported globally in main.tsx', () => {
    expect(
      mainSource.includes("import './styles/reset.css'"),
      "src/main.tsx does not import './styles/reset.css'",
    ).toBe(true);
  });

  it('is imported before tokens.css so it is the base layer', () => {
    const resetIdx = mainSource.indexOf("import './styles/reset.css'");
    const tokensIdx = mainSource.indexOf("import './styles/tokens.css'");
    expect(resetIdx).toBeGreaterThan(-1);
    expect(tokensIdx).toBeGreaterThan(-1);
    expect(resetIdx).toBeLessThan(tokensIdx);
  });
});
