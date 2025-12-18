/**
 * PlayButton Component
 * Play/pause toggle button with visual feedback
 */

import { Icon } from '../../../../components/atoms/Icon';
import { Tooltip } from '../../../../components/molecules/Tooltip';

export interface PlayButtonProps {
  /** Whether playback is currently active */
  isPlaying: boolean;
  /** Click handler */
  onClick: () => void;
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Whether the button is disabled */
  disabled?: boolean;
  className?: string;
}

const sizeStyles = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
};

const iconSizes = {
  sm: 'sm' as const,
  md: 'md' as const,
  lg: 'lg' as const,
};

export function PlayButton({
  isPlaying,
  onClick,
  size = 'md',
  disabled = false,
  className = '',
}: PlayButtonProps) {
  return (
    <Tooltip content={isPlaying ? 'Pause (Space)' : 'Play (Space)'}>
      <button
        onClick={onClick}
        disabled={disabled}
        className={`
          flex items-center justify-center
          rounded-full
          transition-all duration-200
          ${isPlaying
            ? 'bg-accent-success text-white hover:bg-accent-success/90'
            : 'bg-primary-600 text-white hover:bg-primary-500'
          }
          disabled:opacity-50 disabled:cursor-not-allowed
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-surface-900
          ${sizeStyles[size]}
          ${className}
        `}
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        <Icon name={isPlaying ? 'pause' : 'play'} size={iconSizes[size]} />
      </button>
    </Tooltip>
  );
}
