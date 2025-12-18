/**
 * GridSettings Component
 * Settings for editor grid visibility and snapping behavior
 */

import { useState } from 'react';
import { Toggle } from '../../../../components/atoms/Toggle';
import { Slider } from '../../../../components/atoms/Slider';
import { Icon } from '../../../../components/atoms/Icon';

export interface GridSettingsProps {
  disabled?: boolean;
  className?: string;
}

export function GridSettings({ disabled = false, className = '' }: GridSettingsProps) {
  // Local state since these settings aren't in the main settings store yet
  const [showGrid, setShowGrid] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [gridSize, setGridSize] = useState(16);
  const [gridOpacity, setGridOpacity] = useState(0.3);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-sm font-medium text-surface-200">Show grid</label>
          <p className="text-xs text-surface-500">Display grid lines on the canvas</p>
        </div>
        <Toggle
          checked={showGrid}
          onChange={(e) => setShowGrid(e.target.checked)}
          disabled={disabled}
          size="sm"
        />
      </div>

      {showGrid && (
        <div className="ml-4 pl-4 border-l border-surface-700 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm text-surface-300">Grid size</label>
              <span className="text-xs text-surface-400 font-mono">{gridSize}px</span>
            </div>
            <Slider
              value={gridSize}
              onChange={(e) => setGridSize(Number(e.target.value))}
              min={8}
              max={64}
              step={8}
              disabled={disabled}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm text-surface-300">Grid opacity</label>
              <span className="text-xs text-surface-400 font-mono">
                {Math.round(gridOpacity * 100)}%
              </span>
            </div>
            <Slider
              value={gridOpacity}
              onChange={(e) => setGridOpacity(Number(e.target.value))}
              min={0.1}
              max={1}
              step={0.1}
              disabled={disabled}
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <label className="block text-sm font-medium text-surface-200">Snap to grid</label>
          <p className="text-xs text-surface-500">Align elements to grid when moving</p>
        </div>
        <Toggle
          checked={snapToGrid}
          onChange={(e) => setSnapToGrid(e.target.checked)}
          disabled={disabled}
          size="sm"
        />
      </div>

      <div className="flex items-start gap-2 p-3 bg-surface-800 rounded-lg border border-surface-700">
        <Icon name="info-circle" size="sm" className="text-surface-400 mt-0.5" />
        <p className="text-xs text-surface-400">
          Grid settings help you align annotations and drawings precisely on your frames.
        </p>
      </div>
    </div>
  );
}

GridSettings.displayName = 'GridSettings';
