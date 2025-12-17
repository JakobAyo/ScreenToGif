/**
 * Capture-related type definitions
 * Mirrors backend capture DTOs for type-safe communication
 */

/** Represents a rectangular region for screen capture */
export interface CaptureRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Display/monitor information for capture selection */
export interface DisplayInfo {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isPrimary: boolean;
  scaleFactor: number;
}

/** Window information for window capture */
export interface WindowInfo {
  id: string;
  title: string;
  processName: string;
  bounds: CaptureRegion;
  isMinimized: boolean;
  isVisible: boolean;
}

/** Capture mode types */
export type CaptureMode = 'screen' | 'window' | 'region' | 'webcam' | 'board';

/** Options for configuring a capture session */
export interface CaptureOptions {
  mode: CaptureMode;
  region?: CaptureRegion;
  displayId?: string;
  windowId?: string;
  frameRate: number;
  captureMouseCursor: boolean;
  captureMouseClicks: boolean;
  maxDuration?: number; // in seconds
  maxFrames?: number;
}

/** Current state of a capture session */
export type CaptureState = 'idle' | 'starting' | 'recording' | 'paused' | 'stopping';

/** Represents an active capture session */
export interface CaptureSession {
  id: string;
  state: CaptureState;
  options: CaptureOptions;
  startedAt?: string;
  frameCount: number;
  duration: number; // in milliseconds
  lastFrameTimestamp?: string;
}

/** Response when starting a capture */
export interface StartCaptureResponse {
  sessionId: string;
  success: boolean;
  error?: string;
}

/** Response when stopping a capture */
export interface StopCaptureResponse {
  sessionId: string;
  frameCount: number;
  duration: number;
  success: boolean;
  error?: string;
}
