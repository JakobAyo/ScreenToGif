/**
 * RegionSelector Component
 * Main component for displaying and managing capture region selection
 */

import { useState, useRef, useCallback, useEffect, type PointerEvent as ReactPointerEvent } from 'react';
import type { CaptureRegion } from '../../../../api/types';
import { RegionHandle, type HandlePosition } from './RegionHandle';
import { RegionOverlay } from './RegionOverlay';

export interface RegionSelectorProps {
  region: CaptureRegion | null;
  onChange: (region: CaptureRegion) => void;
  minWidth?: number;
  minHeight?: number;
  showDimensions?: boolean;
  showOverlay?: boolean;
  overlayOpacity?: number;
  snapToGrid?: number;
  className?: string;
}

interface DragState {
  type: 'move' | 'resize';
  handle?: HandlePosition;
  startX: number;
  startY: number;
  startRegion: CaptureRegion;
}

const MIN_SIZE = 50;

export function RegionSelector({
  region,
  onChange,
  minWidth = MIN_SIZE,
  minHeight = MIN_SIZE,
  showDimensions = true,
  showOverlay = true,
  overlayOpacity = 0.5,
  snapToGrid = 0,
  className = '',
}: RegionSelectorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [activeHandle, setActiveHandle] = useState<HandlePosition | null>(null);
  const dragStateRef = useRef<DragState | null>(null);

  // Track container size
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateSize = () => {
      setContainerSize({
        width: container.clientWidth,
        height: container.clientHeight,
      });
    };

    updateSize();

    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, []);

  const snapValue = useCallback(
    (value: number): number => {
      if (snapToGrid <= 0) return value;
      return Math.round(value / snapToGrid) * snapToGrid;
    },
    [snapToGrid]
  );

  const clampRegion = useCallback(
    (newRegion: CaptureRegion): CaptureRegion => {
      let { x, y, width, height } = newRegion;

      // Ensure minimum size
      width = Math.max(width, minWidth);
      height = Math.max(height, minHeight);

      // Clamp to container bounds
      if (containerSize.width > 0 && containerSize.height > 0) {
        x = Math.max(0, Math.min(x, containerSize.width - width));
        y = Math.max(0, Math.min(y, containerSize.height - height));
        width = Math.min(width, containerSize.width - x);
        height = Math.min(height, containerSize.height - y);
      }

      return {
        x: snapValue(x),
        y: snapValue(y),
        width: snapValue(width),
        height: snapValue(height),
      };
    },
    [containerSize, minWidth, minHeight, snapValue]
  );

  const handleDragStart = useCallback(
    (handle: HandlePosition | 'move', e: ReactPointerEvent) => {
      if (!region) return;

      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);

      dragStateRef.current = {
        type: handle === 'move' ? 'move' : 'resize',
        handle: handle === 'move' ? undefined : handle,
        startX: e.clientX,
        startY: e.clientY,
        startRegion: { ...region },
      };

      setIsDragging(true);
      if (handle !== 'move') {
        setActiveHandle(handle);
      }
    },
    [region]
  );

  const handleDragMove = useCallback(
    (e: ReactPointerEvent) => {
      const state = dragStateRef.current;
      if (!state || !isDragging) return;

      const dx = e.clientX - state.startX;
      const dy = e.clientY - state.startY;
      const { startRegion } = state;

      let newRegion: CaptureRegion;

      if (state.type === 'move') {
        newRegion = {
          x: startRegion.x + dx,
          y: startRegion.y + dy,
          width: startRegion.width,
          height: startRegion.height,
        };
      } else {
        newRegion = { ...startRegion };
        const handle = state.handle!;

        // Handle horizontal resizing
        if (handle.includes('left')) {
          const maxDx = startRegion.width - minWidth;
          const clampedDx = Math.min(dx, maxDx);
          newRegion.x = startRegion.x + clampedDx;
          newRegion.width = startRegion.width - clampedDx;
        } else if (handle.includes('right')) {
          newRegion.width = Math.max(startRegion.width + dx, minWidth);
        }

        // Handle vertical resizing
        if (handle.includes('top')) {
          const maxDy = startRegion.height - minHeight;
          const clampedDy = Math.min(dy, maxDy);
          newRegion.y = startRegion.y + clampedDy;
          newRegion.height = startRegion.height - clampedDy;
        } else if (handle.includes('bottom')) {
          newRegion.height = Math.max(startRegion.height + dy, minHeight);
        }
      }

      onChange(clampRegion(newRegion));
    },
    [isDragging, minWidth, minHeight, onChange, clampRegion]
  );

  const handleDragEnd = useCallback((e: ReactPointerEvent) => {
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    dragStateRef.current = null;
    setIsDragging(false);
    setActiveHandle(null);
  }, []);

  const handleContainerClick = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging) return;
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // If clicking outside current region or no region exists, create new one
      if (!region ||
          clickX < region.x ||
          clickX > region.x + region.width ||
          clickY < region.y ||
          clickY > region.y + region.height) {

        const newWidth = Math.min(320, containerSize.width * 0.5);
        const newHeight = Math.min(240, containerSize.height * 0.5);

        const newRegion = clampRegion({
          x: clickX - newWidth / 2,
          y: clickY - newHeight / 2,
          width: newWidth,
          height: newHeight,
        });

        onChange(newRegion);
      }
    },
    [isDragging, region, containerSize, onChange, clampRegion]
  );

  const handlePositions: HandlePosition[] = [
    'top-left',
    'top',
    'top-right',
    'right',
    'bottom-right',
    'bottom',
    'bottom-left',
    'left',
  ];

  return (
    <div
      ref={containerRef}
      className={`relative select-none ${className}`}
      onClick={handleContainerClick}
      onPointerMove={isDragging ? handleDragMove : undefined}
      onPointerUp={isDragging ? handleDragEnd : undefined}
      onPointerCancel={isDragging ? handleDragEnd : undefined}
    >
      {/* Dimmed overlay */}
      {showOverlay && (
        <RegionOverlay
          region={region}
          containerWidth={containerSize.width}
          containerHeight={containerSize.height}
          opacity={overlayOpacity}
        />
      )}

      {/* Selection region */}
      {region && (
        <div
          className={`
            absolute border-2 border-primary-500
            ${isDragging && !activeHandle ? 'cursor-grabbing' : 'cursor-grab'}
          `}
          style={{
            left: region.x,
            top: region.y,
            width: region.width,
            height: region.height,
          }}
          onPointerDown={(e) => handleDragStart('move', e)}
        >
          {/* Selection border glow */}
          <div className="absolute inset-0 border border-primary-400/50 pointer-events-none" />

          {/* Corner indicators */}
          <div className="absolute -top-px -left-px w-4 h-4 border-t-2 border-l-2 border-primary-400 pointer-events-none" />
          <div className="absolute -top-px -right-px w-4 h-4 border-t-2 border-r-2 border-primary-400 pointer-events-none" />
          <div className="absolute -bottom-px -left-px w-4 h-4 border-b-2 border-l-2 border-primary-400 pointer-events-none" />
          <div className="absolute -bottom-px -right-px w-4 h-4 border-b-2 border-r-2 border-primary-400 pointer-events-none" />

          {/* Resize handles */}
          {handlePositions.map((position) => (
            <RegionHandle
              key={position}
              position={position}
              onDragStart={handleDragStart}
              isActive={activeHandle === position}
            />
          ))}

          {/* Dimensions display */}
          {showDimensions && (
            <div
              className="
                absolute -bottom-8 left-1/2 -translate-x-1/2
                px-2 py-0.5 rounded
                bg-surface-800/90 text-surface-200 text-xs font-mono
                pointer-events-none whitespace-nowrap
              "
            >
              {Math.round(region.width)} x {Math.round(region.height)}
            </div>
          )}
        </div>
      )}

      {/* Instructions when no region */}
      {!region && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="px-4 py-2 rounded-lg bg-surface-800/80 text-surface-300 text-sm">
            Click anywhere to select a region
          </div>
        </div>
      )}
    </div>
  );
}

RegionSelector.displayName = 'RegionSelector';
