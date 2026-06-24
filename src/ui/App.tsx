// Cabinet shell — composes the four portrait regions (SPEC-003).
// SPEC-013: calls useSlotMachine() and threads live state into child regions.
// SPEC-004: wrapped in a device-stage that frames the cabinet on desktop while
// leaving the phone layout full-screen (frame styles are gated behind min-width).
import './regions/regions.css';
import './device-frame.css';
import Header from './regions/Header';
import Game from './regions/Game';
import Status from './regions/Status';
import Action from './regions/Action';
import { useSlotMachine } from './useSlotMachine';

export default function App() {
  const { grid, balance, bet, spin, canSpin, increaseBet, decreaseBet, canIncreaseBet, canDecreaseBet, reset } = useSlotMachine();

  return (
    <div className="device-stage" data-testid="device-stage">
      <div className="cabinet">
        <Header />
        <Game grid={grid} />
        <Status balance={balance} bet={bet} />
        <Action onSpin={spin} canSpin={canSpin} onBetDown={decreaseBet} onBetUp={increaseBet} canBetDown={canDecreaseBet} canBetUp={canIncreaseBet} onReset={reset} />
      </div>
    </div>
  );
}
