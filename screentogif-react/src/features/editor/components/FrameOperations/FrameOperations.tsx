/**
 * FrameOperations Component
 * Toolbar containing all frame manipulation operations
 */

import { useCallback, useState } from 'react';
import { Icon } from '../../../../components/atoms/Icon';
import { Tooltip } from '../../../../components/molecules/Tooltip';
import { DeleteFramesButton } from './DeleteFramesButton';
import { DuplicateFramesButton } from './DuplicateFramesButton';
import { ReverseFramesButton } from './ReverseFramesButton';

export interface FrameOperationsProps {
  /** Number of selected frames */
  selectedCount: number;
  /** Total number of frames */
  totalFrames: number;
  /** Can undo */
  canUndo: boolean;
  /** Can redo */
  canRedo: boolean;

  // Frame operations
  onDelete: () => void;
  onDuplicate: (repeatCount?: number) => void;
  onReverse: () => void;
  onCopy: () => void;
  onCut: () => void;
  onPaste: () => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onInvertSelection: () => void;
  onUndo: () => void;
  onRedo: () => void;

  /** Whether clipboard has content */
  hasClipboardContent?: boolean;
  /** Compact layout */
  compact?: boolean;
  /** Vertical layout */
  vertical?: boolean;
  className?: string;
}

export function FrameOperations({
  selectedCount,
  totalFrames,
  canUndo,
  canRedo,
  onDelete,
  onDuplicate,
  onReverse,
  onCopy,
  onCut,
  onPaste,
  onSelectAll,
  onDeselectAll,
  onInvertSelection,
  onUndo,
  onRedo,
  hasClipboardContent = false,
  compact = false,
  vertical = false,
  className = '',
}: FrameOperationsProps) {
  // Button styles for compact mode
  const buttonStyles = `
    flex items-center justify-center
    w-8 h-8 rounded-lg
    text-surface-400 hover:text-surface-200 hover:bg-surface-700
    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent
    transition-colors
  `;

  return (
    <div
      className={`
        flex ${vertical ? 'flex-col' : 'flex-row'} items-center gap-1
        ${vertical ? 'py-2' : 'px-2'}
        ${className}
      `}
    >
      {/* Undo/Redo */}
      <div className={`flex ${vertical ? 'flex-col' : 'flex-row'} items-center gap-0.5`}>
        <Tooltip content="Undo (Ctrl+Z)">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={buttonStyles}
            aria-label="Undo"
          >
            <Icon name="undo" size="md" />
          </button>
        </Tooltip>
        <Tooltip content="Redo (Ctrl+Y)">
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={buttonStyles}
            aria-label="Redo"
          >
            <Icon name="redo" size="md" />
          </button>
        </Tooltip>
      </div>

      {/* Divider */}
      {vertical ? (
        <div className="w-6 h-px bg-surface-700 my-1" />
      ) : (
        <div className="w-px h-6 bg-surface-700 mx-1" />
      )}

      {/* Clipboard operations */}
      <div className={`flex ${vertical ? 'flex-col' : 'flex-row'} items-center gap-0.5`}>
        <Tooltip content="Copy (Ctrl+C)">
          <button
            onClick={onCopy}
            disabled={selectedCount === 0}
            className={buttonStyles}
            aria-label="Copy"
          >
            <Icon name="clipboard" size="md" />
          </button>
        </Tooltip>
        <Tooltip content="Cut (Ctrl+X)">
          <button
            onClick={onCut}
            disabled={selectedCount === 0}
            className={buttonStyles}
            aria-label="Cut"
          >
            <Icon name="scissors" size="md" />
          </button>
        </Tooltip>
        <Tooltip content="Paste (Ctrl+V)">
          <button
            onClick={onPaste}
            disabled={!hasClipboardContent}
            className={buttonStyles}
            aria-label="Paste"
          >
            <Icon name="clipboard-document" size="md" />
          </button>
        </Tooltip>
      </div>

      {/* Divider */}
      {vertical ? (
        <div className="w-6 h-px bg-surface-700 my-1" />
      ) : (
        <div className="w-px h-6 bg-surface-700 mx-1" />
      )}

      {/* Frame operations */}
      <div className={`flex ${vertical ? 'flex-col' : 'flex-row'} items-center gap-0.5`}>
        <DuplicateFramesButton
          selectedCount={selectedCount}
          onDuplicate={onDuplicate}
          compact
        />
        <ReverseFramesButton
          selectedCount={selectedCount}
          onReverse={onReverse}
          compact
        />
        <DeleteFramesButton
          selectedCount={selectedCount}
          onDelete={onDelete}
          compact
        />
      </div>

      {/* Divider */}
      {vertical ? (
        <div className="w-6 h-px bg-surface-700 my-1" />
      ) : (
        <div className="w-px h-6 bg-surface-700 mx-1" />
      )}

      {/* Selection operations */}
      <div className={`flex ${vertical ? 'flex-col' : 'flex-row'} items-center gap-0.5`}>
        <Tooltip content="Select all (Ctrl+A)">
          <button
            onClick={onSelectAll}
            disabled={totalFrames === 0 || selectedCount === totalFrames}
            className={buttonStyles}
            aria-label="Select all frames"
          >
            <Icon name="check-circle" size="md" />
          </button>
        </Tooltip>
        <Tooltip content="Deselect all (Esc)">
          <button
            onClick={onDeselectAll}
            disabled={selectedCount === 0}
            className={buttonStyles}
            aria-label="Deselect all frames"
          >
            <Icon name="x-circle" size="md" />
          </button>
        </Tooltip>
        <Tooltip content="Invert selection (Ctrl+I)">
          <button
            onClick={onInvertSelection}
            disabled={totalFrames === 0}
            className={buttonStyles}
            aria-label="Invert selection"
          >
            <Icon name="adjustments-horizontal" size="md" />
          </button>
        </Tooltip>
      </div>

      {/* Selection count */}
      {!compact && selectedCount > 0 && (
        <div className="text-xs text-surface-500 ml-2">
          {selectedCount} of {totalFrames} selected
        </div>
      )}
    </div>
  );
}
