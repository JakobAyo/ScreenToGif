/**
 * FrameNavigator Component
 * Navigation controls for moving between frames
 */

import { useCallback } from 'react';
import { Icon } from '../../../../components/atoms/Icon';
import { Tooltip } from '../../../../components/molecules/Tooltip';
import { NumberInput } from '../../../../components/molecules/NumberInput';

export interface FrameNavigatorProps {
  /** Current frame index (0-based) */
  currentFrame: number;
  /** Total number of frames */
  totalFrames: number;
  /** Go to first frame */
  onFirst: () => void;
  /** Go to previous frame */
  onPrevious: () => void;
  /** Go to next frame */
  onNext: () => void;
  /** Go to last frame */
  onLast: () => void;
  /** Go to specific frame */
  onGoToFrame: (index: number) => void;
  /** Whether navigation is disabled (e.g., during playback) */
  disabled?: boolean;
  /** Show frame input */
  showInput?: boolean;
  /** Compact mode */
  compact?: boolean;
  className?: string;
}

export function FrameNavigator({
  currentFrame,
  totalFrames,
  onFirst,
  onPrevious,
  onNext,
  onLast,
  onGoToFrame,
  disabled = false,
  showInput = true,
  compact = false,
  className = '',
}: FrameNavigatorProps) {
  // Handle frame input change
  const handleFrameChange = useCallback(
    (value: number) => {
      // Convert to 0-based index
      onGoToFrame(value - 1);
    },
    [onGoToFrame]
  );

  // Button styles
  const buttonStyles = `
    flex items-center justify-center
    ${compact ? 'w-7 h-7' : 'w-8 h-8'}
    rounded-lg
    text-surface-400 hover:text-surface-200 hover:bg-surface-700
    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent
    transition-colors
  `;

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {/* First frame */}
      <Tooltip content="First frame (Home)">
        <button
          onClick={onFirst}
          disabled={disabled || currentFrame === 0}
          className={buttonStyles}
          aria-label="Go to first frame"
        >
          <Icon name="skip-back" size={compact ? 'sm' : 'md'} />
        </button>
      </Tooltip>

      {/* Previous frame */}
      <Tooltip content="Previous frame (←)">
        <button
          onClick={onPrevious}
          disabled={disabled || currentFrame === 0}
          className={buttonStyles}
          aria-label="Go to previous frame"
        >
          <Icon name="chevron-left" size={compact ? 'sm' : 'md'} />
        </button>
      </Tooltip>

      {/* Frame counter/input */}
      {showInput && (
        <div className="flex items-center gap-1 mx-1">
          <NumberInput
            value={currentFrame + 1}
            min={1}
            max={totalFrames || 1}
            step={1}
            onChange={handleFrameChange}
            disabled={disabled}
            className={compact ? 'w-14' : 'w-16'}
          />
          <span className="text-sm text-surface-500">/ {totalFrames}</span>
        </div>
      )}

      {/* Next frame */}
      <Tooltip content="Next frame (→)">
        <button
          onClick={onNext}
          disabled={disabled || currentFrame >= totalFrames - 1}
          className={buttonStyles}
          aria-label="Go to next frame"
        >
          <Icon name="chevron-right" size={compact ? 'sm' : 'md'} />
        </button>
      </Tooltip>

      {/* Last frame */}
      <Tooltip content="Last frame (End)">
        <button
          onClick={onLast}
          disabled={disabled || currentFrame >= totalFrames - 1}
          className={buttonStyles}
          aria-label="Go to last frame"
        >
          <Icon name="skip-forward" size={compact ? 'sm' : 'md'} />
        </button>
      </Tooltip>
    </div>
  );
}
