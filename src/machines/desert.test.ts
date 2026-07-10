// Desert machine tests (SPEC-052): registration, vocabulary parity, measured metrics-sanity,
// strip integrity, distinctness from Wild & Whimsical AND Arctic, and theme accessibility.
// Plain Vitest, no DOM/JSX — jsdom (global test env) provides localStorage for getActiveMachine.
import { DESERT } from './desert';
import { ARCTIC } from './arctic';
import { WILD_AND_WHIMSICAL } from './wildAndWhimsical';
import { getMachine, listMachines, getActiveMachine } from './registry';
import { SYMBOLS } from '../engine/index';
import { simulateMachine } from '../engine/metrics';
import { SYMBOL_DISPLAY } from '../ui/reels/symbols';

describe('Desert machine', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('Desert is registered and resolvable, default unchanged', () => {
    expect(getMachine('desert')).toBe(DESERT);
    expect(listMachines()).toContain(DESERT);
    expect(listMachines().length).toBeGreaterThanOrEqual(3);
    expect(getActiveMachine()).toBe(WILD_AND_WHIMSICAL);
  });

  it('Desert keeps the 8 engine symbols but themes their display', () => {
    expect(DESERT.math.symbols).toEqual(SYMBOLS);
    // Per-machine identity (DEC-021, supersedes DEC-018's shared-vocabulary clause): Desert renders
    // its own arid creatures, NOT the shared SYMBOL_DISPLAY.
    expect(DESERT.presentation.symbolDisplay).not.toBe(SYMBOL_DISPLAY);
    expect(Object.keys(DESERT.presentation.symbolDisplay).sort()).toEqual([...SYMBOLS].sort());
    expect(DESERT.presentation.symbolDisplay.WOLF.label).toBe('Sidewinder');
  });

  it("Desert's math measures in the generous RTP band", () => {
    const m = simulateMachine(DESERT.math, { spins: 20000, seed: 1 });
    expect(m.rtp).toBeGreaterThanOrEqual(0.85);
    expect(m.rtp).toBeLessThanOrEqual(1.02);
    expect(m.hitFrequency).toBeGreaterThanOrEqual(0.24);
    expect(m.hitFrequency).toBeLessThanOrEqual(0.32);
    expect(DESERT.math.jackpot).toEqual({ symbol: 'WOLF', count: 5 });
  });

  it("Desert's strip is count-exact with no adjacent duplicates", () => {
    const s = DESERT.math.strips[0];
    expect(s.length).toBe(42);

    for (let i = 0; i < s.length - 1; i++) {
      expect(s[i]).not.toBe(s[i + 1]);
    }

    const tally: Record<string, number> = {};
    for (const sym of s) {
      tally[sym] = (tally[sym] ?? 0) + 1;
    }
    expect(tally).toEqual(DESERT.math.reelWeights);

    expect(DESERT.math.strips.every((r) => r === s)).toBe(true);
  });

  it('Desert is distinct from Wild & Whimsical and Arctic', () => {
    expect(DESERT.math.paytable).not.toEqual(WILD_AND_WHIMSICAL.math.paytable);
    expect(DESERT.math.paytable).not.toEqual(ARCTIC.math.paytable);
    expect(DESERT.math.reelWeights).not.toEqual(WILD_AND_WHIMSICAL.math.reelWeights);
    expect(DESERT.math.reelWeights).not.toEqual(ARCTIC.math.reelWeights);
    expect(DESERT.presentation.theme).not.toEqual({});
    expect(DESERT.presentation.audio.music.chord).not.toEqual(
      WILD_AND_WHIMSICAL.presentation.audio.music.chord,
    );
    expect(DESERT.presentation.audio.music.chord).not.toEqual(ARCTIC.presentation.audio.music.chord);
  });

  it('Desert\'s theme is accessible (text on bg >= AA)', () => {
    // Small inline WCAG contrast helper: sRGB hex -> relative luminance -> contrast ratio.
    // No dependency (per spec notes).
    const hexToRgb = (hex: string): [number, number, number] => {
      const clean = hex.replace('#', '');
      const r = parseInt(clean.slice(0, 2), 16);
      const g = parseInt(clean.slice(2, 4), 16);
      const b = parseInt(clean.slice(4, 6), 16);
      return [r, g, b];
    };

    const channelLuminance = (c: number): number => {
      const cs = c / 255;
      return cs <= 0.03928 ? cs / 12.92 : Math.pow((cs + 0.055) / 1.055, 2.4);
    };

    const relativeLuminance = (hex: string): number => {
      const [r, g, b] = hexToRgb(hex);
      return (
        0.2126 * channelLuminance(r) + 0.7152 * channelLuminance(g) + 0.0722 * channelLuminance(b)
      );
    };

    const contrastRatio = (hexA: string, hexB: string): number => {
      const lA = relativeLuminance(hexA);
      const lB = relativeLuminance(hexB);
      const lighter = Math.max(lA, lB);
      const darker = Math.min(lA, lB);
      return (lighter + 0.05) / (darker + 0.05);
    };

    const text = DESERT.presentation.theme['--color-text'];
    const bg = DESERT.presentation.theme['--color-bg'];
    expect(text).toBeTruthy();
    expect(bg).toBeTruthy();

    const ratio = contrastRatio(text as string, bg as string);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });
});
