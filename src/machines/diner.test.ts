// Diner machine tests (SPEC-091, DEC-027): registration, vocabulary parity, GENEROUS
// metrics-sanity, strip integrity, distinctness from the other five machines, and theme
// accessibility. Plain Vitest, no DOM/JSX — jsdom provides localStorage for getActiveMachine.
import { DINER } from './diner';
import { FARM } from './farm';
import { OCEAN } from './ocean';
import { DESERT } from './desert';
import { ARCTIC } from './arctic';
import { WILD_AND_WHIMSICAL } from './wildAndWhimsical';
import { getMachine, listMachines, getActiveMachine } from './registry';
import { SYMBOLS } from '../engine/index';
import { simulateMachine } from '../engine/metrics';
import { SYMBOL_DISPLAY } from '../ui/reels/symbols';

describe('Diner machine', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('Diner is registered and resolvable; the default machine is unchanged', () => {
    expect(getMachine('diner')).toBe(DINER);
    expect(listMachines()).toContain(DINER);
    expect(listMachines().length).toBeGreaterThanOrEqual(6);
    expect(getActiveMachine()).toBe(WILD_AND_WHIMSICAL);
  });

  it('Diner keeps the 8 engine symbols but gives them a food-and-drink identity', () => {
    expect(DINER.math.symbols).toEqual(SYMBOLS);
    expect(DINER.presentation.symbolDisplay).not.toBe(SYMBOL_DISPLAY);
    expect(Object.keys(DINER.presentation.symbolDisplay).sort()).toEqual([...SYMBOLS].sort());
    expect(DINER.presentation.symbolDisplay.WOLF.label).toBe('Birthday Cake'); // the jackpot slot
    expect(DINER.presentation.symbolDisplay.DEER.label).toBe('Pizza');
  });

  it("Diner's math measures as GENEROUS (highest hit-frequency, ~95% RTP)", () => {
    const m = simulateMachine(DINER.math, { spins: 20000, seed: 1 });
    // Unlike Farm's (DEC-026) deliberately wide band, Diner's RTP band is TIGHT: low variance
    // measures quietly (94.77–95.19% across six 200k-spin seeds; 93.6–96.9% at this 20k count).
    // A band this narrow is a real guard — the tuning iterations that measured 87.5% and 105%
    // both fail it.
    expect(m.rtp).toBeGreaterThanOrEqual(0.92);
    expect(m.rtp).toBeLessThanOrEqual(0.99);
    // The defining trait: hits land on nearly HALF of spins — more often than any other machine
    // (Ocean, the previous high, is ~0.376).
    expect(m.hitFrequency).toBeGreaterThanOrEqual(0.43);
    expect(m.hitFrequency).toBeLessThanOrEqual(0.47);
    expect(m.hitFrequency).toBeGreaterThan(
      simulateMachine(OCEAN.math, { spins: 20000, seed: 1 }).hitFrequency,
    );
    // Generous means FREQUENT, not BIG: the big-win share stays in the roster's normal range
    // even though wins land twice as often as on Farm (~0.067).
    expect(m.tierFrequency.big).toBeLessThanOrEqual(0.055);
    expect(DINER.math.jackpot).toEqual({ symbol: 'WOLF', count: 5 });
  });

  it("Diner's strip is count-exact with no adjacent duplicates", () => {
    const s = DINER.math.strips[0];
    expect(s.length).toBe(42);
    for (let i = 0; i < s.length - 1; i++) {
      expect(s[i]).not.toBe(s[i + 1]);
    }
    const tally: Record<string, number> = {};
    for (const sym of s) tally[sym] = (tally[sym] ?? 0) + 1;
    expect(tally).toEqual(DINER.math.reelWeights);
    expect(DINER.math.strips.every((r) => r === s)).toBe(true);
  });

  it('Diner is distinct from all five other machines', () => {
    for (const other of [WILD_AND_WHIMSICAL, ARCTIC, DESERT, OCEAN, FARM]) {
      expect(DINER.math.paytable).not.toEqual(other.math.paytable);
      expect(DINER.math.reelWeights).not.toEqual(other.math.reelWeights);
      expect(DINER.presentation.audio.music.chord).not.toEqual(other.presentation.audio.music.chord);
    }
    expect(DINER.presentation.theme).not.toEqual({});
  });

  it("Diner's theme is accessible (text on bg >= WCAG AA)", () => {
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
    const bg = DINER.presentation.theme['--color-bg'] as string;
    expect(ratio(DINER.presentation.theme['--color-text'] as string, bg)).toBeGreaterThanOrEqual(4.5);
    // Every foreground token, not just body text — the warm palette's mid tones are the risk.
    const foregrounds = [
      '--color-text-muted',
      '--color-accent',
      '--color-coin',
      '--color-win-small',
      '--color-win-big',
      '--color-jackpot',
    ] as const;
    for (const key of foregrounds) {
      expect(ratio(DINER.presentation.theme[key] as string, bg)).toBeGreaterThanOrEqual(4.5);
    }
  });
});
