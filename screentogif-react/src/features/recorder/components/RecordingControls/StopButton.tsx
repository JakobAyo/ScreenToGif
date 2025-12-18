/**
 * StopButton Component
 * Stop recording action button
 */

import { Button } from '../../../../components/atoms/Button';
import { Icon } from '../../../../components/atoms/Icon';
import { Tooltip } from '../../../../components/molecules/Tooltip';

export interface StopButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  shortcut?: string;
}

export function StopButton({
  onClick,
  disabled = false,
  isLoading = false,
  shortcut = 'F8',
}: StopButtonProps) {
  return (
    <Tooltip content={`Stop Recording (${shortcut})`} position="top">
      <Button
        variant="primary"
        size="lg"
        onClick={onClick}
        disabled={disabled}
        isLoading={isLoading}
        leftIcon={<Icon name="stop" />}
      >
        Stop
      </Button>
    </Tooltip>
  );
}

StopButton.displayName = 'StopButton';
