/**
 * Project Client
 * API client for project save/load operations
 */

import { invoke } from '@tauri-apps/api/core';
import type {
  Project,
  CreateProjectRequest,
  OpenProjectRequest,
  SaveProjectRequest,
  ProjectLoadResponse,
  ProjectSaveResponse,
  ProjectFileInfo,
  ImportMediaRequest,
  ImportMediaResponse,
} from '../types';

const BACKEND_BASE_URL = 'http://localhost:5001';

/**
 * Create a new project
 */
export async function createProject(request: CreateProjectRequest): Promise<Project> {
  const response = await fetch(`${BACKEND_BASE_URL}/api/project/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create project: ${error}`);
  }
  return response.json();
}

/**
 * Open a project file
 */
export async function openProject(request: OpenProjectRequest): Promise<ProjectLoadResponse> {
  const response = await fetch(`${BACKEND_BASE_URL}/api/project/open`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to open project: ${error}`);
  }
  return response.json();
}

/**
 * Save a project
 */
export async function saveProject(request: SaveProjectRequest): Promise<ProjectSaveResponse> {
  const response = await fetch(`${BACKEND_BASE_URL}/api/project/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to save project: ${error}`);
  }
  return response.json();
}

/**
 * Save project to a new location
 */
export async function saveProjectAs(
  projectId: string,
  path: string
): Promise<ProjectSaveResponse> {
  return saveProject({ projectId, path });
}

/**
 * Get project info without fully loading
 */
export async function getProjectInfo(path: string): Promise<ProjectFileInfo> {
  const response = await fetch(`${BACKEND_BASE_URL}/api/project/info`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path }),
  });
  if (!response.ok) {
    throw new Error(`Failed to get project info: ${response.status}`);
  }
  return response.json();
}

/**
 * Get recent projects list
 */
export async function getRecentProjects(): Promise<ProjectFileInfo[]> {
  const response = await fetch(`${BACKEND_BASE_URL}/api/project/recent`);
  if (!response.ok) {
    throw new Error(`Failed to get recent projects: ${response.status}`);
  }
  return response.json();
}

/**
 * Import media into project
 */
export async function importMedia(
  projectId: string,
  request: ImportMediaRequest
): Promise<ImportMediaResponse> {
  const response = await fetch(`${BACKEND_BASE_URL}/api/project/${projectId}/import`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to import media: ${error}`);
  }
  return response.json();
}

/**
 * Export project frames to files
 */
export async function exportFrames(
  projectId: string,
  outputDir: string,
  format: 'png' | 'jpg' | 'bmp' = 'png'
): Promise<{ exportedCount: number; outputDirectory: string }> {
  const response = await fetch(`${BACKEND_BASE_URL}/api/project/${projectId}/export-frames`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ outputDir, format }),
  });
  if (!response.ok) {
    throw new Error(`Failed to export frames: ${response.status}`);
  }
  return response.json();
}

/**
 * Show file open dialog via Tauri
 */
export async function showOpenDialog(filters?: { name: string; extensions: string[] }[]): Promise<string | null> {
  return invoke<string | null>('show_open_dialog', { filters });
}

/**
 * Show file save dialog via Tauri
 */
export async function showSaveDialog(
  defaultName?: string,
  filters?: { name: string; extensions: string[] }[]
): Promise<string | null> {
  return invoke<string | null>('show_save_dialog', { defaultName, filters });
}

/**
 * Show folder picker dialog via Tauri
 */
export async function showFolderDialog(): Promise<string | null> {
  return invoke<string | null>('show_folder_dialog');
}

/**
 * Clear auto-save data for a project
 */
export async function clearAutoSave(projectId: string): Promise<void> {
  const response = await fetch(`${BACKEND_BASE_URL}/api/project/${projectId}/autosave`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error(`Failed to clear auto-save: ${response.status}`);
  }
}

/**
 * Check if auto-save exists for a project
 */
export async function hasAutoSave(projectId: string): Promise<boolean> {
  const response = await fetch(`${BACKEND_BASE_URL}/api/project/${projectId}/autosave`);
  if (!response.ok) {
    throw new Error(`Failed to check auto-save: ${response.status}`);
  }
  const result = await response.json();
  return result.exists;
}

/**
 * Recover project from auto-save
 */
export async function recoverFromAutoSave(projectId: string): Promise<ProjectLoadResponse> {
  const response = await fetch(`${BACKEND_BASE_URL}/api/project/${projectId}/recover`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error(`Failed to recover from auto-save: ${response.status}`);
  }
  return response.json();
}
