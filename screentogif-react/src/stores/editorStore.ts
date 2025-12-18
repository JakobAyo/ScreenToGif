/**
 * Editor Store
 * Manages timeline, selection, playback, and editing state
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { FrameRange } from '../api/types';

/** Playback state */
export type PlaybackState = 'stopped' | 'playing' | 'paused';

/** Selection mode for frames */
export type SelectionMode = 'single' | 'range' | 'multi';

/** Tool types available in editor */
export type EditorTool =
  | 'select'
  | 'crop'
  | 'resize'
  | 'flip'
  | 'rotate'
  | 'text'
  | 'drawing'
  | 'shapes'
  | 'blur'
  | 'watermark'
  | 'border'
  | 'shadow'
  | 'keystrokes'
  | 'cursor'
  | 'progress';

/** Zoom level preset */
export type ZoomPreset = 'fit' | 'fill' | '25' | '50' | '75' | '100' | '150' | '200' | '400';

interface EditorState {
  // Frame selection
  selectedFrameIds: string[];
  selectionMode: SelectionMode;
  selectionRange: FrameRange | null;
  lastSelectedFrameId: string | null;

  // Playback
  playbackState: PlaybackState;
  currentFrameIndex: number;
  playbackSpeed: number; // 0.25 to 4.0
  isLooping: boolean;

  // Timeline
  timelineZoom: number; // 0.5 to 4.0
  timelineScrollPosition: number;
  thumbnailSize: 'small' | 'medium' | 'large';
  showFrameNumbers: boolean;
  showFrameDelays: boolean;

  // Editor canvas
  canvasZoom: number;
  canvasZoomPreset: ZoomPreset;
  canvasPanX: number;
  canvasPanY: number;
  showGrid: boolean;
  gridSize: number;
  snapToGrid: boolean;

  // Current tool
  currentTool: EditorTool;
  toolOptions: Record<string, unknown>;

  // Clipboard
  clipboardFrameIds: string[];
  clipboardOperation: 'copy' | 'cut' | null;

  // Undo/Redo
  canUndo: boolean;
  canRedo: boolean;
  historyIndex: number;

  // UI state
  isSidebarCollapsed: boolean;
  isTimelineCollapsed: boolean;
  activePanel: 'frames' | 'effects' | 'export' | 'settings';

  // Preview
  showOnionSkin: boolean;
  onionSkinFramesBefore: number;
  onionSkinFramesAfter: number;
  onionSkinOpacity: number;
}

interface EditorActions {
  // Frame selection
  selectFrame: (frameId: string, addToSelection?: boolean) => void;
  selectFrames: (frameIds: string[]) => void;
  selectFrameRange: (startId: string, endId: string) => void;
  selectAllFrames: (frameIds: string[]) => void;
  deselectFrame: (frameId: string) => void;
  clearSelection: () => void;
  setSelectionMode: (mode: SelectionMode) => void;
  invertSelection: (allFrameIds: string[]) => void;

  // Playback
  play: () => void;
  pause: () => void;
  stop: () => void;
  togglePlayback: () => void;
  setCurrentFrameIndex: (index: number) => void;
  nextFrame: () => void;
  previousFrame: () => void;
  goToFirstFrame: () => void;
  goToLastFrame: (totalFrames: number) => void;
  setPlaybackSpeed: (speed: number) => void;
  setIsLooping: (looping: boolean) => void;

  // Timeline
  setTimelineZoom: (zoom: number) => void;
  setTimelineScrollPosition: (position: number) => void;
  setThumbnailSize: (size: 'small' | 'medium' | 'large') => void;
  setShowFrameNumbers: (show: boolean) => void;
  setShowFrameDelays: (show: boolean) => void;

  // Canvas
  setCanvasZoom: (zoom: number) => void;
  setCanvasZoomPreset: (preset: ZoomPreset) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  fitToWindow: () => void;
  resetZoom: () => void;
  setCanvasPan: (x: number, y: number) => void;
  setShowGrid: (show: boolean) => void;
  setGridSize: (size: number) => void;
  setSnapToGrid: (snap: boolean) => void;

  // Tools
  setCurrentTool: (tool: EditorTool) => void;
  setToolOption: (key: string, value: unknown) => void;
  clearToolOptions: () => void;

  // Clipboard
  copyFrames: (frameIds: string[]) => void;
  cutFrames: (frameIds: string[]) => void;
  clearClipboard: () => void;
  hasClipboardContent: () => boolean;

  // History
  setCanUndo: (canUndo: boolean) => void;
  setCanRedo: (canRedo: boolean) => void;
  setHistoryIndex: (index: number) => void;

  // UI
  toggleSidebar: () => void;
  toggleTimeline: () => void;
  setActivePanel: (panel: 'frames' | 'effects' | 'export' | 'settings') => void;

  // Onion skin
  setShowOnionSkin: (show: boolean) => void;
  setOnionSkinFramesBefore: (frames: number) => void;
  setOnionSkinFramesAfter: (frames: number) => void;
  setOnionSkinOpacity: (opacity: number) => void;

  // Reset
  reset: () => void;
}

const initialState: EditorState = {
  selectedFrameIds: [],
  selectionMode: 'single',
  selectionRange: null,
  lastSelectedFrameId: null,
  playbackState: 'stopped',
  currentFrameIndex: 0,
  playbackSpeed: 1.0,
  isLooping: true,
  timelineZoom: 1.0,
  timelineScrollPosition: 0,
  thumbnailSize: 'medium',
  showFrameNumbers: true,
  showFrameDelays: false,
  canvasZoom: 1.0,
  canvasZoomPreset: '100',
  canvasPanX: 0,
  canvasPanY: 0,
  showGrid: false,
  gridSize: 16,
  snapToGrid: false,
  currentTool: 'select',
  toolOptions: {},
  clipboardFrameIds: [],
  clipboardOperation: null,
  canUndo: false,
  canRedo: false,
  historyIndex: -1,
  isSidebarCollapsed: false,
  isTimelineCollapsed: false,
  activePanel: 'frames',
  showOnionSkin: false,
  onionSkinFramesBefore: 1,
  onionSkinFramesAfter: 1,
  onionSkinOpacity: 0.3,
};

const ZOOM_LEVELS = [0.25, 0.5, 0.75, 1.0, 1.5, 2.0, 3.0, 4.0];

export const useEditorStore = create<EditorState & EditorActions>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    // Frame selection
    selectFrame: (frameId, addToSelection = false) => {
      set((state) => {
        if (addToSelection) {
          const newSelection = state.selectedFrameIds.includes(frameId)
            ? state.selectedFrameIds.filter((id) => id !== frameId)
            : [...state.selectedFrameIds, frameId];
          return { selectedFrameIds: newSelection, lastSelectedFrameId: frameId };
        }
        return { selectedFrameIds: [frameId], lastSelectedFrameId: frameId };
      });
    },

    selectFrames: (frameIds) => set({ selectedFrameIds: frameIds }),

    selectFrameRange: (startId, endId) => {
      set({ selectionRange: { startIndex: parseInt(startId), endIndex: parseInt(endId) } });
    },

    selectAllFrames: (frameIds) => set({ selectedFrameIds: frameIds }),

    deselectFrame: (frameId) =>
      set((state) => ({
        selectedFrameIds: state.selectedFrameIds.filter((id) => id !== frameId),
      })),

    clearSelection: () =>
      set({ selectedFrameIds: [], selectionRange: null, lastSelectedFrameId: null }),

    setSelectionMode: (selectionMode) => set({ selectionMode }),

    invertSelection: (allFrameIds) =>
      set((state) => ({
        selectedFrameIds: allFrameIds.filter((id) => !state.selectedFrameIds.includes(id)),
      })),

    // Playback
    play: () => set({ playbackState: 'playing' }),
    pause: () => set({ playbackState: 'paused' }),
    stop: () => set({ playbackState: 'stopped', currentFrameIndex: 0 }),

    togglePlayback: () => {
      const { playbackState } = get();
      if (playbackState === 'playing') {
        set({ playbackState: 'paused' });
      } else {
        set({ playbackState: 'playing' });
      }
    },

    setCurrentFrameIndex: (currentFrameIndex) => set({ currentFrameIndex }),

    nextFrame: () =>
      set((state) => ({ currentFrameIndex: state.currentFrameIndex + 1 })),

    previousFrame: () =>
      set((state) => ({
        currentFrameIndex: Math.max(0, state.currentFrameIndex - 1),
      })),

    goToFirstFrame: () => set({ currentFrameIndex: 0 }),

    goToLastFrame: (totalFrames) =>
      set({ currentFrameIndex: Math.max(0, totalFrames - 1) }),

    setPlaybackSpeed: (playbackSpeed) =>
      set({ playbackSpeed: Math.min(Math.max(playbackSpeed, 0.25), 4.0) }),

    setIsLooping: (isLooping) => set({ isLooping }),

    // Timeline
    setTimelineZoom: (timelineZoom) =>
      set({ timelineZoom: Math.min(Math.max(timelineZoom, 0.5), 4.0) }),

    setTimelineScrollPosition: (timelineScrollPosition) => set({ timelineScrollPosition }),

    setThumbnailSize: (thumbnailSize) => set({ thumbnailSize }),
    setShowFrameNumbers: (showFrameNumbers) => set({ showFrameNumbers }),
    setShowFrameDelays: (showFrameDelays) => set({ showFrameDelays }),

    // Canvas
    setCanvasZoom: (canvasZoom) => set({ canvasZoom, canvasZoomPreset: 'fit' }),

    setCanvasZoomPreset: (preset) => {
      const zoomMap: Record<ZoomPreset, number | null> = {
        fit: null,
        fill: null,
        '25': 0.25,
        '50': 0.5,
        '75': 0.75,
        '100': 1.0,
        '150': 1.5,
        '200': 2.0,
        '400': 4.0,
      };
      const zoom = zoomMap[preset];
      if (zoom !== null) {
        set({ canvasZoom: zoom, canvasZoomPreset: preset });
      } else {
        set({ canvasZoomPreset: preset });
      }
    },

    zoomIn: () => {
      const { canvasZoom } = get();
      const nextIndex = ZOOM_LEVELS.findIndex((z) => z > canvasZoom);
      if (nextIndex !== -1) {
        set({ canvasZoom: ZOOM_LEVELS[nextIndex] });
      }
    },

    zoomOut: () => {
      const { canvasZoom } = get();
      const prevIndex = [...ZOOM_LEVELS].reverse().findIndex((z) => z < canvasZoom);
      if (prevIndex !== -1) {
        set({ canvasZoom: ZOOM_LEVELS[ZOOM_LEVELS.length - 1 - prevIndex] });
      }
    },

    fitToWindow: () => set({ canvasZoomPreset: 'fit' }),
    resetZoom: () => set({ canvasZoom: 1.0, canvasZoomPreset: '100', canvasPanX: 0, canvasPanY: 0 }),

    setCanvasPan: (canvasPanX, canvasPanY) => set({ canvasPanX, canvasPanY }),
    setShowGrid: (showGrid) => set({ showGrid }),
    setGridSize: (gridSize) => set({ gridSize }),
    setSnapToGrid: (snapToGrid) => set({ snapToGrid }),

    // Tools
    setCurrentTool: (currentTool) => set({ currentTool }),
    setToolOption: (key, value) =>
      set((state) => ({ toolOptions: { ...state.toolOptions, [key]: value } })),
    clearToolOptions: () => set({ toolOptions: {} }),

    // Clipboard
    copyFrames: (frameIds) => set({ clipboardFrameIds: frameIds, clipboardOperation: 'copy' }),
    cutFrames: (frameIds) => set({ clipboardFrameIds: frameIds, clipboardOperation: 'cut' }),
    clearClipboard: () => set({ clipboardFrameIds: [], clipboardOperation: null }),
    hasClipboardContent: () => get().clipboardFrameIds.length > 0,

    // History
    setCanUndo: (canUndo) => set({ canUndo }),
    setCanRedo: (canRedo) => set({ canRedo }),
    setHistoryIndex: (historyIndex) => set({ historyIndex }),

    // UI
    toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
    toggleTimeline: () => set((state) => ({ isTimelineCollapsed: !state.isTimelineCollapsed })),
    setActivePanel: (activePanel) => set({ activePanel }),

    // Onion skin
    setShowOnionSkin: (showOnionSkin) => set({ showOnionSkin }),
    setOnionSkinFramesBefore: (onionSkinFramesBefore) => set({ onionSkinFramesBefore }),
    setOnionSkinFramesAfter: (onionSkinFramesAfter) => set({ onionSkinFramesAfter }),
    setOnionSkinOpacity: (onionSkinOpacity) => set({ onionSkinOpacity }),

    // Reset
    reset: () => set(initialState),
  }))
);

// Selector hooks
export const selectIsPlaying = (state: EditorState) => state.playbackState === 'playing';
export const selectSelectedFrameCount = (state: EditorState) => state.selectedFrameIds.length;
export const selectHasSelection = (state: EditorState) => state.selectedFrameIds.length > 0;
