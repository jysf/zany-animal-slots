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
