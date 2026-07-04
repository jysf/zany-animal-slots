// Contract test for public/_headers (SPEC-035).
// Reads the file from the repo root via fs and asserts the required
// CSP directives, security headers, cache rules, and (optionally) that
// the built dist/_headers equals public/_headers.
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const HEADERS_PATH = resolve(process.cwd(), 'public/_headers');
const DIST_HEADERS_PATH = resolve(process.cwd(), 'dist/_headers');

const raw = readFileSync(HEADERS_PATH, 'utf-8');

// Extract the CSP value (single line starting with Content-Security-Policy:)
function extractDirective(header: string, headerName: string): string | null {
  const lines = header.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith(headerName + ':')) {
      return trimmed.slice((headerName + ':').length).trim();
    }
  }
  return null;
}

// Parse the script-src segment out of the CSP value
function extractScriptSrc(csp: string): string | null {
  const match = csp.match(/script-src\s+([^;]+)/);
  return match ? match[1] : null;
}

describe('headers contract (SPEC-035)', () => {
  it('defines a tight CSP', () => {
    expect(raw).toContain('Content-Security-Policy:');

    const csp = extractDirective(raw, 'Content-Security-Policy');
    expect(csp, 'CSP value must be present').not.toBeNull();
    if (!csp) return;

    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("script-src 'self'");
    expect(csp).toContain("style-src 'self' 'unsafe-inline'");
    expect(csp).toContain('img-src');
    expect(csp).toContain("connect-src 'self'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("base-uri 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
  });

  it('script-src has no unsafe-inline/eval', () => {
    const csp = extractDirective(raw, 'Content-Security-Policy');
    expect(csp, 'CSP value must be present').not.toBeNull();
    if (!csp) return;

    const scriptSrc = extractScriptSrc(csp);
    expect(scriptSrc, 'script-src directive must be present').not.toBeNull();
    if (!scriptSrc) return;

    expect(scriptSrc).not.toContain("'unsafe-inline'");
    expect(scriptSrc).not.toContain("'unsafe-eval'");
    // The script-src should just be 'self'
    expect(csp).toContain("script-src 'self'");
  });

  it('sets the standard security headers', () => {
    expect(raw).toContain('X-Content-Type-Options: nosniff');
    expect(raw).toContain('X-Frame-Options: DENY');
    expect(raw).toContain('Referrer-Policy:');

    // HSTS is served from _headers (not the Cloudflare zone): a Worker custom
    // domain owns its responses, so zone-level HSTS never reaches them (DEC-014).
    const hsts = extractDirective(raw, 'Strict-Transport-Security');
    expect(hsts, 'Strict-Transport-Security must be present').not.toBeNull();
    expect(hsts).toMatch(/max-age=\d+/);

    const permPolicy = extractDirective(raw, 'Permissions-Policy');
    expect(permPolicy, 'Permissions-Policy must be present').not.toBeNull();
    if (!permPolicy) return;

    expect(permPolicy).toContain('camera=()');
    expect(permPolicy).toContain('microphone=()');
    expect(permPolicy).toContain('geolocation=()');
    expect(permPolicy).toContain('payment=()');
  });

  it('caches hashed assets immutably and revalidates html', () => {
    // /assets/* block must have long-cache + immutable
    expect(raw).toContain('/assets/*');
    expect(raw).toContain('max-age=31536000');
    expect(raw).toContain('immutable');

    // HTML entry points must revalidate (no-cache / no-store somewhere).
    const hasNocache = raw.includes('no-cache') || raw.includes('no-store');
    expect(hasNocache, 'HTML paths must have Cache-Control: no-cache or no-store').toBe(true);

    // The /assets/* block must be purely immutable — NOT carry no-cache. On
    // Workers Static Assets a no-cache in /* would be merged in and defeat the
    // immutable rule, so it is deliberately scoped away from assets. Match the
    // RULE block (a line starting with /assets/*), not comment mentions of it.
    const assetsBlock = raw.match(/^\/assets\/\*[\s\S]*$/m)?.[0] ?? '';
    expect(assetsBlock).toContain('immutable');
    expect(assetsBlock, '/assets/* must not carry no-cache').not.toContain('no-cache');
  });

  it('the built dist includes _headers', () => {
    // Skip gracefully if dist/ is absent (fresh checkout, no build yet)
    if (!existsSync(DIST_HEADERS_PATH)) {
      console.log('Skipping dist/_headers check: dist/ not present (run npm run build first).');
      return;
    }
    const distRaw = readFileSync(DIST_HEADERS_PATH, 'utf-8');
    const publicRaw = readFileSync(HEADERS_PATH, 'utf-8');
    expect(distRaw).toBe(publicRaw);
  });
});
