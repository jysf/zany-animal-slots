import { describe, it, expect } from 'vitest';
import { WILD_AND_WHIMSICAL } from './wildAndWhimsical';
import {
  SYMBOLS,
  SYMBOL_TIER,
  REEL_WEIGHTS,
  REEL_COUNT,
  REEL_STRIP,
  STRIPS,
} from '../engine/strips';
import { PAYLINES, PAYTABLE } from '../engine/paylines';
import { BET_LEVELS, DEFAULT_BET, STARTING_BALANCE } from '../engine/balance';
import { SYMBOL_DISPLAY } from '../ui/reels/symbols';
import { CHANNEL_GAINS } from '../ui/audio/audioEngine';
import { MIX } from '../ui/audio/mixer';

const { math, presentation } = WILD_AND_WHIMSICAL;

describe('SPEC-038 default machine parity — extracted data == current constants', () => {
  it('identity', () => {
    expect(WILD_AND_WHIMSICAL.id).toBe('wild-and-whimsical');
    expect(WILD_AND_WHIMSICAL.name).toBe('Wild & Whimsical');
  });

  it('symbols + tiers + weights', () => {
    expect(math.symbols).toEqual(SYMBOLS);
    expect(math.symbolTier).toEqual(SYMBOL_TIER);
    expect(math.reelWeights).toEqual(REEL_WEIGHTS);
  });

  it('reel geometry + strips', () => {
    expect(math.reelCount).toBe(REEL_COUNT);
    expect(math.reelCount).toBe(5);
    expect(math.rows).toBe(3);
    expect(math.strips).toEqual(STRIPS);
    expect(math.strips).toHaveLength(5);
    for (const strip of math.strips) {
      expect(strip).toEqual(REEL_STRIP);
      expect(strip).toHaveLength(42);
    }
  });

  it('paylines + paytable', () => {
    expect(math.paylines).toEqual(PAYLINES);
    expect(math.paytable).toEqual(PAYTABLE);
  });

  it('jackpot rule + tier boundary', () => {
    expect(math.jackpot).toEqual({ symbol: 'WOLF', count: 5 });
    expect(math.tiers).toEqual({ bigMultiple: 5 });
  });

  it('bet levels + starting balance', () => {
    expect(math.betLevels).toEqual(BET_LEVELS);
    expect(math.defaultBet).toBe(DEFAULT_BET);
    expect(math.startingBalance).toBe(STARTING_BALANCE);
    expect(math.startingBalance).toBe(1000);
  });

  it('presentation symbolDisplay', () => {
    expect(presentation.symbolDisplay).toEqual(SYMBOL_DISPLAY);
    // SPEC-065: Wild & Whimsical's identity is now a bright, whimsical menagerie (unicorn jackpot).
    expect(presentation.symbolDisplay.WOLF.label).toBe('Unicorn');
    expect(presentation.symbolDisplay.DEER.label).toBe('Frog');
  });

  it("the default machine's audio equals today's engine/audio constants", () => {
    expect(presentation.audio.channelGains).toEqual(CHANNEL_GAINS);
    expect(presentation.audio.mix).toEqual(MIX);
    expect(presentation.audio.music).toEqual({
      chord: ['C3', 'G3', 'C4', 'E4'],
      noteDuration: '2n',
      loopInterval: '2m',
    });
  });

  it('has its own whimsical theme (SPEC-068 facelift — no longer the dull default)', () => {
    // Was `theme: {}` (defer to the campfire tokens.css). SPEC-068 gives Wild & Whimsical its own
    // bright magical-plum palette, like the other machines (DEC-021).
    const theme = presentation.theme;
    expect(theme).not.toEqual({});
    for (const key of ['--color-bg', '--color-text', '--color-accent'] as const) {
      expect(theme[key]).toMatch(/^#[0-9a-f]{6}$/i);
    }

    // Accessibility: text-on-bg must clear WCAG AA (≥ 4.5:1). Inline sRGB→luminance helper, no dep
    // (mirrors arctic.test.ts).
    const lum = (hex: string): number => {
      const n = parseInt(hex.slice(1), 16);
      const chan = (c: number) => {
        const s = c / 255;
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
      };
      return (
        0.2126 * chan((n >> 16) & 255) +
        0.7152 * chan((n >> 8) & 255) +
        0.0722 * chan(n & 255)
      );
    };
    const lt = lum(theme['--color-text'] as string);
    const lb = lum(theme['--color-bg'] as string);
    const ratio = (Math.max(lt, lb) + 0.05) / (Math.min(lt, lb) + 0.05);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it('structural completeness — every symbol has a tier, weight, and display', () => {
    for (const s of math.symbols) {
      expect(math.symbolTier[s]).toBeDefined();
      expect(math.reelWeights[s]).toBeGreaterThan(0);
      expect(presentation.symbolDisplay[s]).toBeDefined();
    }
    const sum = Object.values(math.reelWeights).reduce((a, b) => a + b, 0);
    expect(sum).toBe(42);
    expect(sum).toBe(REEL_STRIP.length);
  });
});
