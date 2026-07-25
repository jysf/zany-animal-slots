// Farm machine tests (SPEC-090, DEC-026): registration, vocabulary parity, HIGH-VARIANCE
// metrics-sanity, strip integrity, distinctness from the other four machines, and theme
// accessibility. Plain Vitest, no DOM/JSX — jsdom provides localStorage for getActiveMachine.
import { FARM } from './farm';
import { OCEAN } from './ocean';
import { DESERT } from './desert';
import { ARCTIC } from './arctic';
import { WILD_AND_WHIMSICAL } from './wildAndWhimsical';
import { getMachine, listMachines, getActiveMachine } from './registry';
import { SYMBOLS } from '../engine/index';
import { simulateMachine } from '../engine/metrics';
import { SYMBOL_DISPLAY } from '../ui/reels/symbols';

describe('Farm machine', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('Farm is registered and resolvable; the default machine is unchanged', () => {
    expect(getMachine('farm')).toBe(FARM);
    expect(listMachines()).toContain(FARM);
    expect(listMachines().length).toBeGreaterThanOrEqual(5);
    expect(getActiveMachine()).toBe(WILD_AND_WHIMSICAL);
  });

  it('Farm keeps the 8 engine symbols but gives them a barnyard identity', () => {
    expect(FARM.math.symbols).toEqual(SYMBOLS);
    expect(FARM.presentation.symbolDisplay).not.toBe(SYMBOL_DISPLAY);
    expect(Object.keys(FARM.presentation.symbolDisplay).sort()).toEqual([...SYMBOLS].sort());
    expect(FARM.presentation.symbolDisplay.WOLF.label).toBe('Tractor'); // the jackpot slot
    expect(FARM.presentation.symbolDisplay.DEER.label).toBe('Chicken');
  });

  it("Farm's math measures as HIGH-VARIANCE (low hit-frequency, ~94% RTP)", () => {
    const m = simulateMachine(FARM.math, { spins: 20000, seed: 1 });
    // RTP band is wide on purpose — high variance makes the estimate noisy across seeds.
    expect(m.rtp).toBeGreaterThanOrEqual(0.85);
    expect(m.rtp).toBeLessThanOrEqual(1.02);
    // The defining trait: distinctly FEWER hits than the steady machines (Ocean ~0.37).
    expect(m.hitFrequency).toBeGreaterThanOrEqual(0.2);
    expect(m.hitFrequency).toBeLessThanOrEqual(0.28);
    expect(FARM.math.jackpot).toEqual({ symbol: 'WOLF', count: 5 });
  });

  it("Farm's strip is count-exact with no adjacent duplicates", () => {
    const s = FARM.math.strips[0];
    expect(s.length).toBe(42);
    for (let i = 0; i < s.length - 1; i++) {
      expect(s[i]).not.toBe(s[i + 1]);
    }
    const tally: Record<string, number> = {};
    for (const sym of s) tally[sym] = (tally[sym] ?? 0) + 1;
    expect(tally).toEqual(FARM.math.reelWeights);
    expect(FARM.math.strips.every((r) => r === s)).toBe(true);
  });

  it('Farm is distinct from all four other machines', () => {
    for (const other of [WILD_AND_WHIMSICAL, ARCTIC, DESERT, OCEAN]) {
      expect(FARM.math.paytable).not.toEqual(other.math.paytable);
      expect(FARM.math.reelWeights).not.toEqual(other.math.reelWeights);
      expect(FARM.presentation.audio.music.chord).not.toEqual(other.presentation.audio.music.chord);
    }
    expect(FARM.presentation.theme).not.toEqual({});
  });

  it("Farm's theme is accessible (text on bg >= WCAG AA)", () => {
    const hexToRgb = (hex: string): [number, number, number] => {
      const c = hex.replace('#', '');
      return [parseInt(c.slice(0, 2), 16), parseInt(c.slice(2, 4), 16), parseInt(c.slice(4, 6), 16)];
    };
    const ch = (c: number): number => {
      const cs = c / 255;
      return cs <= 0.03928 ? cs / 12.92 : Math.pow((cs + 0.055) / 1.055, 2.4);
    };
    const lum = (hex: string): number => {
      const [r, g, b] = hexToRgb(hex);
      return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b);
    };
    const ratio = (a: string, b: string): number => {
      const [la, lb] = [lum(a), lum(b)];
      return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
    };
    const text = FARM.presentation.theme['--color-text'] as string;
    const bg = FARM.presentation.theme['--color-bg'] as string;
    expect(ratio(text, bg)).toBeGreaterThanOrEqual(4.5);
  });
});
