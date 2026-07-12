// CSS-contract guard for the overlay sheets (SPEC-063).
// Locks the layout fix in source: each bottom-sheet (help / paytable / stats) must cap its height to
// the viewport AND scroll its own body, so a tall sheet can always reach its title + close button — and
// be viewport-anchored on phone so it doesn't clip against a cabinet taller than the viewport. This
// specifically guards the regression where paytable.css / stats.css had NO max-height / overflow-y at
// all. Same fs-read CSS-contract pattern as reduced-motion.contract.test.tsx.
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SHEETS: Array<{ name: string; file: string; selector: string }> = [
  { name: 'help', file: 'help/help.css', selector: '.help__sheet' },
  { name: 'paytable', file: 'paytable.css', selector: '.paytable__sheet' },
  { name: 'stats', file: 'stats/stats.css', selector: '.stats__sheet' },
];

/** The FIRST rule block for a selector — the base (phone) rule, before any @media override. */
function baseRule(css: string, selector: string): string {
  const at = css.indexOf(selector + ' {');
  expect(at).toBeGreaterThan(-1);
  const open = css.indexOf('{', at);
  const close = css.indexOf('}', open);
  return css.slice(open + 1, close);
}

describe('overlay sheet scroll contract (SPEC-063)', () => {
  for (const { name, file, selector } of SHEETS) {
    const css = readFileSync(resolve(__dirname, file), 'utf-8');
    const rule = baseRule(css, selector);

    it(`${name} sheet caps its height to the viewport (dvh/vh)`, () => {
      expect(rule).toMatch(/max-height:\s*\d+(dvh|vh)/);
    });

    it(`${name} sheet scrolls its own body (overflow-y: auto)`, () => {
      expect(rule).toMatch(/overflow-y:\s*auto/);
    });

    it(`${name} sheet is viewport-anchored on phone (position: fixed)`, () => {
      expect(rule).toMatch(/position:\s*fixed/);
    });
  }
});
