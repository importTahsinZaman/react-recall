import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock the provider module
vi.mock('../provider.js', () => ({
  isServerDown: vi.fn(() => false),
}));

describe('setupConsoleCapture', () => {
  let originalLog: typeof console.log;
  let originalInfo: typeof console.info;
  let originalWarn: typeof console.warn;
  let originalDebug: typeof console.debug;
  let originalError: typeof console.error;
  let cleanup: (() => void) | null = null;
  let capturedLogs: Array<{ level: string; message: string; args?: unknown[] }>;
  let callback: (data: { level: string; message: string; args?: unknown[] }) => void;
  let setupConsoleCapture: typeof import('./console').setupConsoleCapture;
  let isServerDown: typeof import('../provider.js').isServerDown;

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.clearAllMocks();

    // Reset module to clear internal state (flushScheduled, logCount, etc.)
    vi.resetModules();

    // Re-import after reset
    const consoleModule = await import('./console');
    setupConsoleCapture = consoleModule.setupConsoleCapture;

    const providerModule = await import('../provider.js');
    isServerDown = providerModule.isServerDown;

    // Store original console methods
    originalLog = console.log;
    originalInfo = console.info;
    originalWarn = console.warn;
    originalDebug = console.debug;
    originalError = console.error;

    capturedLogs = [];
    callback = (data) => {
      capturedLogs.push(data);
    };

    // Reset isServerDown mock
    vi.mocked(isServerDown).mockReturnValue(false);
  });

  afterEach(() => {
    // Cleanup if not already done
    if (cleanup) {
      cleanup();
      cleanup = null;
    }

    // Restore original console methods
    console.log = originalLog;
    console.info = originalInfo;
    console.warn = originalWarn;
    console.debug = originalDebug;
    console.error = originalError;

    vi.useRealTimers();
  });

  describe('console method interception', () => {
    it('intercepts console.log', async () => {
      cleanup = setupConsoleCapture(callback);

      console.log('test message');

      // Advance timers to trigger flush
      await vi.advanceTimersByTimeAsync(100);

      expect(capturedLogs).toHaveLength(1);
      expect(capturedLogs[0]).toEqual({
        level: 'log',
        message: 'test message',
        args: undefined,
      });
    });

    it('intercepts console.info', async () => {
      cleanup = setupConsoleCapture(callback);

      console.info('info message');
      await vi.advanceTimersByTimeAsync(100);

      expect(capturedLogs).toHaveLength(1);
      expect(capturedLogs[0].level).toBe('info');
    });

    it('intercepts console.warn', async () => {
      cleanup = setupConsoleCapture(callback);

      console.warn('warning message');
      await vi.advanceTimersByTimeAsync(100);

      expect(capturedLogs).toHaveLength(1);
      expect(capturedLogs[0].level).toBe('warn');
    });

    it('intercepts console.debug', async () => {
      cleanup = setupConsoleCapture(callback);

      console.debug('debug message');
      await vi.advanceTimersByTimeAsync(100);

      expect(capturedLogs).toHaveLength(1);
      expect(capturedLogs[0].level).toBe('debug');
    });

    it('intercepts console.error', async () => {
      cleanup = setupConsoleCapture(callback);

      console.error('error message');
      await vi.advanceTimersByTimeAsync(100);

      expect(capturedLogs).toHaveLength(1);
      expect(capturedLogs[0].level).toBe('error');
    });
  });

  describe('original method called immediately', () => {
    it('calls original console.log immediately', () => {
      const mockOriginalLog = vi.fn();
      console.log = mockOriginalLog;

      cleanup = setupConsoleCapture(callback);
      console.log('test');

      expect(mockOriginalLog).toHaveBeenCalledWith('test');
    });

    it('calls original methods with all arguments', () => {
      const mockOriginalLog = vi.fn();
      console.log = mockOriginalLog;

      cleanup = setupConsoleCapture(callback);
      console.log('msg', 1, { key: 'value' });

      expect(mockOriginalLog).toHaveBeenCalledWith('msg', 1, { key: 'value' });
    });
  });

  describe('message formatting', () => {
    it('formats string messages directly', async () => {
      cleanup = setupConsoleCapture(callback);

      console.log('simple string');
      await vi.advanceTimersByTimeAsync(100);

      expect(capturedLogs[0].message).toBe('simple string');
    });

    it('formats number messages as strings', async () => {
      cleanup = setupConsoleCapture(callback);

      console.log(42);
      await vi.advanceTimersByTimeAsync(100);

      expect(capturedLogs[0].message).toBe('42');
    });

    it('formats boolean messages as strings', async () => {
      cleanup = setupConsoleCapture(callback);

      console.log(true);
      await vi.advanceTimersByTimeAsync(100);

      expect(capturedLogs[0].message).toBe('true');
    });

    it('formats null as "null"', async () => {
      cleanup = setupConsoleCapture(callback);

      console.log(null);
      await vi.advanceTimersByTimeAsync(100);

      expect(capturedLogs[0].message).toBe('null');
    });

    it('formats undefined as "undefined"', async () => {
      cleanup = setupConsoleCapture(callback);

      console.log(undefined);
      await vi.advanceTimersByTimeAsync(100);

      expect(capturedLogs[0].message).toBe('undefined');
    });

    it('JSON stringifies objects', async () => {
      cleanup = setupConsoleCapture(callback);

      console.log({ key: 'value' });
      await vi.advanceTimersByTimeAsync(100);

      expect(capturedLogs[0].message).toBe('{"key":"value"}');
    });

    it('truncates messages longer than 500 characters', async () => {
      cleanup = setupConsoleCapture(callback);

      const longObject = { data: 'x'.repeat(600) };
      console.log(longObject);
      await vi.advanceTimersByTimeAsync(100);

      expect(capturedLogs[0].message.length).toBeLessThanOrEqual(503); // 500 + '...'
      expect(capturedLogs[0].message.endsWith('...')).toBe(true);
    });

    it('handles circular references gracefully', async () => {
      cleanup = setupConsoleCapture(callback);

      const circular: any = { a: 1 };
      circular.self = circular;
      console.log(circular);
      await vi.advanceTimersByTimeAsync(100);

      expect(capturedLogs[0].message).toBe('[object Object]');
    });
  });

  describe('extra arguments serialization', () => {
    it('captures extra arguments', async () => {
      cleanup = setupConsoleCapture(callback);

      console.log('message', 'arg1', 42);
      await vi.advanceTimersByTimeAsync(100);

      expect(capturedLogs[0].args).toEqual(['arg1', 42]);
    });

    it('serializes object arguments', async () => {
      cleanup = setupConsoleCapture(callback);

      console.log('message', { key: 'value' });
      await vi.advanceTimersByTimeAsync(100);

      expect(capturedLogs[0].args).toEqual(['{"key":"value"}']);
    });

    it('truncates long argument strings at 300 characters', async () => {
      cleanup = setupConsoleCapture(callback);

      const longArg = { data: 'x'.repeat(400) };
      console.log('message', longArg);
      await vi.advanceTimersByTimeAsync(100);

      expect(capturedLogs[0].args![0].length).toBeLessThanOrEqual(303);
    });

    it('handles unserializable arguments', async () => {
      cleanup = setupConsoleCapture(callback);

      const circular: any = {};
      circular.self = circular;
      console.log('message', circular);
      await vi.advanceTimersByTimeAsync(100);

      expect(capturedLogs[0].args).toEqual(['[Unserializable]']);
    });

    it('preserves primitive arguments', async () => {
      cleanup = setupConsoleCapture(callback);

      console.log('msg', 'str', 123, true, null, undefined);
      await vi.advanceTimersByTimeAsync(100);

      expect(capturedLogs[0].args).toEqual(['str', 123, true, null, undefined]);
    });
  });

  describe('rate limiting', () => {
    it('allows up to 100 logs per second', async () => {
      cleanup = setupConsoleCapture(callback);

      // Log 100 messages
      for (let i = 0; i < 100; i++) {
        console.log(`message ${i}`);
      }

      await vi.runAllTimersAsync();

      expect(capturedLogs).toHaveLength(100);
    });

    it('drops logs beyond rate limit', async () => {
      cleanup = setupConsoleCapture(callback);

      // Log 150 messages
      for (let i = 0; i < 150; i++) {
        console.log(`message ${i}`);
      }

      await vi.runAllTimersAsync();

      expect(capturedLogs.length).toBeLessThanOrEqual(100);
    });

    it('enforces rate limit within same time window', async () => {
      cleanup = setupConsoleCapture(callback);

      // Log 150 messages without advancing time
      // Rate limit is based on Date.now() which is mocked by fake timers
      for (let i = 0; i < 150; i++) {
        console.log(`message ${i}`);
      }

      await vi.runAllTimersAsync();

      // Should have at most 100 logs (rate limited)
      expect(capturedLogs.length).toBeLessThanOrEqual(100);
    });
  });

  describe('batch processing', () => {
    it('processes all logs eventually', async () => {
      cleanup = setupConsoleCapture(callback);

      // Queue 50 logs
      for (let i = 0; i < 50; i++) {
        console.log(`message ${i}`);
      }

      // Run all timers to process all batches
      await vi.runAllTimersAsync();

      // All 50 logs should be processed
      expect(capturedLogs).toHaveLength(50);

      // Verify logs are captured correctly
      expect(capturedLogs[0].message).toBe('message 0');
      expect(capturedLogs[49].message).toBe('message 49');
    });
  });

  describe('kill switch', () => {
    it('does not capture logs when server is down', async () => {
      vi.mocked(isServerDown).mockReturnValue(true);

      cleanup = setupConsoleCapture(callback);
      console.log('should not capture');

      await vi.advanceTimersByTimeAsync(100);

      expect(capturedLogs).toHaveLength(0);
    });

    it('still calls original console method when server is down', () => {
      vi.mocked(isServerDown).mockReturnValue(true);
      const mockOriginalLog = vi.fn();
      console.log = mockOriginalLog;

      cleanup = setupConsoleCapture(callback);
      console.log('test');

      expect(mockOriginalLog).toHaveBeenCalledWith('test');
    });
  });

  describe('cleanup', () => {
    it('restores original console methods on cleanup', () => {
      cleanup = setupConsoleCapture(callback);

      // Verify methods were replaced
      expect(console.log).not.toBe(originalLog);

      cleanup();
      cleanup = null;

      // Verify methods are restored
      expect(console.log).toBe(originalLog);
      expect(console.info).toBe(originalInfo);
      expect(console.warn).toBe(originalWarn);
      expect(console.debug).toBe(originalDebug);
      expect(console.error).toBe(originalError);
    });

    it('clears the log queue on cleanup', async () => {
      cleanup = setupConsoleCapture(callback);

      // Queue some logs
      console.log('queued');

      // Cleanup before flush
      cleanup();
      cleanup = null;

      // Flush shouldn't process anything
      await vi.advanceTimersByTimeAsync(100);

      expect(capturedLogs).toHaveLength(0);
    });
  });
});
