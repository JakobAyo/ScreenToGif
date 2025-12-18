/**
 * Export preset and upload type definitions
 * Presets for quick export and upload destinations
 */

import type { EncodingOptions } from './encoding';

/** Export preset category */
export type PresetCategory = 'gif' | 'video' | 'social' | 'web' | 'custom';

/** Built-in preset identifiers */
export type BuiltInPresetId =
  | 'gif-standard'
  | 'gif-high-quality'
  | 'gif-small-file'
  | 'gif-discord'
  | 'apng-standard'
  | 'webp-standard'
  | 'mp4-standard'
  | 'mp4-high-quality'
  | 'webm-standard'
  | 'twitter'
  | 'instagram'
  | 'github';

/** Export preset definition */
export interface ExportPreset {
  id: string;
  name: string;
  description?: string;
  category: PresetCategory;
  isBuiltIn: boolean;
  isDefault?: boolean;
  icon?: string;
  options: EncodingOptions;
  createdAt?: string;
  modifiedAt?: string;
}

/** Request to create a custom preset */
export interface CreatePresetRequest {
  name: string;
  description?: string;
  category: PresetCategory;
  options: EncodingOptions;
}

/** Request to update a preset */
export interface UpdatePresetRequest {
  id: string;
  name?: string;
  description?: string;
  category?: PresetCategory;
  options?: Partial<EncodingOptions>;
}

/** Upload destination types */
export type UploadDestination = 'imgur' | 'yandex' | 'gfycat' | 'giphy' | 'custom';

/** Upload configuration for a destination */
export interface UploadConfig {
  destination: UploadDestination;
  anonymous: boolean;
  apiKey?: string;
  customUrl?: string;
  customHeaders?: Record<string, string>;
}

/** Request to upload an exported file */
export interface UploadRequest {
  filePath: string;
  config: UploadConfig;
  title?: string;
  description?: string;
  tags?: string[];
}

/** Upload progress information */
export interface UploadProgress {
  uploadId: string;
  destination: UploadDestination;
  progress: number; // 0-100
  bytesUploaded: number;
  totalBytes: number;
  state: 'preparing' | 'uploading' | 'processing' | 'completed' | 'failed';
  error?: string;
}

/** Upload result with URLs */
export interface UploadResult {
  uploadId: string;
  success: boolean;
  destination: UploadDestination;
  url?: string; // Direct link to image/video
  deleteUrl?: string; // URL to delete the upload
  pageUrl?: string; // Page URL on the hosting service
  thumbnailUrl?: string;
  error?: string;
}

/** Recent export entry */
export interface RecentExport {
  id: string;
  projectId: string;
  projectTitle: string;
  outputPath: string;
  format: string;
  fileSize: number;
  exportedAt: string;
  uploadResult?: UploadResult;
}

/** Export queue item */
export interface ExportQueueItem {
  id: string;
  projectId: string;
  preset: ExportPreset;
  outputPath: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  addedAt: string;
  completedAt?: string;
  error?: string;
}

/** Export queue state */
export interface ExportQueue {
  items: ExportQueueItem[];
  isProcessing: boolean;
  maxConcurrent: number;
}
