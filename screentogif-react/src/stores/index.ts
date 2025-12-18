/**
 * Stores Index
 * Re-exports all Zustand stores for convenient imports
 */

// Recorder Store
export { useRecorderStore, selectCaptureState, selectIsRecording, selectCaptureOptions } from './recorderStore';

// Editor Store
export {
  useEditorStore,
  selectIsPlaying,
  selectSelectedFrameCount,
  selectHasSelection,
} from './editorStore';
export type { PlaybackState, SelectionMode, EditorTool, ZoomPreset } from './editorStore';

// Project Store
export {
  useProjectStore,
  selectHasProject,
  selectIsDirty,
  selectFrameCount,
  selectProjectTitle,
} from './projectStore';

// Export Store
export {
  useExportStore,
  selectIsEncoding,
  selectEncodingProgress,
  selectAllPresets,
} from './exportStore';

// Settings Store
export {
  useSettingsStore,
  selectTheme,
  selectLocale,
  selectHotkeys,
} from './settingsStore';
export type { AppTheme, AppLocale, StartupMode, ThumbnailQuality, HotkeyBinding } from './settingsStore';

// UI Store
export {
  useUIStore,
  selectCurrentView,
  selectIsLoading,
  selectToasts,
  selectIsBackendConnected,
} from './uiStore';
export type { Toast, ToastType, ModalType, AppView, PanelId } from './uiStore';
