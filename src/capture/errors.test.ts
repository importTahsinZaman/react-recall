import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setupErrorCapture } from './errors';

// Mock the provider module
vi.mock('../provider.js', () => ({
  isServerDown: vi.fn(() => false),
}));

import { isServerDown } from '../provider.js';

describe('setupErrorCapture', () => {
  let cleanup: (() => void) | null = null;
  let capturedErrors: Array<{ message: string; stack?: string }>;
  let callback: (data: { message: string; stack?: string }) => void;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();

    capturedErrors = [];
    callback = (data) => {
      capturedErrors.push(data);
    };

    vi.mocked(isServerDown).mockReturnValue(false);
  });

  afterEach(() => {
    if (cleanup) {
      cleanup();
      cleanup = null;
    }
    vi.useRealTimers();
  });

  describe('window.onerror capture', () => {
    it('captures error events', async () => {
      cleanup = setupErrorCapture(callback);

      const errorEvent = new ErrorEvent('error', {
        message: 'Test error',
        error: new Error('Test error'),
      });
      window.dispatchEvent(errorEvent);

      await vi.advanceTimersByTimeAsync(100);

      expect(capturedErrors).toHaveLength(1);
      expect(capturedErrors[0].message).toBe('Test error');
    });

    it('captures stack trace from error object', async () => {
      cleanup = setupErrorCapture(callback);

      const error = new Error('Error with stack');
      const errorEvent = new ErrorEvent('error', {
        message: error.message,
        error,
      });
      window.dispatchEvent(errorEvent);

      await vi.advanceTimersByTimeAsync(100);

      expect(capturedErrors[0].stack).toBeDefined();
      expect(capturedErrors[0].stack).toContain('Error');
    });

    it('handles error events without error object', async () => {
      cleanup = setupErrorCapture(callback);

      const errorEvent = new ErrorEvent('error', {
        message: 'Script error',
      });
      window.dispatchEvent(errorEvent);

      await vi.advanceTimersByTimeAsync(100);

      expect(capturedErrors).toHaveLength(1);
      expect(capturedErrors[0].message).toBe('Script error');
      expect(capturedErrors[0].stack).toBeUndefined();
    });

    it('handles error events without message', async () => {
      cleanup = setupErrorCapture(callback);

      const errorEvent = new ErrorEvent('error', {});
      window.dispatchEvent(errorEvent);

      await vi.advanceTimersByTimeAsync(100);

      expect(capturedErrors).toHaveLength(1);
      expect(capturedErrors[0].message).toBe('Unknown error');
    });
  });

  describe('unhandledrejection capture', () => {
    it('captures unhandled promise rejections with Error', async () => {
      cleanup = setupErrorCapture(callback);

      const error = new Error('Promise rejection');
      const event = new PromiseRejectionEvent('unhandledrejection', {
        promise: Promise.reject(error).catch(() => {}),
        reason: error,
      });
      window.dispatchEvent(event);

      await vi.advanceTimersByTimeAsync(100);

      expect(capturedErrors).toHaveLength(1);
      expect(capturedErrors[0].message).toBe('Unhandled Promise Rejection: Promise rejection');
      expect(capturedErrors[0].stack).toBeDefined();
    });

    it('captures unhandled promise rejections with string reason', async () => {
      cleanup = setupErrorCapture(callback);

      const event = new PromiseRejectionEvent('unhandledrejection', {
        promise: Promise.reject('string reason').catch(() => {}),
        reason: 'string reason',
      });
      window.dispatchEvent(event);

      await vi.advanceTimersByTimeAsync(100);

      expect(capturedErrors).toHaveLength(1);
      expect(capturedErrors[0].message).toBe('Unhandled Promise Rejection: string reason');
      expect(capturedErrors[0].stack).toBeUndefined();
    });

    it('captures unhandled promise rejections with object reason', async () => {
      cleanup = setupErrorCapture(callback);

      const event = new PromiseRejectionEvent('unhandledrejection', {
        promise: Promise.reject({ code: 'ERR' }).catch(() => {}),
        reason: { code: 'ERR' },
      });
      window.dispatchEvent(event);

      await vi.advanceTimersByTimeAsync(100);

      expect(capturedErrors).toHaveLength(1);
      expect(capturedErrors[0].message).toBe('Unhandled Promise Rejection: [object Object]');
    });
  });

  describe('queue limit', () => {
    it('limits error queue to 100 entries', async () => {
      cleanup = setupErrorCapture(callback);

      // Generate 150 errors
      for (let i = 0; i < 150; i++) {
        const errorEvent = new ErrorEvent('error', {
          message: `Error ${i}`,
        });
        window.dispatchEvent(errorEvent);
      }

      // Process all queued errors
      await vi.advanceTimersByTimeAsync(2000);

      expect(capturedErrors.length).toBeLessThanOrEqual(100);
    });

    it('drops errors when queue is full', async () => {
      cleanup = setupErrorCapture(callback);

      // Fill the queue
      for (let i = 0; i < 100; i++) {
        const errorEvent = new ErrorEvent('error', {
          message: `Error ${i}`,
        });
        window.dispatchEvent(errorEvent);
      }

      // This one should be dropped
      const droppedEvent = new ErrorEvent('error', {
        message: 'This should be dropped',
      });
      window.dispatchEvent(droppedEvent);

      await vi.advanceTimersByTimeAsync(2000);

      const droppedMessage = capturedErrors.find(e => e.message === 'This should be dropped');
      expect(droppedMessage).toBeUndefined();
    });
  });

  describe('batch processing', () => {
    it('processes all errors eventually', async () => {
      cleanup = setupErrorCapture(callback);

      // Generate 25 errors
      for (let i = 0; i < 25; i++) {
        const errorEvent = new ErrorEvent('error', {
          message: `Error ${i}`,
        });
        window.dispatchEvent(errorEvent);
      }

      // Run all timers to process all batches
      // Note: In test environment with fake timers, requestIdleCallback
      // (mocked with setTimeout) fires immediately, so batching timing
      // is different than in production
      await vi.runAllTimersAsync();

      // All 25 errors should be processed
      expect(capturedErrors.length).toBe(25);

      // Verify errors are in order
      expect(capturedErrors[0].message).toBe('Error 0');
      expect(capturedErrors[24].message).toBe('Error 24');
    });
  });

  describe('kill switch', () => {
    it('does not capture errors when server is down', async () => {
      vi.mocked(isServerDown).mockReturnValue(true);

      cleanup = setupErrorCapture(callback);

      const errorEvent = new ErrorEvent('error', {
        message: 'Should not capture',
      });
      window.dispatchEvent(errorEvent);

      await vi.advanceTimersByTimeAsync(100);

      expect(capturedErrors).toHaveLength(0);
    });

    it('does not capture rejections when server is down', async () => {
      vi.mocked(isServerDown).mockReturnValue(true);

      cleanup = setupErrorCapture(callback);

      const event = new PromiseRejectionEvent('unhandledrejection', {
        promise: Promise.reject('test').catch(() => {}),
        reason: 'test',
      });
      window.dispatchEvent(event);

      await vi.advanceTimersByTimeAsync(100);

      expect(capturedErrors).toHaveLength(0);
    });
  });

  describe('cleanup', () => {
    it('removes error event listener on cleanup', async () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      cleanup = setupErrorCapture(callback);
      cleanup();
      cleanup = null;

      // Verify removeEventListener was called for 'error'
      expect(removeEventListenerSpy).toHaveBeenCalledWith('error', expect.any(Function));

      // Also verify behavior: no errors captured after cleanup
      const errorEvent = new ErrorEvent('error', {
        message: 'After cleanup',
      });
      window.dispatchEvent(errorEvent);

      await vi.advanceTimersByTimeAsync(100);

      expect(capturedErrors).toHaveLength(0);

      removeEventListenerSpy.mockRestore();
    });

    it('removes unhandledrejection listener on cleanup', async () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      cleanup = setupErrorCapture(callback);
      cleanup();
      cleanup = null;

      // Verify removeEventListener was called for 'unhandledrejection'
      expect(removeEventListenerSpy).toHaveBeenCalledWith('unhandledrejection', expect.any(Function));

      // Also verify behavior: no rejections captured after cleanup
      const event = new PromiseRejectionEvent('unhandledrejection', {
        promise: Promise.reject('test').catch(() => {}),
        reason: 'test',
      });
      window.dispatchEvent(event);

      await vi.advanceTimersByTimeAsync(100);

      expect(capturedErrors).toHaveLength(0);

      removeEventListenerSpy.mockRestore();
    });

    it('clears error queue on cleanup', async () => {
      cleanup = setupErrorCapture(callback);

      const errorEvent = new ErrorEvent('error', {
        message: 'Queued error',
      });
      window.dispatchEvent(errorEvent);

      cleanup();
      cleanup = null;

      await vi.advanceTimersByTimeAsync(100);

      expect(capturedErrors).toHaveLength(0);
    });
  });
});
