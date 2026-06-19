// Cabinet shell — composes the four portrait regions (SPEC-003).
// Restructured from SPEC-001's bare <main>; game content lands in later stages.
import './regions/regions.css';
import Header from './regions/Header';
import Game from './regions/Game';
import Status from './regions/Status';
import Action from './regions/Action';

export default function App() {
  return (
    <div className="cabinet">
      <Header />
      <Game />
      <Status />
      <Action />
    </div>
  );
}
