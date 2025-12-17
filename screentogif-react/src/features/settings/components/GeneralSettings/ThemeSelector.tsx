/**
 * ThemeSelector Component
 * Selector for application theme with live preview
 */

import { useSettingsStore, type AppTheme } from '../../../../stores/settingsStore';
import { Icon, type IconName } from '../../../../components/atoms/Icon';
import { Radio, RadioGroup } from '../../../../components/atoms/Radio';

export interface ThemeSelectorProps {
  disabled?: boolean;
  className?: string;
}

interface ThemeOption {
  value: AppTheme;
  label: string;
  description: string;
  icon: IconName;
}

const themeOptions: ThemeOption[] = [
  {
    value: 'light',
    label: 'Light',
    description: 'Bright theme for well-lit environments',
    icon: 'sun',
  },
  {
    value: 'dark',
    label: 'Dark',
    description: 'Darker theme to reduce eye strain',
    icon: 'moon',
  },
  {
    value: 'system',
    label: 'System',
    description: 'Automatically match your system settings',
    icon: 'cog',
  },
];

export function ThemeSelector({ disabled = false, className = '' }: ThemeSelectorProps) {
  const theme = useSettingsStore((state) => state.theme);
  const setTheme = useSettingsStore((state) => state.setTheme);

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-sm font-medium text-surface-200">Theme</label>
      <div className="space-y-2">
        {themeOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => !disabled && setTheme(option.value)}
            disabled={disabled}
            className={`
              w-full flex items-center gap-3 p-3
              rounded-lg border transition-all
              ${
                theme === option.value
                  ? 'bg-primary-500/10 border-primary-500 text-surface-100'
                  : 'bg-surface-800 border-surface-600 text-surface-300 hover:border-surface-500'
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            <div
              className={`
              p-2 rounded-lg
              ${theme === option.value ? 'bg-primary-500/20' : 'bg-surface-700'}
            `}
            >
              <Icon
                name={option.icon}
                size="sm"
                className={theme === option.value ? 'text-primary-400' : 'text-surface-400'}
              />
            </div>
            <div className="flex-1 text-left">
              <div className="font-medium">{option.label}</div>
              <div className="text-xs text-surface-500">{option.description}</div>
            </div>
            {theme === option.value && (
              <Icon name="check" size="sm" className="text-primary-400" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

ThemeSelector.displayName = 'ThemeSelector';
