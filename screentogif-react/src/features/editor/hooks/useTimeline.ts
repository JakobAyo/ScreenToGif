/**
 * useTimeline Hook
 * Manages timeline state and interactions for frame manipulation
 */

import { useCallback, useMemo } from 'react';
import { useEditorStore } from '../../../stores/editorStore';
import { useProjectStore } from '../../../stores/projectStore';
import type { Frame } from '../../../api/types';

export interface UseTimelineReturn {
  // State
  frames: Frame[];
  selectedFrameIds: string[];
  currentFrameIndex: number;
  timelineZoom: number;
  thumbnailSize: 'small' | 'medium' | 'large';
  showFrameNumbers: boolean;
  showFrameDelays: boolean;

  // Computed
  totalFrames: number;
  totalDuration: number;
  hasSelection: boolean;
  currentFrame: Frame | undefined;

  // Actions
  selectFrame: (frameId: string, addToSelection?: boolean) => void;
  selectFrames: (frameIds: string[]) => void;
  selectFrameRange: (startId: string, endId: string) => void;
  selectAllFrames: () => void;
  clearSelection: () => void;
  invertSelection: () => void;

  // Navigation
  goToFrame: (index: number) => void;
  goToFirstFrame: () => void;
  goToLastFrame: () => void;
  goToNextFrame: () => void;
  goToPreviousFrame: () => void;

  // Timeline controls
  setTimelineZoom: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  setThumbnailSize: (size: 'small' | 'medium' | 'large') => void;
  setShowFrameNumbers: (show: boolean) => void;
  setShowFrameDelays: (show: boolean) => void;

  // Frame manipulation
  deleteSelectedFrames: () => void;
  duplicateSelectedFrames: () => void;
  reorderFrame: (fromIndex: number, toIndex: number) => void;
  setFrameDelay: (frameId: string, delay: number) => void;
  setSelectedFramesDelay: (delay: number) => void;
}

export function useTimeline(): UseTimelineReturn {
  // Editor store state
  const {
    selectedFrameIds,
    currentFrameIndex,
    timelineZoom,
    thumbnailSize,
    showFrameNumbers,
    showFrameDelays,
    selectFrame,
    selectFrames,
    selectFrameRange,
    selectAllFrames,
    clearSelection,
    invertSelection,
    setCurrentFrameIndex,
    goToFirstFrame,
    goToLastFrame,
    nextFrame,
    previousFrame,
    setTimelineZoom,
    setThumbnailSize,
    setShowFrameNumbers,
    setShowFrameDelays,
  } = useEditorStore();

  // Project store state
  const {
    frames,
    removeFrames,
    duplicateFrames,
    reorderFrames,
    setFrameDelay,
    setFramesDelay,
    getTotalDuration,
  } = useProjectStore();

  // Computed values
  const totalFrames = frames.length;
  const totalDuration = useMemo(() => getTotalDuration(), [frames]);
  const hasSelection = selectedFrameIds.length > 0;
  const currentFrame = frames[currentFrameIndex];

  // Frame IDs for select all
  const allFrameIds = useMemo(() => frames.map((f) => f.id), [frames]);

  // Actions
  const handleSelectAllFrames = useCallback(() => {
    selectAllFrames(allFrameIds);
  }, [selectAllFrames, allFrameIds]);

  const handleInvertSelection = useCallback(() => {
    invertSelection(allFrameIds);
  }, [invertSelection, allFrameIds]);

  const handleGoToFrame = useCallback((index: number) => {
    const clampedIndex = Math.max(0, Math.min(index, totalFrames - 1));
    setCurrentFrameIndex(clampedIndex);
  }, [setCurrentFrameIndex, totalFrames]);

  const handleGoToLastFrame = useCallback(() => {
    goToLastFrame(totalFrames);
  }, [goToLastFrame, totalFrames]);

  const handleGoToNextFrame = useCallback(() => {
    if (currentFrameIndex < totalFrames - 1) {
      nextFrame();
    }
  }, [nextFrame, currentFrameIndex, totalFrames]);

  const handleGoToPreviousFrame = useCallback(() => {
    previousFrame();
  }, [previousFrame]);

  // Timeline zoom helpers
  const handleZoomIn = useCallback(() => {
    setTimelineZoom(Math.min(timelineZoom * 1.25, 4.0));
  }, [setTimelineZoom, timelineZoom]);

  const handleZoomOut = useCallback(() => {
    setTimelineZoom(Math.max(timelineZoom / 1.25, 0.5));
  }, [setTimelineZoom, timelineZoom]);

  // Frame manipulation
  const deleteSelectedFrames = useCallback(() => {
    if (selectedFrameIds.length > 0) {
      removeFrames(selectedFrameIds);
      clearSelection();
    }
  }, [removeFrames, selectedFrameIds, clearSelection]);

  const duplicateSelectedFrames = useCallback(() => {
    if (selectedFrameIds.length > 0) {
      const lastSelectedId = selectedFrameIds[selectedFrameIds.length - 1];
      duplicateFrames(selectedFrameIds, lastSelectedId);
    }
  }, [duplicateFrames, selectedFrameIds]);

  const handleSetSelectedFramesDelay = useCallback((delay: number) => {
    if (selectedFrameIds.length > 0) {
      setFramesDelay(selectedFrameIds, delay);
    }
  }, [setFramesDelay, selectedFrameIds]);

  return {
    // State
    frames,
    selectedFrameIds,
    currentFrameIndex,
    timelineZoom,
    thumbnailSize,
    showFrameNumbers,
    showFrameDelays,

    // Computed
    totalFrames,
    totalDuration,
    hasSelection,
    currentFrame,

    // Actions
    selectFrame,
    selectFrames,
    selectFrameRange,
    selectAllFrames: handleSelectAllFrames,
    clearSelection,
    invertSelection: handleInvertSelection,

    // Navigation
    goToFrame: handleGoToFrame,
    goToFirstFrame,
    goToLastFrame: handleGoToLastFrame,
    goToNextFrame: handleGoToNextFrame,
    goToPreviousFrame: handleGoToPreviousFrame,

    // Timeline controls
    setTimelineZoom,
    zoomIn: handleZoomIn,
    zoomOut: handleZoomOut,
    setThumbnailSize,
    setShowFrameNumbers,
    setShowFrameDelays,

    // Frame manipulation
    deleteSelectedFrames,
    duplicateSelectedFrames,
    reorderFrame: reorderFrames,
    setFrameDelay,
    setSelectedFramesDelay: handleSetSelectedFramesDelay,
  };
}
