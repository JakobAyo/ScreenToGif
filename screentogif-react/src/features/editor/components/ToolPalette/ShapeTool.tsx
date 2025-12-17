/**
 * ShapeTool Component
 * Tool for adding shapes (rectangle, ellipse, line, arrow)
 */

import { useState } from 'react';
import { Icon } from '../../../../components/atoms/Icon';
import { Tooltip } from '../../../../components/molecules/Tooltip';
import { Slider } from '../../../../components/atoms/Slider';

export type ShapeType = 'rectangle' | 'ellipse' | 'line' | 'arrow';

export interface ShapeToolOptions {
  shapeType: ShapeType;
  strokeColor: string;
  strokeWidth: number;
  fillColor?: string;
  filled: boolean;
}

export interface ShapeToolProps {
  /** Whether this tool is currently active */
  isActive: boolean;
  /** Current shape options */
  options: ShapeToolOptions;
  /** Click handler to activate tool */
  onClick: () => void;
  /** Options change handler */
  onOptionsChange: (options: Partial<ShapeToolOptions>) => void;
  /** Additional class names */
  className?: string;
}

const SHAPE_TYPES: { type: ShapeType; icon: string; label: string }[] = [
  { type: 'rectangle', icon: 'square', label: 'Rectangle' },
  { type: 'ellipse', icon: 'circle', label: 'Ellipse' },
  { type: 'line', icon: 'minus', label: 'Line' },
  { type: 'arrow', icon: 'arrow-right', label: 'Arrow' },
];

const COLOR_PRESETS = [
  '#FF0000',
  '#FF8000',
  '#FFFF00',
  '#00FF00',
  '#00FFFF',
  '#0000FF',
  '#8000FF',
  '#FF00FF',
  '#000000',
  '#FFFFFF',
];

export function ShapeTool({
  isActive,
  options,
  onClick,
  onOptionsChange,
  className = '',
}: ShapeToolProps) {
  const [showOptions, setShowOptions] = useState(false);

  // Get icon for current shape
  const currentShapeIcon = SHAPE_TYPES.find((s) => s.type === options.shapeType)?.icon || 'square';

  return (
    <div className={`relative ${className}`}>
      <Tooltip content="Shape tool (U)" position="right">
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
          aria-label="Shape tool"
          aria-pressed={isActive}
        >
          <Icon name="square-2-stack" size="md" />
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
          {/* Shape type */}
          <div className="mb-3">
            <label className="block text-xs text-surface-400 mb-1.5">Shape</label>
            <div className="flex gap-1">
              {SHAPE_TYPES.map((shape) => (
                <Tooltip key={shape.type} content={shape.label}>
                  <button
                    onClick={() => onOptionsChange({ shapeType: shape.type })}
                    className={`
                      p-2 rounded
                      ${options.shapeType === shape.type
                        ? 'bg-primary-600/20 text-primary-400'
                        : 'text-surface-400 hover:bg-surface-700'
                      }
                    `}
                  >
                    {shape.type === 'rectangle' && (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2" />
                      </svg>
                    )}
                    {shape.type === 'ellipse' && (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <ellipse cx="12" cy="12" rx="9" ry="9" strokeWidth="2" />
                      </svg>
                    )}
                    {shape.type === 'line' && (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <line x1="4" y1="20" x2="20" y2="4" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    )}
                    {shape.type === 'arrow' && (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <line x1="4" y1="20" x2="20" y2="4" strokeWidth="2" strokeLinecap="round" />
                        <polyline points="14,4 20,4 20,10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                </Tooltip>
              ))}
            </div>
          </div>

          {/* Stroke color */}
          <div className="mb-3">
            <label className="block text-xs text-surface-400 mb-1.5">Stroke Color</label>
            <div className="flex flex-wrap gap-1 mb-2">
              {COLOR_PRESETS.map((color) => (
                <button
                  key={color}
                  onClick={() => onOptionsChange({ strokeColor: color })}
                  className={`
                    w-6 h-6 rounded border-2
                    ${options.strokeColor === color ? 'border-primary-500' : 'border-transparent'}
                  `}
                  style={{ backgroundColor: color }}
                  aria-label={`Color ${color}`}
                />
              ))}
            </div>
            <input
              type="color"
              value={options.strokeColor}
              onChange={(e) => onOptionsChange({ strokeColor: e.target.value })}
              className="w-full h-8 rounded cursor-pointer"
            />
          </div>

          {/* Stroke width */}
          <div className="mb-3">
            <label className="block text-xs text-surface-400 mb-1.5">
              Stroke Width: {options.strokeWidth}px
            </label>
            <Slider
              min={1}
              max={20}
              value={options.strokeWidth}
              onChange={(e) => onOptionsChange({ strokeWidth: Number(e.target.value) })}
              size="sm"
            />
          </div>

          {/* Fill option (not for lines/arrows) */}
          {(options.shapeType === 'rectangle' || options.shapeType === 'ellipse') && (
            <div>
              <label className="block text-xs text-surface-400 mb-1.5">Fill</label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={options.filled}
                  onChange={(e) =>
                    onOptionsChange({
                      filled: e.target.checked,
                      fillColor: e.target.checked ? options.fillColor || '#00000080' : undefined,
                    })
                  }
                  className="rounded"
                />
                {options.filled && (
                  <input
                    type="color"
                    value={options.fillColor || '#000000'}
                    onChange={(e) => onOptionsChange({ fillColor: e.target.value })}
                    className="flex-1 h-8 rounded cursor-pointer"
                  />
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
