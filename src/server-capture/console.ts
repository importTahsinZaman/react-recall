// Server-side console capture for Node.js
// Monkey-patches console methods and sends logs to react-recall server

const originalConsole = {
  log: console.log,
  info: console.info,
  warn: console.warn,
  error: console.error,
  debug: console.debug,
};

// Kill switch state
let serverDown = false;
let consecutiveFailures = 0;
const MAX_FAILURES = 3;
const RETRY_DELAY = 10000;

// Rate limiting
let logCount = 0;
let lastLogReset = Date.now();
const MAX_LOGS_PER_SECOND = 100;

export function patchConsole(serverUrl: string): void {
  const levels = ['log', 'info', 'warn', 'error', 'debug'] as const;

  for (const level of levels) {
    const original = originalConsole[level];

    (console as any)[level] = (...args: unknown[]) => {
      // Call original immediately - never block console output
      original.apply(console, args);

      // Kill switch - if server is down, skip sending
      if (serverDown) return;

      // Rate limit check
      const now = Date.now();
      if (now - lastLogReset > 1000) {
        logCount = 0;
        lastLogReset = now;
      }
      if (logCount >= MAX_LOGS_PER_SECOND) return;
      logCount++;

      // Send to react-recall server (fire and forget)
      sendLog(serverUrl, {
        type: 'server-log',
        data: {
          level,
          message: formatMessage(args[0]),
          args: args.length > 1 ? serializeArgs(args.slice(1)) : undefined,
          timestamp: new Date().toISOString(),
          source: getCallerInfo(),
        },
      });
    };
  }
}

async function sendLog(serverUrl: string, payload: unknown): Promise<void> {
  try {
    const response = await fetch(`${serverUrl}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      consecutiveFailures = 0;
    } else {
      handleFailure();
    }
  } catch {
    handleFailure();
  }
}

function handleFailure(): void {
  consecutiveFailures++;
  if (consecutiveFailures >= MAX_FAILURES) {
    serverDown = true;
    // Retry after delay
    setTimeout(() => {
      serverDown = false;
      consecutiveFailures = 0;
    }, RETRY_DELAY);
  }
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

function getCallerInfo(): string | undefined {
  const err = new Error();
  const stack = err.stack;
  if (!stack) return undefined;

  const lines = stack.split('\n');
  // Skip: Error, getCallerInfo, patchConsole interceptor, and look for user code
  // Typically line 4+ contains user code
  for (let i = 3; i < lines.length; i++) {
    const line = lines[i];
    // Skip internal node modules and react-recall itself
    if (
      line.includes('node_modules') ||
      line.includes('react-recall') ||
      line.includes('node:internal')
    ) {
      continue;
    }

    // Extract file:line from stack trace
    // Format: "    at functionName (file:line:col)" or "    at file:line:col"
    const match = line.match(/at\s+(?:.*?\s+\()?(.+?):(\d+):\d+\)?/);
    if (match) {
      const [, filePath, lineNum] = match;
      // Get just the filename or relative path
      const parts = filePath.split('/');
      const relevantPath = parts.slice(-2).join('/'); // e.g., "api/checkout.ts"
      return `${relevantPath}:${lineNum}`;
    }
  }

  return undefined;
}

export function restoreConsole(): void {
  console.log = originalConsole.log;
  console.info = originalConsole.info;
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;
  console.debug = originalConsole.debug;
}
