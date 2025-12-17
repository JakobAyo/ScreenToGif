/**
 * StartupOptions Component
 * Settings for application startup behavior
 */

import { useSettingsStore, type StartupMode } from '../../../../stores/settingsStore';
import { Toggle } from '../../../../components/atoms/Toggle';
import { Icon, type IconName } from '../../../../components/atoms/Icon';

export interface StartupOptionsProps {
  disabled?: boolean;
  className?: string;
}

interface StartupModeOption {
  value: StartupMode;
  label: string;
  description: string;
  icon: IconName;
}

const startupModeOptions: StartupModeOption[] = [
  {
    value: 'startup',
    label: 'Startup Screen',
    description: 'Show the startup screen with options',
    icon: 'home',
  },
  {
    value: 'recorder',
    label: 'Recorder',
    description: 'Open directly to the recorder',
    icon: 'record',
  },
  {
    value: 'editor',
    label: 'Editor',
    description: 'Open directly to the editor',
    icon: 'pencil',
  },
  {
    value: 'lastUsed',
    label: 'Last Used',
    description: 'Remember and restore last used view',
    icon: 'clock',
  },
];

export function StartupOptions({ disabled = false, className = '' }: StartupOptionsProps) {
  const {
    startupMode,
    showStartupScreen,
    checkForUpdates,
    autoUpdate,
    setStartupMode,
    setShowStartupScreen,
    setCheckForUpdates,
    setAutoUpdate,
  } = useSettingsStore();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Startup Mode */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-surface-200">Open at startup</label>
        <div className="grid grid-cols-2 gap-2">
          {startupModeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => !disabled && setStartupMode(option.value)}
              disabled={disabled}
              className={`
                flex items-center gap-2 p-3
                rounded-lg border transition-all text-left
                ${
                  startupMode === option.value
                    ? 'bg-primary-500/10 border-primary-500 text-surface-100'
                    : 'bg-surface-800 border-surface-600 text-surface-300 hover:border-surface-500'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              <Icon
                name={option.icon}
                size="sm"
                className={startupMode === option.value ? 'text-primary-400' : 'text-surface-400'}
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{option.label}</div>
                <div className="text-xs text-surface-500 truncate">{option.description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Toggle Options */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <label className="block text-sm font-medium text-surface-200">Show startup tips</label>
            <p className="text-xs text-surface-500">Display helpful tips on the startup screen</p>
          </div>
          <Toggle
            checked={showStartupScreen}
            onChange={(e) => setShowStartupScreen(e.target.checked)}
            disabled={disabled}
            size="sm"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <label className="block text-sm font-medium text-surface-200">Check for updates</label>
            <p className="text-xs text-surface-500">
              Automatically check for new versions on startup
            </p>
          </div>
          <Toggle
            checked={checkForUpdates}
            onChange={(e) => setCheckForUpdates(e.target.checked)}
            disabled={disabled}
            size="sm"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <label className="block text-sm font-medium text-surface-200">Auto-update</label>
            <p className="text-xs text-surface-500">
              Automatically install updates when available
            </p>
          </div>
          <Toggle
            checked={autoUpdate}
            onChange={(e) => setAutoUpdate(e.target.checked)}
            disabled={disabled || !checkForUpdates}
            size="sm"
          />
        </div>
      </div>
    </div>
  );
}

StartupOptions.displayName = 'StartupOptions';
