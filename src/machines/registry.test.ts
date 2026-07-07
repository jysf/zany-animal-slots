// Registry unit tests (SPEC-042; SPEC-049 adds persisted-id-reading assertions).
// Plain Vitest, no DOM/JSX — jsdom provides localStorage.
import { MACHINES, DEFAULT_MACHINE_ID, getMachine, getActiveMachine } from './registry';
import { WILD_AND_WHIMSICAL } from './wildAndWhimsical';
import { writeActiveMachineId } from './activeMachineStorage';

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

  describe('getActiveMachine (SPEC-049: persisted id)', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    afterEach(() => {
      localStorage.clear();
    });

    it('getActiveMachine returns the default when nothing is persisted', () => {
      expect(getActiveMachine()).toBe(WILD_AND_WHIMSICAL);
    });

    it('getActiveMachine reflects the persisted id', () => {
      writeActiveMachineId('wild-and-whimsical');
      expect(getActiveMachine().id).toBe('wild-and-whimsical');
    });

    it('getActiveMachine falls back to the default for an unknown persisted id', () => {
      writeActiveMachineId('nope');
      expect(getActiveMachine()).toBe(WILD_AND_WHIMSICAL);
    });
  });
});
