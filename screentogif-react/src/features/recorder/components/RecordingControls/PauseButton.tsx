/**
 * PauseButton Component
 * Pause/Resume recording action button
 */

import { Button } from '../../../../components/atoms/Button';
import { Icon } from '../../../../components/atoms/Icon';
import { Tooltip } from '../../../../components/molecules/Tooltip';

export interface PauseButtonProps {
  isPaused: boolean;
  onClick: () => void;
  disabled?: boolean;
  shortcut?: string;
}

export function PauseButton({
  isPaused,
  onClick,
  disabled = false,
  shortcut = 'F7',
}: PauseButtonProps) {
  return (
    <Tooltip content={`${isPaused ? 'Resume' : 'Pause'} (${shortcut})`} position="top">
      <Button
        variant="secondary"
        size="lg"
        onClick={onClick}
        disabled={disabled}
        leftIcon={<Icon name={isPaused ? 'play' : 'pause'} />}
      >
        {isPaused ? 'Resume' : 'Pause'}
      </Button>
    </Tooltip>
  );
}

PauseButton.displayName = 'PauseButton';
