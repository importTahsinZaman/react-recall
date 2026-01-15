import { isServerDown } from '../provider.js';
import type { NetworkTiming } from '../types.js';

// Maximum body size to capture (100KB)
const MAX_BODY_SIZE = 100 * 1024;

type NetworkCallback = (data: {
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
  timing?: NetworkTiming;
  initiator?: string;
}) => void;

interface QueuedNetworkEvent {
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
  timing?: NetworkTiming;
  rawStack?: string; // Raw stack trace - processed during flush
  initiator?: string; // Processed initiator - set during flush
}

// Generate unique request ID
let requestIdCounter = 0;
function generateRequestId(): string {
  return `${Date.now()}-${++requestIdCounter}`;
}

const networkQueue: QueuedNetworkEvent[] = [];
let flushScheduled = false;
let networkCallback: NetworkCallback | null = null;

// Rate limiting
let requestCount = 0;
let lastReset = Date.now();
const MAX_REQUESTS_PER_SECOND = 50;

function isReactRecallRequest(url: string): boolean {
  try {
    const parsed = new URL(url, window.location.origin);
    return parsed.pathname === '/events' || parsed.pathname === '/health';
  } catch {
    return url.includes('/events') || url.includes('/health');
  }
}

function scheduleFlush() {
  if (flushScheduled || networkQueue.length === 0) return;
  flushScheduled = true;

  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(flushQueue, { timeout: 500 });
  } else {
    setTimeout(flushQueue, 0);
  }
}

function flushQueue() {
  flushScheduled = false;
  if (!networkCallback) return;

  const batch = networkQueue.splice(0, 10);
  for (const item of batch) {
    try {
      // Process raw stack trace here (deferred from capture time)
      if (item.rawStack && !item.initiator) {
        item.initiator = processInitiator(item.rawStack);
        delete item.rawStack; // Clean up
      }
      networkCallback(item);
    } catch {
      // Ignore
    }
  }

  if (networkQueue.length > 0) {
    scheduleFlush();
  }
}

function queueNetworkEvent(event: QueuedNetworkEvent) {
  // Rate limiting
  const now = Date.now();
  if (now - lastReset > 1000) {
    requestCount = 0;
    lastReset = now;
  }
  if (requestCount >= MAX_REQUESTS_PER_SECOND) return;
  requestCount++;

  if (networkQueue.length < 100) {
    networkQueue.push(event);
    scheduleFlush();
  }
}

// Capture raw stack trace synchronously (fast - just creates Error)
// Processing is deferred to avoid blocking the fetch
function captureRawStack(): string {
  return new Error().stack || '';
}

// Process stack trace (deferred - called during queue flush)
function processInitiator(rawStack: string): string {
  if (!rawStack) return '';

  const lines = rawStack.split('\n').slice(1); // Skip "Error" line

  // Filter out react-recall internal frames
  const filtered = lines.filter(line =>
    !line.includes('network.ts') &&
    !line.includes('react-recall') &&
    !line.includes('setupNetworkCapture')
  );

  // Return first 5 relevant frames
  return filtered.slice(0, 5).map(l => l.trim()).join('\n');
}

// Extract headers from various formats
function extractRequestHeaders(headers?: HeadersInit): Record<string, string> {
  const result: Record<string, string> = {};
  if (!headers) return result;

  try {
    if (headers instanceof Headers) {
      headers.forEach((value, key) => { result[key] = value; });
    } else if (Array.isArray(headers)) {
      headers.forEach(([key, value]) => { result[key] = value; });
    } else {
      Object.entries(headers).forEach(([key, value]) => {
        result[key] = String(value);
      });
    }
  } catch {
    // Ignore errors
  }
  return result;
}

// Extract response headers
function extractResponseHeaders(response: Response): Record<string, string> {
  const result: Record<string, string> = {};
  try {
    response.headers.forEach((value, key) => { result[key] = value; });
  } catch {
    // Ignore errors
  }
  return result;
}

// Parse XHR response headers string
function parseXHRHeaders(headerString: string): Record<string, string> {
  const result: Record<string, string> = {};
  if (!headerString) return result;

  const lines = headerString.trim().split(/[\r\n]+/);
  for (const line of lines) {
    const idx = line.indexOf(':');
    if (idx > 0) {
      const key = line.substring(0, idx).trim().toLowerCase();
      const value = line.substring(idx + 1).trim();
      result[key] = value;
    }
  }
  return result;
}

// Check if content type is text-based
function isTextContentType(contentType: string | null): boolean {
  if (!contentType) return true; // Assume text if unknown
  const lower = contentType.toLowerCase();
  return (
    lower.includes('text/') ||
    lower.includes('application/json') ||
    lower.includes('application/xml') ||
    lower.includes('application/javascript') ||
    lower.includes('application/x-www-form-urlencoded')
  );
}

// Get request body as string
async function getRequestBody(body: BodyInit | null | undefined): Promise<string | undefined> {
  if (!body) return undefined;

  try {
    if (typeof body === 'string') {
      return body.length > MAX_BODY_SIZE
        ? body.substring(0, MAX_BODY_SIZE) + '\n[truncated]'
        : body;
    }

    if (body instanceof URLSearchParams) {
      const str = body.toString();
      return str.length > MAX_BODY_SIZE
        ? str.substring(0, MAX_BODY_SIZE) + '\n[truncated]'
        : str;
    }

    if (body instanceof FormData) {
      const parts: string[] = [];
      body.forEach((value, key) => {
        if (typeof value === 'string') {
          parts.push(`${key}=${value}`);
        } else {
          parts.push(`${key}=[File: ${value.name}]`);
        }
      });
      const str = parts.join('&');
      return str.length > MAX_BODY_SIZE
        ? str.substring(0, MAX_BODY_SIZE) + '\n[truncated]'
        : str;
    }

    if (body instanceof Blob) {
      if (body.size > MAX_BODY_SIZE) {
        return `[Blob: ${body.size} bytes, type: ${body.type || 'unknown'}]`;
      }
      const text = await body.text();
      return text;
    }

    if (body instanceof ArrayBuffer || ArrayBuffer.isView(body)) {
      const size = body instanceof ArrayBuffer ? body.byteLength : body.byteLength;
      return `[Binary: ${size} bytes]`;
    }
  } catch {
    return '[Unable to read body]';
  }

  return undefined;
}

// Get response body as string
async function getResponseBody(response: Response): Promise<string | undefined> {
  const contentType = response.headers.get('content-type');

  // Skip binary content
  if (!isTextContentType(contentType)) {
    const contentLength = response.headers.get('content-length');
    return `[Binary: ${contentType || 'unknown type'}${contentLength ? `, ${contentLength} bytes` : ''}]`;
  }

  try {
    // Clone to avoid consuming the body
    const clone = response.clone();
    const text = await clone.text();

    if (text.length > MAX_BODY_SIZE) {
      return text.substring(0, MAX_BODY_SIZE) + '\n[truncated]';
    }
    return text;
  } catch {
    return '[Unable to read response]';
  }
}

// Get timing from Resource Timing API
function getTiming(url: string): NetworkTiming | undefined {
  try {
    const entries = performance.getEntriesByName(url, 'resource') as PerformanceResourceTiming[];
    if (entries.length === 0) return undefined;

    const timing = entries[entries.length - 1]; // Most recent

    return {
      dns: Math.round(timing.domainLookupEnd - timing.domainLookupStart),
      tcp: Math.round(timing.connectEnd - timing.connectStart),
      ssl: timing.secureConnectionStart > 0
        ? Math.round(timing.connectEnd - timing.secureConnectionStart)
        : undefined,
      ttfb: Math.round(timing.responseStart - timing.requestStart),
      download: Math.round(timing.responseEnd - timing.responseStart),
    };
  } catch {
    return undefined;
  }
}

export function setupNetworkCapture(callback: NetworkCallback): () => void {
  networkCallback = callback;

  // Store originals
  const originalFetch = window.fetch;
  const originalXHROpen = XMLHttpRequest.prototype.open;
  const originalXHRSend = XMLHttpRequest.prototype.send;
  const originalXHRSetHeader = XMLHttpRequest.prototype.setRequestHeader;

  // Track XHR request headers
  const xhrHeaders = new WeakMap<XMLHttpRequest, Record<string, string>>();

  // Intercept fetch
  window.fetch = async function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    if (isServerDown()) return originalFetch.call(this, input, init);

    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    if (isReactRecallRequest(url)) return originalFetch.call(this, input, init);

    const requestId = generateRequestId();
    const rawStack = captureRawStack(); // Capture stack synchronously (fast)
    const startTime = performance.now();
    const method = init?.method?.toUpperCase() || 'GET';

    // Capture request headers (synchronous, fast)
    const requestHeaders = extractRequestHeaders(init?.headers);

    // Get request size synchronously (fast - just property access)
    let requestSize: number | undefined;
    if (init?.body) {
      if (typeof init.body === 'string') {
        requestSize = init.body.length;
      } else if (init.body instanceof Blob) {
        requestSize = init.body.size;
      } else if (init.body instanceof ArrayBuffer) {
        requestSize = init.body.byteLength;
      }
    }

    // Queue pending entry immediately (body will be read in background)
    queueNetworkEvent({
      requestId,
      pending: true,
      method,
      url,
      duration: 0,
      requestSize,
      requestHeaders,
      rawStack
    });

    // Read request body in background (non-blocking)
    // This runs in parallel with the fetch, not before it
    const requestBodyPromise = init?.body ? getRequestBody(init.body) : Promise.resolve(undefined);

    try {
      const response = await originalFetch.call(this, input, init);

      // Capture response headers
      const responseHeaders = extractResponseHeaders(response);
      const responseSize = parseInt(response.headers.get('content-length') || '0') || undefined;

      // Clone response for body reading - don't block the caller
      const clonedResponse = response.clone();

      // Read bodies in background and send complete entry when done
      // This allows streaming responses to be returned immediately
      (async () => {
        try {
          // Wait for both request body (started earlier) and response body
          const [requestBody, responseBody] = await Promise.all([
            requestBodyPromise,
            getResponseBody(clonedResponse)
          ]);

          // Calculate duration AFTER body is fully read (important for streaming)
          const duration = Math.round(performance.now() - startTime);
          const timing = getTiming(url);

          queueNetworkEvent({
            requestId,
            pending: false,
            method,
            url,
            status: response.status,
            duration,
            requestSize,
            responseSize,
            requestHeaders,
            responseHeaders,
            requestBody,
            responseBody,
            timing,
            rawStack
          });
        } catch {
          // Body read failed, still send complete with what we have
          const duration = Math.round(performance.now() - startTime);
          const requestBody = await requestBodyPromise.catch(() => undefined);
          queueNetworkEvent({
            requestId,
            pending: false,
            method,
            url,
            status: response.status,
            duration,
            requestSize,
            responseSize,
            requestHeaders,
            responseHeaders,
            requestBody,
            responseBody: '[Unable to read response]',
            rawStack
          });
        }
      })();

      // Return response immediately - don't wait for body read
      return response;
    } catch (error) {
      const duration = Math.round(performance.now() - startTime);
      const requestBody = await requestBodyPromise.catch(() => undefined);
      // Queue complete entry with error
      queueNetworkEvent({
        requestId,
        pending: false,
        method,
        url,
        duration,
        requestSize,
        requestHeaders,
        requestBody,
        rawStack,
        error: error instanceof Error ? error.message : 'Network error'
      });
      throw error;
    }
  };

  // Intercept XHR setRequestHeader to capture headers
  XMLHttpRequest.prototype.setRequestHeader = function(name: string, value: string) {
    const headers = xhrHeaders.get(this) || {};
    headers[name.toLowerCase()] = value;
    xhrHeaders.set(this, headers);
    return originalXHRSetHeader.call(this, name, value);
  };

  // Track XHR requests
  const xhrData = new WeakMap<XMLHttpRequest, {
    requestId: string;
    method: string;
    url: string;
    startTime: number;
    requestSize?: number;
    requestBody?: string;
    rawStack?: string;
  }>();

  XMLHttpRequest.prototype.open = function(method: string, url: string | URL, ...rest: any[]) {
    const urlStr = typeof url === 'string' ? url : url.href;
    if (!isReactRecallRequest(urlStr)) {
      xhrData.set(this, {
        requestId: generateRequestId(),
        method: method.toUpperCase(),
        url: urlStr,
        startTime: 0,
        rawStack: captureRawStack() // Capture stack synchronously
      });
    }
    return originalXHROpen.apply(this, [method, url, ...rest] as any);
  };

  XMLHttpRequest.prototype.send = function(body?: Document | XMLHttpRequestBodyInit | null) {
    const data = xhrData.get(this);
    if (data && !isServerDown()) {
      data.startTime = performance.now();
      const requestHeaders = xhrHeaders.get(this) || {};

      if (body) {
        try {
          if (typeof body === 'string') {
            data.requestBody = body.length > MAX_BODY_SIZE
              ? body.substring(0, MAX_BODY_SIZE) + '\n[truncated]'
              : body;
            data.requestSize = body.length;
          } else if (body instanceof FormData) {
            const parts: string[] = [];
            body.forEach((value, key) => {
              if (typeof value === 'string') {
                parts.push(`${key}=${value}`);
              } else {
                parts.push(`${key}=[File: ${value.name}]`);
              }
            });
            data.requestBody = parts.join('&');
            data.requestSize = data.requestBody.length;
          }
        } catch { /* ignore */ }
      }

      // Queue pending entry immediately
      queueNetworkEvent({
        requestId: data.requestId,
        pending: true,
        method: data.method,
        url: data.url,
        duration: 0,
        requestSize: data.requestSize,
        requestHeaders,
        requestBody: data.requestBody,
        rawStack: data.rawStack
      });

      const xhr = this;

      this.addEventListener('loadend', function() {
        const duration = Math.round(performance.now() - data.startTime);
        const responseSize = parseInt(xhr.getResponseHeader('content-length') || '0') || undefined;
        const responseHeaders = parseXHRHeaders(xhr.getAllResponseHeaders());

        // Capture response body
        let responseBody: string | undefined;
        const contentType = xhr.getResponseHeader('content-type');

        if (isTextContentType(contentType)) {
          try {
            const text = xhr.responseText || '';
            responseBody = text.length > MAX_BODY_SIZE
              ? text.substring(0, MAX_BODY_SIZE) + '\n[truncated]'
              : text;
          } catch {
            responseBody = '[Unable to read response]';
          }
        } else {
          responseBody = `[Binary: ${contentType || 'unknown type'}${responseSize ? `, ${responseSize} bytes` : ''}]`;
        }

        // Get timing
        const timing = getTiming(data.url);

        // Queue complete entry
        if (xhr.status === 0) {
          queueNetworkEvent({
            requestId: data.requestId,
            pending: false,
            method: data.method,
            url: data.url,
            duration,
            requestSize: data.requestSize,
            requestHeaders,
            requestBody: data.requestBody,
            rawStack: data.rawStack,
            timing,
            error: 'Request failed'
          });
        } else {
          queueNetworkEvent({
            requestId: data.requestId,
            pending: false,
            method: data.method,
            url: data.url,
            status: xhr.status,
            duration,
            requestSize: data.requestSize,
            responseSize,
            requestHeaders,
            responseHeaders,
            requestBody: data.requestBody,
            responseBody,
            timing,
            rawStack: data.rawStack
          });
        }
      });
    }

    return originalXHRSend.call(this, body);
  };

  return () => {
    window.fetch = originalFetch;
    XMLHttpRequest.prototype.open = originalXHROpen;
    XMLHttpRequest.prototype.send = originalXHRSend;
    XMLHttpRequest.prototype.setRequestHeader = originalXHRSetHeader;
    networkCallback = null;
    networkQueue.length = 0;
  };
}
