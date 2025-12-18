/**
 * Export Store
 * Manages export configuration, presets, encoding progress, and upload state
 */

import { create } from 'zustand';
import { subscribeWithSelector, persist } from 'zustand/middleware';
import type {
  EncodingOptions,
  EncodingProgress,
  ExportPreset,
  PresetCategory,
  OutputFormat,
  UploadConfig,
  UploadProgress,
  UploadResult,
  RecentExport,
  ExportQueueItem,
} from '../api/types';

interface ExportState {
  // Current export configuration
  currentOptions: EncodingOptions | null;
  selectedPresetId: string | null;
  outputPath: string;
  outputFileName: string;

  // Presets
  builtInPresets: ExportPreset[];
  customPresets: ExportPreset[];
  defaultPresetId: string | null;

  // Encoding state
  isEncoding: boolean;
  currentJobId: string | null;
  encodingProgress: EncodingProgress | null;

  // Export queue
  queue: ExportQueueItem[];
  isQueueProcessing: boolean;
  maxConcurrentJobs: number;

  // Upload state
  isUploading: boolean;
  uploadProgress: UploadProgress | null;
  lastUploadResult: UploadResult | null;
  uploadConfig: UploadConfig | null;

  // Recent exports
  recentExports: RecentExport[];
  maxRecentExports: number;

  // UI state
  showAdvancedOptions: boolean;
  selectedFormatTab: OutputFormat;

  // Error state
  error: string | null;
}

interface ExportActions {
  // Configuration
  setCurrentOptions: (options: EncodingOptions) => void;
  updateCurrentOptions: (updates: Partial<EncodingOptions>) => void;
  setSelectedPresetId: (presetId: string | null) => void;
  setOutputPath: (path: string) => void;
  setOutputFileName: (fileName: string) => void;
  applyPreset: (preset: ExportPreset) => void;

  // Presets
  setBuiltInPresets: (presets: ExportPreset[]) => void;
  addCustomPreset: (preset: ExportPreset) => void;
  updateCustomPreset: (presetId: string, updates: Partial<ExportPreset>) => void;
  removeCustomPreset: (presetId: string) => void;
  setDefaultPresetId: (presetId: string | null) => void;
  getPresetById: (presetId: string) => ExportPreset | undefined;
  getPresetsByCategory: (category: PresetCategory) => ExportPreset[];

  // Encoding
  startEncoding: (jobId: string) => void;
  updateEncodingProgress: (progress: EncodingProgress) => void;
  completeEncoding: (success: boolean, error?: string) => void;
  cancelEncoding: () => void;

  // Queue
  addToQueue: (item: Omit<ExportQueueItem, 'id' | 'status' | 'progress' | 'addedAt'>) => void;
  removeFromQueue: (itemId: string) => void;
  clearQueue: () => void;
  updateQueueItem: (itemId: string, updates: Partial<ExportQueueItem>) => void;
  startQueueProcessing: () => void;
  stopQueueProcessing: () => void;

  // Upload
  startUpload: (config: UploadConfig) => void;
  updateUploadProgress: (progress: UploadProgress) => void;
  completeUpload: (result: UploadResult) => void;
  cancelUpload: () => void;
  setUploadConfig: (config: UploadConfig | null) => void;

  // Recent exports
  addRecentExport: (exportInfo: RecentExport) => void;
  removeRecentExport: (exportId: string) => void;
  clearRecentExports: () => void;

  // UI
  setShowAdvancedOptions: (show: boolean) => void;
  toggleAdvancedOptions: () => void;
  setSelectedFormatTab: (format: OutputFormat) => void;

  // Error handling
  setError: (error: string | null) => void;
  clearError: () => void;

  // Reset
  reset: () => void;
  resetProgress: () => void;
}

// Default GIF encoding options
const defaultGifOptions: EncodingOptions = {
  format: 'gif',
  outputPath: '',
  gif: {
    encoder: 'screentogif',
    colorCount: 256,
    quantization: 'medianCut',
    dithering: 'floydSteinberg',
    quality: 80,
    loopCount: 0,
    enableTransparency: false,
    detectUnchangedPixels: true,
    paintTransparent: false,
  },
};

// Built-in presets
const defaultBuiltInPresets: ExportPreset[] = [
  {
    id: 'gif-standard',
    name: 'Standard GIF',
    description: 'Balanced quality and file size',
    category: 'gif',
    isBuiltIn: true,
    isDefault: true,
    options: { ...defaultGifOptions },
  },
  {
    id: 'gif-high-quality',
    name: 'High Quality GIF',
    description: 'Maximum quality, larger file size',
    category: 'gif',
    isBuiltIn: true,
    options: {
      ...defaultGifOptions,
      gif: { ...defaultGifOptions.gif!, colorCount: 256, quality: 100, dithering: 'floydSteinberg' },
    },
  },
  {
    id: 'gif-small-file',
    name: 'Small File GIF',
    description: 'Optimized for smallest file size',
    category: 'gif',
    isBuiltIn: true,
    options: {
      ...defaultGifOptions,
      gif: { ...defaultGifOptions.gif!, colorCount: 128, quality: 60, dithering: 'ordered' },
    },
  },
  {
    id: 'gif-discord',
    name: 'Discord GIF',
    description: 'Optimized for Discord (< 8MB)',
    category: 'social',
    isBuiltIn: true,
    options: {
      ...defaultGifOptions,
      gif: { ...defaultGifOptions.gif!, colorCount: 128, quality: 70 },
    },
  },
  {
    id: 'mp4-standard',
    name: 'Standard MP4',
    description: 'H.264 video with good compression',
    category: 'video',
    isBuiltIn: true,
    options: {
      format: 'mp4',
      outputPath: '',
      video: {
        codec: 'h264',
        bitrate: 5000,
        quality: 23,
        preset: 'medium',
        pixelFormat: 'yuv420p',
        audioEnabled: false,
      },
    },
  },
  {
    id: 'webm-standard',
    name: 'Standard WebM',
    description: 'VP9 video for web use',
    category: 'video',
    isBuiltIn: true,
    options: {
      format: 'webm',
      outputPath: '',
      video: {
        codec: 'vp9',
        bitrate: 3000,
        quality: 30,
        preset: 'medium',
        pixelFormat: 'yuv420p',
        audioEnabled: false,
      },
    },
  },
  {
    id: 'apng-standard',
    name: 'Standard APNG',
    description: 'Animated PNG with full color',
    category: 'gif',
    isBuiltIn: true,
    options: {
      format: 'apng',
      outputPath: '',
      apng: {
        colorDepth: 24,
        compressionLevel: 6,
        loopCount: 0,
        enableTransparency: true,
        detectUnchangedPixels: true,
      },
    },
  },
  {
    id: 'webp-standard',
    name: 'Standard WebP',
    description: 'Animated WebP for modern browsers',
    category: 'web',
    isBuiltIn: true,
    options: {
      format: 'webp',
      outputPath: '',
      webp: {
        quality: 80,
        lossless: false,
        loopCount: 0,
        method: 4,
      },
    },
  },
];

const initialState: ExportState = {
  currentOptions: null,
  selectedPresetId: 'gif-standard',
  outputPath: '',
  outputFileName: 'animation',
  builtInPresets: defaultBuiltInPresets,
  customPresets: [],
  defaultPresetId: 'gif-standard',
  isEncoding: false,
  currentJobId: null,
  encodingProgress: null,
  queue: [],
  isQueueProcessing: false,
  maxConcurrentJobs: 1,
  isUploading: false,
  uploadProgress: null,
  lastUploadResult: null,
  uploadConfig: null,
  recentExports: [],
  maxRecentExports: 20,
  showAdvancedOptions: false,
  selectedFormatTab: 'gif',
  error: null,
};

export const useExportStore = create<ExportState & ExportActions>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        ...initialState,

        // Configuration
        setCurrentOptions: (currentOptions) => set({ currentOptions }),
        updateCurrentOptions: (updates) =>
          set((state) => ({
            currentOptions: state.currentOptions
              ? { ...state.currentOptions, ...updates }
              : null,
          })),
        setSelectedPresetId: (selectedPresetId) => set({ selectedPresetId }),
        setOutputPath: (outputPath) => set({ outputPath }),
        setOutputFileName: (outputFileName) => set({ outputFileName }),
        applyPreset: (preset) =>
          set({
            currentOptions: { ...preset.options },
            selectedPresetId: preset.id,
            selectedFormatTab: preset.options.format,
          }),

        // Presets
        setBuiltInPresets: (builtInPresets) => set({ builtInPresets }),
        addCustomPreset: (preset) =>
          set((state) => ({ customPresets: [...state.customPresets, preset] })),
        updateCustomPreset: (presetId, updates) =>
          set((state) => ({
            customPresets: state.customPresets.map((p) =>
              p.id === presetId ? { ...p, ...updates, modifiedAt: new Date().toISOString() } : p
            ),
          })),
        removeCustomPreset: (presetId) =>
          set((state) => ({
            customPresets: state.customPresets.filter((p) => p.id !== presetId),
          })),
        setDefaultPresetId: (defaultPresetId) => set({ defaultPresetId }),
        getPresetById: (presetId) => {
          const { builtInPresets, customPresets } = get();
          return [...builtInPresets, ...customPresets].find((p) => p.id === presetId);
        },
        getPresetsByCategory: (category) => {
          const { builtInPresets, customPresets } = get();
          return [...builtInPresets, ...customPresets].filter((p) => p.category === category);
        },

        // Encoding
        startEncoding: (jobId) =>
          set({
            isEncoding: true,
            currentJobId: jobId,
            encodingProgress: {
              jobId,
              state: 'preparing',
              progress: 0,
              currentFrame: 0,
              totalFrames: 0,
              stage: 'Preparing...',
              startedAt: new Date().toISOString(),
            },
            error: null,
          }),
        updateEncodingProgress: (encodingProgress) => set({ encodingProgress }),
        completeEncoding: (success, error) =>
          set((state) => ({
            isEncoding: false,
            encodingProgress: state.encodingProgress
              ? {
                  ...state.encodingProgress,
                  state: success ? 'completed' : 'failed',
                  progress: success ? 100 : state.encodingProgress.progress,
                  completedAt: new Date().toISOString(),
                  error,
                }
              : null,
            error: success ? null : error ?? null,
          })),
        cancelEncoding: () =>
          set((state) => ({
            isEncoding: false,
            encodingProgress: state.encodingProgress
              ? { ...state.encodingProgress, state: 'cancelled' }
              : null,
          })),

        // Queue
        addToQueue: (item) =>
          set((state) => ({
            queue: [
              ...state.queue,
              {
                ...item,
                id: crypto.randomUUID(),
                status: 'queued',
                progress: 0,
                addedAt: new Date().toISOString(),
              },
            ],
          })),
        removeFromQueue: (itemId) =>
          set((state) => ({ queue: state.queue.filter((i) => i.id !== itemId) })),
        clearQueue: () => set({ queue: [] }),
        updateQueueItem: (itemId, updates) =>
          set((state) => ({
            queue: state.queue.map((i) => (i.id === itemId ? { ...i, ...updates } : i)),
          })),
        startQueueProcessing: () => set({ isQueueProcessing: true }),
        stopQueueProcessing: () => set({ isQueueProcessing: false }),

        // Upload
        startUpload: (config) =>
          set({
            isUploading: true,
            uploadConfig: config,
            uploadProgress: {
              uploadId: crypto.randomUUID(),
              destination: config.destination,
              progress: 0,
              bytesUploaded: 0,
              totalBytes: 0,
              state: 'preparing',
            },
            error: null,
          }),
        updateUploadProgress: (uploadProgress) => set({ uploadProgress }),
        completeUpload: (lastUploadResult) =>
          set({
            isUploading: false,
            lastUploadResult,
            uploadProgress: null,
          }),
        cancelUpload: () =>
          set({
            isUploading: false,
            uploadProgress: null,
          }),
        setUploadConfig: (uploadConfig) => set({ uploadConfig }),

        // Recent exports
        addRecentExport: (exportInfo) =>
          set((state) => {
            const newRecent = [exportInfo, ...state.recentExports].slice(0, state.maxRecentExports);
            return { recentExports: newRecent };
          }),
        removeRecentExport: (exportId) =>
          set((state) => ({
            recentExports: state.recentExports.filter((e) => e.id !== exportId),
          })),
        clearRecentExports: () => set({ recentExports: [] }),

        // UI
        setShowAdvancedOptions: (showAdvancedOptions) => set({ showAdvancedOptions }),
        toggleAdvancedOptions: () =>
          set((state) => ({ showAdvancedOptions: !state.showAdvancedOptions })),
        setSelectedFormatTab: (selectedFormatTab) => set({ selectedFormatTab }),

        // Error handling
        setError: (error) => set({ error }),
        clearError: () => set({ error: null }),

        // Reset
        reset: () => set(initialState),
        resetProgress: () =>
          set({
            isEncoding: false,
            currentJobId: null,
            encodingProgress: null,
            isUploading: false,
            uploadProgress: null,
            error: null,
          }),
      }),
      {
        name: 'screentogif-export-store',
        partialize: (state) => ({
          customPresets: state.customPresets,
          defaultPresetId: state.defaultPresetId,
          recentExports: state.recentExports,
          showAdvancedOptions: state.showAdvancedOptions,
        }),
      }
    )
  )
);

// Selector hooks
export const selectIsEncoding = (state: ExportState) => state.isEncoding;
export const selectEncodingProgress = (state: ExportState) => state.encodingProgress?.progress ?? 0;
export const selectAllPresets = (state: ExportState) => [
  ...state.builtInPresets,
  ...state.customPresets,
];
