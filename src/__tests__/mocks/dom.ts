/**
 * DOM element factory functions for testing
 */

export function createButton(options: {
  id?: string;
  text?: string;
  dataAction?: string;
  dataTestId?: string;
  ariaLabel?: string;
  classes?: string[];
  name?: string;
} = {}): HTMLButtonElement {
  const button = document.createElement('button');
  if (options.id) button.id = options.id;
  if (options.text) button.textContent = options.text;
  if (options.dataAction) button.setAttribute('data-action', options.dataAction);
  if (options.dataTestId) button.setAttribute('data-testid', options.dataTestId);
  if (options.ariaLabel) button.setAttribute('aria-label', options.ariaLabel);
  if (options.classes) button.className = options.classes.join(' ');
  if (options.name) button.setAttribute('name', options.name);
  return button;
}

export function createInput(options: {
  type?: string;
  id?: string;
  name?: string;
  value?: string;
  placeholder?: string;
  dataTestId?: string;
  classes?: string[];
} = {}): HTMLInputElement {
  const input = document.createElement('input');
  if (options.type) input.type = options.type;
  if (options.id) input.id = options.id;
  if (options.name) input.name = options.name;
  if (options.value) input.value = options.value;
  if (options.placeholder) input.placeholder = options.placeholder;
  if (options.dataTestId) input.setAttribute('data-testid', options.dataTestId);
  if (options.classes) input.className = options.classes.join(' ');
  return input;
}

export function createAnchor(options: {
  href?: string;
  text?: string;
  id?: string;
  dataAction?: string;
  classes?: string[];
} = {}): HTMLAnchorElement {
  const anchor = document.createElement('a');
  if (options.href) anchor.href = options.href;
  if (options.text) anchor.textContent = options.text;
  if (options.id) anchor.id = options.id;
  if (options.dataAction) anchor.setAttribute('data-action', options.dataAction);
  if (options.classes) anchor.className = options.classes.join(' ');
  return anchor;
}

export function createDiv(options: {
  id?: string;
  text?: string;
  role?: string;
  classes?: string[];
  children?: HTMLElement[];
} = {}): HTMLDivElement {
  const div = document.createElement('div');
  if (options.id) div.id = options.id;
  if (options.text) div.textContent = options.text;
  if (options.role) div.setAttribute('role', options.role);
  if (options.classes) div.className = options.classes.join(' ');
  if (options.children) {
    options.children.forEach(child => div.appendChild(child));
  }
  return div;
}

export function createSpan(options: {
  text?: string;
  classes?: string[];
} = {}): HTMLSpanElement {
  const span = document.createElement('span');
  if (options.text) span.textContent = options.text;
  if (options.classes) span.className = options.classes.join(' ');
  return span;
}

export function createSvg(): SVGSVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  return svg;
}

export function createForm(options: {
  id?: string;
  action?: string;
  method?: string;
  children?: HTMLElement[];
} = {}): HTMLFormElement {
  const form = document.createElement('form');
  if (options.id) form.id = options.id;
  if (options.action) form.action = options.action;
  if (options.method) form.method = options.method;
  if (options.children) {
    options.children.forEach(child => form.appendChild(child));
  }
  return form;
}

export function createSelect(options: {
  id?: string;
  name?: string;
  options?: { value: string; text: string }[];
} = {}): HTMLSelectElement {
  const select = document.createElement('select');
  if (options.id) select.id = options.id;
  if (options.name) select.name = options.name;
  if (options.options) {
    options.options.forEach(opt => {
      const option = document.createElement('option');
      option.value = opt.value;
      option.textContent = opt.text;
      select.appendChild(option);
    });
  }
  return select;
}

export function createTextarea(options: {
  id?: string;
  name?: string;
  value?: string;
  placeholder?: string;
} = {}): HTMLTextAreaElement {
  const textarea = document.createElement('textarea');
  if (options.id) textarea.id = options.id;
  if (options.name) textarea.name = options.name;
  if (options.value) textarea.value = options.value;
  if (options.placeholder) textarea.placeholder = options.placeholder;
  return textarea;
}

/**
 * Create a nested element structure for bubbling tests
 */
export function createNestedClickable(outerTag: string, innerTag: string): {
  outer: HTMLElement;
  inner: HTMLElement;
} {
  const outer = document.createElement(outerTag);
  const inner = document.createElement(innerTag);
  outer.appendChild(inner);
  return { outer, inner };
}

/**
 * Attach React fiber mock to an element
 */
export function attachFiber(element: Element, fiber: object): void {
  const key = `__reactFiber$test${Math.random().toString(36).slice(2)}`;
  (element as any)[key] = fiber;
}

/**
 * Create a mock React fiber node
 */
export function createMockFiber(options: {
  componentName?: string;
  parentName?: string;
  isForwardRef?: boolean;
  isMemo?: boolean;
} = {}): object {
  const type = options.componentName
    ? (options.isForwardRef
      ? { render: { displayName: options.componentName } }
      : options.isMemo
        ? { type: { displayName: options.componentName } }
        : { displayName: options.componentName })
    : 'div';

  const fiber: any = {
    type: typeof type === 'string' ? type : Object.assign(() => {}, type),
    return: null,
    child: null,
    sibling: null,
    stateNode: null,
    memoizedProps: {},
  };

  if (options.parentName) {
    fiber.return = {
      type: Object.assign(() => {}, { displayName: options.parentName }),
      return: null,
      child: fiber,
      sibling: null,
      stateNode: null,
      memoizedProps: {},
    };
  }

  return fiber;
}
