import { describe, it, expect } from "vitest";
import {
  STARTING_BALANCE,
  BET_LEVELS,
  DEFAULT_BET,
  nextBet,
  prevBet,
  canAfford,
  debit,
  credit,
} from "./balance";

describe("balance", () => {
  it("exposes the starting balance and bet levels", () => {
    expect(STARTING_BALANCE).toBe(1000);
    expect(BET_LEVELS).toEqual([10, 25, 50]);
    expect(DEFAULT_BET).toBe(10);
  });

  it("nextBet steps up and clamps at 50", () => {
    expect(nextBet(10)).toBe(25);
    expect(nextBet(25)).toBe(50);
    expect(nextBet(50)).toBe(50);
  });

  it("prevBet steps down and clamps at 10", () => {
    expect(prevBet(50)).toBe(25);
    expect(prevBet(25)).toBe(10);
    expect(prevBet(10)).toBe(10);
  });

  // SPEC-047: nextBet/prevBet step through a SUPPLIED levels array (a machine's
  // machine.math.betLevels), defaulting to BET_LEVELS — proven above. These prove
  // the steppers read the passed levels, not the module BET_LEVELS.
  it("nextBet steps through a machine's custom bet levels", () => {
    expect(nextBet(10, [10, 50])).toBe(50);
    expect(nextBet(50, [10, 50])).toBe(50); // top clamp
    expect(nextBet(10, [10, 25, 50])).toBe(25); // sanity
  });

  it("prevBet steps through a machine's custom bet levels", () => {
    expect(prevBet(50, [10, 50])).toBe(10);
    expect(prevBet(10, [10, 50])).toBe(10); // bottom clamp
  });

  it("canAfford respects balance and positive bet", () => {
    expect(canAfford(1000, 50)).toBe(true);
    expect(canAfford(50, 50)).toBe(true); // exact balance
    expect(canAfford(40, 50)).toBe(false);
    expect(canAfford(0, 10)).toBe(false);
    expect(canAfford(100, 0)).toBe(false);
  });

  it("debit succeeds when affordable", () => {
    expect(debit(1000, 10)).toEqual({ ok: true, balance: 990 });
    expect(debit(10, 10)).toEqual({ ok: true, balance: 0 });
  });

  it("debit fails (typed, no throw) when unaffordable", () => {
    expect(debit(5, 10)).toEqual({
      ok: false,
      reason: "insufficient-balance",
      balance: 5,
    });
    // Call does not throw and input balance is unchanged
    expect(() => debit(5, 10)).not.toThrow();
  });

  it("credit adds a win to the balance", () => {
    expect(credit(990, 50)).toBe(1040);
    expect(credit(0, 0)).toBe(0);
  });
});
