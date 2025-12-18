/**
 * useFrameSelection Hook
 * Manages frame selection with support for single, multi, and range selection
 */

import { useCallback, useEffect, useState } from 'react';
import { useEditorStore, type SelectionMode } from '../../../stores/editorStore';
import { useProjectStore } from '../../../stores/projectStore';

export interface UseFrameSelectionReturn {
  // State
  selectedFrameIds: string[];
  selectionMode: SelectionMode;
  lastSelectedFrameId: string | null;
  isSelecting: boolean;

  // Computed
  selectedCount: number;
  hasSelection: boolean;
  isFrameSelected: (frameId: string) => boolean;
  getSelectedIndices: () => number[];

  // Actions
  selectFrame: (frameId: string, modifiers?: SelectionModifiers) => void;
  selectFrameRange: (endFrameId: string) => void;
  selectAll: () => void;
  deselectAll: () => void;
  invertSelection: () => void;
  setSelectionMode: (mode: SelectionMode) => void;

  // Drag selection
  startDragSelect: () => void;
  updateDragSelect: (frameId: string) => void;
  endDragSelect: () => void;
}

export interface SelectionModifiers {
  ctrl?: boolean;
  shift?: boolean;
}

export function useFrameSelection(): UseFrameSelectionReturn {
  const [isSelecting, setIsSelecting] = useState(false);
  const [dragStartFrameId, setDragStartFrameId] = useState<string | null>(null);

  // Editor store
  const {
    selectedFrameIds,
    selectionMode,
    lastSelectedFrameId,
    selectFrame: storeSelectFrame,
    selectFrames,
    selectAllFrames,
    clearSelection,
    invertSelection: storeInvertSelection,
    setSelectionMode,
  } = useEditorStore();

  // Project store
  const { frames } = useProjectStore();

  // Frame IDs and index map
  const frameIds = frames.map((f) => f.id);
  const frameIndexMap = new Map(frameIds.map((id, index) => [id, index]));

  // Computed values
  const selectedCount = selectedFrameIds.length;
  const hasSelection = selectedCount > 0;

  const isFrameSelected = useCallback(
    (frameId: string) => selectedFrameIds.includes(frameId),
    [selectedFrameIds]
  );

  const getSelectedIndices = useCallback(() => {
    return selectedFrameIds
      .map((id) => frameIndexMap.get(id))
      .filter((index): index is number => index !== undefined)
      .sort((a, b) => a - b);
  }, [selectedFrameIds, frameIndexMap]);

  // Handle frame selection with modifiers
  const selectFrame = useCallback(
    (frameId: string, modifiers?: SelectionModifiers) => {
      const { ctrl = false, shift = false } = modifiers ?? {};

      if (shift && lastSelectedFrameId) {
        // Range selection
        const startIndex = frameIndexMap.get(lastSelectedFrameId) ?? 0;
        const endIndex = frameIndexMap.get(frameId) ?? 0;
        const [minIndex, maxIndex] = [
          Math.min(startIndex, endIndex),
          Math.max(startIndex, endIndex),
        ];
        const rangeIds = frameIds.slice(minIndex, maxIndex + 1);

        if (ctrl) {
          // Add range to existing selection
          const newSelection = [...new Set([...selectedFrameIds, ...rangeIds])];
          selectFrames(newSelection);
        } else {
          // Replace selection with range
          selectFrames(rangeIds);
        }
      } else if (ctrl) {
        // Toggle single frame in multi-selection
        storeSelectFrame(frameId, true);
      } else {
        // Single selection
        storeSelectFrame(frameId, false);
      }
    },
    [
      lastSelectedFrameId,
      frameIndexMap,
      frameIds,
      selectedFrameIds,
      selectFrames,
      storeSelectFrame,
    ]
  );

  // Range selection from last selected to target
  const selectFrameRange = useCallback(
    (endFrameId: string) => {
      if (!lastSelectedFrameId) {
        storeSelectFrame(endFrameId, false);
        return;
      }

      const startIndex = frameIndexMap.get(lastSelectedFrameId) ?? 0;
      const endIndex = frameIndexMap.get(endFrameId) ?? 0;
      const [minIndex, maxIndex] = [
        Math.min(startIndex, endIndex),
        Math.max(startIndex, endIndex),
      ];
      const rangeIds = frameIds.slice(minIndex, maxIndex + 1);
      selectFrames(rangeIds);
    },
    [lastSelectedFrameId, frameIndexMap, frameIds, selectFrames, storeSelectFrame]
  );

  // Select all frames
  const selectAll = useCallback(() => {
    selectAllFrames(frameIds);
  }, [selectAllFrames, frameIds]);

  // Deselect all frames
  const deselectAll = useCallback(() => {
    clearSelection();
  }, [clearSelection]);

  // Invert selection
  const invertSelection = useCallback(() => {
    storeInvertSelection(frameIds);
  }, [storeInvertSelection, frameIds]);

  // Drag selection
  const startDragSelect = useCallback(() => {
    setIsSelecting(true);
  }, []);

  const updateDragSelect = useCallback(
    (frameId: string) => {
      if (!isSelecting) return;

      if (!dragStartFrameId) {
        setDragStartFrameId(frameId);
        storeSelectFrame(frameId, false);
        return;
      }

      const startIndex = frameIndexMap.get(dragStartFrameId) ?? 0;
      const endIndex = frameIndexMap.get(frameId) ?? 0;
      const [minIndex, maxIndex] = [
        Math.min(startIndex, endIndex),
        Math.max(startIndex, endIndex),
      ];
      const rangeIds = frameIds.slice(minIndex, maxIndex + 1);
      selectFrames(rangeIds);
    },
    [isSelecting, dragStartFrameId, frameIndexMap, frameIds, selectFrames, storeSelectFrame]
  );

  const endDragSelect = useCallback(() => {
    setIsSelecting(false);
    setDragStartFrameId(null);
  }, []);

  // Handle keyboard shortcuts for selection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+A to select all
      if (e.ctrlKey && e.key === 'a') {
        e.preventDefault();
        selectAll();
      }
      // Escape to deselect
      if (e.key === 'Escape') {
        deselectAll();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectAll, deselectAll]);

  return {
    // State
    selectedFrameIds,
    selectionMode,
    lastSelectedFrameId,
    isSelecting,

    // Computed
    selectedCount,
    hasSelection,
    isFrameSelected,
    getSelectedIndices,

    // Actions
    selectFrame,
    selectFrameRange,
    selectAll,
    deselectAll,
    invertSelection,
    setSelectionMode,

    // Drag selection
    startDragSelect,
    updateDragSelect,
    endDragSelect,
  };
}
