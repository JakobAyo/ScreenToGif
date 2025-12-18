/**
 * AboutSection Component
 * Container for about page information
 */

import { useSettingsStore } from '../../../../stores/settingsStore';
import { Toggle } from '../../../../components/atoms/Toggle';
import { Button } from '../../../../components/atoms/Button';
import { Icon } from '../../../../components/atoms/Icon';
import { VersionInfo } from './VersionInfo';
import { LicenseInfo } from './LicenseInfo';

export interface AboutSectionProps {
  className?: string;
}

export function AboutSection({ className = '' }: AboutSectionProps) {
  const {
    developerMode,
    enableTelemetry,
    logLevel,
    setDeveloperMode,
    setEnableTelemetry,
    setLogLevel,
    exportSettings,
    importSettings,
    resetToDefaults,
  } = useSettingsStore();

  const handleExportSettings = () => {
    const settings = exportSettings();
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'screentogif-settings.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSettings = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const text = await file.text();
          const settings = JSON.parse(text);
          importSettings(settings);
        } catch (error) {
          console.error('Failed to import settings:', error);
        }
      }
    };
    input.click();
  };

  const handleResetSettings = () => {
    if (confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
      resetToDefaults();
    }
  };

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Version Info */}
      <section>
        <h3 className="text-lg font-semibold text-surface-100 mb-4">About</h3>
        <VersionInfo />
      </section>

      {/* License Info */}
      <section>
        <h3 className="text-lg font-semibold text-surface-100 mb-4">License & Credits</h3>
        <LicenseInfo />
      </section>

      {/* Advanced Settings */}
      <section>
        <h3 className="text-lg font-semibold text-surface-100 mb-4">Advanced</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium text-surface-200">Developer mode</label>
              <p className="text-xs text-surface-500">Enable advanced debugging features</p>
            </div>
            <Toggle
              checked={developerMode}
              onChange={(e) => setDeveloperMode(e.target.checked)}
              size="sm"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium text-surface-200">
                Usage analytics
              </label>
              <p className="text-xs text-surface-500">
                Help improve ScreenToGif with anonymous data
              </p>
            </div>
            <Toggle
              checked={enableTelemetry}
              onChange={(e) => setEnableTelemetry(e.target.checked)}
              size="sm"
            />
          </div>

          {developerMode && (
            <div className="ml-4 pl-4 border-l border-surface-700 space-y-2">
              <label className="block text-sm font-medium text-surface-200">Log level</label>
              <div className="flex gap-2">
                {(['debug', 'info', 'warn', 'error'] as const).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setLogLevel(level)}
                    className={`
                      px-3 py-1.5 rounded-lg text-sm capitalize transition-colors
                      ${
                        logLevel === level
                          ? 'bg-primary-500 text-white'
                          : 'bg-surface-700 text-surface-300 hover:bg-surface-600'
                      }
                    `}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Settings Management */}
      <section>
        <h3 className="text-lg font-semibold text-surface-100 mb-4">Settings Management</h3>
        <div className="grid grid-cols-3 gap-3">
          <Button variant="secondary" onClick={handleExportSettings} className="w-full">
            <Icon name="arrow-up" size="sm" className="mr-2" />
            Export
          </Button>
          <Button variant="secondary" onClick={handleImportSettings} className="w-full">
            <Icon name="arrow-down" size="sm" className="mr-2" />
            Import
          </Button>
          <Button variant="secondary" onClick={handleResetSettings} className="w-full text-accent-error hover:bg-accent-error/10">
            <Icon name="arrow-path" size="sm" className="mr-2" />
            Reset All
          </Button>
        </div>
        <p className="text-xs text-surface-500 mt-2">
          Export your settings to back them up, or import settings from another device.
        </p>
      </section>

      {/* Support Links */}
      <section className="pt-4 border-t border-surface-700">
        <div className="flex flex-wrap gap-3">
          <a
            href="https://github.com/NickeManarin/ScreenToGif/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300 transition-colors"
          >
            <Icon name="exclamation-circle" size="sm" />
            Report a Bug
          </a>
          <a
            href="https://github.com/NickeManarin/ScreenToGif/discussions"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300 transition-colors"
          >
            <Icon name="chat-bubble-left" size="sm" />
            Discussions
          </a>
          <a
            href="https://www.screentogif.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300 transition-colors"
          >
            <Icon name="globe" size="sm" />
            Website
          </a>
        </div>
      </section>
    </div>
  );
}

AboutSection.displayName = 'AboutSection';
