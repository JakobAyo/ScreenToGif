/**
 * usePlayback Hook
 * Manages playback state and animation timing for frame preview
 */

import { useCallback, useEffect, useRef } from 'react';
import { useEditorStore, type PlaybackState } from '../../../stores/editorStore';
import { useProjectStore } from '../../../stores/projectStore';

export interface UsePlaybackReturn {
  // State
  playbackState: PlaybackState;
  currentFrameIndex: number;
  playbackSpeed: number;
  isLooping: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  isStopped: boolean;

  // Computed
  currentFrame: ReturnType<typeof useProjectStore.getState>['frames'][number] | undefined;
  totalFrames: number;
  currentTime: number; // in milliseconds
  totalDuration: number; // in milliseconds

  // Actions
  play: () => void;
  pause: () => void;
  stop: () => void;
  togglePlayback: () => void;
  setPlaybackSpeed: (speed: number) => void;
  setIsLooping: (looping: boolean) => void;

  // Navigation
  goToFrame: (index: number) => void;
  goToFirstFrame: () => void;
  goToLastFrame: () => void;
  goToNextFrame: () => void;
  goToPreviousFrame: () => void;
  stepForward: (steps?: number) => void;
  stepBackward: (steps?: number) => void;
}

export function usePlayback(): UsePlaybackReturn {
  const animationRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(0);

  // Editor store
  const {
    playbackState,
    currentFrameIndex,
    playbackSpeed,
    isLooping,
    play: storePlay,
    pause: storePause,
    stop: storeStop,
    togglePlayback: storeTogglePlayback,
    setCurrentFrameIndex,
    setPlaybackSpeed,
    setIsLooping,
    goToFirstFrame: storeGoToFirstFrame,
    goToLastFrame: storeGoToLastFrame,
    nextFrame,
    previousFrame,
  } = useEditorStore();

  // Project store
  const { frames, getTotalDuration, getFrameByIndex } = useProjectStore();

  // Computed values
  const isPlaying = playbackState === 'playing';
  const isPaused = playbackState === 'paused';
  const isStopped = playbackState === 'stopped';
  const totalFrames = frames.length;
  const currentFrame = getFrameByIndex(currentFrameIndex);
  const totalDuration = getTotalDuration();

  // Calculate current time based on frame delays
  const currentTime = frames
    .slice(0, currentFrameIndex)
    .reduce((sum, frame) => sum + frame.metadata.delay, 0);

  // Animation loop for playback
  useEffect(() => {
    if (!isPlaying || totalFrames === 0) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    const animate = (timestamp: number) => {
      if (!lastFrameTimeRef.current) {
        lastFrameTimeRef.current = timestamp;
      }

      const currentDelay = currentFrame?.metadata.delay ?? 100;
      const adjustedDelay = currentDelay / playbackSpeed;
      const elapsed = timestamp - lastFrameTimeRef.current;

      if (elapsed >= adjustedDelay) {
        lastFrameTimeRef.current = timestamp;

        const nextIndex = currentFrameIndex + 1;

        if (nextIndex >= totalFrames) {
          if (isLooping) {
            setCurrentFrameIndex(0);
          } else {
            storeStop();
            return;
          }
        } else {
          setCurrentFrameIndex(nextIndex);
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [
    isPlaying,
    currentFrameIndex,
    currentFrame,
    playbackSpeed,
    isLooping,
    totalFrames,
    setCurrentFrameIndex,
    storeStop,
  ]);

  // Reset frame time ref when playback starts
  useEffect(() => {
    if (isPlaying) {
      lastFrameTimeRef.current = 0;
    }
  }, [isPlaying]);

  // Playback controls
  const play = useCallback(() => {
    if (totalFrames > 0) {
      storePlay();
    }
  }, [storePlay, totalFrames]);

  const pause = useCallback(() => {
    storePause();
  }, [storePause]);

  const stop = useCallback(() => {
    storeStop();
  }, [storeStop]);

  const togglePlayback = useCallback(() => {
    if (totalFrames > 0) {
      storeTogglePlayback();
    }
  }, [storeTogglePlayback, totalFrames]);

  // Navigation
  const goToFrame = useCallback(
    (index: number) => {
      const clampedIndex = Math.max(0, Math.min(index, totalFrames - 1));
      setCurrentFrameIndex(clampedIndex);
    },
    [setCurrentFrameIndex, totalFrames]
  );

  const goToFirstFrame = useCallback(() => {
    storeGoToFirstFrame();
  }, [storeGoToFirstFrame]);

  const goToLastFrame = useCallback(() => {
    storeGoToLastFrame(totalFrames);
  }, [storeGoToLastFrame, totalFrames]);

  const goToNextFrame = useCallback(() => {
    if (currentFrameIndex < totalFrames - 1) {
      nextFrame();
    }
  }, [nextFrame, currentFrameIndex, totalFrames]);

  const goToPreviousFrame = useCallback(() => {
    previousFrame();
  }, [previousFrame]);

  const stepForward = useCallback(
    (steps: number = 1) => {
      const newIndex = Math.min(currentFrameIndex + steps, totalFrames - 1);
      setCurrentFrameIndex(newIndex);
    },
    [currentFrameIndex, totalFrames, setCurrentFrameIndex]
  );

  const stepBackward = useCallback(
    (steps: number = 1) => {
      const newIndex = Math.max(currentFrameIndex - steps, 0);
      setCurrentFrameIndex(newIndex);
    },
    [currentFrameIndex, setCurrentFrameIndex]
  );

  // Keyboard shortcuts for playback
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlayback();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (e.ctrlKey) {
            goToFirstFrame();
          } else {
            goToPreviousFrame();
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (e.ctrlKey) {
            goToLastFrame();
          } else {
            goToNextFrame();
          }
          break;
        case 'Home':
          e.preventDefault();
          goToFirstFrame();
          break;
        case 'End':
          e.preventDefault();
          goToLastFrame();
          break;
        case '+':
        case '=':
          if (e.ctrlKey) {
            e.preventDefault();
            setPlaybackSpeed(Math.min(playbackSpeed * 1.25, 4.0));
          }
          break;
        case '-':
          if (e.ctrlKey) {
            e.preventDefault();
            setPlaybackSpeed(Math.max(playbackSpeed / 1.25, 0.25));
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    togglePlayback,
    goToFirstFrame,
    goToLastFrame,
    goToNextFrame,
    goToPreviousFrame,
    playbackSpeed,
    setPlaybackSpeed,
  ]);

  return {
    // State
    playbackState,
    currentFrameIndex,
    playbackSpeed,
    isLooping,
    isPlaying,
    isPaused,
    isStopped,

    // Computed
    currentFrame,
    totalFrames,
    currentTime,
    totalDuration,

    // Actions
    play,
    pause,
    stop,
    togglePlayback,
    setPlaybackSpeed,
    setIsLooping,

    // Navigation
    goToFrame,
    goToFirstFrame,
    goToLastFrame,
    goToNextFrame,
    goToPreviousFrame,
    stepForward,
    stepBackward,
  };
}
