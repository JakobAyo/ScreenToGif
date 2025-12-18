/**
 * RecordingTimer Component
 * Display elapsed recording time with optional frame count and FPS
 */

import { useMemo } from 'react';

export interface RecordingTimerProps {
  duration: number; // in milliseconds
  isRecording?: boolean;
  isPaused?: boolean;
  frameCount?: number;
  fps?: number;
  showFrameCount?: boolean;
  showFps?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeStyles = {
  sm: {
    time: 'text-sm',
    stats: 'text-xs',
    indicator: 'w-1.5 h-1.5',
  },
  md: {
    time: 'text-lg',
    stats: 'text-sm',
    indicator: 'w-2 h-2',
  },
  lg: {
    time: 'text-2xl',
    stats: 'text-base',
    indicator: 'w-2.5 h-2.5',
  },
};

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const centiseconds = Math.floor((ms % 1000) / 10);

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
}

export function RecordingTimer({
  duration,
  isRecording = false,
  isPaused = false,
  frameCount = 0,
  fps = 0,
  showFrameCount = true,
  showFps = true,
  size = 'md',
  className = '',
}: RecordingTimerProps) {
  const styles = sizeStyles[size];
  const formattedDuration = useMemo(() => formatDuration(duration), [duration]);

  const activeRecording = isRecording && !isPaused;

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {/* Duration display */}
      <div className="flex items-center gap-2">
        <span
          className={`
            font-mono tabular-nums font-medium
            ${styles.time}
            ${activeRecording ? 'text-accent-error' : isPaused ? 'text-amber-500' : 'text-surface-300'}
          `}
        >
          {formattedDuration}
        </span>

        {/* Recording indicator */}
        {activeRecording && (
          <span
            className={`
              rounded-full bg-accent-error animate-pulse
              ${styles.indicator}
            `}
          />
        )}

        {/* Paused indicator */}
        {isPaused && (
          <span
            className={`
              rounded-full bg-amber-500
              ${styles.indicator}
            `}
          />
        )}
      </div>

      {/* Stats */}
      {(showFrameCount || showFps) && (
        <div className={`flex items-center gap-3 text-surface-400 ${styles.stats}`}>
          {showFrameCount && (
            <span className="font-mono tabular-nums">
              {frameCount.toLocaleString()} frames
            </span>
          )}
          {showFps && fps > 0 && (
            <span className="font-mono tabular-nums">
              {fps.toFixed(1)} fps
            </span>
          )}
        </div>
      )}
    </div>
  );
}

RecordingTimer.displayName = 'RecordingTimer';
