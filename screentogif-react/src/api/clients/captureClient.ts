/**
 * Capture Client
 * API client for screen capture operations
 */

import { invoke } from '@tauri-apps/api/core';
import type {
  CaptureOptions,
  CaptureSession,
  StartCaptureResponse,
  StopCaptureResponse,
  DisplayInfo,
  WindowInfo,
  CaptureRegion,
} from '../types';

const BACKEND_BASE_URL = 'http://localhost:5001';

/**
 * Get list of available displays/monitors
 */
export async function getDisplays(): Promise<DisplayInfo[]> {
  const response = await fetch(`${BACKEND_BASE_URL}/api/capture/displays`);
  if (!response.ok) {
    throw new Error(`Failed to get displays: ${response.status}`);
  }
  return response.json();
}

/**
 * Get list of available windows for capture
 */
export async function getWindows(): Promise<WindowInfo[]> {
  const response = await fetch(`${BACKEND_BASE_URL}/api/capture/windows`);
  if (!response.ok) {
    throw new Error(`Failed to get windows: ${response.status}`);
  }
  return response.json();
}

/**
 * Start a capture session with given options
 */
export async function startCapture(options: CaptureOptions): Promise<StartCaptureResponse> {
  const response = await fetch(`${BACKEND_BASE_URL}/api/capture/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(options),
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to start capture: ${error}`);
  }
  return response.json();
}

/**
 * Stop the current capture session
 */
export async function stopCapture(sessionId: string): Promise<StopCaptureResponse> {
  const response = await fetch(`${BACKEND_BASE_URL}/api/capture/stop`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId }),
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to stop capture: ${error}`);
  }
  return response.json();
}

/**
 * Pause the current capture session
 */
export async function pauseCapture(sessionId: string): Promise<void> {
  const response = await fetch(`${BACKEND_BASE_URL}/api/capture/pause`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId }),
  });
  if (!response.ok) {
    throw new Error(`Failed to pause capture: ${response.status}`);
  }
}

/**
 * Resume a paused capture session
 */
export async function resumeCapture(sessionId: string): Promise<void> {
  const response = await fetch(`${BACKEND_BASE_URL}/api/capture/resume`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId }),
  });
  if (!response.ok) {
    throw new Error(`Failed to resume capture: ${response.status}`);
  }
}

/**
 * Discard the current capture session
 */
export async function discardCapture(sessionId: string): Promise<void> {
  const response = await fetch(`${BACKEND_BASE_URL}/api/capture/discard`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId }),
  });
  if (!response.ok) {
    throw new Error(`Failed to discard capture: ${response.status}`);
  }
}

/**
 * Get current capture session status
 */
export async function getCaptureStatus(sessionId: string): Promise<CaptureSession> {
  const response = await fetch(`${BACKEND_BASE_URL}/api/capture/status/${sessionId}`);
  if (!response.ok) {
    throw new Error(`Failed to get capture status: ${response.status}`);
  }
  return response.json();
}

/**
 * Get frames from a capture session
 */
export async function getCaptureFrames(
  sessionId: string,
  startIndex: number = 0,
  count: number = 50
): Promise<{ frames: unknown[]; total: number; hasMore: boolean }> {
  const response = await fetch(
    `${BACKEND_BASE_URL}/api/capture/frames/${sessionId}?start=${startIndex}&count=${count}`
  );
  if (!response.ok) {
    throw new Error(`Failed to get capture frames: ${response.status}`);
  }
  return response.json();
}

/**
 * Get a specific frame by index
 */
export async function getCaptureFrame(
  sessionId: string,
  frameIndex: number
): Promise<{ imageData: string; metadata: unknown }> {
  const response = await fetch(
    `${BACKEND_BASE_URL}/api/capture/frame/${sessionId}/${frameIndex}`
  );
  if (!response.ok) {
    throw new Error(`Failed to get frame: ${response.status}`);
  }
  return response.json();
}

/**
 * Show region selector overlay via Tauri
 */
export async function showRegionSelector(): Promise<CaptureRegion | null> {
  return invoke<CaptureRegion | null>('show_region_selector');
}

/**
 * Hide region selector overlay via Tauri
 */
export async function hideRegionSelector(): Promise<void> {
  return invoke<void>('hide_region_selector');
}

/**
 * Take a single screenshot
 */
export async function takeScreenshot(
  region?: CaptureRegion
): Promise<{ imageData: string; width: number; height: number }> {
  const response = await fetch(`${BACKEND_BASE_URL}/api/capture/screenshot`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ region }),
  });
  if (!response.ok) {
    throw new Error(`Failed to take screenshot: ${response.status}`);
  }
  return response.json();
}
