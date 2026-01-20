import { vi } from 'vitest';

/**
 * Create mock PerformanceResourceTiming entry
 */
export function createMockResourceTiming(options: {
  name: string;
  dns?: number;
  tcp?: number;
  ssl?: number;
  ttfb?: number;
  download?: number;
}): PerformanceResourceTiming {
  const startTime = 1000;
  const {
    name,
    dns = 10,
    tcp = 20,
    ssl = 15,
    ttfb = 50,
    download = 100,
  } = options;

  return {
    name,
    entryType: 'resource',
    startTime,
    duration: dns + tcp + ttfb + download,
    initiatorType: 'fetch',
    nextHopProtocol: 'h2',
    workerStart: 0,
    redirectStart: 0,
    redirectEnd: 0,
    fetchStart: startTime,
    domainLookupStart: startTime,
    domainLookupEnd: startTime + dns,
    connectStart: startTime + dns,
    connectEnd: startTime + dns + tcp,
    secureConnectionStart: startTime + dns + tcp - ssl,
    requestStart: startTime + dns + tcp,
    responseStart: startTime + dns + tcp + ttfb,
    responseEnd: startTime + dns + tcp + ttfb + download,
    transferSize: 1024,
    encodedBodySize: 1000,
    decodedBodySize: 1000,
    serverTiming: [],
    toJSON: () => ({}),
  } as PerformanceResourceTiming;
}

/**
 * Setup mock performance.getEntriesByName
 */
export function setupPerformanceMock(entries: PerformanceResourceTiming[]): () => void {
  const originalGetEntriesByName = performance.getEntriesByName;

  vi.spyOn(performance, 'getEntriesByName').mockImplementation((name, type) => {
    if (type === 'resource') {
      return entries.filter(e => e.name === name);
    }
    return [];
  });

  return () => {
    (performance.getEntriesByName as any).mockRestore?.();
    (performance as any).getEntriesByName = originalGetEntriesByName;
  };
}

/**
 * Create mock performance.now sequence for duration testing
 */
export function createMockPerformanceNow(times: number[]): () => void {
  let callIndex = 0;
  const originalNow = performance.now;

  vi.spyOn(performance, 'now').mockImplementation(() => {
    const time = times[callIndex] ?? times[times.length - 1];
    callIndex++;
    return time;
  });

  return () => {
    (performance.now as any).mockRestore?.();
    callIndex = 0;
  };
}
