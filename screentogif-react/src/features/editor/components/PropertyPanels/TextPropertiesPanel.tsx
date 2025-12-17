/**
 * TextPropertiesPanel Component
 * Properties editor for text overlays (font, size, color, style)
 */

import { useCallback } from 'react';
import { Icon } from '../../../../components/atoms/Icon';
import { Slider } from '../../../../components/atoms/Slider';
import { NumberInput } from '../../../../components/molecules/NumberInput';
import type { TextOverlay } from '../Canvas/OverlayLayer';

export interface TextPropertiesPanelProps {
  /** Selected text overlay */
  selectedText: TextOverlay | null;
  /** Text update handler */
  onTextUpdate?: (overlay: TextOverlay) => void;
  /** Delete handler */
  onDelete?: () => void;
  className?: string;
}

const FONT_FAMILIES = [
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Georgia',
  'Verdana',
  'Tahoma',
  'Trebuchet MS',
  'Courier New',
  'Monaco',
  'Comic Sans MS',
  'Impact',
  'Palatino Linotype',
  'Lucida Console',
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
  '#FF8000',
  '#8000FF',
];

export function TextPropertiesPanel({
  selectedText,
  onTextUpdate,
  onDelete,
  className = '',
}: TextPropertiesPanelProps) {
  // Update a single property
  const updateProperty = useCallback(
    <K extends keyof TextOverlay>(key: K, value: TextOverlay[K]) => {
      if (!selectedText) return;
      onTextUpdate?.({ ...selectedText, [key]: value });
    },
    [selectedText, onTextUpdate]
  );

  // No text selected
  if (!selectedText) {
    return (
      <div className={`p-4 ${className}`}>
        <h3 className="text-sm font-medium text-surface-200 mb-4">Text Properties</h3>
        <p className="text-sm text-surface-500">Select a text overlay to edit</p>
      </div>
    );
  }

  return (
    <div className={`p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-surface-200">Text Properties</h3>
        <button
          onClick={onDelete}
          className="p-1 text-surface-400 hover:text-accent-error hover:bg-surface-700 rounded"
          title="Delete text"
        >
          <Icon name="trash" size="sm" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Text content */}
        <div>
          <label className="block text-xs text-surface-400 mb-1">Text Content</label>
          <textarea
            value={selectedText.text}
            onChange={(e) => updateProperty('text', e.target.value)}
            className="
              w-full px-3 py-2
              bg-surface-700 text-surface-100
              border border-surface-600 rounded-lg
              text-sm resize-none
              focus:outline-none focus:border-primary-500
            "
            rows={3}
            placeholder="Enter text..."
          />
        </div>

        {/* Font family */}
        <div>
          <label className="block text-xs text-surface-400 mb-1">Font Family</label>
          <select
            value={selectedText.fontFamily}
            onChange={(e) => updateProperty('fontFamily', e.target.value)}
            className="
              w-full px-3 py-2
              bg-surface-700 text-surface-200
              border border-surface-600 rounded-lg
              text-sm
              focus:outline-none focus:border-primary-500
            "
          >
            {FONT_FAMILIES.map((font) => (
              <option key={font} value={font} style={{ fontFamily: font }}>
                {font}
              </option>
            ))}
          </select>
        </div>

        {/* Font size */}
        <div>
          <label className="block text-xs text-surface-400 mb-1">
            Font Size: {selectedText.fontSize}px
          </label>
          <div className="flex gap-2">
            <Slider
              min={8}
              max={200}
              value={selectedText.fontSize}
              onChange={(e) => updateProperty('fontSize', Number(e.target.value))}
              size="sm"
              className="flex-1"
            />
            <NumberInput
              value={selectedText.fontSize}
              min={8}
              max={200}
              step={1}
              onChange={(value) => updateProperty('fontSize', value)}
              className="w-20"
            />
          </div>
        </div>

        {/* Text style */}
        <div>
          <label className="block text-xs text-surface-400 mb-1">Style</label>
          <div className="flex gap-1">
            <button
              onClick={() => updateProperty('bold', !selectedText.bold)}
              className={`
                px-3 py-1.5 rounded font-bold text-sm
                ${selectedText.bold
                  ? 'bg-primary-600/20 text-primary-400 ring-1 ring-primary-500'
                  : 'bg-surface-700 text-surface-400 hover:bg-surface-600'
                }
              `}
            >
              B
            </button>
            <button
              onClick={() => updateProperty('italic', !selectedText.italic)}
              className={`
                px-3 py-1.5 rounded italic text-sm
                ${selectedText.italic
                  ? 'bg-primary-600/20 text-primary-400 ring-1 ring-primary-500'
                  : 'bg-surface-700 text-surface-400 hover:bg-surface-600'
                }
              `}
            >
              I
            </button>
            <button
              onClick={() => updateProperty('underline', !selectedText.underline)}
              className={`
                px-3 py-1.5 rounded underline text-sm
                ${selectedText.underline
                  ? 'bg-primary-600/20 text-primary-400 ring-1 ring-primary-500'
                  : 'bg-surface-700 text-surface-400 hover:bg-surface-600'
                }
              `}
            >
              U
            </button>
          </div>
        </div>

        {/* Text color */}
        <div>
          <label className="block text-xs text-surface-400 mb-1">Text Color</label>
          <div className="flex flex-wrap gap-1 mb-2">
            {COLOR_PRESETS.map((color) => (
              <button
                key={color}
                onClick={() => updateProperty('color', color)}
                className={`
                  w-6 h-6 rounded border-2
                  ${selectedText.color === color ? 'border-primary-500' : 'border-transparent hover:border-surface-500'}
                `}
                style={{ backgroundColor: color }}
                aria-label={`Color ${color}`}
              />
            ))}
          </div>
          <input
            type="color"
            value={selectedText.color}
            onChange={(e) => updateProperty('color', e.target.value)}
            className="w-full h-8 rounded cursor-pointer"
          />
        </div>

        {/* Background color */}
        <div>
          <label className="block text-xs text-surface-400 mb-1">Background</label>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={!!selectedText.backgroundColor}
              onChange={(e) =>
                updateProperty('backgroundColor', e.target.checked ? '#000000' : undefined)
              }
              className="rounded"
            />
            <span className="text-xs text-surface-400">Enable</span>
          </div>
          {selectedText.backgroundColor && (
            <input
              type="color"
              value={selectedText.backgroundColor}
              onChange={(e) => updateProperty('backgroundColor', e.target.value)}
              className="w-full h-8 rounded cursor-pointer mt-2"
            />
          )}
        </div>

        {/* Position */}
        <div>
          <label className="block text-xs text-surface-400 mb-1">Position</label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-surface-500">X</label>
              <NumberInput
                value={Math.round(selectedText.x)}
                min={0}
                step={1}
                onChange={(value) => updateProperty('x', value)}
              />
            </div>
            <div>
              <label className="text-[10px] text-surface-500">Y</label>
              <NumberInput
                value={Math.round(selectedText.y)}
                min={0}
                step={1}
                onChange={(value) => updateProperty('y', value)}
              />
            </div>
          </div>
        </div>

        {/* Rotation */}
        <div>
          <label className="block text-xs text-surface-400 mb-1">
            Rotation: {selectedText.rotation ?? 0}°
          </label>
          <Slider
            min={-180}
            max={180}
            value={selectedText.rotation ?? 0}
            onChange={(e) => updateProperty('rotation', Number(e.target.value))}
            size="sm"
          />
        </div>
      </div>
    </div>
  );
}
