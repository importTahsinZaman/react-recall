"use client";

import React, {
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import type { ReactRecallConfig } from "./types.js";
import { defaultConfig } from "./types.js";
import { setupClickCapture, setupInputCapture, setupNavigationCapture, setupFormCapture } from "./capture/events.js";
import { setupConsoleCapture } from "./capture/console.js";
import { setupErrorCapture } from "./capture/errors.js";
import { setupNetworkCapture } from "./capture/network.js";

// HTTP endpoint for sendBeacon/fetch
let serverUrl = "http://localhost:4312";
let sessionId = "";

// Kill switch - disable capture if server is unreachable
let serverDown = false;
let consecutiveFailures = 0;
const MAX_FAILURES = 3;

function send(message: unknown) {
  if (serverDown) return;

  const data = JSON.stringify(message);
  const url = `${serverUrl}/events`;

  // sendBeacon for small payloads (< 60KB) - non-blocking, survives page unload
  if (data.length < 60000 && typeof navigator !== 'undefined' && navigator.sendBeacon) {
    navigator.sendBeacon(url, data);
    return;
  }

  // fetch for large payloads - with failure detection
  fetch(url, { method: 'POST', body: data, keepalive: true })
    .then(() => { consecutiveFailures = 0; })
    .catch(() => {
      consecutiveFailures++;
      if (consecutiveFailures >= MAX_FAILURES) {
        serverDown = true;
        // Try again after 10 seconds
        setTimeout(() => { serverDown = false; consecutiveFailures = 0; }, 10000);
      }
    });
}

// Export for capture modules
export function isServerDown(): boolean {
  return serverDown;
}

interface ReactRecallProviderProps {
  children: ReactNode;
  config?: ReactRecallConfig;
}

export function ReactRecallProvider({ children, config }: ReactRecallProviderProps) {
  const enabled = config?.enabled ?? defaultConfig.enabled;
  const mergedConfig = { ...defaultConfig, ...config };

  const initialized = useRef(false);
  if (!initialized.current && enabled) {
    initialized.current = true;
    serverUrl = mergedConfig.serverUrl.replace(/^ws/, 'http');
    sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    // Send session start
    send({ type: "session:start", sessionId, url: typeof window !== 'undefined' ? window.location.href : '' });
  }

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const cleanups: (() => void)[] = [];

    const onEvent = (data: {
      event: string;
      selector?: string;
      text?: string;
      value?: string;
      url?: string;
      component?: string;
      checked?: boolean;
      formAction?: string;
      formMethod?: string;
      key?: string;
    }) => {
      send({ type: "event", data: { ...data, timestamp: new Date().toISOString() } });
    };

    const onLog = (data: { level: string; message: string; args?: unknown[] }) => {
      if (data.level === 'error') {
        send({ type: "error", data: { message: data.message, timestamp: new Date().toISOString() } });
        return;
      }
      send({ type: "log", data: { ...data, timestamp: new Date().toISOString() } });
    };

    const onError = (data: { message: string; stack?: string }) => {
      send({ type: "error", data: { ...data, timestamp: new Date().toISOString() } });
    };

    if (mergedConfig.captureClicks) {
      cleanups.push(setupClickCapture(mergedConfig as Required<ReactRecallConfig>, onEvent));
    }
    if (mergedConfig.captureInputs) {
      cleanups.push(setupInputCapture(mergedConfig as Required<ReactRecallConfig>, onEvent));
    }
    if (mergedConfig.captureNavigation) {
      cleanups.push(setupNavigationCapture(onEvent));
    }
    // Form capture (submit events, select changes) - tied to input capture config
    if (mergedConfig.captureInputs) {
      cleanups.push(setupFormCapture(mergedConfig as Required<ReactRecallConfig>, onEvent));
    }
    if (mergedConfig.captureLogs) {
      cleanups.push(setupConsoleCapture(onLog));
    }
    if (mergedConfig.captureErrors) {
      cleanups.push(setupErrorCapture(onError));
    }

    if (mergedConfig.captureNetwork) {
      const onNetwork = (data: {
        requestId: string;
        pending?: boolean;
        method: string;
        url: string;
        status?: number;
        duration: number;
        requestSize?: number;
        responseSize?: number;
        error?: string;
        requestHeaders?: Record<string, string>;
        responseHeaders?: Record<string, string>;
        requestBody?: string;
        responseBody?: string;
        timing?: { dns?: number; tcp?: number; ssl?: number; ttfb?: number; download?: number };
        initiator?: string;
      }) => {
        send({ type: "network", data: { ...data, timestamp: new Date().toISOString() } });
      };
      cleanups.push(setupNetworkCapture(onNetwork));
    }

    return () => { cleanups.forEach(fn => fn()); };
  }, [enabled, mergedConfig.captureClicks, mergedConfig.captureInputs, mergedConfig.captureNavigation, mergedConfig.captureLogs, mergedConfig.captureErrors, mergedConfig.captureNetwork]);

  return <>{children}</>;
}
