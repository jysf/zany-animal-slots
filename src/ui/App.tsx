// Cabinet shell — composes the four portrait regions (SPEC-003).
// SPEC-013: calls useSlotMachine() and threads live state into child regions.
// SPEC-004: wrapped in a device-stage that frames the cabinet on desktop while
// leaving the phone layout full-screen (frame styles are gated behind min-width).
// SPEC-016: threads isSpinning into Game (as `spinning`) and Action so controls
// freeze and the reel animation plays during the spin phase.
// SPEC-017: threads autoSpinning / toggleAutoSpin into Action for the Auto toggle.
// SPEC-018: threads lineWins from the hook into Game so winning cells are highlighted.
// SPEC-019: threads lastWin into Status (WIN readout) and Game (WinBadge overlay).
// SPEC-022: destructures celebration from useSlotMachine and passes it to Status
// so the balance count-up fires on a win (driven by useCountUp inside Status).
// SPEC-025: renders JackpotMoment overlay inside .cabinet for the jackpot tier.
// SPEC-026: calls useAudio() and threads muted + toggleMute into Header.
// SPEC-027: destructures unlocked from useAudio() and calls useWinJingle.
import './regions/regions.css';
import './device-frame.css';
import Header from './regions/Header';
import Game from './regions/Game';
import Status from './regions/Status';
import Action from './regions/Action';
import JackpotMoment from './JackpotMoment';
import { useSlotMachine } from './useSlotMachine';
import { useAudio } from './audio/useAudio';
import { useWinJingle } from './audio/useWinJingle';
import { useAmbientBed } from './audio/useAmbientBed';

export default function App() {
  const { muted, toggleMute, unlocked } = useAudio();
  const {
    grid,
    balance,
    bet,
    lineWins,
    lastWin,
    celebration,
    spin,
    canSpin,
    isSpinning,
    increaseBet,
    decreaseBet,
    canIncreaseBet,
    canDecreaseBet,
    reset,
    autoSpinning,
    toggleAutoSpin,
  } = useSlotMachine();

  useWinJingle(celebration, { muted, unlocked });
  useAmbientBed({ muted, unlocked });

  return (
    <div className="device-stage" data-testid="device-stage">
      <div className="cabinet">
        <Header muted={muted} onToggleMute={toggleMute} />
        <Game grid={grid} spinning={isSpinning} lineWins={lineWins} lastWin={lastWin} celebration={celebration} />
        <Status balance={balance} bet={bet} lastWin={lastWin} celebration={celebration} />
        <Action
          onSpin={spin}
          canSpin={canSpin}
          isSpinning={isSpinning}
          onBetDown={decreaseBet}
          onBetUp={increaseBet}
          canBetDown={canDecreaseBet}
          canBetUp={canIncreaseBet}
          onReset={reset}
          autoSpinning={autoSpinning}
          onToggleAuto={toggleAutoSpin}
        />
        <JackpotMoment celebration={celebration} />
      </div>
    </div>
  );
}
