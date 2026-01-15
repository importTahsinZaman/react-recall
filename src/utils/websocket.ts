import type { ClientMessage } from '../types.js';

type ConnectionCallback = (connected: boolean) => void;

export class WebSocketClient {
  private url: string;
  private ws: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private messageQueue: ClientMessage[] = [];
  private connectionCallbacks: Set<ConnectionCallback> = new Set();
  private maxQueueSize = 100;
  private reconnectDelay = 3000;
  private isConnected = false;
  private sendScheduled = false;

  constructor(url: string) {
    this.url = url;
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.isConnected = true;
        this.notifyConnection(true);
        this.scheduleSend();
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        this.notifyConnection(false);
        this.scheduleReconnect();
      };

      this.ws.onerror = () => {
        // Error handler - close will follow
      };
    } catch {
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, this.reconnectDelay);
  }

  private scheduleSend(): void {
    if (this.sendScheduled || this.messageQueue.length === 0) return;
    this.sendScheduled = true;

    // Defer all serialization and sending to idle time
    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(() => this.flushQueue(), { timeout: 500 });
    } else {
      setTimeout(() => this.flushQueue(), 0);
    }
  }

  private flushQueue(): void {
    this.sendScheduled = false;

    if (this.ws?.readyState !== WebSocket.OPEN) return;

    // Process in batches to avoid blocking
    const batch = this.messageQueue.splice(0, 10);
    for (const message of batch) {
      try {
        this.ws.send(JSON.stringify(message));
      } catch {
        // Ignore send errors
      }
    }

    // Schedule next batch if more messages
    if (this.messageQueue.length > 0) {
      this.scheduleSend();
    }
  }

  send(message: ClientMessage): void {
    // Just queue - never serialize synchronously
    if (this.messageQueue.length < this.maxQueueSize) {
      this.messageQueue.push(message);
      this.scheduleSend();
    }
  }

  onConnectionChange(callback: ConnectionCallback): () => void {
    this.connectionCallbacks.add(callback);
    // Immediately notify current state
    callback(this.isConnected);
    return () => {
      this.connectionCallbacks.delete(callback);
    };
  }

  private notifyConnection(connected: boolean): void {
    for (const callback of this.connectionCallbacks) {
      callback(connected);
    }
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.onclose = null; // Prevent reconnect
      this.ws.close();
      this.ws = null;
    }

    this.isConnected = false;
    this.messageQueue = [];
  }

  getConnected(): boolean {
    return this.isConnected;
  }
}
