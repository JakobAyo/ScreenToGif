/**
 * useUndoRedo Hook
 * Manages undo/redo history for editor operations (ActionStack equivalent)
 */

import { useCallback, useEffect, useMemo } from 'react';
import { useEditorStore } from '../../../stores/editorStore';
import { useProjectStore } from '../../../stores/projectStore';
import type { HistoryEntry, Frame } from '../../../api/types';

export type ActionType =
  | 'frame-add'
  | 'frame-delete'
  | 'frame-duplicate'
  | 'frame-reorder'
  | 'frame-update'
  | 'delay-change'
  | 'selection-change'
  | 'effect-apply'
  | 'text-add'
  | 'drawing-add'
  | 'shape-add'
  | 'crop'
  | 'resize'
  | 'transform';

export interface UndoableAction {
  type: ActionType;
  description: string;
  timestamp: number;
  data: {
    before: unknown;
    after: unknown;
  };
}

export interface UseUndoRedoReturn {
  // State
  canUndo: boolean;
  canRedo: boolean;
  historyLength: number;
  currentHistoryIndex: number;

  // Current action descriptions
  undoDescription: string | null;
  redoDescription: string | null;

  // Actions
  undo: () => void;
  redo: () => void;
  clearHistory: () => void;
  pushAction: (action: UndoableAction) => void;

  // Helpers for creating actions
  recordFrameChange: (
    type: ActionType,
    description: string,
    beforeFrames: Frame[],
    afterFrames: Frame[]
  ) => void;
  recordDelayChange: (
    frameIds: string[],
    beforeDelays: Record<string, number>,
    afterDelay: number
  ) => void;
}

export function useUndoRedo(): UseUndoRedoReturn {
  // Editor store - for managing UI state about undo/redo
  const {
    canUndo: editorCanUndo,
    canRedo: editorCanRedo,
    setCanUndo,
    setCanRedo,
  } = useEditorStore();

  // Project store - for history management
  const {
    history,
    historyIndex,
    pushHistory,
    undo: projectUndo,
    redo: projectRedo,
    clearHistory: projectClearHistory,
    canUndo: projectCanUndo,
    canRedo: projectCanRedo,
    frames,
    setFrames,
    updateFrames,
  } = useProjectStore();

  // Computed values
  const historyLength = history.length;
  const currentHistoryIndex = historyIndex;

  // Get descriptions for undo/redo actions
  const undoDescription = useMemo(() => {
    if (historyIndex >= 0 && history[historyIndex]) {
      return (history[historyIndex] as unknown as UndoableAction).description ?? null;
    }
    return null;
  }, [history, historyIndex]);

  const redoDescription = useMemo(() => {
    if (historyIndex < history.length - 1 && history[historyIndex + 1]) {
      return (history[historyIndex + 1] as unknown as UndoableAction).description ?? null;
    }
    return null;
  }, [history, historyIndex]);

  // Sync editor store undo/redo state with project store
  useEffect(() => {
    const canUndoNow = projectCanUndo();
    const canRedoNow = projectCanRedo();
    if (editorCanUndo !== canUndoNow) {
      setCanUndo(canUndoNow);
    }
    if (editorCanRedo !== canRedoNow) {
      setCanRedo(canRedoNow);
    }
  }, [historyIndex, history, projectCanUndo, projectCanRedo, editorCanUndo, editorCanRedo, setCanUndo, setCanRedo]);

  // Undo action
  const undo = useCallback(() => {
    const entry = projectUndo();
    if (entry) {
      const action = entry as unknown as UndoableAction;
      // Restore previous state
      if (action.type.startsWith('frame-') || action.type === 'delay-change') {
        setFrames(action.data.before as Frame[]);
      }
    }
  }, [projectUndo, setFrames]);

  // Redo action
  const redo = useCallback(() => {
    const entry = projectRedo();
    if (entry) {
      const action = entry as unknown as UndoableAction;
      // Apply next state
      if (action.type.startsWith('frame-') || action.type === 'delay-change') {
        setFrames(action.data.after as Frame[]);
      }
    }
  }, [projectRedo, setFrames]);

  // Clear all history
  const clearHistory = useCallback(() => {
    projectClearHistory();
  }, [projectClearHistory]);

  // Push a new action to history
  const pushAction = useCallback(
    (action: UndoableAction) => {
      pushHistory(action as unknown as HistoryEntry);
    },
    [pushHistory]
  );

  // Helper to record frame changes
  const recordFrameChange = useCallback(
    (
      type: ActionType,
      description: string,
      beforeFrames: Frame[],
      afterFrames: Frame[]
    ) => {
      const action: UndoableAction = {
        type,
        description,
        timestamp: Date.now(),
        data: {
          before: beforeFrames,
          after: afterFrames,
        },
      };
      pushAction(action);
    },
    [pushAction]
  );

  // Helper to record delay changes
  const recordDelayChange = useCallback(
    (
      frameIds: string[],
      beforeDelays: Record<string, number>,
      afterDelay: number
    ) => {
      const count = frameIds.length;
      const description =
        count === 1
          ? `Change delay to ${afterDelay}ms`
          : `Change delay of ${count} frames to ${afterDelay}ms`;

      const beforeFrames = frames.map((f) =>
        frameIds.includes(f.id) && beforeDelays[f.id] !== undefined
          ? { ...f, metadata: { ...f.metadata, delay: beforeDelays[f.id] } }
          : f
      );
      const afterFrames = frames.map((f) =>
        frameIds.includes(f.id)
          ? { ...f, metadata: { ...f.metadata, delay: afterDelay } }
          : f
      );

      const action: UndoableAction = {
        type: 'delay-change',
        description,
        timestamp: Date.now(),
        data: {
          before: beforeFrames,
          after: afterFrames,
        },
      };
      pushAction(action);
    },
    [pushAction, frames]
  );

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.ctrlKey && e.key === 'z') {
        if (e.shiftKey) {
          // Ctrl+Shift+Z = Redo
          e.preventDefault();
          if (projectCanRedo()) {
            redo();
          }
        } else {
          // Ctrl+Z = Undo
          e.preventDefault();
          if (projectCanUndo()) {
            undo();
          }
        }
      } else if (e.ctrlKey && e.key === 'y') {
        // Ctrl+Y = Redo
        e.preventDefault();
        if (projectCanRedo()) {
          redo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, projectCanUndo, projectCanRedo]);

  return {
    // State
    canUndo: editorCanUndo,
    canRedo: editorCanRedo,
    historyLength,
    currentHistoryIndex,

    // Current action descriptions
    undoDescription,
    redoDescription,

    // Actions
    undo,
    redo,
    clearHistory,
    pushAction,

    // Helpers
    recordFrameChange,
    recordDelayChange,
  };
}
