// useSlotMachine — spin-flow hook (SPEC-013).
// Holds grid/balance/bet/lineWins/tier/status state and wires the Spin action to
// the engine's spin(). All randomness in the UI (the seed generator) is injectable
// so tests can pin outcomes deterministically (DEC-002). The engine owns outcomes;
// the hook only passes args and applies the result (DEC-001). An unaffordable spin
// is a silent no-op — never throws (DEC-005).
import { useState, useCallback } from 'react';
import {
  spin as engineSpin,
  STARTING_BALANCE,
  DEFAULT_BET,
  canAfford,
} from '../engine/index';
import type { Grid, BetLevel, LineWin, WinTier } from '../engine/index';
import { INITIAL_GRID } from './reels/symbols';

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
}

export interface UseSlotMachineOpts {
  initialBalance?: number;
  nextSeed?: () => number;
}

export function useSlotMachine(opts?: UseSlotMachineOpts): UseSlotMachineResult {
  const nextSeed = opts?.nextSeed ?? _defaultNextSeed;

  const [grid, setGrid] = useState<Grid>(INITIAL_GRID);
  const [balance, setBalance] = useState<number>(opts?.initialBalance ?? STARTING_BALANCE);
  const [bet] = useState<BetLevel>(DEFAULT_BET);
  const [lineWins, setLineWins] = useState<LineWin[]>([]);
  const [tier, setTier] = useState<WinTier>('none');
  const [status, setStatus] = useState<'idle' | 'resolved'>('idle');

  const isSpinable = canAfford(balance, bet);

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

  return {
    grid,
    balance,
    bet,
    lineWins,
    tier,
    status,
    canSpin: isSpinable,
    spin,
  };
}
