/**
 * Recorder Store
 * Manages recording state, capture configuration, and session data
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type {
  CaptureRegion,
  CaptureOptions,
  CaptureState,
  CaptureSession,
  DisplayInfo,
  WindowInfo,
  CaptureMode,
} from '../api/types';

interface RecorderState {
  // Recording state
  captureState: CaptureState;
  currentSession: CaptureSession | null;
  isPaused: boolean;

  // Capture configuration
  captureMode: CaptureMode;
  selectedRegion: CaptureRegion | null;
  selectedDisplayId: string | null;
  selectedWindowId: string | null;
  frameRate: number;
  captureMouseCursor: boolean;
  captureMouseClicks: boolean;
  maxDuration: number | null; // seconds
  maxFrames: number | null;

  // Available sources
  availableDisplays: DisplayInfo[];
  availableWindows: WindowInfo[];

  // Stats during recording
  frameCount: number;
  recordingDuration: number; // milliseconds
  estimatedFileSize: number; // bytes

  // UI state
  isSelectingRegion: boolean;
  showPreview: boolean;
  previewScale: number;

  // Error state
  error: string | null;
}

interface RecorderActions {
  // State setters
  setCaptureState: (state: CaptureState) => void;
  setCurrentSession: (session: CaptureSession | null) => void;
  setIsPaused: (paused: boolean) => void;

  // Configuration setters
  setCaptureMode: (mode: CaptureMode) => void;
  setSelectedRegion: (region: CaptureRegion | null) => void;
  setSelectedDisplayId: (displayId: string | null) => void;
  setSelectedWindowId: (windowId: string | null) => void;
  setFrameRate: (rate: number) => void;
  setCaptureMouseCursor: (capture: boolean) => void;
  setCaptureMouseClicks: (capture: boolean) => void;
  setMaxDuration: (duration: number | null) => void;
  setMaxFrames: (frames: number | null) => void;

  // Source management
  setAvailableDisplays: (displays: DisplayInfo[]) => void;
  setAvailableWindows: (windows: WindowInfo[]) => void;
  refreshSources: () => void;

  // Stats updates
  incrementFrameCount: () => void;
  setFrameCount: (count: number) => void;
  setRecordingDuration: (duration: number) => void;
  setEstimatedFileSize: (size: number) => void;

  // UI state
  setIsSelectingRegion: (selecting: boolean) => void;
  setShowPreview: (show: boolean) => void;
  setPreviewScale: (scale: number) => void;

  // Error handling
  setError: (error: string | null) => void;
  clearError: () => void;

  // Computed getters
  getCaptureOptions: () => CaptureOptions;
  canStartRecording: () => boolean;

  // Reset
  reset: () => void;
  resetSession: () => void;
}

const initialState: RecorderState = {
  captureState: 'idle',
  currentSession: null,
  isPaused: false,
  captureMode: 'region',
  selectedRegion: null,
  selectedDisplayId: null,
  selectedWindowId: null,
  frameRate: 15,
  captureMouseCursor: true,
  captureMouseClicks: false,
  maxDuration: null,
  maxFrames: null,
  availableDisplays: [],
  availableWindows: [],
  frameCount: 0,
  recordingDuration: 0,
  estimatedFileSize: 0,
  isSelectingRegion: false,
  showPreview: true,
  previewScale: 1,
  error: null,
};

export const useRecorderStore = create<RecorderState & RecorderActions>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    // State setters
    setCaptureState: (captureState) => set({ captureState }),
    setCurrentSession: (currentSession) => set({ currentSession }),
    setIsPaused: (isPaused) => set({ isPaused }),

    // Configuration setters
    setCaptureMode: (captureMode) => set({ captureMode }),
    setSelectedRegion: (selectedRegion) => set({ selectedRegion }),
    setSelectedDisplayId: (selectedDisplayId) => set({ selectedDisplayId }),
    setSelectedWindowId: (selectedWindowId) => set({ selectedWindowId }),
    setFrameRate: (frameRate) => set({ frameRate: Math.min(Math.max(frameRate, 1), 60) }),
    setCaptureMouseCursor: (captureMouseCursor) => set({ captureMouseCursor }),
    setCaptureMouseClicks: (captureMouseClicks) => set({ captureMouseClicks }),
    setMaxDuration: (maxDuration) => set({ maxDuration }),
    setMaxFrames: (maxFrames) => set({ maxFrames }),

    // Source management
    setAvailableDisplays: (availableDisplays) => set({ availableDisplays }),
    setAvailableWindows: (availableWindows) => set({ availableWindows }),
    refreshSources: () => {
      // This will be called by components that have access to the API
      // The actual fetching happens in the component/service layer
    },

    // Stats updates
    incrementFrameCount: () => set((state) => ({ frameCount: state.frameCount + 1 })),
    setFrameCount: (frameCount) => set({ frameCount }),
    setRecordingDuration: (recordingDuration) => set({ recordingDuration }),
    setEstimatedFileSize: (estimatedFileSize) => set({ estimatedFileSize }),

    // UI state
    setIsSelectingRegion: (isSelectingRegion) => set({ isSelectingRegion }),
    setShowPreview: (showPreview) => set({ showPreview }),
    setPreviewScale: (previewScale) => set({ previewScale }),

    // Error handling
    setError: (error) => set({ error }),
    clearError: () => set({ error: null }),

    // Computed getters
    getCaptureOptions: (): CaptureOptions => {
      const state = get();
      return {
        mode: state.captureMode,
        region: state.selectedRegion ?? undefined,
        displayId: state.selectedDisplayId ?? undefined,
        windowId: state.selectedWindowId ?? undefined,
        frameRate: state.frameRate,
        captureMouseCursor: state.captureMouseCursor,
        captureMouseClicks: state.captureMouseClicks,
        maxDuration: state.maxDuration ?? undefined,
        maxFrames: state.maxFrames ?? undefined,
      };
    },

    canStartRecording: (): boolean => {
      const state = get();
      if (state.captureState !== 'idle') return false;

      switch (state.captureMode) {
        case 'region':
          return state.selectedRegion !== null;
        case 'screen':
          return state.selectedDisplayId !== null;
        case 'window':
          return state.selectedWindowId !== null;
        case 'webcam':
        case 'board':
          return true;
        default:
          return false;
      }
    },

    // Reset
    reset: () => set(initialState),
    resetSession: () =>
      set({
        currentSession: null,
        frameCount: 0,
        recordingDuration: 0,
        estimatedFileSize: 0,
        captureState: 'idle',
        isPaused: false,
        error: null,
      }),
  }))
);

// Selector hooks for common selections
export const selectCaptureState = (state: RecorderState & RecorderActions) => state.captureState;
export const selectIsRecording = (state: RecorderState & RecorderActions) =>
  state.captureState === 'recording';
export const selectCaptureOptions = (state: RecorderState & RecorderActions) =>
  state.getCaptureOptions();
