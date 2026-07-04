// Contract test for public/.well-known/security.txt (RFC 9116).
// Asserts the required fields are present and Expires is still valid, so the
// disclosure contact can't silently rot. Mirrors headers.contract.test.ts.
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const SRC_PATH = resolve(process.cwd(), 'public/.well-known/security.txt');
const DIST_PATH = resolve(process.cwd(), 'dist/.well-known/security.txt');

const raw = readFileSync(SRC_PATH, 'utf-8');

function field(name: string): string | null {
  const line = raw.split('\n').find((l) => l.trim().startsWith(name + ':'));
  return line ? line.slice(line.indexOf(':') + 1).trim() : null;
}

describe('security.txt contract (RFC 9116)', () => {
  it('has the required Contact and Expires fields + a Policy link', () => {
    expect(field('Contact'), 'Contact is required').not.toBeNull();
    expect(field('Contact')).toMatch(/^https:\/\/|^mailto:/);
    expect(field('Policy')).toMatch(/SECURITY\.md/);
    expect(field('Expires'), 'Expires is required').not.toBeNull();
  });

  it('Expires is a valid, non-expired date (renew before it lapses)', () => {
    const expires = field('Expires')!;
    const when = new Date(expires);
    expect(Number.isNaN(when.getTime()), `Expires "${expires}" must be a valid date`).toBe(false);
    // If this fails, security.txt has lapsed — bump the Expires date.
    expect(when.getTime(), 'security.txt Expires is in the past — renew it').toBeGreaterThan(
      Date.now(),
    );
  });

  it('the built dist includes .well-known/security.txt', () => {
    // Skip gracefully if dist/ is absent (fresh checkout, no build yet).
    if (!existsSync(DIST_PATH)) {
      console.log('Skipping dist check: dist/ not present (run npm run build first).');
      return;
    }
    expect(readFileSync(DIST_PATH, 'utf-8')).toBe(raw);
  });
});
