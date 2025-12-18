/**
 * Settings Store
 * Manages application preferences and user settings
 */

import { create } from 'zustand';
import { subscribeWithSelector, persist } from 'zustand/middleware';

/** Application theme */
export type AppTheme = 'light' | 'dark' | 'system';

/** Language/locale code */
export type AppLocale = 'en' | 'de' | 'es' | 'fr' | 'pt' | 'ru' | 'zh' | 'ja' | 'ko';

/** Startup behavior */
export type StartupMode = 'recorder' | 'editor' | 'lastUsed' | 'startup';

/** Frame thumbnail quality */
export type ThumbnailQuality = 'low' | 'medium' | 'high';

/** Hotkey definition */
export interface HotkeyBinding {
  id: string;
  action: string;
  key: string;
  modifiers: {
    ctrl?: boolean;
    alt?: boolean;
    shift?: boolean;
    meta?: boolean;
  };
  enabled: boolean;
}

interface SettingsState {
  // Appearance
  theme: AppTheme;
  locale: AppLocale;
  fontSize: number; // 12-18
  showTooltips: boolean;
  animationsEnabled: boolean;
  reducedMotion: boolean;

  // Startup
  startupMode: StartupMode;
  showStartupScreen: boolean;
  checkForUpdates: boolean;
  autoUpdate: boolean;

  // Recording defaults
  defaultFrameRate: number;
  defaultCaptureMouseCursor: boolean;
  defaultCaptureMouseClicks: boolean;
  showCountdown: boolean;
  countdownDuration: number; // seconds
  playStartSound: boolean;
  playStopSound: boolean;

  // Editor defaults
  defaultThumbnailSize: 'small' | 'medium' | 'large';
  thumbnailQuality: ThumbnailQuality;
  showFrameNumbers: boolean;
  showFrameDelays: boolean;
  defaultPlaybackLoop: boolean;

  // Export defaults
  defaultOutputDirectory: string;
  rememberLastOutputDirectory: boolean;
  defaultFormat: string;
  openFileAfterExport: boolean;
  copyToClipboardAfterExport: boolean;

  // Performance
  maxUndoHistory: number;
  maxRecentProjects: number;
  useHardwareAcceleration: boolean;
  lowMemoryMode: boolean;
  cacheDirectory: string;
  maxCacheSize: number; // MB

  // Hotkeys
  hotkeys: HotkeyBinding[];
  globalHotkeysEnabled: boolean;

  // Advanced
  developerMode: boolean;
  enableTelemetry: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';

  // Window state (persisted)
  windowWidth: number;
  windowHeight: number;
  windowX: number | null;
  windowY: number | null;
  isMaximized: boolean;
  sidebarWidth: number;
  timelineHeight: number;
}

interface SettingsActions {
  // Appearance
  setTheme: (theme: AppTheme) => void;
  setLocale: (locale: AppLocale) => void;
  setFontSize: (size: number) => void;
  setShowTooltips: (show: boolean) => void;
  setAnimationsEnabled: (enabled: boolean) => void;
  setReducedMotion: (reduced: boolean) => void;

  // Startup
  setStartupMode: (mode: StartupMode) => void;
  setShowStartupScreen: (show: boolean) => void;
  setCheckForUpdates: (check: boolean) => void;
  setAutoUpdate: (auto: boolean) => void;

  // Recording defaults
  setDefaultFrameRate: (rate: number) => void;
  setDefaultCaptureMouseCursor: (capture: boolean) => void;
  setDefaultCaptureMouseClicks: (capture: boolean) => void;
  setShowCountdown: (show: boolean) => void;
  setCountdownDuration: (duration: number) => void;
  setPlayStartSound: (play: boolean) => void;
  setPlayStopSound: (play: boolean) => void;

  // Editor defaults
  setDefaultThumbnailSize: (size: 'small' | 'medium' | 'large') => void;
  setThumbnailQuality: (quality: ThumbnailQuality) => void;
  setShowFrameNumbers: (show: boolean) => void;
  setShowFrameDelays: (show: boolean) => void;
  setDefaultPlaybackLoop: (loop: boolean) => void;

  // Export defaults
  setDefaultOutputDirectory: (path: string) => void;
  setRememberLastOutputDirectory: (remember: boolean) => void;
  setDefaultFormat: (format: string) => void;
  setOpenFileAfterExport: (open: boolean) => void;
  setCopyToClipboardAfterExport: (copy: boolean) => void;

  // Performance
  setMaxUndoHistory: (max: number) => void;
  setMaxRecentProjects: (max: number) => void;
  setUseHardwareAcceleration: (use: boolean) => void;
  setLowMemoryMode: (low: boolean) => void;
  setCacheDirectory: (path: string) => void;
  setMaxCacheSize: (size: number) => void;

  // Hotkeys
  setHotkey: (id: string, binding: Partial<HotkeyBinding>) => void;
  resetHotkey: (id: string) => void;
  resetAllHotkeys: () => void;
  setGlobalHotkeysEnabled: (enabled: boolean) => void;
  getHotkeyForAction: (action: string) => HotkeyBinding | undefined;

  // Advanced
  setDeveloperMode: (enabled: boolean) => void;
  setEnableTelemetry: (enabled: boolean) => void;
  setLogLevel: (level: 'debug' | 'info' | 'warn' | 'error') => void;

  // Window state
  setWindowSize: (width: number, height: number) => void;
  setWindowPosition: (x: number, y: number) => void;
  setIsMaximized: (maximized: boolean) => void;
  setSidebarWidth: (width: number) => void;
  setTimelineHeight: (height: number) => void;

  // Bulk operations
  importSettings: (settings: Partial<SettingsState>) => void;
  exportSettings: () => Partial<SettingsState>;
  resetToDefaults: () => void;
}

// Default hotkey bindings
const defaultHotkeys: HotkeyBinding[] = [
  // Recording
  { id: 'record-start', action: 'recording.start', key: 'F7', modifiers: {}, enabled: true },
  { id: 'record-pause', action: 'recording.pause', key: 'F8', modifiers: {}, enabled: true },
  { id: 'record-stop', action: 'recording.stop', key: 'F9', modifiers: {}, enabled: true },
  { id: 'record-discard', action: 'recording.discard', key: 'Escape', modifiers: {}, enabled: true },

  // Playback
  { id: 'play-toggle', action: 'playback.toggle', key: ' ', modifiers: {}, enabled: true },
  { id: 'play-next', action: 'playback.next', key: 'ArrowRight', modifiers: {}, enabled: true },
  { id: 'play-prev', action: 'playback.prev', key: 'ArrowLeft', modifiers: {}, enabled: true },
  { id: 'play-first', action: 'playback.first', key: 'Home', modifiers: {}, enabled: true },
  { id: 'play-last', action: 'playback.last', key: 'End', modifiers: {}, enabled: true },

  // Selection
  { id: 'select-all', action: 'selection.all', key: 'a', modifiers: { ctrl: true }, enabled: true },
  { id: 'select-none', action: 'selection.none', key: 'd', modifiers: { ctrl: true }, enabled: true },
  { id: 'select-invert', action: 'selection.invert', key: 'i', modifiers: { ctrl: true }, enabled: true },

  // Edit
  { id: 'edit-copy', action: 'edit.copy', key: 'c', modifiers: { ctrl: true }, enabled: true },
  { id: 'edit-cut', action: 'edit.cut', key: 'x', modifiers: { ctrl: true }, enabled: true },
  { id: 'edit-paste', action: 'edit.paste', key: 'v', modifiers: { ctrl: true }, enabled: true },
  { id: 'edit-delete', action: 'edit.delete', key: 'Delete', modifiers: {}, enabled: true },
  { id: 'edit-undo', action: 'edit.undo', key: 'z', modifiers: { ctrl: true }, enabled: true },
  { id: 'edit-redo', action: 'edit.redo', key: 'y', modifiers: { ctrl: true }, enabled: true },

  // File
  { id: 'file-new', action: 'file.new', key: 'n', modifiers: { ctrl: true }, enabled: true },
  { id: 'file-open', action: 'file.open', key: 'o', modifiers: { ctrl: true }, enabled: true },
  { id: 'file-save', action: 'file.save', key: 's', modifiers: { ctrl: true }, enabled: true },
  { id: 'file-save-as', action: 'file.saveAs', key: 's', modifiers: { ctrl: true, shift: true }, enabled: true },
  { id: 'file-export', action: 'file.export', key: 'e', modifiers: { ctrl: true }, enabled: true },

  // View
  { id: 'view-zoom-in', action: 'view.zoomIn', key: '=', modifiers: { ctrl: true }, enabled: true },
  { id: 'view-zoom-out', action: 'view.zoomOut', key: '-', modifiers: { ctrl: true }, enabled: true },
  { id: 'view-zoom-fit', action: 'view.zoomFit', key: '0', modifiers: { ctrl: true }, enabled: true },
  { id: 'view-fullscreen', action: 'view.fullscreen', key: 'F11', modifiers: {}, enabled: true },
];

const initialState: SettingsState = {
  // Appearance
  theme: 'system',
  locale: 'en',
  fontSize: 14,
  showTooltips: true,
  animationsEnabled: true,
  reducedMotion: false,

  // Startup
  startupMode: 'startup',
  showStartupScreen: true,
  checkForUpdates: true,
  autoUpdate: false,

  // Recording defaults
  defaultFrameRate: 15,
  defaultCaptureMouseCursor: true,
  defaultCaptureMouseClicks: false,
  showCountdown: true,
  countdownDuration: 3,
  playStartSound: true,
  playStopSound: true,

  // Editor defaults
  defaultThumbnailSize: 'medium',
  thumbnailQuality: 'medium',
  showFrameNumbers: true,
  showFrameDelays: false,
  defaultPlaybackLoop: true,

  // Export defaults
  defaultOutputDirectory: '',
  rememberLastOutputDirectory: true,
  defaultFormat: 'gif',
  openFileAfterExport: true,
  copyToClipboardAfterExport: false,

  // Performance
  maxUndoHistory: 100,
  maxRecentProjects: 10,
  useHardwareAcceleration: true,
  lowMemoryMode: false,
  cacheDirectory: '',
  maxCacheSize: 1024, // 1GB

  // Hotkeys
  hotkeys: defaultHotkeys,
  globalHotkeysEnabled: true,

  // Advanced
  developerMode: false,
  enableTelemetry: false,
  logLevel: 'info',

  // Window state
  windowWidth: 1200,
  windowHeight: 800,
  windowX: null,
  windowY: null,
  isMaximized: false,
  sidebarWidth: 280,
  timelineHeight: 200,
};

export const useSettingsStore = create<SettingsState & SettingsActions>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        ...initialState,

        // Appearance
        setTheme: (theme) => set({ theme }),
        setLocale: (locale) => set({ locale }),
        setFontSize: (fontSize) => set({ fontSize: Math.min(Math.max(fontSize, 12), 18) }),
        setShowTooltips: (showTooltips) => set({ showTooltips }),
        setAnimationsEnabled: (animationsEnabled) => set({ animationsEnabled }),
        setReducedMotion: (reducedMotion) => set({ reducedMotion }),

        // Startup
        setStartupMode: (startupMode) => set({ startupMode }),
        setShowStartupScreen: (showStartupScreen) => set({ showStartupScreen }),
        setCheckForUpdates: (checkForUpdates) => set({ checkForUpdates }),
        setAutoUpdate: (autoUpdate) => set({ autoUpdate }),

        // Recording defaults
        setDefaultFrameRate: (defaultFrameRate) =>
          set({ defaultFrameRate: Math.min(Math.max(defaultFrameRate, 1), 60) }),
        setDefaultCaptureMouseCursor: (defaultCaptureMouseCursor) =>
          set({ defaultCaptureMouseCursor }),
        setDefaultCaptureMouseClicks: (defaultCaptureMouseClicks) =>
          set({ defaultCaptureMouseClicks }),
        setShowCountdown: (showCountdown) => set({ showCountdown }),
        setCountdownDuration: (countdownDuration) =>
          set({ countdownDuration: Math.min(Math.max(countdownDuration, 1), 10) }),
        setPlayStartSound: (playStartSound) => set({ playStartSound }),
        setPlayStopSound: (playStopSound) => set({ playStopSound }),

        // Editor defaults
        setDefaultThumbnailSize: (defaultThumbnailSize) => set({ defaultThumbnailSize }),
        setThumbnailQuality: (thumbnailQuality) => set({ thumbnailQuality }),
        setShowFrameNumbers: (showFrameNumbers) => set({ showFrameNumbers }),
        setShowFrameDelays: (showFrameDelays) => set({ showFrameDelays }),
        setDefaultPlaybackLoop: (defaultPlaybackLoop) => set({ defaultPlaybackLoop }),

        // Export defaults
        setDefaultOutputDirectory: (defaultOutputDirectory) => set({ defaultOutputDirectory }),
        setRememberLastOutputDirectory: (rememberLastOutputDirectory) =>
          set({ rememberLastOutputDirectory }),
        setDefaultFormat: (defaultFormat) => set({ defaultFormat }),
        setOpenFileAfterExport: (openFileAfterExport) => set({ openFileAfterExport }),
        setCopyToClipboardAfterExport: (copyToClipboardAfterExport) =>
          set({ copyToClipboardAfterExport }),

        // Performance
        setMaxUndoHistory: (maxUndoHistory) => set({ maxUndoHistory }),
        setMaxRecentProjects: (maxRecentProjects) => set({ maxRecentProjects }),
        setUseHardwareAcceleration: (useHardwareAcceleration) => set({ useHardwareAcceleration }),
        setLowMemoryMode: (lowMemoryMode) => set({ lowMemoryMode }),
        setCacheDirectory: (cacheDirectory) => set({ cacheDirectory }),
        setMaxCacheSize: (maxCacheSize) => set({ maxCacheSize }),

        // Hotkeys
        setHotkey: (id, binding) =>
          set((state) => ({
            hotkeys: state.hotkeys.map((h) => (h.id === id ? { ...h, ...binding } : h)),
          })),
        resetHotkey: (id) =>
          set((state) => ({
            hotkeys: state.hotkeys.map((h) => {
              if (h.id === id) {
                const defaultHotkey = defaultHotkeys.find((dh) => dh.id === id);
                return defaultHotkey ?? h;
              }
              return h;
            }),
          })),
        resetAllHotkeys: () => set({ hotkeys: defaultHotkeys }),
        setGlobalHotkeysEnabled: (globalHotkeysEnabled) => set({ globalHotkeysEnabled }),
        getHotkeyForAction: (action) => get().hotkeys.find((h) => h.action === action),

        // Advanced
        setDeveloperMode: (developerMode) => set({ developerMode }),
        setEnableTelemetry: (enableTelemetry) => set({ enableTelemetry }),
        setLogLevel: (logLevel) => set({ logLevel }),

        // Window state
        setWindowSize: (windowWidth, windowHeight) => set({ windowWidth, windowHeight }),
        setWindowPosition: (windowX, windowY) => set({ windowX, windowY }),
        setIsMaximized: (isMaximized) => set({ isMaximized }),
        setSidebarWidth: (sidebarWidth) => set({ sidebarWidth }),
        setTimelineHeight: (timelineHeight) => set({ timelineHeight }),

        // Bulk operations
        importSettings: (settings) => set(settings),
        exportSettings: () => {
          const state = get();
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { importSettings, exportSettings, resetToDefaults, ...rest } = state;
          return rest;
        },
        resetToDefaults: () => set(initialState),
      }),
      {
        name: 'screentogif-settings',
      }
    )
  )
);

// Selector hooks
export const selectTheme = (state: SettingsState) => state.theme;
export const selectLocale = (state: SettingsState) => state.locale;
export const selectHotkeys = (state: SettingsState) => state.hotkeys;
