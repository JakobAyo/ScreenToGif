/**
 * ReverseFramesButton Component
 * Button to reverse the order of selected frames
 */

import { Icon } from '../../../../components/atoms/Icon';
import { Button } from '../../../../components/atoms/Button';
import { Tooltip } from '../../../../components/molecules/Tooltip';

export interface ReverseFramesButtonProps {
  /** Number of selected frames */
  selectedCount: number;
  /** Reverse handler */
  onReverse: () => void;
  /** Whether reverse is in progress */
  isReversing?: boolean;
  /** Compact mode (icon only) */
  compact?: boolean;
  className?: string;
}

export function ReverseFramesButton({
  selectedCount,
  onReverse,
  isReversing = false,
  compact = false,
  className = '',
}: ReverseFramesButtonProps) {
  const isDisabled = selectedCount < 2 || isReversing;

  if (compact) {
    return (
      <Tooltip
        content={
          selectedCount < 2
            ? 'Select at least 2 frames to reverse'
            : `Reverse ${selectedCount} frames`
        }
      >
        <button
          onClick={onReverse}
          disabled={isDisabled}
          className={`
            flex items-center justify-center
            w-8 h-8 rounded-lg
            text-surface-400 hover:text-surface-200 hover:bg-surface-700
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent
            transition-colors
            ${className}
          `}
          aria-label="Reverse selected frames"
        >
          <Icon name="arrows-right-left" size="md" />
        </button>
      </Tooltip>
    );
  }

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={onReverse}
      disabled={isDisabled}
      isLoading={isReversing}
      leftIcon={<Icon name="arrows-right-left" size="sm" />}
      className={className}
    >
      Reverse ({selectedCount})
    </Button>
  );
}
