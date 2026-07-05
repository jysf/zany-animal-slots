// useSlotMachine — spin-flow hook (SPEC-013, extended SPEC-014, SPEC-015, SPEC-016, SPEC-017, SPEC-019, SPEC-021).
// Holds grid/balance/bet/lineWins/tier/status/lastWin/celebration state and wires the Spin action to
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
// SPEC-017: auto-spin loop. toggleAutoSpin() starts (or stops) a sequence of
// back-to-back timed spins. Each spin-resolve callback schedules the next spin
// after AUTO_SPIN_DELAY_MS using a ref-based continuation so stale-closure bugs
// are avoided. Auto-spin stops on jackpot, count exhaustion, or !canAfford.
// SPEC-019: lastWin exposes the resolved spin's totalWin (0 on a loss; reset() sets
// it to 0). Presentation uses it for the WinBadge and Status WIN readout (DEC-001).
// SPEC-021: celebration is a one-shot signal — an object { id, tier, totalWin, lineWins }
// with a monotonically incrementing id set at spin resolve on a win; null on no-win or
// after reset(). Consumers key useEffect on celebration?.id to fire exactly once per win.
// SPEC-042: the hook resolves the ACTIVE machine (opts.machine ?? getActiveMachine()) and
// threads it into the engine + its own balance/bet init + reset (DEC-015). The default
// machine's math is today's STARTING_BALANCE/DEFAULT_BET, so behavior is unchanged.
import { useState, useCallback, useEffect, useRef } from 'react';
import { spin as engineSpin, canAfford, nextBet, prevBet } from '../engine/index';
import type { Grid, BetLevel, LineWin, WinTier } from '../engine/index';
import { getActiveMachine } from '../machines/registry';
import type { Machine } from '../machines/types';
import { INITIAL_GRID } from './reels/symbols';
import { readBalance, writeBalance } from './storage';

// How long the reel-spin animation plays before the outcome is revealed.
// Exported so tests can advance fake timers by exactly this value.
export const SPIN_DURATION_MS = 700;

// Number of spins in a single auto-spin run.
export const AUTO_SPIN_COUNT = 10;

// Delay between the reveal of one auto-spin and the start of the next.
export const AUTO_SPIN_DELAY_MS = 400;

// Module-level default seed generator: a simple additive hash seeded once from
// Date.now(). Injectable in tests via opts.nextSeed (DEC-002).
let _s = Date.now() | 0;
const _defaultNextSeed = (): number => {
  _s = (_s + 0x9e3779b1) | 0;
  return _s;
};

/** One-shot win signal set at spin resolve. id strictly increases per win;
 *  null on no-win or after reset(). Consumers key useEffect on celebration?.id
 *  to fire exactly once per resolved win (SPEC-021). */
export interface Celebration {
  id: number;
  tier: WinTier;       // 'small' | 'big' | 'jackpot' — never 'none', only set on a win
  totalWin: number;    // > 0
  lineWins: LineWin[];
}

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
  autoSpinning: boolean;
  autoRemaining: number;
  toggleAutoSpin: () => void;
  /** The resolved spin's totalWin (0 on a loss; reset() sets it to 0). SPEC-019. */
  lastWin: number;
  /** One-shot win signal (see Celebration). null until a win resolves; id
   *  strictly increases so useEffect([celebration?.id]) fires exactly once per win. SPEC-021. */
  celebration: Celebration | null;
  /** The active machine driving this hook instance (opts.machine ?? getActiveMachine()). SPEC-042. */
  machine: Machine;
}

export interface UseSlotMachineOpts {
  initialBalance?: number;
  nextSeed?: () => number;
  /** Override the active machine (tests only, for now — no selector UI yet). SPEC-042. */
  machine?: Machine;
}

export function useSlotMachine(opts?: UseSlotMachineOpts): UseSlotMachineResult {
  const nextSeed = opts?.nextSeed ?? _defaultNextSeed;
  const machine = opts?.machine ?? getActiveMachine();

  const [grid, setGrid] = useState<Grid>(INITIAL_GRID);
  // Init: explicit opts.initialBalance (used in tests) → persisted value → machine default.
  const [balance, setBalance] = useState<number>(
    () => opts?.initialBalance ?? readBalance() ?? machine.math.startingBalance,
  );
  const [bet, setBet] = useState<BetLevel>(machine.math.defaultBet);
  const [lineWins, setLineWins] = useState<LineWin[]>([]);
  const [tier, setTier] = useState<WinTier>('none');
  const [status, setStatus] = useState<'idle' | 'spinning' | 'resolved'>('idle');
  // SPEC-019: last resolved spin's totalWin; 0 on loss; reset() clears it.
  const [lastWin, setLastWin] = useState(0);

  // SPEC-021: one-shot win signal; id is monotonically increasing (never reset).
  const [celebration, setCelebration] = useState<Celebration | null>(null);
  const celebrationIdRef = useRef(0);

  // Auto-spin React state (drives rendering).
  const [autoSpinning, setAutoSpinning] = useState(false);
  const [autoRemaining, setAutoRemaining] = useState(0);

  // Ref holding the pending reveal timer so we can cancel it on unmount.
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Ref holding the auto-spin inter-spin delay timer so we can cancel it on stop.
  const autoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Ref mirror of auto state so the spin-resolve callback (a stale closure) can
  // read and mutate the live values without needing to be re-created on every state
  // change. This is the core of the ref-based continuation pattern from the spec Notes.
  const autoRef = useRef({ active: false, remaining: 0 });

  // Ref to the latest spin() function so the scheduled continuation always calls
  // the current closure (which captures the latest balance/bet/status).
  const spinRef = useRef<() => void>(() => {});

  // Clear both timers on unmount so there are no state-update-after-unmount warnings.
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
      if (autoTimerRef.current !== null) {
        clearTimeout(autoTimerRef.current);
      }
    };
  }, []);

  // Persist balance to localStorage whenever it changes.
  useEffect(() => {
    writeBalance(balance);
  }, [balance]);

  const reset = useCallback(() => {
    setBalance(machine.math.startingBalance);
    setLastWin(0);
    setCelebration(null); // SPEC-021: clear the win signal on reset (id ref stays monotonic).
  }, [machine]);

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
    const outcome = engineSpin({ seed: nextSeed(), balance, bet, machine: machine.math });
    if (!outcome.ok) return;

    // Enter the spinning state now — controls freeze, animation starts.
    setStatus('spinning');

    // After the animation duration, reveal the outcome and return to idle.
    // If auto-spin is active, also schedule the next spin (or stop).
    timerRef.current = setTimeout(() => {
      setGrid(outcome.grid);
      setBalance(outcome.balance);
      setLineWins(outcome.lineWins);
      setTier(outcome.tier);
      setLastWin(outcome.totalWin);
      // SPEC-021: set the one-shot celebration signal on a win; null on a loss.
      if (outcome.totalWin > 0) {
        celebrationIdRef.current += 1;
        setCelebration({
          id: celebrationIdRef.current,
          tier: outcome.tier,
          totalWin: outcome.totalWin,
          lineWins: outcome.lineWins,
        });
      } else {
        setCelebration(null);
      }
      setStatus('resolved');
      timerRef.current = null;

      // Auto-spin continuation: if still active, decide next action.
      if (autoRef.current.active) {
        const remaining = autoRef.current.remaining - 1;
        autoRef.current.remaining = remaining;
        setAutoRemaining(remaining);

        const shouldStop =
          outcome.tier === 'jackpot' ||
          remaining <= 0 ||
          !canAfford(outcome.balance, bet);

        if (shouldStop) {
          // Stop auto-spin.
          autoRef.current.active = false;
          setAutoSpinning(false);
        } else {
          // Schedule the next spin after the inter-spin delay.
          autoTimerRef.current = setTimeout(() => {
            autoTimerRef.current = null;
            spinRef.current();
          }, AUTO_SPIN_DELAY_MS);
        }
      }
    }, SPIN_DURATION_MS);
  }, [balance, bet, nextSeed, status, machine]);

  // Keep spinRef pointing at the latest spin closure so scheduled continuations
  // always call the version that sees the current balance/bet/status.
  spinRef.current = spin;

  const increaseBet = useCallback(() => {
    if (!canIncreaseBet) return;
    setBet(nextBet(bet));
  }, [bet, canIncreaseBet]);

  const decreaseBet = useCallback(() => {
    if (!canDecreaseBet) return;
    setBet(prevBet(bet));
  }, [bet, canDecreaseBet]);

  const toggleAutoSpin = useCallback(() => {
    if (autoRef.current.active) {
      // Stop auto-spin: clear the inter-spin delay timer, update ref + state.
      autoRef.current.active = false;
      autoRef.current.remaining = 0;
      if (autoTimerRef.current !== null) {
        clearTimeout(autoTimerRef.current);
        autoTimerRef.current = null;
      }
      setAutoSpinning(false);
      setAutoRemaining(0);
    } else {
      // Only start if we can actually spin right now.
      if (!canAfford(balance, bet) || status === 'spinning') return;
      autoRef.current.active = true;
      autoRef.current.remaining = AUTO_SPIN_COUNT;
      setAutoSpinning(true);
      setAutoRemaining(AUTO_SPIN_COUNT);
      // Kick off the first spin immediately.
      spinRef.current();
    }
  }, [balance, bet, status]);

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
    autoSpinning,
    autoRemaining,
    toggleAutoSpin,
    lastWin,
    celebration,
    machine,
  };
}
