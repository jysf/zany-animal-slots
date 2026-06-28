/**
 * WCAG AA contrast guard for design tokens.
 *
 * Parses tokens.css via fs (same approach as tokens.test.ts) to build a
 * deterministic hex map. Inline luminance/contrast helpers — no new dependency.
 *
 * Why fs instead of ?raw imports: Vite transforms CSS files in the jsdom test
 * environment before a ?raw query can return raw text; reading via Node fs
 * is the reliable path (see tokens.test.ts preamble).
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { describe, it, expect } from 'vitest';

// ─── WCAG helpers ────────────────────────────────────────────────────────────

function luminance(hex: string): number {
  const c = hex.replace('#', '');
  const ch = [0, 2, 4]
    .map(i => parseInt(c.slice(i, i + 2), 16) / 255)
    .map(v => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
}

function contrast(a: string, b: string): number {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

// ─── Token resolution ─────────────────────────────────────────────────────────

const cssSource = readFileSync(resolve(__dirname, 'tokens.css'), 'utf-8');

// Build raw palette: --_raw-night -> '#1a1008', etc.
const raw: Record<string, string> = {};
for (const m of cssSource.matchAll(/--(_raw-[a-z]+):\s*(#[0-9a-fA-F]{6})/g)) {
  raw[`--${m[1]}`] = m[2];
}

// Build semantic map: --color-bg -> hex resolved via --_raw-*
const semantic: Record<string, string> = {};
for (const m of cssSource.matchAll(/--(color-[a-z-]+):\s*var\(--(_raw-[a-z]+)\)/g)) {
  const rawKey = `--${m[2]}`;
  if (raw[rawKey]) {
    semantic[`--${m[1]}`] = raw[rawKey];
  }
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('contrast.test.ts — WCAG AA guard', () => {
  it('resolves semantic colors from tokens.css', () => {
    // Spot-check the key token after the fix
    expect(semantic['--color-text-muted']).toBe('#ccb084');
    // And a few anchoring tokens
    expect(semantic['--color-text']).toBe('#f5e6c8');    // cream
    expect(semantic['--color-bg']).toBe('#1a1008');       // night
    expect(semantic['--color-frame']).toBe('#5c3317');    // wood
    expect(semantic['--color-surface']).toBe('#3b2310');  // bark
  });

  it('all UI text/bg pairs meet WCAG AA', () => {
    // Resolved hex values
    const text    = semantic['--color-text'];         // #f5e6c8 cream
    const muted   = semantic['--color-text-muted'];   // #ccb084 (fixed)
    const accent  = semantic['--color-accent'];        // #f4721e campfire
    const coin    = semantic['--color-coin'];          // #f0c040 gold
    const jackpot = semantic['--color-jackpot'];       // #ffd700
    const bg      = semantic['--color-bg'];            // #1a1008 night
    const surface = semantic['--color-surface'];       // #3b2310 bark
    const frame   = semantic['--color-frame'];         // #5c3317 wood
    const jackSky = semantic['--color-jackpot-sky'];   // #0d1b3e

    type Pair = { fg: string; bg: string; minRatio: number; label: string };

    const pairs: Pair[] = [
      // Normal text (≥4.5:1)
      { fg: text,    bg: bg,      minRatio: 4.5, label: 'text/bg' },
      { fg: text,    bg: surface, minRatio: 4.5, label: 'text/surface' },
      // Muted text — THE FIX: was 4.06 on frame, now ~5.21
      { fg: muted,   bg: frame,   minRatio: 4.5, label: 'muted/frame' },
      { fg: muted,   bg: surface, minRatio: 4.5, label: 'muted/surface' },
      { fg: muted,   bg: bg,      minRatio: 4.5, label: 'muted/bg' },
      // Coin (gold) on bark surface
      { fg: coin,    bg: surface, minRatio: 4.5, label: 'coin/surface' },
      // Accent (campfire orange): large/display text ≥3.0 on surface
      { fg: accent,  bg: surface, minRatio: 3.0, label: 'accent/surface (large display)' },
      // Accent on night background (spin-btn background is accent; text inside is bg)
      // We check bg-on-accent (night text on campfire) — equivalent ratio
      { fg: accent,  bg: bg,      minRatio: 4.5, label: 'accent/bg' },
      // Jackpot text on jackpot-sky
      { fg: jackpot, bg: jackSky, minRatio: 4.5, label: 'jackpot/jackpot-sky' },
    ];

    for (const { fg, bg: background, minRatio, label } of pairs) {
      const ratio = contrast(fg, background);
      expect(ratio, `${label}: contrast ${ratio.toFixed(2)} < ${minRatio}`).toBeGreaterThanOrEqual(minRatio);
    }
  });

  it('the muted fix is load-bearing — old value fails muted/frame ≥ 4.5', () => {
    // Confirm the OLD muted (#b89a6e) on frame (#5c3317) is below 4.5.
    // If it weren't, the guard would be vacuous.
    const oldMuted  = '#b89a6e';
    const frameHex  = semantic['--color-frame'];
    const ratio = contrast(oldMuted, frameHex);
    expect(ratio).toBeLessThan(4.5);
  });
});
