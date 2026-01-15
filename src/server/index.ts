import { Storage } from "./storage.js";
import { WebSocketHandler } from "./websocket.js";
import { createHTTPServer } from "./http.js";
import { defaultServerConfig, type ServerConfig } from "../types.js";

function parseArgs(args: string[]): ServerConfig {
  const config = { ...defaultServerConfig };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    if (arg === "--port" && nextArg) {
      config.port = parseInt(nextArg, 10);
      i++;
    } else if (arg === "--max-file-size" && nextArg) {
      config.maxFileSize = parseInt(nextArg, 10);
      i++;
    } else if (arg === "--help" || arg === "-h") {
      console.log(`
react-recall - Debug session recorder for AI-assisted development

Usage: react-recall [options]

Options:
  --port <number>           Server port (default: 4312)
  --max-file-size <number>  Max log file size in MB before rotation (default: 10)
  --help, -h                Show this help message

Example:
  react-recall --port 4312 --max-file-size 20
`);
      process.exit(0);
    }
  }

  return config;
}

async function main() {
  const config = parseArgs(process.argv.slice(2));
  const workingDir = process.cwd();

  // Initialize storage
  const storage = new Storage(workingDir, config);
  await storage.initialize();

  // Create WebSocket handler
  const wsHandler = new WebSocketHandler(storage);

  // Create HTTP server
  const server = createHTTPServer(storage, wsHandler);

  // Start server
  server.listen(config.port, () => {
    console.log(`
react-recall running

   Dashboard:  http://localhost:${config.port}
   Log file:   .react-recall/logs.jsonl
`);
  });

  // Handle shutdown
  process.on("SIGINT", () => {
    console.log("\nShutting down...");
    server.close();
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    server.close();
    process.exit(0);
  });
}

main().catch((err) => {
  console.error("Failed to start react-recall:", err);
  process.exit(1);
});
