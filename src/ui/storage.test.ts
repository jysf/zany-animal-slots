// Tests for storage.ts (SPEC-015).
// Each test gets a clean localStorage state via beforeEach.
import { BALANCE_KEY, readBalance, writeBalance } from './storage';

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('round-trips a balance', () => {
    writeBalance(777);
    expect(readBalance()).toBe(777);
  });

  it('returns null when absent', () => {
    expect(readBalance()).toBeNull();
  });

  it('ignores an invalid stored value', () => {
    localStorage.setItem(BALANCE_KEY, 'not-a-number');
    expect(readBalance()).toBeNull();
  });
});
