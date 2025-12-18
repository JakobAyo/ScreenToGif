/**
 * Encoding Client
 * API client for encoding/export operations
 */

import type {
  EncodingOptions,
  EncodingProgress,
  StartEncodingRequest,
  StartEncodingResponse,
  EncodingCompleteResponse,
} from '../types';

const BACKEND_BASE_URL = 'http://localhost:5001';

/**
 * Start an encoding job
 */
export async function startEncoding(request: StartEncodingRequest): Promise<StartEncodingResponse> {
  const response = await fetch(`${BACKEND_BASE_URL}/api/encoding/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to start encoding: ${error}`);
  }
  return response.json();
}

/**
 * Cancel an encoding job
 */
export async function cancelEncoding(jobId: string): Promise<void> {
  const response = await fetch(`${BACKEND_BASE_URL}/api/encoding/cancel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jobId }),
  });
  if (!response.ok) {
    throw new Error(`Failed to cancel encoding: ${response.status}`);
  }
}

/**
 * Get encoding job progress
 */
export async function getEncodingProgress(jobId: string): Promise<EncodingProgress> {
  const response = await fetch(`${BACKEND_BASE_URL}/api/encoding/progress/${jobId}`);
  if (!response.ok) {
    throw new Error(`Failed to get encoding progress: ${response.status}`);
  }
  return response.json();
}

/**
 * Get list of active encoding jobs
 */
export async function getActiveJobs(): Promise<EncodingProgress[]> {
  const response = await fetch(`${BACKEND_BASE_URL}/api/encoding/jobs`);
  if (!response.ok) {
    throw new Error(`Failed to get active jobs: ${response.status}`);
  }
  return response.json();
}

/**
 * Get available encoders
 */
export async function getAvailableEncoders(): Promise<{
  gif: string[];
  video: string[];
  apng: string[];
  webp: string[];
}> {
  const response = await fetch(`${BACKEND_BASE_URL}/api/encoding/encoders`);
  if (!response.ok) {
    throw new Error(`Failed to get available encoders: ${response.status}`);
  }
  return response.json();
}

/**
 * Validate encoding options before starting
 */
export async function validateEncodingOptions(
  options: EncodingOptions
): Promise<{ valid: boolean; errors: string[]; warnings: string[] }> {
  const response = await fetch(`${BACKEND_BASE_URL}/api/encoding/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(options),
  });
  if (!response.ok) {
    throw new Error(`Failed to validate encoding options: ${response.status}`);
  }
  return response.json();
}

/**
 * Estimate output file size
 */
export async function estimateFileSize(
  projectId: string,
  options: EncodingOptions
): Promise<{ estimatedSize: number; confidence: 'low' | 'medium' | 'high' }> {
  const response = await fetch(`${BACKEND_BASE_URL}/api/encoding/estimate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId, options }),
  });
  if (!response.ok) {
    throw new Error(`Failed to estimate file size: ${response.status}`);
  }
  return response.json();
}

/**
 * Get encoding result after completion
 */
export async function getEncodingResult(jobId: string): Promise<EncodingCompleteResponse> {
  const response = await fetch(`${BACKEND_BASE_URL}/api/encoding/result/${jobId}`);
  if (!response.ok) {
    throw new Error(`Failed to get encoding result: ${response.status}`);
  }
  return response.json();
}

/**
 * Start batch encoding (multiple projects/outputs)
 */
export async function startBatchEncoding(
  requests: StartEncodingRequest[]
): Promise<{ jobIds: string[]; errors: { index: number; error: string }[] }> {
  const response = await fetch(`${BACKEND_BASE_URL}/api/encoding/batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ requests }),
  });
  if (!response.ok) {
    throw new Error(`Failed to start batch encoding: ${response.status}`);
  }
  return response.json();
}
