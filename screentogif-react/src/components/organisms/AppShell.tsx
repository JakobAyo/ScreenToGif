/**
 * AppShell Component
 * Main application shell that handles view routing and global UI
 */

import { useEffect } from 'react';
import { useUIStore } from '../../stores/uiStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { LocalizationService } from '../../services/LocalizationService';
import { HotkeyService } from '../../services/HotkeyService';

// Feature imports
import { StartupPage } from '../../features/startup';
import { RecorderPage } from '../../features/recorder/pages';
import { EditorPage } from '../../features/editor/pages';
import { ExportPage } from '../../features/export/pages';
import { SettingsPage } from '../../features/settings';

// Component imports
import { Toast } from '../molecules/Toast';
import { Spinner } from '../atoms/Spinner';

export interface AppShellProps {
  className?: string;
}

export function AppShell({ className = '' }: AppShellProps) {
  const currentView = useUIStore((state) => state.currentView);
  const toasts = useUIStore((state) => state.toasts);
  const dismissToast = useUIStore((state) => state.dismissToast);
  const isAppLoading = useUIStore((state) => state.isAppLoading);
  const loadingMessage = useUIStore((state) => state.loadingMessage);
  const setAppLoading = useUIStore((state) => state.setAppLoading);

  const locale = useSettingsStore((state) => state.locale);
  const hotkeys = useSettingsStore((state) => state.hotkeys);

  // Initialize services on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        // Initialize localization
        await LocalizationService.initialize(locale);

        // Initialize hotkey service
        HotkeyService.initialize(hotkeys);

        // Mark app as ready
        setAppLoading(false);
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setAppLoading(false);
      }
    };

    initialize();

    return () => {
      HotkeyService.destroy();
    };
  }, []);

  // Update hotkeys when settings change
  useEffect(() => {
    HotkeyService.updateBindings(hotkeys);
  }, [hotkeys]);

  // Update locale when settings change
  useEffect(() => {
    LocalizationService.setLocale(locale);
  }, [locale]);

  // Render loading screen
  if (isAppLoading) {
    return (
      <div className="fixed inset-0 bg-surface-900 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" variant="primary" />
          <p className="mt-4 text-surface-400">{loadingMessage || 'Loading...'}</p>
        </div>
      </div>
    );
  }

  // Render current view
  const renderView = () => {
    switch (currentView) {
      case 'startup':
        return <StartupPage />;
      case 'recorder':
        return <RecorderPage />;
      case 'webcam':
        return (
          <div className="flex-1 flex items-center justify-center bg-surface-900">
            <p className="text-surface-400">Webcam recording coming soon</p>
          </div>
        );
      case 'board':
        return (
          <div className="flex-1 flex items-center justify-center bg-surface-900">
            <p className="text-surface-400">Sketch board coming soon</p>
          </div>
        );
      case 'editor':
        return <EditorPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <StartupPage />;
    }
  };

  return (
    <div className={`h-screen flex flex-col bg-surface-900 ${className}`}>
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {renderView()}
      </div>

      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            type={toast.type}
            title={toast.title}
            message={toast.message}
            dismissible={toast.dismissible}
            onDismiss={() => dismissToast(toast.id)}
          />
        ))}
      </div>
    </div>
  );
}

AppShell.displayName = 'AppShell';
