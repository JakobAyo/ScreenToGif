/**
 * FramePropertiesPanel Component
 * Displays and edits properties of selected frames
 */

import { useMemo } from 'react';
import type { Frame } from '../../../../api/types';
import { Icon } from '../../../../components/atoms/Icon';
import { NumberInput } from '../../../../components/molecules/NumberInput';

export interface FramePropertiesPanelProps {
  /** Selected frames */
  selectedFrames: Frame[];
  /** Current frame index */
  currentFrameIndex: number;
  /** Total frame count */
  totalFrames: number;
  /** Frame update handler */
  onFrameUpdate?: (frameId: string, updates: Partial<Frame>) => void;
  /** Frames batch update handler */
  onFramesBatchUpdate?: (updates: { id: string; changes: Partial<Frame> }[]) => void;
  /** Navigate to frame */
  onGoToFrame?: (index: number) => void;
  className?: string;
}

export function FramePropertiesPanel({
  selectedFrames,
  currentFrameIndex,
  totalFrames,
  onFrameUpdate,
  onFramesBatchUpdate,
  onGoToFrame,
  className = '',
}: FramePropertiesPanelProps) {
  // Calculate common properties across selected frames
  const commonProperties = useMemo(() => {
    if (selectedFrames.length === 0) return null;

    const delays = selectedFrames.map((f) => f.metadata.delay);
    const widths = selectedFrames.map((f) => f.metadata.width);
    const heights = selectedFrames.map((f) => f.metadata.height);

    const allDelaysEqual = delays.every((d) => d === delays[0]);
    const allDimensionsEqual = widths.every((w) => w === widths[0]) && heights.every((h) => h === heights[0]);

    return {
      delay: allDelaysEqual ? delays[0] : null,
      width: allDimensionsEqual ? widths[0] : null,
      height: allDimensionsEqual ? heights[0] : null,
      indices: selectedFrames.map((f) => f.metadata.index),
    };
  }, [selectedFrames]);

  // No selection
  if (selectedFrames.length === 0) {
    return (
      <div className={`p-4 ${className}`}>
        <h3 className="text-sm font-medium text-surface-200 mb-4">Frame Properties</h3>
        <p className="text-sm text-surface-500">No frames selected</p>
      </div>
    );
  }

  const singleFrame = selectedFrames.length === 1 ? selectedFrames[0] : null;

  return (
    <div className={`p-4 ${className}`}>
      <h3 className="text-sm font-medium text-surface-200 mb-4">
        Frame Properties
        {selectedFrames.length > 1 && (
          <span className="ml-2 text-xs text-surface-400">
            ({selectedFrames.length} selected)
          </span>
        )}
      </h3>

      {/* Frame info */}
      <div className="space-y-4">
        {/* Frame index/position */}
        {singleFrame && (
          <div>
            <label className="block text-xs text-surface-400 mb-1">Position</label>
            <div className="flex items-center gap-2">
              <NumberInput
                value={singleFrame.metadata.index + 1}
                min={1}
                max={totalFrames}
                step={1}
                onChange={(value) => onGoToFrame?.(value - 1)}
                className="flex-1"
              />
              <span className="text-sm text-surface-500">/ {totalFrames}</span>
            </div>
          </div>
        )}

        {/* Multiple frames selected - show range */}
        {!singleFrame && commonProperties && (
          <div>
            <label className="block text-xs text-surface-400 mb-1">Selected Frames</label>
            <div className="flex flex-wrap gap-1">
              {commonProperties.indices.slice(0, 10).map((index) => (
                <button
                  key={index}
                  onClick={() => onGoToFrame?.(index)}
                  className="
                    px-2 py-0.5 text-xs rounded
                    bg-surface-700 text-surface-300
                    hover:bg-surface-600
                  "
                >
                  {index + 1}
                </button>
              ))}
              {commonProperties.indices.length > 10 && (
                <span className="px-2 py-0.5 text-xs text-surface-500">
                  +{commonProperties.indices.length - 10} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Dimensions */}
        {commonProperties && (
          <div>
            <label className="block text-xs text-surface-400 mb-1">Dimensions</label>
            <div className="flex items-center gap-2 text-sm text-surface-300">
              <Icon name="photo" size="sm" className="text-surface-500" />
              {commonProperties.width !== null && commonProperties.height !== null ? (
                <span>
                  {commonProperties.width} × {commonProperties.height} px
                </span>
              ) : (
                <span className="italic text-surface-500">Multiple sizes</span>
              )}
            </div>
          </div>
        )}

        {/* Timestamp */}
        {singleFrame && (
          <div>
            <label className="block text-xs text-surface-400 mb-1">Timestamp</label>
            <div className="flex items-center gap-2 text-sm text-surface-300">
              <Icon name="clock" size="sm" className="text-surface-500" />
              <span>{(singleFrame.metadata.timestamp / 1000).toFixed(2)}s</span>
            </div>
          </div>
        )}

        {/* Keyframe indicator */}
        {singleFrame && (
          <div>
            <label className="block text-xs text-surface-400 mb-1">Type</label>
            <div className="flex items-center gap-2">
              {singleFrame.isKeyFrame ? (
                <span className="px-2 py-0.5 text-xs rounded bg-accent-warning/20 text-accent-warning">
                  Keyframe
                </span>
              ) : (
                <span className="px-2 py-0.5 text-xs rounded bg-surface-700 text-surface-400">
                  Regular Frame
                </span>
              )}
            </div>
          </div>
        )}

        {/* Cursor position (if available) */}
        {singleFrame && (singleFrame.metadata.cursorX !== undefined || singleFrame.metadata.cursorY !== undefined) && (
          <div>
            <label className="block text-xs text-surface-400 mb-1">Cursor Position</label>
            <div className="flex items-center gap-2 text-sm text-surface-300">
              <Icon name="cursor-arrow-ripple" size="sm" className="text-surface-500" />
              <span>
                X: {singleFrame.metadata.cursorX ?? 0}, Y: {singleFrame.metadata.cursorY ?? 0}
              </span>
              {singleFrame.metadata.mouseClicked && (
                <span className="px-1.5 py-0.5 text-xs rounded bg-accent-error/20 text-accent-error">
                  Click
                </span>
              )}
            </div>
          </div>
        )}

        {/* Key pressed (if available) */}
        {singleFrame && singleFrame.metadata.keyPressed && (
          <div>
            <label className="block text-xs text-surface-400 mb-1">Key Pressed</label>
            <div className="flex items-center gap-2">
              <Icon name="command-line" size="sm" className="text-surface-500" />
              <kbd className="px-2 py-0.5 text-xs rounded bg-surface-700 text-surface-300 font-mono">
                {singleFrame.metadata.keyPressed}
              </kbd>
            </div>
          </div>
        )}

        {/* Deleted state */}
        {singleFrame?.isDeleted && (
          <div className="p-2 rounded bg-accent-error/10 border border-accent-error/20">
            <div className="flex items-center gap-2 text-sm text-accent-error">
              <Icon name="trash" size="sm" />
              <span>Marked for deletion</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
