// ErrorBoundary — top-level crash guard (SPEC-067, hardening).
// A React error boundary MUST be a class component (getDerivedStateFromError /
// componentDidCatch). If any descendant throws during render, we show a small,
// token-styled fallback instead of a white screen — appropriate for a play-money
// game where a crash should never look like data loss. Client-only: the caught
// error is surfaced to the dev console only, never a remote logger (DEC-005: no
// backend). This is a deliberate diagnostic (AGENTS §11), the only crash-surfacing
// path a no-backend app has.
import { Component, type ErrorInfo, type ReactNode } from 'react';
import './error-boundary.css';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Zany Animal Slots hit an unexpected error:', error, info.componentStack);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="error-boundary" role="alert">
          <p className="error-boundary__title">Something went wrong</p>
          <p className="error-boundary__body">
            The game hit an unexpected error. Reload to keep playing — your play-money balance is
            safe.
          </p>
          <button
            type="button"
            className="error-boundary__reload"
            onClick={() => window.location.reload()}
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
