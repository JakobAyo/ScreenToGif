/**
 * API Types Index
 * Re-exports all API type definitions for convenient imports
 */

// Capture types
export type {
  CaptureRegion,
  DisplayInfo,
  WindowInfo,
  CaptureMode,
  CaptureOptions,
  CaptureState,
  CaptureSession,
  StartCaptureResponse,
  StopCaptureResponse,
} from './capture';

// Frame types
export type {
  FrameMetadata,
  Frame,
  FrameBatch,
  FrameRange,
  FrameEditOperation,
  FrameEditRequest,
  FrameEditResult,
} from './frame';

// Encoding types
export type {
  OutputFormat,
  GifEncoder,
  VideoCodec,
  QuantizationMethod,
  DitheringAlgorithm,
  GifEncodingOptions,
  VideoEncodingOptions,
  ApngEncodingOptions,
  WebpEncodingOptions,
  ImageSequenceOptions,
  EncodingOptions,
  EncodingState,
  EncodingProgress,
  StartEncodingRequest,
  StartEncodingResponse,
  EncodingCompleteResponse,
} from './encoding';

// Project types
export type {
  TrackType,
  TrackItem,
  Track,
  Sequence,
  ProjectMetadata,
  ProjectFileInfo,
  Project,
  CreateProjectRequest,
  OpenProjectRequest,
  SaveProjectRequest,
  ProjectLoadResponse,
  ProjectSaveResponse,
  ImportSource,
  ImportMediaRequest,
  ImportMediaResponse,
  HistoryEntry,
  ProjectHistory,
} from './project';

// Export/Preset types
export type {
  PresetCategory,
  BuiltInPresetId,
  ExportPreset,
  CreatePresetRequest,
  UpdatePresetRequest,
  UploadDestination,
  UploadConfig,
  UploadRequest,
  UploadProgress,
  UploadResult,
  RecentExport,
  ExportQueueItem,
  ExportQueue,
} from './export';
