/**
 * LanguageSelector Component
 * Dropdown for selecting application language/locale
 */

import { useCallback } from 'react';
import { useSettingsStore, type AppLocale } from '../../../../stores/settingsStore';
import { LocalizationService, SUPPORTED_LOCALES } from '../../../../services/LocalizationService';
import { Icon } from '../../../../components/atoms/Icon';

export interface LanguageSelectorProps {
  disabled?: boolean;
  className?: string;
}

export function LanguageSelector({ disabled = false, className = '' }: LanguageSelectorProps) {
  const locale = useSettingsStore((state) => state.locale);
  const setLocale = useSettingsStore((state) => state.setLocale);

  const handleLocaleChange = useCallback(
    async (newLocale: AppLocale) => {
      setLocale(newLocale);
      await LocalizationService.setLocale(newLocale);
    },
    [setLocale]
  );

  const locales = LocalizationService.getSupportedLocales();

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-surface-200">Language</label>
      <div className="relative">
        <select
          value={locale}
          onChange={(e) => handleLocaleChange(e.target.value as AppLocale)}
          disabled={disabled}
          className="
            w-full appearance-none
            bg-surface-800 border border-surface-600
            text-surface-200
            px-3 py-2 pr-10
            rounded-lg
            focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors
          "
        >
          {locales.map(({ code, name }) => (
            <option key={code} value={code}>
              {name} ({code.toUpperCase()})
            </option>
          ))}
        </select>
        <Icon
          name="chevron-down"
          size="sm"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none"
        />
      </div>
      <p className="text-xs text-surface-500">
        Select your preferred language. Some translations may be incomplete.
      </p>
    </div>
  );
}

LanguageSelector.displayName = 'LanguageSelector';
