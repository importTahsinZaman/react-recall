// Configuration for ReactRecallProvider
export interface ReactRecallConfig {
  serverUrl?: string;
  enabled?: boolean;
  captureClicks?: boolean;
  captureInputs?: boolean;
  captureNavigation?: boolean;
  captureLogs?: boolean;
  captureErrors?: boolean;
  captureNetwork?: boolean;
  excludeSelectors?: string[];
  maskInputs?: string[];
}

export const defaultConfig: Required<ReactRecallConfig> = {
  serverUrl: "ws://localhost:4312",
  enabled:
    typeof process !== "undefined" && process.env?.NODE_ENV === "development",
  captureClicks: true,
  captureInputs: true,
  captureNavigation: true,
  captureLogs: true,
  captureErrors: true,
  captureNetwork: true,
  excludeSelectors: [],
  maskInputs: ['[type="password"]'],
};

// Base entry - all entries have these fields
export interface BaseEntry {
  ts: string; // ISO timestamp (human readable)
  ms: number; // Unix milliseconds (for range queries)
  count?: number; // Consolidation count for duplicate entries
}

// User interaction event
export interface EventEntry extends BaseEntry {
  type: "event";
  event: "click" | "input" | "navigation" | "submit" | "change" | "keypress" | "custom" | "initial";
  selector?: string;
  text?: string;
  value?: string;
  url?: string;
  component?: string; // React component stack (e.g., "ChatMessage > MessageList > ChatPanel")
  // Form-specific fields
  checked?: boolean; // For checkbox/radio - the new checked state
  formAction?: string; // For form submit - the action URL
  formMethod?: string; // For form submit - GET/POST
  key?: string; // For keypress - the key that was pressed (e.g., "Enter")
  metadata?: Record<string, unknown>;
}

// Console log
export interface LogEntry extends BaseEntry {
  type: "log";
  level: "log" | "info" | "warn" | "debug" | "error";
  message: string;
  args?: unknown[];
}

// Error
export interface ErrorEntry extends BaseEntry {
  type: "error";
  message: string;
  stack?: string;
}

// Network timing breakdown
export interface NetworkTiming {
  dns?: number;
  tcp?: number;
  ssl?: number;
  ttfb?: number;
  download?: number;
}

// Network request
export interface NetworkEntry extends BaseEntry {
  type: "network";
  requestId: string; // Unique ID to correlate pending/complete
  pending?: boolean; // True if request is still in flight
  startTs?: string; // ISO timestamp when request started
  startMs?: number; // Unix ms when request started
  method: string;
  url: string;
  status?: number;
  duration: number;
  requestSize?: number;
  responseSize?: number;
  error?: string;
  // Enhanced capture fields
  requestHeaders?: Record<string, string>;
  responseHeaders?: Record<string, string>;
  requestBody?: string;
  responseBody?: string;
  timing?: NetworkTiming;
  initiator?: string;
}

// Server-side log (from Node.js server)
export interface ServerLogEntry extends BaseEntry {
  type: "server-log";
  level: "log" | "info" | "warn" | "debug" | "error";
  message: string;
  args?: unknown[];
  source?: string; // e.g., "api/checkout.ts:42"
}

export type Entry = EventEntry | LogEntry | ErrorEntry | NetworkEntry | ServerLogEntry;

// WebSocket message types (SDK -> Server)
export interface SessionStartMessage {
  type: "session:start";
  sessionId: string;
  url: string;
}

export interface EventMessage {
  type: "event";
  data: Omit<EventEntry, "type" | "ts" | "ms"> & { timestamp: string };
}

export interface LogMessage {
  type: "log";
  data: {
    level: "log" | "info" | "warn" | "debug" | "error";
    timestamp: string;
    message: string;
    args?: unknown[];
  };
}

export interface ErrorMessage {
  type: "error";
  data: {
    timestamp: string;
    message: string;
    stack?: string;
  };
}

export interface NetworkMessage {
  type: "network";
  data: {
    timestamp: string;
    requestId: string;
    pending?: boolean;
    method: string;
    url: string;
    status?: number;
    duration: number;
    requestSize?: number;
    responseSize?: number;
    error?: string;
    // Enhanced capture fields
    requestHeaders?: Record<string, string>;
    responseHeaders?: Record<string, string>;
    requestBody?: string;
    responseBody?: string;
    timing?: NetworkTiming;
    initiator?: string;
  };
}

export interface ServerLogMessage {
  type: "server-log";
  data: {
    level: "log" | "info" | "warn" | "debug" | "error";
    message: string;
    args?: unknown[];
    timestamp: string;
    source?: string; // e.g., "api/checkout.ts:42"
  };
}

export type ClientMessage =
  | SessionStartMessage
  | EventMessage
  | LogMessage
  | ErrorMessage
  | NetworkMessage
  | ServerLogMessage;

// Server config
export interface ServerConfig {
  port: number;
  maxFileSize: number; // MB
}

export const defaultServerConfig: ServerConfig = {
  port: 4312,
  maxFileSize: 10,
};
