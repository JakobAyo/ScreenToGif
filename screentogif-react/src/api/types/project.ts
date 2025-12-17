/**
 * Project-related type definitions
 * Project structure, tracks, sequences, and persistence
 */

import type { Frame } from './frame';
import type { CaptureOptions } from './capture';

/** Track types in a project */
export type TrackType = 'frames' | 'audio' | 'cursor' | 'keystrokes' | 'text' | 'shapes' | 'watermark';

/** A single item on a track */
export interface TrackItem {
  id: string;
  startTime: number; // milliseconds
  duration: number; // milliseconds
  data: unknown; // Type depends on track type
}

/** A track in the project timeline */
export interface Track {
  id: string;
  type: TrackType;
  name: string;
  isVisible: boolean;
  isLocked: boolean;
  items: TrackItem[];
}

/** A sequence is a collection of tracks (for multi-sequence editing) */
export interface Sequence {
  id: string;
  name: string;
  tracks: Track[];
  duration: number; // Total duration in milliseconds
  frameRate: number;
  width: number;
  height: number;
}

/** Project metadata */
export interface ProjectMetadata {
  title: string;
  description?: string;
  author?: string;
  createdAt: string;
  modifiedAt: string;
  version: string;
  tags?: string[];
}

/** Project file info (for recent files list) */
export interface ProjectFileInfo {
  path: string;
  metadata: ProjectMetadata;
  thumbnailUrl?: string;
  fileSize: number;
  lastAccessedAt: string;
}

/** Complete project structure */
export interface Project {
  id: string;
  metadata: ProjectMetadata;
  sequences: Sequence[];
  frames: Frame[];
  captureOptions?: CaptureOptions;
  originalWidth: number;
  originalHeight: number;
  originalFrameRate: number;
  totalDuration: number;
  isDirty: boolean; // Has unsaved changes
  autoSaveEnabled: boolean;
  lastSavedAt?: string;
  filePath?: string;
}

/** Request to create a new project */
export interface CreateProjectRequest {
  title: string;
  width: number;
  height: number;
  frameRate: number;
  description?: string;
}

/** Request to open an existing project */
export interface OpenProjectRequest {
  path: string;
}

/** Request to save a project */
export interface SaveProjectRequest {
  projectId: string;
  path?: string; // If undefined, save to existing path
}

/** Response when project is loaded */
export interface ProjectLoadResponse {
  project: Project;
  success: boolean;
  error?: string;
  warnings?: string[]; // Non-fatal issues during load
}

/** Response when project is saved */
export interface ProjectSaveResponse {
  path: string;
  success: boolean;
  error?: string;
  savedAt: string;
}

/** Import source types */
export type ImportSource = 'gif' | 'video' | 'images' | 'project' | 'clipboard';

/** Request to import media into project */
export interface ImportMediaRequest {
  source: ImportSource;
  paths?: string[];
  insertPosition?: number; // Frame index
  replaceExisting?: boolean;
}

/** Response from media import */
export interface ImportMediaResponse {
  importedFrameCount: number;
  startIndex: number;
  success: boolean;
  error?: string;
  warnings?: string[];
}

/** Project undo/redo history entry */
export interface HistoryEntry {
  id: string;
  action: string;
  timestamp: string;
  canUndo: boolean;
  canRedo: boolean;
}

/** Project history state */
export interface ProjectHistory {
  entries: HistoryEntry[];
  currentIndex: number;
  maxSize: number;
}
