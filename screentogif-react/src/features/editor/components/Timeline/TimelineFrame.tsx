/**
 * TimelineFrame Component
 * Displays a single frame thumbnail in the timeline
 */

import { memo, useCallback, useState } from 'react';
import type { Frame } from '../../../../api/types';

export interface TimelineFrameProps {
  /** Frame data */
  frame: Frame;
  /** Frame index (0-based) */
  index: number;
  /** Whether this frame is selected */
  isSelected: boolean;
  /** Whether this is the current frame being displayed */
  isCurrent: boolean;
  /** Size of the thumbnail */
  size: 'small' | 'medium' | 'large';
  /** Whether to show the frame number */
  showNumber?: boolean;
  /** Whether to show the frame delay */
  showDelay?: boolean;
  /** Click handler */
  onClick?: (frameId: string, index: number, event: React.MouseEvent) => void;
  /** Double click handler */
  onDoubleClick?: (frameId: string, index: number) => void;
  /** Context menu handler */
  onContextMenu?: (frameId: string, index: number, event: React.MouseEvent) => void;
  /** Drag start handler */
  onDragStart?: (frameId: string, index: number) => void;
  /** Drag over handler */
  onDragOver?: (index: number) => void;
  /** Drop handler */
  onDrop?: (targetIndex: number) => void;
  className?: string;
}

const sizeConfig = {
  small: {
    width: 48,
    height: 36,
    padding: 2,
  },
  medium: {
    width: 64,
    height: 48,
    padding: 3,
  },
  large: {
    width: 96,
    height: 72,
    padding: 4,
  },
};

export const TimelineFrame = memo(function TimelineFrame({
  frame,
  index,
  isSelected,
  isCurrent,
  size,
  showNumber = true,
  showDelay = false,
  onClick,
  onDoubleClick,
  onContextMenu,
  onDragStart,
  onDragOver,
  onDrop,
  className = '',
}: TimelineFrameProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const config = sizeConfig[size];

  // Handle click
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      onClick?.(frame.id, index, e);
    },
    [frame.id, index, onClick]
  );

  // Handle double click
  const handleDoubleClick = useCallback(() => {
    onDoubleClick?.(frame.id, index);
  }, [frame.id, index, onDoubleClick]);

  // Handle context menu
  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      onContextMenu?.(frame.id, index, e);
    },
    [frame.id, index, onContextMenu]
  );

  // Handle drag start
  const handleDragStart = useCallback(
    (e: React.DragEvent) => {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', frame.id);
      onDragStart?.(frame.id, index);
    },
    [frame.id, index, onDragStart]
  );

  // Handle drag over
  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      setIsDragOver(true);
      onDragOver?.(index);
    },
    [index, onDragOver]
  );

  // Handle drag leave
  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  // Handle drop
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      onDrop?.(index);
    },
    [index, onDrop]
  );

  return (
    <div
      className={`
        relative flex-shrink-0
        rounded-md overflow-hidden
        transition-all duration-150
        cursor-pointer select-none
        ${isSelected
          ? 'ring-2 ring-primary-500 ring-offset-1 ring-offset-surface-800'
          : 'ring-1 ring-surface-600'
        }
        ${isCurrent && !isSelected ? 'ring-2 ring-accent-success' : ''}
        ${isDragOver ? 'ring-2 ring-primary-400 scale-105' : ''}
        ${isHovered && !isSelected && !isCurrent ? 'ring-surface-500' : ''}
        ${frame.isDeleted ? 'opacity-40' : ''}
        ${className}
      `}
      style={{
        width: config.width,
        height: config.height + (showDelay ? 16 : 0),
        padding: config.padding,
      }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Thumbnail container */}
      <div
        className="relative w-full bg-surface-900 rounded overflow-hidden"
        style={{ height: config.height - config.padding * 2 }}
      >
        {/* Thumbnail image */}
        {frame.thumbnailUrl ? (
          <img
            src={frame.thumbnailUrl}
            alt={`Frame ${index + 1}`}
            className="w-full h-full object-contain"
            loading="lazy"
          />
        ) : frame.imageDataUrl ? (
          <img
            src={frame.imageDataUrl}
            alt={`Frame ${index + 1}`}
            className="w-full h-full object-contain"
            loading="lazy"
          />
        ) : (
          // Placeholder for frames without thumbnails
          <div className="w-full h-full flex items-center justify-center bg-surface-800">
            <span className="text-surface-600 text-xs">No preview</span>
          </div>
        )}

        {/* Frame number overlay */}
        {showNumber && (
          <div
            className={`
              absolute bottom-0 left-0
              px-1 py-0.5
              text-[10px] font-mono
              bg-surface-900/75 text-surface-300
              rounded-tr
            `}
          >
            {index + 1}
          </div>
        )}

        {/* Keyframe indicator */}
        {frame.isKeyFrame && (
          <div
            className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-accent-warning"
            title="Keyframe"
          />
        )}

        {/* Selection overlay */}
        {isSelected && (
          <div className="absolute inset-0 bg-primary-500/20 pointer-events-none" />
        )}

        {/* Current frame indicator */}
        {isCurrent && (
          <div className="absolute inset-0 border-2 border-accent-success pointer-events-none" />
        )}

        {/* Mouse/keyboard indicator */}
        {(frame.metadata.mouseClicked || frame.metadata.keyPressed) && (
          <div className="absolute top-0.5 left-0.5 flex gap-0.5">
            {frame.metadata.mouseClicked && (
              <div className="w-2 h-2 rounded-full bg-accent-error" title="Mouse click" />
            )}
            {frame.metadata.keyPressed && (
              <div
                className="px-1 py-0.5 text-[8px] bg-surface-700 rounded text-surface-300"
                title={`Key: ${frame.metadata.keyPressed}`}
              >
                {frame.metadata.keyPressed.slice(0, 2)}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delay indicator */}
      {showDelay && (
        <div className="mt-1 text-center text-[10px] text-surface-400 font-mono">
          {frame.metadata.delay}ms
        </div>
      )}
    </div>
  );
});
