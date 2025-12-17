/**
 * CaptureSettings Component
 * Settings for capture quality, cursor visibility, and click highlighting
 */

import { useSettingsStore } from '../../../../stores/settingsStore';
import { Toggle } from '../../../../components/atoms/Toggle';
import { Icon } from '../../../../components/atoms/Icon';

export interface CaptureSettingsProps {
  disabled?: boolean;
  className?: string;
}

export function CaptureSettings({ disabled = false, className = '' }: CaptureSettingsProps) {
  const {
    defaultCaptureMouseCursor,
    defaultCaptureMouseClicks,
    showCountdown,
    countdownDuration,
    playStartSound,
    playStopSound,
    setDefaultCaptureMouseCursor,
    setDefaultCaptureMouseClicks,
    setShowCountdown,
    setCountdownDuration,
    setPlayStartSound,
    setPlayStopSound,
  } = useSettingsStore();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Mouse Settings */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-surface-300 flex items-center gap-2">
          <Icon name="cursor" size="sm" className="text-surface-400" />
          Mouse Cursor
        </h4>

        <div className="flex items-center justify-between">
          <div>
            <label className="block text-sm font-medium text-surface-200">
              Capture mouse cursor
            </label>
            <p className="text-xs text-surface-500">
              Include the cursor in recordings
            </p>
          </div>
          <Toggle
            checked={defaultCaptureMouseCursor}
            onChange={(e) => setDefaultCaptureMouseCursor(e.target.checked)}
            disabled={disabled}
            size="sm"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <label className="block text-sm font-medium text-surface-200">
              Highlight mouse clicks
            </label>
            <p className="text-xs text-surface-500">
              Show visual feedback when clicking
            </p>
          </div>
          <Toggle
            checked={defaultCaptureMouseClicks}
            onChange={(e) => setDefaultCaptureMouseClicks(e.target.checked)}
            disabled={disabled || !defaultCaptureMouseCursor}
            size="sm"
          />
        </div>
      </div>

      {/* Countdown Settings */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-surface-300 flex items-center gap-2">
          <Icon name="clock" size="sm" className="text-surface-400" />
          Recording Start
        </h4>

        <div className="flex items-center justify-between">
          <div>
            <label className="block text-sm font-medium text-surface-200">Show countdown</label>
            <p className="text-xs text-surface-500">
              Display a countdown before recording starts
            </p>
          </div>
          <Toggle
            checked={showCountdown}
            onChange={(e) => setShowCountdown(e.target.checked)}
            disabled={disabled}
            size="sm"
          />
        </div>

        {showCountdown && (
          <div className="ml-4 pl-4 border-l border-surface-700">
            <label className="block text-sm font-medium text-surface-200 mb-2">
              Countdown duration
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 5, 10].map((seconds) => (
                <button
                  key={seconds}
                  type="button"
                  onClick={() => setCountdownDuration(seconds)}
                  disabled={disabled}
                  className={`
                    px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                    ${
                      countdownDuration === seconds
                        ? 'bg-primary-500 text-white'
                        : 'bg-surface-700 text-surface-300 hover:bg-surface-600'
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  {seconds}s
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sound Settings */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-surface-300 flex items-center gap-2">
          <Icon name="volume-up" size="sm" className="text-surface-400" />
          Audio Feedback
        </h4>

        <div className="flex items-center justify-between">
          <div>
            <label className="block text-sm font-medium text-surface-200">
              Play sound on start
            </label>
            <p className="text-xs text-surface-500">
              Audio cue when recording begins
            </p>
          </div>
          <Toggle
            checked={playStartSound}
            onChange={(e) => setPlayStartSound(e.target.checked)}
            disabled={disabled}
            size="sm"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <label className="block text-sm font-medium text-surface-200">
              Play sound on stop
            </label>
            <p className="text-xs text-surface-500">
              Audio cue when recording ends
            </p>
          </div>
          <Toggle
            checked={playStopSound}
            onChange={(e) => setPlayStopSound(e.target.checked)}
            disabled={disabled}
            size="sm"
          />
        </div>
      </div>
    </div>
  );
}

CaptureSettings.displayName = 'CaptureSettings';
