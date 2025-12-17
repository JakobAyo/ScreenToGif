/**
 * Frame Stream
 * Real-time frame data streaming during capture
 */

import { getWebSocketManager } from './WebSocketManager';

/** Frame data received from WebSocket */
export interface StreamedFrame {
  index: number;
  timestamp: number;
  imageData: string; // Base64 encoded
  width: number;
  height: number;
  delay: number;
  cursorX?: number;
  cursorY?: number;
  mouseClicked?: boolean;
}

/** Frame stream event types */
export type FrameStreamEvent =
  | { type: 'frame'; frame: StreamedFrame }
  | { type: 'started'; sessionId: string }
  | { type: 'paused' }
  | { type: 'resumed' }
  | { type: 'stopped'; totalFrames: number }
  | { type: 'error'; error: string };

type FrameStreamHandler = (event: FrameStreamEvent) => void;

class FrameStreamManager {
  private handlers: Set<FrameStreamHandler> = new Set();
  private unsubscribers: (() => void)[] = [];
  private isActive = false;
  private sessionId: string | null = null;
  private frameBuffer: StreamedFrame[] = [];
  private maxBufferSize = 10;
  private lastFrameIndex = -1;

  /**
   * Start listening to frame stream
   */
  start(sessionId: string): void {
    if (this.isActive) {
      return;
    }

    this.sessionId = sessionId;
    this.isActive = true;
    this.frameBuffer = [];
    this.lastFrameIndex = -1;

    const ws = getWebSocketManager();

    // Subscribe to frame messages
    const unsubFrame = ws.subscribe<StreamedFrame>('capture:frame', (message) => {
      this.handleFrame(message.payload!);
    });

    const unsubStarted = ws.subscribe<{ sessionId: string }>('capture:started', (message) => {
      this.emit({ type: 'started', sessionId: message.payload!.sessionId });
    });

    const unsubPaused = ws.subscribe('capture:paused', () => {
      this.emit({ type: 'paused' });
    });

    const unsubResumed = ws.subscribe('capture:resumed', () => {
      this.emit({ type: 'resumed' });
    });

    const unsubStopped = ws.subscribe<{ totalFrames: number }>('capture:stopped', (message) => {
      this.emit({ type: 'stopped', totalFrames: message.payload!.totalFrames });
    });

    const unsubError = ws.subscribe<{ error: string }>('capture:error', (message) => {
      this.emit({ type: 'error', error: message.payload!.error });
    });

    this.unsubscribers = [
      unsubFrame,
      unsubStarted,
      unsubPaused,
      unsubResumed,
      unsubStopped,
      unsubError,
    ];

    // Request to start receiving frames
    ws.send('capture:subscribe', { sessionId });
  }

  /**
   * Stop listening to frame stream
   */
  stop(): void {
    if (!this.isActive) {
      return;
    }

    // Unsubscribe from all messages
    this.unsubscribers.forEach((unsub) => unsub());
    this.unsubscribers = [];

    // Tell server to stop sending frames
    const ws = getWebSocketManager();
    ws.send('capture:unsubscribe', { sessionId: this.sessionId });

    this.isActive = false;
    this.sessionId = null;
    this.frameBuffer = [];
  }

  /**
   * Subscribe to frame stream events
   */
  subscribe(handler: FrameStreamHandler): () => void {
    this.handlers.add(handler);
    return () => {
      this.handlers.delete(handler);
    };
  }

  /**
   * Get buffered frames
   */
  getBufferedFrames(): StreamedFrame[] {
    return [...this.frameBuffer];
  }

  /**
   * Clear frame buffer
   */
  clearBuffer(): void {
    this.frameBuffer = [];
  }

  /**
   * Check if stream is active
   */
  isStreaming(): boolean {
    return this.isActive;
  }

  /**
   * Get current session ID
   */
  getSessionId(): string | null {
    return this.sessionId;
  }

  /**
   * Get last received frame index
   */
  getLastFrameIndex(): number {
    return this.lastFrameIndex;
  }

  private handleFrame(frame: StreamedFrame): void {
    // Check for out-of-order frames
    if (frame.index <= this.lastFrameIndex) {
      console.warn(`Out of order frame received: ${frame.index}, expected > ${this.lastFrameIndex}`);
      return;
    }

    // Check for dropped frames
    if (frame.index > this.lastFrameIndex + 1) {
      console.warn(`Dropped frames detected: ${this.lastFrameIndex + 1} - ${frame.index - 1}`);
    }

    this.lastFrameIndex = frame.index;

    // Add to buffer
    this.frameBuffer.push(frame);
    if (this.frameBuffer.length > this.maxBufferSize) {
      this.frameBuffer.shift();
    }

    // Emit event
    this.emit({ type: 'frame', frame });
  }

  private emit(event: FrameStreamEvent): void {
    this.handlers.forEach((handler) => {
      try {
        handler(event);
      } catch (error) {
        console.error('Frame stream handler error:', error);
      }
    });
  }
}

// Singleton instance
let instance: FrameStreamManager | null = null;

/**
 * Get frame stream manager instance
 */
export function getFrameStream(): FrameStreamManager {
  if (!instance) {
    instance = new FrameStreamManager();
  }
  return instance;
}

/**
 * React hook-friendly subscription
 */
export function subscribeToFrameStream(
  sessionId: string,
  handler: FrameStreamHandler
): () => void {
  const stream = getFrameStream();
  stream.start(sessionId);
  const unsubscribe = stream.subscribe(handler);

  return () => {
    unsubscribe();
    // Only stop if no more handlers
    if (stream['handlers'].size === 0) {
      stream.stop();
    }
  };
}
