import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WebSocketHandler } from './websocket';
import type { Storage } from './storage';
import type { Entry, ClientMessage } from '../types';

// Create a mock storage
function createMockStorage(): Storage {
  return {
    appendEntry: vi.fn().mockResolvedValue({ entry: {}, consolidated: false }),
    readLogs: vi.fn().mockReturnValue([]),
    clearLogs: vi.fn(),
    getLogFileSize: vi.fn().mockReturnValue(0),
    initialize: vi.fn().mockResolvedValue(undefined),
  } as unknown as Storage;
}

describe('WebSocketHandler', () => {
  let wsHandler: WebSocketHandler;
  let mockStorage: Storage;

  beforeEach(() => {
    vi.clearAllMocks();
    mockStorage = createMockStorage();
    wsHandler = new WebSocketHandler(mockStorage);
  });

  describe('handleMessage', () => {
    describe('session:start', () => {
      it('handles session start messages', async () => {
        const message: ClientMessage = {
          type: 'session:start',
          sessionId: 'test-session-123',
          url: 'http://localhost:3000',
        };

        // Should not throw
        await expect(wsHandler.handleMessage(message)).resolves.toBeUndefined();
      });
    });

    describe('event', () => {
      it('transforms event messages to EventEntry', async () => {
        const message: ClientMessage = {
          type: 'event',
          data: {
            event: 'click',
            selector: '#btn',
            text: 'Click Me',
            timestamp: '2024-01-01T00:00:00Z',
          },
        };

        await wsHandler.handleMessage(message);

        expect(mockStorage.appendEntry).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'event',
            event: 'click',
            selector: '#btn',
            text: 'Click Me',
          })
        );
      });

      it('includes all event fields', async () => {
        const message: ClientMessage = {
          type: 'event',
          data: {
            event: 'submit',
            selector: '#form',
            text: 'Submit Form',
            value: 'form-value',
            url: 'http://localhost/submit',
            component: 'Form > Button',
            checked: true,
            formAction: '/api/submit',
            formMethod: 'POST',
            key: 'Enter',
            timestamp: '2024-01-01T00:00:00Z',
          },
        };

        await wsHandler.handleMessage(message);

        expect(mockStorage.appendEntry).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'event',
            event: 'submit',
            selector: '#form',
            text: 'Submit Form',
            value: 'form-value',
            url: 'http://localhost/submit',
            component: 'Form > Button',
            checked: true,
            formAction: '/api/submit',
            formMethod: 'POST',
            key: 'Enter',
          })
        );
      });

      it('adds timestamp fields (ts, ms)', async () => {
        const message: ClientMessage = {
          type: 'event',
          data: {
            event: 'click',
            selector: '#btn',
            timestamp: '2024-01-01T00:00:00Z',
          },
        };

        await wsHandler.handleMessage(message);

        expect(mockStorage.appendEntry).toHaveBeenCalledWith(
          expect.objectContaining({
            ts: expect.any(String),
            ms: expect.any(Number),
          })
        );
      });
    });

    describe('log', () => {
      it('transforms log messages to LogEntry', async () => {
        const message: ClientMessage = {
          type: 'log',
          data: {
            level: 'info',
            message: 'Test log message',
            timestamp: '2024-01-01T00:00:00Z',
          },
        };

        await wsHandler.handleMessage(message);

        expect(mockStorage.appendEntry).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'log',
            level: 'info',
            message: 'Test log message',
          })
        );
      });

      it('includes args in log entry', async () => {
        const message: ClientMessage = {
          type: 'log',
          data: {
            level: 'debug',
            message: 'Debug message',
            args: [1, 'two', { key: 'value' }],
            timestamp: '2024-01-01T00:00:00Z',
          },
        };

        await wsHandler.handleMessage(message);

        expect(mockStorage.appendEntry).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'log',
            args: [1, 'two', { key: 'value' }],
          })
        );
      });

      it('handles all log levels', async () => {
        const levels = ['log', 'info', 'warn', 'debug', 'error'] as const;

        for (const level of levels) {
          vi.mocked(mockStorage.appendEntry).mockClear();

          const message: ClientMessage = {
            type: 'log',
            data: {
              level,
              message: `${level} message`,
              timestamp: '2024-01-01T00:00:00Z',
            },
          };

          await wsHandler.handleMessage(message);

          expect(mockStorage.appendEntry).toHaveBeenCalledWith(
            expect.objectContaining({
              type: 'log',
              level,
            })
          );
        }
      });
    });

    describe('error', () => {
      it('transforms error messages to ErrorEntry', async () => {
        const message: ClientMessage = {
          type: 'error',
          data: {
            message: 'Test error',
            timestamp: '2024-01-01T00:00:00Z',
          },
        };

        await wsHandler.handleMessage(message);

        expect(mockStorage.appendEntry).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'error',
            message: 'Test error',
          })
        );
      });

      it('includes stack trace in error entry', async () => {
        const message: ClientMessage = {
          type: 'error',
          data: {
            message: 'Error with stack',
            stack: 'Error: Error with stack\n    at test.js:1:1',
            timestamp: '2024-01-01T00:00:00Z',
          },
        };

        await wsHandler.handleMessage(message);

        expect(mockStorage.appendEntry).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'error',
            stack: 'Error: Error with stack\n    at test.js:1:1',
          })
        );
      });
    });

    describe('network', () => {
      it('transforms network messages to NetworkEntry', async () => {
        const message: ClientMessage = {
          type: 'network',
          data: {
            requestId: 'req-123',
            method: 'GET',
            url: 'https://api.example.com/data',
            status: 200,
            duration: 150,
            timestamp: '2024-01-01T00:00:00Z',
          },
        };

        await wsHandler.handleMessage(message);

        expect(mockStorage.appendEntry).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'network',
            requestId: 'req-123',
            method: 'GET',
            url: 'https://api.example.com/data',
            status: 200,
            duration: 150,
          })
        );
      });

      it('includes all network fields', async () => {
        const message: ClientMessage = {
          type: 'network',
          data: {
            requestId: 'req-456',
            method: 'POST',
            url: 'https://api.example.com/submit',
            status: 201,
            duration: 250,
            requestSize: 100,
            responseSize: 500,
            requestHeaders: { 'Content-Type': 'application/json' },
            responseHeaders: { 'X-Request-Id': 'abc' },
            requestBody: '{"key":"value"}',
            responseBody: '{"result":"ok"}',
            timing: { dns: 10, tcp: 20, ttfb: 50, download: 100 },
            initiator: 'at fetchData (app.js:10)',
            timestamp: '2024-01-01T00:00:00Z',
          },
        };

        await wsHandler.handleMessage(message);

        expect(mockStorage.appendEntry).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'network',
            requestSize: 100,
            responseSize: 500,
            requestHeaders: { 'Content-Type': 'application/json' },
            responseHeaders: { 'X-Request-Id': 'abc' },
            requestBody: '{"key":"value"}',
            responseBody: '{"result":"ok"}',
            timing: { dns: 10, tcp: 20, ttfb: 50, download: 100 },
            initiator: 'at fetchData (app.js:10)',
          })
        );
      });

      it('handles network errors', async () => {
        const message: ClientMessage = {
          type: 'network',
          data: {
            requestId: 'req-789',
            method: 'GET',
            url: 'https://api.example.com/fail',
            duration: 100,
            error: 'Network error',
            timestamp: '2024-01-01T00:00:00Z',
          },
        };

        await wsHandler.handleMessage(message);

        expect(mockStorage.appendEntry).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'network',
            error: 'Network error',
          })
        );
      });

      it('skips storage for pending network entries', async () => {
        const message: ClientMessage = {
          type: 'network',
          data: {
            requestId: 'req-pending',
            pending: true,
            method: 'GET',
            url: 'https://api.example.com/data',
            duration: 0,
            timestamp: '2024-01-01T00:00:00Z',
          },
        };

        await wsHandler.handleMessage(message);

        expect(mockStorage.appendEntry).not.toHaveBeenCalled();
      });

      it('stores completed network entries', async () => {
        const message: ClientMessage = {
          type: 'network',
          data: {
            requestId: 'req-complete',
            pending: false,
            method: 'GET',
            url: 'https://api.example.com/data',
            status: 200,
            duration: 150,
            timestamp: '2024-01-01T00:00:00Z',
          },
        };

        await wsHandler.handleMessage(message);

        expect(mockStorage.appendEntry).toHaveBeenCalled();
      });
    });

    describe('server-log', () => {
      it('transforms server-log messages to ServerLogEntry', async () => {
        const message: ClientMessage = {
          type: 'server-log',
          data: {
            level: 'info',
            message: 'Server log message',
            timestamp: '2024-01-01T00:00:00Z',
          },
        };

        await wsHandler.handleMessage(message);

        expect(mockStorage.appendEntry).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'server-log',
            level: 'info',
            message: 'Server log message',
          })
        );
      });

      it('includes source in server-log entry', async () => {
        const message: ClientMessage = {
          type: 'server-log',
          data: {
            level: 'error',
            message: 'Server error',
            source: 'api/handler.ts:42',
            timestamp: '2024-01-01T00:00:00Z',
          },
        };

        await wsHandler.handleMessage(message);

        expect(mockStorage.appendEntry).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'server-log',
            source: 'api/handler.ts:42',
          })
        );
      });

      it('uses provided timestamp for ts field', async () => {
        const message: ClientMessage = {
          type: 'server-log',
          data: {
            level: 'info',
            message: 'Test',
            timestamp: '2024-06-15T12:30:00Z',
          },
        };

        await wsHandler.handleMessage(message);

        expect(mockStorage.appendEntry).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'server-log',
            ts: '2024-06-15T12:30:00Z',
          })
        );
      });
    });
  });

  describe('SSE client management', () => {
    it('registers SSE clients', () => {
      const mockCallback = vi.fn();

      const unsubscribe = wsHandler.registerSSEClient(mockCallback);

      expect(unsubscribe).toBeInstanceOf(Function);
    });

    it('broadcasts entries to registered SSE clients', async () => {
      const mockCallback = vi.fn();
      const entry: Entry = {
        type: 'event',
        ts: '2024-01-01T00:00:00Z',
        ms: 1000,
        event: 'click',
        selector: '#btn',
      };

      vi.mocked(mockStorage.appendEntry).mockResolvedValue({
        entry,
        consolidated: false,
      });

      wsHandler.registerSSEClient(mockCallback);

      const message: ClientMessage = {
        type: 'event',
        data: {
          event: 'click',
          selector: '#btn',
          timestamp: '2024-01-01T00:00:00Z',
        },
      };

      await wsHandler.handleMessage(message);

      expect(mockCallback).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'event' }),
        false
      );
    });

    it('broadcasts pending network entries without storing', async () => {
      const mockCallback = vi.fn();
      wsHandler.registerSSEClient(mockCallback);

      const message: ClientMessage = {
        type: 'network',
        data: {
          requestId: 'req-123',
          pending: true,
          method: 'GET',
          url: 'https://api.example.com/data',
          duration: 0,
          timestamp: '2024-01-01T00:00:00Z',
        },
      };

      await wsHandler.handleMessage(message);

      // Should broadcast but not store
      expect(mockCallback).toHaveBeenCalledWith(
        expect.objectContaining({ pending: true }),
        false
      );
      expect(mockStorage.appendEntry).not.toHaveBeenCalled();
    });

    it('broadcasts consolidated status', async () => {
      const mockCallback = vi.fn();
      const entry: Entry = {
        type: 'log',
        ts: '2024-01-01T00:00:00Z',
        ms: 1000,
        level: 'info',
        message: 'repeated',
        count: 2,
      };

      vi.mocked(mockStorage.appendEntry).mockResolvedValue({
        entry,
        consolidated: true,
      });

      wsHandler.registerSSEClient(mockCallback);

      const message: ClientMessage = {
        type: 'log',
        data: {
          level: 'info',
          message: 'repeated',
          timestamp: '2024-01-01T00:00:00Z',
        },
      };

      await wsHandler.handleMessage(message);

      expect(mockCallback).toHaveBeenCalledWith(
        expect.objectContaining({ count: 2 }),
        true
      );
    });

    it('unregisters SSE clients', async () => {
      const mockCallback = vi.fn();
      const unsubscribe = wsHandler.registerSSEClient(mockCallback);

      unsubscribe();

      const message: ClientMessage = {
        type: 'event',
        data: {
          event: 'click',
          selector: '#btn',
          timestamp: '2024-01-01T00:00:00Z',
        },
      };

      await wsHandler.handleMessage(message);

      // Should not receive broadcast after unsubscribing
      expect(mockCallback).not.toHaveBeenCalled();
    });

    it('broadcasts to multiple SSE clients', async () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      wsHandler.registerSSEClient(callback1);
      wsHandler.registerSSEClient(callback2);

      const message: ClientMessage = {
        type: 'event',
        data: {
          event: 'click',
          selector: '#btn',
          timestamp: '2024-01-01T00:00:00Z',
        },
      };

      await wsHandler.handleMessage(message);

      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });
  });

  describe('getConnectionCount', () => {
    it('returns 0 when no WebSocket connections', () => {
      expect(wsHandler.getConnectionCount()).toBe(0);
    });
  });
});
