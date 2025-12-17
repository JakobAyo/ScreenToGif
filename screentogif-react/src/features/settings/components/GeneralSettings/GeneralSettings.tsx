/**
 * GeneralSettings Component
 * Container for general application settings
 */

import { useSettingsStore } from '../../../../stores/settingsStore';
import { Toggle } from '../../../../components/atoms/Toggle';
import { Slider } from '../../../../components/atoms/Slider';
import { LanguageSelector } from './LanguageSelector';
import { ThemeSelector } from './ThemeSelector';
import { StartupOptions } from './StartupOptions';

export interface GeneralSettingsProps {
  className?: string;
}

export function GeneralSettings({ className = '' }: GeneralSettingsProps) {
  const {
    fontSize,
    showTooltips,
    animationsEnabled,
    reducedMotion,
    setFontSize,
    setShowTooltips,
    setAnimationsEnabled,
    setReducedMotion,
  } = useSettingsStore();

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Appearance Section */}
      <section>
        <h3 className="text-lg font-semibold text-surface-100 mb-4">Appearance</h3>
        <div className="space-y-6">
          <ThemeSelector />
          <LanguageSelector />

          {/* Font Size */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-surface-200">
                Interface scale
              </label>
              <span className="text-sm text-surface-400">{fontSize}px</span>
            </div>
            <Slider
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              min={12}
              max={18}
              step={1}
            />
            <p className="text-xs text-surface-500">
              Adjust the size of text and UI elements (12-18px)
            </p>
          </div>
        </div>
      </section>

      {/* Startup Section */}
      <section>
        <h3 className="text-lg font-semibold text-surface-100 mb-4">Startup</h3>
        <StartupOptions />
      </section>

      {/* Accessibility Section */}
      <section>
        <h3 className="text-lg font-semibold text-surface-100 mb-4">Accessibility</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium text-surface-200">Show tooltips</label>
              <p className="text-xs text-surface-500">Display helpful hints when hovering</p>
            </div>
            <Toggle
              checked={showTooltips}
              onChange={(e) => setShowTooltips(e.target.checked)}
              size="sm"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium text-surface-200">Animations</label>
              <p className="text-xs text-surface-500">Enable smooth transitions and animations</p>
            </div>
            <Toggle
              checked={animationsEnabled}
              onChange={(e) => setAnimationsEnabled(e.target.checked)}
              size="sm"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium text-surface-200">Reduced motion</label>
              <p className="text-xs text-surface-500">
                Minimize animations for motion sensitivity
              </p>
            </div>
            <Toggle
              checked={reducedMotion}
              onChange={(e) => setReducedMotion(e.target.checked)}
              disabled={!animationsEnabled}
              size="sm"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

GeneralSettings.displayName = 'GeneralSettings';
