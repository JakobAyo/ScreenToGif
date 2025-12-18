/**
 * DeleteFramesButton Component
 * Button to delete selected frames with confirmation
 */

import { useState, useCallback } from 'react';
import { Icon } from '../../../../components/atoms/Icon';
import { Button } from '../../../../components/atoms/Button';
import { Tooltip } from '../../../../components/molecules/Tooltip';
import { Modal } from '../../../../components/molecules/Modal';

export interface DeleteFramesButtonProps {
  /** Number of selected frames */
  selectedCount: number;
  /** Delete handler */
  onDelete: () => void;
  /** Whether delete is in progress */
  isDeleting?: boolean;
  /** Whether to show confirmation dialog */
  showConfirmation?: boolean;
  /** Compact mode (icon only) */
  compact?: boolean;
  className?: string;
}

export function DeleteFramesButton({
  selectedCount,
  onDelete,
  isDeleting = false,
  showConfirmation = true,
  compact = false,
  className = '',
}: DeleteFramesButtonProps) {
  const [showModal, setShowModal] = useState(false);

  const handleClick = useCallback(() => {
    if (showConfirmation && selectedCount > 0) {
      setShowModal(true);
    } else {
      onDelete();
    }
  }, [showConfirmation, selectedCount, onDelete]);

  const handleConfirm = useCallback(() => {
    setShowModal(false);
    onDelete();
  }, [onDelete]);

  const isDisabled = selectedCount === 0 || isDeleting;

  return (
    <>
      {compact ? (
        <Tooltip content={`Delete ${selectedCount} frame${selectedCount !== 1 ? 's' : ''} (Del)`}>
          <button
            onClick={handleClick}
            disabled={isDisabled}
            className={`
              flex items-center justify-center
              w-8 h-8 rounded-lg
              text-surface-400 hover:text-accent-error hover:bg-accent-error/10
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-surface-400 disabled:hover:bg-transparent
              transition-colors
              ${className}
            `}
            aria-label="Delete selected frames"
          >
            <Icon name="trash" size="md" />
          </button>
        </Tooltip>
      ) : (
        <Button
          variant="danger"
          size="sm"
          onClick={handleClick}
          disabled={isDisabled}
          isLoading={isDeleting}
          leftIcon={<Icon name="trash" size="sm" />}
          className={className}
        >
          Delete ({selectedCount})
        </Button>
      )}

      {/* Confirmation modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Delete Frames"
        size="sm"
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleConfirm} isLoading={isDeleting}>
              Delete
            </Button>
          </div>
        }
      >
        <p className="text-surface-300">
          Are you sure you want to delete {selectedCount} frame{selectedCount !== 1 ? 's' : ''}?
        </p>
        <p className="text-sm text-surface-500 mt-2">
          This action can be undone using Ctrl+Z.
        </p>
      </Modal>
    </>
  );
}
