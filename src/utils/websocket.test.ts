import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { WebSocketClient } from './websocket';

// Mock WebSocket
class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  readyState = MockWebSocket.CONNECTING;
  onopen: (() => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: (() => void) | null = null;
  onmessage: ((event: any) => void) | null = null;

  url: string;
  sentMessages: string[] = [];

  constructor(url: string) {
    this.url = url;
    // Simulate async connection
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN;
      if (this.onopen) this.onopen();
    }, 0);
  }

  send(data: string) {
    if (this.readyState !== MockWebSocket.OPEN) {
      throw new Error('WebSocket is not open');
    }
    this.sentMessages.push(data);
  }

  close() {
    this.readyState = MockWebSocket.CLOSED;
    if (this.onclose) this.onclose();
  }

  // Test helper to simulate connection failure
  simulateError() {
    if (this.onerror) this.onerror();
  }

  simulateClose() {
    this.readyState = MockWebSocket.CLOSED;
    if (this.onclose) this.onclose();
  }
}

describe('WebSocketClient', () => {
  let originalWebSocket: typeof WebSocket;
  let mockWebSocketInstances: MockWebSocket[];

  beforeEach(() => {
    vi.useFakeTimers();
    mockWebSocketInstances = [];

    originalWebSocket = (globalThis as any).WebSocket;
    (globalThis as any).WebSocket = class extends MockWebSocket {
      constructor(url: string) {
        super(url);
        mockWebSocketInstances.push(this);
      }
    };
    // Also set the static properties
    (globalThis as any).WebSocket.OPEN = MockWebSocket.OPEN;
    (globalThis as any).WebSocket.CONNECTING = MockWebSocket.CONNECTING;
    (globalThis as any).WebSocket.CLOSING = MockWebSocket.CLOSING;
    (globalThis as any).WebSocket.CLOSED = MockWebSocket.CLOSED;
  });

  afterEach(() => {
    (globalThis as any).WebSocket = originalWebSocket;
    vi.useRealTimers();
  });

  describe('constructor', () => {
    it('creates a client with the given URL', () => {
      const client = new WebSocketClient('ws://localhost:4312');
      expect(client.getConnected()).toBe(false);
    });
  });

  describe('connect', () => {
    it('establishes WebSocket connection', async () => {
      const client = new WebSocketClient('ws://localhost:4312');
      client.connect();

      expect(mockWebSocketInstances).toHaveLength(1);
      expect(mockWebSocketInstances[0].url).toBe('ws://localhost:4312');
    });

    it('sets connected state on open', async () => {
      const client = new WebSocketClient('ws://localhost:4312');
      client.connect();

      expect(client.getConnected()).toBe(false);

      // Trigger the async connection
      await vi.advanceTimersByTimeAsync(10);

      expect(client.getConnected()).toBe(true);
    });

    it('does not create duplicate connections', async () => {
      const client = new WebSocketClient('ws://localhost:4312');
      client.connect();
      await vi.advanceTimersByTimeAsync(10);

      // Try to connect again
      client.connect();

      expect(mockWebSocketInstances).toHaveLength(1);
    });

    it('schedules reconnect on close', async () => {
      const client = new WebSocketClient('ws://localhost:4312');
      client.connect();
      await vi.advanceTimersByTimeAsync(10);

      // Simulate close
      mockWebSocketInstances[0].simulateClose();

      expect(client.getConnected()).toBe(false);

      // Advance past reconnect delay (3000ms)
      await vi.advanceTimersByTimeAsync(3100);

      // Should have created a new connection
      expect(mockWebSocketInstances).toHaveLength(2);
    });
  });

  describe('send', () => {
    it('queues messages before connection', async () => {
      const client = new WebSocketClient('ws://localhost:4312');
      client.send({ type: 'test', data: { value: 1 } } as any);

      // Not connected yet, message should be queued
      client.connect();
      await vi.advanceTimersByTimeAsync(10);

      // Run requestIdleCallback mock
      await vi.runAllTimersAsync();

      expect(mockWebSocketInstances[0].sentMessages).toHaveLength(1);
      expect(JSON.parse(mockWebSocketInstances[0].sentMessages[0])).toEqual({
        type: 'test',
        data: { value: 1 },
      });
    });

    it('sends messages after connection', async () => {
      const client = new WebSocketClient('ws://localhost:4312');
      client.connect();
      await vi.advanceTimersByTimeAsync(10);

      client.send({ type: 'event', data: { event: 'click' } } as any);
      await vi.runAllTimersAsync();

      expect(mockWebSocketInstances[0].sentMessages).toHaveLength(1);
    });

    it('limits queue size to 100 messages', async () => {
      const client = new WebSocketClient('ws://localhost:4312');

      // Queue more than max (150 messages, but only 100 should be kept)
      for (let i = 0; i < 150; i++) {
        client.send({ type: 'test', data: { i } } as any);
      }

      client.connect();
      await vi.advanceTimersByTimeAsync(10);
      await vi.runAllTimersAsync();

      // Should have exactly 100 messages (the first 100 queued)
      expect(mockWebSocketInstances[0].sentMessages).toHaveLength(100);

      // Verify it's the first 100 messages (0-99), not the last 100
      const firstMessage = JSON.parse(mockWebSocketInstances[0].sentMessages[0]);
      const lastMessage = JSON.parse(mockWebSocketInstances[0].sentMessages[99]);
      expect(firstMessage.data.i).toBe(0);
      expect(lastMessage.data.i).toBe(99);
    });

    it('processes messages in batches of 10', async () => {
      const client = new WebSocketClient('ws://localhost:4312');

      // Queue 25 messages
      for (let i = 0; i < 25; i++) {
        client.send({ type: 'test', data: { i } } as any);
      }

      client.connect();
      await vi.advanceTimersByTimeAsync(10);

      // Run all timer iterations
      await vi.runAllTimersAsync();

      // All messages should eventually be sent
      expect(mockWebSocketInstances[0].sentMessages).toHaveLength(25);
    });
  });

  describe('onConnectionChange', () => {
    it('immediately notifies with current state', () => {
      const client = new WebSocketClient('ws://localhost:4312');
      const callback = vi.fn();

      client.onConnectionChange(callback);

      expect(callback).toHaveBeenCalledWith(false);
    });

    it('notifies on connection', async () => {
      const client = new WebSocketClient('ws://localhost:4312');
      const callback = vi.fn();

      client.onConnectionChange(callback);
      client.connect();
      await vi.advanceTimersByTimeAsync(10);

      expect(callback).toHaveBeenCalledWith(true);
    });

    it('notifies on disconnection', async () => {
      const client = new WebSocketClient('ws://localhost:4312');
      const callback = vi.fn();

      client.onConnectionChange(callback);
      client.connect();
      await vi.advanceTimersByTimeAsync(10);

      callback.mockClear();
      mockWebSocketInstances[0].simulateClose();

      expect(callback).toHaveBeenCalledWith(false);
    });

    it('returns unsubscribe function', async () => {
      const client = new WebSocketClient('ws://localhost:4312');
      const callback = vi.fn();

      const unsubscribe = client.onConnectionChange(callback);
      callback.mockClear();

      unsubscribe();
      client.connect();
      await vi.advanceTimersByTimeAsync(10);

      // Should not be called after unsubscribe
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('disconnect', () => {
    it('closes the WebSocket', async () => {
      const client = new WebSocketClient('ws://localhost:4312');
      client.connect();
      await vi.advanceTimersByTimeAsync(10);

      client.disconnect();

      expect(client.getConnected()).toBe(false);
    });

    it('clears the message queue', async () => {
      const client = new WebSocketClient('ws://localhost:4312');

      // Queue some messages
      client.send({ type: 'test' } as any);
      client.send({ type: 'test' } as any);

      client.disconnect();
      client.connect();
      await vi.advanceTimersByTimeAsync(10);
      await vi.runAllTimersAsync();

      // Messages should have been cleared
      expect(mockWebSocketInstances[0].sentMessages).toHaveLength(0);
    });

    it('cancels pending reconnect', async () => {
      const client = new WebSocketClient('ws://localhost:4312');
      client.connect();
      await vi.advanceTimersByTimeAsync(10);

      // Trigger reconnect
      mockWebSocketInstances[0].simulateClose();

      // Disconnect before reconnect happens
      client.disconnect();
      await vi.advanceTimersByTimeAsync(5000);

      // Should not have reconnected
      expect(mockWebSocketInstances).toHaveLength(1);
    });

    it('prevents auto-reconnect on manual disconnect', async () => {
      const client = new WebSocketClient('ws://localhost:4312');
      client.connect();
      await vi.advanceTimersByTimeAsync(10);

      // Manually disconnect - should set onclose to null before closing
      client.disconnect();
      await vi.advanceTimersByTimeAsync(5000);

      // Should not have created new connections
      expect(mockWebSocketInstances).toHaveLength(1);
    });
  });

  describe('getConnected', () => {
    it('returns false initially', () => {
      const client = new WebSocketClient('ws://localhost:4312');
      expect(client.getConnected()).toBe(false);
    });

    it('returns true when connected', async () => {
      const client = new WebSocketClient('ws://localhost:4312');
      client.connect();
      await vi.advanceTimersByTimeAsync(10);

      expect(client.getConnected()).toBe(true);
    });

    it('returns false after disconnect', async () => {
      const client = new WebSocketClient('ws://localhost:4312');
      client.connect();
      await vi.advanceTimersByTimeAsync(10);
      client.disconnect();

      expect(client.getConnected()).toBe(false);
    });
  });

  describe('error handling', () => {
    it('handles WebSocket constructor errors', async () => {
      // Make WebSocket throw on construction
      (globalThis as any).WebSocket = function() {
        throw new Error('Connection failed');
      };
      (globalThis as any).WebSocket.OPEN = 1;

      const client = new WebSocketClient('ws://invalid');

      // Should not throw
      expect(() => client.connect()).not.toThrow();

      // Should schedule reconnect
      await vi.advanceTimersByTimeAsync(3100);

      // Just verify no errors occurred
      expect(client.getConnected()).toBe(false);
    });

    it('handles send errors gracefully', async () => {
      const client = new WebSocketClient('ws://localhost:4312');
      client.connect();
      await vi.advanceTimersByTimeAsync(10);

      // Make send throw
      mockWebSocketInstances[0].send = () => {
        throw new Error('Send failed');
      };

      client.send({ type: 'test' } as any);

      // Should not throw
      await expect(vi.runAllTimersAsync()).resolves.not.toThrow();
    });
  });
});
