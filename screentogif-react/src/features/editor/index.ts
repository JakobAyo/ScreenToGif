/**
 * Editor Feature Index
 * Main entry point for the editor feature module
 */

// Pages
export { EditorPage, type EditorPageProps } from './pages';

// Hooks
export {
  useTimeline,
  type UseTimelineReturn,
  useFrameSelection,
  type UseFrameSelectionReturn,
  type SelectionModifiers,
  usePlayback,
  type UsePlaybackReturn,
  useUndoRedo,
  type UseUndoRedoReturn,
  type UndoableAction,
  type ActionType,
  useDrawing,
  type UseDrawingReturn,
  type DrawingOptions,
  type DrawingStroke,
  type DrawingPoint,
  type DrawingTool,
} from './hooks';

// Components - Timeline
export {
  Timeline,
  type TimelineProps,
  TimelineTrack,
  type TimelineTrackProps,
  TimelineFrame,
  type TimelineFrameProps,
  TimelineScrubber,
  type TimelineScrubberProps,
  TimelineRuler,
  type TimelineRulerProps,
} from './components/Timeline';

// Components - Canvas
export {
  EditorCanvas,
  type EditorCanvasProps,
  FrameRenderer,
  type FrameRendererProps,
  OverlayLayer,
  type OverlayLayerProps,
  type OverlayLayerHandle,
  type Overlay,
  type TextOverlay,
  type ShapeOverlay,
  type DrawingOverlay,
} from './components/Canvas';

// Components - ToolPalette
export {
  ToolPalette,
  type ToolPaletteProps,
  SelectTool,
  type SelectToolProps,
  DrawTool,
  type DrawToolProps,
  TextTool,
  type TextToolProps,
  type TextToolOptions,
  ShapeTool,
  type ShapeToolProps,
  type ShapeToolOptions,
  type ShapeType,
} from './components/ToolPalette';

// Components - PropertyPanels
export {
  FramePropertiesPanel,
  type FramePropertiesPanelProps,
  DelayPanel,
  type DelayPanelProps,
  TextPropertiesPanel,
  type TextPropertiesPanelProps,
  ShapePropertiesPanel,
  type ShapePropertiesPanelProps,
} from './components/PropertyPanels';

// Components - EffectPanels
export {
  BorderPanel,
  type BorderPanelProps,
  type BorderOptions,
  ResizePanel,
  type ResizePanelProps,
  type ResizeOptions,
  CropPanel,
  type CropPanelProps,
  type CropOptions,
  ProgressPanel,
  type ProgressPanelProps,
  type ProgressOptions,
} from './components/EffectPanels';

// Components - PlaybackControls
export {
  PlaybackControls,
  type PlaybackControlsProps,
  PlayButton,
  type PlayButtonProps,
  FrameNavigator,
  type FrameNavigatorProps,
} from './components/PlaybackControls';

// Components - FrameOperations
export {
  FrameOperations,
  type FrameOperationsProps,
  DeleteFramesButton,
  type DeleteFramesButtonProps,
  DuplicateFramesButton,
  type DuplicateFramesButtonProps,
  ReverseFramesButton,
  type ReverseFramesButtonProps,
} from './components/FrameOperations';
