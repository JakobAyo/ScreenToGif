/**
 * DrawTool Component
 * Tool for freehand drawing with brush options
 */

import { useState } from 'react';
import { Icon } from '../../../../components/atoms/Icon';
import { Tooltip } from '../../../../components/molecules/Tooltip';
import { Slider } from '../../../../components/atoms/Slider';
import type { DrawingTool, DrawingOptions } from '../../hooks/useDrawing';

export interface DrawToolProps {
  /** Whether this tool is currently active */
  isActive: boolean;
  /** Current drawing options */
  options: DrawingOptions;
  /** Click handler to activate tool */
  onClick: () => void;
  /** Options change handler */
  onOptionsChange: (options: Partial<DrawingOptions>) => void;
  /** Additional class names */
  className?: string;
}

const BRUSH_PRESETS: { type: DrawingTool; icon: string; label: string }[] = [
  { type: 'pen', icon: 'pencil', label: 'Pen' },
  { type: 'brush', icon: 'paint-brush', label: 'Brush' },
  { type: 'highlighter', icon: 'highlighter', label: 'Highlighter' },
  { type: 'eraser', icon: 'eraser', label: 'Eraser' },
];

const COLOR_PRESETS = [
  '#FF0000', // Red
  '#FF8000', // Orange
  '#FFFF00', // Yellow
  '#00FF00', // Green
  '#00FFFF', // Cyan
  '#0000FF', // Blue
  '#8000FF', // Purple
  '#FF00FF', // Magenta
  '#000000', // Black
  '#FFFFFF', // White
];

export function DrawTool({
  isActive,
  options,
  onClick,
  onOptionsChange,
  className = '',
}: DrawToolProps) {
  const [showOptions, setShowOptions] = useState(false);

  return (
    <div className={`relative ${className}`}>
      <Tooltip content="Draw tool (B)" position="right">
        <button
          onClick={() => {
            onClick();
            if (isActive) {
              setShowOptions(!showOptions);
            }
          }}
          className={`
            flex items-center justify-center
            w-10 h-10 rounded-lg
            transition-colors duration-150
            ${isActive
              ? 'bg-primary-600/20 text-primary-400 ring-1 ring-primary-500'
              : 'text-surface-400 hover:text-surface-200 hover:bg-surface-700'
            }
          `}
          aria-label="Draw tool"
          aria-pressed={isActive}
        >
          <Icon name="paint-brush" size="md" />
        </button>
      </Tooltip>

      {/* Options panel */}
      {isActive && showOptions && (
        <div
          className="
            absolute left-12 top-0 z-50
            w-56 p-3
            bg-surface-800 rounded-lg
            border border-surface-700
            shadow-xl
          "
        >
          {/* Brush type */}
          <div className="mb-3">
            <label className="block text-xs text-surface-400 mb-1.5">Brush Type</label>
            <div className="flex gap-1">
              {BRUSH_PRESETS.map((preset) => (
                <Tooltip key={preset.type} content={preset.label}>
                  <button
                    onClick={() => onOptionsChange({ tool: preset.type })}
                    className={`
                      p-2 rounded
                      ${options.tool === preset.type
                        ? 'bg-primary-600/20 text-primary-400'
                        : 'text-surface-400 hover:bg-surface-700'
                      }
                    `}
                  >
                    <Icon name={preset.icon as 'pencil' | 'paint-brush'} size="sm" />
                  </button>
                </Tooltip>
              ))}
            </div>
          </div>

          {/* Color picker */}
          <div className="mb-3">
            <label className="block text-xs text-surface-400 mb-1.5">Color</label>
            <div className="flex flex-wrap gap-1 mb-2">
              {COLOR_PRESETS.map((color) => (
                <button
                  key={color}
                  onClick={() => onOptionsChange({ color })}
                  className={`
                    w-6 h-6 rounded border-2
                    ${options.color === color ? 'border-primary-500' : 'border-transparent'}
                  `}
                  style={{ backgroundColor: color }}
                  aria-label={`Color ${color}`}
                />
              ))}
            </div>
            <input
              type="color"
              value={options.color}
              onChange={(e) => onOptionsChange({ color: e.target.value })}
              className="w-full h-8 rounded cursor-pointer"
            />
          </div>

          {/* Brush size */}
          <div className="mb-3">
            <label className="block text-xs text-surface-400 mb-1.5">
              Size: {options.width}px
            </label>
            <Slider
              min={1}
              max={50}
              value={options.width}
              onChange={(e) => onOptionsChange({ width: Number(e.target.value) })}
              size="sm"
            />
          </div>

          {/* Opacity */}
          <div className="mb-3">
            <label className="block text-xs text-surface-400 mb-1.5">
              Opacity: {Math.round(options.opacity * 100)}%
            </label>
            <Slider
              min={0}
              max={100}
              value={options.opacity * 100}
              onChange={(e) => onOptionsChange({ opacity: Number(e.target.value) / 100 })}
              size="sm"
            />
          </div>

          {/* Smoothing */}
          <div>
            <label className="block text-xs text-surface-400 mb-1.5">
              Smoothing: {Math.round(options.smoothing * 100)}%
            </label>
            <Slider
              min={0}
              max={100}
              value={options.smoothing * 100}
              onChange={(e) => onOptionsChange({ smoothing: Number(e.target.value) / 100 })}
              size="sm"
            />
          </div>
        </div>
      )}
    </div>
  );
}
