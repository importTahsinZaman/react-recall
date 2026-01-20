import { vi } from 'vitest';

/**
 * State for mocking the provider's isServerDown function
 */
let serverDownState = false;

/**
 * Set the server down state for testing
 */
export function setServerDown(down: boolean): void {
  serverDownState = down;
}

/**
 * Get the current server down state
 */
export function isServerDownMock(): boolean {
  return serverDownState;
}

/**
 * Reset server state
 */
export function resetServerState(): void {
  serverDownState = false;
}

/**
 * Create a mock provider module
 */
export function createProviderMock() {
  return {
    isServerDown: vi.fn(() => serverDownState),
    ReactRecallProvider: vi.fn(({ children }) => children),
  };
}

/**
 * Mock config for testing
 */
export function createMockConfig(overrides: Partial<{
  serverUrl: string;
  enabled: boolean;
  captureClicks: boolean;
  captureInputs: boolean;
  captureNavigation: boolean;
  captureLogs: boolean;
  captureErrors: boolean;
  captureNetwork: boolean;
  excludeSelectors: string[];
  maskInputs: string[];
}> = {}) {
  return {
    serverUrl: 'ws://localhost:4312',
    enabled: true,
    captureClicks: true,
    captureInputs: true,
    captureNavigation: true,
    captureLogs: true,
    captureErrors: true,
    captureNetwork: true,
    excludeSelectors: [],
    maskInputs: ['[type="password"]'],
    ...overrides,
  };
}

/**
 * Create mock send function for testing
 */
export function createMockSend(): {
  send: (data: unknown) => void;
  getSentMessages: () => unknown[];
  clear: () => void;
} {
  const messages: unknown[] = [];

  return {
    send: (data: unknown) => {
      messages.push(data);
    },
    getSentMessages: () => [...messages],
    clear: () => {
      messages.length = 0;
    },
  };
}
