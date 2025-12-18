/**
 * RegionHandle Component
 * Handles drag resizing of region corners and edges
 */

import { type PointerEvent as ReactPointerEvent } from 'react';

export type HandlePosition =
  | 'top-left'
  | 'top'
  | 'top-right'
  | 'right'
  | 'bottom-right'
  | 'bottom'
  | 'bottom-left'
  | 'left';

export interface RegionHandleProps {
  position: HandlePosition;
  onDragStart: (position: HandlePosition, e: ReactPointerEvent) => void;
  isActive?: boolean;
}

const handlePositionStyles: Record<HandlePosition, string> = {
  'top-left': 'top-0 left-0 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize',
  top: 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-ns-resize',
  'top-right': 'top-0 right-0 translate-x-1/2 -translate-y-1/2 cursor-nesw-resize',
  right: 'top-1/2 right-0 translate-x-1/2 -translate-y-1/2 cursor-ew-resize',
  'bottom-right': 'bottom-0 right-0 translate-x-1/2 translate-y-1/2 cursor-nwse-resize',
  bottom: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 cursor-ns-resize',
  'bottom-left': 'bottom-0 left-0 -translate-x-1/2 translate-y-1/2 cursor-nesw-resize',
  left: 'top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize',
};

export function RegionHandle({ position, onDragStart, isActive = false }: RegionHandleProps) {
  const handlePointerDown = (e: ReactPointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDragStart(position, e);
  };

  return (
    <div
      className={`
        absolute w-3 h-3 rounded-full
        transition-all duration-150
        ${handlePositionStyles[position]}
        ${
          isActive
            ? 'bg-primary-500 scale-125 ring-2 ring-primary-500/50'
            : 'bg-white border-2 border-primary-500 hover:bg-primary-500 hover:scale-110'
        }
      `}
      onPointerDown={handlePointerDown}
    />
  );
}

RegionHandle.displayName = 'RegionHandle';
