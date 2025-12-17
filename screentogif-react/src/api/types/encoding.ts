/**
 * Encoding-related type definitions
 * Configuration and progress for export operations
 */

/** Supported output formats */
export type OutputFormat = 'gif' | 'apng' | 'webp' | 'mp4' | 'webm' | 'avi' | 'png' | 'jpg' | 'psd' | 'stg';

/** GIF encoder options */
export type GifEncoder = 'screentogif' | 'gifski' | 'ffmpeg' | 'system';

/** Video codec options */
export type VideoCodec = 'h264' | 'h265' | 'vp8' | 'vp9' | 'av1';

/** Quantization method for color reduction */
export type QuantizationMethod = 'medianCut' | 'octree' | 'neuQuant' | 'wuQuantizer';

/** Dithering algorithm */
export type DitheringAlgorithm = 'none' | 'floydSteinberg' | 'ordered' | 'atkinson';

/** GIF-specific encoding options */
export interface GifEncodingOptions {
  encoder: GifEncoder;
  colorCount: number; // 2-256
  quantization: QuantizationMethod;
  dithering: DitheringAlgorithm;
  quality: number; // 1-100
  loopCount: number; // 0 = infinite
  enableTransparency: boolean;
  transparencyColor?: string;
  detectUnchangedPixels: boolean;
  paintTransparent: boolean;
}

/** Video-specific encoding options */
export interface VideoEncodingOptions {
  codec: VideoCodec;
  bitrate: number; // in kbps
  quality: number; // CRF value or quality percentage
  preset: 'ultrafast' | 'superfast' | 'veryfast' | 'faster' | 'fast' | 'medium' | 'slow' | 'slower' | 'veryslow';
  pixelFormat: string;
  audioEnabled: boolean;
  audioBitrate?: number;
}

/** APNG-specific encoding options */
export interface ApngEncodingOptions {
  colorDepth: 8 | 16 | 24 | 32;
  compressionLevel: number; // 0-9
  loopCount: number;
  enableTransparency: boolean;
  detectUnchangedPixels: boolean;
}

/** WebP-specific encoding options */
export interface WebpEncodingOptions {
  quality: number; // 0-100
  lossless: boolean;
  loopCount: number;
  method: number; // 0-6, compression method
}

/** Image sequence export options */
export interface ImageSequenceOptions {
  format: 'png' | 'jpg' | 'bmp';
  quality: number; // For JPEG
  namePattern: string; // e.g., "frame_{0:D4}"
  includeTimestamp: boolean;
  zipOutput: boolean;
}

/** Main encoding options union */
export interface EncodingOptions {
  format: OutputFormat;
  outputPath: string;
  width?: number;
  height?: number;
  scale?: number; // 0.1 to 4.0
  frameRate?: number; // Override original frame rate
  trimStart?: number; // Frame index
  trimEnd?: number; // Frame index
  gif?: GifEncodingOptions;
  video?: VideoEncodingOptions;
  apng?: ApngEncodingOptions;
  webp?: WebpEncodingOptions;
  imageSequence?: ImageSequenceOptions;
}

/** Encoding job state */
export type EncodingState = 'queued' | 'preparing' | 'encoding' | 'optimizing' | 'completed' | 'failed' | 'cancelled';

/** Progress information for an encoding job */
export interface EncodingProgress {
  jobId: string;
  state: EncodingState;
  progress: number; // 0-100
  currentFrame: number;
  totalFrames: number;
  stage: string; // Human-readable stage description
  estimatedTimeRemaining?: number; // milliseconds
  outputFileSize?: number; // bytes
  error?: string;
  startedAt: string;
  completedAt?: string;
}

/** Request to start encoding */
export interface StartEncodingRequest {
  projectId: string;
  options: EncodingOptions;
}

/** Response from starting an encoding job */
export interface StartEncodingResponse {
  jobId: string;
  success: boolean;
  error?: string;
}

/** Response when encoding completes */
export interface EncodingCompleteResponse {
  jobId: string;
  outputPath: string;
  fileSize: number;
  duration: number; // encoding duration in ms
  success: boolean;
  error?: string;
}
