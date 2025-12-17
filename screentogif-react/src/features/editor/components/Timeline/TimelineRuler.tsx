/**
 * TimelineRuler Component
 * Displays time markers and duration indicators above the timeline
 */

import { useMemo } from 'react';

export interface TimelineRulerProps {
  /** Total duration in milliseconds */
  duration: number;
  /** Current playhead position in milliseconds */
  currentTime: number;
  /** Width of each frame thumbnail in pixels */
  frameWidth: number;
  /** Total number of frames */
  totalFrames: number;
  /** Zoom level (1.0 = 100%) */
  zoom: number;
  /** Scroll offset in pixels */
  scrollOffset?: number;
  /** Click handler for jumping to position */
  onPositionClick?: (time: number) => void;
  className?: string;
}

interface TimeMark {
  position: number;
  time: number;
  label: string;
  major: boolean;
}

export function TimelineRuler({
  duration,
  currentTime,
  frameWidth,
  totalFrames,
  zoom,
  scrollOffset = 0,
  onPositionClick,
  className = '',
}: TimelineRulerProps) {
  // Calculate total width
  const totalWidth = frameWidth * totalFrames * zoom;

  // Format time to display
  const formatTime = (ms: number): string => {
    if (ms < 1000) {
      return `${ms}ms`;
    }
    const seconds = ms / 1000;
    if (seconds < 60) {
      return `${seconds.toFixed(1)}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Calculate time marks
  const timeMarks = useMemo((): TimeMark[] => {
    const marks: TimeMark[] = [];
    if (totalFrames === 0 || duration === 0) return marks;

    // Determine appropriate interval based on zoom and duration
    let majorInterval: number;
    let minorInterval: number;

    if (duration < 2000) {
      majorInterval = 500;
      minorInterval = 100;
    } else if (duration < 10000) {
      majorInterval = 1000;
      minorInterval = 250;
    } else if (duration < 60000) {
      majorInterval = 5000;
      minorInterval = 1000;
    } else {
      majorInterval = 10000;
      minorInterval = 2000;
    }

    // Adjust intervals based on zoom
    if (zoom < 0.75) {
      majorInterval *= 2;
      minorInterval *= 2;
    } else if (zoom > 2) {
      majorInterval /= 2;
      minorInterval /= 2;
    }

    // Generate marks
    for (let time = 0; time <= duration; time += minorInterval) {
      const isMajor = time % majorInterval === 0;
      const position = (time / duration) * totalWidth;

      marks.push({
        position,
        time,
        label: isMajor ? formatTime(time) : '',
        major: isMajor,
      });
    }

    return marks;
  }, [duration, totalWidth, zoom, totalFrames]);

  // Calculate playhead position
  const playheadPosition = duration > 0 ? (currentTime / duration) * totalWidth : 0;

  // Handle click on ruler
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onPositionClick || duration === 0) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left + scrollOffset;
    const clickTime = (clickX / totalWidth) * duration;
    onPositionClick(Math.max(0, Math.min(duration, clickTime)));
  };

  return (
    <div
      className={`
        relative h-6 bg-surface-800 border-b border-surface-700
        cursor-pointer select-none
        ${className}
      `}
      onClick={handleClick}
    >
      {/* Time marks container */}
      <div
        className="relative h-full"
        style={{ width: totalWidth, transform: `translateX(-${scrollOffset}px)` }}
      >
        {/* Render time marks */}
        {timeMarks.map((mark, index) => (
          <div
            key={index}
            className="absolute top-0 flex flex-col items-center"
            style={{ left: mark.position }}
          >
            {/* Tick mark */}
            <div
              className={`
                w-px
                ${mark.major ? 'h-3 bg-surface-400' : 'h-1.5 bg-surface-600'}
              `}
            />
            {/* Label */}
            {mark.label && (
              <span className="text-[10px] text-surface-500 whitespace-nowrap mt-0.5">
                {mark.label}
              </span>
            )}
          </div>
        ))}

        {/* Playhead indicator */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-primary-500 z-10"
          style={{ left: playheadPosition }}
        >
          {/* Playhead top triangle */}
          <div
            className="absolute -top-0.5 left-1/2 -translate-x-1/2
              w-0 h-0
              border-l-[4px] border-l-transparent
              border-r-[4px] border-r-transparent
              border-t-[5px] border-t-primary-500"
          />
        </div>
      </div>

      {/* Current time display */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2">
        <span className="text-xs font-mono text-surface-400">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>
    </div>
  );
}
