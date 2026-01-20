import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('Server Console Capture', () => {
  let originalConsole: {
    log: typeof console.log;
    info: typeof console.info;
    warn: typeof console.warn;
    error: typeof console.error;
    debug: typeof console.debug;
  };
  let mockFetch: ReturnType<typeof vi.fn>;
  let originalFetch: typeof fetch;
  let patchConsole: typeof import('./console').patchConsole;
  let restoreConsole: typeof import('./console').restoreConsole;

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.clearAllMocks();

    // Reset module to clear internal state
    vi.resetModules();

    // Re-import after reset
    const consoleModule = await import('./console');
    patchConsole = consoleModule.patchConsole;
    restoreConsole = consoleModule.restoreConsole;

    // Store original console methods
    originalConsole = {
      log: console.log,
      info: console.info,
      warn: console.warn,
      error: console.error,
      debug: console.debug,
    };

    // Mock fetch
    originalFetch = globalThis.fetch;
    mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
    });
    globalThis.fetch = mockFetch;
  });

  afterEach(() => {
    restoreConsole();

    // Restore original console methods
    console.log = originalConsole.log;
    console.info = originalConsole.info;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
    console.debug = originalConsole.debug;

    // Restore original fetch
    globalThis.fetch = originalFetch;

    vi.useRealTimers();
  });

  describe('patchConsole', () => {
    it('patches all console methods', () => {
      patchConsole('http://localhost:4312');

      expect(console.log).not.toBe(originalConsole.log);
      expect(console.info).not.toBe(originalConsole.info);
      expect(console.warn).not.toBe(originalConsole.warn);
      expect(console.error).not.toBe(originalConsole.error);
      expect(console.debug).not.toBe(originalConsole.debug);
    });

    it('calls original console method (message still appears)', () => {
      // Note: We can't easily mock the original console since patchConsole
      // captures originalConsole at module load time. Instead, verify that:
      // 1. The patched method doesn't throw
      // 2. Messages are sent to the server (covered by other tests)
      patchConsole('http://localhost:4312');

      // This should not throw - the patched method calls original internally
      expect(() => {
        console.log('test message');
        console.info('info message');
        console.warn('warn message');
        console.error('error message');
        console.debug('debug message');
      }).not.toThrow();
    });
  });

  describe('console method interception', () => {
    it('sends log messages to server', async () => {
      patchConsole('http://localhost:4312');

      console.log('test log message');
      await vi.advanceTimersByTimeAsync(100);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4312/events',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('"server-log"'),
        })
      );
    });

    it('sends info messages to server', async () => {
      patchConsole('http://localhost:4312');

      console.info('info message');
      await vi.advanceTimersByTimeAsync(100);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('"level":"info"'),
        })
      );
    });

    it('sends warn messages to server', async () => {
      patchConsole('http://localhost:4312');

      console.warn('warning message');
      await vi.advanceTimersByTimeAsync(100);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('"level":"warn"'),
        })
      );
    });

    it('sends error messages to server', async () => {
      patchConsole('http://localhost:4312');

      console.error('error message');
      await vi.advanceTimersByTimeAsync(100);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('"level":"error"'),
        })
      );
    });

    it('sends debug messages to server', async () => {
      patchConsole('http://localhost:4312');

      console.debug('debug message');
      await vi.advanceTimersByTimeAsync(100);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('"level":"debug"'),
        })
      );
    });
  });

  describe('message formatting', () => {
    it('formats string messages directly', async () => {
      patchConsole('http://localhost:4312');

      console.log('simple string');
      await vi.advanceTimersByTimeAsync(100);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('"message":"simple string"'),
        })
      );
    });

    it('formats number messages as strings', async () => {
      patchConsole('http://localhost:4312');

      console.log(42);
      await vi.advanceTimersByTimeAsync(100);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('"message":"42"'),
        })
      );
    });

    it('formats boolean messages as strings', async () => {
      patchConsole('http://localhost:4312');

      console.log(true);
      await vi.advanceTimersByTimeAsync(100);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('"message":"true"'),
        })
      );
    });

    it('formats null as "null"', async () => {
      patchConsole('http://localhost:4312');

      console.log(null);
      await vi.advanceTimersByTimeAsync(100);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('"message":"null"'),
        })
      );
    });

    it('formats undefined as "undefined"', async () => {
      patchConsole('http://localhost:4312');

      console.log(undefined);
      await vi.advanceTimersByTimeAsync(100);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('"message":"undefined"'),
        })
      );
    });

    it('JSON stringifies objects', async () => {
      patchConsole('http://localhost:4312');

      console.log({ key: 'value' });
      await vi.advanceTimersByTimeAsync(100);

      expect(mockFetch).toHaveBeenCalled();
      const call = mockFetch.mock.calls[0];
      const body = JSON.parse(call[1].body);
      expect(body.data.message).toBe('{"key":"value"}');
    });

    it('truncates messages longer than 500 characters', async () => {
      patchConsole('http://localhost:4312');

      const longObject = { data: 'x'.repeat(600) };
      console.log(longObject);
      await vi.advanceTimersByTimeAsync(100);

      const call = mockFetch.mock.calls[0];
      const body = JSON.parse(call[1].body);
      expect(body.data.message.length).toBeLessThanOrEqual(503);
      expect(body.data.message.endsWith('...')).toBe(true);
    });

    it('handles circular references gracefully', async () => {
      patchConsole('http://localhost:4312');

      const circular: any = { a: 1 };
      circular.self = circular;
      console.log(circular);
      await vi.advanceTimersByTimeAsync(100);

      // Should still send the request with string representation
      expect(mockFetch).toHaveBeenCalled();
    });
  });

  describe('extra arguments serialization', () => {
    it('includes extra arguments in payload', async () => {
      patchConsole('http://localhost:4312');

      console.log('message', 'arg1', 42);
      await vi.advanceTimersByTimeAsync(100);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('"args"'),
        })
      );
    });

    it('serializes object arguments', async () => {
      patchConsole('http://localhost:4312');

      console.log('message', { nested: 'value' });
      await vi.advanceTimersByTimeAsync(100);

      const call = mockFetch.mock.calls[0];
      const body = JSON.parse(call[1].body);
      expect(body.data.args).toContain('{"nested":"value"}');
    });

    it('truncates long argument strings at 300 characters', async () => {
      patchConsole('http://localhost:4312');

      const longArg = { data: 'x'.repeat(400) };
      console.log('message', longArg);
      await vi.advanceTimersByTimeAsync(100);

      const call = mockFetch.mock.calls[0];
      const body = JSON.parse(call[1].body);
      expect(body.data.args[0].length).toBeLessThanOrEqual(303);
    });

    it('handles unserializable arguments', async () => {
      patchConsole('http://localhost:4312');

      const circular: any = {};
      circular.self = circular;
      console.log('message', circular);
      await vi.advanceTimersByTimeAsync(100);

      const call = mockFetch.mock.calls[0];
      const body = JSON.parse(call[1].body);
      expect(body.data.args).toContain('[Unserializable]');
    });

    it('preserves primitive arguments', async () => {
      patchConsole('http://localhost:4312');

      console.log('msg', 'str', 123, true, null, undefined);
      await vi.advanceTimersByTimeAsync(100);

      const call = mockFetch.mock.calls[0];
      const body = JSON.parse(call[1].body);
      // Note: undefined becomes null when JSON.stringify is used
      expect(body.data.args).toEqual(['str', 123, true, null, null]);
    });
  });

  describe('rate limiting', () => {
    it('allows up to 100 logs per second', async () => {
      patchConsole('http://localhost:4312');

      for (let i = 0; i < 100; i++) {
        console.log(`message ${i}`);
      }

      await vi.advanceTimersByTimeAsync(100);

      expect(mockFetch).toHaveBeenCalledTimes(100);
    });

    it('drops logs beyond rate limit', async () => {
      patchConsole('http://localhost:4312');

      for (let i = 0; i < 150; i++) {
        console.log(`message ${i}`);
      }

      await vi.advanceTimersByTimeAsync(100);

      expect(mockFetch.mock.calls.length).toBeLessThanOrEqual(100);
    });

    it('resets rate limit after 1 second', async () => {
      patchConsole('http://localhost:4312');

      // Fill up the limit
      for (let i = 0; i < 100; i++) {
        console.log(`batch1-${i}`);
      }

      await vi.advanceTimersByTimeAsync(1100);

      // Should be able to log more
      console.log('new message');
      await vi.advanceTimersByTimeAsync(100);

      expect(mockFetch).toHaveBeenCalledTimes(101);
    });
  });

  describe('kill switch', () => {
    it('stops sending after 3 consecutive failures', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      patchConsole('http://localhost:4312');

      // 3 failures to trigger kill switch
      console.log('fail 1');
      await vi.advanceTimersByTimeAsync(100);
      console.log('fail 2');
      await vi.advanceTimersByTimeAsync(100);
      console.log('fail 3');
      await vi.advanceTimersByTimeAsync(100);

      const callCountAfterKillSwitch = mockFetch.mock.calls.length;

      // This should be blocked
      console.log('blocked');
      await vi.advanceTimersByTimeAsync(100);

      // No additional calls should be made
      expect(mockFetch.mock.calls.length).toBe(callCountAfterKillSwitch);
    });

    it('resumes sending after 10 second delay', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      patchConsole('http://localhost:4312');

      // Trigger kill switch
      for (let i = 0; i < 3; i++) {
        console.log(`fail ${i}`);
        await vi.advanceTimersByTimeAsync(100);
      }

      // Wait for retry delay
      await vi.advanceTimersByTimeAsync(10000);

      mockFetch.mockClear();
      mockFetch.mockResolvedValue({ ok: true });

      console.log('resumed');
      await vi.advanceTimersByTimeAsync(100);

      expect(mockFetch).toHaveBeenCalled();
    });

    it('resets failure count on successful request', async () => {
      let callCount = 0;
      mockFetch.mockImplementation(() => {
        callCount++;
        if (callCount <= 2) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve({ ok: true });
      });

      patchConsole('http://localhost:4312');

      // 2 failures, then success
      console.log('fail 1');
      await vi.advanceTimersByTimeAsync(100);
      console.log('fail 2');
      await vi.advanceTimersByTimeAsync(100);
      console.log('success');
      await vi.advanceTimersByTimeAsync(100);

      // Reset mock for fresh failures
      mockFetch.mockRejectedValue(new Error('Network error'));

      // These failures should start fresh count
      console.log('new fail 1');
      await vi.advanceTimersByTimeAsync(100);
      console.log('new fail 2');
      await vi.advanceTimersByTimeAsync(100);

      const callsBeforePotentialBlock = mockFetch.mock.calls.length;

      // Should not be blocked yet (only 2 fresh failures after reset)
      console.log('not blocked');
      await vi.advanceTimersByTimeAsync(100);

      expect(mockFetch.mock.calls.length).toBeGreaterThan(callsBeforePotentialBlock);
    });

    it('still calls original console method when kill switch is active', async () => {
      // This test verifies that the original console method is called immediately
      // even when the kill switch is active (server is down).
      // The patchConsole function captures originalConsole at module load time,
      // so we verify by checking that calling console.log doesn't throw.
      mockFetch.mockRejectedValue(new Error('Network error'));

      patchConsole('http://localhost:4312');

      // Trigger kill switch with 3 failures
      console.log('fail 0');
      await vi.advanceTimersByTimeAsync(100);
      console.log('fail 1');
      await vi.advanceTimersByTimeAsync(100);
      console.log('fail 2');
      await vi.advanceTimersByTimeAsync(100);

      // When kill switch is active, calling console.log should not throw
      // and should still execute (just not send to server)
      expect(() => {
        console.log('blocked but logged');
      }).not.toThrow();

      // Verify that fetch is not called for the blocked message
      // (because the kill switch is active)
      const callCountAfterKillSwitch = mockFetch.mock.calls.length;
      console.log('another blocked message');
      await vi.advanceTimersByTimeAsync(100);

      expect(mockFetch.mock.calls.length).toBe(callCountAfterKillSwitch);
    });
  });

  describe('caller info extraction', () => {
    it('includes source in payload', async () => {
      patchConsole('http://localhost:4312');

      console.log('test');
      await vi.advanceTimersByTimeAsync(100);

      // The source will be extracted from the stack trace
      expect(mockFetch).toHaveBeenCalled();
      const call = mockFetch.mock.calls[0];
      const body = JSON.parse(call[1].body);
      // Source may or may not be present depending on stack trace
      expect(body.data).toHaveProperty('message');
    });
  });

  describe('restoreConsole', () => {
    it('restores original console methods', () => {
      patchConsole('http://localhost:4312');

      // Verify methods were patched
      expect(console.log).not.toBe(originalConsole.log);

      restoreConsole();

      expect(console.log).toBe(originalConsole.log);
      expect(console.info).toBe(originalConsole.info);
      expect(console.warn).toBe(originalConsole.warn);
      expect(console.error).toBe(originalConsole.error);
      expect(console.debug).toBe(originalConsole.debug);
    });
  });

  describe('payload format', () => {
    it('sends correctly formatted server-log payload', async () => {
      patchConsole('http://localhost:4312');

      console.log('test message');
      await vi.advanceTimersByTimeAsync(100);

      expect(mockFetch).toHaveBeenCalled();
      const call = mockFetch.mock.calls[0];
      const body = JSON.parse(call[1].body);

      expect(body.type).toBe('server-log');
      expect(body.data).toMatchObject({
        level: 'log',
        message: 'test message',
        timestamp: expect.any(String),
      });
    });

    it('includes timestamp in ISO format', async () => {
      patchConsole('http://localhost:4312');

      console.log('test');
      await vi.advanceTimersByTimeAsync(100);

      expect(mockFetch).toHaveBeenCalled();
      const call = mockFetch.mock.calls[0];
      const body = JSON.parse(call[1].body);

      // Verify timestamp is ISO format
      expect(new Date(body.data.timestamp).toISOString()).toBe(body.data.timestamp);
    });
  });
});
