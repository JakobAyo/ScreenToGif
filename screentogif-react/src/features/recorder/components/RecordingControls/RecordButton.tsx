/**
 * RecordButton Component
 * Start recording action button
 */

import { Button } from '../../../../components/atoms/Button';
import { Icon } from '../../../../components/atoms/Icon';
import { Tooltip } from '../../../../components/molecules/Tooltip';

export interface RecordButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  shortcut?: string;
}

export function RecordButton({
  onClick,
  disabled = false,
  isLoading = false,
  shortcut = 'F7',
}: RecordButtonProps) {
  return (
    <Tooltip content={`Start Recording (${shortcut})`} position="top">
      <Button
        variant="primary"
        size="lg"
        onClick={onClick}
        disabled={disabled}
        isLoading={isLoading}
        leftIcon={<Icon name="record" />}
        className="!bg-accent-error hover:!bg-accent-error-light active:!bg-accent-error-dark"
      >
        Record
      </Button>
    </Tooltip>
  );
}

RecordButton.displayName = 'RecordButton';
