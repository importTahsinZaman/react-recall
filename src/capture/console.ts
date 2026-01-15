import { isServerDown } from '../provider.js';

type LogCallback = (data: {
  level: 'log' | 'info' | 'warn' | 'debug' | 'error';
  message: string;
  args?: unknown[];
}) => void;

// Queue for deferred processing
interface QueuedLog {
  level: 'log' | 'info' | 'warn' | 'debug' | 'error';
  args: unknown[];
  timestamp: number;
}

const logQueue: QueuedLog[] = [];
let flushScheduled = false;
let logCallback: LogCallback | null = null;

// Rate limiting
let logCount = 0;
let lastLogReset = Date.now();
const MAX_LOGS_PER_SECOND = 100;

function scheduleFlush() {
  if (flushScheduled || logQueue.length === 0) return;
  flushScheduled = true;

  // Use requestIdleCallback for truly non-blocking processing
  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(flushQueue, { timeout: 1000 });
  } else {
    setTimeout(flushQueue, 0);
  }
}

function flushQueue() {
  flushScheduled = false;
  if (!logCallback) return;

  // Process in batches to avoid blocking
  const batch = logQueue.splice(0, 20);

  for (const item of batch) {
    try {
      const message = formatMessage(item.args[0]);
      const extraArgs = item.args.slice(1);

      logCallback({
        level: item.level,
        message,
        args: extraArgs.length > 0 ? serializeArgs(extraArgs) : undefined,
      });
    } catch {
      // Ignore errors
    }
  }

  // Schedule next batch if more items
  if (logQueue.length > 0) {
    scheduleFlush();
  }
}

export function setupConsoleCapture(callback: LogCallback): () => void {
  logCallback = callback;

  const originalLog = console.log;
  const originalInfo = console.info;
  const originalWarn = console.warn;
  const originalDebug = console.debug;
  const originalError = console.error;

  const createInterceptor = (
    original: (...args: unknown[]) => void,
    level: 'log' | 'info' | 'warn' | 'debug' | 'error'
  ) => {
    return function (...args: unknown[]) {
      // Call original IMMEDIATELY - zero delay
      original.apply(console, args);

      // Kill switch - if server is down, do nothing
      if (isServerDown()) return;

      // Rate limit check (simple counter, no blocking)
      const now = Date.now();
      if (now - lastLogReset > 1000) {
        logCount = 0;
        lastLogReset = now;
      }
      if (logCount >= MAX_LOGS_PER_SECOND) return;
      logCount++;

      // Just push to queue - no processing here
      logQueue.push({ level, args, timestamp: now });
      scheduleFlush();
    };
  };

  console.log = createInterceptor(originalLog, 'log');
  console.info = createInterceptor(originalInfo, 'info');
  console.warn = createInterceptor(originalWarn, 'warn');
  console.debug = createInterceptor(originalDebug, 'debug');
  console.error = createInterceptor(originalError, 'error');

  return () => {
    console.log = originalLog;
    console.info = originalInfo;
    console.warn = originalWarn;
    console.debug = originalDebug;
    console.error = originalError;
    logCallback = null;
    logQueue.length = 0;
  };
}

function formatMessage(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';

  try {
    const str = JSON.stringify(value);
    return str.length > 500 ? str.slice(0, 500) + '...' : str;
  } catch {
    return String(value);
  }
}

function serializeArgs(args: unknown[]): unknown[] {
  return args.map((arg) => {
    if (
      typeof arg === 'string' ||
      typeof arg === 'number' ||
      typeof arg === 'boolean' ||
      arg === null ||
      arg === undefined
    ) {
      return arg;
    }

    try {
      const str = JSON.stringify(arg);
      return str.length > 300 ? str.slice(0, 300) + '...' : str;
    } catch {
      return '[Unserializable]';
    }
  });
}
