/**
 * DefaultToolSettings Component
 * Settings for default editor tool behavior and appearance
 */

import { useSettingsStore } from '../../../../stores/settingsStore';
import { Toggle } from '../../../../components/atoms/Toggle';
import { Icon, type IconName } from '../../../../components/atoms/Icon';

export interface DefaultToolSettingsProps {
  disabled?: boolean;
  className?: string;
}

interface ThumbnailSizeOption {
  value: 'small' | 'medium' | 'large';
  label: string;
  size: string;
}

const thumbnailSizeOptions: ThumbnailSizeOption[] = [
  { value: 'small', label: 'Small', size: '64px' },
  { value: 'medium', label: 'Medium', size: '96px' },
  { value: 'large', label: 'Large', size: '128px' },
];

export function DefaultToolSettings({ disabled = false, className = '' }: DefaultToolSettingsProps) {
  const {
    defaultThumbnailSize,
    thumbnailQuality,
    showFrameNumbers,
    showFrameDelays,
    defaultPlaybackLoop,
    setDefaultThumbnailSize,
    setThumbnailQuality,
    setShowFrameNumbers,
    setShowFrameDelays,
    setDefaultPlaybackLoop,
  } = useSettingsStore();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Timeline Settings */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-surface-300 flex items-center gap-2">
          <Icon name="photo" size="sm" className="text-surface-400" />
          Timeline
        </h4>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-surface-200">Thumbnail size</label>
          <div className="flex gap-2">
            {thumbnailSizeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setDefaultThumbnailSize(option.value)}
                disabled={disabled}
                className={`
                  flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${
                    defaultThumbnailSize === option.value
                      ? 'bg-primary-500 text-white'
                      : 'bg-surface-700 text-surface-300 hover:bg-surface-600'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                <div>{option.label}</div>
                <div className="text-xs opacity-70">{option.size}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-surface-200">Thumbnail quality</label>
          <div className="flex gap-2">
            {(['low', 'medium', 'high'] as const).map((quality) => (
              <button
                key={quality}
                type="button"
                onClick={() => setThumbnailQuality(quality)}
                disabled={disabled}
                className={`
                  flex-1 px-3 py-2 rounded-lg text-sm font-medium capitalize transition-colors
                  ${
                    thumbnailQuality === quality
                      ? 'bg-primary-500 text-white'
                      : 'bg-surface-700 text-surface-300 hover:bg-surface-600'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                {quality}
              </button>
            ))}
          </div>
          <p className="text-xs text-surface-500">
            Higher quality thumbnails use more memory
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <label className="block text-sm font-medium text-surface-200">Show frame numbers</label>
            <p className="text-xs text-surface-500">Display frame index on thumbnails</p>
          </div>
          <Toggle
            checked={showFrameNumbers}
            onChange={(e) => setShowFrameNumbers(e.target.checked)}
            disabled={disabled}
            size="sm"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <label className="block text-sm font-medium text-surface-200">Show frame delays</label>
            <p className="text-xs text-surface-500">Display delay time on thumbnails</p>
          </div>
          <Toggle
            checked={showFrameDelays}
            onChange={(e) => setShowFrameDelays(e.target.checked)}
            disabled={disabled}
            size="sm"
          />
        </div>
      </div>

      {/* Playback Settings */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-surface-300 flex items-center gap-2">
          <Icon name="play" size="sm" className="text-surface-400" />
          Playback
        </h4>

        <div className="flex items-center justify-between">
          <div>
            <label className="block text-sm font-medium text-surface-200">Loop playback</label>
            <p className="text-xs text-surface-500">Automatically loop when previewing</p>
          </div>
          <Toggle
            checked={defaultPlaybackLoop}
            onChange={(e) => setDefaultPlaybackLoop(e.target.checked)}
            disabled={disabled}
            size="sm"
          />
        </div>
      </div>
    </div>
  );
}

DefaultToolSettings.displayName = 'DefaultToolSettings';
