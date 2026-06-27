// Header region — branding bar at the top of the cabinet.
// Renders the PaytableSheet trigger (SPEC-020) alongside the title.
import { PaytableSheet } from '../PaytableSheet';

export default function Header() {
  return (
    <header className="cabinet__header">
      <h1 className="cabinet__title">Zany Animal Slots</h1>
      <PaytableSheet />
    </header>
  );
}
