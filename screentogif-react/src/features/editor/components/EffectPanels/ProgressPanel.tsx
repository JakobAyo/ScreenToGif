/**
 * ProgressPanel Component
 * Controls for adding progress bar overlay to frames
 */

import { useCallback } from 'react';
import { Button } from '../../../../components/atoms/Button';
import { Slider } from '../../../../components/atoms/Slider';
import { NumberInput } from '../../../../components/molecules/NumberInput';

export interface ProgressOptions {
  enabled: boolean;
  type: 'bar' | 'circle' | 'text';
  position: 'top' | 'bottom' | 'left' | 'right';
  color: string;
  backgroundColor: string;
  thickness: number;
  padding: number;
  showPercentage: boolean;
  fontColor: string;
  fontSize: number;
}

export interface ProgressPanelProps {
  /** Current progress options */
  options: ProgressOptions;
  /** Options change handler */
  onOptionsChange: (options: ProgressOptions) => void;
  /** Apply progress to frames */
  onApply: () => void;
  /** Preview handler */
  onPreview?: () => void;
  /** Whether applying is in progress */
  isApplying?: boolean;
  className?: string;
}

const DEFAULT_OPTIONS: ProgressOptions = {
  enabled: false,
  type: 'bar',
  position: 'bottom',
  color: '#3B82F6',
  backgroundColor: '#1F2937',
  thickness: 4,
  padding: 0,
  showPercentage: false,
  fontColor: '#FFFFFF',
  fontSize: 12,
};

const PROGRESS_TYPES: { value: ProgressOptions['type']; label: string }[] = [
  { value: 'bar', label: 'Bar' },
  { value: 'circle', label: 'Circle' },
  { value: 'text', label: 'Text Only' },
];

const POSITIONS: { value: ProgressOptions['position']; label: string }[] = [
  { value: 'top', label: 'Top' },
  { value: 'bottom', label: 'Bottom' },
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
];

const COLOR_PRESETS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#FFFFFF', // White
  '#000000', // Black
];

export function ProgressPanel({
  options = DEFAULT_OPTIONS,
  onOptionsChange,
  onApply,
  onPreview,
  isApplying = false,
  className = '',
}: ProgressPanelProps) {
  // Update a single option
  const updateOption = useCallback(
    <K extends keyof ProgressOptions>(key: K, value: ProgressOptions[K]) => {
      onOptionsChange({ ...options, [key]: value });
    },
    [options, onOptionsChange]
  );

  return (
    <div className={`p-4 ${className}`}>
      <h3 className="text-sm font-medium text-surface-200 mb-4">Progress Indicator</h3>

      <div className="space-y-4">
        {/* Enable toggle */}
        <div className="flex items-center justify-between">
          <label className="text-sm text-surface-300">Enable Progress</label>
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

        {/* Progress type */}
        <div className={options.enabled ? '' : 'opacity-50 pointer-events-none'}>
          <label className="block text-xs text-surface-400 mb-1">Type</label>
          <div className="flex gap-1">
            {PROGRESS_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => updateOption('type', type.value)}
                className={`
                  flex-1 px-2 py-1.5 text-xs rounded
                  ${options.type === type.value
                    ? 'bg-primary-600/20 text-primary-400 ring-1 ring-primary-500'
                    : 'bg-surface-700 text-surface-300 hover:bg-surface-600'
                  }
                `}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Position (only for bar type) */}
        {options.type === 'bar' && (
          <div className={options.enabled ? '' : 'opacity-50 pointer-events-none'}>
            <label className="block text-xs text-surface-400 mb-1">Position</label>
            <div className="grid grid-cols-2 gap-1">
              {POSITIONS.map((pos) => (
                <button
                  key={pos.value}
                  onClick={() => updateOption('position', pos.value)}
                  className={`
                    px-2 py-1.5 text-xs rounded
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
        )}

        {/* Progress color */}
        <div className={options.enabled ? '' : 'opacity-50 pointer-events-none'}>
          <label className="block text-xs text-surface-400 mb-1">Progress Color</label>
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

        {/* Background color */}
        <div className={options.enabled ? '' : 'opacity-50 pointer-events-none'}>
          <label className="block text-xs text-surface-400 mb-1">Background Color</label>
          <input
            type="color"
            value={options.backgroundColor}
            onChange={(e) => updateOption('backgroundColor', e.target.value)}
            className="w-full h-8 rounded cursor-pointer"
          />
        </div>

        {/* Thickness (for bar type) */}
        {options.type === 'bar' && (
          <div className={options.enabled ? '' : 'opacity-50 pointer-events-none'}>
            <label className="block text-xs text-surface-400 mb-1">
              Thickness: {options.thickness}px
            </label>
            <Slider
              min={2}
              max={20}
              value={options.thickness}
              onChange={(e) => updateOption('thickness', Number(e.target.value))}
              size="sm"
            />
          </div>
        )}

        {/* Padding */}
        <div className={options.enabled ? '' : 'opacity-50 pointer-events-none'}>
          <label className="block text-xs text-surface-400 mb-1">
            Padding: {options.padding}px
          </label>
          <Slider
            min={0}
            max={20}
            value={options.padding}
            onChange={(e) => updateOption('padding', Number(e.target.value))}
            size="sm"
          />
        </div>

        {/* Show percentage toggle */}
        <div className={`flex items-center gap-2 ${options.enabled ? '' : 'opacity-50 pointer-events-none'}`}>
          <input
            type="checkbox"
            checked={options.showPercentage}
            onChange={(e) => updateOption('showPercentage', e.target.checked)}
            className="rounded"
          />
          <label className="text-sm text-surface-300">Show percentage text</label>
        </div>

        {/* Font options (when showing percentage) */}
        {options.showPercentage && (
          <div className={options.enabled ? '' : 'opacity-50 pointer-events-none'}>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-surface-400 mb-1">Font Color</label>
                <input
                  type="color"
                  value={options.fontColor}
                  onChange={(e) => updateOption('fontColor', e.target.value)}
                  className="w-full h-8 rounded cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-xs text-surface-400 mb-1">Font Size</label>
                <NumberInput
                  value={options.fontSize}
                  min={8}
                  max={48}
                  step={1}
                  onChange={(value) => updateOption('fontSize', value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Preview */}
        <div className="p-4 rounded-lg bg-surface-700/50 border border-surface-600">
          <div className="relative w-full h-12 bg-surface-600 rounded overflow-hidden">
            {options.enabled && options.type === 'bar' && (
              <div
                className={`absolute ${
                  options.position === 'top' ? 'top-0 left-0 right-0' :
                  options.position === 'bottom' ? 'bottom-0 left-0 right-0' :
                  options.position === 'left' ? 'top-0 bottom-0 left-0' :
                  'top-0 bottom-0 right-0'
                }`}
                style={{
                  backgroundColor: options.backgroundColor,
                  height: options.position === 'top' || options.position === 'bottom' ? options.thickness : '100%',
                  width: options.position === 'left' || options.position === 'right' ? options.thickness : '100%',
                  margin: options.padding,
                }}
              >
                <div
                  className={
                    options.position === 'top' || options.position === 'bottom'
                      ? 'h-full'
                      : 'w-full'
                  }
                  style={{
                    backgroundColor: options.color,
                    width: options.position === 'top' || options.position === 'bottom' ? '50%' : '100%',
                    height: options.position === 'left' || options.position === 'right' ? '50%' : '100%',
                  }}
                />
              </div>
            )}
            {options.showPercentage && (
              <div
                className="absolute inset-0 flex items-center justify-center text-xs font-mono"
                style={{ color: options.fontColor, fontSize: options.fontSize }}
              >
                50%
              </div>
            )}
          </div>
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
