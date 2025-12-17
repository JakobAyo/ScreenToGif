/**
 * BorderPanel Component
 * Controls for adding borders to frames
 */

import { useState, useCallback } from 'react';
import { Button } from '../../../../components/atoms/Button';
import { Slider } from '../../../../components/atoms/Slider';
import { NumberInput } from '../../../../components/molecules/NumberInput';

export interface BorderOptions {
  enabled: boolean;
  color: string;
  thickness: number;
  style: 'solid' | 'dashed' | 'dotted' | 'double';
  radius: number;
  position: 'inside' | 'outside' | 'center';
}

export interface BorderPanelProps {
  /** Current border options */
  options: BorderOptions;
  /** Options change handler */
  onOptionsChange: (options: BorderOptions) => void;
  /** Apply border to selected frames */
  onApply: () => void;
  /** Preview handler */
  onPreview?: () => void;
  /** Whether applying is in progress */
  isApplying?: boolean;
  className?: string;
}

const DEFAULT_OPTIONS: BorderOptions = {
  enabled: false,
  color: '#000000',
  thickness: 2,
  style: 'solid',
  radius: 0,
  position: 'inside',
};

const COLOR_PRESETS = [
  '#000000',
  '#FFFFFF',
  '#FF0000',
  '#00FF00',
  '#0000FF',
  '#FFFF00',
  '#FF00FF',
  '#00FFFF',
  '#808080',
  '#C0C0C0',
];

const BORDER_STYLES: { value: BorderOptions['style']; label: string }[] = [
  { value: 'solid', label: 'Solid' },
  { value: 'dashed', label: 'Dashed' },
  { value: 'dotted', label: 'Dotted' },
  { value: 'double', label: 'Double' },
];

const BORDER_POSITIONS: { value: BorderOptions['position']; label: string }[] = [
  { value: 'inside', label: 'Inside' },
  { value: 'center', label: 'Center' },
  { value: 'outside', label: 'Outside' },
];

export function BorderPanel({
  options = DEFAULT_OPTIONS,
  onOptionsChange,
  onApply,
  onPreview,
  isApplying = false,
  className = '',
}: BorderPanelProps) {
  // Update a single option
  const updateOption = useCallback(
    <K extends keyof BorderOptions>(key: K, value: BorderOptions[K]) => {
      onOptionsChange({ ...options, [key]: value });
    },
    [options, onOptionsChange]
  );

  return (
    <div className={`p-4 ${className}`}>
      <h3 className="text-sm font-medium text-surface-200 mb-4">Border Effect</h3>

      <div className="space-y-4">
        {/* Enable toggle */}
        <div className="flex items-center justify-between">
          <label className="text-sm text-surface-300">Enable Border</label>
          <button
            onClick={() => updateOption('enabled', !options.enabled)}
            className={`
              relative w-11 h-6 rounded-full transition-colors
              ${options.enabled ? 'bg-primary-600' : 'bg-surface-600'}
            `}
          >
            <span
              className={`
                absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform
                ${options.enabled ? 'translate-x-5' : 'translate-x-0'}
              `}
            />
          </button>
        </div>

        {/* Border color */}
        <div className={options.enabled ? '' : 'opacity-50 pointer-events-none'}>
          <label className="block text-xs text-surface-400 mb-1">Color</label>
          <div className="flex flex-wrap gap-1 mb-2">
            {COLOR_PRESETS.map((color) => (
              <button
                key={color}
                onClick={() => updateOption('color', color)}
                className={`
                  w-6 h-6 rounded border-2
                  ${options.color === color ? 'border-primary-500' : 'border-transparent hover:border-surface-500'}
                `}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <input
            type="color"
            value={options.color}
            onChange={(e) => updateOption('color', e.target.value)}
            className="w-full h-8 rounded cursor-pointer"
          />
        </div>

        {/* Thickness */}
        <div className={options.enabled ? '' : 'opacity-50 pointer-events-none'}>
          <label className="block text-xs text-surface-400 mb-1">
            Thickness: {options.thickness}px
          </label>
          <div className="flex gap-2">
            <Slider
              min={1}
              max={50}
              value={options.thickness}
              onChange={(e) => updateOption('thickness', Number(e.target.value))}
              size="sm"
              className="flex-1"
            />
            <NumberInput
              value={options.thickness}
              min={1}
              max={100}
              step={1}
              onChange={(value) => updateOption('thickness', value)}
              className="w-16"
            />
          </div>
        </div>

        {/* Border style */}
        <div className={options.enabled ? '' : 'opacity-50 pointer-events-none'}>
          <label className="block text-xs text-surface-400 mb-1">Style</label>
          <div className="grid grid-cols-2 gap-1">
            {BORDER_STYLES.map((style) => (
              <button
                key={style.value}
                onClick={() => updateOption('style', style.value)}
                className={`
                  px-3 py-1.5 text-xs rounded
                  ${options.style === style.value
                    ? 'bg-primary-600/20 text-primary-400 ring-1 ring-primary-500'
                    : 'bg-surface-700 text-surface-300 hover:bg-surface-600'
                  }
                `}
              >
                {style.label}
              </button>
            ))}
          </div>
        </div>

        {/* Border radius */}
        <div className={options.enabled ? '' : 'opacity-50 pointer-events-none'}>
          <label className="block text-xs text-surface-400 mb-1">
            Corner Radius: {options.radius}px
          </label>
          <Slider
            min={0}
            max={100}
            value={options.radius}
            onChange={(e) => updateOption('radius', Number(e.target.value))}
            size="sm"
          />
        </div>

        {/* Border position */}
        <div className={options.enabled ? '' : 'opacity-50 pointer-events-none'}>
          <label className="block text-xs text-surface-400 mb-1">Position</label>
          <div className="flex gap-1">
            {BORDER_POSITIONS.map((pos) => (
              <button
                key={pos.value}
                onClick={() => updateOption('position', pos.value)}
                className={`
                  flex-1 px-2 py-1.5 text-xs rounded
                  ${options.position === pos.value
                    ? 'bg-primary-600/20 text-primary-400 ring-1 ring-primary-500'
                    : 'bg-surface-700 text-surface-300 hover:bg-surface-600'
                  }
                `}
              >
                {pos.label}
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="p-4 rounded-lg bg-surface-700/50 border border-surface-600">
          <div
            className="w-full h-16 bg-surface-600"
            style={{
              borderWidth: options.enabled ? options.thickness : 0,
              borderColor: options.color,
              borderStyle: options.style,
              borderRadius: options.radius,
            }}
          />
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 pt-2">
          {onPreview && (
            <Button variant="secondary" size="sm" onClick={onPreview} className="flex-1">
              Preview
            </Button>
          )}
          <Button
            variant="primary"
            size="sm"
            onClick={onApply}
            isLoading={isApplying}
            disabled={!options.enabled}
            className="flex-1"
          >
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
}
