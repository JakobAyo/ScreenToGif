/**
 * useDrawing Hook
 * Manages drawing state and canvas operations for freehand drawing
 */

import { useCallback, useRef, useState } from 'react';

export interface DrawingPoint {
  x: number;
  y: number;
  pressure?: number;
}

export interface DrawingStroke {
  id: string;
  points: DrawingPoint[];
  color: string;
  width: number;
  opacity: number;
  tool: DrawingTool;
}

export type DrawingTool = 'pen' | 'brush' | 'eraser' | 'highlighter';

export interface DrawingOptions {
  color: string;
  width: number;
  opacity: number;
  tool: DrawingTool;
  smoothing: number; // 0-1, amount of line smoothing
}

export interface UseDrawingReturn {
  // State
  isDrawing: boolean;
  currentStroke: DrawingStroke | null;
  strokes: DrawingStroke[];
  options: DrawingOptions;

  // Actions
  startStroke: (point: DrawingPoint) => void;
  continueStroke: (point: DrawingPoint) => void;
  endStroke: () => void;
  cancelStroke: () => void;

  // Stroke management
  addStroke: (stroke: DrawingStroke) => void;
  removeStroke: (strokeId: string) => void;
  undoLastStroke: () => DrawingStroke | null;
  clearStrokes: () => void;

  // Options
  setColor: (color: string) => void;
  setWidth: (width: number) => void;
  setOpacity: (opacity: number) => void;
  setTool: (tool: DrawingTool) => void;
  setSmoothing: (smoothing: number) => void;
  setOptions: (options: Partial<DrawingOptions>) => void;

  // Canvas helpers
  getCanvasContext: () => CanvasRenderingContext2D | null;
  setCanvas: (canvas: HTMLCanvasElement | null) => void;
  renderStrokes: () => void;
  renderStroke: (stroke: DrawingStroke) => void;
}

const defaultOptions: DrawingOptions = {
  color: '#FF0000',
  width: 3,
  opacity: 1,
  tool: 'pen',
  smoothing: 0.5,
};

export function useDrawing(): UseDrawingReturn {
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<DrawingStroke | null>(null);
  const [strokes, setStrokes] = useState<DrawingStroke[]>([]);
  const [options, setOptionsState] = useState<DrawingOptions>(defaultOptions);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Generate unique stroke ID
  const generateStrokeId = () => `stroke-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

  // Smooth point using Catmull-Rom interpolation
  const smoothPoint = (
    points: DrawingPoint[],
    index: number,
    smoothing: number
  ): DrawingPoint => {
    if (points.length < 3 || index === 0 || index === points.length - 1) {
      return points[index];
    }

    const prev = points[index - 1];
    const curr = points[index];
    const next = points[index + 1];

    return {
      x: curr.x + (next.x - prev.x) * smoothing * 0.25,
      y: curr.y + (next.y - prev.y) * smoothing * 0.25,
      pressure: curr.pressure,
    };
  };

  // Start a new stroke
  const startStroke = useCallback(
    (point: DrawingPoint) => {
      const newStroke: DrawingStroke = {
        id: generateStrokeId(),
        points: [point],
        color: options.color,
        width: options.width,
        opacity: options.opacity,
        tool: options.tool,
      };
      setCurrentStroke(newStroke);
      setIsDrawing(true);
    },
    [options]
  );

  // Continue current stroke
  const continueStroke = useCallback(
    (point: DrawingPoint) => {
      if (!currentStroke || !isDrawing) return;

      setCurrentStroke((prev) => {
        if (!prev) return null;
        const newPoints = [...prev.points, point];
        return { ...prev, points: newPoints };
      });
    },
    [currentStroke, isDrawing]
  );

  // End current stroke and save it
  const endStroke = useCallback(() => {
    if (currentStroke && currentStroke.points.length > 0) {
      // Apply smoothing to final stroke
      const smoothedPoints = currentStroke.points.map((_, index) =>
        smoothPoint(currentStroke.points, index, options.smoothing)
      );
      const finalStroke = { ...currentStroke, points: smoothedPoints };
      setStrokes((prev) => [...prev, finalStroke]);
    }
    setCurrentStroke(null);
    setIsDrawing(false);
  }, [currentStroke, options.smoothing]);

  // Cancel current stroke without saving
  const cancelStroke = useCallback(() => {
    setCurrentStroke(null);
    setIsDrawing(false);
  }, []);

  // Stroke management
  const addStroke = useCallback((stroke: DrawingStroke) => {
    setStrokes((prev) => [...prev, stroke]);
  }, []);

  const removeStroke = useCallback((strokeId: string) => {
    setStrokes((prev) => prev.filter((s) => s.id !== strokeId));
  }, []);

  const undoLastStroke = useCallback(() => {
    if (strokes.length === 0) return null;
    const lastStroke = strokes[strokes.length - 1];
    setStrokes((prev) => prev.slice(0, -1));
    return lastStroke;
  }, [strokes]);

  const clearStrokes = useCallback(() => {
    setStrokes([]);
  }, []);

  // Options setters
  const setColor = useCallback((color: string) => {
    setOptionsState((prev) => ({ ...prev, color }));
  }, []);

  const setWidth = useCallback((width: number) => {
    setOptionsState((prev) => ({ ...prev, width: Math.max(1, Math.min(100, width)) }));
  }, []);

  const setOpacity = useCallback((opacity: number) => {
    setOptionsState((prev) => ({ ...prev, opacity: Math.max(0, Math.min(1, opacity)) }));
  }, []);

  const setTool = useCallback((tool: DrawingTool) => {
    setOptionsState((prev) => ({ ...prev, tool }));
  }, []);

  const setSmoothing = useCallback((smoothing: number) => {
    setOptionsState((prev) => ({ ...prev, smoothing: Math.max(0, Math.min(1, smoothing)) }));
  }, []);

  const setOptions = useCallback((newOptions: Partial<DrawingOptions>) => {
    setOptionsState((prev) => ({ ...prev, ...newOptions }));
  }, []);

  // Canvas helpers
  const setCanvas = useCallback((canvas: HTMLCanvasElement | null) => {
    canvasRef.current = canvas;
  }, []);

  const getCanvasContext = useCallback(() => {
    return canvasRef.current?.getContext('2d') ?? null;
  }, []);

  // Render a single stroke to canvas
  const renderStroke = useCallback((stroke: DrawingStroke) => {
    const ctx = getCanvasContext();
    if (!ctx || stroke.points.length < 2) return;

    ctx.save();
    ctx.globalAlpha = stroke.opacity;
    ctx.strokeStyle = stroke.tool === 'eraser' ? '#FFFFFF' : stroke.color;
    ctx.lineWidth = stroke.width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Handle different tools
    if (stroke.tool === 'highlighter') {
      ctx.globalAlpha = stroke.opacity * 0.4;
      ctx.lineWidth = stroke.width * 2;
    } else if (stroke.tool === 'brush') {
      ctx.globalAlpha = stroke.opacity * 0.8;
    } else if (stroke.tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
    }

    ctx.beginPath();
    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);

    for (let i = 1; i < stroke.points.length; i++) {
      const point = stroke.points[i];
      ctx.lineTo(point.x, point.y);
    }

    ctx.stroke();
    ctx.restore();
  }, [getCanvasContext]);

  // Render all strokes to canvas
  const renderStrokes = useCallback(() => {
    const ctx = getCanvasContext();
    if (!ctx) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Render all saved strokes
    strokes.forEach(renderStroke);

    // Render current stroke being drawn
    if (currentStroke) {
      renderStroke(currentStroke);
    }
  }, [getCanvasContext, strokes, currentStroke, renderStroke]);

  return {
    // State
    isDrawing,
    currentStroke,
    strokes,
    options,

    // Actions
    startStroke,
    continueStroke,
    endStroke,
    cancelStroke,

    // Stroke management
    addStroke,
    removeStroke,
    undoLastStroke,
    clearStrokes,

    // Options
    setColor,
    setWidth,
    setOpacity,
    setTool,
    setSmoothing,
    setOptions,

    // Canvas helpers
    getCanvasContext,
    setCanvas,
    renderStrokes,
    renderStroke,
  };
}
