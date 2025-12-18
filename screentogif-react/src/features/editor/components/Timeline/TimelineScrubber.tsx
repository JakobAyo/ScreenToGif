/**
 * TimelineScrubber Component
 * Playhead control for navigating and scrubbing through frames
 */

import { useCallback, useRef, useState, useEffect } from 'react';

export interface TimelineScrubberProps {
  /** Current frame index (0-based) */
  currentFrame: number;
  /** Total number of frames */
  totalFrames: number;
  /** Width of each frame thumbnail in pixels */
  frameWidth: number;
  /** Zoom level (1.0 = 100%) */
  zoom: number;
  /** Height of the scrubber line */
  height: number;
  /** Scroll offset in pixels */
  scrollOffset?: number;
  /** Whether playback is currently active */
  isPlaying?: boolean;
  /** Callback when frame position changes */
  onFrameChange?: (frameIndex: number) => void;
  /** Callback when scrubbing starts */
  onScrubStart?: () => void;
  /** Callback when scrubbing ends */
  onScrubEnd?: () => void;
  className?: string;
}

export function TimelineScrubber({
  currentFrame,
  totalFrames,
  frameWidth,
  zoom,
  height,
  scrollOffset = 0,
  isPlaying = false,
  onFrameChange,
  onScrubStart,
  onScrubEnd,
  className = '',
}: TimelineScrubberProps) {
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate dimensions
  const effectiveFrameWidth = frameWidth * zoom;
  const totalWidth = effectiveFrameWidth * totalFrames;
  const playheadPosition = (currentFrame + 0.5) * effectiveFrameWidth - scrollOffset;

  // Convert pixel position to frame index
  const positionToFrame = useCallback(
    (clientX: number): number => {
      if (!containerRef.current || totalFrames === 0) return 0;

      const rect = containerRef.current.getBoundingClientRect();
      const relativeX = clientX - rect.left + scrollOffset;
      const frameIndex = Math.floor(relativeX / effectiveFrameWidth);

      return Math.max(0, Math.min(totalFrames - 1, frameIndex));
    },
    [effectiveFrameWidth, scrollOffset, totalFrames]
  );

  // Handle mouse down on playhead
  const handlePlayheadMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
      onScrubStart?.();
    },
    [onScrubStart]
  );

  // Handle click on track to jump to position
  const handleTrackClick = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging) return;

      const newFrame = positionToFrame(e.clientX);
      onFrameChange?.(newFrame);
    },
    [isDragging, positionToFrame, onFrameChange]
  );

  // Handle mouse move during drag
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newFrame = positionToFrame(e.clientX);
      onFrameChange?.(newFrame);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      onScrubEnd?.();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, positionToFrame, onFrameChange, onScrubEnd]);

  // Only show if we have frames
  if (totalFrames === 0) return null;

  return (
    <div
      ref={containerRef}
      className={`
        absolute top-0 left-0 right-0 pointer-events-none z-20
        ${className}
      `}
      style={{ height }}
    >
      {/* Clickable track area (invisible, for jumping to position) */}
      <div
        className="absolute top-0 left-0 right-0 h-full pointer-events-auto cursor-pointer"
        onClick={handleTrackClick}
      />

      {/* Playhead */}
      <div
        className={`
          absolute top-0 z-30 pointer-events-auto
          ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}
        `}
        style={{
          left: playheadPosition,
          height: '100%',
          transform: 'translateX(-50%)',
        }}
        onMouseDown={handlePlayheadMouseDown}
      >
        {/* Playhead head (draggable handle) */}
        <div
          className={`
            absolute -top-1 left-1/2 -translate-x-1/2
            w-4 h-4 rounded-sm rotate-45
            ${isPlaying ? 'bg-accent-success' : 'bg-primary-500'}
            ${isDragging ? 'scale-110' : 'hover:scale-105'}
            transition-transform shadow-md
          `}
        />

        {/* Playhead line */}
        <div
          className={`
            absolute top-3 left-1/2 -translate-x-1/2
            w-0.5
            ${isPlaying ? 'bg-accent-success' : 'bg-primary-500'}
            shadow-sm
          `}
          style={{ height: height - 12 }}
        />

        {/* Frame indicator */}
        <div
          className={`
            absolute top-5 left-1/2 -translate-x-1/2
            px-1.5 py-0.5 rounded
            text-xs font-mono whitespace-nowrap
            ${isDragging || !isPlaying ? 'opacity-100' : 'opacity-0'}
            bg-surface-900/90 text-surface-100
            pointer-events-none
            transition-opacity
          `}
        >
          {currentFrame + 1}
        </div>
      </div>

      {/* Frame position markers (optional, only shown when dragging) */}
      {isDragging && (
        <div
          className="absolute top-0 left-0 right-0 h-full pointer-events-none"
          style={{ width: totalWidth, transform: `translateX(-${scrollOffset}px)` }}
        >
          {/* Start marker */}
          <div className="absolute top-0 left-0 w-0.5 h-full bg-surface-600 opacity-50" />
          {/* End marker */}
          <div
            className="absolute top-0 w-0.5 h-full bg-surface-600 opacity-50"
            style={{ left: totalWidth }}
          />
        </div>
      )}
    </div>
  );
}
