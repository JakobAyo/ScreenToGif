/**
 * WebSocket Manager
 * Centralized WebSocket connection management with reconnection logic
 */

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';

export interface WebSocketMessage<T = unknown> {
  type: string;
  payload?: T;
  timestamp: string;
  correlationId?: string;
}

export interface WebSocketManagerOptions {
  url: string;
  reconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
  heartbeatTimeout?: number;
}

type MessageHandler<T = unknown> = (message: WebSocketMessage<T>) => void;
type StateChangeHandler = (state: ConnectionState) => void;
type ErrorHandler = (error: Error) => void;

const DEFAULT_OPTIONS: Required<Omit<WebSocketManagerOptions, 'url'>> = {
  reconnect: true,
  reconnectInterval: 3000,
  maxReconnectAttempts: 5,
  heartbeatInterval: 30000,
  heartbeatTimeout: 10000,
};

export class WebSocketManager {
  private socket: WebSocket | null = null;
  private options: Required<WebSocketManagerOptions>;
  private state: ConnectionState = 'disconnected';
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private heartbeatTimeoutTimer: ReturnType<typeof setTimeout> | null = null;
  private messageHandlers: Map<string, Set<MessageHandler>> = new Map();
  private stateChangeHandlers: Set<StateChangeHandler> = new Set();
  private errorHandlers: Set<ErrorHandler> = new Set();
  private pendingMessages: WebSocketMessage[] = [];
  private _lastPong: number = 0;

  constructor(options: WebSocketManagerOptions) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Get current connection state
   */
  getState(): ConnectionState {
    return this.state;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.state === 'connected' && this.socket?.readyState === WebSocket.OPEN;
  }

  /**
   * Get time since last heartbeat response (for monitoring)
   */
  getTimeSinceLastPong(): number {
    return this._lastPong > 0 ? Date.now() - this._lastPong : -1;
  }

  /**
   * Connect to WebSocket server
   */
  connect(): void {
    if (this.state === 'connected' || this.state === 'connecting') {
      return;
    }

    this.setState('connecting');
    this.createSocket();
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    this.stopReconnect();
    this.stopHeartbeat();

    if (this.socket) {
      this.socket.onclose = null; // Prevent reconnect on intentional close
      this.socket.close(1000, 'Client disconnect');
      this.socket = null;
    }

    this.setState('disconnected');
  }

  /**
   * Send a message
   */
  send<T>(type: string, payload?: T, correlationId?: string): void {
    const message: WebSocketMessage<T> = {
      type,
      payload,
      timestamp: new Date().toISOString(),
      correlationId,
    };

    if (this.isConnected()) {
      this.socket!.send(JSON.stringify(message));
    } else {
      // Queue message for when connected
      this.pendingMessages.push(message as WebSocketMessage);
    }
  }

  /**
   * Subscribe to a specific message type
   */
  subscribe<T = unknown>(type: string, handler: MessageHandler<T>): () => void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, new Set());
    }
    this.messageHandlers.get(type)!.add(handler as MessageHandler);

    // Return unsubscribe function
    return () => {
      this.messageHandlers.get(type)?.delete(handler as MessageHandler);
    };
  }

  /**
   * Subscribe to all messages
   */
  subscribeAll(handler: MessageHandler): () => void {
    return this.subscribe('*', handler);
  }

  /**
   * Subscribe to state changes
   */
  onStateChange(handler: StateChangeHandler): () => void {
    this.stateChangeHandlers.add(handler);
    return () => {
      this.stateChangeHandlers.delete(handler);
    };
  }

  /**
   * Subscribe to errors
   */
  onError(handler: ErrorHandler): () => void {
    this.errorHandlers.add(handler);
    return () => {
      this.errorHandlers.delete(handler);
    };
  }

  /**
   * Send a request and wait for response
   */
  request<T, R>(type: string, payload?: T, timeout: number = 30000): Promise<R> {
    return new Promise((resolve, reject) => {
      const correlationId = crypto.randomUUID();
      const responseType = `${type}:response`;

      const timer = setTimeout(() => {
        unsubscribe();
        reject(new Error(`Request timeout for ${type}`));
      }, timeout);

      const unsubscribe = this.subscribe<R>(responseType, (message) => {
        if (message.correlationId === correlationId) {
          clearTimeout(timer);
          unsubscribe();
          resolve(message.payload as R);
        }
      });

      this.send(type, payload, correlationId);
    });
  }

  private createSocket(): void {
    try {
      this.socket = new WebSocket(this.options.url);

      this.socket.onopen = this.handleOpen.bind(this);
      this.socket.onclose = this.handleClose.bind(this);
      this.socket.onerror = this.handleError.bind(this);
      this.socket.onmessage = this.handleMessage.bind(this);
    } catch (error) {
      this.handleError(error as Event);
    }
  }

  private handleOpen(): void {
    this.setState('connected');
    this.reconnectAttempts = 0;
    this.startHeartbeat();
    this.flushPendingMessages();
  }

  private handleClose(event: CloseEvent): void {
    this.stopHeartbeat();

    if (event.wasClean) {
      this.setState('disconnected');
    } else if (this.options.reconnect && this.reconnectAttempts < this.options.maxReconnectAttempts) {
      this.scheduleReconnect();
    } else {
      this.setState('error');
    }
  }

  private handleError(_event: Event): void {
    const error = new Error('WebSocket error');
    this.notifyError(error);

    if (this.state === 'connecting' && this.options.reconnect) {
      this.scheduleReconnect();
    }
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const message = JSON.parse(event.data) as WebSocketMessage;

      // Handle pong for heartbeat
      if (message.type === 'pong') {
        this._lastPong = Date.now();
        this.clearHeartbeatTimeout();
        return;
      }

      // Notify specific handlers
      const handlers = this.messageHandlers.get(message.type);
      if (handlers) {
        handlers.forEach((handler) => handler(message));
      }

      // Notify wildcard handlers
      const wildcardHandlers = this.messageHandlers.get('*');
      if (wildcardHandlers) {
        wildcardHandlers.forEach((handler) => handler(message));
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }

  private setState(state: ConnectionState): void {
    if (this.state !== state) {
      this.state = state;
      this.stateChangeHandlers.forEach((handler) => handler(state));
    }
  }

  private notifyError(error: Error): void {
    this.errorHandlers.forEach((handler) => handler(error));
  }

  private scheduleReconnect(): void {
    this.setState('reconnecting');
    this.reconnectAttempts++;

    this.reconnectTimer = setTimeout(() => {
      this.createSocket();
    }, this.options.reconnectInterval);
  }

  private stopReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.reconnectAttempts = 0;
  }

  private startHeartbeat(): void {
    this._lastPong = Date.now();

    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected()) {
        this.send('ping');
        this.setHeartbeatTimeout();
      }
    }, this.options.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    this.clearHeartbeatTimeout();
  }

  private setHeartbeatTimeout(): void {
    this.heartbeatTimeoutTimer = setTimeout(() => {
      console.warn('Heartbeat timeout - reconnecting');
      this.socket?.close();
    }, this.options.heartbeatTimeout);
  }

  private clearHeartbeatTimeout(): void {
    if (this.heartbeatTimeoutTimer) {
      clearTimeout(this.heartbeatTimeoutTimer);
      this.heartbeatTimeoutTimer = null;
    }
  }

  private flushPendingMessages(): void {
    while (this.pendingMessages.length > 0 && this.isConnected()) {
      const message = this.pendingMessages.shift()!;
      this.socket!.send(JSON.stringify(message));
    }
  }
}

// Singleton instance for the main backend connection
let mainConnection: WebSocketManager | null = null;

/**
 * Get or create the main WebSocket connection
 */
export function getWebSocketManager(url: string = 'ws://localhost:5001/ws'): WebSocketManager {
  if (!mainConnection) {
    mainConnection = new WebSocketManager({ url });
  }
  return mainConnection;
}

/**
 * Destroy the main WebSocket connection
 */
export function destroyWebSocketManager(): void {
  if (mainConnection) {
    mainConnection.disconnect();
    mainConnection = null;
  }
}
