import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/reset.css';
import './styles/tokens.css';
import './styles/reduced-motion.css';
import App from './ui/App';
import { ErrorBoundary } from './ui/ErrorBoundary';
import { MachineProvider } from './ui/machine/MachineProvider';
import { StatsProvider } from './ui/stats/StatsProvider';
import { HelpSeenProvider } from './ui/help/HelpSeenProvider';
import { AnalyticsProvider } from './ui/analytics/AnalyticsProvider';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element #root not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <MachineProvider>
        <StatsProvider>
          <HelpSeenProvider>
            <AnalyticsProvider>
              <App />
            </AnalyticsProvider>
          </HelpSeenProvider>
        </StatsProvider>
      </MachineProvider>
    </ErrorBoundary>
  </StrictMode>,
);
