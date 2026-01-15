import * as http from 'http';
import type { Storage } from './storage.js';
import type { WebSocketHandler } from './websocket.js';
import { getDashboardHTML } from './dashboard.js';

export function createHTTPServer(
  storage: Storage,
  wsHandler: WebSocketHandler
): http.Server {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url || '/', `http://${req.headers.host}`);
    const pathname = url.pathname;

    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    // Route handling
    if (pathname === '/' && req.method === 'GET') {
      // Serve dashboard
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(getDashboardHTML());
      return;
    }

    if (pathname === '/api/logs' && req.method === 'GET') {
      // Return logs as JSON
      const last = url.searchParams.get('last');
      const since = url.searchParams.get('since');

      const options: { last?: number; since?: number } = {};
      if (last) options.last = parseInt(last, 10);
      if (since) options.since = parseInt(since, 10);

      const logs = storage.readLogs(options);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(logs));
      return;
    }

    if (pathname === '/api/logs' && req.method === 'DELETE') {
      // Clear logs
      storage.clearLogs();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true }));
      return;
    }

    if (pathname === '/api/events' && req.method === 'GET') {
      // SSE stream for dashboard
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      });

      // Send initial data
      const initialLogs = storage.readLogs();
      res.write(`data: ${JSON.stringify({ type: 'init', entries: initialLogs })}\n\n`);

      // Register for updates
      const unsubscribe = wsHandler.registerSSEClient((entry) => {
        res.write(`data: ${JSON.stringify(entry)}\n\n`);
      });

      // Heartbeat to keep connection alive
      const heartbeat = setInterval(() => {
        res.write(': heartbeat\n\n');
      }, 30000);

      req.on('close', () => {
        unsubscribe();
        clearInterval(heartbeat);
      });

      return;
    }

    if (pathname === '/health' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end('{"ok":true}');
      return;
    }

    if (pathname === '/events' && req.method === 'POST') {
      // Receive events from SDK via sendBeacon/fetch
      let body = '';
      req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
      req.on('end', async () => {
        try {
          const message = JSON.parse(body);
          await wsHandler.handleMessage(message);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end('{"ok":true}');
        } catch {
          res.writeHead(400);
          res.end('Invalid JSON');
        }
      });
      return;
    }

    if (pathname === '/api/stats' && req.method === 'GET') {
      // Return stats
      const logs = storage.readLogs();
      const stats = {
        events: logs.filter(l => l.type === 'event').length,
        errors: logs.filter(l => l.type === 'error').length,
        logFileSize: storage.getLogFileSize(),
        connections: wsHandler.getConnectionCount(),
      };

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(stats));
      return;
    }

    // 404
    res.writeHead(404);
    res.end('Not Found');
  });

  // Handle WebSocket upgrade
  server.on('upgrade', (request, socket, head) => {
    wsHandler.handleUpgrade(request, socket, head);
  });

  return server;
}
