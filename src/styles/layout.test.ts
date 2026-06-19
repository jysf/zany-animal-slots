// Token-usage contract for the layout CSS (SPEC-003).
// Reads the CSS source with fs — @types/node is already installed (DEC-009).
// jsdom can't compute resolved var() values, so we check the source text instead.
import { readFileSync } from 'fs';
import { join } from 'path';

const CSS_PATH = join(__dirname, '../ui/regions/regions.css');

describe('layout CSS token-usage contract', () => {
  let css: string;

  beforeAll(() => {
    css = readFileSync(CSS_PATH, 'utf8');
  });

  it('styles the layout with design tokens', () => {
    // Must reference at least one color token and one spacing token.
    expect(css).toMatch(/var\(--color-/);
    expect(css).toMatch(/var\(--space-/);
  });

  it('uses no raw hex color literals', () => {
    // Themed colors must come from tokens, not hard-coded hex (DEC-010).
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
  });
});
