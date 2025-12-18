/**
 * ShapePropertiesPanel Component
 * Properties editor for shape overlays (stroke, fill, dimensions)
 */

import { useCallback } from 'react';
import { Icon } from '../../../../components/atoms/Icon';
import { Slider } from '../../../../components/atoms/Slider';
import { NumberInput } from '../../../../components/molecules/NumberInput';
import type { ShapeOverlay } from '../Canvas/OverlayLayer';

export interface ShapePropertiesPanelProps {
  /** Selected shape overlay */
  selectedShape: ShapeOverlay | null;
  /** Shape update handler */
  onShapeUpdate?: (overlay: ShapeOverlay) => void;
  /** Delete handler */
  onDelete?: () => void;
  className?: string;
}

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

const SHAPE_LABELS: Record<string, string> = {
  rectangle: 'Rectangle',
  ellipse: 'Ellipse',
  line: 'Line',
  arrow: 'Arrow',
};

export function ShapePropertiesPanel({
  selectedShape,
  onShapeUpdate,
  onDelete,
  className = '',
}: ShapePropertiesPanelProps) {
  // Update a single property
  const updateProperty = useCallback(
    <K extends keyof ShapeOverlay>(key: K, value: ShapeOverlay[K]) => {
      if (!selectedShape) return;
      onShapeUpdate?.({ ...selectedShape, [key]: value });
    },
    [selectedShape, onShapeUpdate]
  );

  // No shape selected
  if (!selectedShape) {
    return (
      <div className={`p-4 ${className}`}>
        <h3 className="text-sm font-medium text-surface-200 mb-4">Shape Properties</h3>
        <p className="text-sm text-surface-500">Select a shape overlay to edit</p>
      </div>
    );
  }

  const canHaveFill = selectedShape.type === 'rectangle' || selectedShape.type === 'ellipse';

  return (
    <div className={`p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-surface-200">Shape Properties</h3>
        <button
          onClick={onDelete}
          className="p-1 text-surface-400 hover:text-accent-error hover:bg-surface-700 rounded"
          title="Delete shape"
        >
          <Icon name="trash" size="sm" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Shape type (read-only) */}
        <div>
          <label className="block text-xs text-surface-400 mb-1">Shape Type</label>
          <div className="px-3 py-2 bg-surface-700/50 rounded-lg text-sm text-surface-300">
            {SHAPE_LABELS[selectedShape.type] || selectedShape.type}
          </div>
        </div>

        {/* Stroke color */}
        <div>
          <label className="block text-xs text-surface-400 mb-1">Stroke Color</label>
          <div className="flex flex-wrap gap-1 mb-2">
            {COLOR_PRESETS.map((color) => (
              <button
                key={color}
                onClick={() => updateProperty('strokeColor', color)}
                className={`
                  w-6 h-6 rounded border-2
                  ${selectedShape.strokeColor === color ? 'border-primary-500' : 'border-transparent hover:border-surface-500'}
                `}
                style={{ backgroundColor: color }}
                aria-label={`Color ${color}`}
              />
            ))}
          </div>
          <input
            type="color"
            value={selectedShape.strokeColor}
            onChange={(e) => updateProperty('strokeColor', e.target.value)}
            className="w-full h-8 rounded cursor-pointer"
          />
        </div>

        {/* Stroke width */}
        <div>
          <label className="block text-xs text-surface-400 mb-1">
            Stroke Width: {selectedShape.strokeWidth}px
          </label>
          <div className="flex gap-2">
            <Slider
              min={1}
              max={20}
              value={selectedShape.strokeWidth}
              onChange={(e) => updateProperty('strokeWidth', Number(e.target.value))}
              size="sm"
              className="flex-1"
            />
            <NumberInput
              value={selectedShape.strokeWidth}
              min={1}
              max={50}
              step={1}
              onChange={(value) => updateProperty('strokeWidth', value)}
              className="w-16"
            />
          </div>
        </div>

        {/* Fill color (only for rectangle and ellipse) */}
        {canHaveFill && (
          <div>
            <label className="block text-xs text-surface-400 mb-1">Fill</label>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                checked={!!selectedShape.fillColor}
                onChange={(e) =>
                  updateProperty('fillColor', e.target.checked ? '#00000080' : undefined)
                }
                className="rounded"
              />
              <span className="text-xs text-surface-400">Enable fill</span>
            </div>
            {selectedShape.fillColor && (
              <>
                <div className="flex flex-wrap gap-1 mb-2">
                  {COLOR_PRESETS.map((color) => (
                    <button
                      key={color}
                      onClick={() => updateProperty('fillColor', color)}
                      className={`
                        w-6 h-6 rounded border-2
                        ${selectedShape.fillColor === color ? 'border-primary-500' : 'border-transparent hover:border-surface-500'}
                      `}
                      style={{ backgroundColor: color }}
                      aria-label={`Fill color ${color}`}
                    />
                  ))}
                </div>
                <input
                  type="color"
                  value={selectedShape.fillColor}
                  onChange={(e) => updateProperty('fillColor', e.target.value)}
                  className="w-full h-8 rounded cursor-pointer"
                />
              </>
            )}
          </div>
        )}

        {/* Position */}
        <div>
          <label className="block text-xs text-surface-400 mb-1">Position</label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-surface-500">X</label>
              <NumberInput
                value={Math.round(selectedShape.x)}
                min={0}
                step={1}
                onChange={(value) => updateProperty('x', value)}
              />
            </div>
            <div>
              <label className="text-[10px] text-surface-500">Y</label>
              <NumberInput
                value={Math.round(selectedShape.y)}
                min={0}
                step={1}
                onChange={(value) => updateProperty('y', value)}
              />
            </div>
          </div>
        </div>

        {/* Dimensions */}
        <div>
          <label className="block text-xs text-surface-400 mb-1">
            {selectedShape.type === 'line' || selectedShape.type === 'arrow' ? 'End Point' : 'Size'}
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-surface-500">
                {selectedShape.type === 'line' || selectedShape.type === 'arrow' ? 'ΔX' : 'Width'}
              </label>
              <NumberInput
                value={Math.round(selectedShape.width)}
                step={1}
                onChange={(value) => updateProperty('width', value)}
              />
            </div>
            <div>
              <label className="text-[10px] text-surface-500">
                {selectedShape.type === 'line' || selectedShape.type === 'arrow' ? 'ΔY' : 'Height'}
              </label>
              <NumberInput
                value={Math.round(selectedShape.height)}
                step={1}
                onChange={(value) => updateProperty('height', value)}
              />
            </div>
          </div>
        </div>

        {/* Rotation (only for rectangle and ellipse) */}
        {canHaveFill && (
          <div>
            <label className="block text-xs text-surface-400 mb-1">
              Rotation: {selectedShape.rotation ?? 0}°
            </label>
            <Slider
              min={-180}
              max={180}
              value={selectedShape.rotation ?? 0}
              onChange={(e) => updateProperty('rotation', Number(e.target.value))}
              size="sm"
            />
          </div>
        )}

        {/* Quick actions */}
        <div className="border-t border-surface-700 pt-4">
          <label className="block text-xs text-surface-400 mb-2">Quick Actions</label>
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => updateProperty('rotation', 0)}
              className="px-2 py-1 text-xs bg-surface-700 text-surface-300 rounded hover:bg-surface-600"
            >
              Reset Rotation
            </button>
            {canHaveFill && (
              <button
                onClick={() => {
                  const temp = selectedShape.strokeColor;
                  updateProperty('strokeColor', selectedShape.fillColor || '#000000');
                  updateProperty('fillColor', temp);
                }}
                className="px-2 py-1 text-xs bg-surface-700 text-surface-300 rounded hover:bg-surface-600"
              >
                Swap Colors
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
