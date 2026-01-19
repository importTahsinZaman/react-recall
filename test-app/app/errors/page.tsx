"use client";

import { useState } from "react";

function BuggyComponent({ shouldError }: { shouldError: boolean }) {
  if (shouldError) {
    throw new Error("Component render error: BuggyComponent intentionally crashed!");
  }
  return <div>Component rendered successfully</div>;
}

export default function ErrorsPage() {
  const [triggerRenderError, setTriggerRenderError] = useState(false);
  const [errorCaught, setErrorCaught] = useState(false);

  return (
    <div>
      <h1>Errors Test</h1>
      <p>Click buttons to trigger different error types. Check react-recall dashboard for captured errors.</p>

      <section style={{ marginBottom: "30px" }}>
        <h2>Synchronous Errors</h2>
        <button
          id="btn-sync-error"
          onClick={() => {
            throw new Error("Synchronous error thrown from click handler!");
          }}
        >
          Throw Sync Error
        </button>{" "}
        <button
          id="btn-type-error"
          onClick={() => {
            const obj: unknown = null;
            (obj as { foo: () => void }).foo();
          }}
        >
          Trigger TypeError
        </button>{" "}
        <button
          id="btn-reference-error"
          onClick={() => {
            // @ts-expect-error intentional reference error
            nonExistentFunction();
          }}
        >
          Trigger ReferenceError
        </button>
      </section>

      <section style={{ marginBottom: "30px" }}>
        <h2>Promise Rejections</h2>
        <button
          id="btn-promise-reject"
          onClick={() => {
            Promise.reject(new Error("Unhandled promise rejection!"));
          }}
        >
          Unhandled Promise Rejection
        </button>{" "}
        <button
          id="btn-async-error"
          onClick={async () => {
            await new Promise((_, reject) =>
              setTimeout(() => reject(new Error("Async error after delay")), 100)
            );
          }}
        >
          Async Error (100ms delay)
        </button>{" "}
        <button
          id="btn-fetch-error"
          onClick={async () => {
            await fetch("http://invalid-domain-12345.com/api");
          }}
        >
          Fetch Network Error
        </button>
      </section>

      <section style={{ marginBottom: "30px" }}>
        <h2>React Component Errors</h2>
        <p>
          Note: These will crash the component tree. React error boundary would normally catch these.
        </p>
        {!triggerRenderError ? (
          <button
            id="btn-render-error"
            onClick={() => {
              setTriggerRenderError(true);
              // Reset after a short delay so the page remains usable
              setTimeout(() => {
                setTriggerRenderError(false);
                setErrorCaught(true);
              }, 100);
            }}
          >
            Trigger Render Error
          </button>
        ) : (
          <BuggyComponent shouldError={true} />
        )}
        {errorCaught && (
          <span style={{ color: "green", marginLeft: "10px" }}>
            Error was triggered (check console/logs)
          </span>
        )}
      </section>

      <section style={{ marginBottom: "30px" }}>
        <h2>Error with Stack Trace</h2>
        <button
          id="btn-deep-error"
          onClick={() => {
            function level1() {
              level2();
            }
            function level2() {
              level3();
            }
            function level3() {
              throw new Error("Error from deeply nested function call");
            }
            level1();
          }}
        >
          Deep Stack Error
        </button>
      </section>

      <section style={{ marginBottom: "30px" }}>
        <h2>Custom Error Types</h2>
        <button
          id="btn-custom-error"
          onClick={() => {
            class CustomError extends Error {
              code: string;
              constructor(message: string, code: string) {
                super(message);
                this.name = "CustomError";
                this.code = code;
              }
            }
            throw new CustomError("This is a custom error", "ERR_CUSTOM_001");
          }}
        >
          Throw Custom Error
        </button>
      </section>
    </div>
  );
}
