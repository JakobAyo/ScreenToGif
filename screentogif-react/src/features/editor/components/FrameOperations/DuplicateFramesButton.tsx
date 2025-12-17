/**
 * DuplicateFramesButton Component
 * Button to duplicate selected frames
 */

import { useState, useCallback } from 'react';
import { Icon } from '../../../../components/atoms/Icon';
import { Button } from '../../../../components/atoms/Button';
import { Tooltip } from '../../../../components/molecules/Tooltip';
import { NumberInput } from '../../../../components/molecules/NumberInput';

export interface DuplicateFramesButtonProps {
  /** Number of selected frames */
  selectedCount: number;
  /** Duplicate handler (optionally with repeat count) */
  onDuplicate: (repeatCount?: number) => void;
  /** Whether duplication is in progress */
  isDuplicating?: boolean;
  /** Show options dropdown */
  showOptions?: boolean;
  /** Compact mode (icon only) */
  compact?: boolean;
  className?: string;
}

export function DuplicateFramesButton({
  selectedCount,
  onDuplicate,
  isDuplicating = false,
  showOptions = false,
  compact = false,
  className = '',
}: DuplicateFramesButtonProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [repeatCount, setRepeatCount] = useState(1);

  const handleClick = useCallback(() => {
    if (showOptions) {
      setShowDropdown(!showDropdown);
    } else {
      onDuplicate();
    }
  }, [showOptions, showDropdown, onDuplicate]);

  const handleDuplicate = useCallback(() => {
    setShowDropdown(false);
    onDuplicate(repeatCount);
  }, [onDuplicate, repeatCount]);

  const isDisabled = selectedCount === 0 || isDuplicating;

  return (
    <div className="relative">
      {compact ? (
        <Tooltip content={`Duplicate ${selectedCount} frame${selectedCount !== 1 ? 's' : ''} (Ctrl+D)`}>
          <button
            onClick={handleClick}
            disabled={isDisabled}
            className={`
              flex items-center justify-center
              w-8 h-8 rounded-lg
              text-surface-400 hover:text-surface-200 hover:bg-surface-700
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent
              transition-colors
              ${className}
            `}
            aria-label="Duplicate selected frames"
          >
            <Icon name="document-duplicate" size="md" />
          </button>
        </Tooltip>
      ) : (
        <Button
          variant="secondary"
          size="sm"
          onClick={handleClick}
          disabled={isDisabled}
          isLoading={isDuplicating}
          leftIcon={<Icon name="document-duplicate" size="sm" />}
          rightIcon={showOptions ? <Icon name="chevron-down" size="sm" /> : undefined}
          className={className}
        >
          Duplicate ({selectedCount})
        </Button>
      )}

      {/* Options dropdown */}
      {showDropdown && showOptions && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />
          <div
            className="
              absolute top-full left-0 mt-1 z-50
              w-48 p-3
              bg-surface-800 rounded-lg
              border border-surface-700
              shadow-xl
            "
          >
            <label className="block text-xs text-surface-400 mb-2">
              Repeat count
            </label>
            <div className="flex gap-2 mb-3">
              <NumberInput
                value={repeatCount}
                min={1}
                max={100}
                step={1}
                onChange={setRepeatCount}
                className="flex-1"
              />
            </div>

            {/* Quick presets */}
            <div className="flex gap-1 mb-3">
              {[1, 2, 5, 10].map((count) => (
                <button
                  key={count}
                  onClick={() => setRepeatCount(count)}
                  className={`
                    flex-1 px-2 py-1 text-xs rounded
                    ${repeatCount === count
                      ? 'bg-primary-600/20 text-primary-400'
                      : 'bg-surface-700 text-surface-300 hover:bg-surface-600'
                    }
                  `}
                >
                  ×{count}
                </button>
              ))}
            </div>

            <div className="text-xs text-surface-500 mb-3">
              Will create {selectedCount * repeatCount} new frame{selectedCount * repeatCount !== 1 ? 's' : ''}
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={handleDuplicate}
              isLoading={isDuplicating}
              fullWidth
            >
              Duplicate
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
