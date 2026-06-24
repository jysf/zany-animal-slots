// useSlotMachine — spin-flow hook (SPEC-013, extended SPEC-014, SPEC-015).
// Holds grid/balance/bet/lineWins/tier/status state and wires the Spin action to
// the engine's spin(). All randomness in the UI (the seed generator) is injectable
// so tests can pin outcomes deterministically (DEC-002). The engine owns outcomes;
// the hook only passes args and applies the result (DEC-001). An unaffordable spin
// is a silent no-op — never throws (DEC-005).
// SPEC-014: bet is now stateful; increaseBet/decreaseBet step via engine
// nextBet/prevBet; canIncreaseBet guards affordable raises (DEC-005).
// SPEC-015: balance is persisted to localStorage on every change; rehydrated on
// init; reset() restores STARTING_BALANCE (DEC-005). opts.initialBalance still
// takes precedence (useful for tests that need a specific starting balance).
import { useState, useCallback, useEffect } from 'react';
import {
  spin as engineSpin,
  STARTING_BALANCE,
  DEFAULT_BET,
  canAfford,
  nextBet,
  prevBet,
} from '../engine/index';
import type { Grid, BetLevel, LineWin, WinTier } from '../engine/index';
import { INITIAL_GRID } from './reels/symbols';
import { readBalance, writeBalance } from './storage';

// Module-level default seed generator: a simple additive hash seeded once from
// Date.now(). Injectable in tests via opts.nextSeed (DEC-002).
let _s = Date.now() | 0;
const _defaultNextSeed = (): number => {
  _s = (_s + 0x9e3779b1) | 0;
  return _s;
};

export interface UseSlotMachineResult {
  grid: Grid;
  balance: number;
  bet: BetLevel;
  lineWins: LineWin[];
  tier: WinTier;
  status: 'idle' | 'resolved';
  canSpin: boolean;
  spin: () => void;
  canIncreaseBet: boolean;
  canDecreaseBet: boolean;
  increaseBet: () => void;
  decreaseBet: () => void;
  reset: () => void;
}

export interface UseSlotMachineOpts {
  initialBalance?: number;
  nextSeed?: () => number;
}

export function useSlotMachine(opts?: UseSlotMachineOpts): UseSlotMachineResult {
  const nextSeed = opts?.nextSeed ?? _defaultNextSeed;

  const [grid, setGrid] = useState<Grid>(INITIAL_GRID);
  // Init: explicit opts.initialBalance (used in tests) → persisted value → default.
  const [balance, setBalance] = useState<number>(
    () => opts?.initialBalance ?? readBalance() ?? STARTING_BALANCE,
  );
  const [bet, setBet] = useState<BetLevel>(DEFAULT_BET);
  const [lineWins, setLineWins] = useState<LineWin[]>([]);
  const [tier, setTier] = useState<WinTier>('none');
  const [status, setStatus] = useState<'idle' | 'resolved'>('idle');

  // Persist balance to localStorage whenever it changes.
  useEffect(() => {
    writeBalance(balance);
  }, [balance]);

  const reset = useCallback(() => {
    setBalance(STARTING_BALANCE);
  }, []);

  const isSpinable = canAfford(balance, bet);

  // canIncreaseBet: only when nextBet would actually step up AND balance can cover it.
  // nextBet clamps at 50 so nextBet(bet) === bet means we're already at the top.
  const canIncreaseBet = nextBet(bet) !== bet && canAfford(balance, nextBet(bet));

  // canDecreaseBet: only when prevBet would actually step down.
  // prevBet clamps at 10 so prevBet(bet) === bet means we're already at the floor.
  const canDecreaseBet = prevBet(bet) !== bet;

  const spin = useCallback(() => {
    if (!canAfford(balance, bet)) return;
    const outcome = engineSpin({ seed: nextSeed(), balance, bet });
    if (outcome.ok) {
      setGrid(outcome.grid);
      setBalance(outcome.balance);
      setLineWins(outcome.lineWins);
      setTier(outcome.tier);
      setStatus('resolved');
    }
  }, [balance, bet, nextSeed]);

  const increaseBet = useCallback(() => {
    if (!canIncreaseBet) return;
    setBet(nextBet(bet));
  }, [bet, canIncreaseBet]);

  const decreaseBet = useCallback(() => {
    if (!canDecreaseBet) return;
    setBet(prevBet(bet));
  }, [bet, canDecreaseBet]);

  return {
    grid,
    balance,
    bet,
    lineWins,
    tier,
    status,
    canSpin: isSpinable,
    spin,
    canIncreaseBet,
    canDecreaseBet,
    increaseBet,
    decreaseBet,
    reset,
  };
}
