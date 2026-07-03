import { resolve } from 'node:path';
import { describe, it, expect } from 'vitest';
import { ALLOWED, isAllowed, scan } from './license-check.mjs';

describe('ALLOWED is permissive-only', () => {
  it('contains the expected permissive licenses', () => {
    expect(ALLOWED.has('MIT')).toBe(true);
    expect(ALLOWED.has('Apache-2.0')).toBe(true);
    expect(ALLOWED.has('ISC')).toBe(true);
    expect(ALLOWED.has('BSD-2-Clause')).toBe(true);
    expect(ALLOWED.has('BSD-3-Clause')).toBe(true);
    expect(ALLOWED.has('0BSD')).toBe(true);
  });

  it('does NOT contain copyleft licenses', () => {
    expect(ALLOWED.has('GPL-3.0-only')).toBe(false);
    expect(ALLOWED.has('AGPL-3.0')).toBe(false);
    expect(ALLOWED.has('LGPL-3.0')).toBe(false);
  });
});

describe('isAllowed honors SPDX OR + exceptions + rejects copyleft', () => {
  it('allows a plain permissive license', () => {
    expect(isAllowed('x', 'MIT')).toBe(true);
  });

  it('allows an SPDX OR expression where all tokens are permissive', () => {
    expect(isAllowed('x', 'MIT OR Apache-2.0')).toBe(true);
  });

  it('rejects GPL-3.0-only', () => {
    expect(isAllowed('x', 'GPL-3.0-only')).toBe(false);
  });

  it('rejects AGPL-3.0', () => {
    expect(isAllowed('x', 'AGPL-3.0')).toBe(false);
  });

  it('honors the caniuse-lite CC-BY-4.0 exception', () => {
    expect(isAllowed('caniuse-lite', 'CC-BY-4.0')).toBe(true);
  });
});

describe('the current dependency tree passes', () => {
  it('scan returns an empty violations array for node_modules', () => {
    const violations = scan(resolve(process.cwd(), 'node_modules'));
    expect(violations).toEqual([]);
  });
});
