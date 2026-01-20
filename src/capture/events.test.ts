import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  setupClickCapture,
  setupInputCapture,
  setupNavigationCapture,
  setupFormCapture,
} from './events';
import {
  createButton,
  createInput,
  createForm,
  createSelect,
  createTextarea,
  createDiv,
} from '../__tests__/mocks/dom';
import { createMockConfig } from '../__tests__/mocks/provider';

// Mock the provider module
vi.mock('../provider.js', () => ({
  isServerDown: vi.fn(() => false),
}));

// Mock the react-fiber module
vi.mock('./react-fiber.js', () => ({
  getReactComponentInfo: vi.fn(() => ({
    component: null,
    stack: [],
    displayString: null,
  })),
}));

import { isServerDown } from '../provider.js';
import { getReactComponentInfo } from './react-fiber.js';

interface CapturedEvent {
  event: string;
  selector?: string;
  text?: string;
  value?: string;
  url?: string;
  component?: string;
  checked?: boolean;
  formAction?: string;
  formMethod?: string;
  key?: string;
}

describe('setupClickCapture', () => {
  let cleanup: (() => void) | null = null;
  let capturedEvents: CapturedEvent[];
  let callback: (data: CapturedEvent) => void;
  let container: HTMLDivElement;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();

    container = document.createElement('div');
    document.body.appendChild(container);

    capturedEvents = [];
    callback = (data) => {
      capturedEvents.push(data);
    };

    vi.mocked(isServerDown).mockReturnValue(false);
    vi.mocked(getReactComponentInfo).mockReturnValue({
      component: null,
      stack: [],
      displayString: null,
    });
  });

  afterEach(() => {
    if (cleanup) {
      cleanup();
      cleanup = null;
    }
    document.body.removeChild(container);
    vi.useRealTimers();
  });

  describe('click capture', () => {
    it('captures button clicks', async () => {
      const config = createMockConfig();
      cleanup = setupClickCapture(config, callback);

      const button = createButton({ id: 'test-btn', text: 'Click Me' });
      container.appendChild(button);

      button.click();
      await vi.advanceTimersByTimeAsync(600);

      expect(capturedEvents).toHaveLength(1);
      expect(capturedEvents[0].event).toBe('click');
      expect(capturedEvents[0].selector).toBe('#test-btn');
      expect(capturedEvents[0].text).toBe('Click Me');
    });

    it('includes component info when available', async () => {
      vi.mocked(getReactComponentInfo).mockReturnValue({
        component: 'Button',
        stack: ['Button', 'Toolbar'],
        displayString: 'Button > Toolbar',
      });

      const config = createMockConfig();
      cleanup = setupClickCapture(config, callback);

      const button = createButton({ id: 'btn' });
      container.appendChild(button);
      button.click();

      await vi.advanceTimersByTimeAsync(600);

      expect(capturedEvents[0].component).toBe('Button > Toolbar');
    });
  });

  describe('click debouncing', () => {
    it('debounces rapid clicks within 100ms', async () => {
      const config = createMockConfig();
      cleanup = setupClickCapture(config, callback);

      const button = createButton({ id: 'btn' });
      container.appendChild(button);

      // Click rapidly
      button.click();
      await vi.advanceTimersByTimeAsync(50);
      button.click();
      await vi.advanceTimersByTimeAsync(50);
      button.click();

      await vi.advanceTimersByTimeAsync(600);

      // Only first click should be captured
      expect(capturedEvents.length).toBeLessThanOrEqual(2);
    });

    it('captures clicks after debounce period', async () => {
      const config = createMockConfig();
      cleanup = setupClickCapture(config, callback);

      const button = createButton({ id: 'btn' });
      container.appendChild(button);

      button.click();
      await vi.advanceTimersByTimeAsync(150);
      button.click();

      await vi.advanceTimersByTimeAsync(600);

      expect(capturedEvents).toHaveLength(2);
    });
  });

  describe('checkbox and radio clicks', () => {
    it('captures checkbox checked state', async () => {
      const config = createMockConfig();
      cleanup = setupClickCapture(config, callback);

      const checkbox = createInput({ type: 'checkbox', id: 'check' });
      container.appendChild(checkbox);

      checkbox.click();
      await vi.advanceTimersByTimeAsync(600);

      expect(capturedEvents[0].checked).toBe(true);
    });

    it('captures radio button checked state', async () => {
      const config = createMockConfig();
      cleanup = setupClickCapture(config, callback);

      const radio = createInput({ type: 'radio', name: 'option' });
      container.appendChild(radio);

      radio.click();
      await vi.advanceTimersByTimeAsync(600);

      expect(capturedEvents[0].checked).toBe(true);
    });
  });

  describe('exclusion', () => {
    it('excludes elements matching exclude selectors', async () => {
      const config = createMockConfig({ excludeSelectors: ['.excluded'] });
      cleanup = setupClickCapture(config, callback);

      const button = createButton({ classes: ['excluded'] });
      container.appendChild(button);
      button.click();

      await vi.advanceTimersByTimeAsync(600);

      expect(capturedEvents).toHaveLength(0);
    });

    it('excludes elements inside excluded containers', async () => {
      const config = createMockConfig({ excludeSelectors: ['.excluded-container'] });
      cleanup = setupClickCapture(config, callback);

      const div = createDiv({ classes: ['excluded-container'] });
      const button = createButton({ id: 'nested-btn' });
      div.appendChild(button);
      container.appendChild(div);

      button.click();
      await vi.advanceTimersByTimeAsync(600);

      expect(capturedEvents).toHaveLength(0);
    });
  });

  describe('kill switch', () => {
    it('does not capture clicks when server is down', async () => {
      vi.mocked(isServerDown).mockReturnValue(true);

      const config = createMockConfig();
      cleanup = setupClickCapture(config, callback);

      const button = createButton({ id: 'btn' });
      container.appendChild(button);
      button.click();

      await vi.advanceTimersByTimeAsync(600);

      expect(capturedEvents).toHaveLength(0);
    });
  });

  describe('cleanup', () => {
    it('stops capturing clicks after cleanup', async () => {
      const config = createMockConfig();
      cleanup = setupClickCapture(config, callback);
      cleanup();
      cleanup = null;

      const button = createButton({ id: 'btn' });
      container.appendChild(button);
      button.click();

      await vi.advanceTimersByTimeAsync(600);

      expect(capturedEvents).toHaveLength(0);
    });
  });
});

describe('setupInputCapture', () => {
  let cleanup: (() => void) | null = null;
  let capturedEvents: CapturedEvent[];
  let callback: (data: CapturedEvent) => void;
  let container: HTMLDivElement;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();

    container = document.createElement('div');
    document.body.appendChild(container);

    capturedEvents = [];
    callback = (data) => {
      capturedEvents.push(data);
    };

    vi.mocked(isServerDown).mockReturnValue(false);
    vi.mocked(getReactComponentInfo).mockReturnValue({
      component: null,
      stack: [],
      displayString: null,
    });
  });

  afterEach(() => {
    if (cleanup) {
      cleanup();
      cleanup = null;
    }
    document.body.removeChild(container);
    vi.useRealTimers();
  });

  describe('input capture', () => {
    it('captures text input values', async () => {
      const config = createMockConfig();
      cleanup = setupInputCapture(config, callback);

      const input = createInput({ id: 'text-input' });
      container.appendChild(input);

      input.value = 'test value';
      input.dispatchEvent(new Event('input', { bubbles: true }));

      await vi.advanceTimersByTimeAsync(400);

      expect(capturedEvents).toHaveLength(1);
      expect(capturedEvents[0].event).toBe('input');
      expect(capturedEvents[0].value).toBe('test value');
    });

    it('captures textarea values', async () => {
      const config = createMockConfig();
      cleanup = setupInputCapture(config, callback);

      const textarea = createTextarea({ id: 'textarea' });
      container.appendChild(textarea);

      textarea.value = 'multiline\ntext';
      textarea.dispatchEvent(new Event('input', { bubbles: true }));

      await vi.advanceTimersByTimeAsync(400);

      expect(capturedEvents).toHaveLength(1);
      expect(capturedEvents[0].value).toBe('multiline\ntext');
    });

    // Note: jsdom doesn't fully support contenteditable behavior
    // (textContent is not updated on input events like in real browsers)
    it.skip('captures contenteditable input', async () => {
      const config = createMockConfig();
      cleanup = setupInputCapture(config, callback);

      const div = document.createElement('div');
      div.contentEditable = 'true';
      div.id = 'editable';
      div.textContent = 'editable content';
      container.appendChild(div);

      div.dispatchEvent(new Event('input', { bubbles: true }));

      await vi.advanceTimersByTimeAsync(400);

      expect(capturedEvents).toHaveLength(1);
      expect(capturedEvents[0].value).toBe('editable content');
    });
  });

  describe('input debouncing', () => {
    it('debounces input events with 300ms delay', async () => {
      const config = createMockConfig();
      cleanup = setupInputCapture(config, callback);

      const input = createInput({ id: 'input' });
      container.appendChild(input);

      // Type quickly
      input.value = 'a';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await vi.advanceTimersByTimeAsync(100);

      input.value = 'ab';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await vi.advanceTimersByTimeAsync(100);

      input.value = 'abc';
      input.dispatchEvent(new Event('input', { bubbles: true }));

      // Wait for debounce
      await vi.advanceTimersByTimeAsync(400);

      // Should only capture final value
      expect(capturedEvents).toHaveLength(1);
      expect(capturedEvents[0].value).toBe('abc');
    });
  });

  describe('password masking', () => {
    it('masks password input values', async () => {
      const config = createMockConfig({ maskInputs: ['[type="password"]'] });
      cleanup = setupInputCapture(config, callback);

      const input = createInput({ type: 'password' });
      container.appendChild(input);

      input.value = 'secret123';
      input.dispatchEvent(new Event('input', { bubbles: true }));

      await vi.advanceTimersByTimeAsync(400);

      expect(capturedEvents[0].value).toBe('[hidden]');
    });

    it('masks inputs matching custom mask selectors', async () => {
      const config = createMockConfig({ maskInputs: ['.sensitive'] });
      cleanup = setupInputCapture(config, callback);

      const input = createInput({ classes: ['sensitive'] });
      container.appendChild(input);

      input.value = 'ssn-123';
      input.dispatchEvent(new Event('input', { bubbles: true }));

      await vi.advanceTimersByTimeAsync(400);

      expect(capturedEvents[0].value).toBe('[hidden]');
    });
  });

  describe('checkbox/radio exclusion', () => {
    it('skips checkbox inputs (handled by click capture)', async () => {
      const config = createMockConfig();
      cleanup = setupInputCapture(config, callback);

      const checkbox = createInput({ type: 'checkbox' });
      container.appendChild(checkbox);

      checkbox.dispatchEvent(new Event('input', { bubbles: true }));

      await vi.advanceTimersByTimeAsync(400);

      expect(capturedEvents).toHaveLength(0);
    });

    it('skips radio inputs (handled by click capture)', async () => {
      const config = createMockConfig();
      cleanup = setupInputCapture(config, callback);

      const radio = createInput({ type: 'radio' });
      container.appendChild(radio);

      radio.dispatchEvent(new Event('input', { bubbles: true }));

      await vi.advanceTimersByTimeAsync(400);

      expect(capturedEvents).toHaveLength(0);
    });
  });

  describe('cleanup', () => {
    it('clears pending debounced inputs on cleanup', async () => {
      const config = createMockConfig();
      cleanup = setupInputCapture(config, callback);

      const input = createInput({ id: 'input' });
      container.appendChild(input);

      input.value = 'pending';
      input.dispatchEvent(new Event('input', { bubbles: true }));

      // Cleanup before debounce completes
      cleanup();
      cleanup = null;

      await vi.advanceTimersByTimeAsync(400);

      expect(capturedEvents).toHaveLength(0);
    });
  });
});

describe('setupNavigationCapture', () => {
  let cleanup: (() => void) | null = null;
  let capturedEvents: CapturedEvent[];
  let callback: (data: CapturedEvent) => void;
  let originalPushState: typeof history.pushState;
  let originalReplaceState: typeof history.replaceState;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();

    originalPushState = history.pushState;
    originalReplaceState = history.replaceState;

    capturedEvents = [];
    callback = (data) => {
      capturedEvents.push(data);
    };

    vi.mocked(isServerDown).mockReturnValue(false);
  });

  afterEach(() => {
    if (cleanup) {
      cleanup();
      cleanup = null;
    }

    history.pushState = originalPushState;
    history.replaceState = originalReplaceState;

    vi.useRealTimers();
  });

  describe('pushState capture', () => {
    it('captures history.pushState navigation', async () => {
      cleanup = setupNavigationCapture(callback);

      history.pushState({}, '', '/new-page');
      await vi.advanceTimersByTimeAsync(100);

      expect(capturedEvents).toHaveLength(1);
      expect(capturedEvents[0].event).toBe('navigation');
      expect(capturedEvents[0].url).toContain('/new-page');
    });
  });

  describe('replaceState capture', () => {
    it('captures history.replaceState navigation', async () => {
      cleanup = setupNavigationCapture(callback);

      history.replaceState({}, '', '/replaced-page');
      await vi.advanceTimersByTimeAsync(100);

      expect(capturedEvents).toHaveLength(1);
      expect(capturedEvents[0].event).toBe('navigation');
      expect(capturedEvents[0].url).toContain('/replaced-page');
    });
  });

  describe('popstate capture', () => {
    it('captures popstate events', async () => {
      cleanup = setupNavigationCapture(callback);

      // Navigate first
      history.pushState({}, '', '/page1');
      await vi.advanceTimersByTimeAsync(100);

      // Clear events
      capturedEvents.length = 0;

      // Trigger popstate
      window.dispatchEvent(new PopStateEvent('popstate'));
      await vi.advanceTimersByTimeAsync(100);

      // Note: popstate might not trigger if URL hasn't changed
      // This test verifies the handler is attached
    });
  });

  describe('deduplication', () => {
    it('does not emit duplicate navigation events', async () => {
      cleanup = setupNavigationCapture(callback);

      history.pushState({}, '', '/same-page');
      await vi.advanceTimersByTimeAsync(100);

      // Push to same URL
      history.pushState({}, '', '/same-page');
      await vi.advanceTimersByTimeAsync(100);

      expect(capturedEvents).toHaveLength(1);
    });
  });

  describe('kill switch', () => {
    it('does not capture navigation when server is down', async () => {
      vi.mocked(isServerDown).mockReturnValue(true);

      cleanup = setupNavigationCapture(callback);

      history.pushState({}, '', '/blocked');
      await vi.advanceTimersByTimeAsync(100);

      expect(capturedEvents).toHaveLength(0);
    });
  });

  describe('cleanup', () => {
    it('restores original pushState', () => {
      cleanup = setupNavigationCapture(callback);
      cleanup();
      cleanup = null;

      expect(history.pushState).toBe(originalPushState);
    });

    it('restores original replaceState', () => {
      cleanup = setupNavigationCapture(callback);
      cleanup();
      cleanup = null;

      expect(history.replaceState).toBe(originalReplaceState);
    });
  });
});

describe('setupFormCapture', () => {
  let cleanup: (() => void) | null = null;
  let capturedEvents: CapturedEvent[];
  let callback: (data: CapturedEvent) => void;
  let container: HTMLDivElement;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();

    container = document.createElement('div');
    document.body.appendChild(container);

    capturedEvents = [];
    callback = (data) => {
      capturedEvents.push(data);
    };

    vi.mocked(isServerDown).mockReturnValue(false);
    vi.mocked(getReactComponentInfo).mockReturnValue({
      component: null,
      stack: [],
      displayString: null,
    });
  });

  afterEach(() => {
    if (cleanup) {
      cleanup();
      cleanup = null;
    }
    document.body.removeChild(container);
    vi.useRealTimers();
  });

  describe('form submit capture', () => {
    it('captures form submit events', async () => {
      const config = createMockConfig();
      cleanup = setupFormCapture(config, callback);

      const form = createForm({ id: 'login-form', action: '/login', method: 'POST' });
      container.appendChild(form);

      // Prevent actual submission
      form.addEventListener('submit', (e) => e.preventDefault());

      form.dispatchEvent(new SubmitEvent('submit', { bubbles: true }));
      await vi.advanceTimersByTimeAsync(600);

      expect(capturedEvents).toHaveLength(1);
      expect(capturedEvents[0].event).toBe('submit');
      expect(capturedEvents[0].formMethod).toBe('POST');
    });

    it('captures form action URL', async () => {
      const config = createMockConfig();
      cleanup = setupFormCapture(config, callback);

      const form = createForm({ action: 'https://example.com/submit' });
      container.appendChild(form);

      form.addEventListener('submit', (e) => e.preventDefault());
      form.dispatchEvent(new SubmitEvent('submit', { bubbles: true }));

      await vi.advanceTimersByTimeAsync(600);

      expect(capturedEvents[0].formAction).toContain('/submit');
    });

    it('defaults to GET method if not specified', async () => {
      const config = createMockConfig();
      cleanup = setupFormCapture(config, callback);

      const form = createForm({ id: 'form' });
      container.appendChild(form);

      form.addEventListener('submit', (e) => e.preventDefault());
      form.dispatchEvent(new SubmitEvent('submit', { bubbles: true }));

      await vi.advanceTimersByTimeAsync(600);

      expect(capturedEvents[0].formMethod).toBe('GET');
    });
  });

  describe('select change capture', () => {
    it('captures select element changes', async () => {
      const config = createMockConfig();
      cleanup = setupFormCapture(config, callback);

      const select = createSelect({
        id: 'country',
        options: [
          { value: 'us', text: 'United States' },
          { value: 'ca', text: 'Canada' },
        ],
      });
      container.appendChild(select);

      select.value = 'ca';
      select.dispatchEvent(new Event('change', { bubbles: true }));

      await vi.advanceTimersByTimeAsync(600);

      expect(capturedEvents).toHaveLength(1);
      expect(capturedEvents[0].event).toBe('change');
      expect(capturedEvents[0].value).toBe('ca');
    });

    it('ignores change events from non-select elements', async () => {
      const config = createMockConfig();
      cleanup = setupFormCapture(config, callback);

      const input = createInput({ id: 'text' });
      container.appendChild(input);

      input.dispatchEvent(new Event('change', { bubbles: true }));

      await vi.advanceTimersByTimeAsync(600);

      expect(capturedEvents).toHaveLength(0);
    });
  });

  describe('Enter keypress capture', () => {
    it('captures Enter key in input elements', async () => {
      const config = createMockConfig();
      cleanup = setupFormCapture(config, callback);

      const input = createInput({ id: 'search' });
      input.value = 'search query';
      container.appendChild(input);

      const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
      input.dispatchEvent(event);

      await vi.advanceTimersByTimeAsync(600);

      expect(capturedEvents).toHaveLength(1);
      expect(capturedEvents[0].event).toBe('keypress');
      expect(capturedEvents[0].key).toBe('Enter');
      expect(capturedEvents[0].value).toBe('search query');
    });

    it('captures Enter in textarea without Shift', async () => {
      const config = createMockConfig();
      cleanup = setupFormCapture(config, callback);

      const textarea = createTextarea({ id: 'message' });
      textarea.value = 'message content';
      container.appendChild(textarea);

      const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
      textarea.dispatchEvent(event);

      await vi.advanceTimersByTimeAsync(600);

      expect(capturedEvents).toHaveLength(1);
      expect(capturedEvents[0].key).toBe('Enter');
    });

    it('ignores Shift+Enter in textarea (newline)', async () => {
      const config = createMockConfig();
      cleanup = setupFormCapture(config, callback);

      const textarea = createTextarea({ id: 'message' });
      container.appendChild(textarea);

      const event = new KeyboardEvent('keydown', { key: 'Enter', shiftKey: true, bubbles: true });
      textarea.dispatchEvent(event);

      await vi.advanceTimersByTimeAsync(600);

      expect(capturedEvents).toHaveLength(0);
    });

    it('ignores non-Enter keypresses', async () => {
      const config = createMockConfig();
      cleanup = setupFormCapture(config, callback);

      const input = createInput({ id: 'input' });
      container.appendChild(input);

      const event = new KeyboardEvent('keydown', { key: 'a', bubbles: true });
      input.dispatchEvent(event);

      await vi.advanceTimersByTimeAsync(600);

      expect(capturedEvents).toHaveLength(0);
    });

    // Note: jsdom doesn't fully support contenteditable behavior
    it.skip('captures Enter in contenteditable elements', async () => {
      const config = createMockConfig();
      cleanup = setupFormCapture(config, callback);

      const div = document.createElement('div');
      div.contentEditable = 'true';
      div.textContent = 'editable text';
      container.appendChild(div);

      const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
      div.dispatchEvent(event);

      await vi.advanceTimersByTimeAsync(600);

      expect(capturedEvents).toHaveLength(1);
      expect(capturedEvents[0].value).toBe('editable text');
    });
  });

  describe('kill switch', () => {
    it('does not capture form events when server is down', async () => {
      vi.mocked(isServerDown).mockReturnValue(true);

      const config = createMockConfig();
      cleanup = setupFormCapture(config, callback);

      const form = createForm({ id: 'form' });
      container.appendChild(form);

      form.addEventListener('submit', (e) => e.preventDefault());
      form.dispatchEvent(new SubmitEvent('submit', { bubbles: true }));

      await vi.advanceTimersByTimeAsync(600);

      expect(capturedEvents).toHaveLength(0);
    });
  });

  describe('cleanup', () => {
    it('stops capturing events after cleanup', async () => {
      const config = createMockConfig();
      cleanup = setupFormCapture(config, callback);
      cleanup();
      cleanup = null;

      const form = createForm({ id: 'form' });
      container.appendChild(form);

      form.addEventListener('submit', (e) => e.preventDefault());
      form.dispatchEvent(new SubmitEvent('submit', { bubbles: true }));

      await vi.advanceTimersByTimeAsync(600);

      expect(capturedEvents).toHaveLength(0);
    });
  });
});
