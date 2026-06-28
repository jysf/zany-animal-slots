// Compositor-only keyframe guard for SPEC-034 (perf-60fps).
//
// Validates DEC-004's structural promise: every @keyframes block in the UI
// animates only GPU-compositable properties (transform, opacity, filter).
// A property like width/height/top/left would trigger a layout or paint step
// on the main thread and bust the 60fps target.
//
// Uses Node fs walk (same pattern as reduced-motion.contract.test.tsx /
// reels.animation.test.ts) — no import.meta.glob needed.
import { readFileSync, readdirSync, statSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC_ROOT = resolve(__dirname, '..');

/** Recursively collect all *.css paths under a directory. */
function walkCss(dir: string): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      results.push(...walkCss(full));
    } else if (entry.endsWith('.css')) {
      results.push(full);
    }
  }
  return results;
}

/**
 * Extract all animated property names from a CSS string.
 *
 * Strategy:
 *   1. Find every @keyframes block (match outer braces).
 *   2. Inside each block find every percentage/from/to step body `{ … }`.
 *   3. Within each step body extract property names via /([a-z-]+)\s*:/g.
 *
 * Returns an array of { file, prop } violations where prop is not in ALLOWED.
 * (When `file` is the empty string the caller is checking an inline sample.)
 */
const ALLOWED = new Set(['transform', 'opacity', 'filter']);

interface Violation {
  file: string;
  keyframe: string;
  prop: string;
}

function extractKeyframeViolations(css: string, file: string): Violation[] {
  const violations: Violation[] = [];

  // Match each @keyframes block. We use a brace-counting approach rather than
  // a greedy regex to handle nested braces inside step bodies correctly.
  const keyframesRe = /@keyframes\s+([\w-]+)\s*\{/g;
  let match: RegExpExecArray | null;

  while ((match = keyframesRe.exec(css)) !== null) {
    const keyframeName = match[1];
    const blockStart = match.index + match[0].length;

    // Walk forward counting braces to find the matching closing `}`.
    let depth = 1;
    let i = blockStart;
    while (i < css.length && depth > 0) {
      if (css[i] === '{') depth++;
      else if (css[i] === '}') depth--;
      i++;
    }
    const blockBody = css.slice(blockStart, i - 1); // content between outer braces

    // Within the keyframe block find each step body `{ … }`.
    const stepBodyRe = /\{([^}]*)\}/g;
    let stepMatch: RegExpExecArray | null;

    while ((stepMatch = stepBodyRe.exec(blockBody)) !== null) {
      const stepBody = stepMatch[1];

      // Extract property names from declarations inside the step.
      const propRe = /([a-z-]+)\s*:/g;
      let propMatch: RegExpExecArray | null;

      while ((propMatch = propRe.exec(stepBody)) !== null) {
        const prop = propMatch[1];
        if (!ALLOWED.has(prop)) {
          violations.push({ file, keyframe: keyframeName, prop });
        }
      }
    }
  }

  return violations;
}

describe('perf contract (SPEC-034)', () => {
  it('every keyframe animates only compositor-friendly properties', () => {
    const allCss = walkCss(SRC_ROOT);
    const keyframeFiles: string[] = [];

    for (const filePath of allCss) {
      const source = readFileSync(filePath, 'utf-8');
      if (!source.includes('@keyframes')) continue;

      keyframeFiles.push(filePath);
      const violations = extractKeyframeViolations(source, filePath);

      for (const v of violations) {
        // Provide an actionable failure message.
        expect.fail(
          `Non-compositor property "${v.prop}" found in @keyframes ${v.keyframe} in ${v.file}. ` +
            `Only transform, opacity, filter are allowed (DEC-004 / perf-60fps).`,
        );
      }
    }

    // Guard: we must have swept at least 5 keyframe-bearing files
    // (reels.css, win-badge.css, particles.css, jackpot.css, paytable.css).
    expect(
      keyframeFiles.length,
      `Expected at least 5 CSS files with @keyframes; found ${keyframeFiles.length}`,
    ).toBeGreaterThanOrEqual(5);
  });

  it('the guard is load-bearing', () => {
    // Prove the extraction helper is not vacuous: an inline keyframe that
    // animates `height` (a layout-triggering property) MUST be caught.
    const badCss = '@keyframes bad { from { height: 0 } to { height: 100px } }';
    const violations = extractKeyframeViolations(badCss, '');

    expect(violations.length).toBeGreaterThan(0);
    expect(violations.some((v) => v.prop === 'height')).toBe(true);
  });

  it('the spin animation has a compositor hint', () => {
    // .reel--spinning must declare will-change: transform (SPEC-034, DEC-004).
    const reelsCssPath = resolve(__dirname, 'reels/reels.css');
    const source = readFileSync(reelsCssPath, 'utf-8');

    // Find the .reel--spinning rule block.
    const ruleMatch = /\.reel--spinning\s*\{([^}]*)\}/s.exec(source);
    expect(
      ruleMatch,
      '.reel--spinning rule not found in reels.css',
    ).not.toBeNull();

    const ruleBody = ruleMatch![1];
    expect(
      ruleBody,
      '.reel--spinning must contain will-change with transform',
    ).toMatch(/will-change\s*:[^;]*transform/);
  });
});
