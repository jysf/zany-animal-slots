import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it("renders the app shell with an accessible 'Animal Slots' main landmark", () => {
    render(<App />);
    expect(screen.getByRole('main', { name: /animal slots/i })).toBeInTheDocument();
  });
});
