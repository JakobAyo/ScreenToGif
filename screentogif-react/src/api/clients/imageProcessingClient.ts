/**
 * Image Processing Client
 * API client for applying effects and transformations to frames
 */

import type { FrameEditRequest, FrameEditResult } from '../types';

const BACKEND_BASE_URL = 'http://localhost:5001';

/** Crop parameters */
export interface CropParams {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Resize parameters */
export interface ResizeParams {
  width: number;
  height: number;
  maintainAspectRatio: boolean;
  resizeMethod: 'nearest' | 'bilinear' | 'bicubic' | 'lanczos';
}

/** Flip/rotate parameters */
export interface TransformParams {
  flipHorizontal?: boolean;
  flipVertical?: boolean;
  rotation?: 0 | 90 | 180 | 270;
}

/** Text overlay parameters */
export interface TextOverlayParams {
  text: string;
  fontFamily: string;
  fontSize: number;
  fontColor: string;
  backgroundColor?: string;
  position: { x: number; y: number };
  alignment: 'left' | 'center' | 'right';
  bold?: boolean;
  italic?: boolean;
  outline?: { color: string; width: number };
  shadow?: { color: string; offsetX: number; offsetY: number; blur: number };
}

/** Drawing/shape parameters */
export interface DrawingParams {
  type: 'rectangle' | 'ellipse' | 'line' | 'arrow' | 'freehand';
  color: string;
  strokeWidth: number;
  fill?: string;
  points: { x: number; y: number }[];
}

/** Blur parameters */
export interface BlurParams {
  type: 'gaussian' | 'box' | 'pixelate';
  strength: number;
  region?: { x: number; y: number; width: number; height: number };
}

/** Border parameters */
export interface BorderParams {
  color: string;
  width: number;
  style: 'solid' | 'dashed' | 'double';
  radius?: number;
}

/** Watermark parameters */
export interface WatermarkParams {
  imageData?: string; // Base64 encoded image
  text?: string;
  position: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'center' | 'custom';
  customPosition?: { x: number; y: number };
  opacity: number;
  scale?: number;
}

/** Shadow parameters */
export interface ShadowParams {
  color: string;
  offsetX: number;
  offsetY: number;
  blur: number;
}

/** Color adjustment parameters */
export interface ColorAdjustmentParams {
  brightness?: number; // -100 to 100
  contrast?: number; // -100 to 100
  saturation?: number; // -100 to 100
  hue?: number; // -180 to 180
  gamma?: number; // 0.1 to 10
}

/** Filter types */
export type FilterType = 'grayscale' | 'sepia' | 'invert' | 'threshold' | 'posterize' | 'solarize';

/** Filter parameters */
export interface FilterParams {
  type: FilterType;
  intensity?: number; // 0-100
  threshold?: number; // For threshold filter
  levels?: number; // For posterize filter
}

/**
 * Apply crop to frames
 */
export async function cropFrames(
  projectId: string,
  frameIds: string[],
  params: CropParams
): Promise<FrameEditResult> {
  const response = await fetch(`${BACKEND_BASE_URL}/api/processing/crop`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId, frameIds, params }),
  });
  if (!response.ok) {
    throw new Error(`Failed to crop frames: ${response.status}`);
  }
  return response.json();
}

/**
 * Apply resize to frames
 */
export async function resizeFrames(
  projectId: string,
  frameIds: string[],
  params: ResizeParams
): Promise<FrameEditResult> {
  const response = await fetch(`${BACKEND_BASE_URL}/api/processing/resize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId, frameIds, params }),
  });
  if (!response.ok) {
    throw new Error(`Failed to resize frames: ${response.status}`);
  }
  return response.json();
}

/**
 * Apply flip/rotate to frames
 */
export async function transformFrames(
  projectId: string,
  frameIds: string[],
  params: TransformParams
): Promise<FrameEditResult> {
  const response = await fetch(`${BACKEND_BASE_URL}/api/processing/transform`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId, frameIds, params }),
  });
  if (!response.ok) {
    throw new Error(`Failed to transform frames: ${response.status}`);
  }
  return response.json();
}

/**
 * Add text overlay to frames
 */
export async function addTextOverlay(
  projectId: string,
  frameIds: string[],
  params: TextOverlayParams
): Promise<FrameEditResult> {
  const response = await fetch(`${BACKEND_BASE_URL}/api/processing/text`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId, frameIds, params }),
  });
  if (!response.ok) {
    throw new Error(`Failed to add text overlay: ${response.status}`);
  }
  return response.json();
}

/**
 * Add drawing/shape to frames
 */
export async function addDrawing(
  projectId: string,
  frameIds: string[],
  params: DrawingParams
): Promise<FrameEditResult> {
  const response = await fetch(`${BACKEND_BASE_URL}/api/processing/draw`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId, frameIds, params }),
  });
  if (!response.ok) {
    throw new Error(`Failed to add drawing: ${response.status}`);
  }
  return response.json();
}

/**
 * Apply blur effect to frames
 */
export async function blurFrames(
  projectId: string,
  frameIds: string[],
  params: BlurParams
): Promise<FrameEditResult> {
  const response = await fetch(`${BACKEND_BASE_URL}/api/processing/blur`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId, frameIds, params }),
  });
  if (!response.ok) {
    throw new Error(`Failed to apply blur: ${response.status}`);
  }
  return response.json();
}

/**
 * Add border to frames
 */
export async function addBorder(
  projectId: string,
  frameIds: string[],
  params: BorderParams
): Promise<FrameEditResult> {
  const response = await fetch(`${BACKEND_BASE_URL}/api/processing/border`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId, frameIds, params }),
  });
  if (!response.ok) {
    throw new Error(`Failed to add border: ${response.status}`);
  }
  return response.json();
}

/**
 * Add watermark to frames
 */
export async function addWatermark(
  projectId: string,
  frameIds: string[],
  params: WatermarkParams
): Promise<FrameEditResult> {
  const response = await fetch(`${BACKEND_BASE_URL}/api/processing/watermark`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId, frameIds, params }),
  });
  if (!response.ok) {
    throw new Error(`Failed to add watermark: ${response.status}`);
  }
  return response.json();
}

/**
 * Add shadow effect to frames
 */
export async function addShadow(
  projectId: string,
  frameIds: string[],
  params: ShadowParams
): Promise<FrameEditResult> {
  const response = await fetch(`${BACKEND_BASE_URL}/api/processing/shadow`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId, frameIds, params }),
  });
  if (!response.ok) {
    throw new Error(`Failed to add shadow: ${response.status}`);
  }
  return response.json();
}

/**
 * Apply color adjustments to frames
 */
export async function adjustColors(
  projectId: string,
  frameIds: string[],
  params: ColorAdjustmentParams
): Promise<FrameEditResult> {
  const response = await fetch(`${BACKEND_BASE_URL}/api/processing/colors`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId, frameIds, params }),
  });
  if (!response.ok) {
    throw new Error(`Failed to adjust colors: ${response.status}`);
  }
  return response.json();
}

/**
 * Apply filter to frames
 */
export async function applyFilter(
  projectId: string,
  frameIds: string[],
  params: FilterParams
): Promise<FrameEditResult> {
  const response = await fetch(`${BACKEND_BASE_URL}/api/processing/filter`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId, frameIds, params }),
  });
  if (!response.ok) {
    throw new Error(`Failed to apply filter: ${response.status}`);
  }
  return response.json();
}

/**
 * Edit frames (delete, duplicate, reverse, etc.)
 */
export async function editFrames(
  projectId: string,
  request: FrameEditRequest
): Promise<FrameEditResult> {
  const response = await fetch(`${BACKEND_BASE_URL}/api/processing/edit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId, ...request }),
  });
  if (!response.ok) {
    throw new Error(`Failed to edit frames: ${response.status}`);
  }
  return response.json();
}

/**
 * Generate preview of effect without applying
 */
export async function previewEffect(
  projectId: string,
  frameId: string,
  effectType: string,
  params: unknown
): Promise<{ previewImageData: string }> {
  const response = await fetch(`${BACKEND_BASE_URL}/api/processing/preview`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId, frameId, effectType, params }),
  });
  if (!response.ok) {
    throw new Error(`Failed to generate preview: ${response.status}`);
  }
  return response.json();
}

/**
 * Undo last effect
 */
export async function undoEffect(projectId: string): Promise<FrameEditResult> {
  const response = await fetch(`${BACKEND_BASE_URL}/api/processing/undo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId }),
  });
  if (!response.ok) {
    throw new Error(`Failed to undo effect: ${response.status}`);
  }
  return response.json();
}

/**
 * Redo previously undone effect
 */
export async function redoEffect(projectId: string): Promise<FrameEditResult> {
  const response = await fetch(`${BACKEND_BASE_URL}/api/processing/redo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId }),
  });
  if (!response.ok) {
    throw new Error(`Failed to redo effect: ${response.status}`);
  }
  return response.json();
}
