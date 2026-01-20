import * as fs from "fs";
import * as path from "path";
import type { Entry, ServerConfig } from "../types.js";

const REACT_RECALL_DIR = ".react-recall";
const LOGS_FILE = "logs.jsonl";

// Create a signature for an entry to determine if two entries are identical
function getEntrySignature(entry: Entry): string {
  switch (entry.type) {
    case 'event':
      return `event:${entry.event}:${entry.text || ''}:${entry.selector || ''}:${entry.component || ''}:${entry.value || ''}`;
    case 'log':
    case 'server-log':
      return `${entry.type}:${entry.level}:${entry.message}:${JSON.stringify(entry.args || [])}`;
    case 'error':
      return `error:${entry.message}`;
    case 'network':
      return `network:${entry.method}:${entry.url}:${entry.status || 'pending'}`;
    default:
      return JSON.stringify(entry);
  }
}

export class Storage {
  private baseDir: string;
  private logsPath: string;
  private config: ServerConfig;
  private lastEntry: Entry | null = null;
  private lastEntrySignature: string | null = null;
  private lastEntryByteOffset: number = 0; // Track byte position for efficient rewrites

  constructor(workingDir: string, config: ServerConfig) {
    this.baseDir = path.join(workingDir, REACT_RECALL_DIR);
    this.logsPath = path.join(this.baseDir, LOGS_FILE);
    this.config = config;
  }

  async initialize(): Promise<void> {
    // Create directories
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }

    // Create logs file if not exists
    if (!fs.existsSync(this.logsPath)) {
      fs.writeFileSync(this.logsPath, "");
    }

    // Update .gitignore
    await this.updateGitignore();
  }

  private async updateGitignore(): Promise<void> {
    const gitignorePath = path.join(path.dirname(this.baseDir), ".gitignore");
    const entry = ".react-recall/";

    try {
      if (fs.existsSync(gitignorePath)) {
        const content = fs.readFileSync(gitignorePath, "utf-8");
        if (!content.includes(entry)) {
          fs.appendFileSync(
            gitignorePath,
            `\n# react-recall debug logs\n${entry}\n`
          );
        }
      } else {
        fs.writeFileSync(gitignorePath, `# react-recall debug logs\n${entry}\n`);
      }
    } catch {
      // Ignore gitignore errors
    }
  }

  async appendEntry(entry: Entry): Promise<void> {
    const signature = getEntrySignature(entry);

    // Check if this entry matches the last one (within 2 seconds)
    if (this.lastEntry && this.lastEntrySignature === signature) {
      const timeDiff = Math.abs(entry.ms - this.lastEntry.ms);

      if (timeDiff <= 2000) {
        // Increment count on last entry
        this.lastEntry.count = (this.lastEntry.count || 1) + 1;
        this.rewriteLastEntry(this.lastEntry);
        return;
      }
    }

    // Track byte offset before appending (for efficient rewrite)
    try {
      const stats = fs.statSync(this.logsPath);
      this.lastEntryByteOffset = stats.size;
    } catch {
      this.lastEntryByteOffset = 0;
    }

    // New entry - append to file
    const line = JSON.stringify(entry) + "\n";
    fs.appendFileSync(this.logsPath, line);

    // Track this as the last entry
    this.lastEntry = entry;
    this.lastEntrySignature = signature;

    // Check for rotation
    await this.checkRotation();
  }

  private rewriteLastEntry(updatedEntry: Entry): void {
    try {
      // Truncate file to remove old last entry, then append updated entry
      fs.truncateSync(this.logsPath, this.lastEntryByteOffset);
      const line = JSON.stringify(updatedEntry) + "\n";
      fs.appendFileSync(this.logsPath, line);
    } catch {
      // If truncate fails, fall back to append (may create duplicate)
      const line = JSON.stringify(updatedEntry) + "\n";
      fs.appendFileSync(this.logsPath, line);
    }
  }

  private async checkRotation(): Promise<void> {
    try {
      const stats = fs.statSync(this.logsPath);
      const sizeMB = stats.size / (1024 * 1024);

      if (sizeMB >= this.config.maxFileSize) {
        const timestamp = Date.now();
        const rotatedPath = path.join(this.baseDir, `logs.${timestamp}.jsonl`);
        fs.renameSync(this.logsPath, rotatedPath);
        fs.writeFileSync(this.logsPath, "");

        // Reset tracking state since file is now empty
        this.lastEntry = null;
        this.lastEntrySignature = null;
        this.lastEntryByteOffset = 0;

        // Clean up old rotated files (keep last 3)
        await this.cleanupRotatedLogs();
      }
    } catch {
      // Ignore rotation errors
    }
  }

  private async cleanupRotatedLogs(): Promise<void> {
    try {
      const files = fs
        .readdirSync(this.baseDir)
        .filter(
          (f) =>
            f.startsWith("logs.") && f.endsWith(".jsonl") && f !== LOGS_FILE
        )
        .map((f) => ({
          name: f,
          path: path.join(this.baseDir, f),
          mtime: fs.statSync(path.join(this.baseDir, f)).mtime.getTime(),
        }))
        .sort((a, b) => b.mtime - a.mtime);

      // Remove all but last 3
      for (const file of files.slice(3)) {
        fs.unlinkSync(file.path);
      }
    } catch {
      // Ignore cleanup errors
    }
  }

  readLogs(options: { last?: number; since?: number } = {}): Entry[] {
    try {
      const content = fs.readFileSync(this.logsPath, "utf-8");
      const lines = content
        .trim()
        .split("\n")
        .filter((l) => l);
      let entries: Entry[] = lines.map((line) => JSON.parse(line));

      if (options.since) {
        entries = entries.filter((e) => e.ms > options.since!);
      }

      if (options.last) {
        entries = entries.slice(-options.last);
      }

      return entries;
    } catch {
      return [];
    }
  }

  clearLogs(): void {
    fs.writeFileSync(this.logsPath, "");
    this.lastEntry = null;
    this.lastEntrySignature = null;
    this.lastEntryByteOffset = 0;
  }

  getLogFileSize(): number {
    try {
      const stats = fs.statSync(this.logsPath);
      return stats.size;
    } catch {
      return 0;
    }
  }
}
