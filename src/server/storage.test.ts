import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { Storage } from './storage';
import type { Entry, EventEntry, LogEntry, ErrorEntry, NetworkEntry, ServerLogEntry } from '../types';

// Mock fs module
vi.mock('fs');

describe('Storage', () => {
  let storage: Storage;
  const workingDir = '/test/project';
  const baseDir = '/test/project/.react-recall';
  const logsPath = '/test/project/.react-recall/logs.jsonl';
  const config = { port: 4312, maxFileSize: 10 }; // 10 MB

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementations
    vi.mocked(fs.existsSync).mockReturnValue(false);
    vi.mocked(fs.mkdirSync).mockReturnValue(undefined);
    vi.mocked(fs.writeFileSync).mockReturnValue(undefined);
    vi.mocked(fs.appendFileSync).mockReturnValue(undefined);
    vi.mocked(fs.readFileSync).mockReturnValue('');
    vi.mocked(fs.statSync).mockReturnValue({ size: 0 } as fs.Stats);
    vi.mocked(fs.readdirSync).mockReturnValue([]);
    vi.mocked(fs.renameSync).mockReturnValue(undefined);
    vi.mocked(fs.unlinkSync).mockReturnValue(undefined);
    vi.mocked(fs.truncateSync).mockReturnValue(undefined);

    storage = new Storage(workingDir, config);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initialize', () => {
    it('creates .react-recall directory if not exists', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      await storage.initialize();

      expect(fs.mkdirSync).toHaveBeenCalledWith(baseDir, { recursive: true });
    });

    it('does not create directory if already exists', async () => {
      vi.mocked(fs.existsSync).mockImplementation((p) => {
        return p === baseDir;
      });

      await storage.initialize();

      expect(fs.mkdirSync).not.toHaveBeenCalled();
    });

    it('creates logs.jsonl file if not exists', async () => {
      vi.mocked(fs.existsSync).mockImplementation((p) => {
        return p === baseDir; // dir exists, file doesn't
      });

      await storage.initialize();

      expect(fs.writeFileSync).toHaveBeenCalledWith(logsPath, '');
    });

    it('does not create logs file if already exists', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);

      await storage.initialize();

      expect(fs.writeFileSync).not.toHaveBeenCalledWith(logsPath, '');
    });

    it('updates .gitignore with .react-recall entry', async () => {
      const gitignorePath = '/test/project/.gitignore';
      vi.mocked(fs.existsSync).mockImplementation((p) => {
        return p === gitignorePath;
      });
      vi.mocked(fs.readFileSync).mockReturnValue('node_modules/\n');

      await storage.initialize();

      expect(fs.appendFileSync).toHaveBeenCalledWith(
        gitignorePath,
        expect.stringContaining('.react-recall/')
      );
    });

    it('does not duplicate .gitignore entry', async () => {
      const gitignorePath = '/test/project/.gitignore';
      vi.mocked(fs.existsSync).mockImplementation((p) => {
        return p === gitignorePath;
      });
      vi.mocked(fs.readFileSync).mockReturnValue('.react-recall/\n');

      await storage.initialize();

      expect(fs.appendFileSync).not.toHaveBeenCalledWith(
        gitignorePath,
        expect.anything()
      );
    });

    it('creates .gitignore if not exists', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      await storage.initialize();

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        '/test/project/.gitignore',
        expect.stringContaining('.react-recall/')
      );
    });
  });

  describe('appendEntry', () => {
    const createEventEntry = (overrides?: Partial<EventEntry>): EventEntry => ({
      type: 'event',
      ts: new Date().toISOString(),
      ms: Date.now(),
      event: 'click',
      selector: '#btn',
      ...overrides,
    });

    const createLogEntry = (overrides?: Partial<LogEntry>): LogEntry => ({
      type: 'log',
      ts: new Date().toISOString(),
      ms: Date.now(),
      level: 'info',
      message: 'test message',
      ...overrides,
    });

    it('appends entry as JSONL', async () => {
      const entry = createEventEntry();
      vi.mocked(fs.statSync).mockReturnValue({ size: 0 } as fs.Stats);

      await storage.appendEntry(entry);

      expect(fs.appendFileSync).toHaveBeenCalledWith(
        logsPath,
        expect.stringContaining('"type":"event"')
      );
    });

    it('returns the entry and consolidated=false for new entries', async () => {
      const entry = createEventEntry();
      vi.mocked(fs.statSync).mockReturnValue({ size: 0 } as fs.Stats);

      const result = await storage.appendEntry(entry);

      expect(result.entry).toEqual(entry);
      expect(result.consolidated).toBe(false);
    });

    describe('entry consolidation', () => {
      it('consolidates duplicate event entries within 2 seconds', async () => {
        const now = Date.now();
        const entry1 = createEventEntry({ ms: now, text: 'Button' });
        const entry2 = createEventEntry({ ms: now + 1000, text: 'Button' }); // Same event 1s later

        vi.mocked(fs.statSync).mockReturnValue({ size: 100 } as fs.Stats);

        await storage.appendEntry(entry1);
        const result = await storage.appendEntry(entry2);

        expect(result.consolidated).toBe(true);
        expect(result.entry.count).toBe(2);
      });

      it('does not consolidate entries beyond 2 second window', async () => {
        const now = Date.now();
        const entry1 = createEventEntry({ ms: now });
        const entry2 = createEventEntry({ ms: now + 3000 }); // 3 seconds later

        vi.mocked(fs.statSync).mockReturnValue({ size: 100 } as fs.Stats);

        await storage.appendEntry(entry1);
        const result = await storage.appendEntry(entry2);

        expect(result.consolidated).toBe(false);
      });

      it('does not consolidate different entries', async () => {
        const now = Date.now();
        const entry1 = createEventEntry({ ms: now, selector: '#btn1' });
        const entry2 = createEventEntry({ ms: now + 500, selector: '#btn2' });

        vi.mocked(fs.statSync).mockReturnValue({ size: 100 } as fs.Stats);

        await storage.appendEntry(entry1);
        const result = await storage.appendEntry(entry2);

        expect(result.consolidated).toBe(false);
      });

      it('consolidates log entries with same level and message', async () => {
        const now = Date.now();
        const entry1 = createLogEntry({ ms: now, message: 'repeated log' });
        const entry2 = createLogEntry({ ms: now + 500, message: 'repeated log' });

        vi.mocked(fs.statSync).mockReturnValue({ size: 100 } as fs.Stats);

        await storage.appendEntry(entry1);
        const result = await storage.appendEntry(entry2);

        expect(result.consolidated).toBe(true);
      });

      it('rewrites last entry when consolidating', async () => {
        const now = Date.now();
        const entry1 = createLogEntry({ ms: now });
        const entry2 = createLogEntry({ ms: now + 500 });

        vi.mocked(fs.statSync).mockReturnValue({ size: 100 } as fs.Stats);

        await storage.appendEntry(entry1);
        await storage.appendEntry(entry2);

        expect(fs.truncateSync).toHaveBeenCalled();
      });
    });

    describe('entry signatures', () => {
      it('generates signature for event entries', async () => {
        const entry = createEventEntry({
          event: 'click',
          text: 'Submit',
          selector: '#submit-btn',
          component: 'Button',
        });
        vi.mocked(fs.statSync).mockReturnValue({ size: 0 } as fs.Stats);

        await storage.appendEntry(entry);
        // Verify it was appended (signature generation is internal)
        expect(fs.appendFileSync).toHaveBeenCalled();
      });

      it('generates signature for log entries', async () => {
        const entry = createLogEntry({
          level: 'warn',
          message: 'Warning message',
          args: [1, 2, 3],
        });
        vi.mocked(fs.statSync).mockReturnValue({ size: 0 } as fs.Stats);

        await storage.appendEntry(entry);
        expect(fs.appendFileSync).toHaveBeenCalled();
      });

      it('generates signature for error entries', async () => {
        const entry: ErrorEntry = {
          type: 'error',
          ts: new Date().toISOString(),
          ms: Date.now(),
          message: 'Test error',
        };
        vi.mocked(fs.statSync).mockReturnValue({ size: 0 } as fs.Stats);

        await storage.appendEntry(entry);
        expect(fs.appendFileSync).toHaveBeenCalled();
      });

      it('generates signature for network entries', async () => {
        const entry: NetworkEntry = {
          type: 'network',
          ts: new Date().toISOString(),
          ms: Date.now(),
          requestId: 'req-123',
          method: 'GET',
          url: 'https://api.example.com/data',
          duration: 150,
        };
        vi.mocked(fs.statSync).mockReturnValue({ size: 0 } as fs.Stats);

        await storage.appendEntry(entry);
        expect(fs.appendFileSync).toHaveBeenCalled();
      });

      it('generates signature for server-log entries', async () => {
        const entry: ServerLogEntry = {
          type: 'server-log',
          ts: new Date().toISOString(),
          ms: Date.now(),
          level: 'info',
          message: 'Server message',
        };
        vi.mocked(fs.statSync).mockReturnValue({ size: 0 } as fs.Stats);

        await storage.appendEntry(entry);
        expect(fs.appendFileSync).toHaveBeenCalled();
      });
    });

    describe('file rotation', () => {
      it('rotates file when size exceeds maxFileSize', async () => {
        const entry = createEventEntry();
        // Return size larger than 10MB
        vi.mocked(fs.statSync).mockReturnValue({ size: 11 * 1024 * 1024 } as fs.Stats);

        await storage.appendEntry(entry);

        expect(fs.renameSync).toHaveBeenCalledWith(
          logsPath,
          expect.stringMatching(/logs\.\d+\.jsonl/)
        );
        expect(fs.writeFileSync).toHaveBeenCalledWith(logsPath, '');
      });

      it('cleans up old rotated files keeping last 3', async () => {
        const entry = createEventEntry();
        vi.mocked(fs.statSync).mockImplementation((p) => {
          if (p === logsPath) {
            return { size: 11 * 1024 * 1024 } as fs.Stats;
          }
          return { size: 1024, mtime: new Date() } as fs.Stats;
        });
        vi.mocked(fs.readdirSync).mockReturnValue([
          'logs.1000.jsonl',
          'logs.2000.jsonl',
          'logs.3000.jsonl',
          'logs.4000.jsonl',
          'logs.5000.jsonl',
        ] as any);

        await storage.appendEntry(entry);

        // Should delete 2 oldest files (keeping 3)
        expect(fs.unlinkSync).toHaveBeenCalledTimes(2);
      });

      it('resets tracking state after rotation', async () => {
        const now = Date.now();
        const entry1 = createLogEntry({ ms: now, message: 'before rotation' });

        // First call returns large size (triggers rotation), second returns 0
        let callCount = 0;
        vi.mocked(fs.statSync).mockImplementation(() => {
          callCount++;
          if (callCount === 1) {
            return { size: 100 } as fs.Stats;
          }
          return { size: 11 * 1024 * 1024 } as fs.Stats;
        });

        await storage.appendEntry(entry1);

        // After rotation, same entry should not consolidate
        const entry2 = createLogEntry({ ms: now + 500, message: 'before rotation' });
        const result = await storage.appendEntry(entry2);

        // After rotation, tracking is reset, so this should be a new entry
        expect(result.consolidated).toBe(false);
      });
    });
  });

  describe('readLogs', () => {
    it('reads and parses JSONL file', () => {
      const entries = [
        { type: 'event', ts: '2024-01-01T00:00:00Z', ms: 1000, event: 'click' },
        { type: 'log', ts: '2024-01-01T00:00:01Z', ms: 2000, level: 'info', message: 'test' },
      ];
      vi.mocked(fs.readFileSync).mockReturnValue(
        entries.map(e => JSON.stringify(e)).join('\n')
      );

      const logs = storage.readLogs();

      expect(logs).toHaveLength(2);
      expect(logs[0].type).toBe('event');
      expect(logs[1].type).toBe('log');
    });

    it('filters by "since" timestamp', () => {
      const entries = [
        { type: 'event', ts: '2024-01-01T00:00:00Z', ms: 1000, event: 'click' },
        { type: 'log', ts: '2024-01-01T00:00:01Z', ms: 2000, level: 'info', message: 'test' },
        { type: 'log', ts: '2024-01-01T00:00:02Z', ms: 3000, level: 'info', message: 'test2' },
      ];
      vi.mocked(fs.readFileSync).mockReturnValue(
        entries.map(e => JSON.stringify(e)).join('\n')
      );

      const logs = storage.readLogs({ since: 1500 });

      expect(logs).toHaveLength(2);
      expect(logs[0].ms).toBe(2000);
    });

    it('limits by "last" count', () => {
      const entries = [
        { type: 'event', ts: '2024-01-01T00:00:00Z', ms: 1000, event: 'click' },
        { type: 'log', ts: '2024-01-01T00:00:01Z', ms: 2000, level: 'info', message: 'test1' },
        { type: 'log', ts: '2024-01-01T00:00:02Z', ms: 3000, level: 'info', message: 'test2' },
      ];
      vi.mocked(fs.readFileSync).mockReturnValue(
        entries.map(e => JSON.stringify(e)).join('\n')
      );

      const logs = storage.readLogs({ last: 2 });

      expect(logs).toHaveLength(2);
      expect(logs[0].ms).toBe(2000);
      expect(logs[1].ms).toBe(3000);
    });

    it('combines since and last filters', () => {
      const entries = [
        { type: 'event', ts: '2024-01-01T00:00:00Z', ms: 1000, event: 'click' },
        { type: 'log', ts: '2024-01-01T00:00:01Z', ms: 2000, level: 'info', message: 'test1' },
        { type: 'log', ts: '2024-01-01T00:00:02Z', ms: 3000, level: 'info', message: 'test2' },
        { type: 'log', ts: '2024-01-01T00:00:03Z', ms: 4000, level: 'info', message: 'test3' },
      ];
      vi.mocked(fs.readFileSync).mockReturnValue(
        entries.map(e => JSON.stringify(e)).join('\n')
      );

      const logs = storage.readLogs({ since: 1500, last: 2 });

      expect(logs).toHaveLength(2);
      expect(logs[0].ms).toBe(3000);
      expect(logs[1].ms).toBe(4000);
    });

    it('handles empty file', () => {
      vi.mocked(fs.readFileSync).mockReturnValue('');

      const logs = storage.readLogs();

      expect(logs).toEqual([]);
    });

    it('handles read errors gracefully', () => {
      vi.mocked(fs.readFileSync).mockImplementation(() => {
        throw new Error('File not found');
      });

      const logs = storage.readLogs();

      expect(logs).toEqual([]);
    });
  });

  describe('clearLogs', () => {
    it('clears the logs file', () => {
      storage.clearLogs();

      expect(fs.writeFileSync).toHaveBeenCalledWith(logsPath, '');
    });

    it('resets tracking state', async () => {
      const now = Date.now();
      const entry1: LogEntry = {
        type: 'log',
        ts: new Date().toISOString(),
        ms: now,
        level: 'info',
        message: 'before clear',
      };

      vi.mocked(fs.statSync).mockReturnValue({ size: 100 } as fs.Stats);

      await storage.appendEntry(entry1);
      storage.clearLogs();

      // Same entry after clear should not consolidate
      const entry2: LogEntry = {
        type: 'log',
        ts: new Date().toISOString(),
        ms: now + 500,
        level: 'info',
        message: 'before clear',
      };

      const result = await storage.appendEntry(entry2);
      expect(result.consolidated).toBe(false);
    });
  });

  describe('getLogFileSize', () => {
    it('returns file size in bytes', () => {
      vi.mocked(fs.statSync).mockReturnValue({ size: 1024 } as fs.Stats);

      const size = storage.getLogFileSize();

      expect(size).toBe(1024);
    });

    it('returns 0 on error', () => {
      vi.mocked(fs.statSync).mockImplementation(() => {
        throw new Error('File not found');
      });

      const size = storage.getLogFileSize();

      expect(size).toBe(0);
    });
  });
});
