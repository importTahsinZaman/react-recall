# AGENTS.md

This file provides guidance for AI coding assistants working with the ReactRecall repository.

## Project Overview

ReactRecall is a developer debugging tool for React applications. It captures user interactions, console logs, errors, and network requests in real-time and displays them in a dashboard UI. The project consists of two main parts:

1. **SDK** - A React provider that captures events from the browser and sends them to the server
2. **Server** - A Node.js server that receives events, stores them, and serves a dashboard UI

ReactRecall is designed to be used in split-screen mode alongside the main application, typically taking up 30% or less of the screen width.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser                                   │
│  ┌──────────────────────┐    ┌────────────────────────────────┐ │
│  │   Your React App     │    │     ReactRecall Dashboard        │ │
│  │  ┌────────────────┐  │    │     (localhost:4312)           │ │
│  │  │ReactRecallProvider│──────▶  SSE /api/events              │ │
│  │  └────────────────┘  │    │                                │ │
│  │         │            │    └────────────────────────────────┘ │
│  └─────────│────────────┘                   ▲                   │
│            │ HTTP POST /events              │                   │
│            ▼                                │                   │
│  ┌─────────────────────────────────────────┐│                   │
│  │         ReactRecall Server                ││                   │
│  │  - Receives events via HTTP             ││                   │
│  │  - Stores in memory/file                ││                   │
│  │  - Broadcasts via SSE                   │┘                   │
│  │  - Serves dashboard HTML                │                    │
│  └─────────────────────────────────────────┘                    │
└─────────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
src/
├── index.ts              # Main SDK exports
├── provider.tsx          # ReactRecallProvider React component
├── types.ts              # TypeScript types and interfaces
├── capture/
│   ├── events.ts         # Click, input, navigation capture
│   ├── console.ts        # Console log capture
│   ├── errors.ts         # Error/unhandledrejection capture
│   ├── network.ts        # Fetch/XHR interception
│   └── react-fiber.ts    # React component hierarchy capture
├── server/
│   ├── index.ts          # Server entry point (CLI)
│   ├── http.ts           # HTTP route handlers
│   ├── websocket.ts      # Message handler and SSE broadcast
│   ├── dashboard.ts      # Dashboard HTML generation
│   ├── storage.ts        # Event storage (file-based)
│   └── auto-instrument.ts # Auto-instrumentation utilities
├── server-capture/
│   └── index.ts          # Server-side console capture (Node.js)
└── utils/
    ├── selector.ts       # CSS selector generation
    └── websocket.ts      # WebSocket utilities
```

Additional directories:
- `test-app/` - Next.js test application for manual testing
- `.react-recall/` - Created at runtime, stores `logs.jsonl`

## Essential Commands

### Building

```bash
npm run build
```

This runs tsup to compile TypeScript and outputs to `dist/`. The build produces:
- `dist/index.js` - SDK bundle (with "use client" directive for Next.js)
- `dist/index.d.ts` - TypeScript declarations
- `dist/server/index.js` - Server bundle

### Running the Server

```bash
node dist/server/index.js
```

Opens the dashboard at `http://localhost:4312`. The server listens on port 4312 by default.

### Development

```bash
npm run dev   # runs tsup --watch
```

This watches for changes and auto-rebuilds. You still need to restart the server to pick up changes.

### Testing

No unit test framework is currently configured. When adding unit tests, prefer Vitest for consistency with the TypeScript/React ecosystem.

For integration/manual testing, use the included test app in `test-app/`:

```bash
# Terminal 1 - Start react-recall server (from test-app directory for server log capture)
cd /Users/tahsin/Desktop/react-recall/test-app
npx react-recall --with-server

# Terminal 2 - Start the test app (restart required after react-recall creates instrumentation.ts)
cd test-app
npm run dev
```

The `--with-server` flag:
- Auto-creates `instrumentation.ts` in the Next.js project
- Enables server-side log capture from API routes and server components
- Logs appear as `server-log` type (green dot) with source file locations

Then open http://localhost:3000 to interact with test pages, and http://localhost:4312 to view captured events in the dashboard.

**Test app pages:**
- `/events` - Buttons, inputs, checkboxes, forms, keypresses
- `/console` - Triggers for all console log levels
- `/errors` - Sync errors, promise rejections, custom errors
- `/network` - GET/POST requests, slow/error responses, custom headers

**After making changes to react-recall:**

```bash
# 1. Rebuild the package (from react-recall root)
npm run build

# 2. Restart the test-app dev server (picks up new dist/)
# No npm install needed - just restart Next.js
```

For active development with auto-rebuild:

```bash
# Terminal 1 - Watch react-recall for changes
npm run dev   # runs tsup --watch

# Terminal 2 - Run test app
cd test-app && npm run dev
```

**Test app setup:**
- Uses `"react-recall": "file:.."` in package.json to link to parent
- Changes to react-recall source require rebuild, not reinstall
- Logs are written to `.react-recall/logs.jsonl`

**Testing with agent-browser (agent-browser.dev) (for AI agents):**

Install agent-browser if not already installed:
```bash
npm install -g agent-browser
agent-browser install  # Download Chromium
```

Example workflow to test react-recall capture:
```bash
# Open the test app
agent-browser open http://localhost:3000 --headed

# Get interactive elements with refs
agent-browser snapshot -i
# Output:
# - link "Events" [ref=e2]
# - button "Primary Button" [ref=e6]
# - textbox "Text Input:" [ref=e9]

# Interact using refs
agent-browser click @e2              # Navigate to events page
agent-browser click @e6              # Click a button
agent-browser fill @e9 "test input"  # Fill an input

# Check captured logs
cat .react-recall/logs.jsonl | tail -5

# Close browser when done
agent-browser close
```

Key agent-browser commands:
- `snapshot -i` - Get interactive elements only (buttons, inputs, links)
- `click @ref` - Click element by ref from snapshot
- `fill @ref "text"` - Fill input by ref
- `console` - View browser console messages
- `screenshot [path]` - Take screenshot

## Key Files

### `src/types.ts`
Central type definitions. All entry types (`EventEntry`, `LogEntry`, `ErrorEntry`, `NetworkEntry`) extend `BaseEntry`. Message types define the SDK-to-server protocol.

**When modifying:**
- Keep `Entry` union type updated when adding new entry types
- Keep `ClientMessage` union type updated when adding new message types
- Ensure both the entry interface and message interface stay in sync

### `src/provider.tsx`
The React provider that initializes capture and sends events to the server.

**Key patterns:**
- Uses `useRef` for initialization to avoid double-init in React strict mode
- `send()` function uses `sendBeacon` for small payloads, `fetch` for large ones
- Has a kill switch (`serverDown`) that disables capture after 3 consecutive failures
- All capture modules are set up in a `useEffect` with cleanup functions

### `src/capture/network.ts`
Intercepts `fetch` and `XMLHttpRequest` to capture network requests.

**Key patterns:**
- Stores original methods and restores them on cleanup
- Uses `WeakMap` to associate metadata with XHR instances
- Clones responses before reading body to avoid consuming the stream
- Uses Resource Timing API for detailed timing breakdown
- Captures initiator via `new Error().stack`
- Rate limits to 50 requests/second, queues up to 100 events
- Truncates bodies larger than 100KB

### `src/server/dashboard.ts`
Single function that returns the complete dashboard HTML as a string.

**Key patterns:**
- All CSS is embedded in a `<style>` tag using CSS custom properties
- All JavaScript is embedded in a `<script>` tag
- Uses "Mission Control" dark theme with electric cyan accent (#00d4ff)
- Design tokens are scaled to 110% for readability
- Responsive breakpoints at 479px (narrow) and 768px (wide)

**When modifying the dashboard:**
- CSS variables are defined in `:root` at the top of the style block
- JavaScript functions are at the bottom of the script block
- The `renderTimeline()` function rebuilds the entire timeline on each update
- Network details are rendered inline but hidden until expanded

### `src/server/websocket.ts`
Handles incoming messages from the SDK and broadcasts to dashboard clients.

**Key patterns:**
- Despite the name, now primarily receives HTTP POST requests (not WebSocket)
- Still uses WebSocket infrastructure for potential future use
- `handleMessage()` creates typed entries with server-side timestamps
- SSE clients register callbacks via `registerSSEClient()`
- `broadcast()` calls all registered SSE callbacks

## Data Flow

1. **Capture** - Browser events trigger capture modules in `src/capture/`
2. **Send** - `provider.tsx` sends JSON via HTTP POST to `/events`
3. **Process** - `http.ts` receives POST, calls `websocket.handleMessage()`
4. **Store** - `websocket.ts` appends entry to `storage` and calls `broadcast()`
5. **Display** - SSE pushes entry to dashboard, `renderTimeline()` updates UI

## Entry Types

| Type | Dot Color | Captured From |
|------|-----------|---------------|
| `event` | Blue | Clicks, inputs, navigation, custom events |
| `log` | Gray | `console.log/info/warn/debug` (browser) |
| `error` | Red | `console.error`, `window.onerror`, `unhandledrejection` |
| `network` | Purple | `fetch`, `XMLHttpRequest` |
| `server-log` | Green | Server-side `console.*` via `react-recall/server` |

## Configuration

The SDK accepts a `ReactRecallConfig` object:

```typescript
interface ReactRecallConfig {
  serverUrl?: string;        // Default: "ws://localhost:4312"
  enabled?: boolean;         // Default: NODE_ENV === "development"
  captureClicks?: boolean;   // Default: true
  captureInputs?: boolean;   // Default: true
  captureNavigation?: boolean; // Default: true
  captureLogs?: boolean;     // Default: true
  captureErrors?: boolean;   // Default: true
  captureNetwork?: boolean;  // Default: true
  excludeSelectors?: string[]; // CSS selectors to exclude
  maskInputs?: string[];     // Default: ['[type="password"]']
}
```

## Common Development Tasks

### Adding a New Entry Type

1. Add interface to `src/types.ts` extending `BaseEntry`
2. Add to `Entry` union type
3. Add message interface and add to `ClientMessage` union
4. Add capture module in `src/capture/`
5. Set up capture in `provider.tsx` useEffect
6. Add case in `websocket.ts` `handleMessage()`
7. Add rendering logic in `dashboard.ts` `renderTimeline()`
8. Add filter chip in dashboard HTML
9. Update `activeFilters` default set in dashboard JavaScript

### Modifying the Dashboard UI

1. Read `src/server/dashboard.ts` first
2. CSS changes go in the `<style>` block using existing CSS variables
3. JavaScript changes go in the `<script>` block
4. Run `npm run build` to compile
5. Restart server and refresh dashboard to see changes

### Adding a New Capture Module

1. Create file in `src/capture/` following existing patterns
2. Export a setup function that returns a cleanup function
3. Import and call in `provider.tsx` useEffect
4. Add config flag to `ReactRecallConfig` if capture should be optional

## Code Conventions

### TypeScript
- Use explicit types for function parameters and return values
- Prefer interfaces over type aliases for object shapes
- Use `Record<string, T>` for string-keyed objects

### React
- Use function components with hooks
- The `"use client"` directive is automatically prepended to the SDK bundle
- Avoid re-renders by using refs for values that don't need to trigger updates

### CSS (Dashboard)
- Use CSS custom properties (variables) for all colors, spacing, and typography
- Follow the existing naming convention: `--bg-*`, `--text-*`, `--border-*`, `--space-*`
- Keep responsive styles in `@media` blocks at the end of the style section

### Error Handling
- Capture modules should never throw - wrap in try/catch and fail silently
- Use the `isServerDown()` check to skip capture when server is unreachable
- Network capture skips ReactRecall's own requests (paths `/events` and `/health`)

## Gotchas

1. **No hot reload** - Must rebuild and restart server after changes
2. **Dashboard is a string** - The entire dashboard is returned from a function, not served from a file
3. **HTTP not WebSocket** - Despite file names, SDK uses HTTP POST, not WebSocket
4. **Body size limits** - Network bodies are truncated at 100KB to prevent memory issues
5. **Rate limiting** - Network capture limits to 50 requests/second
6. **Timestamps** - SDK sends `timestamp` string, server generates `ts` (ISO) and `ms` (unix)
7. **Pending requests** - Network entries are sent twice: once at start (`pending: true`), once at completion (`pending: false`). Dashboard merges by `requestId`

