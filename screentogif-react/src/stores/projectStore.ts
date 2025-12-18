/**
 * Project Store
 * Manages project data, frames, tracks, and file operations
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type {
  Project,
  ProjectMetadata,
  ProjectFileInfo,
  Frame,
  Track,
  Sequence,
  HistoryEntry,
} from '../api/types';

interface ProjectState {
  // Current project
  currentProject: Project | null;
  isLoading: boolean;
  isSaving: boolean;

  // Frames (main data)
  frames: Frame[];
  totalFrameCount: number;

  // Sequences and tracks
  sequences: Sequence[];
  activeSequenceId: string | null;

  // File state
  filePath: string | null;
  isDirty: boolean;
  lastSavedAt: string | null;
  autoSaveEnabled: boolean;
  autoSaveInterval: number; // milliseconds

  // Recent projects
  recentProjects: ProjectFileInfo[];
  maxRecentProjects: number;

  // History (undo/redo)
  history: HistoryEntry[];
  historyIndex: number;
  maxHistorySize: number;

  // Error state
  error: string | null;
  warnings: string[];
}

interface ProjectActions {
  // Project lifecycle
  createProject: (metadata: ProjectMetadata, width: number, height: number, frameRate: number) => void;
  loadProject: (project: Project) => void;
  closeProject: () => void;
  setIsLoading: (loading: boolean) => void;
  setIsSaving: (saving: boolean) => void;

  // Project metadata
  updateMetadata: (metadata: Partial<ProjectMetadata>) => void;
  setFilePath: (path: string | null) => void;
  markDirty: () => void;
  markClean: () => void;
  setLastSavedAt: (timestamp: string) => void;

  // Frame management
  setFrames: (frames: Frame[]) => void;
  addFrame: (frame: Frame, index?: number) => void;
  addFrames: (frames: Frame[], index?: number) => void;
  updateFrame: (frameId: string, updates: Partial<Frame>) => void;
  updateFrames: (updates: { id: string; changes: Partial<Frame> }[]) => void;
  removeFrame: (frameId: string) => void;
  removeFrames: (frameIds: string[]) => void;
  reorderFrames: (fromIndex: number, toIndex: number) => void;
  duplicateFrames: (frameIds: string[], insertAfter?: string) => void;

  // Frame delay management
  setFrameDelay: (frameId: string, delay: number) => void;
  setFramesDelay: (frameIds: string[], delay: number) => void;
  scaleDelays: (factor: number) => void;

  // Sequence management
  setSequences: (sequences: Sequence[]) => void;
  addSequence: (sequence: Sequence) => void;
  removeSequence: (sequenceId: string) => void;
  setActiveSequenceId: (sequenceId: string | null) => void;

  // Track management
  addTrack: (sequenceId: string, track: Track) => void;
  removeTrack: (sequenceId: string, trackId: string) => void;
  updateTrack: (sequenceId: string, trackId: string, updates: Partial<Track>) => void;

  // Recent projects
  addRecentProject: (projectInfo: ProjectFileInfo) => void;
  removeRecentProject: (path: string) => void;
  clearRecentProjects: () => void;

  // Auto-save
  setAutoSaveEnabled: (enabled: boolean) => void;
  setAutoSaveInterval: (interval: number) => void;

  // History (undo/redo)
  pushHistory: (entry: HistoryEntry) => void;
  undo: () => HistoryEntry | null;
  redo: () => HistoryEntry | null;
  clearHistory: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Error handling
  setError: (error: string | null) => void;
  addWarning: (warning: string) => void;
  clearWarnings: () => void;

  // Computed values
  getTotalDuration: () => number;
  getFrameById: (frameId: string) => Frame | undefined;
  getFrameByIndex: (index: number) => Frame | undefined;
  getActiveSequence: () => Sequence | undefined;

  // Reset
  reset: () => void;
}

const initialState: ProjectState = {
  currentProject: null,
  isLoading: false,
  isSaving: false,
  frames: [],
  totalFrameCount: 0,
  sequences: [],
  activeSequenceId: null,
  filePath: null,
  isDirty: false,
  lastSavedAt: null,
  autoSaveEnabled: true,
  autoSaveInterval: 60000, // 1 minute
  recentProjects: [],
  maxRecentProjects: 10,
  history: [],
  historyIndex: -1,
  maxHistorySize: 100,
  error: null,
  warnings: [],
};

export const useProjectStore = create<ProjectState & ProjectActions>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    // Project lifecycle
    createProject: (metadata, width, height, frameRate) => {
      const project: Project = {
        id: crypto.randomUUID(),
        metadata: {
          ...metadata,
          createdAt: new Date().toISOString(),
          modifiedAt: new Date().toISOString(),
          version: '1.0.0',
        },
        sequences: [],
        frames: [],
        originalWidth: width,
        originalHeight: height,
        originalFrameRate: frameRate,
        totalDuration: 0,
        isDirty: false,
        autoSaveEnabled: true,
      };
      set({
        currentProject: project,
        frames: [],
        totalFrameCount: 0,
        sequences: [],
        isDirty: false,
        filePath: null,
        error: null,
        warnings: [],
      });
    },

    loadProject: (project) => {
      set({
        currentProject: project,
        frames: project.frames,
        totalFrameCount: project.frames.length,
        sequences: project.sequences,
        activeSequenceId: project.sequences[0]?.id ?? null,
        filePath: project.filePath ?? null,
        isDirty: false,
        lastSavedAt: project.lastSavedAt ?? null,
        error: null,
        warnings: [],
        history: [],
        historyIndex: -1,
      });
    },

    closeProject: () => {
      set({
        currentProject: null,
        frames: [],
        totalFrameCount: 0,
        sequences: [],
        activeSequenceId: null,
        filePath: null,
        isDirty: false,
        lastSavedAt: null,
        history: [],
        historyIndex: -1,
        error: null,
        warnings: [],
      });
    },

    setIsLoading: (isLoading) => set({ isLoading }),
    setIsSaving: (isSaving) => set({ isSaving }),

    // Project metadata
    updateMetadata: (metadata) =>
      set((state) => ({
        currentProject: state.currentProject
          ? {
              ...state.currentProject,
              metadata: {
                ...state.currentProject.metadata,
                ...metadata,
                modifiedAt: new Date().toISOString(),
              },
            }
          : null,
        isDirty: true,
      })),

    setFilePath: (filePath) => set({ filePath }),
    markDirty: () => set({ isDirty: true }),
    markClean: () => set({ isDirty: false }),
    setLastSavedAt: (lastSavedAt) => set({ lastSavedAt, isDirty: false }),

    // Frame management
    setFrames: (frames) => set({ frames, totalFrameCount: frames.length, isDirty: true }),

    addFrame: (frame, index) =>
      set((state) => {
        const newFrames = [...state.frames];
        if (index !== undefined) {
          newFrames.splice(index, 0, frame);
        } else {
          newFrames.push(frame);
        }
        return { frames: newFrames, totalFrameCount: newFrames.length, isDirty: true };
      }),

    addFrames: (frames, index) =>
      set((state) => {
        const newFrames = [...state.frames];
        if (index !== undefined) {
          newFrames.splice(index, 0, ...frames);
        } else {
          newFrames.push(...frames);
        }
        return { frames: newFrames, totalFrameCount: newFrames.length, isDirty: true };
      }),

    updateFrame: (frameId, updates) =>
      set((state) => ({
        frames: state.frames.map((f) => (f.id === frameId ? { ...f, ...updates } : f)),
        isDirty: true,
      })),

    updateFrames: (updates) =>
      set((state) => ({
        frames: state.frames.map((f) => {
          const update = updates.find((u) => u.id === f.id);
          return update ? { ...f, ...update.changes } : f;
        }),
        isDirty: true,
      })),

    removeFrame: (frameId) =>
      set((state) => {
        const newFrames = state.frames.filter((f) => f.id !== frameId);
        return { frames: newFrames, totalFrameCount: newFrames.length, isDirty: true };
      }),

    removeFrames: (frameIds) =>
      set((state) => {
        const newFrames = state.frames.filter((f) => !frameIds.includes(f.id));
        return { frames: newFrames, totalFrameCount: newFrames.length, isDirty: true };
      }),

    reorderFrames: (fromIndex, toIndex) =>
      set((state) => {
        const newFrames = [...state.frames];
        const [removed] = newFrames.splice(fromIndex, 1);
        newFrames.splice(toIndex, 0, removed);
        return { frames: newFrames, isDirty: true };
      }),

    duplicateFrames: (frameIds, insertAfter) =>
      set((state) => {
        const framesToDupe = state.frames.filter((f) => frameIds.includes(f.id));
        const duplicates = framesToDupe.map((f) => ({
          ...f,
          id: crypto.randomUUID(),
          isSelected: false,
        }));

        let insertIndex = state.frames.length;
        if (insertAfter) {
          const afterIndex = state.frames.findIndex((f) => f.id === insertAfter);
          if (afterIndex !== -1) {
            insertIndex = afterIndex + 1;
          }
        }

        const newFrames = [...state.frames];
        newFrames.splice(insertIndex, 0, ...duplicates);
        return { frames: newFrames, totalFrameCount: newFrames.length, isDirty: true };
      }),

    // Frame delay management
    setFrameDelay: (frameId, delay) =>
      set((state) => ({
        frames: state.frames.map((f) =>
          f.id === frameId ? { ...f, metadata: { ...f.metadata, delay } } : f
        ),
        isDirty: true,
      })),

    setFramesDelay: (frameIds, delay) =>
      set((state) => ({
        frames: state.frames.map((f) =>
          frameIds.includes(f.id) ? { ...f, metadata: { ...f.metadata, delay } } : f
        ),
        isDirty: true,
      })),

    scaleDelays: (factor) =>
      set((state) => ({
        frames: state.frames.map((f) => ({
          ...f,
          metadata: { ...f.metadata, delay: Math.round(f.metadata.delay * factor) },
        })),
        isDirty: true,
      })),

    // Sequence management
    setSequences: (sequences) => set({ sequences, isDirty: true }),
    addSequence: (sequence) =>
      set((state) => ({ sequences: [...state.sequences, sequence], isDirty: true })),
    removeSequence: (sequenceId) =>
      set((state) => ({
        sequences: state.sequences.filter((s) => s.id !== sequenceId),
        isDirty: true,
      })),
    setActiveSequenceId: (activeSequenceId) => set({ activeSequenceId }),

    // Track management
    addTrack: (sequenceId, track) =>
      set((state) => ({
        sequences: state.sequences.map((s) =>
          s.id === sequenceId ? { ...s, tracks: [...s.tracks, track] } : s
        ),
        isDirty: true,
      })),

    removeTrack: (sequenceId, trackId) =>
      set((state) => ({
        sequences: state.sequences.map((s) =>
          s.id === sequenceId ? { ...s, tracks: s.tracks.filter((t) => t.id !== trackId) } : s
        ),
        isDirty: true,
      })),

    updateTrack: (sequenceId, trackId, updates) =>
      set((state) => ({
        sequences: state.sequences.map((s) =>
          s.id === sequenceId
            ? { ...s, tracks: s.tracks.map((t) => (t.id === trackId ? { ...t, ...updates } : t)) }
            : s
        ),
        isDirty: true,
      })),

    // Recent projects
    addRecentProject: (projectInfo) =>
      set((state) => {
        const filtered = state.recentProjects.filter((p) => p.path !== projectInfo.path);
        const newRecent = [projectInfo, ...filtered].slice(0, state.maxRecentProjects);
        return { recentProjects: newRecent };
      }),

    removeRecentProject: (path) =>
      set((state) => ({
        recentProjects: state.recentProjects.filter((p) => p.path !== path),
      })),

    clearRecentProjects: () => set({ recentProjects: [] }),

    // Auto-save
    setAutoSaveEnabled: (autoSaveEnabled) => set({ autoSaveEnabled }),
    setAutoSaveInterval: (autoSaveInterval) => set({ autoSaveInterval }),

    // History (undo/redo)
    pushHistory: (entry) =>
      set((state) => {
        // Remove any redo history
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push(entry);
        // Trim to max size
        if (newHistory.length > state.maxHistorySize) {
          newHistory.shift();
        }
        return { history: newHistory, historyIndex: newHistory.length - 1 };
      }),

    undo: () => {
      const { history, historyIndex } = get();
      if (historyIndex >= 0) {
        set({ historyIndex: historyIndex - 1 });
        return history[historyIndex];
      }
      return null;
    },

    redo: () => {
      const { history, historyIndex } = get();
      if (historyIndex < history.length - 1) {
        set({ historyIndex: historyIndex + 1 });
        return history[historyIndex + 1];
      }
      return null;
    },

    clearHistory: () => set({ history: [], historyIndex: -1 }),
    canUndo: () => get().historyIndex >= 0,
    canRedo: () => get().historyIndex < get().history.length - 1,

    // Error handling
    setError: (error) => set({ error }),
    addWarning: (warning) => set((state) => ({ warnings: [...state.warnings, warning] })),
    clearWarnings: () => set({ warnings: [] }),

    // Computed values
    getTotalDuration: () => {
      const { frames } = get();
      return frames.reduce((sum, f) => sum + f.metadata.delay, 0);
    },

    getFrameById: (frameId) => get().frames.find((f) => f.id === frameId),
    getFrameByIndex: (index) => get().frames[index],
    getActiveSequence: () => {
      const { sequences, activeSequenceId } = get();
      return sequences.find((s) => s.id === activeSequenceId);
    },

    // Reset
    reset: () => set(initialState),
  }))
);

// Selector hooks
export const selectHasProject = (state: ProjectState) => state.currentProject !== null;
export const selectIsDirty = (state: ProjectState) => state.isDirty;
export const selectFrameCount = (state: ProjectState) => state.totalFrameCount;
export const selectProjectTitle = (state: ProjectState) =>
  state.currentProject?.metadata.title ?? 'Untitled';
