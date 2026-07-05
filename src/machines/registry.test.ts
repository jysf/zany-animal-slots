// Registry unit tests (SPEC-042). Plain Vitest, no DOM/JSX.
import { MACHINES, DEFAULT_MACHINE_ID, getMachine, getActiveMachine } from './registry';
import { WILD_AND_WHIMSICAL } from './wildAndWhimsical';

describe('registry', () => {
  it('getActiveMachine returns the default machine', () => {
    expect(getActiveMachine()).toBe(WILD_AND_WHIMSICAL);
  });

  it('DEFAULT_MACHINE_ID + MACHINES map', () => {
    expect(DEFAULT_MACHINE_ID).toBe('wild-and-whimsical');
    expect(MACHINES[DEFAULT_MACHINE_ID]).toBe(WILD_AND_WHIMSICAL);
  });

  it('getMachine resolves by id, falls back for unknown', () => {
    expect(getMachine('wild-and-whimsical')).toBe(WILD_AND_WHIMSICAL);
    expect(getMachine('nope')).toBe(WILD_AND_WHIMSICAL);
  });
});
