// MachineSwitcher tests (SPEC-093). Both deps mocked so the roster + setter are fully
// controlled — the switcher's stepping, wrap-around, and a11y wiring are what's under test.
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MachineSwitcher from './MachineSwitcher';
import { listMachines } from '../../machines/registry';
import { useActiveMachine } from './MachineProvider';
import type { Machine } from '../../machines/types';

vi.mock('../../machines/registry', () => ({ listMachines: vi.fn() }));
vi.mock('./MachineProvider', () => ({ useActiveMachine: vi.fn() }));

const mockedList = vi.mocked(listMachines);
const mockedUse = vi.mocked(useActiveMachine);

const ROSTER = [
  { id: 'wild-and-whimsical', name: 'Wild & Whimsical' },
  { id: 'arctic', name: 'Arctic' },
  { id: 'diner', name: 'Diner' },
] as unknown as Machine[];

/** Mount the switcher with `activeId` selected; returns the setActiveMachineId spy. */
function setup(activeId: string) {
  const spy = vi.fn();
  mockedList.mockReturnValue(ROSTER);
  mockedUse.mockReturnValue({
    machine: {} as Machine,
    activeMachineId: activeId,
    setActiveMachineId: spy,
  });
  render(<MachineSwitcher />);
  return spy;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('MachineSwitcher', () => {
  it('shows the active machine name as the marquee heading', () => {
    setup('arctic');
    expect(screen.getByRole('heading', { name: 'Arctic' })).toBeInTheDocument();
  });

  it('exposes labelled prev/next controls in a Machine group', () => {
    setup('arctic');
    expect(screen.getByRole('group', { name: /machine/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /previous machine/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next machine/i })).toBeInTheDocument();
  });

  it('steps forward through the roster', () => {
    const spy = setup('arctic'); // index 1 of 3
    fireEvent.click(screen.getByRole('button', { name: /next machine/i }));
    expect(spy).toHaveBeenCalledWith('diner');
  });

  it('steps back through the roster', () => {
    const spy = setup('arctic');
    fireEvent.click(screen.getByRole('button', { name: /previous machine/i }));
    expect(spy).toHaveBeenCalledWith('wild-and-whimsical');
  });

  it('wraps forward off the end to the first machine', () => {
    const spy = setup('diner'); // last
    fireEvent.click(screen.getByRole('button', { name: /next machine/i }));
    expect(spy).toHaveBeenCalledWith('wild-and-whimsical');
  });

  it('wraps back off the start to the last machine', () => {
    const spy = setup('wild-and-whimsical'); // first
    fireEvent.click(screen.getByRole('button', { name: /previous machine/i }));
    expect(spy).toHaveBeenCalledWith('diner');
  });

  it('keeps keyboard switching that the native <select> gave for free', () => {
    // Arrow-key stepping is a11y PARITY with SPEC-050's select, not a bonus — a keyboard user
    // must be able to change machines without tabbing between two buttons.
    const spy = setup('arctic');
    const group = screen.getByRole('group', { name: /machine/i });

    fireEvent.keyDown(group, { key: 'ArrowRight' });
    expect(spy).toHaveBeenCalledWith('diner');

    fireEvent.keyDown(group, { key: 'ArrowLeft' });
    expect(spy).toHaveBeenCalledWith('wild-and-whimsical');
  });

  it('announces the machine change to screen readers', () => {
    // The select announced its own value change; a plain heading would not.
    setup('diner');
    expect(screen.getByText('Diner')).toHaveAttribute('aria-live', 'polite');
  });

  it('falls back to the first machine when the active id is unknown', () => {
    const spy = setup('does-not-exist');
    expect(screen.getByRole('heading', { name: 'Wild & Whimsical' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /next machine/i }));
    expect(spy).toHaveBeenCalledWith('arctic');
  });
});
