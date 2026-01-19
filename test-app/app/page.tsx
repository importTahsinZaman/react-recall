"use client";

export default function Home() {
  return (
    <div>
      <h1>React Recall Test App</h1>
      <p>Test pages for exercising react-recall capture features.</p>

      <h2>Test Pages</h2>
      <ul>
        <li><a href="/events">Events</a> - Click, input, form, keypress tests</li>
        <li><a href="/console">Console</a> - Log level triggers (log, info, warn, error, debug)</li>
        <li><a href="/errors">Errors</a> - Runtime errors and unhandled promise rejections</li>
        <li><a href="/network">Network</a> - Fetch tests (success, error, slow, POST)</li>
      </ul>

      <h2>Usage</h2>
      <ol>
        <li>Start react-recall server: <code>npx react-recall</code> (from parent dir)</li>
        <li>Start this app: <code>npm run dev</code></li>
        <li>Dashboard: <a href="http://localhost:4312" target="_blank">http://localhost:4312</a></li>
        <li>Logs: <code>.react-recall/logs.jsonl</code></li>
      </ol>
    </div>
  );
}
