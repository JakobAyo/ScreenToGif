/**
 * RecorderPage Component
 * Full recorder page with region selection, recording controls, and keyboard shortcuts
 */

import { useState, useCallback, useMemo, type ChangeEvent } from 'react';
import { useRecorderStore } from '../../../stores/recorderStore';
import { useHotkeys } from '../../../hooks/useHotkeys';
import { Icon } from '../../../components/atoms/Icon';
import { Slider } from '../../../components/atoms/Slider';
import { Toggle } from '../../../components/atoms/Toggle';
import { Tooltip } from '../../../components/molecules/Tooltip';
import { StatusBar, type StatusType } from '../../../components/organisms/StatusBar';
import { RegionSelector } from '../components/RegionSelector';
import { RecordingControls } from '../components/RecordingControls';
import { RecordingTimer } from '../components/RecordingTimer';
import { CaptureSourceSelector } from '../components/CaptureSourceSelector';
import { WebcamPreview } from '../components/WebcamPreview';
import { useCapture } from '../hooks/useCapture';
import { useWebcam } from '../hooks/useWebcam';

export interface RecorderPageProps {
  onClose?: () => void;
  onRecordingComplete?: (frameCount: number, duration: number) => void;
  className?: string;
}

export function RecorderPage({
  onClose,
  onRecordingComplete,
  className = '',
}: RecorderPageProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [showWebcam, setShowWebcam] = useState(false);
  const [webcamPosition, setWebcamPosition] = useState<'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'>('bottom-right');
  const [webcamSize, setWebcamSize] = useState<'small' | 'medium' | 'large'>('medium');

  // Store state
  const {
    captureMode,
    selectedRegion,
    selectedDisplayId,
    selectedWindowId,
    frameRate,
    captureMouseCursor,
    captureMouseClicks,
    availableDisplays,
    availableWindows,
    frameCount,
    recordingDuration,
    error,
    setCaptureMode,
    setSelectedRegion,
    setSelectedDisplayId,
    setSelectedWindowId,
    setFrameRate,
    setCaptureMouseCursor,
    setCaptureMouseClicks,
    clearError,
  } = useRecorderStore();

  // Capture hook
  const {
    captureState,
    isPaused,
    canStart,
    start,
    stop,
    togglePause,
    discard,
    refreshSources,
  } = useCapture({
    onStop: (frames, duration) => {
      onRecordingComplete?.(frames, duration);
    },
    onError: (err) => {
      console.error('Capture error:', err);
    },
  });

  // Webcam hook
  const webcam = useWebcam({
    onError: (err) => {
      console.error('Webcam error:', err);
    },
  });

  // Computed states
  const isRecording = captureState === 'recording' || captureState === 'paused';
  const isIdle = captureState === 'idle';
  const isStarting = captureState === 'starting';
  const isStopping = captureState === 'stopping';

  // Status bar configuration
  const status: StatusType = isRecording
    ? isPaused
      ? 'warning'
      : 'recording'
    : isStarting || isStopping
      ? 'processing'
      : error
        ? 'error'
        : 'idle';

  const statusMessage = isRecording
    ? isPaused
      ? 'Paused'
      : 'Recording'
    : isStarting
      ? 'Starting...'
      : isStopping
        ? 'Stopping...'
        : error
          ? error
          : 'Ready';

  // Keyboard shortcuts
  const handleRecordHotkey = useCallback(() => {
    if (isIdle && canStart) {
      start();
    } else if (isRecording) {
      togglePause();
    }
  }, [isIdle, isRecording, canStart, start, togglePause]);

  const handleStopHotkey = useCallback(() => {
    if (isRecording) {
      stop();
    }
  }, [isRecording, stop]);

  const handleDiscardHotkey = useCallback(() => {
    if (isRecording) {
      discard();
    }
  }, [isRecording, discard]);

  const hotkeys = useMemo(
    () => [
      {
        key: 'F7',
        callback: handleRecordHotkey,
        description: 'Start/Pause Recording',
      },
      {
        key: 'F8',
        callback: handleStopHotkey,
        description: 'Stop Recording',
      },
      {
        key: 'F9',
        callback: handleDiscardHotkey,
        description: 'Discard Recording',
      },
      {
        key: 'Escape',
        callback: () => {
          if (showSettings) {
            setShowSettings(false);
          } else if (!isRecording && onClose) {
            onClose();
          }
        },
        description: 'Close/Cancel',
      },
    ],
    [handleRecordHotkey, handleStopHotkey, handleDiscardHotkey, showSettings, isRecording, onClose]
  );

  useHotkeys(hotkeys);

  // Capture dimensions
  const captureDimensions = useMemo(() => {
    if (captureMode === 'region' && selectedRegion) {
      return { width: selectedRegion.width, height: selectedRegion.height };
    }
    if (captureMode === 'screen' && selectedDisplayId) {
      const display = availableDisplays.find((d) => d.id === selectedDisplayId);
      if (display) {
        return { width: display.width, height: display.height };
      }
    }
    if (captureMode === 'window' && selectedWindowId) {
      const window = availableWindows.find((w) => w.id === selectedWindowId);
      if (window) {
        return { width: window.bounds.width, height: window.bounds.height };
      }
    }
    return null;
  }, [captureMode, selectedRegion, selectedDisplayId, selectedWindowId, availableDisplays, availableWindows]);

  return (
    <div className={`flex flex-col h-screen bg-surface-900 ${className}`}>
      {/* Header */}
      <header className="flex items-center justify-between h-12 px-4 bg-surface-800 border-b border-surface-700">
        <div className="flex items-center gap-3">
          <Icon name="record" size="md" className="text-accent-error" />
          <span className="text-sm font-medium text-surface-200">Screen Recorder</span>

          {/* Recording timer */}
          {isRecording && (
            <div className="ml-4 pl-4 border-l border-surface-600">
              <RecordingTimer
                duration={recordingDuration}
                isRecording
                isPaused={isPaused}
                frameCount={frameCount}
                fps={frameRate}
                size="sm"
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Webcam toggle */}
          <Tooltip content={showWebcam ? 'Hide webcam' : 'Show webcam'} position="bottom">
            <button
              onClick={() => {
                if (!showWebcam) {
                  webcam.startStream();
                } else {
                  webcam.stopStream();
                }
                setShowWebcam(!showWebcam);
              }}
              className={`
                p-2 rounded transition-colors
                ${showWebcam
                  ? 'bg-primary-500/20 text-primary-400'
                  : 'text-surface-400 hover:text-surface-200 hover:bg-surface-700'
                }
              `}
            >
              <Icon name={showWebcam ? 'eye' : 'eye-slash'} size="sm" />
            </button>
          </Tooltip>

          {/* Settings toggle */}
          <Tooltip content="Settings" position="bottom">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`
                p-2 rounded transition-colors
                ${showSettings
                  ? 'bg-primary-500/20 text-primary-400'
                  : 'text-surface-400 hover:text-surface-200 hover:bg-surface-700'
                }
              `}
            >
              <Icon name="cog" size="sm" />
            </button>
          </Tooltip>

          {/* Close button */}
          {onClose && (
            <Tooltip content="Close (Esc)" position="bottom">
              <button
                onClick={onClose}
                disabled={isRecording}
                className="p-2 text-surface-400 hover:text-surface-200 hover:bg-accent-error/20 rounded transition-colors disabled:opacity-50"
              >
                <Icon name="close" size="sm" />
              </button>
            </Tooltip>
          )}
        </div>
      </header>

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Settings sidebar */}
        {showSettings && (
          <aside className="w-80 bg-surface-800 border-r border-surface-700 overflow-y-auto">
            <div className="p-4 space-y-6">
              {/* Capture Source */}
              <div>
                <h3 className="text-sm font-medium text-surface-200 mb-3">Capture Source</h3>
                <CaptureSourceSelector
                  mode={captureMode}
                  displays={availableDisplays}
                  windows={availableWindows}
                  selectedDisplayId={selectedDisplayId}
                  selectedWindowId={selectedWindowId}
                  onModeChange={setCaptureMode}
                  onDisplaySelect={setSelectedDisplayId}
                  onWindowSelect={setSelectedWindowId}
                  onRefresh={refreshSources}
                  isLoading={isStarting}
                />
              </div>

              {/* Recording Settings */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-surface-200">Recording Settings</h3>

                {/* Frame rate */}
                <div>
                  <label className="block text-xs text-surface-400 mb-2">
                    Frame Rate: {frameRate} fps
                  </label>
                  <Slider
                    value={frameRate}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFrameRate(Number(e.target.value))}
                    min={1}
                    max={60}
                    step={1}
                    disabled={isRecording}
                  />
                </div>

                {/* Mouse cursor */}
                <div className="flex items-center justify-between">
                  <label className="text-sm text-surface-300">Capture mouse cursor</label>
                  <Toggle
                    checked={captureMouseCursor}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setCaptureMouseCursor(e.target.checked)}
                    disabled={isRecording}
                    size="sm"
                  />
                </div>

                {/* Mouse clicks */}
                <div className="flex items-center justify-between">
                  <label className="text-sm text-surface-300">Highlight mouse clicks</label>
                  <Toggle
                    checked={captureMouseClicks}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setCaptureMouseClicks(e.target.checked)}
                    disabled={isRecording}
                    size="sm"
                  />
                </div>
              </div>

              {/* Keyboard Shortcuts */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-surface-200">Keyboard Shortcuts</h3>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-surface-400">
                    <span>Start/Pause</span>
                    <kbd className="px-1.5 py-0.5 bg-surface-700 rounded">F7</kbd>
                  </div>
                  <div className="flex justify-between text-surface-400">
                    <span>Stop</span>
                    <kbd className="px-1.5 py-0.5 bg-surface-700 rounded">F8</kbd>
                  </div>
                  <div className="flex justify-between text-surface-400">
                    <span>Discard</span>
                    <kbd className="px-1.5 py-0.5 bg-surface-700 rounded">F9</kbd>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* Preview area */}
        <main className="flex-1 relative bg-surface-900">
          {/* Region selector for region mode */}
          {captureMode === 'region' && (
            <RegionSelector
              region={selectedRegion}
              onChange={setSelectedRegion}
              showDimensions
              showOverlay={!isRecording}
              className="absolute inset-0"
            />
          )}

          {/* Preview placeholder for screen/window mode */}
          {(captureMode === 'screen' || captureMode === 'window') && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-surface-400">
                <Icon name="photo" size="xl" className="mx-auto mb-4 opacity-50" />
                <p className="text-sm">
                  {captureMode === 'screen'
                    ? selectedDisplayId
                      ? `Selected: ${availableDisplays.find((d) => d.id === selectedDisplayId)?.name || 'Display'}`
                      : 'Select a display to capture'
                    : selectedWindowId
                      ? `Selected: ${availableWindows.find((w) => w.id === selectedWindowId)?.title || 'Window'}`
                      : 'Select a window to capture'
                  }
                </p>
                {captureDimensions && (
                  <p className="text-xs mt-2 text-surface-500">
                    {captureDimensions.width} x {captureDimensions.height}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Webcam preview overlay */}
          {showWebcam && (
            <WebcamPreview
              devices={webcam.devices}
              selectedDeviceId={webcam.selectedDeviceId}
              onDeviceChange={webcam.selectDevice}
              stream={webcam.stream}
              position={webcamPosition}
              onPositionChange={setWebcamPosition}
              size={webcamSize}
              onSizeChange={setWebcamSize}
              onClose={() => {
                webcam.stopStream();
                setShowWebcam(false);
              }}
            />
          )}

          {/* Error display */}
          {error && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-accent-error/90 text-white rounded-lg flex items-center gap-2">
              <Icon name="exclamation-circle" size="sm" />
              <span className="text-sm">{error}</span>
              <button onClick={clearError} className="ml-2 hover:opacity-80">
                <Icon name="close" size="xs" />
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Recording controls bar */}
      <div className="flex items-center justify-center gap-6 py-4 px-6 bg-surface-800 border-t border-surface-700">
        {/* Capture dimensions display */}
        {captureDimensions && (
          <div className="flex items-center gap-2 text-sm text-surface-400">
            <Icon name="photo" size="sm" />
            <span className="font-mono">
              {captureDimensions.width} x {captureDimensions.height}
            </span>
          </div>
        )}

        {/* Recording timer (larger, when recording) */}
        {isRecording && (
          <RecordingTimer
            duration={recordingDuration}
            isRecording
            isPaused={isPaused}
            frameCount={frameCount}
            fps={frameRate}
            size="lg"
          />
        )}

        {/* Main controls */}
        <RecordingControls
          captureState={captureState}
          isPaused={isPaused}
          canStart={canStart}
          onRecord={start}
          onPause={togglePause}
          onStop={stop}
          onDiscard={discard}
        />

        {/* Frame rate display */}
        {isIdle && (
          <div className="flex items-center gap-2 text-sm text-surface-400">
            <Icon name="clock" size="sm" />
            <span className="font-mono">{frameRate} fps</span>
          </div>
        )}
      </div>

      {/* Status bar */}
      <StatusBar
        status={status}
        statusMessage={statusMessage}
        rightItems={[
          {
            id: 'shortcuts',
            content: 'F7: Record | F8: Stop | F9: Discard',
            tooltip: 'Keyboard shortcuts',
          },
        ]}
      />
    </div>
  );
}

RecorderPage.displayName = 'RecorderPage';
