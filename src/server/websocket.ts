import { WebSocketServer, WebSocket } from 'ws';
import type { IncomingMessage } from 'http';
import type { ClientMessage, Entry, EventEntry, LogEntry, ErrorEntry, NetworkEntry, ServerLogEntry } from '../types.js';
import type { Storage } from './storage.js';

export class WebSocketHandler {
  private wss: WebSocketServer;
  private storage: Storage;
  private sseClients: Set<(entry: Entry) => void> = new Set();

  constructor(storage: Storage) {
    this.storage = storage;
    this.wss = new WebSocketServer({ noServer: true });
    this.setupHandlers();
  }

  private setupHandlers(): void {
    this.wss.on('connection', (ws: WebSocket) => {
      console.log('SDK client connected');

      ws.on('message', async (data: Buffer) => {
        try {
          const message: ClientMessage = JSON.parse(data.toString());
          await this.handleMessage(message);
        } catch (err) {
          console.error('Error processing message:', err);
        }
      });

      ws.on('close', () => {
        console.log('SDK client disconnected');
      });

      ws.on('error', (err) => {
        console.error('WebSocket error:', err);
      });
    });
  }

  handleUpgrade(request: IncomingMessage, socket: any, head: Buffer): void {
    this.wss.handleUpgrade(request, socket, head, (ws) => {
      this.wss.emit('connection', ws, request);
    });
  }

  async handleMessage(message: ClientMessage): Promise<void> {
    const now = new Date();
    const ts = now.toISOString();
    const ms = now.getTime();

    switch (message.type) {
      case 'session:start':
        console.log(`Session started: ${message.sessionId} at ${message.url}`);
        break;

      case 'event': {
        const eventEntry: EventEntry = {
          type: 'event',
          ts,
          ms,
          event: message.data.event as EventEntry['event'],
          selector: message.data.selector,
          text: message.data.text,
          value: message.data.value,
          url: message.data.url,
          component: message.data.component,
          // Form-specific fields
          checked: message.data.checked,
          formAction: message.data.formAction,
          formMethod: message.data.formMethod,
          key: message.data.key,
          metadata: message.data.metadata,
        };
        await this.storage.appendEntry(eventEntry);
        this.broadcast(eventEntry);
        break;
      }

      case 'log': {
        const logEntry: LogEntry = {
          type: 'log',
          ts,
          ms,
          level: message.data.level,
          message: message.data.message,
          args: message.data.args,
        };
        await this.storage.appendEntry(logEntry);
        this.broadcast(logEntry);
        break;
      }

      case 'error': {
        const errorEntry: ErrorEntry = {
          type: 'error',
          ts,
          ms,
          message: message.data.message,
          stack: message.data.stack,
        };
        await this.storage.appendEntry(errorEntry);
        this.broadcast(errorEntry);
        break;
      }

      case 'network': {
        const networkEntry: NetworkEntry = {
          type: 'network',
          ts,
          ms,
          requestId: message.data.requestId,
          pending: message.data.pending,
          method: message.data.method,
          url: message.data.url,
          status: message.data.status,
          duration: message.data.duration,
          requestSize: message.data.requestSize,
          responseSize: message.data.responseSize,
          error: message.data.error,
          // Enhanced capture fields
          requestHeaders: message.data.requestHeaders,
          responseHeaders: message.data.responseHeaders,
          requestBody: message.data.requestBody,
          responseBody: message.data.responseBody,
          timing: message.data.timing,
          initiator: message.data.initiator,
        };
        // Skip storing pending entries (they'll be replaced by complete)
        if (!message.data.pending) {
          await this.storage.appendEntry(networkEntry);
        }
        this.broadcast(networkEntry);
        break;
      }

      case 'server-log': {
        const serverLogEntry: ServerLogEntry = {
          type: 'server-log',
          ts: message.data.timestamp || ts,
          ms,
          level: message.data.level,
          message: message.data.message,
          args: message.data.args,
          source: message.data.source,
        };
        await this.storage.appendEntry(serverLogEntry);
        this.broadcast(serverLogEntry);
        break;
      }
    }
  }

  registerSSEClient(callback: (entry: Entry) => void): () => void {
    this.sseClients.add(callback);
    return () => {
      this.sseClients.delete(callback);
    };
  }

  private broadcast(entry: Entry): void {
    for (const callback of this.sseClients) {
      callback(entry);
    }
  }

  getConnectionCount(): number {
    return this.wss.clients.size;
  }
}
