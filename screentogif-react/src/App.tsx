import { useEffect } from 'react';
import { AppShell } from './components/organisms/AppShell';
import {
  startBackend,
  getBackendStatus,
} from './services/backend';
import { useWebSocket } from './hooks/useWebSocket';

function App() {
  const { connect } = useWebSocket();

  // Auto-start backend and connect WebSocket on mount
  useEffect(() => {
    const initializeBackend = async () => {
      try {
        // Check if backend is already running
        const status = await getBackendStatus();

        if (!status.running) {
          // Start the backend
          await startBackend();
          // Wait for backend to be ready
          await new Promise(resolve => setTimeout(resolve, 1500));
        }

        // Connect WebSocket
        connect();
      } catch (err) {
        console.error('Failed to initialize backend:', err);
      }
    };

    initializeBackend();
  }, [connect]);

  return <AppShell />;
}

export default App;
