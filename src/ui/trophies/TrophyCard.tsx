// TrophyCard — a full podium card (#1-#3) for the trophy case (SPEC-076).
// Presentation only: reads a persisted TopWin and renders it (DEC-001). Tier framing via
// existing tier tokens only (DEC-010) — see .trophy-card--<tier> in trophies.css.
import { MACHINES, getMachine } from '../../machines/registry';
import type { TopWin } from '../../stats/sessionStats';
import TrophyGrid from './TrophyGrid';
import { useTrophyReplay } from './useTrophyReplay';
import './trophies.css';

const RANK_MEDAL = ['🥇', '🥈', '🥉'] as const;

/**
 * Bet multiplier, formatted per spec: 24 -> "24×", 4.8 -> "4.8×" (at most one decimal, no
 * trailing ".0" on whole numbers). `bet <= 0` cannot happen with a valid BetLevel, but this
 * component renders persisted data, so guard defensively and render nothing rather than
 * NaN/Infinity.
 */
export function formatMultiplier(amount: number, bet: number): string {
  if (bet <= 0) return '';
  const m = amount / bet;
  return `${Number.isInteger(m) ? m : m.toFixed(1)}×`;
}

/** Resolve a trophy's machine display name, mirroring TrophyGrid's unknown-machine guard
 * (DEC-021) rather than re-implementing it independently. */
export function trophyMachineName(trophy: TopWin): string {
  const isKnown = Object.prototype.hasOwnProperty.call(MACHINES, trophy.machineId);
  return isKnown ? getMachine(trophy.machineId).name : `Unknown machine (${trophy.machineId})`;
}

/**
 * The detail block shared by the full card AND the expanded compact row (Notes for the
 * Implementer: "Factor the shared detail markup into one small component ... so the two can
 * never drift"). Renders the hero grid + amount/machine/tier/bet/spin/multiplier facts.
 */
export function TrophyDetail({ trophy }: { trophy: TopWin }) {
  const multiplier = formatMultiplier(trophy.amount, trophy.bet);
  const machineName = trophyMachineName(trophy);
  // Card-local replay state (SPEC-078) — one instance per TrophyDetail mount, so cards and
  // expanded rows each replay independently. Never lifted to TrophyCase/TrophyCase.
  const { spinning, trailKey, replay } = useTrophyReplay();

  return (
    <div className="trophy-detail">
      <TrophyGrid trophy={trophy} size="card" spinning={spinning} trailKey={trailKey} />
      <div className="trophy-detail__facts">
        <p className="trophy-detail__amount">{trophy.amount} coins</p>
        <p className="trophy-detail__machine">{machineName}</p>
        <p className="trophy-detail__meta">
          <span className="trophy-detail__tier">{trophy.tier}</span>
          {' · bet '}
          {trophy.bet}
          {' · spin #'}
          {trophy.spinIndex}
        </p>
        {multiplier && <p className="trophy-detail__multiplier">{multiplier} your bet</p>}
      </div>
      <button type="button" className="trophy-detail__replay" onClick={replay}>
        Replay this win
      </button>
    </div>
  );
}

export interface TrophyCardProps {
  trophy: TopWin;
  /** 0-based rank within the podium (0 = 1st). */
  rank: number;
}

export default function TrophyCard({ trophy, rank }: TrophyCardProps) {
  const medal = RANK_MEDAL[rank] ?? '🏅';
  const tierClass = ['small', 'big', 'jackpot'].includes(trophy.tier)
    ? `trophy-card--${trophy.tier}`
    : '';

  return (
    <li className={`trophy-card ${tierClass}`.trim()}>
      <p className="trophy-card__rank" aria-hidden="true">
        {medal}
      </p>
      <TrophyDetail trophy={trophy} />
    </li>
  );
}
