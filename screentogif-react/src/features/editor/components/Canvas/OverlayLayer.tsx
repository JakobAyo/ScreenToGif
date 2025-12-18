/**
 * OverlayLayer Component
 * Handles text, shapes, and drawing overlays on top of the frame
 */

import { useCallback, useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';

export interface TextOverlay {
  id: string;
  type: 'text';
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  backgroundColor?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  rotation?: number;
}

export interface ShapeOverlay {
  id: string;
  type: 'rectangle' | 'ellipse' | 'line' | 'arrow';
  x: number;
  y: number;
  width: number;
  height: number;
  strokeColor: string;
  strokeWidth: number;
  fillColor?: string;
  rotation?: number;
}

export interface DrawingOverlay {
  id: string;
  type: 'drawing';
  points: { x: number; y: number }[];
  color: string;
  width: number;
  opacity: number;
}

export type Overlay = TextOverlay | ShapeOverlay | DrawingOverlay;

export interface OverlayLayerProps {
  /** Canvas width */
  width: number;
  /** Canvas height */
  height: number;
  /** Zoom level */
  zoom: number;
  /** Existing overlays to render */
  overlays: Overlay[];
  /** Currently selected overlay ID */
  selectedOverlayId?: string | null;
  /** Whether to show selection handles */
  showSelectionHandles?: boolean;
  /** Whether the layer is interactive */
  isInteractive?: boolean;
  /** Overlay selection handler */
  onOverlaySelect?: (overlayId: string | null) => void;
  /** Overlay update handler */
  onOverlayUpdate?: (overlay: Overlay) => void;
  /** Overlay delete handler */
  onOverlayDelete?: (overlayId: string) => void;
  /** Click handler for empty areas */
  onCanvasClick?: (x: number, y: number) => void;
  className?: string;
}

export interface OverlayLayerHandle {
  getCanvas: () => HTMLCanvasElement | null;
  redraw: () => void;
}

export const OverlayLayer = forwardRef<OverlayLayerHandle, OverlayLayerProps>(function OverlayLayer(
  {
    width,
    height,
    zoom,
    overlays,
    selectedOverlayId,
    showSelectionHandles = true,
    isInteractive = true,
    onOverlaySelect,
    onOverlayUpdate,
    onOverlayDelete,
    onCanvasClick,
    className = '',
  },
  ref
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Expose canvas and redraw method
  useImperativeHandle(ref, () => ({
    getCanvas: () => canvasRef.current,
    redraw: () => drawOverlays(),
  }));

  // Draw all overlays to canvas
  const drawOverlays = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width * zoom, height * zoom);

    // Set scale for zoom
    ctx.save();
    ctx.scale(zoom, zoom);

    // Draw each overlay
    overlays.forEach((overlay) => {
      ctx.save();

      switch (overlay.type) {
        case 'text':
          drawTextOverlay(ctx, overlay);
          break;
        case 'rectangle':
        case 'ellipse':
        case 'line':
        case 'arrow':
          drawShapeOverlay(ctx, overlay as ShapeOverlay);
          break;
        case 'drawing':
          drawDrawingOverlay(ctx, overlay);
          break;
      }

      ctx.restore();
    });

    // Draw selection handles if needed
    if (selectedOverlayId && showSelectionHandles) {
      const selectedOverlay = overlays.find((o) => o.id === selectedOverlayId);
      if (selectedOverlay) {
        drawSelectionHandles(ctx, selectedOverlay);
      }
    }

    ctx.restore();
  }, [overlays, width, height, zoom, selectedOverlayId, showSelectionHandles]);

  // Draw text overlay
  const drawTextOverlay = (ctx: CanvasRenderingContext2D, overlay: TextOverlay) => {
    ctx.font = `${overlay.italic ? 'italic ' : ''}${overlay.bold ? 'bold ' : ''}${overlay.fontSize}px ${overlay.fontFamily}`;
    ctx.fillStyle = overlay.color;
    ctx.textBaseline = 'top';

    if (overlay.rotation) {
      ctx.translate(overlay.x, overlay.y);
      ctx.rotate((overlay.rotation * Math.PI) / 180);
      ctx.translate(-overlay.x, -overlay.y);
    }

    // Background
    if (overlay.backgroundColor) {
      const metrics = ctx.measureText(overlay.text);
      const padding = 4;
      ctx.fillStyle = overlay.backgroundColor;
      ctx.fillRect(
        overlay.x - padding,
        overlay.y - padding,
        metrics.width + padding * 2,
        overlay.fontSize + padding * 2
      );
      ctx.fillStyle = overlay.color;
    }

    ctx.fillText(overlay.text, overlay.x, overlay.y);

    // Underline
    if (overlay.underline) {
      const metrics = ctx.measureText(overlay.text);
      ctx.strokeStyle = overlay.color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(overlay.x, overlay.y + overlay.fontSize + 2);
      ctx.lineTo(overlay.x + metrics.width, overlay.y + overlay.fontSize + 2);
      ctx.stroke();
    }
  };

  // Draw shape overlay
  const drawShapeOverlay = (ctx: CanvasRenderingContext2D, overlay: ShapeOverlay) => {
    ctx.strokeStyle = overlay.strokeColor;
    ctx.lineWidth = overlay.strokeWidth;

    if (overlay.fillColor) {
      ctx.fillStyle = overlay.fillColor;
    }

    if (overlay.rotation) {
      const centerX = overlay.x + overlay.width / 2;
      const centerY = overlay.y + overlay.height / 2;
      ctx.translate(centerX, centerY);
      ctx.rotate((overlay.rotation * Math.PI) / 180);
      ctx.translate(-centerX, -centerY);
    }

    switch (overlay.type) {
      case 'rectangle':
        ctx.beginPath();
        ctx.rect(overlay.x, overlay.y, overlay.width, overlay.height);
        if (overlay.fillColor) ctx.fill();
        ctx.stroke();
        break;

      case 'ellipse':
        ctx.beginPath();
        ctx.ellipse(
          overlay.x + overlay.width / 2,
          overlay.y + overlay.height / 2,
          overlay.width / 2,
          overlay.height / 2,
          0,
          0,
          Math.PI * 2
        );
        if (overlay.fillColor) ctx.fill();
        ctx.stroke();
        break;

      case 'line':
        ctx.beginPath();
        ctx.moveTo(overlay.x, overlay.y);
        ctx.lineTo(overlay.x + overlay.width, overlay.y + overlay.height);
        ctx.stroke();
        break;

      case 'arrow':
        const headLength = 15;
        const angle = Math.atan2(overlay.height, overlay.width);

        ctx.beginPath();
        ctx.moveTo(overlay.x, overlay.y);
        ctx.lineTo(overlay.x + overlay.width, overlay.y + overlay.height);
        ctx.stroke();

        // Arrow head
        ctx.beginPath();
        ctx.moveTo(overlay.x + overlay.width, overlay.y + overlay.height);
        ctx.lineTo(
          overlay.x + overlay.width - headLength * Math.cos(angle - Math.PI / 6),
          overlay.y + overlay.height - headLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(overlay.x + overlay.width, overlay.y + overlay.height);
        ctx.lineTo(
          overlay.x + overlay.width - headLength * Math.cos(angle + Math.PI / 6),
          overlay.y + overlay.height - headLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.stroke();
        break;
    }
  };

  // Draw freehand drawing overlay
  const drawDrawingOverlay = (ctx: CanvasRenderingContext2D, overlay: DrawingOverlay) => {
    if (overlay.points.length < 2) return;

    ctx.strokeStyle = overlay.color;
    ctx.lineWidth = overlay.width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalAlpha = overlay.opacity;

    ctx.beginPath();
    ctx.moveTo(overlay.points[0].x, overlay.points[0].y);

    for (let i = 1; i < overlay.points.length; i++) {
      ctx.lineTo(overlay.points[i].x, overlay.points[i].y);
    }

    ctx.stroke();
    ctx.globalAlpha = 1;
  };

  // Draw selection handles
  const drawSelectionHandles = (ctx: CanvasRenderingContext2D, overlay: Overlay) => {
    let bounds: { x: number; y: number; width: number; height: number };

    if (overlay.type === 'text') {
      const textOverlay = overlay as TextOverlay;
      ctx.font = `${textOverlay.italic ? 'italic ' : ''}${textOverlay.bold ? 'bold ' : ''}${textOverlay.fontSize}px ${textOverlay.fontFamily}`;
      const metrics = ctx.measureText(textOverlay.text);
      bounds = {
        x: textOverlay.x - 4,
        y: textOverlay.y - 4,
        width: metrics.width + 8,
        height: textOverlay.fontSize + 8,
      };
    } else if (overlay.type === 'drawing') {
      const drawingOverlay = overlay as DrawingOverlay;
      const xs = drawingOverlay.points.map((p) => p.x);
      const ys = drawingOverlay.points.map((p) => p.y);
      bounds = {
        x: Math.min(...xs) - 4,
        y: Math.min(...ys) - 4,
        width: Math.max(...xs) - Math.min(...xs) + 8,
        height: Math.max(...ys) - Math.min(...ys) + 8,
      };
    } else {
      const shapeOverlay = overlay as ShapeOverlay;
      bounds = {
        x: shapeOverlay.x - 4,
        y: shapeOverlay.y - 4,
        width: shapeOverlay.width + 8,
        height: shapeOverlay.height + 8,
      };
    }

    // Selection border
    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
    ctx.setLineDash([]);

    // Corner handles
    const handleSize = 8;
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 1;

    const handles = [
      { x: bounds.x, y: bounds.y },
      { x: bounds.x + bounds.width, y: bounds.y },
      { x: bounds.x, y: bounds.y + bounds.height },
      { x: bounds.x + bounds.width, y: bounds.y + bounds.height },
    ];

    handles.forEach((handle) => {
      ctx.fillRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
      ctx.strokeRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
    });
  };

  // Redraw when dependencies change
  useEffect(() => {
    drawOverlays();
  }, [drawOverlays]);

  // Handle mouse events
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!isInteractive) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / zoom;
      const y = (e.clientY - rect.top) / zoom;

      // Check if clicking on an overlay
      let clickedOverlay: Overlay | null = null;

      for (let i = overlays.length - 1; i >= 0; i--) {
        const overlay = overlays[i];
        if (isPointInOverlay(x, y, overlay)) {
          clickedOverlay = overlay;
          break;
        }
      }

      if (clickedOverlay) {
        onOverlaySelect?.(clickedOverlay.id);
        setIsDragging(true);

        // Calculate drag offset based on overlay type
        if (clickedOverlay.type !== 'drawing') {
          const typedOverlay = clickedOverlay as TextOverlay | ShapeOverlay;
          setDragOffset({
            x: x - typedOverlay.x,
            y: y - typedOverlay.y,
          });
        }
      } else {
        onOverlaySelect?.(null);
        onCanvasClick?.(x, y);
      }
    },
    [isInteractive, zoom, overlays, onOverlaySelect, onCanvasClick]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging || !selectedOverlayId) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / zoom;
      const y = (e.clientY - rect.top) / zoom;

      const overlay = overlays.find((o) => o.id === selectedOverlayId);
      if (overlay && overlay.type !== 'drawing') {
        const updatedOverlay = {
          ...overlay,
          x: x - dragOffset.x,
          y: y - dragOffset.y,
        } as Overlay;
        onOverlayUpdate?.(updatedOverlay);
      }
    },
    [isDragging, selectedOverlayId, zoom, overlays, dragOffset, onOverlayUpdate]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Check if point is inside overlay bounds
  const isPointInOverlay = (x: number, y: number, overlay: Overlay): boolean => {
    if (overlay.type === 'text') {
      const textOverlay = overlay as TextOverlay;
      // Approximate bounds for text
      return (
        x >= textOverlay.x &&
        x <= textOverlay.x + 200 &&
        y >= textOverlay.y &&
        y <= textOverlay.y + textOverlay.fontSize
      );
    } else if (overlay.type === 'drawing') {
      const drawingOverlay = overlay as DrawingOverlay;
      // Check if near any point
      return drawingOverlay.points.some(
        (p) => Math.abs(p.x - x) < 10 && Math.abs(p.y - y) < 10
      );
    } else {
      const shapeOverlay = overlay as ShapeOverlay;
      return (
        x >= shapeOverlay.x &&
        x <= shapeOverlay.x + shapeOverlay.width &&
        y >= shapeOverlay.y &&
        y <= shapeOverlay.y + shapeOverlay.height
      );
    }
  };

  // Handle keyboard shortcuts for selected overlay
  useEffect(() => {
    if (!selectedOverlayId) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        onOverlayDelete?.(selectedOverlayId);
      } else if (e.key === 'Escape') {
        onOverlaySelect?.(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedOverlayId, onOverlayDelete, onOverlaySelect]);

  return (
    <canvas
      ref={canvasRef}
      width={width * zoom}
      height={height * zoom}
      className={`
        absolute top-0 left-0
        ${isInteractive ? 'cursor-crosshair' : 'pointer-events-none'}
        ${className}
      `}
      style={{
        width: width * zoom,
        height: height * zoom,
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    />
  );
});
