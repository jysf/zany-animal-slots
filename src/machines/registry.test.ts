// Registry unit tests (SPEC-042; SPEC-049 adds persisted-id-reading assertions).
// Plain Vitest, no DOM/JSX — jsdom provides localStorage.
import { MACHINES, DEFAULT_MACHINE_ID, getMachine, getActiveMachine } from './registry';
import { WILD_AND_WHIMSICAL } from './wildAndWhimsical';
import { writeActiveMachineId } from './activeMachineStorage';
import * as activeMachineStorage from './activeMachineStorage';

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

    // VERIFY (SPEC-049): structural teeth-gap closer. The two assertion-based tests
    // above can't distinguish "getActiveMachine reads storage" from "getActiveMachine
    // always returns the const default" because this single-machine registry's
    // DEFAULT_MACHINE_ID happens to equal the fixture id used above
    // ('wild-and-whimsical'). This test proves the DELEGATION itself — that
    // getActiveMachine() actually calls readActiveMachineId() — independent of what
    // machines happen to be registered today. It fails under a mutation that makes
    // getActiveMachine() ignore storage and return getMachine(DEFAULT_MACHINE_ID) directly.
    it('getActiveMachine delegates to readActiveMachineId (structural spy)', () => {
      const spy = vi.spyOn(activeMachineStorage, 'readActiveMachineId');

      getActiveMachine();

      expect(spy).toHaveBeenCalled();

      spy.mockRestore();
    });
  });
});
