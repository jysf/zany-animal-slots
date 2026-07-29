// Cabinet framing contract (SPEC-092, DEC-028).
// One bezel language across the reel window, the readout, and the control deck — driven by the
// per-machine --color-frame token so all six machines get themed chrome for free.
// jsdom can't resolve var(), so (as in layout.test.ts) the CSS source text is the contract.
import { readFileSync } from 'fs';
import { join } from 'path';

const read = (p: string): string => readFileSync(join(__dirname, p), 'utf8');

describe('cabinet framing contract (SPEC-092)', () => {
  let tokens: string;
  let regions: string;
  let reels: string;

  beforeAll(() => {
    tokens = read('./tokens.css');
    regions = read('../ui/regions/regions.css');
    reels = read('../ui/reels/reels.css');
  });

  it('defines the bezel + depth tokens', () => {
    expect(tokens).toMatch(/--bezel-width:/);
    expect(tokens).toMatch(/--shadow-well:/);
    expect(tokens).toMatch(/--shadow-deck:/);
  });

  it('bezels the reel window with the machine frame colour (a border, not just a fill)', () => {
    // A `border` declaration whose value references --color-frame. `background-color:
    // var(--color-frame)` must NOT satisfy this — the point is a visible edge.
    expect(reels).toMatch(/border:[^;]*var\(--color-frame\)/);
  });

  it('recesses the reel window into the cabinet face', () => {
    expect(reels).toMatch(/box-shadow:[^;]*var\(--shadow-well\)/);
  });

  it('frames the balance/bet/win readout as a display panel', () => {
    const status = section(regions, '.cabinet__status');
    expect(status).toMatch(/border:[^;]*var\(--color-/);
    expect(status).toMatch(/border-radius:[^;]*var\(--radius-/);
  });

  it('gives the control deck a defined top edge', () => {
    const action = section(regions, '.cabinet__action');
    expect(action).toMatch(/border-top:[^;]*var\(--color-/);
  });

  it('uses no raw hex and no raw px radii in the framed CSS (DEC-010: one radius scale)', () => {
    for (const css of [regions, reels]) {
      expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
      // border-radius must come from a --radius-* token, never a literal length.
      expect(css).not.toMatch(/border-radius:\s*[\d.]+(px|rem)/);
    }
  });

  it('adds no motion — framing is static (constraint: respect-reduced-motion)', () => {
    const framed = [
      section(regions, '.cabinet__game'),
      section(regions, '.cabinet__status'),
      section(regions, '.cabinet__action'),
      section(reels, '.reel-grid'),
    ].join('\n');
    expect(framed).not.toMatch(/\b(transition|animation):/);
  });
});

/** Extract a single rule block by selector, so assertions can't be satisfied by an unrelated rule. */
function section(css: string, selector: string): string {
  // Escape the leading dot for the regex; match `selector {` up to the closing brace.
  const re = new RegExp(`\\${selector}\\s*\\{([^}]*)\\}`);
  const match = re.exec(css);
  if (!match) throw new Error(`selector ${selector} not found`);
  return match[1];
}
