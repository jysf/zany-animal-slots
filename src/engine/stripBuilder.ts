// Deterministic reel-strip builder (STAGE-008 / SPEC-045).
// Turns per-symbol weights into a reel strip so a machine's `strips` can be GENERATED from
// its `reelWeights` (the retune's live tuning knob — SPEC-044 found the hand-authored strip
// made weights inert). Pure + deterministic (no RNG); DEC-001 (engine-no-dom): type-only import.
import type { SymbolId } from './strips';

/**
 * Build a deterministic reel strip from per-symbol weights.
 *
 * Fractional-rank interleave: symbol `s` with weight `c` contributes `c` occurrences at the
 * evenly spaced fractional positions (k + 0.5) / c for k in [0, c). All occurrences are then
 * sorted by position (ties broken by the canonical `symbols` order). Because the strip is
 * built FROM the exact multiset, it contains exactly `weights[s]` copies of every symbol.
 *
 * A final adjacency-fix pass swaps any linear adjacent duplicate forward to the nearest later
 * position whose neighbours differ (reorder only — counts stay exact). Adjacent duplicates are
 * eliminated for realistic weight sets; a single one may remain in pathological cases.
 *
 * Deterministic: no RNG, no Math.random — same (symbols, weights) → identical strip. The
 * `symbols` argument supplies BOTH the set to place (filtered to weight > 0) and the
 * tie-break order, so the result never depends on JS object key ordering.
 */
export function buildStrip(
  symbols: readonly SymbolId[],
  weights: Partial<Record<SymbolId, number>>,
): SymbolId[] {
  const items: { s: SymbolId; key: number; ord: number }[] = [];
  symbols.forEach((s, ord) => {
    const c = weights[s] ?? 0;
    for (let k = 0; k < c; k++) items.push({ s, key: (k + 0.5) / c, ord });
  });
  // Sort by fractional position; break ties by canonical `symbols` order. The `|| a.ord - b.ord`
  // tie-break is explicit-but-defensive: items are pushed in `symbols` order, and Array.sort is
  // stable (ES2019+), so equal-key ties already resolve in ord order — the explicit tie-break
  // keeps determinism from silently depending on sort stability if the insertion order ever changes.
  items.sort((a, b) => a.key - b.key || a.ord - b.ord);
  const out = items.map((it) => it.s);

  // Adjacency fix: move any element equal to its predecessor forward to the next slot whose
  // neighbours both differ from it. Pure reorder — symbol counts are unchanged.
  for (let i = 1; i < out.length; i++) {
    if (out[i] !== out[i - 1]) continue;
    let j = i + 1;
    while (j < out.length && (out[j] === out[i] || out[j] === out[i - 1])) j++;
    if (j < out.length) {
      const tmp = out[i];
      out[i] = out[j];
      out[j] = tmp;
    }
  }
  return out;
}
