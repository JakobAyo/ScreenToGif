/**
 * RecordingControls Component
 * Container for recording action buttons with status indicator
 */

import { Button } from '../../../../components/atoms/Button';
import { Icon } from '../../../../components/atoms/Icon';
import { Tooltip } from '../../../../components/molecules/Tooltip';
import type { CaptureState } from '../../../../api/types';
import { RecordButton } from './RecordButton';
import { PauseButton } from './PauseButton';
import { StopButton } from './StopButton';

export interface RecordingControlsProps {
  captureState: CaptureState;
  isPaused: boolean;
  canStart?: boolean;
  onRecord: () => void;
  onPause: () => void;
  onStop: () => void;
  onDiscard?: () => void;
  className?: string;
}

export function RecordingControls({
  captureState,
  isPaused,
  canStart = true,
  onRecord,
  onPause,
  onStop,
  onDiscard,
  className = '',
}: RecordingControlsProps) {
  const isIdle = captureState === 'idle';
  const isRecording = captureState === 'recording' || captureState === 'paused';
  const isStarting = captureState === 'starting';
  const isStopping = captureState === 'stopping';

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {isIdle && (
        <RecordButton
          onClick={onRecord}
          disabled={!canStart || isStarting}
          isLoading={isStarting}
        />
      )}

      {isRecording && (
        <>
          <PauseButton
            isPaused={isPaused}
            onClick={onPause}
            disabled={isStopping}
          />

          <StopButton
            onClick={onStop}
            disabled={isStopping}
            isLoading={isStopping}
          />

          {onDiscard && (
            <Tooltip content="Discard Recording" position="top">
              <Button
                variant="ghost"
                size="lg"
                onClick={onDiscard}
                disabled={isStopping}
                leftIcon={<Icon name="trash" />}
              >
                Discard
              </Button>
            </Tooltip>
          )}
        </>
      )}

      {/* Recording status indicator */}
      {isRecording && !isPaused && (
        <div className="flex items-center gap-2 ml-2">
          <span className="w-2.5 h-2.5 rounded-full bg-accent-error animate-pulse" />
          <span className="text-sm text-accent-error font-medium">REC</span>
        </div>
      )}

      {isPaused && (
        <div className="flex items-center gap-2 ml-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span className="text-sm text-amber-500 font-medium">PAUSED</span>
        </div>
      )}
    </div>
  );
}

RecordingControls.displayName = 'RecordingControls';
