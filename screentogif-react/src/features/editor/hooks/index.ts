/**
 * Editor Hooks Index
 * Re-exports all editor hooks for convenient importing
 */

export { useTimeline, type UseTimelineReturn } from './useTimeline';
export {
  useFrameSelection,
  type UseFrameSelectionReturn,
  type SelectionModifiers,
} from './useFrameSelection';
export { usePlayback, type UsePlaybackReturn } from './usePlayback';
export {
  useUndoRedo,
  type UseUndoRedoReturn,
  type UndoableAction,
  type ActionType,
} from './useUndoRedo';
export {
  useDrawing,
  type UseDrawingReturn,
  type DrawingOptions,
  type DrawingStroke,
  type DrawingPoint,
  type DrawingTool,
} from './useDrawing';
