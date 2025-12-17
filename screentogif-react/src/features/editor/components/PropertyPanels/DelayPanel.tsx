/**
 * DelayPanel Component
 * Controls frame timing and delay settings
 */

import { useCallback, useState, useMemo } from 'react';
import type { Frame } from '../../../../api/types';
import { Icon } from '../../../../components/atoms/Icon';
import { Button } from '../../../../components/atoms/Button';
import { Slider } from '../../../../components/atoms/Slider';
import { NumberInput } from '../../../../components/molecules/NumberInput';

export interface DelayPanelProps {
  /** Selected frames */
  selectedFrames: Frame[];
  /** Single delay update handler */
  onDelayChange?: (frameId: string, delay: number) => void;
  /** Batch delay update handler */
  onBatchDelayChange?: (frameIds: string[], delay: number) => void;
  /** Scale delays by factor */
  onScaleDelays?: (factor: number) => void;
  className?: string;
}

const PRESET_DELAYS = [
  { label: '33ms (30fps)', value: 33 },
  { label: '50ms (20fps)', value: 50 },
  { label: '66ms (15fps)', value: 66 },
  { label: '100ms (10fps)', value: 100 },
  { label: '200ms (5fps)', value: 200 },
  { label: '500ms (2fps)', value: 500 },
  { label: '1000ms (1fps)', value: 1000 },
];

export function DelayPanel({
  selectedFrames,
  onDelayChange,
  onBatchDelayChange,
  onScaleDelays,
  className = '',
}: DelayPanelProps) {
  const [customDelay, setCustomDelay] = useState(100);
  const [scaleMode, setScaleMode] = useState<'factor' | 'fps'>('factor');
  const [scaleFactor, setScaleFactor] = useState(1.0);
  const [targetFps, setTargetFps] = useState(15);

  // Calculate current delay statistics
  const delayStats = useMemo(() => {
    if (selectedFrames.length === 0) return null;

    const delays = selectedFrames.map((f) => f.metadata.delay);
    const min = Math.min(...delays);
    const max = Math.max(...delays);
    const avg = delays.reduce((a, b) => a + b, 0) / delays.length;
    const total = delays.reduce((a, b) => a + b, 0);
    const allEqual = delays.every((d) => d === delays[0]);

    return {
      min,
      max,
      avg: Math.round(avg),
      total,
      allEqual,
      currentDelay: allEqual ? delays[0] : null,
      fps: allEqual ? Math.round(1000 / delays[0]) : Math.round(1000 / avg),
    };
  }, [selectedFrames]);

  // Apply delay to selected frames
  const applyDelay = useCallback(
    (delay: number) => {
      if (selectedFrames.length === 0) return;

      const frameIds = selectedFrames.map((f) => f.id);
      onBatchDelayChange?.(frameIds, delay);
    },
    [selectedFrames, onBatchDelayChange]
  );

  // Apply preset delay
  const applyPreset = useCallback(
    (delay: number) => {
      setCustomDelay(delay);
      applyDelay(delay);
    },
    [applyDelay]
  );

  // Apply scale factor
  const applyScale = useCallback(() => {
    if (scaleMode === 'factor') {
      onScaleDelays?.(scaleFactor);
    } else {
      // Convert FPS to scale factor
      const currentAvgFps = delayStats?.fps ?? 15;
      const factor = currentAvgFps / targetFps;
      onScaleDelays?.(factor);
    }
  }, [scaleMode, scaleFactor, targetFps, delayStats, onScaleDelays]);

  // No frames selected
  if (selectedFrames.length === 0) {
    return (
      <div className={`p-4 ${className}`}>
        <h3 className="text-sm font-medium text-surface-200 mb-4">Frame Delay</h3>
        <p className="text-sm text-surface-500">Select frames to adjust timing</p>
      </div>
    );
  }

  return (
    <div className={`p-4 ${className}`}>
      <h3 className="text-sm font-medium text-surface-200 mb-4">
        Frame Delay
        {selectedFrames.length > 1 && (
          <span className="ml-2 text-xs text-surface-400">
            ({selectedFrames.length} frames)
          </span>
        )}
      </h3>

      {/* Current delay info */}
      {delayStats && (
        <div className="mb-4 p-3 rounded-lg bg-surface-700/50">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-surface-500">Current:</span>
              <span className="ml-1 text-surface-200">
                {delayStats.currentDelay !== null ? `${delayStats.currentDelay}ms` : 'Mixed'}
              </span>
            </div>
            <div>
              <span className="text-surface-500">FPS:</span>
              <span className="ml-1 text-surface-200">~{delayStats.fps}</span>
            </div>
            {!delayStats.allEqual && (
              <>
                <div>
                  <span className="text-surface-500">Min:</span>
                  <span className="ml-1 text-surface-200">{delayStats.min}ms</span>
                </div>
                <div>
                  <span className="text-surface-500">Max:</span>
                  <span className="ml-1 text-surface-200">{delayStats.max}ms</span>
                </div>
              </>
            )}
            <div className="col-span-2">
              <span className="text-surface-500">Total:</span>
              <span className="ml-1 text-surface-200">{(delayStats.total / 1000).toFixed(2)}s</span>
            </div>
          </div>
        </div>
      )}

      {/* Custom delay input */}
      <div className="mb-4">
        <label className="block text-xs text-surface-400 mb-2">Set Delay (ms)</label>
        <div className="flex gap-2">
          <NumberInput
            value={customDelay}
            min={1}
            max={10000}
            step={1}
            onChange={setCustomDelay}
            className="flex-1"
          />
          <Button
            variant="primary"
            size="sm"
            onClick={() => applyDelay(customDelay)}
          >
            Apply
          </Button>
        </div>
      </div>

      {/* Delay slider */}
      <div className="mb-4">
        <Slider
          min={10}
          max={500}
          value={customDelay}
          onChange={(e) => setCustomDelay(Number(e.target.value))}
          size="sm"
          showValue
        />
      </div>

      {/* Presets */}
      <div className="mb-4">
        <label className="block text-xs text-surface-400 mb-2">Presets</label>
        <div className="grid grid-cols-2 gap-1">
          {PRESET_DELAYS.map((preset) => (
            <button
              key={preset.value}
              onClick={() => applyPreset(preset.value)}
              className={`
                px-2 py-1.5 text-xs rounded
                transition-colors
                ${delayStats?.currentDelay === preset.value
                  ? 'bg-primary-600/20 text-primary-400 ring-1 ring-primary-500'
                  : 'bg-surface-700 text-surface-300 hover:bg-surface-600'
                }
              `}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Scale section */}
      <div className="border-t border-surface-700 pt-4">
        <label className="block text-xs text-surface-400 mb-2">Scale Delays</label>

        {/* Scale mode toggle */}
        <div className="flex gap-1 mb-3">
          <button
            onClick={() => setScaleMode('factor')}
            className={`
              flex-1 px-2 py-1 text-xs rounded
              ${scaleMode === 'factor'
                ? 'bg-primary-600/20 text-primary-400'
                : 'bg-surface-700 text-surface-400 hover:bg-surface-600'
              }
            `}
          >
            By Factor
          </button>
          <button
            onClick={() => setScaleMode('fps')}
            className={`
              flex-1 px-2 py-1 text-xs rounded
              ${scaleMode === 'fps'
                ? 'bg-primary-600/20 text-primary-400'
                : 'bg-surface-700 text-surface-400 hover:bg-surface-600'
              }
            `}
          >
            Target FPS
          </button>
        </div>

        {scaleMode === 'factor' ? (
          <div className="flex gap-2">
            <NumberInput
              value={scaleFactor}
              min={0.1}
              max={10}
              step={0.1}
              onChange={setScaleFactor}
              className="flex-1"
            />
            <Button variant="secondary" size="sm" onClick={applyScale}>
              Scale
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <NumberInput
              value={targetFps}
              min={1}
              max={60}
              step={1}
              onChange={setTargetFps}
              className="flex-1"
            />
            <span className="self-center text-xs text-surface-500">fps</span>
            <Button variant="secondary" size="sm" onClick={applyScale}>
              Apply
            </Button>
          </div>
        )}

        {/* Quick scale buttons */}
        <div className="flex gap-1 mt-2">
          <button
            onClick={() => onScaleDelays?.(0.5)}
            className="flex-1 px-2 py-1 text-xs bg-surface-700 text-surface-300 rounded hover:bg-surface-600"
          >
            ×0.5 (Faster)
          </button>
          <button
            onClick={() => onScaleDelays?.(2.0)}
            className="flex-1 px-2 py-1 text-xs bg-surface-700 text-surface-300 rounded hover:bg-surface-600"
          >
            ×2.0 (Slower)
          </button>
        </div>
      </div>
    </div>
  );
}
