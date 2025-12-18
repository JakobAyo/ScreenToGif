/**
 * TextTool Component
 * Tool for adding text overlays
 */

import { useState } from 'react';
import { Icon } from '../../../../components/atoms/Icon';
import { Tooltip } from '../../../../components/molecules/Tooltip';
import { Slider } from '../../../../components/atoms/Slider';

export interface TextToolOptions {
  fontSize: number;
  fontFamily: string;
  color: string;
  backgroundColor?: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
}

export interface TextToolProps {
  /** Whether this tool is currently active */
  isActive: boolean;
  /** Current text options */
  options: TextToolOptions;
  /** Click handler to activate tool */
  onClick: () => void;
  /** Options change handler */
  onOptionsChange: (options: Partial<TextToolOptions>) => void;
  /** Additional class names */
  className?: string;
}

const FONT_PRESETS = [
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Georgia',
  'Verdana',
  'Courier New',
  'Comic Sans MS',
  'Impact',
];

const COLOR_PRESETS = [
  '#FFFFFF',
  '#000000',
  '#FF0000',
  '#00FF00',
  '#0000FF',
  '#FFFF00',
  '#FF00FF',
  '#00FFFF',
];

export function TextTool({
  isActive,
  options,
  onClick,
  onOptionsChange,
  className = '',
}: TextToolProps) {
  const [showOptions, setShowOptions] = useState(false);

  return (
    <div className={`relative ${className}`}>
      <Tooltip content="Text tool (T)" position="right">
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
          aria-label="Text tool"
          aria-pressed={isActive}
        >
          <Icon name="type" size="md" />
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
          {/* Font family */}
          <div className="mb-3">
            <label className="block text-xs text-surface-400 mb-1.5">Font Family</label>
            <select
              value={options.fontFamily}
              onChange={(e) => onOptionsChange({ fontFamily: e.target.value })}
              className="
                w-full px-2 py-1.5
                bg-surface-700 text-surface-200
                border border-surface-600 rounded
                text-sm
                focus:outline-none focus:border-primary-500
              "
            >
              {FONT_PRESETS.map((font) => (
                <option key={font} value={font} style={{ fontFamily: font }}>
                  {font}
                </option>
              ))}
            </select>
          </div>

          {/* Font size */}
          <div className="mb-3">
            <label className="block text-xs text-surface-400 mb-1.5">
              Font Size: {options.fontSize}px
            </label>
            <Slider
              min={8}
              max={128}
              value={options.fontSize}
              onChange={(e) => onOptionsChange({ fontSize: Number(e.target.value) })}
              size="sm"
            />
          </div>

          {/* Font style buttons */}
          <div className="mb-3">
            <label className="block text-xs text-surface-400 mb-1.5">Style</label>
            <div className="flex gap-1">
              <button
                onClick={() => onOptionsChange({ bold: !options.bold })}
                className={`
                  p-2 rounded font-bold
                  ${options.bold
                    ? 'bg-primary-600/20 text-primary-400'
                    : 'text-surface-400 hover:bg-surface-700'
                  }
                `}
              >
                B
              </button>
              <button
                onClick={() => onOptionsChange({ italic: !options.italic })}
                className={`
                  p-2 rounded italic
                  ${options.italic
                    ? 'bg-primary-600/20 text-primary-400'
                    : 'text-surface-400 hover:bg-surface-700'
                  }
                `}
              >
                I
              </button>
              <button
                onClick={() => onOptionsChange({ underline: !options.underline })}
                className={`
                  p-2 rounded underline
                  ${options.underline
                    ? 'bg-primary-600/20 text-primary-400'
                    : 'text-surface-400 hover:bg-surface-700'
                  }
                `}
              >
                U
              </button>
            </div>
          </div>

          {/* Text color */}
          <div className="mb-3">
            <label className="block text-xs text-surface-400 mb-1.5">Text Color</label>
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

          {/* Background color */}
          <div>
            <label className="block text-xs text-surface-400 mb-1.5">Background</label>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!options.backgroundColor}
                onChange={(e) =>
                  onOptionsChange({
                    backgroundColor: e.target.checked ? '#000000' : undefined,
                  })
                }
                className="rounded"
              />
              {options.backgroundColor && (
                <input
                  type="color"
                  value={options.backgroundColor}
                  onChange={(e) => onOptionsChange({ backgroundColor: e.target.value })}
                  className="w-full h-8 rounded cursor-pointer"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
