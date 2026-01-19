import { Storage } from "./storage.js";
import { WebSocketHandler } from "./websocket.js";
import { createHTTPServer } from "./http.js";
import { defaultServerConfig, type ServerConfig } from "../types.js";
import { detectNextJs, autoInstrument, printManualInstructions } from "./auto-instrument.js";

interface ParsedArgs {
  config: ServerConfig;
  withServer: boolean;
}

function parseArgs(args: string[]): ParsedArgs {
  const config = { ...defaultServerConfig };
  let withServer = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    if (arg === "--port" && nextArg) {
      config.port = parseInt(nextArg, 10);
      i++;
    } else if (arg === "--max-file-size" && nextArg) {
      config.maxFileSize = parseInt(nextArg, 10);
      i++;
    } else if (arg === "--with-server") {
      withServer = true;
    } else if (arg === "--help" || arg === "-h") {
      console.log(`
react-recall - Debug session recorder for AI-assisted development

Usage: react-recall [options]

Options:
  --port <number>           Server port (default: 4312)
  --max-file-size <number>  Max log file size in MB before rotation (default: 10)
  --with-server             Enable server-side log capture (Next.js auto-setup)
  --help, -h                Show this help message

Example:
  react-recall --port 4312 --with-server
`);
      process.exit(0);
    }
  }

  return { config, withServer };
}

async function main() {
  const { config, withServer } = parseArgs(process.argv.slice(2));
  const workingDir = process.cwd();

  // Handle --with-server flag
  if (withServer) {
    const isNextJs = detectNextJs(workingDir);

    if (isNextJs) {
      const result = autoInstrument(workingDir);
      if (result.success) {
        console.log(`✓ ${result.message}`);
      } else {
        console.log(`\n${result.message}`);
        printManualInstructions();
      }
    } else {
      console.log('\n--with-server auto-setup is only available for Next.js projects.');
      printManualInstructions();
    }
  }

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
${withServer ? '   Server logs: Enabled (restart your Next.js dev server)\n' : ''}
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
