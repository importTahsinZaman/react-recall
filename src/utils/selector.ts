// Find the nearest interactive parent element (button, a, input, etc.)
function findInteractiveParent(element: Element): Element {
  const nonInteractiveTags = ['svg', 'path', 'circle', 'rect', 'line', 'polyline', 'polygon', 'g', 'span', 'div', 'img'];
  const interactiveTags = ['button', 'a', 'input', 'select', 'textarea'];

  let current: Element | null = element;

  while (current) {
    const tag = current.tagName.toLowerCase();

    // If we found an interactive element, return it
    if (interactiveTags.includes(tag)) {
      return current;
    }

    // If the current element has role="button" or is clickable, return it
    if (current.getAttribute('role') === 'button') {
      return current;
    }

    // If current element is not a non-interactive child element, stop bubbling
    if (!nonInteractiveTags.includes(tag)) {
      return current;
    }

    current = current.parentElement;
  }

  return element;
}

// Generate a readable CSS selector for an element
export function generateSelector(element: Element): string {
  // Bubble up to interactive parent for better selectors
  element = findInteractiveParent(element);

  // 1. data-action attribute (most descriptive for UI actions)
  const dataAction = element.getAttribute('data-action');
  if (dataAction) {
    return `[data-action="${dataAction}"]`;
  }

  // 2. ID
  if (element.id && !isGeneratedId(element.id)) {
    return `#${element.id}`;
  }

  // 3. Name attribute
  const name = element.getAttribute('name');
  if (name) {
    return `[name="${name}"]`;
  }

  // 4. Data-testid
  const testId = element.getAttribute('data-testid');
  if (testId) {
    return `[data-testid="${testId}"]`;
  }

  // 5. aria-label (useful for icon buttons)
  const ariaLabel = element.getAttribute('aria-label');
  if (ariaLabel) {
    return `[aria-label="${ariaLabel}"]`;
  }

  // 6. Type attribute for inputs
  if (element.tagName.toLowerCase() === 'input') {
    const type = element.getAttribute('type');
    if (type) {
      return `input[type="${type}"]`;
    }
  }

  // 7. Tag + meaningful classes
  const tag = element.tagName.toLowerCase();
  const meaningfulClasses = getMeaningfulClasses(element);

  if (meaningfulClasses.length > 0) {
    return `${tag}.${meaningfulClasses.slice(0, 2).join('.')}`;
  }

  // 8. Tag + text content hint
  const text = getShortText(element);
  if (text) {
    return `${tag}[text="${text}"]`;
  }

  // 9. Fallback to tag name
  return tag;
}

function isGeneratedId(id: string): boolean {
  // Filter out auto-generated IDs
  return (
    id.startsWith('_') ||
    id.startsWith(':') ||
    id.startsWith('radix-') ||
    id.startsWith('headlessui-') ||
    /^[a-f0-9]{8,}$/i.test(id) || // Hash-like
    /^\d+$/.test(id) || // Pure numbers
    id.includes('__')
  );
}

function getMeaningfulClasses(element: Element): string[] {
  const classList = Array.from(element.classList);

  return classList.filter((cls) => {
    // Filter out generated/utility classes
    if (cls.startsWith('_')) return false;
    if (cls.startsWith('css-')) return false;
    if (cls.startsWith('sc-')) return false; // Styled components
    if (cls.startsWith('emotion-')) return false;
    if (cls.startsWith('chakra-')) return false;
    if (cls.startsWith('MuiTypography-')) return false;
    if (cls.startsWith('MuiButton-')) return false;
    if (cls.includes('__')) return false;
    if (/^[a-z]{1,3}-[a-f0-9]{4,}/i.test(cls)) return false; // Hash classes
    if (/^[a-f0-9]{6,}$/i.test(cls)) return false; // Pure hash

    // Keep semantic classes
    return true;
  });
}

function getShortText(element: Element): string | null {
  const text = element.textContent?.trim();
  if (!text) return null;

  // Only use short text (max 20 chars)
  if (text.length > 20) return null;

  // Escape quotes
  return text.replace(/"/g, '\\"');
}

// Get visible text content of an element (for logging)
export function getElementText(element: Element): string {
  // Bubble up to interactive parent for better text
  element = findInteractiveParent(element);

  // Check for data-action first (most descriptive)
  const dataAction = element.getAttribute('data-action');
  if (dataAction) {
    return dataAction;
  }

  // Check for aria-label (useful for icon buttons)
  const ariaLabel = element.getAttribute('aria-label');
  if (ariaLabel) {
    return ariaLabel;
  }

  // For buttons, inputs, use value or text
  if (element.tagName.toLowerCase() === 'input') {
    const input = element as HTMLInputElement;
    return input.placeholder || input.value || '';
  }

  if (element.tagName.toLowerCase() === 'button') {
    return element.textContent?.trim() || '';
  }

  // For links
  if (element.tagName.toLowerCase() === 'a') {
    return element.textContent?.trim() || (element as HTMLAnchorElement).href || '';
  }

  // General text
  const text = element.textContent?.trim() || '';
  return text.length > 50 ? text.slice(0, 50) + '...' : text;
}
