"use client";

export default function ConsolePage() {
  return (
    <div>
      <h1>Console Test</h1>
      <p>Click buttons to trigger different console methods. Check react-recall dashboard for captured logs.</p>

      <section style={{ marginBottom: "30px" }}>
        <h2>Basic Log Levels</h2>
        <button id="btn-log" onClick={() => console.log("This is a log message")}>
          console.log
        </button>{" "}
        <button id="btn-info" onClick={() => console.info("This is an info message")}>
          console.info
        </button>{" "}
        <button id="btn-warn" onClick={() => console.warn("This is a warning message")}>
          console.warn
        </button>{" "}
        <button id="btn-error" onClick={() => console.error("This is an error message")}>
          console.error
        </button>{" "}
        <button id="btn-debug" onClick={() => console.debug("This is a debug message")}>
          console.debug
        </button>
      </section>

      <section style={{ marginBottom: "30px" }}>
        <h2>Multiple Arguments</h2>
        <button
          id="btn-multi-args"
          onClick={() => console.log("Multiple", "arguments", "logged", "together")}
        >
          Log Multiple Args
        </button>{" "}
        <button
          id="btn-mixed-types"
          onClick={() => console.log("String", 42, true, null, undefined)}
        >
          Log Mixed Types
        </button>
      </section>

      <section style={{ marginBottom: "30px" }}>
        <h2>Objects & Arrays</h2>
        <button
          id="btn-object"
          onClick={() =>
            console.log("User object:", { name: "John", age: 30, email: "john@example.com" })
          }
        >
          Log Object
        </button>{" "}
        <button
          id="btn-array"
          onClick={() => console.log("Array:", [1, 2, 3, "four", { five: 5 }])}
        >
          Log Array
        </button>{" "}
        <button
          id="btn-nested"
          onClick={() =>
            console.log("Nested:", {
              user: { name: "Jane", address: { city: "NYC", zip: "10001" } },
              items: [{ id: 1 }, { id: 2 }],
            })
          }
        >
          Log Nested Object
        </button>
      </section>

      <section style={{ marginBottom: "30px" }}>
        <h2>Format Strings</h2>
        <button
          id="btn-format"
          onClick={() => console.log("Hello %s, you have %d messages", "User", 5)}
        >
          Log with %s %d
        </button>{" "}
        <button id="btn-format-obj" onClick={() => console.log("Data: %o", { x: 1, y: 2 })}>
          Log with %o
        </button>
      </section>

      <section style={{ marginBottom: "30px" }}>
        <h2>Large Output</h2>
        <button
          id="btn-large"
          onClick={() => {
            const largeObj = Array.from({ length: 100 }, (_, i) => ({
              id: i,
              name: `Item ${i}`,
              value: Math.random(),
            }));
            console.log("Large array:", largeObj);
          }}
        >
          Log Large Array (100 items)
        </button>
      </section>
    </div>
  );
}
