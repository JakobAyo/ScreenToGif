/**
 * TimelineTrack Component
 * A single track row displaying frames with virtualization support
 */

import { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import type { Frame } from '../../../../api/types';
import { TimelineFrame } from './TimelineFrame';

export interface TimelineTrackProps {
  /** Unique track identifier */
  trackId: string;
  /** Track name */
  name: string;
  /** Frames in this track */
  frames: Frame[];
  /** Selected frame IDs */
  selectedFrameIds: string[];
  /** Current frame index */
  currentFrameIndex: number;
  /** Thumbnail size */
  thumbnailSize: 'small' | 'medium' | 'large';
  /** Zoom level */
  zoom: number;
  /** Whether to show frame numbers */
  showFrameNumbers?: boolean;
  /** Whether to show frame delays */
  showFrameDelays?: boolean;
  /** Whether this track is muted */
  isMuted?: boolean;
  /** Whether this track is locked */
  isLocked?: boolean;
  /** Whether this track is visible */
  isVisible?: boolean;
  /** Scroll container reference for virtualization */
  scrollContainerRef?: React.RefObject<HTMLDivElement>;
  /** Frame click handler */
  onFrameClick?: (frameId: string, index: number, event: React.MouseEvent) => void;
  /** Frame double click handler */
  onFrameDoubleClick?: (frameId: string, index: number) => void;
  /** Frame context menu handler */
  onFrameContextMenu?: (frameId: string, index: number, event: React.MouseEvent) => void;
  /** Frame reorder handler */
  onFrameReorder?: (fromIndex: number, toIndex: number) => void;
  /** Track visibility toggle */
  onToggleVisibility?: (trackId: string) => void;
  /** Track mute toggle */
  onToggleMute?: (trackId: string) => void;
  /** Track lock toggle */
  onToggleLock?: (trackId: string) => void;
  className?: string;
}

const thumbnailSizes = {
  small: { width: 48, height: 36, gap: 2 },
  medium: { width: 64, height: 48, gap: 4 },
  large: { width: 96, height: 72, gap: 6 },
};

export function TimelineTrack({
  trackId,
  name,
  frames,
  selectedFrameIds,
  currentFrameIndex,
  thumbnailSize,
  zoom,
  showFrameNumbers = true,
  showFrameDelays = false,
  isMuted = false,
  isLocked = false,
  isVisible = true,
  scrollContainerRef,
  onFrameClick,
  onFrameDoubleClick,
  onFrameContextMenu,
  onFrameReorder,
  onToggleVisibility,
  onToggleMute,
  onToggleLock,
  className = '',
}: TimelineTrackProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 50 });
  const [dragSourceIndex, setDragSourceIndex] = useState<number | null>(null);
  const [dragTargetIndex, setDragTargetIndex] = useState<number | null>(null);

  const config = thumbnailSizes[thumbnailSize];
  const effectiveWidth = config.width * zoom;
  const effectiveGap = config.gap * zoom;
  const itemWidth = effectiveWidth + effectiveGap;
  const totalWidth = itemWidth * frames.length;

  // Calculate visible range based on scroll position
  useEffect(() => {
    const container = scrollContainerRef?.current;
    if (!container) return;

    const updateVisibleRange = () => {
      const scrollLeft = container.scrollLeft;
      const containerWidth = container.clientWidth;
      const buffer = 5; // Render extra frames on each side

      const startIndex = Math.max(0, Math.floor(scrollLeft / itemWidth) - buffer);
      const endIndex = Math.min(
        frames.length,
        Math.ceil((scrollLeft + containerWidth) / itemWidth) + buffer
      );

      setVisibleRange({ start: startIndex, end: endIndex });
    };

    updateVisibleRange();
    container.addEventListener('scroll', updateVisibleRange);
    window.addEventListener('resize', updateVisibleRange);

    return () => {
      container.removeEventListener('scroll', updateVisibleRange);
      window.removeEventListener('resize', updateVisibleRange);
    };
  }, [scrollContainerRef, itemWidth, frames.length]);

  // Get visible frames with their positions
  const visibleFrames = useMemo(() => {
    return frames
      .slice(visibleRange.start, visibleRange.end)
      .map((frame, relativeIndex) => ({
        frame,
        index: visibleRange.start + relativeIndex,
        left: (visibleRange.start + relativeIndex) * itemWidth,
      }));
  }, [frames, visibleRange, itemWidth]);

  // Drag and drop handlers
  const handleDragStart = useCallback((frameId: string, index: number) => {
    setDragSourceIndex(index);
  }, []);

  const handleDragOver = useCallback((index: number) => {
    setDragTargetIndex(index);
  }, []);

  const handleDrop = useCallback(
    (targetIndex: number) => {
      if (dragSourceIndex !== null && dragSourceIndex !== targetIndex && !isLocked) {
        onFrameReorder?.(dragSourceIndex, targetIndex);
      }
      setDragSourceIndex(null);
      setDragTargetIndex(null);
    },
    [dragSourceIndex, isLocked, onFrameReorder]
  );

  // Frame click with lock check
  const handleFrameClick = useCallback(
    (frameId: string, index: number, event: React.MouseEvent) => {
      if (!isLocked) {
        onFrameClick?.(frameId, index, event);
      }
    },
    [isLocked, onFrameClick]
  );

  return (
    <div
      className={`
        flex items-stretch
        border-b border-surface-700
        ${isMuted ? 'opacity-50' : ''}
        ${className}
      `}
    >
      {/* Track header */}
      <div
        className="
          flex-shrink-0 w-32
          flex flex-col justify-center
          px-2 py-1
          bg-surface-800
          border-r border-surface-700
        "
      >
        {/* Track name */}
        <span className="text-xs font-medium text-surface-200 truncate">{name}</span>

        {/* Track controls */}
        <div className="flex items-center gap-1 mt-1">
          {/* Visibility toggle */}
          <button
            onClick={() => onToggleVisibility?.(trackId)}
            className={`
              p-0.5 rounded
              ${isVisible ? 'text-surface-400' : 'text-surface-600'}
              hover:bg-surface-700
            `}
            title={isVisible ? 'Hide track' : 'Show track'}
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isVisible ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                />
              )}
            </svg>
          </button>

          {/* Mute toggle */}
          <button
            onClick={() => onToggleMute?.(trackId)}
            className={`
              p-0.5 rounded
              ${isMuted ? 'text-accent-warning' : 'text-surface-400'}
              hover:bg-surface-700
            `}
            title={isMuted ? 'Unmute track' : 'Mute track'}
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={
                  isMuted
                    ? 'M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z'
                    : 'M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z'
                }
              />
            </svg>
          </button>

          {/* Lock toggle */}
          <button
            onClick={() => onToggleLock?.(trackId)}
            className={`
              p-0.5 rounded
              ${isLocked ? 'text-accent-error' : 'text-surface-400'}
              hover:bg-surface-700
            `}
            title={isLocked ? 'Unlock track' : 'Lock track'}
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={
                  isLocked
                    ? 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
                    : 'M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z'
                }
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Frames container */}
      <div
        ref={trackRef}
        className="flex-1 relative overflow-hidden bg-surface-900"
        style={{
          height: config.height + (showFrameDelays ? 20 : 8),
        }}
      >
        {/* Frames wrapper with total width for scroll */}
        <div
          className="absolute top-0 left-0 h-full"
          style={{ width: totalWidth }}
        >
          {/* Render only visible frames */}
          {visibleFrames.map(({ frame, index, left }) => (
            <div
              key={frame.id}
              className="absolute top-1"
              style={{ left }}
            >
              <TimelineFrame
                frame={frame}
                index={index}
                isSelected={selectedFrameIds.includes(frame.id)}
                isCurrent={index === currentFrameIndex}
                size={thumbnailSize}
                showNumber={showFrameNumbers}
                showDelay={showFrameDelays}
                onClick={handleFrameClick}
                onDoubleClick={onFrameDoubleClick}
                onContextMenu={onFrameContextMenu}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              />

              {/* Drop indicator */}
              {dragTargetIndex === index && dragSourceIndex !== null && (
                <div
                  className="absolute -left-0.5 top-0 bottom-0 w-1 bg-primary-500 rounded"
                  style={{ height: config.height + (showFrameDelays ? 16 : 0) }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Empty state */}
        {frames.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-surface-500 text-sm">
            No frames
          </div>
        )}
      </div>
    </div>
  );
}
