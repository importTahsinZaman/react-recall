import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as http from 'http';
import { createHTTPServer } from './http';
import type { Storage } from './storage';
import type { WebSocketHandler } from './websocket';
import type { Entry } from '../types';

// Create mock storage
function createMockStorage(): Storage {
  return {
    appendEntry: vi.fn().mockResolvedValue({ entry: {}, consolidated: false }),
    readLogs: vi.fn().mockReturnValue([]),
    clearLogs: vi.fn(),
    getLogFileSize: vi.fn().mockReturnValue(1024),
    initialize: vi.fn().mockResolvedValue(undefined),
  } as unknown as Storage;
}

// Create mock WebSocket handler
function createMockWSHandler(): WebSocketHandler {
  return {
    handleMessage: vi.fn().mockResolvedValue(undefined),
    registerSSEClient: vi.fn().mockReturnValue(() => {}),
    handleUpgrade: vi.fn(),
    getConnectionCount: vi.fn().mockReturnValue(2),
  } as unknown as WebSocketHandler;
}

// Helper to make HTTP requests
async function makeRequest(
  server: http.Server,
  method: string,
  path: string,
  body?: string,
  headers?: Record<string, string>
): Promise<{ status: number; headers: http.IncomingHttpHeaders; body: string }> {
  return new Promise((resolve, reject) => {
    const url = new URL(path, 'http://localhost');
    const options: http.RequestOptions = {
      method,
      hostname: 'localhost',
      port: (server.address() as any).port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          status: res.statusCode || 0,
          headers: res.headers,
          body: data,
        });
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(body);
    }
    req.end();
  });
}

describe('createHTTPServer', () => {
  let server: http.Server;
  let mockStorage: Storage;
  let mockWSHandler: WebSocketHandler;

  beforeEach(async () => {
    mockStorage = createMockStorage();
    mockWSHandler = createMockWSHandler();
    server = createHTTPServer(mockStorage, mockWSHandler);

    await new Promise<void>((resolve) => {
      server.listen(0, () => resolve());
    });
  });

  afterEach(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  describe('CORS headers', () => {
    it('sets Access-Control-Allow-Origin header', async () => {
      const res = await makeRequest(server, 'GET', '/health');
      expect(res.headers['access-control-allow-origin']).toBe('*');
    });

    it('sets Access-Control-Allow-Methods header', async () => {
      const res = await makeRequest(server, 'GET', '/health');
      expect(res.headers['access-control-allow-methods']).toBe('GET, POST, DELETE, OPTIONS');
    });

    it('sets Access-Control-Allow-Headers header', async () => {
      const res = await makeRequest(server, 'GET', '/health');
      expect(res.headers['access-control-allow-headers']).toBe('Content-Type');
    });

    it('handles OPTIONS preflight requests', async () => {
      const res = await makeRequest(server, 'OPTIONS', '/api/logs');
      expect(res.status).toBe(204);
    });
  });

  describe('GET /', () => {
    it('serves dashboard HTML', async () => {
      const res = await makeRequest(server, 'GET', '/');

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/html');
      expect(res.body).toContain('<!DOCTYPE html>');
    });
  });

  describe('GET /api/logs', () => {
    it('returns logs as JSON', async () => {
      const mockLogs: Entry[] = [
        { type: 'event', ts: '2024-01-01T00:00:00Z', ms: 1000, event: 'click', selector: '#btn' },
        { type: 'log', ts: '2024-01-01T00:00:01Z', ms: 2000, level: 'info', message: 'test' },
      ];
      vi.mocked(mockStorage.readLogs).mockReturnValue(mockLogs);

      const res = await makeRequest(server, 'GET', '/api/logs');

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('application/json');
      const data = JSON.parse(res.body);
      expect(data).toHaveLength(2);
    });

    it('passes "last" query parameter to storage', async () => {
      await makeRequest(server, 'GET', '/api/logs?last=50');

      expect(mockStorage.readLogs).toHaveBeenCalledWith(
        expect.objectContaining({ last: 50 })
      );
    });

    it('passes "since" query parameter to storage', async () => {
      await makeRequest(server, 'GET', '/api/logs?since=1000');

      expect(mockStorage.readLogs).toHaveBeenCalledWith(
        expect.objectContaining({ since: 1000 })
      );
    });

    it('passes both query parameters to storage', async () => {
      await makeRequest(server, 'GET', '/api/logs?last=20&since=5000');

      expect(mockStorage.readLogs).toHaveBeenCalledWith({
        last: 20,
        since: 5000,
      });
    });
  });

  describe('DELETE /api/logs', () => {
    it('clears logs and returns success', async () => {
      const res = await makeRequest(server, 'DELETE', '/api/logs');

      expect(res.status).toBe(200);
      expect(mockStorage.clearLogs).toHaveBeenCalled();

      const data = JSON.parse(res.body);
      expect(data.success).toBe(true);
    });
  });

  describe('GET /api/events (SSE)', () => {
    it('returns SSE content type', async () => {
      // We can't easily test SSE streaming, but we can verify initial headers
      const res = await new Promise<http.IncomingMessage>((resolve) => {
        const url = new URL('/api/events', 'http://localhost');
        const options = {
          hostname: 'localhost',
          port: (server.address() as any).port,
          path: url.pathname,
          method: 'GET',
        };

        const req = http.request(options, (res) => {
          resolve(res);
          req.destroy(); // Close the connection
        });

        req.end();
      });

      expect(res.headers['content-type']).toBe('text/event-stream');
      expect(res.headers['cache-control']).toBe('no-cache');
      expect(res.headers['connection']).toBe('keep-alive');
    });

    it('sends initial data with existing logs', async () => {
      const mockLogs: Entry[] = [
        { type: 'event', ts: '2024-01-01T00:00:00Z', ms: 1000, event: 'click' },
      ];
      vi.mocked(mockStorage.readLogs).mockReturnValue(mockLogs);

      const data = await new Promise<string>((resolve) => {
        const url = new URL('/api/events', 'http://localhost');
        const options = {
          hostname: 'localhost',
          port: (server.address() as any).port,
          path: url.pathname,
          method: 'GET',
        };

        const req = http.request(options, (res) => {
          let data = '';
          res.on('data', (chunk) => {
            data += chunk.toString();
            // Close after receiving initial data
            req.destroy();
            resolve(data);
          });
        });

        req.end();
      });

      expect(data).toContain('data:');
      expect(data).toContain('init');
    });

    it('registers SSE client with websocket handler', async () => {
      await new Promise<void>((resolve) => {
        const url = new URL('/api/events', 'http://localhost');
        const options = {
          hostname: 'localhost',
          port: (server.address() as any).port,
          path: url.pathname,
          method: 'GET',
        };

        const req = http.request(options, () => {
          setTimeout(() => {
            req.destroy();
            resolve();
          }, 50);
        });

        req.end();
      });

      expect(mockWSHandler.registerSSEClient).toHaveBeenCalled();
    });
  });

  describe('GET /health', () => {
    it('returns health check response', async () => {
      const res = await makeRequest(server, 'GET', '/health');

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('application/json');

      const data = JSON.parse(res.body);
      expect(data.ok).toBe(true);
    });
  });

  describe('POST /events', () => {
    it('accepts events from SDK and passes to WebSocket handler', async () => {
      const message = {
        type: 'event',
        data: {
          event: 'click',
          selector: '#btn',
          timestamp: '2024-01-01T00:00:00Z',
        },
      };

      const res = await makeRequest(server, 'POST', '/events', JSON.stringify(message));

      expect(res.status).toBe(200);
      expect(mockWSHandler.handleMessage).toHaveBeenCalledWith(message);
    });

    it('returns OK response on success', async () => {
      const message = { type: 'log', data: { level: 'info', message: 'test' } };

      const res = await makeRequest(server, 'POST', '/events', JSON.stringify(message));

      const data = JSON.parse(res.body);
      expect(data.ok).toBe(true);
    });

    it('returns 400 for invalid JSON', async () => {
      const res = await makeRequest(server, 'POST', '/events', 'not valid json');

      expect(res.status).toBe(400);
      expect(res.body).toBe('Invalid JSON');
    });
  });

  describe('GET /api/stats', () => {
    it('returns stats object', async () => {
      const mockLogs: Entry[] = [
        { type: 'event', ts: '2024-01-01T00:00:00Z', ms: 1000, event: 'click' },
        { type: 'event', ts: '2024-01-01T00:00:01Z', ms: 2000, event: 'input' },
        { type: 'error', ts: '2024-01-01T00:00:02Z', ms: 3000, message: 'error' },
        { type: 'log', ts: '2024-01-01T00:00:03Z', ms: 4000, level: 'info', message: 'log' },
      ];
      vi.mocked(mockStorage.readLogs).mockReturnValue(mockLogs);
      vi.mocked(mockStorage.getLogFileSize).mockReturnValue(2048);
      vi.mocked(mockWSHandler.getConnectionCount).mockReturnValue(3);

      const res = await makeRequest(server, 'GET', '/api/stats');

      expect(res.status).toBe(200);
      const data = JSON.parse(res.body);
      expect(data.events).toBe(2); // 2 event entries
      expect(data.errors).toBe(1); // 1 error entry
      expect(data.logFileSize).toBe(2048);
      expect(data.connections).toBe(3);
    });
  });

  describe('404 Not Found', () => {
    it('returns 404 for unknown routes', async () => {
      const res = await makeRequest(server, 'GET', '/unknown/path');

      expect(res.status).toBe(404);
      expect(res.body).toBe('Not Found');
    });
  });
});
