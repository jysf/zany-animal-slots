/**
 * Token-contract tests for src/styles/tokens.css.
 *
 * Why parse source instead of getComputedStyle:
 * jsdom does not resolve var() / computed custom-property cascade reliably.
 * Parsing the CSS source gives a deterministic, honest contract check.
 *
 * Why fs.readFileSync and not a Vite ?raw import:
 * Vite transforms CSS files in the jsdom test environment before the ?raw
 * query can return the raw text, yielding an empty string. Reading via Node's
 * fs module is the reliable path in a Vitest Node runtime (Node types come from
 * @types/node — see DEC-009).
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { describe, it, expect } from 'vitest';

const CSS_PATH = resolve(__dirname, 'tokens.css');
const MAIN_PATH = resolve(__dirname, '../main.tsx');

const cssSource = readFileSync(CSS_PATH, 'utf-8');
const mainSource = readFileSync(MAIN_PATH, 'utf-8');

// Full required token list from SPEC-002 Acceptance Criteria.
const REQUIRED_TOKENS: string[] = [
  // Color
  '--color-bg',
  '--color-surface',
  '--color-frame',
  '--color-text',
  '--color-text-muted',
  '--color-accent',
  '--color-coin',
  '--color-win-small',
  '--color-win-big',
  '--color-jackpot',
  '--color-jackpot-sky',
  // Type — family
  '--font-family-display',
  '--font-family-body',
  // Type — size
  '--font-size-xs',
  '--font-size-sm',
  '--font-size-base',
  '--font-size-lg',
  '--font-size-xl',
  '--font-size-2xl',
  '--font-size-3xl',
  // Type — line-height
  '--line-height-tight',
  '--line-height-base',
  // Type — weight
  '--font-weight-normal',
  '--font-weight-bold',
  '--font-weight-black',
  // Spacing
  '--space-0',
  '--space-1',
  '--space-2',
  '--space-3',
  '--space-4',
  '--space-5',
  '--space-6',
  '--space-7',
  '--space-8',
  // Radius (added SPEC-004)
  '--radius-frame',
  // Shadow (added SPEC-004)
  '--shadow-frame',
];

describe('src/styles/tokens.css', () => {
  it('declares every required design token on :root', () => {
    for (const token of REQUIRED_TOKENS) {
      // Matches `--token-name: <non-empty value>;`
      const pattern = new RegExp(`${token}\\s*:\\s*[^;]+;`);
      expect(
        pattern.test(cssSource),
        `Missing or empty token: ${token}`,
      ).toBe(true);
    }
  });

  it('has no empty custom-property values', () => {
    // A declaration of the form `--anything: ;` is empty.
    const emptyPattern = /--[\w-]+\s*:\s*;/;
    expect(
      emptyPattern.test(cssSource),
      'Found a custom property with an empty value',
    ).toBe(false);
  });

  it('is imported globally in main.tsx', () => {
    expect(
      mainSource.includes("import './styles/tokens.css'"),
      "src/main.tsx does not import './styles/tokens.css'",
    ).toBe(true);
  });
});
