// MachinePattern — a decorative, monochrome watermark of the active machine's own reel symbols,
// tiled across the cabinet face behind the reel window (SPEC-098).
//
// Opt-in per machine via `presentation.pattern` (DEC-015: config-as-data), so it can be trialled
// on one machine before rolling out — which is exactly how the owner asked for it.
//
// How the monochrome works: emoji glyphs carry their own colour and ignore `color`. Setting
// `color: transparent` and painting a zero-blur `text-shadow` renders the glyph's SILHOUETTE in
// the shadow colour instead — so the same emoji the machine already defines become a flat,
// token-coloured shape with no new assets. The colour comes from a theme token, so each machine's
// pattern contrasts against its own background for free. See machine-pattern.css.
//
// Purely decorative: aria-hidden, pointer-events:none, and it never affects layout.
import type { SymbolDisplay } from '../../machines/types';

interface Props {
  symbolDisplay: SymbolDisplay;
  /** How many glyphs to tile. Kept modest — this is a texture, not a mural. */
  count?: number;
  /**
   * SPEC-100 placement variant:
   *  'face'     the cabinet face — rows pushed to the visible strips around the reel window.
   *  'band'     a slim strip (win band) — one centred row.
   *  'on-frame' a slim strip whose background IS --color-frame (the control deck), so the glyph
   *             is painted in --color-bg instead; the default colour would be invisible there.
   */
  variant?: 'face' | 'band' | 'on-frame';
}

export default function MachinePattern({ symbolDisplay, count = 36, variant = 'face' }: Props) {
  const glyphs = Object.values(symbolDisplay).map((s) => s.emoji);
  if (glyphs.length === 0) return null;

  // Deterministic, not random: a fixed stride through the symbol list keeps the tiling stable
  // across re-renders (a random pattern would reshuffle on every spin, which reads as flicker).
  const tiles = Array.from({ length: count }, (_, i) => glyphs[(i * 3) % glyphs.length]);

  const variantClass =
    variant === 'face' ? '' : ` machine-pattern--band${variant === 'on-frame' ? ' machine-pattern--on-frame' : ''}`;

  return (
    <div className={`machine-pattern${variantClass}`} aria-hidden="true">
      {tiles.map((emoji, i) => (
        <span className="machine-pattern__glyph" key={i}>
          {emoji}
        </span>
      ))}
    </div>
  );
}
