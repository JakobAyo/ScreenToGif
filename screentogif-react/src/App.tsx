import { useState, useEffect } from 'react';
import { useWebSocket } from './hooks/useWebSocket';
import {
  startBackend,
  stopBackend,
  getBackendStatus,
  healthCheck,
  getBackendInfo,
  pingBackend,
  type BackendStatus,
  type BackendInfo
} from './services/backend';

function App() {
  const [backendStatus, setBackendStatus] = useState<BackendStatus | null>(null);
  const [backendInfo, setBackendInfo] = useState<BackendInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pingResult, setPingResult] = useState<string | null>(null);

  const { isConnected, lastMessage, sendMessage, connect, disconnect } = useWebSocket();

  // Check backend status on mount
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const status = await getBackendStatus();
        setBackendStatus(status);
      } catch (err) {
        console.error('Failed to get backend status:', err);
      }
    };
    checkStatus();
  }, []);

  const handleStartBackend = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const status = await startBackend();
      setBackendStatus(status);

      // Wait a bit then get backend info
      await new Promise(resolve => setTimeout(resolve, 1000));
      try {
        const info = await getBackendInfo();
        setBackendInfo(info);
      } catch {
        console.log('Backend info not available yet');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start backend');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopBackend = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await stopBackend();
      setBackendStatus({ running: false, port: null });
      setBackendInfo(null);
      disconnect();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop backend');
    } finally {
      setIsLoading(false);
    }
  };

  const handleHealthCheck = async () => {
    try {
      const result = await healthCheck();
      setError(null);
      setPingResult(`Health: ${result.status} at ${result.timestamp}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Health check failed');
    }
  };

  const handlePing = async () => {
    try {
      const result = await pingBackend();
      setError(null);
      setPingResult(`API Ping: ${result.message} at ${result.timestamp}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ping failed');
    }
  };

  const handleWebSocketPing = () => {
    sendMessage({ type: 'ping' });
  };

  const handleWebSocketEcho = () => {
    sendMessage({ type: 'echo', data: 'Hello from React!' });
  };

  return (
    <div className="min-h-screen bg-surface-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-primary-400 mb-2">ScreenToGif</h1>
          <p className="text-surface-400">React + Tauri + C# Backend</p>
        </header>

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Backend Status Card */}
        <div className="bg-surface-800 rounded-xl p-6 mb-6 border border-surface-700">
          <h2 className="text-xl font-semibold mb-4 text-primary-300">Backend Status</h2>

          <div className="flex items-center gap-4 mb-4">
            <div className={`w-3 h-3 rounded-full ${backendStatus?.running ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-surface-300">
              {backendStatus?.running ? `Running on port ${backendStatus.port}` : 'Not running'}
            </span>
          </div>

          {backendInfo && (
            <div className="bg-surface-900 rounded-lg p-4 mb-4 font-mono text-sm">
              <p><span className="text-surface-500">Name:</span> {backendInfo.name}</p>
              <p><span className="text-surface-500">Version:</span> {backendInfo.version}</p>
              <p><span className="text-surface-500">Platform:</span> {backendInfo.platform}</p>
              <p><span className="text-surface-500">Runtime:</span> {backendInfo.runtime}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleStartBackend}
              disabled={isLoading || backendStatus?.running}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-500 disabled:bg-surface-600 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              {isLoading ? 'Starting...' : 'Start Backend'}
            </button>
            <button
              onClick={handleStopBackend}
              disabled={isLoading || !backendStatus?.running}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:bg-surface-600 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              Stop Backend
            </button>
          </div>
        </div>

        {/* API Testing Card */}
        <div className="bg-surface-800 rounded-xl p-6 mb-6 border border-surface-700">
          <h2 className="text-xl font-semibold mb-4 text-primary-300">API Testing</h2>

          {pingResult && (
            <div className="bg-surface-900 rounded-lg p-3 mb-4 font-mono text-sm text-green-400">
              {pingResult}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleHealthCheck}
              disabled={!backendStatus?.running}
              className="px-4 py-2 bg-surface-600 hover:bg-surface-500 disabled:bg-surface-700 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              Health Check
            </button>
            <button
              onClick={handlePing}
              disabled={!backendStatus?.running}
              className="px-4 py-2 bg-surface-600 hover:bg-surface-500 disabled:bg-surface-700 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              Ping API
            </button>
          </div>
        </div>

        {/* WebSocket Card */}
        <div className="bg-surface-800 rounded-xl p-6 border border-surface-700">
          <h2 className="text-xl font-semibold mb-4 text-primary-300">WebSocket Connection</h2>

          <div className="flex items-center gap-4 mb-4">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500'}`} />
            <span className="text-surface-300">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>

          {lastMessage && (
            <div className="bg-surface-900 rounded-lg p-4 mb-4 font-mono text-sm">
              <p className="text-surface-500 mb-1">Last Message:</p>
              <pre className="text-green-400 whitespace-pre-wrap">
                {JSON.stringify(lastMessage, null, 2)}
              </pre>
            </div>
          )}

          <div className="flex gap-3 flex-wrap">
            <button
              onClick={connect}
              disabled={isConnected || !backendStatus?.running}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-500 disabled:bg-surface-600 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              Connect
            </button>
            <button
              onClick={disconnect}
              disabled={!isConnected}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:bg-surface-600 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              Disconnect
            </button>
            <button
              onClick={handleWebSocketPing}
              disabled={!isConnected}
              className="px-4 py-2 bg-surface-600 hover:bg-surface-500 disabled:bg-surface-700 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              WS Ping
            </button>
            <button
              onClick={handleWebSocketEcho}
              disabled={!isConnected}
              className="px-4 py-2 bg-surface-600 hover:bg-surface-500 disabled:bg-surface-700 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              WS Echo
            </button>
          </div>
        </div>

        <footer className="mt-8 text-center text-surface-500 text-sm">
          Built with Tauri 2.0 + React + TypeScript + TailwindCSS + C# Backend
        </footer>
      </div>
    </div>
  );
}

export default App;
