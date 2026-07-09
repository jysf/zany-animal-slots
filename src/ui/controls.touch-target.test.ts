/**
 * Touch-target guard — all interactive controls must declare a min-height
 * AND min-width that satisfies the ≥44px requirement (constraint: touch-targets-44).
 *
 * Reads each CSS file via fs and slices out the selector's rule block, then
 * asserts the presence of both min-height and min-width at 44px-equivalent
 * values: 2.75rem (44px), 44px, or var(--space-7) (48px).
 *
 * Why fs: same rationale as tokens.test.ts — Vite transforms CSS before
 * ?raw queries work in the jsdom test environment.
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { describe, it, expect } from 'vitest';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Extract the first `{ ... }` rule block for a given CSS selector from a
 * CSS source string.
 */
function extractRuleBlock(cssSource: string, selector: string): string | null {
  // Escape selector for use in regex (e.g. '.spin-btn' → '\.spin-btn')
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Match selector followed by optional whitespace and a brace-delimited block.
  // [^}]* stops at the first closing brace, which is what we want for a
  // single-level rule.
  const pattern = new RegExp(`${escaped}\\s*\\{([^}]*)\\}`);
  const m = pattern.exec(cssSource);
  return m ? m[1] : null;
}

/**
 * Return true if the rule-block text declares a property with a 44px-equivalent
 * value: 2.75rem, 44px, or var(--space-7).
 */
function has44pxValue(block: string, property: string): boolean {
  // Match: `property: <value>;` where value is one of our approved equivalents.
  const pattern = new RegExp(
    `${property}\\s*:\\s*(2\\.75rem|44px|var\\(--space-7\\))`,
  );
  return pattern.test(block);
}

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const CONTROLS_CSS = resolve(__dirname, 'regions/controls.css');
const AUDIO_CSS    = resolve(__dirname, 'audio/audio.css');
const PAYTABLE_CSS = resolve(__dirname, 'paytable.css');
const MACHINE_SELECTOR_CSS = resolve(__dirname, 'machine/machine-selector.css');
const STATS_CSS = resolve(__dirname, 'stats/stats.css');

const controlsCss  = readFileSync(CONTROLS_CSS, 'utf-8');
const audioCss     = readFileSync(AUDIO_CSS, 'utf-8');
const paytableCss  = readFileSync(PAYTABLE_CSS, 'utf-8');
const machineSelectorCss = readFileSync(MACHINE_SELECTOR_CSS, 'utf-8');
const statsCss = readFileSync(STATS_CSS, 'utf-8');

interface ControlEntry {
  label: string;
  cssSource: string;
  selector: string;
}

const CONTROLS: ControlEntry[] = [
  { label: '.spin-btn (controls.css)',         cssSource: controlsCss,  selector: '.spin-btn' },
  { label: '.bet-btn (controls.css)',          cssSource: controlsCss,  selector: '.bet-btn' },
  { label: '.auto-btn (controls.css)',         cssSource: controlsCss,  selector: '.auto-btn' },
  { label: '.reset-btn (controls.css)',        cssSource: controlsCss,  selector: '.reset-btn' },
  { label: '.mute-toggle (audio.css)',         cssSource: audioCss,     selector: '.mute-toggle' },
  { label: '.paytable__trigger (paytable.css)', cssSource: paytableCss, selector: '.paytable__trigger' },
  { label: '.machine-selector (machine-selector.css)', cssSource: machineSelectorCss, selector: '.machine-selector' },
  { label: '.stats__trigger (stats.css)', cssSource: statsCss, selector: '.stats__trigger' },
  { label: '.stats__clear (stats.css)',   cssSource: statsCss, selector: '.stats__clear' },
];

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('controls.touch-target.test.ts — ≥44px touch targets', () => {
  it('interactive controls are ≥44px', () => {
    for (const { label, cssSource, selector } of CONTROLS) {
      const block = extractRuleBlock(cssSource, selector);
      expect(block, `Could not find rule block for ${label}`).not.toBeNull();

      expect(
        has44pxValue(block!, 'min-height'),
        `${label}: missing min-height ≥44px (2.75rem / 44px / var(--space-7))`,
      ).toBe(true);

      expect(
        has44pxValue(block!, 'min-width'),
        `${label}: missing min-width ≥44px (2.75rem / 44px / var(--space-7))`,
      ).toBe(true);
    }
  });
});
