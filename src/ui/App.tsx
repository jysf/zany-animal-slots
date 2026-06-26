// Cabinet shell — composes the four portrait regions (SPEC-003).
// SPEC-013: calls useSlotMachine() and threads live state into child regions.
// SPEC-004: wrapped in a device-stage that frames the cabinet on desktop while
// leaving the phone layout full-screen (frame styles are gated behind min-width).
// SPEC-016: threads isSpinning into Game (as `spinning`) and Action so controls
// freeze and the reel animation plays during the spin phase.
// SPEC-017: threads autoSpinning / toggleAutoSpin into Action for the Auto toggle.
// SPEC-018: threads lineWins from the hook into Game so winning cells are highlighted.
import './regions/regions.css';
import './device-frame.css';
import Header from './regions/Header';
import Game from './regions/Game';
import Status from './regions/Status';
import Action from './regions/Action';
import { useSlotMachine } from './useSlotMachine';

export default function App() {
  const {
    grid,
    balance,
    bet,
    lineWins,
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

  return (
    <div className="device-stage" data-testid="device-stage">
      <div className="cabinet">
        <Header />
        <Game grid={grid} spinning={isSpinning} lineWins={lineWins} />
        <Status balance={balance} bet={bet} />
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
      </div>
    </div>
  );
}
