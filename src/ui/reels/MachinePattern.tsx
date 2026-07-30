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

/**
 * Glyphs PER ROW. Chosen to fit the NARROWEST supported cabinet (320px) without overflowing, so
 * the row never clips at any width in the portrait-first range — see SPEC-101. More glyphs would
 * look denser at 430px but would spill at 320px, and a half-sliced emoji is the exact defect this
 * count exists to prevent.
 */
const GLYPHS_PER_ROW = 8;

interface Props {
  symbolDisplay: SymbolDisplay;
  /**
   * SPEC-100 placement variant:
   *  'face'     the cabinet face — rows pushed to the visible strips around the reel window.
   *  'band'     a slim strip (win band) — one centred row.
   *  'on-frame' a slim strip whose background IS --color-frame (the control deck), so the glyph
   *             is painted in --color-bg instead; the default colour would be invisible there.
   */
  variant?: 'face' | 'band' | 'on-frame';
}

export default function MachinePattern({ symbolDisplay, variant = 'face' }: Props) {
  const glyphs = Object.values(symbolDisplay).map((s) => s.emoji);
  if (glyphs.length === 0) return null;

  /*
   * SPEC-101: EXPLICIT rows, not flex-wrap.
   *
   * The original tiled a fixed 36 glyphs and let them wrap. That made the row count a function of
   * the container's width, and in a box with room for ~2 rows a third row landed straddling the
   * boundary — measured, 12 of 36 glyphs were half-sliced by `overflow: hidden` at 320px, 375px
   * AND 430px. Rendering a fixed number of non-wrapping rows makes the layout deterministic:
   * the face gets two (one per visible strip around the reel window), slim bands get one.
   */
  const rowCount = variant === 'face' ? 2 : 1;

  // Deterministic, not random: a fixed stride through the symbol list keeps the tiling stable
  // across re-renders (a random pattern would reshuffle on every spin, which reads as flicker).
  const rows = Array.from({ length: rowCount }, (_, row) =>
    Array.from(
      { length: GLYPHS_PER_ROW },
      (_, i) => glyphs[(row * GLYPHS_PER_ROW + i * 3) % glyphs.length],
    ),
  );

  const variantClass =
    variant === 'face' ? '' : ` machine-pattern--band${variant === 'on-frame' ? ' machine-pattern--on-frame' : ''}`;

  return (
    <div className={`machine-pattern${variantClass}`} aria-hidden="true">
      {rows.map((row, r) => (
        <div className="machine-pattern__row" key={r}>
          {row.map((emoji, i) => (
            <span className="machine-pattern__glyph" key={i}>
              {emoji}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
