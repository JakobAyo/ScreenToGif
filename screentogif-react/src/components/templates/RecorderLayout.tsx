import { type ReactNode } from 'react';
import { Button } from '../atoms/Button';
import { Icon } from '../atoms/Icon';
import { Tooltip } from '../molecules/Tooltip';
import { StatusBar, type StatusType } from '../organisms/StatusBar';

export interface RecorderLayoutProps {
  // Recording state
  isRecording?: boolean;
  isPaused?: boolean;
  duration?: number; // in milliseconds
  frameCount?: number;
  fps?: number;

  // Capture area
  captureWidth?: number;
  captureHeight?: number;

  // Callbacks
  onRecord?: () => void;
  onPause?: () => void;
  onStop?: () => void;
  onDiscard?: () => void;
  onSettings?: () => void;
  onMinimize?: () => void;
  onClose?: () => void;

  // Custom content
  children?: ReactNode;
  className?: string;
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const remainingMs = ms % 1000;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}.${Math.floor(remainingMs / 10).toString().padStart(2, '0')}`;
}

export function RecorderLayout({
  isRecording = false,
  isPaused = false,
  duration = 0,
  frameCount = 0,
  fps = 0,
  captureWidth = 0,
  captureHeight = 0,
  onRecord,
  onPause,
  onStop,
  onDiscard,
  onSettings,
  onMinimize,
  onClose,
  children,
  className = '',
}: RecorderLayoutProps) {
  const status: StatusType = isRecording ? (isPaused ? 'warning' : 'recording') : 'idle';
  const statusMessage = isRecording
    ? isPaused
      ? 'Paused'
      : 'Recording'
    : 'Ready';

  return (
    <div className={`flex flex-col h-screen bg-surface-900 ${className}`}>
      {/* Title bar / Header */}
      <header className="flex items-center justify-between h-10 px-2 bg-surface-800 border-b border-surface-700 drag-region">
        <div className="flex items-center gap-2 no-drag">
          <Icon name="record" size="sm" className="text-accent-error" />
          <span className="text-sm font-medium text-surface-200">Screen Recorder</span>
        </div>

        <div className="flex items-center gap-1 no-drag">
          <Tooltip content="Settings" position="bottom">
            <button
              onClick={onSettings}
              className="p-1.5 text-surface-400 hover:text-surface-200 hover:bg-surface-700 rounded transition-colors"
            >
              <Icon name="cog" size="sm" />
            </button>
          </Tooltip>
          <Tooltip content="Minimize" position="bottom">
            <button
              onClick={onMinimize}
              className="p-1.5 text-surface-400 hover:text-surface-200 hover:bg-surface-700 rounded transition-colors"
            >
              <Icon name="minus" size="sm" />
            </button>
          </Tooltip>
          <Tooltip content="Close" position="bottom">
            <button
              onClick={onClose}
              className="p-1.5 text-surface-400 hover:text-surface-200 hover:bg-accent-error rounded transition-colors"
            >
              <Icon name="close" size="sm" />
            </button>
          </Tooltip>
        </div>
      </header>

      {/* Main capture area */}
      <main className="flex-1 flex items-center justify-center bg-transparent relative">
        {/* Capture frame indicator */}
        {captureWidth > 0 && captureHeight > 0 && (
          <div
            className="absolute border-2 border-dashed border-primary-500/50 rounded-lg pointer-events-none"
            style={{
              width: captureWidth,
              height: captureHeight,
            }}
          >
            {/* Corner indicators */}
            <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-primary-500" />
            <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-primary-500" />
            <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-primary-500" />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-primary-500" />
          </div>
        )}

        {children}
      </main>

      {/* Recording controls */}
      <div className="flex items-center justify-center gap-3 py-4 px-4 bg-surface-800 border-t border-surface-700">
        {/* Duration display */}
        <div className="flex items-center gap-2 min-w-[100px]">
          <span
            className={`
              font-mono text-lg tabular-nums
              ${isRecording && !isPaused ? 'text-accent-error' : 'text-surface-300'}
            `}
          >
            {formatDuration(duration)}
          </span>
          {isRecording && !isPaused && (
            <span className="w-2 h-2 rounded-full bg-accent-error animate-pulse" />
          )}
        </div>

        {/* Main controls */}
        <div className="flex items-center gap-2">
          {!isRecording ? (
            <Tooltip content="Start Recording (F7)" position="top">
              <Button
                variant="primary"
                size="lg"
                onClick={onRecord}
                leftIcon={<Icon name="record" />}
                className="!bg-accent-error hover:!bg-accent-error-light"
              >
                Record
              </Button>
            </Tooltip>
          ) : (
            <>
              <Tooltip content={isPaused ? 'Resume (F7)' : 'Pause (F7)'} position="top">
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={onPause}
                  leftIcon={<Icon name={isPaused ? 'play' : 'pause'} />}
                >
                  {isPaused ? 'Resume' : 'Pause'}
                </Button>
              </Tooltip>
              <Tooltip content="Stop Recording (F8)" position="top">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={onStop}
                  leftIcon={<Icon name="stop" />}
                >
                  Stop
                </Button>
              </Tooltip>
              <Tooltip content="Discard Recording" position="top">
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={onDiscard}
                  leftIcon={<Icon name="trash" />}
                >
                  Discard
                </Button>
              </Tooltip>
            </>
          )}
        </div>

        {/* Frame/FPS info */}
        <div className="flex items-center gap-3 min-w-[100px] justify-end text-sm text-surface-400">
          <span className="font-mono tabular-nums">{frameCount} frames</span>
          {fps > 0 && (
            <span className="font-mono tabular-nums">{fps.toFixed(1)} fps</span>
          )}
        </div>
      </div>

      {/* Status bar */}
      <StatusBar
        status={status}
        statusMessage={statusMessage}
        leftItems={
          captureWidth > 0 && captureHeight > 0
            ? [
                {
                  id: 'dimensions',
                  content: `${captureWidth} x ${captureHeight}`,
                  icon: 'photo',
                  tooltip: 'Capture dimensions',
                },
              ]
            : []
        }
        rightItems={[
          {
            id: 'hotkeys',
            content: 'F7: Record/Pause | F8: Stop',
            tooltip: 'Keyboard shortcuts',
          },
        ]}
      />
    </div>
  );
}
