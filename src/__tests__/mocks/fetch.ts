import { vi } from 'vitest';

/**
 * Mock fetch implementation for testing
 */
export function createMockFetch(options: {
  status?: number;
  body?: string | object;
  headers?: Record<string, string>;
  delay?: number;
  shouldFail?: boolean;
} = {}): typeof fetch {
  const {
    status = 200,
    body = '',
    headers = { 'content-type': 'application/json' },
    delay = 0,
    shouldFail = false,
  } = options;

  return vi.fn().mockImplementation(async () => {
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    if (shouldFail) {
      throw new Error('Network error');
    }

    const responseBody = typeof body === 'string' ? body : JSON.stringify(body);
    const responseHeaders = new Headers(headers);

    return {
      ok: status >= 200 && status < 300,
      status,
      statusText: status === 200 ? 'OK' : 'Error',
      headers: responseHeaders,
      clone: function() {
        return this;
      },
      text: async () => responseBody,
      json: async () => typeof body === 'string' ? JSON.parse(body) : body,
    } as Response;
  });
}

/**
 * Mock XMLHttpRequest for testing
 */
export class MockXMLHttpRequest {
  public status = 0;
  public statusText = '';
  public responseText = '';
  public readyState = 0;
  public onreadystatechange: (() => void) | null = null;
  public onload: (() => void) | null = null;
  public onerror: (() => void) | null = null;
  public onloadend: (() => void) | null = null;

  private _method = '';
  private _url = '';
  private _headers: Record<string, string> = {};
  private _responseHeaders: Record<string, string> = {};

  static instances: MockXMLHttpRequest[] = [];
  static mockResponse: {
    status?: number;
    responseText?: string;
    responseHeaders?: Record<string, string>;
    shouldFail?: boolean;
  } = {};

  constructor() {
    MockXMLHttpRequest.instances.push(this);
  }

  open(method: string, url: string) {
    this._method = method;
    this._url = url;
    this.readyState = 1;
  }

  setRequestHeader(name: string, value: string) {
    this._headers[name.toLowerCase()] = value;
  }

  getAllResponseHeaders(): string {
    return Object.entries(this._responseHeaders)
      .map(([k, v]) => `${k}: ${v}`)
      .join('\r\n');
  }

  getResponseHeader(name: string): string | null {
    return this._responseHeaders[name.toLowerCase()] || null;
  }

  send(body?: Document | XMLHttpRequestBodyInit | null) {
    const mock = MockXMLHttpRequest.mockResponse;

    setTimeout(() => {
      if (mock.shouldFail) {
        this.status = 0;
        this.readyState = 4;
        if (this.onerror) this.onerror();
        if (this.onloadend) this.onloadend();
        return;
      }

      this.status = mock.status ?? 200;
      this.statusText = this.status === 200 ? 'OK' : 'Error';
      this.responseText = mock.responseText ?? '';
      this._responseHeaders = mock.responseHeaders ?? { 'content-type': 'application/json' };
      this.readyState = 4;

      if (this.onreadystatechange) this.onreadystatechange();
      if (this.onload) this.onload();
      if (this.onloadend) this.onloadend();
    }, 0);
  }

  abort() {}

  addEventListener(event: string, callback: () => void) {
    if (event === 'loadend') {
      this.onloadend = callback;
    } else if (event === 'load') {
      this.onload = callback;
    } else if (event === 'error') {
      this.onerror = callback;
    }
  }

  removeEventListener() {}

  static reset() {
    MockXMLHttpRequest.instances = [];
    MockXMLHttpRequest.mockResponse = {};
  }
}

/**
 * Setup fetch mock globally
 */
export function setupFetchMock(mockFetch?: typeof fetch): () => void {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = mockFetch || createMockFetch();

  return () => {
    globalThis.fetch = originalFetch;
  };
}

/**
 * Setup XHR mock globally
 */
export function setupXHRMock(): () => void {
  const originalXHR = globalThis.XMLHttpRequest;
  (globalThis as any).XMLHttpRequest = MockXMLHttpRequest;

  return () => {
    (globalThis as any).XMLHttpRequest = originalXHR;
    MockXMLHttpRequest.reset();
  };
}
