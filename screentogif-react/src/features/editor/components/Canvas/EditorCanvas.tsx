/**
 * EditorCanvas Component
 * Main canvas container with frame display, overlay layer, and interaction handling
 */

import { useCallback, useRef, useState, useEffect, useMemo } from 'react';
import type { Frame } from '../../../../api/types';
import type { EditorTool, ZoomPreset } from '../../../../stores/editorStore';
import { Icon } from '../../../../components/atoms/Icon';
import { Tooltip } from '../../../../components/molecules/Tooltip';
import { FrameRenderer } from './FrameRenderer';
import { OverlayLayer, type Overlay, type OverlayLayerHandle } from './OverlayLayer';

export interface EditorCanvasProps {
  /** Current frame to display */
  frame: Frame | null;
  /** Canvas width (from project settings) */
  width: number;
  /** Canvas height (from project settings) */
  height: number;
  /** Current zoom level */
  zoom: number;
  /** Zoom preset */
  zoomPreset: ZoomPreset;
  /** Pan X offset */
  panX: number;
  /** Pan Y offset */
  panY: number;
  /** Whether to show grid */
  showGrid?: boolean;
  /** Grid size in pixels */
  gridSize?: number;
  /** Whether to snap to grid */
  snapToGrid?: boolean;
  /** Current editor tool */
  currentTool: EditorTool;
  /** Overlays to render */
  overlays?: Overlay[];
  /** Selected overlay ID */
  selectedOverlayId?: string | null;
  /** Whether the canvas is in playback mode */
  isPlaying?: boolean;

  // Onion skin settings
  showOnionSkin?: boolean;
  onionSkinFrames?: Frame[];
  onionSkinOpacity?: number;

  // Callbacks
  onZoomChange?: (zoom: number) => void;
  onZoomPresetChange?: (preset: ZoomPreset) => void;
  onPanChange?: (x: number, y: number) => void;
  onOverlaySelect?: (overlayId: string | null) => void;
  onOverlayUpdate?: (overlay: Overlay) => void;
  onOverlayDelete?: (overlayId: string) => void;
  onOverlayCreate?: (overlay: Overlay) => void;
  onCanvasClick?: (x: number, y: number) => void;

  className?: string;
}

const ZOOM_PRESETS: { value: ZoomPreset; label: string; zoom?: number }[] = [
  { value: 'fit', label: 'Fit' },
  { value: 'fill', label: 'Fill' },
  { value: '25', label: '25%', zoom: 0.25 },
  { value: '50', label: '50%', zoom: 0.5 },
  { value: '75', label: '75%', zoom: 0.75 },
  { value: '100', label: '100%', zoom: 1.0 },
  { value: '150', label: '150%', zoom: 1.5 },
  { value: '200', label: '200%', zoom: 2.0 },
  { value: '400', label: '400%', zoom: 4.0 },
];

export function EditorCanvas({
  frame,
  width,
  height,
  zoom,
  zoomPreset,
  panX,
  panY,
  showGrid = false,
  gridSize = 16,
  snapToGrid = false,
  currentTool,
  overlays = [],
  selectedOverlayId,
  isPlaying = false,
  showOnionSkin = false,
  onionSkinFrames = [],
  onionSkinOpacity = 0.3,
  onZoomChange,
  onZoomPresetChange,
  onPanChange,
  onOverlaySelect,
  onOverlayUpdate,
  onOverlayDelete,
  onOverlayCreate,
  onCanvasClick,
  className = '',
}: EditorCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayLayerRef = useRef<OverlayLayerHandle>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Calculate effective zoom for 'fit' and 'fill' presets
  const effectiveZoom = useMemo(() => {
    if (!containerSize.width || !containerSize.height || !width || !height) {
      return zoom;
    }

    const padding = 40;
    const availableWidth = containerSize.width - padding * 2;
    const availableHeight = containerSize.height - padding * 2;

    if (zoomPreset === 'fit') {
      const scaleX = availableWidth / width;
      const scaleY = availableHeight / height;
      return Math.min(scaleX, scaleY);
    } else if (zoomPreset === 'fill') {
      const scaleX = availableWidth / width;
      const scaleY = availableHeight / height;
      return Math.max(scaleX, scaleY);
    }

    return zoom;
  }, [zoom, zoomPreset, containerSize, width, height]);

  // Track container size
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Cursor style based on current tool
  const getCursorStyle = (): string => {
    switch (currentTool) {
      case 'select':
        return 'cursor-default';
      case 'text':
        return 'cursor-text';
      case 'drawing':
        return 'cursor-crosshair';
      case 'shapes':
        return 'cursor-crosshair';
      case 'crop':
        return 'cursor-crosshair';
      default:
        return 'cursor-default';
    }
  };

  // Handle wheel zoom
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        const newZoom = Math.max(0.25, Math.min(4.0, effectiveZoom + delta));
        onZoomChange?.(newZoom);
      }
    },
    [effectiveZoom, onZoomChange]
  );

  // Handle pan start
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Middle mouse button or space + left click for panning
      if (e.button === 1 || (e.button === 0 && currentTool === 'select' && e.altKey)) {
        e.preventDefault();
        setIsPanning(true);
        setPanStart({ x: e.clientX - panX, y: e.clientY - panY });
      }
    },
    [currentTool, panX, panY]
  );

  // Handle pan move
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isPanning) {
        const newPanX = e.clientX - panStart.x;
        const newPanY = e.clientY - panStart.y;
        onPanChange?.(newPanX, newPanY);
      }
    },
    [isPanning, panStart, onPanChange]
  );

  // Handle pan end
  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    onZoomChange?.(Math.min(effectiveZoom * 1.25, 4.0));
  }, [effectiveZoom, onZoomChange]);

  const handleZoomOut = useCallback(() => {
    onZoomChange?.(Math.max(effectiveZoom / 1.25, 0.25));
  }, [effectiveZoom, onZoomChange]);

  const handleZoomReset = useCallback(() => {
    onZoomChange?.(1.0);
    onPanChange?.(0, 0);
  }, [onZoomChange, onPanChange]);

  const handleZoomPresetSelect = useCallback(
    (preset: ZoomPreset) => {
      onZoomPresetChange?.(preset);
      const presetConfig = ZOOM_PRESETS.find((p) => p.value === preset);
      if (presetConfig?.zoom) {
        onZoomChange?.(presetConfig.zoom);
      }
    },
    [onZoomPresetChange, onZoomChange]
  );

  // Snap coordinates to grid if enabled
  const snapToGridCoords = useCallback(
    (x: number, y: number): { x: number; y: number } => {
      if (!snapToGrid) return { x, y };
      return {
        x: Math.round(x / gridSize) * gridSize,
        y: Math.round(y / gridSize) * gridSize,
      };
    },
    [snapToGrid, gridSize]
  );

  // Handle canvas click for overlay creation
  const handleCanvasClick = useCallback(
    (x: number, y: number) => {
      const snapped = snapToGridCoords(x, y);
      onCanvasClick?.(snapped.x, snapped.y);
    },
    [snapToGridCoords, onCanvasClick]
  );

  return (
    <div
      ref={containerRef}
      className={`
        relative flex flex-col flex-1 overflow-hidden
        bg-surface-950
        ${getCursorStyle()}
        ${className}
      `}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Zoom controls overlay */}
      <div
        className="
          absolute top-4 right-4 z-20
          flex items-center gap-2
          bg-surface-800/90 backdrop-blur-sm
          rounded-lg p-2
          border border-surface-700
        "
      >
        <Tooltip content="Zoom out">
          <button
            onClick={handleZoomOut}
            className="p-1 text-surface-400 hover:text-surface-200 hover:bg-surface-700 rounded"
          >
            <Icon name="zoom-out" size="sm" />
          </button>
        </Tooltip>

        {/* Zoom dropdown */}
        <select
          value={zoomPreset}
          onChange={(e) => handleZoomPresetSelect(e.target.value as ZoomPreset)}
          className="
            bg-surface-700 text-surface-200
            border border-surface-600 rounded
            text-xs px-2 py-1
            focus:outline-none focus:border-primary-500
          "
        >
          {ZOOM_PRESETS.map((preset) => (
            <option key={preset.value} value={preset.value}>
              {preset.label}
            </option>
          ))}
        </select>

        <span className="text-xs text-surface-400 font-mono min-w-[48px] text-center">
          {Math.round(effectiveZoom * 100)}%
        </span>

        <Tooltip content="Zoom in">
          <button
            onClick={handleZoomIn}
            className="p-1 text-surface-400 hover:text-surface-200 hover:bg-surface-700 rounded"
          >
            <Icon name="zoom-in" size="sm" />
          </button>
        </Tooltip>

        <div className="w-px h-4 bg-surface-600" />

        <Tooltip content="Fit to window">
          <button
            onClick={() => handleZoomPresetSelect('fit')}
            className={`
              p-1 rounded
              ${zoomPreset === 'fit' ? 'text-primary-400' : 'text-surface-400 hover:text-surface-200'}
              hover:bg-surface-700
            `}
          >
            <Icon name="crop" size="sm" />
          </button>
        </Tooltip>

        <Tooltip content="Reset zoom">
          <button
            onClick={handleZoomReset}
            className="p-1 text-surface-400 hover:text-surface-200 hover:bg-surface-700 rounded"
          >
            <Icon name="refresh" size="sm" />
          </button>
        </Tooltip>
      </div>

      {/* Canvas viewport */}
      <div
        className="flex-1 overflow-auto flex items-center justify-center"
        style={{
          transform: `translate(${panX}px, ${panY}px)`,
        }}
      >
        {/* Canvas container */}
        <div
          className="relative"
          style={{
            width: width * effectiveZoom,
            height: height * effectiveZoom,
          }}
        >
          {/* Grid overlay */}
          {showGrid && (
            <div
              className="absolute inset-0 pointer-events-none z-10"
              style={{
                backgroundSize: `${gridSize * effectiveZoom}px ${gridSize * effectiveZoom}px`,
                backgroundImage: `
                  linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
                `,
              }}
            />
          )}

          {/* Onion skin layers (previous/next frames) */}
          {showOnionSkin && !isPlaying && onionSkinFrames.length > 0 && (
            <div className="absolute inset-0 pointer-events-none">
              {onionSkinFrames.map((onionFrame, index) => (
                <div
                  key={onionFrame.id}
                  className="absolute inset-0"
                  style={{ opacity: onionSkinOpacity }}
                >
                  <FrameRenderer
                    frame={onionFrame}
                    zoom={effectiveZoom}
                    showTransparency={false}
                    className="w-full h-full"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Main frame */}
          <FrameRenderer
            frame={frame}
            zoom={effectiveZoom}
            showTransparency={true}
            className="w-full h-full"
          />

          {/* Overlay layer for annotations */}
          {!isPlaying && (
            <OverlayLayer
              ref={overlayLayerRef}
              width={width}
              height={height}
              zoom={effectiveZoom}
              overlays={overlays}
              selectedOverlayId={selectedOverlayId}
              showSelectionHandles={currentTool === 'select'}
              isInteractive={currentTool !== 'select' || selectedOverlayId !== null}
              onOverlaySelect={onOverlaySelect}
              onOverlayUpdate={onOverlayUpdate}
              onOverlayDelete={onOverlayDelete}
              onCanvasClick={handleCanvasClick}
            />
          )}
        </div>
      </div>

      {/* Frame dimensions indicator */}
      {width > 0 && height > 0 && (
        <div
          className="
            absolute bottom-4 left-4
            px-2 py-1 rounded
            bg-surface-800/80 backdrop-blur-sm
            text-xs text-surface-400 font-mono
            border border-surface-700
          "
        >
          {width} × {height}
        </div>
      )}

      {/* Current tool indicator */}
      <div
        className="
          absolute bottom-4 right-4
          px-2 py-1 rounded
          bg-surface-800/80 backdrop-blur-sm
          text-xs text-surface-300
          border border-surface-700
          capitalize
        "
      >
        {currentTool}
      </div>
    </div>
  );
}
