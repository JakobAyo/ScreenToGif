/**
 * CropPanel Component
 * Controls for cropping frames
 */

import { useState, useCallback, useMemo } from 'react';
import { Button } from '../../../../components/atoms/Button';
import { NumberInput } from '../../../../components/molecules/NumberInput';

export interface CropOptions {
  x: number;
  y: number;
  width: number;
  height: number;
  maintainAspectRatio: boolean;
  aspectRatio: string; // e.g., "16:9", "4:3", "1:1", "free"
}

export interface CropPanelProps {
  /** Current frame dimensions */
  currentWidth: number;
  currentHeight: number;
  /** Current crop options */
  options: CropOptions;
  /** Options change handler */
  onOptionsChange: (options: CropOptions) => void;
  /** Apply crop to selected frames */
  onApply: () => void;
  /** Reset to original */
  onReset?: () => void;
  /** Whether applying is in progress */
  isApplying?: boolean;
  className?: string;
}

const ASPECT_RATIOS = [
  { label: 'Free', value: 'free', ratio: null },
  { label: '16:9', value: '16:9', ratio: 16 / 9 },
  { label: '4:3', value: '4:3', ratio: 4 / 3 },
  { label: '1:1', value: '1:1', ratio: 1 },
  { label: '9:16', value: '9:16', ratio: 9 / 16 },
  { label: '3:4', value: '3:4', ratio: 3 / 4 },
  { label: '21:9', value: '21:9', ratio: 21 / 9 },
];

export function CropPanel({
  currentWidth,
  currentHeight,
  options,
  onOptionsChange,
  onApply,
  onReset,
  isApplying = false,
  className = '',
}: CropPanelProps) {
  // Calculate actual aspect ratio value
  const getAspectRatioValue = (ratioString: string): number | null => {
    const preset = ASPECT_RATIOS.find((r) => r.value === ratioString);
    return preset?.ratio ?? null;
  };

  // Update a single option
  const updateOption = useCallback(
    <K extends keyof CropOptions>(key: K, value: CropOptions[K]) => {
      const newOptions = { ...options, [key]: value };
      const aspectRatioValue = getAspectRatioValue(newOptions.aspectRatio);

      // Clamp values to valid range
      if (key === 'x') {
        newOptions.x = Math.max(0, Math.min(value as number, currentWidth - newOptions.width));
      }
      if (key === 'y') {
        newOptions.y = Math.max(0, Math.min(value as number, currentHeight - newOptions.height));
      }
      if (key === 'width') {
        newOptions.width = Math.max(1, Math.min(value as number, currentWidth - newOptions.x));
        if (aspectRatioValue && newOptions.maintainAspectRatio) {
          newOptions.height = Math.round(newOptions.width / aspectRatioValue);
        }
      }
      if (key === 'height') {
        newOptions.height = Math.max(1, Math.min(value as number, currentHeight - newOptions.y));
        if (aspectRatioValue && newOptions.maintainAspectRatio) {
          newOptions.width = Math.round(newOptions.height * aspectRatioValue);
        }
      }

      // Handle aspect ratio selection
      if (key === 'aspectRatio' && aspectRatioValue) {
        newOptions.maintainAspectRatio = true;
        // Recalculate dimensions to match aspect ratio
        const currentRatio = newOptions.width / newOptions.height;
        if (currentRatio > aspectRatioValue) {
          newOptions.width = Math.round(newOptions.height * aspectRatioValue);
        } else {
          newOptions.height = Math.round(newOptions.width / aspectRatioValue);
        }
      }

      onOptionsChange(newOptions);
    },
    [options, onOptionsChange, currentWidth, currentHeight]
  );

  // Set crop from edges
  const setCropFromEdges = useCallback(
    (left: number, top: number, right: number, bottom: number) => {
      onOptionsChange({
        ...options,
        x: left,
        y: top,
        width: currentWidth - left - right,
        height: currentHeight - top - bottom,
      });
    },
    [options, onOptionsChange, currentWidth, currentHeight]
  );

  // Apply preset crop
  const applyPresetCrop = useCallback(
    (preset: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right') => {
      const cropWidth = options.width;
      const cropHeight = options.height;
      let x = 0;
      let y = 0;

      switch (preset) {
        case 'center':
          x = Math.round((currentWidth - cropWidth) / 2);
          y = Math.round((currentHeight - cropHeight) / 2);
          break;
        case 'top-left':
          x = 0;
          y = 0;
          break;
        case 'top-right':
          x = currentWidth - cropWidth;
          y = 0;
          break;
        case 'bottom-left':
          x = 0;
          y = currentHeight - cropHeight;
          break;
        case 'bottom-right':
          x = currentWidth - cropWidth;
          y = currentHeight - cropHeight;
          break;
      }

      onOptionsChange({ ...options, x, y });
    },
    [options, onOptionsChange, currentWidth, currentHeight]
  );

  // Calculated values
  const right = currentWidth - options.x - options.width;
  const bottom = currentHeight - options.y - options.height;

  return (
    <div className={`p-4 ${className}`}>
      <h3 className="text-sm font-medium text-surface-200 mb-4">Crop</h3>

      <div className="space-y-4">
        {/* Current size info */}
        <div className="p-3 rounded-lg bg-surface-700/50">
          <div className="text-xs text-surface-400 mb-1">Original Size</div>
          <div className="text-sm text-surface-200">
            {currentWidth} × {currentHeight} px
          </div>
        </div>

        {/* Aspect ratio selection */}
        <div>
          <label className="block text-xs text-surface-400 mb-1">Aspect Ratio</label>
          <div className="flex flex-wrap gap-1">
            {ASPECT_RATIOS.map((ratio) => (
              <button
                key={ratio.value}
                onClick={() => updateOption('aspectRatio', ratio.value)}
                className={`
                  px-2 py-1 text-xs rounded
                  ${options.aspectRatio === ratio.value
                    ? 'bg-primary-600/20 text-primary-400 ring-1 ring-primary-500'
                    : 'bg-surface-700 text-surface-300 hover:bg-surface-600'
                  }
                `}
              >
                {ratio.label}
              </button>
            ))}
          </div>
        </div>

        {/* Position and size */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-surface-400 mb-1">X Position</label>
            <NumberInput
              value={options.x}
              min={0}
              max={currentWidth - 1}
              step={1}
              onChange={(value) => updateOption('x', value)}
            />
          </div>
          <div>
            <label className="block text-xs text-surface-400 mb-1">Y Position</label>
            <NumberInput
              value={options.y}
              min={0}
              max={currentHeight - 1}
              step={1}
              onChange={(value) => updateOption('y', value)}
            />
          </div>
          <div>
            <label className="block text-xs text-surface-400 mb-1">Width</label>
            <NumberInput
              value={options.width}
              min={1}
              max={currentWidth - options.x}
              step={1}
              onChange={(value) => updateOption('width', value)}
            />
          </div>
          <div>
            <label className="block text-xs text-surface-400 mb-1">Height</label>
            <NumberInput
              value={options.height}
              min={1}
              max={currentHeight - options.y}
              step={1}
              onChange={(value) => updateOption('height', value)}
            />
          </div>
        </div>

        {/* Edge margins */}
        <div>
          <label className="block text-xs text-surface-400 mb-2">Margins from edges</label>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div>
              <label className="text-[10px] text-surface-500">Left</label>
              <NumberInput
                value={options.x}
                min={0}
                step={1}
                onChange={(value) => setCropFromEdges(value, options.y, right, bottom)}
              />
            </div>
            <div>
              <label className="text-[10px] text-surface-500">Top</label>
              <NumberInput
                value={options.y}
                min={0}
                step={1}
                onChange={(value) => setCropFromEdges(options.x, value, right, bottom)}
              />
            </div>
            <div>
              <label className="text-[10px] text-surface-500">Right</label>
              <NumberInput
                value={right}
                min={0}
                step={1}
                onChange={(value) => setCropFromEdges(options.x, options.y, value, bottom)}
              />
            </div>
            <div>
              <label className="text-[10px] text-surface-500">Bottom</label>
              <NumberInput
                value={bottom}
                min={0}
                step={1}
                onChange={(value) => setCropFromEdges(options.x, options.y, right, value)}
              />
            </div>
          </div>
        </div>

        {/* Position presets */}
        <div>
          <label className="block text-xs text-surface-400 mb-1">Quick Position</label>
          <div className="grid grid-cols-3 gap-1">
            <button
              onClick={() => applyPresetCrop('top-left')}
              className="p-2 bg-surface-700 text-surface-400 rounded hover:bg-surface-600"
            >
              ↖
            </button>
            <button
              onClick={() => applyPresetCrop('center')}
              className="p-2 bg-surface-700 text-surface-400 rounded hover:bg-surface-600"
            >
              ⊙
            </button>
            <button
              onClick={() => applyPresetCrop('top-right')}
              className="p-2 bg-surface-700 text-surface-400 rounded hover:bg-surface-600"
            >
              ↗
            </button>
            <button
              onClick={() => applyPresetCrop('bottom-left')}
              className="p-2 bg-surface-700 text-surface-400 rounded hover:bg-surface-600"
            >
              ↙
            </button>
            <div /> {/* Empty center-bottom cell */}
            <button
              onClick={() => applyPresetCrop('bottom-right')}
              className="p-2 bg-surface-700 text-surface-400 rounded hover:bg-surface-600"
            >
              ↘
            </button>
          </div>
        </div>

        {/* Result preview */}
        <div className="p-3 rounded-lg bg-primary-600/10 border border-primary-600/20">
          <div className="text-xs text-primary-400 mb-1">Result Size</div>
          <div className="text-sm text-surface-200">
            {options.width} × {options.height} px
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          {onReset && (
            <Button variant="secondary" size="sm" onClick={onReset} className="flex-1">
              Reset
            </Button>
          )}
          <Button
            variant="primary"
            size="sm"
            onClick={onApply}
            isLoading={isApplying}
            className="flex-1"
          >
            Apply Crop
          </Button>
        </div>
      </div>
    </div>
  );
}
