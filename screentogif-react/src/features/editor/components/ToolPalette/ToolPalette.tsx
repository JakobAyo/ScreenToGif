/**
 * ToolPalette Component
 * Vertical toolbar containing all editing tools
 */

import { useCallback, useEffect, useState } from 'react';
import type { EditorTool } from '../../../../stores/editorStore';
import { Icon } from '../../../../components/atoms/Icon';
import { Tooltip } from '../../../../components/molecules/Tooltip';
import { SelectTool } from './SelectTool';
import { DrawTool } from './DrawTool';
import { TextTool, type TextToolOptions } from './TextTool';
import { ShapeTool, type ShapeToolOptions } from './ShapeTool';
import type { DrawingOptions } from '../../hooks/useDrawing';

export interface ToolPaletteProps {
  /** Currently selected tool */
  currentTool: EditorTool;
  /** Tool change handler */
  onToolChange: (tool: EditorTool) => void;
  /** Drawing options */
  drawingOptions?: DrawingOptions;
  /** Drawing options change handler */
  onDrawingOptionsChange?: (options: Partial<DrawingOptions>) => void;
  /** Text options */
  textOptions?: TextToolOptions;
  /** Text options change handler */
  onTextOptionsChange?: (options: Partial<TextToolOptions>) => void;
  /** Shape options */
  shapeOptions?: ShapeToolOptions;
  /** Shape options change handler */
  onShapeOptionsChange?: (options: Partial<ShapeToolOptions>) => void;
  /** Whether the palette is collapsed */
  isCollapsed?: boolean;
  /** Toggle collapse handler */
  onToggleCollapse?: () => void;
  /** Additional class names */
  className?: string;
}

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

// Tool groups for organization
interface ToolItem {
  id: EditorTool;
  icon: string;
  label: string;
  shortcut: string;
}

const BASIC_TOOLS: ToolItem[] = [
  { id: 'crop', icon: 'scissors', label: 'Crop', shortcut: 'C' },
  { id: 'resize', icon: 'arrows-pointing-out', label: 'Resize', shortcut: 'R' },
  { id: 'flip', icon: 'arrows-right-left', label: 'Flip', shortcut: 'F' },
  { id: 'rotate', icon: 'arrow-path', label: 'Rotate', shortcut: 'O' },
];

const EFFECT_TOOLS: ToolItem[] = [
  { id: 'blur', icon: 'eye-slash', label: 'Blur/Pixelate', shortcut: 'L' },
  { id: 'watermark', icon: 'photo', label: 'Watermark', shortcut: 'W' },
  { id: 'border', icon: 'square-2-stack', label: 'Border', shortcut: 'D' },
  { id: 'shadow', icon: 'sun', label: 'Shadow', shortcut: 'H' },
];

const OVERLAY_TOOLS: ToolItem[] = [
  { id: 'keystrokes', icon: 'command-line', label: 'Key Strokes', shortcut: 'K' },
  { id: 'cursor', icon: 'cursor-arrow-ripple', label: 'Mouse Clicks', shortcut: 'M' },
  { id: 'progress', icon: 'chart-bar', label: 'Progress', shortcut: 'P' },
];

export function ToolPalette({
  currentTool,
  onToolChange,
  drawingOptions = defaultDrawingOptions,
  onDrawingOptionsChange,
  textOptions = defaultTextOptions,
  onTextOptionsChange,
  shapeOptions = defaultShapeOptions,
  onShapeOptionsChange,
  isCollapsed = false,
  onToggleCollapse,
  className = '',
}: ToolPaletteProps) {
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const key = e.key.toUpperCase();

      // Basic shortcuts
      if (key === 'V') onToolChange('select');
      else if (key === 'B') onToolChange('drawing');
      else if (key === 'T') onToolChange('text');
      else if (key === 'U') onToolChange('shapes');
      else if (key === 'C' && !e.ctrlKey) onToolChange('crop');
      else if (key === 'R' && !e.ctrlKey) onToolChange('resize');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onToolChange]);

  // Render a tool button
  const renderToolButton = (tool: ToolItem) => (
    <Tooltip key={tool.id} content={`${tool.label} (${tool.shortcut})`} position="right">
      <button
        onClick={() => onToolChange(tool.id)}
        className={`
          flex items-center justify-center
          w-10 h-10 rounded-lg
          transition-colors duration-150
          ${currentTool === tool.id
            ? 'bg-primary-600/20 text-primary-400 ring-1 ring-primary-500'
            : 'text-surface-400 hover:text-surface-200 hover:bg-surface-700'
          }
        `}
        aria-label={tool.label}
        aria-pressed={currentTool === tool.id}
      >
        <Icon name={tool.icon as 'scissors'} size="md" />
      </button>
    </Tooltip>
  );

  // Collapsed state
  if (isCollapsed) {
    return (
      <div
        className={`
          flex flex-col items-center
          w-10 py-2
          bg-surface-800 border-r border-surface-700
          ${className}
        `}
      >
        <Tooltip content="Expand toolbar" position="right">
          <button
            onClick={onToggleCollapse}
            className="p-2 text-surface-400 hover:text-surface-200 hover:bg-surface-700 rounded"
          >
            <Icon name="chevron-right" size="sm" />
          </button>
        </Tooltip>
      </div>
    );
  }

  return (
    <div
      className={`
        flex flex-col
        w-12 py-2
        bg-surface-800 border-r border-surface-700
        ${className}
      `}
    >
      {/* Collapse button */}
      {onToggleCollapse && (
        <div className="px-1 mb-2">
          <Tooltip content="Collapse toolbar" position="right">
            <button
              onClick={onToggleCollapse}
              className="p-1 text-surface-500 hover:text-surface-300 hover:bg-surface-700 rounded"
            >
              <Icon name="chevron-left" size="sm" />
            </button>
          </Tooltip>
        </div>
      )}

      {/* Selection tool */}
      <div className="px-1 mb-1">
        <SelectTool
          isActive={currentTool === 'select'}
          onClick={() => onToolChange('select')}
        />
      </div>

      {/* Divider */}
      <div className="h-px bg-surface-700 mx-2 my-2" />

      {/* Drawing tools */}
      <div className="px-1 space-y-1">
        <DrawTool
          isActive={currentTool === 'drawing'}
          options={drawingOptions}
          onClick={() => onToolChange('drawing')}
          onOptionsChange={onDrawingOptionsChange || (() => {})}
        />
        <TextTool
          isActive={currentTool === 'text'}
          options={textOptions}
          onClick={() => onToolChange('text')}
          onOptionsChange={onTextOptionsChange || (() => {})}
        />
        <ShapeTool
          isActive={currentTool === 'shapes'}
          options={shapeOptions}
          onClick={() => onToolChange('shapes')}
          onOptionsChange={onShapeOptionsChange || (() => {})}
        />
      </div>

      {/* Divider */}
      <div className="h-px bg-surface-700 mx-2 my-2" />

      {/* Basic tools */}
      <div className="px-1 space-y-1">
        {BASIC_TOOLS.map(renderToolButton)}
      </div>

      {/* Divider */}
      <div className="h-px bg-surface-700 mx-2 my-2" />

      {/* Effect tools */}
      <div className="px-1 space-y-1">
        {EFFECT_TOOLS.map(renderToolButton)}
      </div>

      {/* Divider */}
      <div className="h-px bg-surface-700 mx-2 my-2" />

      {/* Overlay tools */}
      <div className="px-1 space-y-1">
        {OVERLAY_TOOLS.map(renderToolButton)}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Current tool indicator */}
      <div className="px-2 mt-2">
        <div className="text-[10px] text-surface-500 text-center capitalize">
          {currentTool}
        </div>
      </div>
    </div>
  );
}
