import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/tokens.css';
import './styles/reduced-motion.css';
import App from './ui/App';
import { MachineProvider } from './ui/machine/MachineProvider';
import { StatsProvider } from './ui/stats/StatsProvider';
import { HelpSeenProvider } from './ui/help/HelpSeenProvider';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element #root not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <MachineProvider>
      <StatsProvider>
        <HelpSeenProvider>
          <App />
        </HelpSeenProvider>
      </StatsProvider>
    </MachineProvider>
  </StrictMode>,
);
