// Machine-metrics simulator (STAGE-008 / SPEC-044).
// A pure, deterministic Monte-Carlo measurement of a machine's math slice: RTP,
// hit-frequency, and win-tier distribution over N seeded spins through the real engine.
// DEC-001 (engine-no-dom): imports only the engine — no React/DOM. DEC-002: all
// randomness flows through createRng(seed), so the whole run reproduces from one seed.
// This is a developer/tuning tool (SPEC-045 consumes it); it is deliberately NOT part of
// the UI's public engine interface (src/engine/index.ts).
import { spin } from './index';
import type { MachineMath, BetLevel, WinTier } from './index';
import { createRng } from './rng';

export interface MachineMetrics {
  spins: number;
  bet: number;
  totalWagered: number;
  totalReturned: number;
  /** totalReturned / totalWagered — 1.0 means break-even. */
  rtp: number;
  hits: number;
  /** hits / spins — fraction of spins that returned any win. */
  hitFrequency: number;
  tierCounts: Record<WinTier, number>;
  tierFrequency: Record<WinTier, number>;
  maxWin: number;
  jackpots: number;
  jackpotRate: number;
}

export interface SimulateOptions {
  spins?: number;
  bet?: BetLevel;
  seed?: number;
}

const DEFAULT_SPINS = 100_000;
const DEFAULT_SEED = 0x5eed; // 24301

/** Measure a machine's math slice over `opts.spins` deterministic seeded spins. */
export function simulateMachine(math: MachineMath, opts: SimulateOptions = {}): MachineMetrics {
  const spins = opts.spins ?? DEFAULT_SPINS;
  const bet = opts.bet ?? math.defaultBet;
  const seedStream = createRng(opts.seed ?? DEFAULT_SEED);

  const tierCounts: Record<WinTier, number> = { none: 0, small: 0, big: 0, jackpot: 0 };
  let totalReturned = 0;
  let hits = 0;
  let maxWin = 0;
  let jackpots = 0;

  for (let i = 0; i < spins; i++) {
    // Derive each spin's seed from the stream — well-distributed and reproducible.
    const seed = Math.floor(seedStream() * 0x1_0000_0000);
    // balance === bet: exactly affordable, so the spin always runs; balance is irrelevant to RTP.
    const r = spin({ seed, balance: bet, bet, machine: math });
    if (!r.ok) continue; // unreachable (bet is affordable), but keeps the type narrow
    totalReturned += r.totalWin;
    if (r.totalWin > 0) hits++;
    if (r.totalWin > maxWin) maxWin = r.totalWin;
    tierCounts[r.tier] += 1;
    if (r.tier === 'jackpot') jackpots += 1;
  }

  const totalWagered = spins * bet;
  const freq = (n: number): number => n / spins;
  return {
    spins,
    bet,
    totalWagered,
    totalReturned,
    rtp: totalReturned / totalWagered,
    hits,
    hitFrequency: freq(hits),
    tierCounts,
    tierFrequency: {
      none: freq(tierCounts.none),
      small: freq(tierCounts.small),
      big: freq(tierCounts.big),
      jackpot: freq(tierCounts.jackpot),
    },
    maxWin,
    jackpots,
    jackpotRate: freq(jackpots),
  };
}
