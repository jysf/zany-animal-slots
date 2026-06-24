// useSlotMachine — spin-flow hook (SPEC-013, extended SPEC-014, SPEC-015, SPEC-016).
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
// SPEC-016: spin() is now timed. It computes the engine outcome immediately, enters
// status 'spinning' (reveal not applied yet), then after SPIN_DURATION_MS applies
// the outcome and returns to 'idle'. Re-entrant spins are a no-op. The timer is
// cleared on unmount so there are no act-warning / state-update-after-unmount leaks.
import { useState, useCallback, useEffect, useRef } from 'react';
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

// How long the reel-spin animation plays before the outcome is revealed.
// Exported so tests can advance fake timers by exactly this value.
export const SPIN_DURATION_MS = 700;

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
  status: 'idle' | 'spinning' | 'resolved';
  isSpinning: boolean;
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
  const [status, setStatus] = useState<'idle' | 'spinning' | 'resolved'>('idle');

  // Ref holding the pending reveal timer so we can cancel it on unmount.
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear the timer on unmount so there are no state-update-after-unmount warnings.
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  // Persist balance to localStorage whenever it changes.
  useEffect(() => {
    writeBalance(balance);
  }, [balance]);

  const reset = useCallback(() => {
    setBalance(STARTING_BALANCE);
  }, []);

  // canSpin: false while spinning (status guard) or when balance can't cover the bet.
  const isSpinable = status !== 'spinning' && canAfford(balance, bet);

  // canIncreaseBet: only when nextBet would actually step up AND balance can cover it.
  // nextBet clamps at 50 so nextBet(bet) === bet means we're already at the top.
  const canIncreaseBet = nextBet(bet) !== bet && canAfford(balance, nextBet(bet));

  // canDecreaseBet: only when prevBet would actually step down.
  // prevBet clamps at 10 so prevBet(bet) === bet means we're already at the floor.
  const canDecreaseBet = prevBet(bet) !== bet;

  const spin = useCallback(() => {
    // Re-entrant guard: if already spinning, ignore.
    if (status === 'spinning') return;
    if (!canAfford(balance, bet)) return;

    // Compute the full engine outcome immediately (the engine owns the result;
    // the UI only delays the reveal — DEC-001).
    const outcome = engineSpin({ seed: nextSeed(), balance, bet });
    if (!outcome.ok) return;

    // Enter the spinning state now — controls freeze, animation starts.
    setStatus('spinning');

    // After the animation duration, reveal the outcome and return to idle.
    timerRef.current = setTimeout(() => {
      setGrid(outcome.grid);
      setBalance(outcome.balance);
      setLineWins(outcome.lineWins);
      setTier(outcome.tier);
      setStatus('resolved');
      timerRef.current = null;
    }, SPIN_DURATION_MS);
  }, [balance, bet, nextSeed, status]);

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
    isSpinning: status === 'spinning',
    canSpin: isSpinable,
    spin,
    canIncreaseBet,
    canDecreaseBet,
    increaseBet,
    decreaseBet,
    reset,
  };
}
