/**
 * useWebcam Hook
 * Manages webcam device access and streaming
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import type { WebcamDevice } from '../components/WebcamPreview';

export interface UseWebcamOptions {
  autoStart?: boolean;
  defaultDeviceId?: string;
  onError?: (error: Error) => void;
}

export interface UseWebcamReturn {
  // State
  devices: WebcamDevice[];
  selectedDeviceId: string | null;
  stream: MediaStream | null;
  isLoading: boolean;
  error: Error | null;
  isEnabled: boolean;

  // Actions
  selectDevice: (deviceId: string) => Promise<void>;
  startStream: () => Promise<void>;
  stopStream: () => void;
  refreshDevices: () => Promise<void>;
  toggle: () => Promise<void>;
}

export function useWebcam(options: UseWebcamOptions = {}): UseWebcamReturn {
  const { autoStart = false, defaultDeviceId, onError } = options;

  const [devices, setDevices] = useState<WebcamDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(defaultDeviceId ?? null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isEnabled, setIsEnabled] = useState(false);

  const streamRef = useRef<MediaStream | null>(null);

  // Refresh available devices
  const refreshDevices = useCallback(async () => {
    try {
      // Request permission first (needed to get device labels)
      await navigator.mediaDevices.getUserMedia({ video: true }).then((s) => {
        s.getTracks().forEach((t) => t.stop());
      });

      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices
        .filter((d) => d.kind === 'videoinput')
        .map((d) => ({
          deviceId: d.deviceId,
          label: d.label || `Camera ${d.deviceId.slice(0, 8)}`,
        }));

      setDevices(videoDevices);

      // Auto-select first device if none selected
      if (!selectedDeviceId && videoDevices.length > 0) {
        setSelectedDeviceId(videoDevices[0].deviceId);
      }
    } catch (err) {
      const error =
        err instanceof Error
          ? err
          : new Error('Failed to enumerate video devices');
      setError(error);
      onError?.(error);
    }
  }, [selectedDeviceId, onError]);

  // Stop current stream
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setStream(null);
    setIsEnabled(false);
  }, []);

  // Start stream with selected device
  const startStream = useCallback(async () => {
    if (!selectedDeviceId) {
      const error = new Error('No webcam device selected');
      setError(error);
      onError?.(error);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Stop existing stream
    stopStream();

    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: { exact: selectedDeviceId },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = newStream;
      setStream(newStream);
      setIsEnabled(true);
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('Failed to start webcam stream');
      setError(error);
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDeviceId, stopStream, onError]);

  // Select a different device
  const selectDevice = useCallback(
    async (deviceId: string) => {
      setSelectedDeviceId(deviceId);

      // If currently streaming, restart with new device
      if (isEnabled) {
        // Need to stop first, then start with new device
        stopStream();
        // Use setTimeout to ensure state update before restart
        setTimeout(async () => {
          try {
            const newStream = await navigator.mediaDevices.getUserMedia({
              video: {
                deviceId: { exact: deviceId },
                width: { ideal: 1280 },
                height: { ideal: 720 },
              },
              audio: false,
            });

            streamRef.current = newStream;
            setStream(newStream);
            setIsEnabled(true);
          } catch (err) {
            const error =
              err instanceof Error
                ? err
                : new Error('Failed to switch webcam device');
            setError(error);
            onError?.(error);
          }
        }, 100);
      }
    },
    [isEnabled, stopStream, onError]
  );

  // Toggle webcam on/off
  const toggle = useCallback(async () => {
    if (isEnabled) {
      stopStream();
    } else {
      await startStream();
    }
  }, [isEnabled, startStream, stopStream]);

  // Initial setup
  useEffect(() => {
    refreshDevices().then(() => {
      if (autoStart) {
        startStream();
      }
    });

    // Handle device changes
    const handleDeviceChange = () => {
      refreshDevices();
    };

    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);

    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
      stopStream();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    devices,
    selectedDeviceId,
    stream,
    isLoading,
    error,
    isEnabled,
    selectDevice,
    startStream,
    stopStream,
    refreshDevices,
    toggle,
  };
}
