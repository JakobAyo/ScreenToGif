/**
 * useCapture Hook
 * Manages capture operations and backend integration
 */

import { useCallback, useEffect, useRef } from 'react';
import { useRecorderStore } from '../../../stores/recorderStore';
import {
  startCapture,
  stopCapture,
  pauseCapture,
  resumeCapture,
  discardCapture,
  getDisplays,
  getWindows,
  getCaptureStatus,
} from '../../../api/clients/captureClient';

export interface UseCaptureOptions {
  pollInterval?: number; // ms, for status polling during recording
  onStart?: () => void;
  onStop?: (frameCount: number, duration: number) => void;
  onPause?: () => void;
  onResume?: () => void;
  onError?: (error: Error) => void;
}

export function useCapture(options: UseCaptureOptions = {}) {
  const { pollInterval = 500, onStart, onStop, onPause, onResume, onError } = options;

  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const durationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordingStartTime = useRef<number | null>(null);
  const pausedDuration = useRef<number>(0);
  const pauseStartTime = useRef<number | null>(null);

  const {
    captureState,
    currentSession,
    isPaused,
    getCaptureOptions,
    canStartRecording,
    setCaptureState,
    setCurrentSession,
    setIsPaused,
    setAvailableDisplays,
    setAvailableWindows,
    setFrameCount,
    setRecordingDuration,
    setError,
    resetSession,
  } = useRecorderStore();

  // Refresh available capture sources
  const refreshSources = useCallback(async () => {
    try {
      const [displays, windows] = await Promise.all([getDisplays(), getWindows()]);
      setAvailableDisplays(displays);
      setAvailableWindows(windows);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to refresh sources');
      setError(error.message);
      onError?.(error);
    }
  }, [setAvailableDisplays, setAvailableWindows, setError, onError]);

  // Start duration tracking
  const startDurationTracking = useCallback(() => {
    recordingStartTime.current = Date.now();
    pausedDuration.current = 0;

    durationIntervalRef.current = setInterval(() => {
      if (recordingStartTime.current !== null) {
        const now = Date.now();
        const totalElapsed = now - recordingStartTime.current;
        const effectiveDuration = totalElapsed - pausedDuration.current;
        setRecordingDuration(effectiveDuration);
      }
    }, 100);
  }, [setRecordingDuration]);

  // Stop duration tracking
  const stopDurationTracking = useCallback(() => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    recordingStartTime.current = null;
    pausedDuration.current = 0;
    pauseStartTime.current = null;
  }, []);

  // Poll capture status
  const pollStatus = useCallback(async () => {
    if (!currentSession?.id) return;

    try {
      const status = await getCaptureStatus(currentSession.id);
      setFrameCount(status.frameCount);

      if (status.state === 'idle') {
        // Recording was stopped externally
        setCaptureState('idle');
        stopDurationTracking();
      }
    } catch (err) {
      // Ignore polling errors during normal operation
      console.warn('Status poll failed:', err);
    }
  }, [currentSession?.id, setFrameCount, setCaptureState, stopDurationTracking]);

  // Start polling
  const startPolling = useCallback(() => {
    if (pollIntervalRef.current) return;
    pollIntervalRef.current = setInterval(pollStatus, pollInterval);
  }, [pollStatus, pollInterval]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  // Start recording
  const start = useCallback(async () => {
    if (!canStartRecording()) {
      setError('Cannot start recording - check configuration');
      return;
    }

    setCaptureState('starting');
    setError(null);

    try {
      const options = getCaptureOptions();
      const response = await startCapture(options);

      if (response.success) {
        setCurrentSession({
          id: response.sessionId,
          state: 'recording',
          options,
          frameCount: 0,
          duration: 0,
          startedAt: new Date().toISOString(),
        });
        setCaptureState('recording');
        setIsPaused(false);
        startDurationTracking();
        startPolling();
        onStart?.();
      } else {
        throw new Error(response.error || 'Failed to start capture');
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to start capture');
      setCaptureState('idle');
      setError(error.message);
      onError?.(error);
    }
  }, [
    canStartRecording,
    getCaptureOptions,
    setCaptureState,
    setCurrentSession,
    setIsPaused,
    setError,
    startDurationTracking,
    startPolling,
    onStart,
    onError,
  ]);

  // Stop recording
  const stop = useCallback(async () => {
    if (!currentSession?.id) return;

    setCaptureState('stopping');

    try {
      const response = await stopCapture(currentSession.id);
      stopPolling();
      stopDurationTracking();

      if (response.success) {
        const finalFrameCount = response.frameCount;
        const finalDuration = response.duration;
        resetSession();
        onStop?.(finalFrameCount, finalDuration);
      } else {
        throw new Error(response.error || 'Failed to stop capture');
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to stop capture');
      setCaptureState('recording');
      setError(error.message);
      onError?.(error);
    }
  }, [
    currentSession?.id,
    setCaptureState,
    stopPolling,
    stopDurationTracking,
    resetSession,
    setError,
    onStop,
    onError,
  ]);

  // Pause recording
  const pause = useCallback(async () => {
    if (!currentSession?.id || isPaused) return;

    try {
      await pauseCapture(currentSession.id);
      setIsPaused(true);
      pauseStartTime.current = Date.now();
      onPause?.();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to pause capture');
      setError(error.message);
      onError?.(error);
    }
  }, [currentSession?.id, isPaused, setIsPaused, setError, onPause, onError]);

  // Resume recording
  const resume = useCallback(async () => {
    if (!currentSession?.id || !isPaused) return;

    try {
      await resumeCapture(currentSession.id);
      setIsPaused(false);

      // Track paused duration
      if (pauseStartTime.current !== null) {
        pausedDuration.current += Date.now() - pauseStartTime.current;
        pauseStartTime.current = null;
      }

      onResume?.();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to resume capture');
      setError(error.message);
      onError?.(error);
    }
  }, [currentSession?.id, isPaused, setIsPaused, setError, onResume, onError]);

  // Toggle pause/resume
  const togglePause = useCallback(async () => {
    if (isPaused) {
      await resume();
    } else {
      await pause();
    }
  }, [isPaused, pause, resume]);

  // Discard recording
  const discard = useCallback(async () => {
    if (!currentSession?.id) return;

    try {
      await discardCapture(currentSession.id);
      stopPolling();
      stopDurationTracking();
      resetSession();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to discard capture');
      setError(error.message);
      onError?.(error);
    }
  }, [currentSession?.id, stopPolling, stopDurationTracking, resetSession, setError, onError]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
      stopDurationTracking();
    };
  }, [stopPolling, stopDurationTracking]);

  // Initial source refresh
  useEffect(() => {
    refreshSources();
  }, [refreshSources]);

  return {
    // State
    captureState,
    isPaused,
    isRecording: captureState === 'recording',
    isIdle: captureState === 'idle',
    canStart: canStartRecording(),
    currentSession,

    // Actions
    start,
    stop,
    pause,
    resume,
    togglePause,
    discard,
    refreshSources,
  };
}
