// Cabinet shell — composes the four portrait regions (SPEC-003).
// Restructured from SPEC-001's bare <main>; game content lands in later stages.
// SPEC-004: wrapped in a device-stage that frames the cabinet on desktop while
// leaving the phone layout full-screen (frame styles are gated behind min-width).
import './regions/regions.css';
import './device-frame.css';
import Header from './regions/Header';
import Game from './regions/Game';
import Status from './regions/Status';
import Action from './regions/Action';

export default function App() {
  return (
    <div className="device-stage" data-testid="device-stage">
      <div className="cabinet">
        <Header />
        <Game />
        <Status />
        <Action />
      </div>
    </div>
  );
}
