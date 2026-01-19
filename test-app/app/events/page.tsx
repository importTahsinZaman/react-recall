"use client";

import { useState } from "react";

export default function EventsPage() {
  const [inputValue, setInputValue] = useState("");
  const [textareaValue, setTextareaValue] = useState("");
  const [checkboxValue, setCheckboxValue] = useState(false);
  const [radioValue, setRadioValue] = useState("option1");
  const [selectValue, setSelectValue] = useState("a");
  const [formResult, setFormResult] = useState("");

  return (
    <div>
      <h1>Events Test</h1>

      <section style={{ marginBottom: "30px" }}>
        <h2>Buttons</h2>
        <button id="btn-primary">
          Primary Button
        </button>{" "}
        <button className="btn-secondary">
          Secondary Button
        </button>{" "}
        <button data-testid="btn-test">
          Test Button
        </button>
      </section>

      <section style={{ marginBottom: "30px" }}>
        <h2>Text Inputs</h2>
        <div style={{ marginBottom: "10px" }}>
          <label>
            Text Input:{" "}
            <input
              type="text"
              id="text-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type something..."
            />
          </label>
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>
            Password:{" "}
            <input type="password" id="password-input" placeholder="Password (should be masked)" />
          </label>
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>
            Email:{" "}
            <input type="email" id="email-input" placeholder="email@example.com" />
          </label>
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>
            Textarea:
            <br />
            <textarea
              id="textarea-input"
              value={textareaValue}
              onChange={(e) => setTextareaValue(e.target.value)}
              rows={3}
              cols={40}
              placeholder="Multi-line text..."
            />
          </label>
        </div>
      </section>

      <section style={{ marginBottom: "30px" }}>
        <h2>Checkboxes & Radio Buttons</h2>
        <div style={{ marginBottom: "10px" }}>
          <label>
            <input
              type="checkbox"
              id="checkbox-input"
              checked={checkboxValue}
              onChange={(e) => setCheckboxValue(e.target.checked)}
            />{" "}
            Checkbox (checked: {String(checkboxValue)})
          </label>
        </div>
        <div>
          <label>
            <input
              type="radio"
              name="radio-group"
              value="option1"
              checked={radioValue === "option1"}
              onChange={() => setRadioValue("option1")}
            />{" "}
            Option 1
          </label>
          <br />
          <label>
            <input
              type="radio"
              name="radio-group"
              value="option2"
              checked={radioValue === "option2"}
              onChange={() => setRadioValue("option2")}
            />{" "}
            Option 2
          </label>
          <br />
          <label>
            <input
              type="radio"
              name="radio-group"
              value="option3"
              checked={radioValue === "option3"}
              onChange={() => setRadioValue("option3")}
            />{" "}
            Option 3
          </label>
        </div>
      </section>

      <section style={{ marginBottom: "30px" }}>
        <h2>Select Dropdown</h2>
        <label>
          Select:{" "}
          <select
            id="select-input"
            value={selectValue}
            onChange={(e) => setSelectValue(e.target.value)}
          >
            <option value="a">Option A</option>
            <option value="b">Option B</option>
            <option value="c">Option C</option>
          </select>
        </label>
        <span> (selected: {selectValue})</span>
      </section>

      <section style={{ marginBottom: "30px" }}>
        <h2>Form Submission</h2>
        <form
          id="test-form"
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const data = Object.fromEntries(formData.entries());
            setFormResult(JSON.stringify(data, null, 2));
            console.log("Form submitted:", data);
          }}
        >
          <div style={{ marginBottom: "10px" }}>
            <label>
              Name: <input type="text" name="name" id="form-name" />
            </label>
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label>
              Email: <input type="email" name="email" id="form-email" />
            </label>
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label>
              Message:
              <br />
              <textarea name="message" id="form-message" rows={2} cols={30} />
            </label>
          </div>
          <button type="submit" id="form-submit">
            Submit Form
          </button>
        </form>
        {formResult && (
          <pre style={{ background: "#f5f5f5", padding: "10px", marginTop: "10px" }}>
            {formResult}
          </pre>
        )}
      </section>

      <section style={{ marginBottom: "30px" }}>
        <h2>Keyboard Events</h2>
        <p>Press keys in this input to test keypress capture:</p>
        <input
          type="text"
          id="keypress-input"
          placeholder="Press Enter, Escape, Tab..."
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === "Escape" || e.key === "Tab") {
              console.log(`Key pressed: ${e.key}`);
            }
          }}
          style={{ width: "300px" }}
        />
      </section>
    </div>
  );
}
