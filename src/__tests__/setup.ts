import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock requestIdleCallback (not available in jsdom)
// IMPORTANT: Use globalThis.setTimeout to get the mocked version when fake timers are active
if (typeof globalThis.requestIdleCallback === 'undefined') {
  globalThis.requestIdleCallback = ((callback: IdleRequestCallback) => {
    // Use globalThis.setTimeout so it uses the fake timer version when mocked
    return globalThis.setTimeout(() => callback({ didTimeout: false, timeRemaining: () => 50 }), 0);
  }) as typeof requestIdleCallback;
}

if (typeof globalThis.cancelIdleCallback === 'undefined') {
  globalThis.cancelIdleCallback = ((id: number) => {
    globalThis.clearTimeout(id);
  }) as typeof cancelIdleCallback;
}

// Mock PromiseRejectionEvent (not available in jsdom)
if (typeof globalThis.PromiseRejectionEvent === 'undefined') {
  (globalThis as any).PromiseRejectionEvent = class PromiseRejectionEvent extends Event {
    public readonly promise: Promise<any>;
    public readonly reason: any;

    constructor(type: string, init?: { promise?: Promise<any>; reason?: any }) {
      super(type, { bubbles: false, cancelable: true });
      this.promise = init?.promise || Promise.resolve();
      this.reason = init?.reason;
    }
  };
}

// Store original performance methods
const originalPerformanceNow = performance.now.bind(performance);
const originalGetEntriesByName = performance.getEntriesByName.bind(performance);

// Create mock performance object that preserves real functionality
Object.defineProperty(performance, 'getEntriesByName', {
  value: vi.fn().mockImplementation((name, type) => {
    // Return empty array by default for tests
    return [];
  }),
  writable: true,
  configurable: true,
});

// Ensure performance.now works correctly
Object.defineProperty(performance, 'now', {
  value: vi.fn().mockImplementation(() => originalPerformanceNow()),
  writable: true,
  configurable: true,
});

// Mock sendBeacon
if (typeof navigator.sendBeacon === 'undefined') {
  Object.defineProperty(navigator, 'sendBeacon', {
    value: vi.fn().mockReturnValue(true),
    writable: true,
    configurable: true,
  });
}

// Reset mocks between tests
beforeEach(() => {
  vi.clearAllMocks();
});

// Cleanup after each test
afterEach(() => {
  vi.restoreAllMocks();
});
