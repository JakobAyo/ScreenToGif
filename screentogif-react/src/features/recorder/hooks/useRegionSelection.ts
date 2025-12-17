/**
 * useRegionSelection Hook
 * Manages region selection drag logic and keyboard modifiers
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type { CaptureRegion } from '../../../api/types';

export interface UseRegionSelectionOptions {
  initialRegion?: CaptureRegion | null;
  minWidth?: number;
  minHeight?: number;
  snapToGrid?: number;
  containerBounds?: { width: number; height: number };
  onRegionChange?: (region: CaptureRegion | null) => void;
}

export interface UseRegionSelectionReturn {
  region: CaptureRegion | null;
  isSelecting: boolean;
  isDragging: boolean;
  setRegion: (region: CaptureRegion | null) => void;
  startSelection: (x: number, y: number) => void;
  updateSelection: (x: number, y: number) => void;
  endSelection: () => void;
  clearRegion: () => void;
  moveRegion: (dx: number, dy: number) => void;
  resizeRegion: (width: number, height: number) => void;
  snapToWindow: (windowBounds: CaptureRegion) => void;
}

const DEFAULT_MIN_SIZE = 50;

export function useRegionSelection(
  options: UseRegionSelectionOptions = {}
): UseRegionSelectionReturn {
  const {
    initialRegion = null,
    minWidth = DEFAULT_MIN_SIZE,
    minHeight = DEFAULT_MIN_SIZE,
    snapToGrid = 0,
    containerBounds,
    onRegionChange,
  } = options;

  const [region, setRegionState] = useState<CaptureRegion | null>(initialRegion);
  const [isSelecting, setIsSelecting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const selectionStartRef = useRef<{ x: number; y: number } | null>(null);

  // Snap value to grid
  const snapValue = useCallback(
    (value: number): number => {
      if (snapToGrid <= 0) return Math.round(value);
      return Math.round(value / snapToGrid) * snapToGrid;
    },
    [snapToGrid]
  );

  // Clamp region to container bounds
  const clampRegion = useCallback(
    (newRegion: CaptureRegion): CaptureRegion => {
      let { x, y, width, height } = newRegion;

      // Ensure minimum size
      width = Math.max(width, minWidth);
      height = Math.max(height, minHeight);

      // Clamp to container bounds if provided
      if (containerBounds) {
        x = Math.max(0, Math.min(x, containerBounds.width - width));
        y = Math.max(0, Math.min(y, containerBounds.height - height));
        width = Math.min(width, containerBounds.width - x);
        height = Math.min(height, containerBounds.height - y);
      }

      return {
        x: snapValue(x),
        y: snapValue(y),
        width: snapValue(width),
        height: snapValue(height),
      };
    },
    [containerBounds, minWidth, minHeight, snapValue]
  );

  // Set region with validation
  const setRegion = useCallback(
    (newRegion: CaptureRegion | null) => {
      if (newRegion) {
        const clamped = clampRegion(newRegion);
        setRegionState(clamped);
        onRegionChange?.(clamped);
      } else {
        setRegionState(null);
        onRegionChange?.(null);
      }
    },
    [clampRegion, onRegionChange]
  );

  // Start a new selection
  const startSelection = useCallback(
    (x: number, y: number) => {
      selectionStartRef.current = { x: snapValue(x), y: snapValue(y) };
      setIsSelecting(true);
      setIsDragging(true);

      // Initialize with minimum size region
      setRegion({
        x: snapValue(x),
        y: snapValue(y),
        width: minWidth,
        height: minHeight,
      });
    },
    [minWidth, minHeight, snapValue, setRegion]
  );

  // Update selection during drag
  const updateSelection = useCallback(
    (x: number, y: number) => {
      if (!selectionStartRef.current || !isSelecting) return;

      const start = selectionStartRef.current;
      const endX = snapValue(x);
      const endY = snapValue(y);

      // Calculate region that handles negative directions
      const newRegion: CaptureRegion = {
        x: Math.min(start.x, endX),
        y: Math.min(start.y, endY),
        width: Math.abs(endX - start.x),
        height: Math.abs(endY - start.y),
      };

      setRegion(newRegion);
    },
    [isSelecting, snapValue, setRegion]
  );

  // End selection
  const endSelection = useCallback(() => {
    selectionStartRef.current = null;
    setIsSelecting(false);
    setIsDragging(false);
  }, []);

  // Clear the current region
  const clearRegion = useCallback(() => {
    setRegion(null);
    selectionStartRef.current = null;
    setIsSelecting(false);
    setIsDragging(false);
  }, [setRegion]);

  // Move region by delta
  const moveRegion = useCallback(
    (dx: number, dy: number) => {
      if (!region) return;

      setRegion({
        ...region,
        x: region.x + dx,
        y: region.y + dy,
      });
    },
    [region, setRegion]
  );

  // Resize region
  const resizeRegion = useCallback(
    (width: number, height: number) => {
      if (!region) return;

      setRegion({
        ...region,
        width,
        height,
      });
    },
    [region, setRegion]
  );

  // Snap region to window bounds
  const snapToWindow = useCallback(
    (windowBounds: CaptureRegion) => {
      setRegion(windowBounds);
    },
    [setRegion]
  );

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!region) return;

      const step = e.shiftKey ? 10 : 1;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          if (e.altKey) {
            resizeRegion(region.width, region.height - step);
          } else {
            moveRegion(0, -step);
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (e.altKey) {
            resizeRegion(region.width, region.height + step);
          } else {
            moveRegion(0, step);
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (e.altKey) {
            resizeRegion(region.width - step, region.height);
          } else {
            moveRegion(-step, 0);
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (e.altKey) {
            resizeRegion(region.width + step, region.height);
          } else {
            moveRegion(step, 0);
          }
          break;
        case 'Escape':
          clearRegion();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [region, moveRegion, resizeRegion, clearRegion]);

  return {
    region,
    isSelecting,
    isDragging,
    setRegion,
    startSelection,
    updateSelection,
    endSelection,
    clearRegion,
    moveRegion,
    resizeRegion,
    snapToWindow,
  };
}
