import * as fs from "fs";
import * as path from "path";
import type { Entry, ServerConfig } from "../types.js";

const REACT_RECALL_DIR = ".react-recall";
const LOGS_FILE = "logs.jsonl";

// Create a signature for an entry to determine if two entries are identical
function getEntrySignature(entry: Entry): string {
  if (entry.type === 'event') {
    const e = entry as any;
    return `event:${e.event}:${e.text || ''}:${e.selector || ''}:${e.component || ''}:${e.value || ''}`;
  } else if (entry.type === 'log' || entry.type === 'server-log') {
    const e = entry as any;
    return `${e.type}:${e.level}:${e.message}:${JSON.stringify(e.args || [])}`;
  } else if (entry.type === 'error') {
    const e = entry as any;
    return `error:${e.message}`;
  } else if (entry.type === 'network') {
    const e = entry as any;
    return `network:${e.method}:${e.url}:${e.status || 'pending'}`;
  }
  return JSON.stringify(entry);
}

export class Storage {
  private baseDir: string;
  private logsPath: string;
  private config: ServerConfig;
  private lastEntry: Entry | null = null;
  private lastEntrySignature: string | null = null;

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
    const entryTime = new Date(entry.ts).getTime();

    // Check if this entry matches the last one (within 2 seconds)
    if (this.lastEntry && this.lastEntrySignature === signature) {
      const lastTime = new Date(this.lastEntry.ts).getTime();
      const timeDiff = Math.abs(entryTime - lastTime);

      if (timeDiff <= 2000) {
        // Increment count on last entry
        const count = ((this.lastEntry as any).count || 1) + 1;
        (this.lastEntry as any).count = count;

        // Rewrite the file with updated last entry
        this.rewriteLastEntry(this.lastEntry);
        return;
      }
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
      const content = fs.readFileSync(this.logsPath, "utf-8");
      const lines = content.trim().split("\n").filter(l => l);

      if (lines.length > 0) {
        // Replace the last line with updated entry
        lines[lines.length - 1] = JSON.stringify(updatedEntry);
        fs.writeFileSync(this.logsPath, lines.join("\n") + "\n");
      }
    } catch {
      // If rewrite fails, just append as new entry
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
