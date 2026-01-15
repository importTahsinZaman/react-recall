import { generateSelector, getElementText } from "../utils/selector.js";
import type { ReactRecallConfig } from "../types.js";
import { isServerDown } from "../provider.js";
import { getReactComponentInfo } from "./react-fiber.js";

type EventCallback = (data: {
  event: "click" | "input" | "navigation" | "submit" | "change" | "keypress";
  selector?: string;
  text?: string;
  value?: string;
  url?: string;
  component?: string;
  // Form-specific fields
  checked?: boolean;
  formAction?: string;
  formMethod?: string;
  key?: string;
}) => void;

// Queue for deferred event processing
interface QueuedEvent {
  type: "click" | "input" | "submit" | "change" | "keypress";
  target: Element;
  value?: string;
  timestamp: number;
  config: Required<ReactRecallConfig>;
  // Form-specific fields
  checked?: boolean;
  formAction?: string;
  formMethod?: string;
  key?: string;
}

const eventQueue: QueuedEvent[] = [];
let eventFlushScheduled = false;
let eventCallback: EventCallback | null = null;
let eventConfig: Required<ReactRecallConfig> | null = null;

function scheduleEventFlush() {
  if (eventFlushScheduled || eventQueue.length === 0) return;
  eventFlushScheduled = true;

  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(flushEventQueue, { timeout: 500 });
  } else {
    setTimeout(flushEventQueue, 0);
  }
}

function flushEventQueue() {
  eventFlushScheduled = false;
  if (!eventCallback || !eventConfig) return;

  const batch = eventQueue.splice(0, 10);

  for (const item of batch) {
    try {
      // Check exclusion (deferred)
      if (isExcluded(item.target, item.config.excludeSelectors)) continue;

      // Generate selector (deferred - this is expensive)
      const selector = generateSelector(item.target);

      const componentInfo = getReactComponentInfo(item.target);
      const component = componentInfo.displayString || undefined;

      if (item.type === "click") {
        const text = getElementText(item.target);
        // Include checked state for checkbox/radio
        if (item.checked !== undefined) {
          eventCallback({ event: "click", selector, text, component, checked: item.checked });
        } else {
          eventCallback({ event: "click", selector, text, component });
        }
      } else if (item.type === "input") {
        eventCallback({ event: "input", selector, value: item.value, component });
      } else if (item.type === "submit") {
        eventCallback({
          event: "submit",
          selector,
          component,
          formAction: item.formAction,
          formMethod: item.formMethod
        });
      } else if (item.type === "change") {
        const text = getElementText(item.target);
        eventCallback({ event: "change", selector, text, value: item.value, component });
      } else if (item.type === "keypress") {
        eventCallback({ event: "keypress", selector, component, key: item.key, value: item.value });
      }
    } catch {
      // Ignore errors
    }
  }

  if (eventQueue.length > 0) {
    scheduleEventFlush();
  }
}

export function setupClickCapture(
  config: Required<ReactRecallConfig>,
  callback: EventCallback
): () => void {
  eventCallback = callback;
  eventConfig = config;

  let lastClickTime = 0;
  const minClickInterval = 100;

  const handler = (event: MouseEvent) => {
    // Kill switch - if server is down, do nothing
    if (isServerDown()) return;

    // Minimal sync work: just capture timestamp and target reference
    const now = Date.now();
    if (now - lastClickTime < minClickInterval) return;
    lastClickTime = now;

    const target = event.target as Element;
    if (!target) return;

    // Check if this is a checkbox or radio button - capture checked state
    let checked: boolean | undefined;
    if (target instanceof HTMLInputElement) {
      const inputType = target.type.toLowerCase();
      if (inputType === 'checkbox' || inputType === 'radio') {
        checked = target.checked;
      }
    }

    // Queue for deferred processing - zero blocking
    eventQueue.push({
      type: "click",
      target,
      timestamp: now,
      config,
      checked,
    });
    scheduleEventFlush();
  };

  document.addEventListener("click", handler, true);

  return () => {
    document.removeEventListener("click", handler, true);
  };
}

export function setupInputCapture(
  config: Required<ReactRecallConfig>,
  callback: EventCallback
): () => void {
  eventCallback = callback;
  eventConfig = config;

  const debounceMap = new Map<Element, ReturnType<typeof setTimeout>>();
  const debounceDelay = 300;

  const handler = (event: Event) => {
    // Kill switch - if server is down, do nothing
    if (isServerDown()) return;

    const target = event.target as HTMLElement;
    if (!target) return;

    // Support INPUT, TEXTAREA, and contenteditable elements
    const isInput = target.tagName === "INPUT";
    const isTextarea = target.tagName === "TEXTAREA";
    const isContentEditable = target.isContentEditable;

    if (!isInput && !isTextarea && !isContentEditable) return;

    // Skip checkbox/radio - those are handled by click capture
    if (isInput) {
      const inputType = (target as HTMLInputElement).type.toLowerCase();
      if (inputType === 'checkbox' || inputType === 'radio') return;
    }

    const existingTimer = debounceMap.get(target);
    if (existingTimer) clearTimeout(existingTimer);

    // Capture value now (it might change)
    let value: string;
    if (isContentEditable) {
      value = target.textContent || target.innerText || "";
    } else {
      value = (target as HTMLInputElement | HTMLTextAreaElement).value;
    }

    if (!isContentEditable && shouldMaskInput(target as HTMLInputElement | HTMLTextAreaElement, config.maskInputs)) {
      value = "[hidden]";
    }

    const timer = setTimeout(() => {
      debounceMap.delete(target);

      // Queue for deferred processing
      eventQueue.push({
        type: "input",
        target,
        value,
        timestamp: Date.now(),
        config,
      });
      scheduleEventFlush();
    }, debounceDelay);

    debounceMap.set(target, timer);
  };

  document.addEventListener("input", handler, true);

  return () => {
    document.removeEventListener("input", handler, true);
    for (const timer of debounceMap.values()) {
      clearTimeout(timer);
    }
    debounceMap.clear();
  };
}

export function setupNavigationCapture(callback: EventCallback): () => void {
  let lastUrl = window.location.href;

  const emitNavigation = (url: string) => {
    // Kill switch - if server is down, do nothing
    if (isServerDown()) return;

    // Navigation events are lightweight, but still defer
    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(() => callback({ event: "navigation", url }), { timeout: 200 });
    } else {
      setTimeout(() => callback({ event: "navigation", url }), 0);
    }
  };

  const popstateHandler = () => {
    const newUrl = window.location.href;
    if (newUrl !== lastUrl) {
      lastUrl = newUrl;
      emitNavigation(newUrl);
    }
  };

  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  history.pushState = function (...args) {
    originalPushState.apply(this, args);
    setTimeout(() => {
      const newUrl = window.location.href;
      if (newUrl !== lastUrl) {
        lastUrl = newUrl;
        emitNavigation(newUrl);
      }
    }, 0);
  };

  history.replaceState = function (...args) {
    originalReplaceState.apply(this, args);
    setTimeout(() => {
      const newUrl = window.location.href;
      if (newUrl !== lastUrl) {
        lastUrl = newUrl;
        emitNavigation(newUrl);
      }
    }, 0);
  };

  window.addEventListener("popstate", popstateHandler);

  return () => {
    window.removeEventListener("popstate", popstateHandler);
    history.pushState = originalPushState;
    history.replaceState = originalReplaceState;
  };
}

export function setupFormCapture(
  config: Required<ReactRecallConfig>,
  callback: EventCallback
): () => void {
  eventCallback = callback;
  eventConfig = config;

  // Form submit handler
  const submitHandler = (event: SubmitEvent) => {
    if (isServerDown()) return;

    const form = event.target as HTMLFormElement;
    if (!form) return;

    const formAction = form.action || window.location.href;
    const formMethod = (form.method || 'GET').toUpperCase();

    eventQueue.push({
      type: "submit",
      target: form,
      timestamp: Date.now(),
      config,
      formAction,
      formMethod,
    });
    scheduleEventFlush();
  };

  // Select change handler
  const changeHandler = (event: Event) => {
    if (isServerDown()) return;

    const target = event.target as HTMLSelectElement;
    if (!target || target.tagName !== "SELECT") return;

    // Get selected option text and value
    const selectedOption = target.options[target.selectedIndex];
    const value = selectedOption ? selectedOption.value : target.value;

    eventQueue.push({
      type: "change",
      target,
      value,
      timestamp: Date.now(),
      config,
    });
    scheduleEventFlush();
  };

  // Keydown handler for Enter key (captures Enter-to-submit in non-form contexts)
  const keydownHandler = (event: KeyboardEvent) => {
    if (isServerDown()) return;

    // Only capture Enter key
    if (event.key !== 'Enter') return;

    const target = event.target as HTMLElement;
    if (!target) return;

    // Only track on input elements, textareas, and contenteditable
    const isInput = target.tagName === 'INPUT';
    const isTextarea = target.tagName === 'TEXTAREA';
    const isContentEditable = target.isContentEditable;

    if (!isInput && !isTextarea && !isContentEditable) return;

    // For textarea/contenteditable, only capture if NOT holding Shift (Shift+Enter = newline)
    // For input, always capture Enter
    if ((isTextarea || isContentEditable) && event.shiftKey) return;

    // Capture current value
    let value: string | undefined;
    if (isContentEditable) {
      value = target.textContent || target.innerText || "";
    } else if (isInput || isTextarea) {
      value = (target as HTMLInputElement | HTMLTextAreaElement).value;
    }

    eventQueue.push({
      type: "keypress",
      target,
      key: "Enter",
      value,
      timestamp: Date.now(),
      config,
    });
    scheduleEventFlush();
  };

  document.addEventListener("submit", submitHandler, true);
  document.addEventListener("change", changeHandler, true);
  document.addEventListener("keydown", keydownHandler, true);

  return () => {
    document.removeEventListener("submit", submitHandler, true);
    document.removeEventListener("change", changeHandler, true);
    document.removeEventListener("keydown", keydownHandler, true);
  };
}

function isExcluded(element: Element, excludeSelectors: string[]): boolean {
  for (const selector of excludeSelectors) {
    try {
      if (element.matches(selector) || element.closest(selector)) {
        return true;
      }
    } catch {
      // Invalid selector
    }
  }
  return false;
}

function shouldMaskInput(
  element: HTMLInputElement | HTMLTextAreaElement,
  maskSelectors: string[]
): boolean {
  for (const selector of maskSelectors) {
    try {
      if (element.matches(selector)) {
        return true;
      }
    } catch {
      // Invalid selector
    }
  }
  return false;
}
