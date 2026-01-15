import * as fs from "fs";
import * as path from "path";
import type { Entry, ServerConfig } from "../types.js";

const REACT_RECALL_DIR = ".react-recall";
const LOGS_FILE = "logs.jsonl";

export class Storage {
  private baseDir: string;
  private logsPath: string;
  private config: ServerConfig;

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
    const line = JSON.stringify(entry) + "\n";
    fs.appendFileSync(this.logsPath, line);

    // Check for rotation
    await this.checkRotation();
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
