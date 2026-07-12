// Contract test for the slot-machine favicon (SPEC-064).
// Asserts the self-contained SVG favicon exists and is wired into index.html, so the tab identity
// can't silently regress. Mirrors security-txt.contract.test.ts (process.cwd()-relative reads).
import { readFileSync } from 'fs';
import { resolve } from 'path';

const FAVICON = readFileSync(resolve(process.cwd(), 'public/favicon.svg'), 'utf-8');
const INDEX_HTML = readFileSync(resolve(process.cwd(), 'index.html'), 'utf-8');

describe('slot-machine favicon (SPEC-064)', () => {
  it('public/favicon.svg is a valid, self-contained SVG', () => {
    expect(FAVICON).toMatch(/<svg[\s>]/);
    expect(FAVICON).toContain('viewBox');
    expect(FAVICON).toContain('</svg>');
    // Inline vector art (proves it's drawn, not an embedded raster).
    expect(FAVICON).toMatch(/<(rect|circle|path)[\s>]/);
    // Self-contained: no external RESOURCE fetches (the xmlns namespace URI is fine).
    expect(FAVICON).not.toMatch(/<image\b/);
    expect(FAVICON).not.toMatch(/(href|src)\s*=\s*"https?:\/\//);
    expect(FAVICON).not.toMatch(/url\(\s*['"]?https?:\/\//);
  });

  it('index.html links the favicon as an SVG icon', () => {
    expect(INDEX_HTML).toMatch(/<link[^>]+rel="icon"[^>]*href="\/favicon\.svg"/);
    expect(INDEX_HTML).toMatch(/type="image\/svg\+xml"/);
  });
});
