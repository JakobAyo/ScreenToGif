/**
 * PlaybackControls Component
 * Complete playback control bar with play/pause, navigation, and speed controls
 */

import { useCallback, useState } from 'react';
import { Icon } from '../../../../components/atoms/Icon';
import { Tooltip } from '../../../../components/molecules/Tooltip';
import { Slider } from '../../../../components/atoms/Slider';
import { PlayButton } from './PlayButton';
import { FrameNavigator } from './FrameNavigator';

export interface PlaybackControlsProps {
  /** Current frame index (0-based) */
  currentFrame: number;
  /** Total number of frames */
  totalFrames: number;
  /** Whether playback is active */
  isPlaying: boolean;
  /** Playback speed (1.0 = normal) */
  playbackSpeed: number;
  /** Whether looping is enabled */
  isLooping: boolean;
  /** Current time position in milliseconds */
  currentTime?: number;
  /** Total duration in milliseconds */
  totalDuration?: number;

  // Callbacks
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onTogglePlayback: () => void;
  onFirstFrame: () => void;
  onPreviousFrame: () => void;
  onNextFrame: () => void;
  onLastFrame: () => void;
  onGoToFrame: (index: number) => void;
  onSpeedChange: (speed: number) => void;
  onLoopToggle: (looping: boolean) => void;

  /** Compact mode for smaller spaces */
  compact?: boolean;
  className?: string;
}

const SPEED_PRESETS = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 4.0];

export function PlaybackControls({
  currentFrame,
  totalFrames,
  isPlaying,
  playbackSpeed,
  isLooping,
  currentTime = 0,
  totalDuration = 0,
  onPlay,
  onPause,
  onStop,
  onTogglePlayback,
  onFirstFrame,
  onPreviousFrame,
  onNextFrame,
  onLastFrame,
  onGoToFrame,
  onSpeedChange,
  onLoopToggle,
  compact = false,
  className = '',
}: PlaybackControlsProps) {
  const [showSpeedDropdown, setShowSpeedDropdown] = useState(false);

  // Format time display
  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const remainingMs = ms % 1000;

    if (minutes > 0) {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}.${Math.floor(remainingMs / 100)}`;
    }
    return `${remainingSeconds}.${Math.floor(remainingMs / 100)}s`;
  };

  // Handle speed preset selection
  const handleSpeedPreset = useCallback(
    (speed: number) => {
      onSpeedChange(speed);
      setShowSpeedDropdown(false);
    },
    [onSpeedChange]
  );

  return (
    <div
      className={`
        flex items-center gap-2
        ${compact ? 'h-10' : 'h-12'}
        px-3
        bg-surface-800
        border-t border-surface-700
        ${className}
      `}
    >
      {/* Play/Stop controls */}
      <div className="flex items-center gap-1">
        <PlayButton
          isPlaying={isPlaying}
          onClick={onTogglePlayback}
          size={compact ? 'sm' : 'md'}
          disabled={totalFrames === 0}
        />

        <Tooltip content="Stop (S)">
          <button
            onClick={onStop}
            disabled={totalFrames === 0}
            className={`
              flex items-center justify-center
              ${compact ? 'w-7 h-7' : 'w-8 h-8'}
              rounded-lg
              text-surface-400 hover:text-surface-200 hover:bg-surface-700
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors
            `}
            aria-label="Stop"
          >
            <Icon name="stop" size={compact ? 'sm' : 'md'} />
          </button>
        </Tooltip>
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-surface-700" />

      {/* Frame navigation */}
      <FrameNavigator
        currentFrame={currentFrame}
        totalFrames={totalFrames}
        onFirst={onFirstFrame}
        onPrevious={onPreviousFrame}
        onNext={onNextFrame}
        onLast={onLastFrame}
        onGoToFrame={onGoToFrame}
        disabled={isPlaying}
        showInput={!compact}
        compact={compact}
      />

      {/* Divider */}
      <div className="w-px h-6 bg-surface-700" />

      {/* Time display */}
      {!compact && totalDuration > 0 && (
        <div className="text-xs font-mono text-surface-400 min-w-[100px]">
          {formatTime(currentTime)} / {formatTime(totalDuration)}
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Loop toggle */}
      <Tooltip content={isLooping ? 'Disable loop' : 'Enable loop'}>
        <button
          onClick={() => onLoopToggle(!isLooping)}
          className={`
            flex items-center justify-center
            ${compact ? 'w-7 h-7' : 'w-8 h-8'}
            rounded-lg
            transition-colors
            ${isLooping
              ? 'text-primary-400 bg-primary-600/20'
              : 'text-surface-400 hover:text-surface-200 hover:bg-surface-700'
            }
          `}
          aria-label={isLooping ? 'Disable loop' : 'Enable loop'}
          aria-pressed={isLooping}
        >
          <Icon name="arrow-path" size={compact ? 'sm' : 'md'} />
        </button>
      </Tooltip>

      {/* Speed control */}
      <div className="relative">
        <Tooltip content="Playback speed">
          <button
            onClick={() => setShowSpeedDropdown(!showSpeedDropdown)}
            className={`
              flex items-center gap-1
              ${compact ? 'px-2 py-1' : 'px-2.5 py-1.5'}
              rounded-lg
              text-xs font-mono
              ${playbackSpeed !== 1.0
                ? 'text-primary-400 bg-primary-600/20'
                : 'text-surface-400 bg-surface-700 hover:bg-surface-600'
              }
              transition-colors
            `}
          >
            {playbackSpeed}×
            <Icon name="chevron-down" size="sm" />
          </button>
        </Tooltip>

        {/* Speed dropdown */}
        {showSpeedDropdown && (
          <>
            {/* Backdrop to close dropdown */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowSpeedDropdown(false)}
            />
            <div
              className="
                absolute bottom-full right-0 mb-1 z-50
                w-32 py-1
                bg-surface-800 rounded-lg
                border border-surface-700
                shadow-xl
              "
            >
              {SPEED_PRESETS.map((speed) => (
                <button
                  key={speed}
                  onClick={() => handleSpeedPreset(speed)}
                  className={`
                    w-full px-3 py-1.5 text-left text-xs
                    ${playbackSpeed === speed
                      ? 'text-primary-400 bg-primary-600/20'
                      : 'text-surface-300 hover:bg-surface-700'
                    }
                  `}
                >
                  {speed}× {speed === 1.0 && '(Normal)'}
                </button>
              ))}

              <div className="h-px bg-surface-700 my-1" />

              {/* Custom speed slider */}
              <div className="px-3 py-2">
                <label className="text-[10px] text-surface-500 mb-1 block">Custom</label>
                <Slider
                  min={0.25}
                  max={4}
                  step={0.25}
                  value={playbackSpeed}
                  onChange={(e) => onSpeedChange(Number(e.target.value))}
                  size="sm"
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
