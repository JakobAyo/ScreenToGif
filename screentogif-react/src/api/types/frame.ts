/**
 * Frame-related type definitions
 * Represents individual frames and their metadata
 */

/** Metadata associated with a single frame */
export interface FrameMetadata {
  index: number;
  timestamp: number; // milliseconds from start
  delay: number; // display delay in milliseconds
  width: number;
  height: number;
  cursorX?: number;
  cursorY?: number;
  mouseClicked?: boolean;
  keyPressed?: string;
}

/** A single frame in a recording/project */
export interface Frame {
  id: string;
  metadata: FrameMetadata;
  imageDataUrl?: string; // Base64 encoded image for preview
  thumbnailUrl?: string; // Smaller preview thumbnail
  filePath?: string; // Path to frame file on disk
  isKeyFrame: boolean;
  isSelected: boolean;
  isDeleted: boolean; // Soft delete for undo support
}

/** Batch of frames for efficient transfer */
export interface FrameBatch {
  sessionId: string;
  startIndex: number;
  frames: Frame[];
  totalFrames: number;
  hasMore: boolean;
}

/** Frame range selection */
export interface FrameRange {
  startIndex: number;
  endIndex: number;
}

/** Frame edit operation types */
export type FrameEditOperation =
  | 'delete'
  | 'duplicate'
  | 'reverse'
  | 'yoyo'
  | 'reduce'
  | 'moveUp'
  | 'moveDown';

/** Request to edit frames */
export interface FrameEditRequest {
  operation: FrameEditOperation;
  frameIds: string[];
  options?: {
    reduceBy?: number; // For reduce operation
    insertPosition?: number; // For move operations
  };
}

/** Result of a frame edit operation */
export interface FrameEditResult {
  success: boolean;
  affectedFrameIds: string[];
  newFrameCount: number;
  error?: string;
}
