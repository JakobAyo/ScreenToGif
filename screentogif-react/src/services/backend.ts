import { invoke } from '@tauri-apps/api/core';

export interface BackendStatus {
  running: boolean;
  port: number | null;
}

export interface BackendInfo {
  name: string;
  version: string;
  platform: string;
  runtime: string;
}

export interface HealthCheckResponse {
  status: string;
  timestamp: string;
}

export interface PingResponse {
  message: string;
  timestamp: string;
}

const BACKEND_BASE_URL = 'http://localhost:5001';

export async function startBackend(): Promise<BackendStatus> {
  return invoke<BackendStatus>('start_backend');
}

export async function stopBackend(): Promise<void> {
  return invoke<void>('stop_backend');
}

export async function getBackendStatus(): Promise<BackendStatus> {
  return invoke<BackendStatus>('get_backend_status');
}

export async function healthCheck(): Promise<HealthCheckResponse> {
  const response = await fetch(`${BACKEND_BASE_URL}/health`);
  if (!response.ok) {
    throw new Error(`Health check failed: ${response.status}`);
  }
  return response.json();
}

export async function getBackendInfo(): Promise<BackendInfo> {
  const response = await fetch(`${BACKEND_BASE_URL}/api/info`);
  if (!response.ok) {
    throw new Error(`Failed to get backend info: ${response.status}`);
  }
  return response.json();
}

export async function pingBackend(): Promise<PingResponse> {
  const response = await fetch(`${BACKEND_BASE_URL}/api/ping`);
  if (!response.ok) {
    throw new Error(`Ping failed: ${response.status}`);
  }
  return response.json();
}
