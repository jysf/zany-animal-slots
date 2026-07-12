// Cross-machine symbol-uniqueness contract (SPEC-065).
// Product rule from the emoji refresh: no emoji glyph is reused across machines — each machine keeps a
// fully distinct reel identity. Guards against a future machine (or another emoji refresh) silently
// reintroducing a duplicate glyph across the roster.
import { describe, it, expect } from 'vitest';
import { listMachines } from './registry';

describe('cross-machine symbol uniqueness (SPEC-065)', () => {
  it('no emoji is used by more than one machine', () => {
    const owners = new Map<string, string[]>();
    for (const machine of listMachines()) {
      for (const { emoji } of Object.values(machine.presentation.symbolDisplay)) {
        owners.set(emoji, [...(owners.get(emoji) ?? []), machine.id]);
      }
    }
    const duplicates = [...owners.entries()].filter(([, machines]) => machines.length > 1);
    // On failure this shows exactly which emoji + which machines collide.
    expect(duplicates).toEqual([]);
  });

  it('each machine uses 8 distinct emoji within itself', () => {
    for (const machine of listMachines()) {
      const emojis = Object.values(machine.presentation.symbolDisplay).map((s) => s.emoji);
      expect(new Set(emojis).size).toBe(emojis.length);
    }
  });
});
