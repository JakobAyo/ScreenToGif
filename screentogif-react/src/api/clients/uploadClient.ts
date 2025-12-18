/**
 * Upload Client
 * API client for uploading exports to various services
 */

import type {
  UploadConfig,
  UploadRequest,
  UploadProgress,
  UploadResult,
  UploadDestination,
} from '../types';

const BACKEND_BASE_URL = 'http://localhost:5001';

/**
 * Upload a file to the specified destination
 */
export async function uploadFile(request: UploadRequest): Promise<UploadResult> {
  const response = await fetch(`${BACKEND_BASE_URL}/api/upload/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to upload file: ${error}`);
  }
  return response.json();
}

/**
 * Get upload progress
 */
export async function getUploadProgress(uploadId: string): Promise<UploadProgress> {
  const response = await fetch(`${BACKEND_BASE_URL}/api/upload/progress/${uploadId}`);
  if (!response.ok) {
    throw new Error(`Failed to get upload progress: ${response.status}`);
  }
  return response.json();
}

/**
 * Cancel an ongoing upload
 */
export async function cancelUpload(uploadId: string): Promise<void> {
  const response = await fetch(`${BACKEND_BASE_URL}/api/upload/cancel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uploadId }),
  });
  if (!response.ok) {
    throw new Error(`Failed to cancel upload: ${response.status}`);
  }
}

/**
 * Get upload result
 */
export async function getUploadResult(uploadId: string): Promise<UploadResult> {
  const response = await fetch(`${BACKEND_BASE_URL}/api/upload/result/${uploadId}`);
  if (!response.ok) {
    throw new Error(`Failed to get upload result: ${response.status}`);
  }
  return response.json();
}

/**
 * Delete an uploaded file from the service
 */
export async function deleteUpload(
  destination: UploadDestination,
  deleteHash: string
): Promise<void> {
  const response = await fetch(`${BACKEND_BASE_URL}/api/upload/delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ destination, deleteHash }),
  });
  if (!response.ok) {
    throw new Error(`Failed to delete upload: ${response.status}`);
  }
}

/**
 * Upload to Imgur
 */
export async function uploadToImgur(
  filePath: string,
  options?: {
    anonymous?: boolean;
    clientId?: string;
    title?: string;
    description?: string;
  }
): Promise<UploadResult> {
  const config: UploadConfig = {
    destination: 'imgur',
    anonymous: options?.anonymous ?? true,
    apiKey: options?.clientId,
  };
  return uploadFile({
    filePath,
    config,
    title: options?.title,
    description: options?.description,
  });
}

/**
 * Upload to Yandex Disk
 */
export async function uploadToYandex(
  filePath: string,
  options?: {
    accessToken: string;
    path?: string;
  }
): Promise<UploadResult> {
  const config: UploadConfig = {
    destination: 'yandex',
    anonymous: false,
    apiKey: options?.accessToken,
  };
  return uploadFile({
    filePath,
    config,
  });
}

/**
 * Upload to Gfycat
 */
export async function uploadToGfycat(
  filePath: string,
  options?: {
    clientId?: string;
    clientSecret?: string;
    title?: string;
    tags?: string[];
  }
): Promise<UploadResult> {
  const config: UploadConfig = {
    destination: 'gfycat',
    anonymous: !options?.clientId,
    apiKey: options?.clientId,
  };
  return uploadFile({
    filePath,
    config,
    title: options?.title,
    tags: options?.tags,
  });
}

/**
 * Upload to Giphy
 */
export async function uploadToGiphy(
  filePath: string,
  options?: {
    apiKey: string;
    title?: string;
    tags?: string[];
  }
): Promise<UploadResult> {
  const config: UploadConfig = {
    destination: 'giphy',
    anonymous: false,
    apiKey: options?.apiKey,
  };
  return uploadFile({
    filePath,
    config,
    title: options?.title,
    tags: options?.tags,
  });
}

/**
 * Upload to custom endpoint
 */
export async function uploadToCustom(
  filePath: string,
  options: {
    url: string;
    method?: 'POST' | 'PUT';
    headers?: Record<string, string>;
    fieldName?: string;
    additionalData?: Record<string, string>;
  }
): Promise<UploadResult> {
  const config: UploadConfig = {
    destination: 'custom',
    anonymous: true,
    customUrl: options.url,
    customHeaders: options.headers,
  };
  return uploadFile({
    filePath,
    config,
  });
}

/**
 * Validate upload configuration
 */
export async function validateUploadConfig(
  config: UploadConfig
): Promise<{ valid: boolean; errors: string[] }> {
  const response = await fetch(`${BACKEND_BASE_URL}/api/upload/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
  if (!response.ok) {
    throw new Error(`Failed to validate upload config: ${response.status}`);
  }
  return response.json();
}

/**
 * Get supported upload destinations and their requirements
 */
export async function getUploadDestinations(): Promise<{
  destinations: {
    id: UploadDestination;
    name: string;
    requiresAuth: boolean;
    supportsAnonymous: boolean;
    maxFileSize: number;
    supportedFormats: string[];
  }[];
}> {
  const response = await fetch(`${BACKEND_BASE_URL}/api/upload/destinations`);
  if (!response.ok) {
    throw new Error(`Failed to get upload destinations: ${response.status}`);
  }
  return response.json();
}

/**
 * Test connection to upload destination
 */
export async function testUploadConnection(
  config: UploadConfig
): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${BACKEND_BASE_URL}/api/upload/test`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
  if (!response.ok) {
    throw new Error(`Failed to test upload connection: ${response.status}`);
  }
  return response.json();
}

/**
 * Get upload history
 */
export async function getUploadHistory(
  limit: number = 20
): Promise<{ uploads: UploadResult[]; total: number }> {
  const response = await fetch(`${BACKEND_BASE_URL}/api/upload/history?limit=${limit}`);
  if (!response.ok) {
    throw new Error(`Failed to get upload history: ${response.status}`);
  }
  return response.json();
}

/**
 * Clear upload history
 */
export async function clearUploadHistory(): Promise<void> {
  const response = await fetch(`${BACKEND_BASE_URL}/api/upload/history`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error(`Failed to clear upload history: ${response.status}`);
  }
}
