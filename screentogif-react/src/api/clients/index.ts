/**
 * API Clients Index
 * Re-exports all API clients for convenient imports
 */

// Capture Client
export {
  getDisplays,
  getWindows,
  startCapture,
  stopCapture,
  pauseCapture,
  resumeCapture,
  discardCapture,
  getCaptureStatus,
  getCaptureFrames,
  getCaptureFrame,
  showRegionSelector,
  hideRegionSelector,
  takeScreenshot,
} from './captureClient';

// Encoding Client
export {
  startEncoding,
  cancelEncoding,
  getEncodingProgress,
  getActiveJobs,
  getAvailableEncoders,
  validateEncodingOptions,
  estimateFileSize,
  getEncodingResult,
  startBatchEncoding,
} from './encodingClient';

// Project Client
export {
  createProject,
  openProject,
  saveProject,
  saveProjectAs,
  getProjectInfo,
  getRecentProjects,
  importMedia,
  exportFrames,
  showOpenDialog,
  showSaveDialog,
  showFolderDialog,
  clearAutoSave,
  hasAutoSave,
  recoverFromAutoSave,
} from './projectClient';

// Image Processing Client
export {
  cropFrames,
  resizeFrames,
  transformFrames,
  addTextOverlay,
  addDrawing,
  blurFrames,
  addBorder,
  addWatermark,
  addShadow,
  adjustColors,
  applyFilter,
  editFrames,
  previewEffect,
  undoEffect,
  redoEffect,
} from './imageProcessingClient';
export type {
  CropParams,
  ResizeParams,
  TransformParams,
  TextOverlayParams,
  DrawingParams,
  BlurParams,
  BorderParams,
  WatermarkParams,
  ShadowParams,
  ColorAdjustmentParams,
  FilterType,
  FilterParams,
} from './imageProcessingClient';

// Upload Client
export {
  uploadFile,
  getUploadProgress,
  cancelUpload,
  getUploadResult,
  deleteUpload,
  uploadToImgur,
  uploadToYandex,
  uploadToGfycat,
  uploadToGiphy,
  uploadToCustom,
  validateUploadConfig,
  getUploadDestinations,
  testUploadConnection,
  getUploadHistory,
  clearUploadHistory,
} from './uploadClient';
