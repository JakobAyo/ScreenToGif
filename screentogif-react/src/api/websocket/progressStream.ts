/**
 * Progress Stream
 * Real-time encoding/processing progress updates
 */

import { getWebSocketManager } from './WebSocketManager';
import type { EncodingProgress, UploadProgress } from '../types';

/** Progress stream event types */
export type ProgressStreamEvent =
  | { type: 'encoding:progress'; progress: EncodingProgress }
  | { type: 'encoding:started'; jobId: string }
  | { type: 'encoding:completed'; jobId: string; outputPath: string; fileSize: number }
  | { type: 'encoding:failed'; jobId: string; error: string }
  | { type: 'encoding:cancelled'; jobId: string }
  | { type: 'upload:progress'; progress: UploadProgress }
  | { type: 'upload:completed'; uploadId: string; url: string }
  | { type: 'upload:failed'; uploadId: string; error: string }
  | { type: 'processing:progress'; operationId: string; progress: number; stage: string }
  | { type: 'processing:completed'; operationId: string }
  | { type: 'processing:failed'; operationId: string; error: string };

type ProgressStreamHandler = (event: ProgressStreamEvent) => void;

class ProgressStreamManager {
  private handlers: Set<ProgressStreamHandler> = new Set();
  private jobHandlers: Map<string, Set<ProgressStreamHandler>> = new Map();
  private unsubscribers: (() => void)[] = [];
  private isSubscribed = false;

  /**
   * Subscribe to all progress events
   */
  subscribeAll(handler: ProgressStreamHandler): () => void {
    this.handlers.add(handler);
    this.ensureSubscribed();

    return () => {
      this.handlers.delete(handler);
      this.checkUnsubscribe();
    };
  }

  /**
   * Subscribe to a specific job's progress
   */
  subscribeToJob(jobId: string, handler: ProgressStreamHandler): () => void {
    if (!this.jobHandlers.has(jobId)) {
      this.jobHandlers.set(jobId, new Set());
    }
    this.jobHandlers.get(jobId)!.add(handler);
    this.ensureSubscribed();

    // Tell server to send updates for this job
    const ws = getWebSocketManager();
    ws.send('progress:subscribe', { jobId });

    return () => {
      this.jobHandlers.get(jobId)?.delete(handler);
      if (this.jobHandlers.get(jobId)?.size === 0) {
        this.jobHandlers.delete(jobId);
        ws.send('progress:unsubscribe', { jobId });
      }
      this.checkUnsubscribe();
    };
  }

  /**
   * Subscribe to encoding progress for a job
   */
  subscribeToEncoding(jobId: string, handler: (progress: EncodingProgress) => void): () => void {
    return this.subscribeToJob(jobId, (event) => {
      if (event.type === 'encoding:progress' && event.progress.jobId === jobId) {
        handler(event.progress);
      }
    });
  }

  /**
   * Subscribe to upload progress
   */
  subscribeToUpload(uploadId: string, handler: (progress: UploadProgress) => void): () => void {
    return this.subscribeToJob(uploadId, (event) => {
      if (event.type === 'upload:progress' && event.progress.uploadId === uploadId) {
        handler(event.progress);
      }
    });
  }

  private ensureSubscribed(): void {
    if (this.isSubscribed) {
      return;
    }

    const ws = getWebSocketManager();

    // Encoding progress
    const unsubEncodingProgress = ws.subscribe<EncodingProgress>('encoding:progress', (message) => {
      this.emit({ type: 'encoding:progress', progress: message.payload! });
    });

    const unsubEncodingStarted = ws.subscribe<{ jobId: string }>('encoding:started', (message) => {
      this.emit({ type: 'encoding:started', jobId: message.payload!.jobId });
    });

    const unsubEncodingCompleted = ws.subscribe<{ jobId: string; outputPath: string; fileSize: number }>(
      'encoding:completed',
      (message) => {
        this.emit({
          type: 'encoding:completed',
          jobId: message.payload!.jobId,
          outputPath: message.payload!.outputPath,
          fileSize: message.payload!.fileSize,
        });
      }
    );

    const unsubEncodingFailed = ws.subscribe<{ jobId: string; error: string }>(
      'encoding:failed',
      (message) => {
        this.emit({
          type: 'encoding:failed',
          jobId: message.payload!.jobId,
          error: message.payload!.error,
        });
      }
    );

    const unsubEncodingCancelled = ws.subscribe<{ jobId: string }>('encoding:cancelled', (message) => {
      this.emit({ type: 'encoding:cancelled', jobId: message.payload!.jobId });
    });

    // Upload progress
    const unsubUploadProgress = ws.subscribe<UploadProgress>('upload:progress', (message) => {
      this.emit({ type: 'upload:progress', progress: message.payload! });
    });

    const unsubUploadCompleted = ws.subscribe<{ uploadId: string; url: string }>(
      'upload:completed',
      (message) => {
        this.emit({
          type: 'upload:completed',
          uploadId: message.payload!.uploadId,
          url: message.payload!.url,
        });
      }
    );

    const unsubUploadFailed = ws.subscribe<{ uploadId: string; error: string }>(
      'upload:failed',
      (message) => {
        this.emit({
          type: 'upload:failed',
          uploadId: message.payload!.uploadId,
          error: message.payload!.error,
        });
      }
    );

    // Processing progress
    const unsubProcessingProgress = ws.subscribe<{ operationId: string; progress: number; stage: string }>(
      'processing:progress',
      (message) => {
        this.emit({
          type: 'processing:progress',
          operationId: message.payload!.operationId,
          progress: message.payload!.progress,
          stage: message.payload!.stage,
        });
      }
    );

    const unsubProcessingCompleted = ws.subscribe<{ operationId: string }>(
      'processing:completed',
      (message) => {
        this.emit({ type: 'processing:completed', operationId: message.payload!.operationId });
      }
    );

    const unsubProcessingFailed = ws.subscribe<{ operationId: string; error: string }>(
      'processing:failed',
      (message) => {
        this.emit({
          type: 'processing:failed',
          operationId: message.payload!.operationId,
          error: message.payload!.error,
        });
      }
    );

    this.unsubscribers = [
      unsubEncodingProgress,
      unsubEncodingStarted,
      unsubEncodingCompleted,
      unsubEncodingFailed,
      unsubEncodingCancelled,
      unsubUploadProgress,
      unsubUploadCompleted,
      unsubUploadFailed,
      unsubProcessingProgress,
      unsubProcessingCompleted,
      unsubProcessingFailed,
    ];

    this.isSubscribed = true;
  }

  private checkUnsubscribe(): void {
    if (this.handlers.size === 0 && this.jobHandlers.size === 0) {
      this.unsubscribers.forEach((unsub) => unsub());
      this.unsubscribers = [];
      this.isSubscribed = false;
    }
  }

  private emit(event: ProgressStreamEvent): void {
    // Notify global handlers
    this.handlers.forEach((handler) => {
      try {
        handler(event);
      } catch (error) {
        console.error('Progress stream handler error:', error);
      }
    });

    // Notify job-specific handlers
    const jobId = this.getJobIdFromEvent(event);
    if (jobId) {
      const jobHandlers = this.jobHandlers.get(jobId);
      if (jobHandlers) {
        jobHandlers.forEach((handler) => {
          try {
            handler(event);
          } catch (error) {
            console.error('Progress stream handler error:', error);
          }
        });
      }
    }
  }

  private getJobIdFromEvent(event: ProgressStreamEvent): string | null {
    switch (event.type) {
      case 'encoding:progress':
        return event.progress.jobId;
      case 'encoding:started':
      case 'encoding:completed':
      case 'encoding:failed':
      case 'encoding:cancelled':
        return event.jobId;
      case 'upload:progress':
        return event.progress.uploadId;
      case 'upload:completed':
      case 'upload:failed':
        return event.uploadId;
      case 'processing:progress':
      case 'processing:completed':
      case 'processing:failed':
        return event.operationId;
      default:
        return null;
    }
  }
}

// Singleton instance
let instance: ProgressStreamManager | null = null;

/**
 * Get progress stream manager instance
 */
export function getProgressStream(): ProgressStreamManager {
  if (!instance) {
    instance = new ProgressStreamManager();
  }
  return instance;
}

/**
 * Subscribe to all progress events
 */
export function subscribeToProgress(handler: ProgressStreamHandler): () => void {
  return getProgressStream().subscribeAll(handler);
}

/**
 * Subscribe to encoding progress for a specific job
 */
export function subscribeToEncodingProgress(
  jobId: string,
  handler: (progress: EncodingProgress) => void
): () => void {
  return getProgressStream().subscribeToEncoding(jobId, handler);
}

/**
 * Subscribe to upload progress for a specific upload
 */
export function subscribeToUploadProgress(
  uploadId: string,
  handler: (progress: UploadProgress) => void
): () => void {
  return getProgressStream().subscribeToUpload(uploadId, handler);
}
