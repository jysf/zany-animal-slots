// Contract test for SECURITY.md (SPEC-037).
// Asserts the required sections and posture claims exist so the policy
// can't silently drift. Mirrors the file-reading pattern in
// src/ui/reduced-motion.contract.test.tsx.
//
// NOTE: Do NOT use `process` in this file — it is outside the scripts/**
// ESLint block that grants Node globals, so `process` would trip no-undef
// (dogfood finding #15). import.meta.url keeps it clean.
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';

const __dirname = dirname(fileURLToPath(import.meta.url)); // repo root
const text = readFileSync(resolve(__dirname, 'SECURITY.md'), 'utf-8');

describe('SECURITY.md contract (SPEC-037)', () => {
  it('SECURITY.md exists and is non-empty', () => {
    expect(text.length).toBeGreaterThan(0);
  });

  it('has the three required ## sections', () => {
    expect(text).toMatch(/^##\s+Security posture/im);
    expect(text).toMatch(/^##\s+Deployment hardening/im);
    expect(text).toMatch(/^##\s+Reporting a vulnerability/im);
  });

  it('posture section declares play-money / no-PII / no-backend / client-only', () => {
    expect(text).toMatch(/play-money/i);
    expect(text).toMatch(/no PII|personal data/i);
    expect(text).toMatch(/no backend|client-only|client-side/i);
  });

  it('deployment section documents the headers + the HSTS-at-the-zone split', () => {
    expect(text).toMatch(/_headers|CSP/);
    expect(text).toMatch(/SPEC-036|supply-chain/i);
    expect(text).toMatch(/HSTS/);
    expect(text).toMatch(/Cloudflare/);
  });

  it('reporting section gives a private coordinated-disclosure path', () => {
    expect(text).toMatch(/security advisory/i);
    expect(text).toMatch(/disclosure/i);
  });
});
