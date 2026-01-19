"use client";

import { useState } from "react";

export default function NetworkPage() {
  const [results, setResults] = useState<string[]>([]);

  const addResult = (msg: string) => {
    setResults((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const clearResults = () => setResults([]);

  return (
    <div>
      <h1>Network Test</h1>
      <p>Click buttons to trigger different fetch requests. Check react-recall dashboard for captured network activity.</p>

      <section style={{ marginBottom: "30px" }}>
        <h2>GET Requests</h2>
        <button
          id="btn-get-success"
          onClick={async () => {
            addResult("Starting GET /api/success...");
            const res = await fetch("/api/success");
            const data = await res.json();
            addResult(`GET /api/success: ${res.status} - ${JSON.stringify(data)}`);
          }}
        >
          GET Success (200)
        </button>{" "}
        <button
          id="btn-get-error"
          onClick={async () => {
            addResult("Starting GET /api/error...");
            const res = await fetch("/api/error");
            const data = await res.json();
            addResult(`GET /api/error: ${res.status} - ${JSON.stringify(data)}`);
          }}
        >
          GET Error (500)
        </button>{" "}
        <button
          id="btn-get-slow"
          onClick={async () => {
            addResult("Starting GET /api/slow (will take 2s)...");
            const res = await fetch("/api/slow");
            const data = await res.json();
            addResult(`GET /api/slow: ${res.status} - ${JSON.stringify(data)}`);
          }}
        >
          GET Slow (2s delay)
        </button>
      </section>

      <section style={{ marginBottom: "30px" }}>
        <h2>POST Requests</h2>
        <button
          id="btn-post-json"
          onClick={async () => {
            addResult("Starting POST /api/echo with JSON body...");
            const res = await fetch("/api/echo", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name: "Test User", message: "Hello from test app!" }),
            });
            const data = await res.json();
            addResult(`POST /api/echo: ${res.status} - ${JSON.stringify(data)}`);
          }}
        >
          POST with JSON Body
        </button>{" "}
        <button
          id="btn-post-form"
          onClick={async () => {
            addResult("Starting POST /api/echo with form data...");
            const formData = new FormData();
            formData.append("field1", "value1");
            formData.append("field2", "value2");
            const res = await fetch("/api/echo", {
              method: "POST",
              body: formData,
            });
            const data = await res.json();
            addResult(`POST /api/echo (form): ${res.status} - ${JSON.stringify(data)}`);
          }}
        >
          POST with FormData
        </button>
      </section>

      <section style={{ marginBottom: "30px" }}>
        <h2>Custom Headers</h2>
        <button
          id="btn-custom-headers"
          onClick={async () => {
            addResult("Starting request with custom headers...");
            const res = await fetch("/api/echo", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-Custom-Header": "custom-value",
                "X-Request-ID": "req-12345",
                Authorization: "Bearer test-token-xyz",
              },
              body: JSON.stringify({ test: "custom headers" }),
            });
            const data = await res.json();
            addResult(`Custom headers request: ${res.status}`);
          }}
        >
          Request with Custom Headers
        </button>
      </section>

      <section style={{ marginBottom: "30px" }}>
        <h2>Error Scenarios</h2>
        <button
          id="btn-404"
          onClick={async () => {
            addResult("Starting request to non-existent endpoint...");
            const res = await fetch("/api/nonexistent");
            addResult(`GET /api/nonexistent: ${res.status}`);
          }}
        >
          404 Not Found
        </button>{" "}
        <button
          id="btn-network-error"
          onClick={async () => {
            addResult("Starting request to invalid domain...");
            try {
              await fetch("http://invalid-domain-xyz-123.com/api");
              addResult("Request succeeded (unexpected)");
            } catch (e) {
              addResult(`Network error: ${e instanceof Error ? e.message : "Unknown error"}`);
            }
          }}
        >
          Network Error
        </button>
      </section>

      <section style={{ marginBottom: "30px" }}>
        <h2>Parallel Requests</h2>
        <button
          id="btn-parallel"
          onClick={async () => {
            addResult("Starting 3 parallel requests...");
            const [r1, r2, r3] = await Promise.all([
              fetch("/api/success").then((r) => r.json()),
              fetch("/api/success").then((r) => r.json()),
              fetch("/api/slow").then((r) => r.json()),
            ]);
            addResult(`Parallel complete: ${JSON.stringify({ r1, r2, r3 })}`);
          }}
        >
          3 Parallel Requests
        </button>
      </section>

      <section style={{ marginBottom: "30px" }}>
        <h2>External API</h2>
        <button
          id="btn-external"
          onClick={async () => {
            addResult("Fetching from JSONPlaceholder...");
            const res = await fetch("https://jsonplaceholder.typicode.com/posts/1");
            const data = await res.json();
            addResult(`External API: ${res.status} - Post title: "${data.title}"`);
          }}
        >
          Fetch External API
        </button>
      </section>

      <section>
        <h2>Results</h2>
        <button onClick={clearResults} style={{ marginBottom: "10px" }}>
          Clear Results
        </button>
        <pre
          style={{
            background: "#f5f5f5",
            padding: "10px",
            minHeight: "100px",
            maxHeight: "300px",
            overflow: "auto",
          }}
        >
          {results.length === 0 ? "No results yet..." : results.join("\n")}
        </pre>
      </section>
    </div>
  );
}
