/**
 * EditorPage Component
 * Main editor interface integrating all editor components with store
 */

import { useCallback, useMemo, useState } from 'react';
import { useEditorStore } from '../../../stores/editorStore';
import { useProjectStore } from '../../../stores/projectStore';
import type { Frame } from '../../../api/types';

// Components
import { Icon } from '../../../components/atoms/Icon';
import { Sidebar, type SidebarItem } from '../../../components/organisms/Sidebar';
import { Toolbar, type ToolbarGroup } from '../../../components/organisms/Toolbar';
import { StatusBar, type StatusItem } from '../../../components/organisms/StatusBar';
import { Tabs } from '../../../components/molecules/Tabs';

// Editor components
import { Timeline } from '../components/Timeline';
import { EditorCanvas, type Overlay } from '../components/Canvas';
import { ToolPalette, type TextToolOptions, type ShapeToolOptions } from '../components/ToolPalette';
import { PlaybackControls } from '../components/PlaybackControls';
import { FrameOperations } from '../components/FrameOperations';
import { FramePropertiesPanel, DelayPanel } from '../components/PropertyPanels';

// Hooks
import { usePlayback, useFrameSelection, useUndoRedo, type DrawingOptions } from '../hooks';

export interface EditorPageProps {
  className?: string;
}

// Sidebar configuration
const sidebarItems: SidebarItem[] = [
  { id: 'frames', label: 'Frames', icon: 'film' },
  { id: 'edit', label: 'Edit', icon: 'pencil-square' },
  { id: 'image', label: 'Image', icon: 'photo' },
  { id: 'text', label: 'Text', icon: 'type' },
  { id: 'effects', label: 'Effects', icon: 'cog' },
];

// Default tool options
const defaultDrawingOptions: DrawingOptions = {
  color: '#FF0000',
  width: 3,
  opacity: 1,
  tool: 'pen',
  smoothing: 0.5,
};

const defaultTextOptions: TextToolOptions = {
  fontSize: 24,
  fontFamily: 'Arial',
  color: '#FFFFFF',
  bold: false,
  italic: false,
  underline: false,
};

const defaultShapeOptions: ShapeToolOptions = {
  shapeType: 'rectangle',
  strokeColor: '#FF0000',
  strokeWidth: 2,
  filled: false,
};

export function EditorPage({ className = '' }: EditorPageProps) {
  // Local state
  const [activeSidebarItem, setActiveSidebarItem] = useState('frames');
  const [overlays, setOverlays] = useState<Overlay[]>([]);
  const [selectedOverlayId, setSelectedOverlayId] = useState<string | null>(null);
  const [drawingOptions, setDrawingOptions] = useState<DrawingOptions>(defaultDrawingOptions);
  const [textOptions, setTextOptions] = useState<TextToolOptions>(defaultTextOptions);
  const [shapeOptions, setShapeOptions] = useState<ShapeToolOptions>(defaultShapeOptions);

  // Store state
  const editorStore = useEditorStore();
  const projectStore = useProjectStore();

  // Hooks
  const playback = usePlayback();
  const selection = useFrameSelection();
  const undoRedo = useUndoRedo();

  // Extract state from stores
  const {
    currentTool,
    canvasZoom,
    canvasZoomPreset,
    canvasPanX,
    canvasPanY,
    showGrid,
    gridSize,
    snapToGrid,
    thumbnailSize,
    showFrameNumbers,
    showFrameDelays,
    timelineZoom,
    isTimelineCollapsed,
    isSidebarCollapsed,
    clipboardFrameIds,
    clipboardOperation,
  } = editorStore;

  const {
    frames,
    currentProject,
    isDirty,
    duplicateFrames,
    removeFrames,
    setFramesDelay,
    scaleDelays,
    getTotalDuration,
  } = projectStore;

  // Computed values
  const selectedFrames = useMemo(() => {
    return frames.filter((f) => selection.selectedFrameIds.includes(f.id));
  }, [frames, selection.selectedFrameIds]);

  const currentFrame = frames[playback.currentFrameIndex] ?? null;
  const totalDuration = getTotalDuration();
  const currentTime = frames
    .slice(0, playback.currentFrameIndex)
    .reduce((sum, f) => sum + f.metadata.delay, 0);

  // Toolbar configuration
  const toolbarGroups: ToolbarGroup[] = useMemo(() => [
    {
      id: 'file',
      buttons: [
        { id: 'save', icon: 'download', label: 'Save Project (Ctrl+S)' },
        { id: 'export', icon: 'upload', label: 'Export (Ctrl+E)' },
      ],
    },
    {
      id: 'history',
      buttons: [
        { id: 'undo', icon: 'undo', label: 'Undo (Ctrl+Z)', disabled: !undoRedo.canUndo, onClick: undoRedo.undo },
        { id: 'redo', icon: 'redo', label: 'Redo (Ctrl+Y)', disabled: !undoRedo.canRedo, onClick: undoRedo.redo },
      ],
    },
  ], [undoRedo.canUndo, undoRedo.canRedo, undoRedo.undo, undoRedo.redo]);

  // Status bar items
  const statusLeftItems: StatusItem[] = useMemo(() => [
    {
      id: 'frame-info',
      content: `Frame ${playback.currentFrameIndex + 1} / ${frames.length}`,
      icon: 'film',
    },
    {
      id: 'duration',
      content: `${(totalDuration / 1000).toFixed(2)}s`,
      icon: 'clock',
    },
  ], [playback.currentFrameIndex, frames.length, totalDuration]);

  const statusRightItems: StatusItem[] = useMemo(() => [
    ...(currentProject ? [{
      id: 'dimensions',
      content: `${currentProject.originalWidth} × ${currentProject.originalHeight}`,
      icon: 'photo' as const,
    }] : []),
    {
      id: 'zoom',
      content: `${Math.round(canvasZoom * 100)}%`,
      icon: 'zoom-in',
    },
  ], [currentProject, canvasZoom]);

  // Handlers
  const handleToolChange = useCallback((tool: typeof currentTool) => {
    editorStore.setCurrentTool(tool);
  }, [editorStore]);

  const handleFrameSelect = useCallback((frameId: string, index: number, event: React.MouseEvent) => {
    selection.selectFrame(frameId, {
      ctrl: event.ctrlKey || event.metaKey,
      shift: event.shiftKey,
    });
    if (!event.ctrlKey && !event.shiftKey) {
      playback.goToFrame(index);
    }
  }, [selection, playback]);

  const handleDeleteFrames = useCallback(() => {
    if (selection.selectedFrameIds.length > 0) {
      removeFrames(selection.selectedFrameIds);
      selection.deselectAll();
    }
  }, [selection, removeFrames]);

  const handleDuplicateFrames = useCallback((repeatCount: number = 1) => {
    if (selection.selectedFrameIds.length > 0) {
      for (let i = 0; i < repeatCount; i++) {
        const lastId = selection.selectedFrameIds[selection.selectedFrameIds.length - 1];
        duplicateFrames(selection.selectedFrameIds, lastId);
      }
    }
  }, [selection, duplicateFrames]);

  const handleReverseFrames = useCallback(() => {
    // TODO: Implement reverse frames
    console.log('Reverse frames:', selection.selectedFrameIds);
  }, [selection]);

  const handleCopyFrames = useCallback(() => {
    editorStore.copyFrames(selection.selectedFrameIds);
  }, [editorStore, selection]);

  const handleCutFrames = useCallback(() => {
    editorStore.cutFrames(selection.selectedFrameIds);
  }, [editorStore, selection]);

  const handlePasteFrames = useCallback(() => {
    if (clipboardFrameIds.length > 0) {
      const insertAfter = selection.selectedFrameIds[selection.selectedFrameIds.length - 1];
      duplicateFrames(clipboardFrameIds, insertAfter);
      if (clipboardOperation === 'cut') {
        removeFrames(clipboardFrameIds);
        editorStore.clearClipboard();
      }
    }
  }, [clipboardFrameIds, clipboardOperation, selection, duplicateFrames, removeFrames, editorStore]);

  const handleDelayChange = useCallback((frameIds: string[], delay: number) => {
    setFramesDelay(frameIds, delay);
  }, [setFramesDelay]);

  const handleOverlayUpdate = useCallback((overlay: Overlay) => {
    setOverlays((prev) =>
      prev.map((o) => (o.id === overlay.id ? overlay : o))
    );
  }, []);

  const handleOverlayDelete = useCallback((overlayId: string) => {
    setOverlays((prev) => prev.filter((o) => o.id !== overlayId));
    setSelectedOverlayId(null);
  }, []);

  // Render right panel content based on active sidebar item
  const renderRightPanel = () => {
    switch (activeSidebarItem) {
      case 'frames':
        return (
          <div className="flex flex-col h-full">
            <FramePropertiesPanel
              selectedFrames={selectedFrames}
              currentFrameIndex={playback.currentFrameIndex}
              totalFrames={frames.length}
              onGoToFrame={playback.goToFrame}
            />
            <div className="border-t border-surface-700" />
            <DelayPanel
              selectedFrames={selectedFrames}
              onDelayChange={(frameId, delay) => handleDelayChange([frameId], delay)}
              onBatchDelayChange={handleDelayChange}
              onScaleDelays={scaleDelays}
            />
          </div>
        );
      case 'edit':
        return (
          <div className="p-4">
            <h3 className="text-sm font-medium text-surface-200 mb-4">Edit Operations</h3>
            <FrameOperations
              selectedCount={selection.selectedCount}
              totalFrames={frames.length}
              canUndo={undoRedo.canUndo}
              canRedo={undoRedo.canRedo}
              onDelete={handleDeleteFrames}
              onDuplicate={handleDuplicateFrames}
              onReverse={handleReverseFrames}
              onCopy={handleCopyFrames}
              onCut={handleCutFrames}
              onPaste={handlePasteFrames}
              onSelectAll={selection.selectAll}
              onDeselectAll={selection.deselectAll}
              onInvertSelection={selection.invertSelection}
              onUndo={undoRedo.undo}
              onRedo={undoRedo.redo}
              hasClipboardContent={clipboardFrameIds.length > 0}
              vertical
            />
          </div>
        );
      default:
        return (
          <div className="p-4 text-sm text-surface-500">
            Select an option from the sidebar
          </div>
        );
    }
  };

  return (
    <div className={`flex flex-col h-screen bg-surface-900 ${className}`}>
      {/* Top toolbar */}
      <Toolbar groups={toolbarGroups} />

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar */}
        <Sidebar
          items={sidebarItems}
          activeItem={activeSidebarItem}
          onItemClick={(item) => setActiveSidebarItem(item.id)}
          collapsed={isSidebarCollapsed}
          onCollapsedChange={editorStore.toggleSidebar}
        />

        {/* Tool palette */}
        <ToolPalette
          currentTool={currentTool}
          onToolChange={handleToolChange}
          drawingOptions={drawingOptions}
          onDrawingOptionsChange={(opts) => setDrawingOptions((prev) => ({ ...prev, ...opts }))}
          textOptions={textOptions}
          onTextOptionsChange={(opts) => setTextOptions((prev) => ({ ...prev, ...opts }))}
          shapeOptions={shapeOptions}
          onShapeOptionsChange={(opts) => setShapeOptions((prev) => ({ ...prev, ...opts }))}
        />

        {/* Center content area */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Canvas area */}
          <EditorCanvas
            frame={currentFrame}
            width={currentProject?.originalWidth ?? 800}
            height={currentProject?.originalHeight ?? 600}
            zoom={canvasZoom}
            zoomPreset={canvasZoomPreset}
            panX={canvasPanX}
            panY={canvasPanY}
            showGrid={showGrid}
            gridSize={gridSize}
            snapToGrid={snapToGrid}
            currentTool={currentTool}
            overlays={overlays}
            selectedOverlayId={selectedOverlayId}
            isPlaying={playback.isPlaying}
            onZoomChange={editorStore.setCanvasZoom}
            onZoomPresetChange={editorStore.setCanvasZoomPreset}
            onPanChange={editorStore.setCanvasPan}
            onOverlaySelect={setSelectedOverlayId}
            onOverlayUpdate={handleOverlayUpdate}
            onOverlayDelete={handleOverlayDelete}
          />

          {/* Playback controls */}
          <PlaybackControls
            currentFrame={playback.currentFrameIndex}
            totalFrames={frames.length}
            isPlaying={playback.isPlaying}
            playbackSpeed={playback.playbackSpeed}
            isLooping={playback.isLooping}
            currentTime={currentTime}
            totalDuration={totalDuration}
            onPlay={playback.play}
            onPause={playback.pause}
            onStop={playback.stop}
            onTogglePlayback={playback.togglePlayback}
            onFirstFrame={playback.goToFirstFrame}
            onPreviousFrame={playback.goToPreviousFrame}
            onNextFrame={playback.goToNextFrame}
            onLastFrame={playback.goToLastFrame}
            onGoToFrame={playback.goToFrame}
            onSpeedChange={playback.setPlaybackSpeed}
            onLoopToggle={playback.setIsLooping}
          />

          {/* Timeline */}
          <Timeline
            frames={frames}
            selectedFrameIds={selection.selectedFrameIds}
            currentFrameIndex={playback.currentFrameIndex}
            duration={totalDuration}
            currentTime={currentTime}
            isPlaying={playback.isPlaying}
            thumbnailSize={thumbnailSize}
            zoom={timelineZoom}
            showFrameNumbers={showFrameNumbers}
            showFrameDelays={showFrameDelays}
            isCollapsed={isTimelineCollapsed}
            onFrameSelect={handleFrameSelect}
            onCurrentFrameChange={playback.goToFrame}
            onZoomChange={editorStore.setTimelineZoom}
            onThumbnailSizeChange={editorStore.setThumbnailSize}
            onToggleCollapse={editorStore.toggleTimeline}
            onShowFrameNumbersChange={editorStore.setShowFrameNumbers}
            onShowFrameDelaysChange={editorStore.setShowFrameDelays}
            onScrubStart={playback.pause}
          />
        </div>

        {/* Right properties panel */}
        <aside className="w-72 bg-surface-800 border-l border-surface-700 overflow-y-auto">
          {renderRightPanel()}
        </aside>
      </div>

      {/* Status bar */}
      <StatusBar
        status={isDirty ? 'warning' : 'idle'}
        statusMessage={isDirty ? 'Unsaved changes' : 'Ready'}
        leftItems={statusLeftItems}
        rightItems={statusRightItems}
      />
    </div>
  );
}
