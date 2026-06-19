// Minimal app shell. Deliberately bare: design tokens (SPEC-002), the
// four-region layout (SPEC-003), the device frame (SPEC-004), and all
// engine/game/audio code are out of scope for SPEC-001. The only job here is
// to render an accessible "Animal Slots" <main> landmark the smoke test asserts.
export default function App() {
  return (
    <main aria-label="Animal Slots">
      <h1>Animal Slots</h1>
    </main>
  );
}
