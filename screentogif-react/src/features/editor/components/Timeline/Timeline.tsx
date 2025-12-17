/**
 * Timeline Component
 * Main timeline container with tracks, frames, ruler, and scrubber
 */

import { useCallback, useRef, useState, useEffect } from 'react';
import type { Frame } from '../../../../api/types';
import { Icon } from '../../../../components/atoms/Icon';
import { Tooltip } from '../../../../components/molecules/Tooltip';
import { TimelineRuler } from './TimelineRuler';
import { TimelineScrubber } from './TimelineScrubber';
import { TimelineTrack } from './TimelineTrack';

export interface TimelineProps {
  /** Frames to display */
  frames: Frame[];
  /** Selected frame IDs */
  selectedFrameIds: string[];
  /** Current frame index (0-based) */
  currentFrameIndex: number;
  /** Total duration in milliseconds */
  duration: number;
  /** Current time in milliseconds */
  currentTime: number;
  /** Whether playback is active */
  isPlaying?: boolean;
  /** Thumbnail size */
  thumbnailSize?: 'small' | 'medium' | 'large';
  /** Zoom level (0.5 to 4.0) */
  zoom?: number;
  /** Whether to show frame numbers */
  showFrameNumbers?: boolean;
  /** Whether to show frame delays */
  showFrameDelays?: boolean;
  /** Whether the timeline is collapsed */
  isCollapsed?: boolean;

  // Callbacks
  onFrameSelect?: (frameId: string, index: number, event: React.MouseEvent) => void;
  onFrameDoubleClick?: (frameId: string, index: number) => void;
  onFrameContextMenu?: (frameId: string, index: number, event: React.MouseEvent) => void;
  onFrameReorder?: (fromIndex: number, toIndex: number) => void;
  onCurrentFrameChange?: (index: number) => void;
  onTimelinePositionClick?: (time: number) => void;
  onZoomChange?: (zoom: number) => void;
  onThumbnailSizeChange?: (size: 'small' | 'medium' | 'large') => void;
  onToggleCollapse?: () => void;
  onShowFrameNumbersChange?: (show: boolean) => void;
  onShowFrameDelaysChange?: (show: boolean) => void;
  onScrubStart?: () => void;
  onScrubEnd?: () => void;

  className?: string;
}

const thumbnailSizes = {
  small: { width: 48, height: 36 },
  medium: { width: 64, height: 48 },
  large: { width: 96, height: 72 },
};

export function Timeline({
  frames,
  selectedFrameIds,
  currentFrameIndex,
  duration,
  currentTime,
  isPlaying = false,
  thumbnailSize = 'medium',
  zoom = 1,
  showFrameNumbers = true,
  showFrameDelays = false,
  isCollapsed = false,
  onFrameSelect,
  onFrameDoubleClick,
  onFrameContextMenu,
  onFrameReorder,
  onCurrentFrameChange,
  onTimelinePositionClick,
  onZoomChange,
  onThumbnailSizeChange,
  onToggleCollapse,
  onShowFrameNumbersChange,
  onShowFrameDelaysChange,
  onScrubStart,
  onScrubEnd,
  className = '',
}: TimelineProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollOffset, setScrollOffset] = useState(0);

  const config = thumbnailSizes[thumbnailSize];
  const frameWidth = config.width * zoom;
  const totalWidth = frameWidth * frames.length;

  // Track scroll position
  const handleScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      setScrollOffset(scrollContainerRef.current.scrollLeft);
    }
  }, []);

  // Auto-scroll to keep current frame visible during playback
  useEffect(() => {
    if (!scrollContainerRef.current || !isPlaying) return;

    const container = scrollContainerRef.current;
    const framePosition = currentFrameIndex * frameWidth;
    const containerWidth = container.clientWidth;
    const scrollLeft = container.scrollLeft;

    // If current frame is outside visible area, scroll to it
    if (framePosition < scrollLeft || framePosition > scrollLeft + containerWidth - frameWidth) {
      container.scrollTo({
        left: framePosition - containerWidth / 2,
        behavior: 'auto',
      });
    }
  }, [currentFrameIndex, isPlaying, frameWidth]);

  // Zoom in/out handlers
  const handleZoomIn = useCallback(() => {
    onZoomChange?.(Math.min(zoom * 1.25, 4.0));
  }, [zoom, onZoomChange]);

  const handleZoomOut = useCallback(() => {
    onZoomChange?.(Math.max(zoom / 1.25, 0.5));
  }, [zoom, onZoomChange]);

  const handleZoomReset = useCallback(() => {
    onZoomChange?.(1.0);
  }, [onZoomChange]);

  // Thumbnail size cycle
  const cycleThumbnailSize = useCallback(() => {
    const sizes: ('small' | 'medium' | 'large')[] = ['small', 'medium', 'large'];
    const currentIndex = sizes.indexOf(thumbnailSize);
    const nextIndex = (currentIndex + 1) % sizes.length;
    onThumbnailSizeChange?.(sizes[nextIndex]);
  }, [thumbnailSize, onThumbnailSizeChange]);

  // Calculate height
  const trackHeight = config.height + (showFrameDelays ? 28 : 16);
  const timelineHeight = isCollapsed ? 32 : trackHeight + 32; // 32px for ruler

  if (isCollapsed) {
    return (
      <div
        className={`
          flex items-center h-8
          bg-surface-800 border-t border-surface-700
          px-4
          ${className}
        `}
      >
        <button
          onClick={onToggleCollapse}
          className="flex items-center gap-2 text-surface-400 hover:text-surface-200"
        >
          <Icon name="chevron-up" size="sm" />
          <span className="text-sm">Timeline ({frames.length} frames)</span>
        </button>
      </div>
    );
  }

  return (
    <div
      className={`
        flex flex-col
        bg-surface-800 border-t border-surface-700
        ${className}
      `}
      style={{ height: timelineHeight }}
    >
      {/* Timeline header with controls */}
      <div className="flex items-center justify-between px-2 py-1 border-b border-surface-700">
        {/* Left controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleCollapse}
            className="p-1 text-surface-400 hover:text-surface-200 hover:bg-surface-700 rounded"
          >
            <Icon name="chevron-down" size="sm" />
          </button>

          <span className="text-xs text-surface-400">
            {frames.length} {frames.length === 1 ? 'frame' : 'frames'}
          </span>

          {selectedFrameIds.length > 0 && (
            <span className="text-xs text-primary-400">
              {selectedFrameIds.length} selected
            </span>
          )}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-1">
          {/* Frame numbers toggle */}
          <Tooltip content="Toggle frame numbers">
            <button
              onClick={() => onShowFrameNumbersChange?.(!showFrameNumbers)}
              className={`
                p-1 rounded
                ${showFrameNumbers ? 'text-primary-400' : 'text-surface-400'}
                hover:bg-surface-700
              `}
            >
              <Icon name="hashtag" size="sm" />
            </button>
          </Tooltip>

          {/* Frame delays toggle */}
          <Tooltip content="Toggle frame delays">
            <button
              onClick={() => onShowFrameDelaysChange?.(!showFrameDelays)}
              className={`
                p-1 rounded
                ${showFrameDelays ? 'text-primary-400' : 'text-surface-400'}
                hover:bg-surface-700
              `}
            >
              <Icon name="clock" size="sm" />
            </button>
          </Tooltip>

          <div className="w-px h-4 bg-surface-600 mx-1" />

          {/* Thumbnail size */}
          <Tooltip content={`Thumbnail size: ${thumbnailSize}`}>
            <button
              onClick={cycleThumbnailSize}
              className="p-1 text-surface-400 hover:text-surface-200 hover:bg-surface-700 rounded"
            >
              <Icon name="photo" size="sm" />
            </button>
          </Tooltip>

          <div className="w-px h-4 bg-surface-600 mx-1" />

          {/* Zoom controls */}
          <Tooltip content="Zoom out">
            <button
              onClick={handleZoomOut}
              disabled={zoom <= 0.5}
              className="p-1 text-surface-400 hover:text-surface-200 hover:bg-surface-700 rounded disabled:opacity-50"
            >
              <Icon name="zoom-out" size="sm" />
            </button>
          </Tooltip>

          <Tooltip content="Reset zoom">
            <button
              onClick={handleZoomReset}
              className="px-1.5 text-xs text-surface-400 hover:text-surface-200 hover:bg-surface-700 rounded"
            >
              {Math.round(zoom * 100)}%
            </button>
          </Tooltip>

          <Tooltip content="Zoom in">
            <button
              onClick={handleZoomIn}
              disabled={zoom >= 4.0}
              className="p-1 text-surface-400 hover:text-surface-200 hover:bg-surface-700 rounded disabled:opacity-50"
            >
              <Icon name="zoom-in" size="sm" />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Timeline content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Ruler */}
        <TimelineRuler
          duration={duration}
          currentTime={currentTime}
          frameWidth={config.width}
          totalFrames={frames.length}
          zoom={zoom}
          scrollOffset={scrollOffset}
          onPositionClick={onTimelinePositionClick}
        />

        {/* Tracks container with horizontal scroll */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-x-auto overflow-y-hidden relative"
          onScroll={handleScroll}
        >
          {/* Scrubber (playhead) */}
          <TimelineScrubber
            currentFrame={currentFrameIndex}
            totalFrames={frames.length}
            frameWidth={config.width}
            zoom={zoom}
            height={trackHeight}
            scrollOffset={scrollOffset}
            isPlaying={isPlaying}
            onFrameChange={onCurrentFrameChange}
            onScrubStart={onScrubStart}
            onScrubEnd={onScrubEnd}
          />

          {/* Main track */}
          <TimelineTrack
            trackId="main"
            name="Main"
            frames={frames}
            selectedFrameIds={selectedFrameIds}
            currentFrameIndex={currentFrameIndex}
            thumbnailSize={thumbnailSize}
            zoom={zoom}
            showFrameNumbers={showFrameNumbers}
            showFrameDelays={showFrameDelays}
            scrollContainerRef={scrollContainerRef}
            onFrameClick={onFrameSelect}
            onFrameDoubleClick={onFrameDoubleClick}
            onFrameContextMenu={onFrameContextMenu}
            onFrameReorder={onFrameReorder}
          />
        </div>
      </div>
    </div>
  );
}
