/**
 * FrameRateSettings Component
 * Settings for default recording frame rate
 */

import { useSettingsStore } from '../../../../stores/settingsStore';
import { Slider } from '../../../../components/atoms/Slider';
import { Icon } from '../../../../components/atoms/Icon';

export interface FrameRateSettingsProps {
  disabled?: boolean;
  className?: string;
}

const FRAME_RATE_PRESETS = [
  { value: 10, label: '10 fps', description: 'Smaller file size, lower quality' },
  { value: 15, label: '15 fps', description: 'Good balance (recommended)' },
  { value: 24, label: '24 fps', description: 'Smooth motion' },
  { value: 30, label: '30 fps', description: 'Very smooth, larger files' },
  { value: 60, label: '60 fps', description: 'Highest quality, largest files' },
];

export function FrameRateSettings({ disabled = false, className = '' }: FrameRateSettingsProps) {
  const defaultFrameRate = useSettingsStore((state) => state.defaultFrameRate);
  const setDefaultFrameRate = useSettingsStore((state) => state.setDefaultFrameRate);

  const selectedPreset = FRAME_RATE_PRESETS.find((p) => p.value === defaultFrameRate);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-surface-200">Default frame rate</label>
        <span className="text-sm font-mono text-primary-400">{defaultFrameRate} fps</span>
      </div>

      <Slider
        value={defaultFrameRate}
        onChange={(e) => setDefaultFrameRate(Number(e.target.value))}
        min={1}
        max={60}
        step={1}
        disabled={disabled}
      />

      {/* Preset buttons */}
      <div className="flex flex-wrap gap-2">
        {FRAME_RATE_PRESETS.map((preset) => (
          <button
            key={preset.value}
            type="button"
            onClick={() => setDefaultFrameRate(preset.value)}
            disabled={disabled}
            className={`
              px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
              ${
                defaultFrameRate === preset.value
                  ? 'bg-primary-500 text-white'
                  : 'bg-surface-700 text-surface-300 hover:bg-surface-600'
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Description */}
      <div className="flex items-start gap-2 p-3 bg-surface-800 rounded-lg border border-surface-700">
        <Icon name="info-circle" size="sm" className="text-surface-400 mt-0.5" />
        <div className="text-xs text-surface-400">
          {selectedPreset ? (
            <span>{selectedPreset.description}</span>
          ) : (
            <span>
              Custom frame rate: {defaultFrameRate} fps.{' '}
              {defaultFrameRate < 10
                ? 'Very low quality, minimal file size.'
                : defaultFrameRate < 24
                  ? 'Good for most use cases.'
                  : 'High quality, larger file size.'}
            </span>
          )}
        </div>
      </div>

      <p className="text-xs text-surface-500">
        Higher frame rates produce smoother animations but result in larger file sizes. 15 fps is
        recommended for most screen recordings.
      </p>
    </div>
  );
}

FrameRateSettings.displayName = 'FrameRateSettings';
