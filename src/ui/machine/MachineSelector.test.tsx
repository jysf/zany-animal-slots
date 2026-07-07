// MachineSelector tests (SPEC-050). Both deps mocked so options + the setter
// are fully controlled — the selector's own rendering/wiring is what's under test.
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MachineSelector from './MachineSelector';
import { listMachines } from '../../machines/registry';
import { useActiveMachine } from './MachineProvider';
import type { Machine } from '../../machines/types';

vi.mock('../../machines/registry', () => ({ listMachines: vi.fn() }));
vi.mock('./MachineProvider', () => ({ useActiveMachine: vi.fn() }));

const mockedList = vi.mocked(listMachines);
const mockedUse = vi.mocked(useActiveMachine);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('MachineSelector', () => {
  it('renders a labeled machine selector with an option per registered machine', () => {
    mockedList.mockReturnValue([
      { id: 'wild-and-whimsical', name: 'Wild & Whimsical' },
    ] as unknown as Machine[]);
    mockedUse.mockReturnValue({
      machine: {} as Machine,
      activeMachineId: 'wild-and-whimsical',
      setActiveMachineId: vi.fn(),
    });

    render(<MachineSelector />);

    const select = screen.getByRole('combobox', { name: /machine/i });
    expect(select).toBeInTheDocument();
    expect(screen.getByText('Wild & Whimsical')).toBeInTheDocument();
    expect((select as HTMLSelectElement).value).toBe('wild-and-whimsical');
  });

  it("selects the active machine's id", () => {
    mockedList.mockReturnValue([
      { id: 'wild-and-whimsical', name: 'W&W' },
      { id: 'arctic', name: 'Arctic' },
    ] as unknown as Machine[]);
    mockedUse.mockReturnValue({
      machine: {} as Machine,
      activeMachineId: 'arctic',
      setActiveMachineId: vi.fn(),
    });

    render(<MachineSelector />);

    const select = screen.getByRole('combobox', { name: /machine/i });
    expect((select as HTMLSelectElement).value).toBe('arctic');
  });

  it('switching the selection calls setActiveMachineId with the chosen id', () => {
    const spy = vi.fn();
    mockedList.mockReturnValue([
      { id: 'wild-and-whimsical', name: 'W&W' },
      { id: 'arctic', name: 'Arctic' },
    ] as unknown as Machine[]);
    mockedUse.mockReturnValue({
      machine: {} as Machine,
      activeMachineId: 'wild-and-whimsical',
      setActiveMachineId: spy,
    });

    render(<MachineSelector />);

    const select = screen.getByRole('combobox', { name: /machine/i });
    expect(screen.getAllByRole('option')).toHaveLength(2);

    fireEvent.change(select, { target: { value: 'arctic' } });

    expect(spy).toHaveBeenCalledWith('arctic');
  });
});
