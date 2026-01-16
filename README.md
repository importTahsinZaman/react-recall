# React Recall | react-recall.com

React Recall is a debug session recorder that makes it really easy for you and your AI agents to view logs and trace user flows.

It captures every click, log, error, and network request in your React app to a .react-recall/logs.jsonl file, so your coding agent can use the tools it already knows to analyze the logs in context to the user flow.

## Installation

```bash
npm install -D react-recall
```

## Quick Start

### 1. Add the provider to your app

```tsx
// app/layout.tsx (Next.js) or App.tsx (CRA/Vite)
import { ReactRecallProvider } from "react-recall";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ReactRecallProvider>{children}</ReactRecallProvider>
      </body>
    </html>
  );
}
```

### 2. Start the dashboard server

```bash
npx react-recall
```

Navigate to [http://localhost:4312](http://localhost:4312) to view captured events in real-time.

> Tip: Add `react-recall` to your dev script so you don't need to run an extra command:
>
> ```json
> "dev": "next dev & react-recall"
> ```

### 3. (Optional) Add to your AGENTS.md

Help your AI coding agents discover React Recall by adding this to your project's `AGENTS.md`:

````markdown
## React Recall Debug Logs

React Recall captures user interactions, console logs, errors, and network requests in `.react-recall/logs.jsonl`. Each line is a JSON object.

### Querying Logs

```bash
# Last 10 events
tail -n 10 .react-recall/logs.jsonl

# All errors
grep '"type":"error"' .react-recall/logs.jsonl

# All network failures (4xx, 5xx)
grep '"type":"network"' .react-recall/logs.jsonl | grep -E '"status":[45][0-9]{2}'

# Search for specific text
grep -i "submit" .react-recall/logs.jsonl

# Get just error messages
grep '"type":"error"' .react-recall/logs.jsonl | jq -r '.message'

# Events from last 60 seconds
SINCE=$(($(date +%s) * 1000 - 60000)) && awk -v since="$SINCE" -F'"ms":' '$2+0 > since' .react-recall/logs.jsonl
```

### Event Types

- `type: "event"` - User interactions (clicks, inputs, navigation)
- `type: "error"` - Uncaught errors and unhandled rejections
- `type: "log"` - Console logs (log, info, warn, debug)
- `type: "network"` - Fetch/XHR requests with full request/response data
````

## Configuration

```tsx
<ReactRecallProvider
  config={{
    // Server URL (default: localhost:4312)
    serverUrl: "ws://localhost:4312",

    // Only runs in development by default
    enabled: process.env.NODE_ENV === "development",

    // Toggle capture types
    captureClicks: true,
    captureInputs: true,
    captureNavigation: true,
    captureLogs: true,
    captureErrors: true,
    captureNetwork: true,

    // Exclude elements from capture
    excludeSelectors: [".sensitive-data"],

    // Mask input values (passwords masked by default)
    maskInputs: ['[type="password"]', "[data-sensitive]"],
  }}
>
  {children}
</ReactRecallProvider>
```

## CLI Options

```bash
react-recall [options]

Options:
  --port <number>           Server port (default: 4312)
  --max-file-size <number>  Max log file size in MB before rotation (default: 10)
  --help, -h                Show help
```

## How It Works

React Recall uses standard browser APIs to observe your application without interfering:

- **Console/Errors**: Wraps native methods, calls originals after capture
- **Network**: Intercepts fetch/XHR, clones responses before reading
- **Events**: Passive listeners that never block propagation
- **React Components**: Reads fiber nodes from DOM (read-only)

Zero impact on your app's functionality. Automatically disables if the server is unreachable.

## Storage

Logs are stored in `.react-recall/logs.jsonl` in your project directory. This folder is automatically added to `.gitignore`.

## License

MIT
