// Ocean machine tests (SPEC-053): registration, vocabulary parity, measured metrics-sanity,
// strip integrity, distinctness from Wild & Whimsical AND Arctic AND Desert, and theme accessibility.
// Plain Vitest, no DOM/JSX — jsdom (global test env) provides localStorage for getActiveMachine.
import { OCEAN } from './ocean';
import { DESERT } from './desert';
import { ARCTIC } from './arctic';
import { WILD_AND_WHIMSICAL } from './wildAndWhimsical';
import { getMachine, listMachines, getActiveMachine } from './registry';
import { SYMBOLS } from '../engine/index';
import { simulateMachine } from '../engine/metrics';
import { SYMBOL_DISPLAY } from '../ui/reels/symbols';

describe('Ocean machine', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('Ocean is registered and resolvable, default unchanged', () => {
    expect(getMachine('ocean')).toBe(OCEAN);
    expect(listMachines()).toContain(OCEAN);
    expect(listMachines().length).toBeGreaterThanOrEqual(4);
    expect(getActiveMachine()).toBe(WILD_AND_WHIMSICAL);
  });

  it('Ocean keeps the 8-symbol vocabulary', () => {
    expect(OCEAN.math.symbols).toEqual(SYMBOLS);
    expect(OCEAN.presentation.symbolDisplay).toBe(SYMBOL_DISPLAY);
  });

  it("Ocean's math measures in the generous RTP band", () => {
    const m = simulateMachine(OCEAN.math, { spins: 20000, seed: 1 });
    expect(m.rtp).toBeGreaterThanOrEqual(0.88);
    expect(m.rtp).toBeLessThanOrEqual(1.0);
    expect(m.hitFrequency).toBeGreaterThanOrEqual(0.35);
    expect(m.hitFrequency).toBeLessThanOrEqual(0.4);
    expect(OCEAN.math.jackpot).toEqual({ symbol: 'WOLF', count: 5 });
  });

  it("Ocean's strip is count-exact with no adjacent duplicates", () => {
    const s = OCEAN.math.strips[0];
    expect(s.length).toBe(42);

    for (let i = 0; i < s.length - 1; i++) {
      expect(s[i]).not.toBe(s[i + 1]);
    }

    const tally: Record<string, number> = {};
    for (const sym of s) {
      tally[sym] = (tally[sym] ?? 0) + 1;
    }
    expect(tally).toEqual(OCEAN.math.reelWeights);

    expect(OCEAN.math.strips.every((r) => r === s)).toBe(true);
  });

  it('Ocean is distinct from Wild & Whimsical, Arctic, and Desert', () => {
    expect(OCEAN.math.paytable).not.toEqual(WILD_AND_WHIMSICAL.math.paytable);
    expect(OCEAN.math.paytable).not.toEqual(ARCTIC.math.paytable);
    expect(OCEAN.math.paytable).not.toEqual(DESERT.math.paytable);
    expect(OCEAN.math.reelWeights).not.toEqual(WILD_AND_WHIMSICAL.math.reelWeights);
    expect(OCEAN.math.reelWeights).not.toEqual(ARCTIC.math.reelWeights);
    expect(OCEAN.math.reelWeights).not.toEqual(DESERT.math.reelWeights);
    expect(OCEAN.presentation.theme).not.toEqual({});
    expect(OCEAN.presentation.audio.music.chord).not.toEqual(
      WILD_AND_WHIMSICAL.presentation.audio.music.chord,
    );
    expect(OCEAN.presentation.audio.music.chord).not.toEqual(ARCTIC.presentation.audio.music.chord);
    expect(OCEAN.presentation.audio.music.chord).not.toEqual(DESERT.presentation.audio.music.chord);
  });

  it("Ocean's theme is accessible (text on bg >= AA)", () => {
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

    const text = OCEAN.presentation.theme['--color-text'];
    const bg = OCEAN.presentation.theme['--color-bg'];
    expect(text).toBeTruthy();
    expect(bg).toBeTruthy();

    const ratio = contrastRatio(text as string, bg as string);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });
});
