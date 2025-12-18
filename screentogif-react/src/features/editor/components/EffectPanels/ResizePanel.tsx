/**
 * ResizePanel Component
 * Controls for resizing frames
 */

import { useState, useCallback, useMemo } from 'react';
import { Button } from '../../../../components/atoms/Button';
import { NumberInput } from '../../../../components/molecules/NumberInput';

export interface ResizeOptions {
  width: number;
  height: number;
  maintainAspectRatio: boolean;
  resampleMethod: 'nearest' | 'bilinear' | 'bicubic' | 'lanczos';
  scalePercentage: number;
}

export interface ResizePanelProps {
  /** Current frame dimensions */
  currentWidth: number;
  currentHeight: number;
  /** Current resize options */
  options: ResizeOptions;
  /** Options change handler */
  onOptionsChange: (options: ResizeOptions) => void;
  /** Apply resize to selected frames */
  onApply: () => void;
  /** Whether applying is in progress */
  isApplying?: boolean;
  className?: string;
}

const RESAMPLE_METHODS: { value: ResizeOptions['resampleMethod']; label: string; desc: string }[] = [
  { value: 'nearest', label: 'Nearest', desc: 'Fast, sharp edges' },
  { value: 'bilinear', label: 'Bilinear', desc: 'Good quality' },
  { value: 'bicubic', label: 'Bicubic', desc: 'High quality' },
  { value: 'lanczos', label: 'Lanczos', desc: 'Best quality' },
];

const PRESET_SIZES = [
  { label: '1080p', width: 1920, height: 1080 },
  { label: '720p', width: 1280, height: 720 },
  { label: '480p', width: 854, height: 480 },
  { label: 'Square', width: 512, height: 512 },
  { label: 'Twitter', width: 1280, height: 720 },
  { label: 'Instagram', width: 1080, height: 1080 },
];

const SCALE_PRESETS = [25, 50, 75, 100, 125, 150, 200];

export function ResizePanel({
  currentWidth,
  currentHeight,
  options,
  onOptionsChange,
  onApply,
  isApplying = false,
  className = '',
}: ResizePanelProps) {
  const [inputMode, setInputMode] = useState<'pixels' | 'percentage'>('pixels');

  // Calculate aspect ratio
  const aspectRatio = useMemo(() => {
    return currentWidth / currentHeight;
  }, [currentWidth, currentHeight]);

  // Update a single option
  const updateOption = useCallback(
    <K extends keyof ResizeOptions>(key: K, value: ResizeOptions[K]) => {
      const newOptions = { ...options, [key]: value };

      // Handle aspect ratio lock
      if (options.maintainAspectRatio && (key === 'width' || key === 'height')) {
        if (key === 'width') {
          newOptions.height = Math.round((value as number) / aspectRatio);
        } else {
          newOptions.width = Math.round((value as number) * aspectRatio);
        }
      }

      // Update percentage if dimensions change
      if (key === 'width' || key === 'height') {
        newOptions.scalePercentage = Math.round((newOptions.width / currentWidth) * 100);
      }

      onOptionsChange(newOptions);
    },
    [options, onOptionsChange, aspectRatio, currentWidth]
  );

  // Handle percentage change
  const handlePercentageChange = useCallback(
    (percentage: number) => {
      const newWidth = Math.round((currentWidth * percentage) / 100);
      const newHeight = Math.round((currentHeight * percentage) / 100);
      onOptionsChange({
        ...options,
        width: newWidth,
        height: newHeight,
        scalePercentage: percentage,
      });
    },
    [currentWidth, currentHeight, options, onOptionsChange]
  );

  // Apply preset size
  const applyPreset = useCallback(
    (preset: { width: number; height: number }) => {
      if (options.maintainAspectRatio) {
        // Fit within preset while maintaining aspect ratio
        const scale = Math.min(preset.width / currentWidth, preset.height / currentHeight);
        onOptionsChange({
          ...options,
          width: Math.round(currentWidth * scale),
          height: Math.round(currentHeight * scale),
          scalePercentage: Math.round(scale * 100),
        });
      } else {
        onOptionsChange({
          ...options,
          width: preset.width,
          height: preset.height,
          scalePercentage: Math.round((preset.width / currentWidth) * 100),
        });
      }
    },
    [currentWidth, currentHeight, options, onOptionsChange]
  );

  // Swap dimensions
  const swapDimensions = useCallback(() => {
    onOptionsChange({
      ...options,
      width: options.height,
      height: options.width,
    });
  }, [options, onOptionsChange]);

  return (
    <div className={`p-4 ${className}`}>
      <h3 className="text-sm font-medium text-surface-200 mb-4">Resize</h3>

      <div className="space-y-4">
        {/* Current size info */}
        <div className="p-3 rounded-lg bg-surface-700/50">
          <div className="text-xs text-surface-400 mb-1">Current Size</div>
          <div className="text-sm text-surface-200">
            {currentWidth} × {currentHeight} px
          </div>
        </div>

        {/* Input mode toggle */}
        <div className="flex gap-1">
          <button
            onClick={() => setInputMode('pixels')}
            className={`
              flex-1 px-2 py-1 text-xs rounded
              ${inputMode === 'pixels'
                ? 'bg-primary-600/20 text-primary-400'
                : 'bg-surface-700 text-surface-400 hover:bg-surface-600'
              }
            `}
          >
            Pixels
          </button>
          <button
            onClick={() => setInputMode('percentage')}
            className={`
              flex-1 px-2 py-1 text-xs rounded
              ${inputMode === 'percentage'
                ? 'bg-primary-600/20 text-primary-400'
                : 'bg-surface-700 text-surface-400 hover:bg-surface-600'
              }
            `}
          >
            Percentage
          </button>
        </div>

        {inputMode === 'pixels' ? (
          <>
            {/* Width & Height inputs */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-surface-400 mb-1">Width</label>
                <NumberInput
                  value={options.width}
                  min={1}
                  max={10000}
                  step={1}
                  onChange={(value) => updateOption('width', value)}
                />
              </div>
              <div>
                <label className="block text-xs text-surface-400 mb-1">Height</label>
                <NumberInput
                  value={options.height}
                  min={1}
                  max={10000}
                  step={1}
                  onChange={(value) => updateOption('height', value)}
                />
              </div>
            </div>

            {/* Swap button */}
            <div className="flex justify-center">
              <button
                onClick={swapDimensions}
                className="p-1.5 text-surface-400 hover:text-surface-200 hover:bg-surface-700 rounded"
                title="Swap dimensions"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                  />
                </svg>
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Percentage input */}
            <div>
              <label className="block text-xs text-surface-400 mb-1">
                Scale: {options.scalePercentage}%
              </label>
              <NumberInput
                value={options.scalePercentage}
                min={1}
                max={1000}
                step={1}
                onChange={handlePercentageChange}
              />
            </div>

            {/* Percentage presets */}
            <div className="flex flex-wrap gap-1">
              {SCALE_PRESETS.map((scale) => (
                <button
                  key={scale}
                  onClick={() => handlePercentageChange(scale)}
                  className={`
                    px-2 py-1 text-xs rounded
                    ${options.scalePercentage === scale
                      ? 'bg-primary-600/20 text-primary-400 ring-1 ring-primary-500'
                      : 'bg-surface-700 text-surface-300 hover:bg-surface-600'
                    }
                  `}
                >
                  {scale}%
                </button>
              ))}
            </div>
          </>
        )}

        {/* Maintain aspect ratio */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="aspectRatio"
            checked={options.maintainAspectRatio}
            onChange={(e) => updateOption('maintainAspectRatio', e.target.checked)}
            className="rounded"
          />
          <label htmlFor="aspectRatio" className="text-sm text-surface-300">
            Maintain aspect ratio
          </label>
        </div>

        {/* Size presets */}
        <div>
          <label className="block text-xs text-surface-400 mb-1">Presets</label>
          <div className="grid grid-cols-3 gap-1">
            {PRESET_SIZES.map((preset) => (
              <button
                key={preset.label}
                onClick={() => applyPreset(preset)}
                className="px-2 py-1.5 text-xs bg-surface-700 text-surface-300 rounded hover:bg-surface-600"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Resample method */}
        <div>
          <label className="block text-xs text-surface-400 mb-1">Resampling Method</label>
          <select
            value={options.resampleMethod}
            onChange={(e) => updateOption('resampleMethod', e.target.value as ResizeOptions['resampleMethod'])}
            className="
              w-full px-3 py-2
              bg-surface-700 text-surface-200
              border border-surface-600 rounded-lg
              text-sm
              focus:outline-none focus:border-primary-500
            "
          >
            {RESAMPLE_METHODS.map((method) => (
              <option key={method.value} value={method.value}>
                {method.label} - {method.desc}
              </option>
            ))}
          </select>
        </div>

        {/* New size preview */}
        <div className="p-3 rounded-lg bg-primary-600/10 border border-primary-600/20">
          <div className="text-xs text-primary-400 mb-1">New Size</div>
          <div className="text-sm text-surface-200">
            {options.width} × {options.height} px
            <span className="text-xs text-surface-400 ml-2">
              ({options.scalePercentage}%)
            </span>
          </div>
        </div>

        {/* Apply button */}
        <Button
          variant="primary"
          size="sm"
          onClick={onApply}
          isLoading={isApplying}
          fullWidth
        >
          Apply Resize
        </Button>
      </div>
    </div>
  );
}
