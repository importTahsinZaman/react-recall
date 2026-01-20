import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { ReactRecallProvider, isServerDown } from './provider';

// Mock all capture modules
vi.mock('./capture/events.js', () => ({
  setupClickCapture: vi.fn(() => vi.fn()),
  setupInputCapture: vi.fn(() => vi.fn()),
  setupNavigationCapture: vi.fn(() => vi.fn()),
  setupFormCapture: vi.fn(() => vi.fn()),
}));

vi.mock('./capture/console.js', () => ({
  setupConsoleCapture: vi.fn(() => vi.fn()),
}));

vi.mock('./capture/errors.js', () => ({
  setupErrorCapture: vi.fn(() => vi.fn()),
}));

vi.mock('./capture/network.js', () => ({
  setupNetworkCapture: vi.fn(() => vi.fn()),
}));

import {
  setupClickCapture,
  setupInputCapture,
  setupNavigationCapture,
  setupFormCapture,
} from './capture/events.js';
import { setupConsoleCapture } from './capture/console.js';
import { setupErrorCapture } from './capture/errors.js';
import { setupNetworkCapture } from './capture/network.js';

describe('ReactRecallProvider', () => {
  let originalFetch: typeof fetch;
  let mockFetch: ReturnType<typeof vi.fn>;
  let originalSendBeacon: typeof navigator.sendBeacon;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock fetch
    originalFetch = globalThis.fetch;
    mockFetch = vi.fn().mockResolvedValue({ ok: true });
    globalThis.fetch = mockFetch;

    // Mock sendBeacon
    originalSendBeacon = navigator.sendBeacon;
    Object.defineProperty(navigator, 'sendBeacon', {
      value: vi.fn().mockReturnValue(true),
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    cleanup();
    globalThis.fetch = originalFetch;
    Object.defineProperty(navigator, 'sendBeacon', {
      value: originalSendBeacon,
      writable: true,
      configurable: true,
    });
  });

  describe('rendering', () => {
    it('renders children', () => {
      const { getByText } = render(
        <ReactRecallProvider config={{ enabled: false }}>
          <div>Child Content</div>
        </ReactRecallProvider>
      );

      expect(getByText('Child Content')).toBeInTheDocument();
    });

    it('renders without config', () => {
      const { getByText } = render(
        <ReactRecallProvider>
          <div>No Config</div>
        </ReactRecallProvider>
      );

      expect(getByText('No Config')).toBeInTheDocument();
    });
  });

  describe('configuration', () => {
    it('uses default config when enabled is not specified', () => {
      render(
        <ReactRecallProvider>
          <div>Test</div>
        </ReactRecallProvider>
      );

      // In test environment, enabled defaults based on NODE_ENV
      // The important thing is it doesn't throw
    });

    it('respects enabled=false config', () => {
      render(
        <ReactRecallProvider config={{ enabled: false }}>
          <div>Test</div>
        </ReactRecallProvider>
      );

      expect(setupClickCapture).not.toHaveBeenCalled();
      expect(setupConsoleCapture).not.toHaveBeenCalled();
      expect(setupErrorCapture).not.toHaveBeenCalled();
      expect(setupNetworkCapture).not.toHaveBeenCalled();
    });

    it('merges custom config with defaults', () => {
      render(
        <ReactRecallProvider
          config={{
            enabled: true,
            captureClicks: false,
            captureErrors: false,
          }}
        >
          <div>Test</div>
        </ReactRecallProvider>
      );

      expect(setupClickCapture).not.toHaveBeenCalled();
      expect(setupErrorCapture).not.toHaveBeenCalled();
      // Other captures should still be set up
      expect(setupConsoleCapture).toHaveBeenCalled();
    });
  });

  describe('selective capture setup', () => {
    it('sets up click capture when enabled', () => {
      render(
        <ReactRecallProvider config={{ enabled: true, captureClicks: true }}>
          <div>Test</div>
        </ReactRecallProvider>
      );

      expect(setupClickCapture).toHaveBeenCalled();
    });

    it('does not set up click capture when disabled', () => {
      render(
        <ReactRecallProvider config={{ enabled: true, captureClicks: false }}>
          <div>Test</div>
        </ReactRecallProvider>
      );

      expect(setupClickCapture).not.toHaveBeenCalled();
    });

    it('sets up input capture when enabled', () => {
      render(
        <ReactRecallProvider config={{ enabled: true, captureInputs: true }}>
          <div>Test</div>
        </ReactRecallProvider>
      );

      expect(setupInputCapture).toHaveBeenCalled();
    });

    it('does not set up input capture when disabled', () => {
      render(
        <ReactRecallProvider config={{ enabled: true, captureInputs: false }}>
          <div>Test</div>
        </ReactRecallProvider>
      );

      expect(setupInputCapture).not.toHaveBeenCalled();
    });

    it('sets up navigation capture when enabled', () => {
      render(
        <ReactRecallProvider config={{ enabled: true, captureNavigation: true }}>
          <div>Test</div>
        </ReactRecallProvider>
      );

      expect(setupNavigationCapture).toHaveBeenCalled();
    });

    it('does not set up navigation capture when disabled', () => {
      render(
        <ReactRecallProvider config={{ enabled: true, captureNavigation: false }}>
          <div>Test</div>
        </ReactRecallProvider>
      );

      expect(setupNavigationCapture).not.toHaveBeenCalled();
    });

    it('sets up form capture when inputs are enabled', () => {
      render(
        <ReactRecallProvider config={{ enabled: true, captureInputs: true }}>
          <div>Test</div>
        </ReactRecallProvider>
      );

      expect(setupFormCapture).toHaveBeenCalled();
    });

    it('does not set up form capture when inputs are disabled', () => {
      render(
        <ReactRecallProvider config={{ enabled: true, captureInputs: false }}>
          <div>Test</div>
        </ReactRecallProvider>
      );

      expect(setupFormCapture).not.toHaveBeenCalled();
    });

    it('sets up console capture when enabled', () => {
      render(
        <ReactRecallProvider config={{ enabled: true, captureLogs: true }}>
          <div>Test</div>
        </ReactRecallProvider>
      );

      expect(setupConsoleCapture).toHaveBeenCalled();
    });

    it('does not set up console capture when disabled', () => {
      render(
        <ReactRecallProvider config={{ enabled: true, captureLogs: false }}>
          <div>Test</div>
        </ReactRecallProvider>
      );

      expect(setupConsoleCapture).not.toHaveBeenCalled();
    });

    it('sets up error capture when enabled', () => {
      render(
        <ReactRecallProvider config={{ enabled: true, captureErrors: true }}>
          <div>Test</div>
        </ReactRecallProvider>
      );

      expect(setupErrorCapture).toHaveBeenCalled();
    });

    it('does not set up error capture when disabled', () => {
      render(
        <ReactRecallProvider config={{ enabled: true, captureErrors: false }}>
          <div>Test</div>
        </ReactRecallProvider>
      );

      expect(setupErrorCapture).not.toHaveBeenCalled();
    });

    it('sets up network capture when enabled', () => {
      render(
        <ReactRecallProvider config={{ enabled: true, captureNetwork: true }}>
          <div>Test</div>
        </ReactRecallProvider>
      );

      expect(setupNetworkCapture).toHaveBeenCalled();
    });

    it('does not set up network capture when disabled', () => {
      render(
        <ReactRecallProvider config={{ enabled: true, captureNetwork: false }}>
          <div>Test</div>
        </ReactRecallProvider>
      );

      expect(setupNetworkCapture).not.toHaveBeenCalled();
    });
  });

  describe('cleanup on unmount', () => {
    it('calls cleanup functions on unmount', () => {
      const mockClickCleanup = vi.fn();
      const mockInputCleanup = vi.fn();
      const mockNavCleanup = vi.fn();
      const mockFormCleanup = vi.fn();
      const mockConsoleCleanup = vi.fn();
      const mockErrorCleanup = vi.fn();
      const mockNetworkCleanup = vi.fn();

      vi.mocked(setupClickCapture).mockReturnValue(mockClickCleanup);
      vi.mocked(setupInputCapture).mockReturnValue(mockInputCleanup);
      vi.mocked(setupNavigationCapture).mockReturnValue(mockNavCleanup);
      vi.mocked(setupFormCapture).mockReturnValue(mockFormCleanup);
      vi.mocked(setupConsoleCapture).mockReturnValue(mockConsoleCleanup);
      vi.mocked(setupErrorCapture).mockReturnValue(mockErrorCleanup);
      vi.mocked(setupNetworkCapture).mockReturnValue(mockNetworkCleanup);

      const { unmount } = render(
        <ReactRecallProvider config={{ enabled: true }}>
          <div>Test</div>
        </ReactRecallProvider>
      );

      unmount();

      expect(mockClickCleanup).toHaveBeenCalled();
      expect(mockInputCleanup).toHaveBeenCalled();
      expect(mockNavCleanup).toHaveBeenCalled();
      expect(mockFormCleanup).toHaveBeenCalled();
      expect(mockConsoleCleanup).toHaveBeenCalled();
      expect(mockErrorCleanup).toHaveBeenCalled();
      expect(mockNetworkCleanup).toHaveBeenCalled();
    });
  });

  describe('server URL configuration', () => {
    it('converts ws:// URLs to http://', () => {
      render(
        <ReactRecallProvider config={{ enabled: true, serverUrl: 'ws://localhost:4312' }}>
          <div>Test</div>
        </ReactRecallProvider>
      );

      // The session:start message should be sent to http URL
      expect(navigator.sendBeacon).toHaveBeenCalledWith(
        'http://localhost:4312/events',
        expect.any(String)
      );
    });

    it('uses custom server URL', () => {
      render(
        <ReactRecallProvider config={{ enabled: true, serverUrl: 'http://custom:8080' }}>
          <div>Test</div>
        </ReactRecallProvider>
      );

      expect(navigator.sendBeacon).toHaveBeenCalledWith(
        'http://custom:8080/events',
        expect.any(String)
      );
    });
  });

  describe('session start', () => {
    it('sends session:start message on mount', () => {
      render(
        <ReactRecallProvider config={{ enabled: true }}>
          <div>Test</div>
        </ReactRecallProvider>
      );

      expect(navigator.sendBeacon).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('"type":"session:start"')
      );
    });

    it('includes session ID in session:start message', () => {
      render(
        <ReactRecallProvider config={{ enabled: true }}>
          <div>Test</div>
        </ReactRecallProvider>
      );

      expect(navigator.sendBeacon).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('"sessionId"')
      );
    });

    it('includes current URL in session:start message', () => {
      render(
        <ReactRecallProvider config={{ enabled: true }}>
          <div>Test</div>
        </ReactRecallProvider>
      );

      expect(navigator.sendBeacon).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('"url"')
      );
    });
  });
});

describe('isServerDown', () => {
  it('returns false initially', () => {
    expect(isServerDown()).toBe(false);
  });
});
