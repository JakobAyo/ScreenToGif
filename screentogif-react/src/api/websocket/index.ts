/**
 * WebSocket Layer Index
 * Re-exports WebSocket management utilities
 */

// WebSocket Manager
export {
  WebSocketManager,
  getWebSocketManager,
  destroyWebSocketManager,
} from './WebSocketManager';
export type {
  ConnectionState,
  WebSocketMessage,
  WebSocketManagerOptions,
} from './WebSocketManager';

// Frame Stream
export {
  getFrameStream,
  subscribeToFrameStream,
} from './frameStream';
export type {
  StreamedFrame,
  FrameStreamEvent,
} from './frameStream';

// Progress Stream
export {
  getProgressStream,
  subscribeToProgress,
  subscribeToEncodingProgress,
  subscribeToUploadProgress,
} from './progressStream';
export type { ProgressStreamEvent } from './progressStream';
