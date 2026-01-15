import { isServerDown } from '../provider.js';

type ErrorCallback = (data: {
  message: string;
  stack?: string;
}) => void;

// Queue for deferred error processing
interface QueuedError {
  message: string;
  stack?: string;
}

const errorQueue: QueuedError[] = [];
let errorFlushScheduled = false;
let errorCallback: ErrorCallback | null = null;

function scheduleErrorFlush() {
  if (errorFlushScheduled || errorQueue.length === 0) return;
  errorFlushScheduled = true;

  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(flushErrorQueue, { timeout: 1000 });
  } else {
    setTimeout(flushErrorQueue, 0);
  }
}

function flushErrorQueue() {
  errorFlushScheduled = false;
  if (!errorCallback) return;

  const batch = errorQueue.splice(0, 10);
  for (const err of batch) {
    try {
      errorCallback(err);
    } catch {
      // Ignore
    }
  }

  if (errorQueue.length > 0) {
    scheduleErrorFlush();
  }
}

export function setupErrorCapture(callback: ErrorCallback): () => void {
  errorCallback = callback;

  // ONLY capture actual runtime errors - NOT console.error
  // console.error is too noisy (React dev warnings) and handled by console capture if enabled

  // Capture window.onerror (actual JS runtime errors)
  const errorHandler = (event: ErrorEvent) => {
    // Kill switch - if server is down, do nothing
    if (isServerDown()) return;

    // Minimal sync work - just queue
    if (errorQueue.length < 100) {
      errorQueue.push({
        message: event.message || 'Unknown error',
        stack: event.error?.stack,
      });
      scheduleErrorFlush();
    }
  };

  // Capture unhandled promise rejections
  const rejectionHandler = (event: PromiseRejectionEvent) => {
    // Kill switch - if server is down, do nothing
    if (isServerDown()) return;

    if (errorQueue.length < 100) {
      const reason = event.reason;
      errorQueue.push({
        message: reason instanceof Error
          ? `Unhandled Promise Rejection: ${reason.message}`
          : `Unhandled Promise Rejection: ${String(reason)}`,
        stack: reason instanceof Error ? reason.stack : undefined,
      });
      scheduleErrorFlush();
    }
  };

  window.addEventListener('error', errorHandler);
  window.addEventListener('unhandledrejection', rejectionHandler);

  return () => {
    window.removeEventListener('error', errorHandler);
    window.removeEventListener('unhandledrejection', rejectionHandler);
    errorCallback = null;
    errorQueue.length = 0;
  };
}
