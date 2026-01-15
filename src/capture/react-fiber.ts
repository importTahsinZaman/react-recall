// React Fiber detection utility
// Extracts React component information from DOM elements without requiring setup

// Internal component names to filter out
const REACT_INTERNALS = new Set([
  'Suspense', 'Fragment', 'StrictMode', 'Profiler', 'SuspenseList',
  'Portal', 'Offscreen', 'LegacyHidden',
]);

const NEXT_INTERNALS = new Set([
  'InnerLayoutRouter', 'RedirectErrorBoundary', 'RedirectBoundary',
  'HTTPAccessFallbackErrorBoundary', 'HTTPAccessFallbackBoundary',
  'LoadingBoundary', 'ErrorBoundary', 'InnerScrollAndFocusHandler',
  'ScrollAndFocusHandler', 'RenderFromTemplateContext', 'OuterLayoutRouter',
  'DevRootHTTPAccessFallbackBoundary', 'AppDevOverlayErrorBoundary',
  'AppDevOverlay', 'HotReload', 'Router', 'ErrorBoundaryHandler',
  'AppRouter', 'ServerRoot', 'SegmentStateProvider', 'RootErrorBoundary',
  'LoadableComponent', 'MotionDOMComponent', 'PathnameContextProviderAdapter',
]);

const LIBRARY_INTERNALS = new Set([
  'Provider', 'Consumer', 'Context', 'ForwardRef', 'Memo',
  'ThemeProvider', 'StyleSheetManager', 'QueryClientProvider',
  'ReactQueryDevtools', 'Hydrate', 'QueryErrorResetBoundary',
]);

interface FiberNode {
  type: any;
  return: FiberNode | null;
  child: FiberNode | null;
  sibling: FiberNode | null;
  stateNode: any;
  memoizedProps: any;
  _debugOwner?: FiberNode;
  _debugSource?: {
    fileName: string;
    lineNumber: number;
    columnNumber?: number;
  };
}

/**
 * Get the React Fiber node attached to a DOM element
 * Optimized: uses for...in with early exit instead of Object.keys()
 */
function getFiberFromElement(element: Element): FiberNode | null {
  // React 17+ uses __reactFiber$, React 16 uses __reactInternalInstance$
  // Using for...in avoids creating an array of all keys
  for (const key in element) {
    // Check prefix with charAt for speed before full startsWith
    if (key.charCodeAt(0) === 95 && key.charCodeAt(1) === 95) { // '__'
      if (key.startsWith('__reactFiber$') || key.startsWith('__reactInternalInstance$')) {
        return (element as any)[key] as FiberNode;
      }
    }
  }

  return null;
}

/**
 * Get the display name from a fiber's type
 */
function getComponentName(type: any): string | null {
  if (!type) return null;

  // Function component or class component
  if (typeof type === 'function') {
    return type.displayName || type.name || null;
  }

  // ForwardRef
  if (typeof type === 'object') {
    if (type.displayName) return type.displayName;
    if (type.render?.displayName) return type.render.displayName;
    if (type.render?.name) return type.render.name;
    // Memo
    if (type.type) return getComponentName(type.type);
  }

  return null;
}

/**
 * Check if a component name should be filtered out
 */
function isInternalComponent(name: string): boolean {
  if (!name) return true;
  if (name.length <= 1) return true;
  if (name.startsWith('_')) return true;
  if (name.startsWith('use')) return true; // Hooks
  if (REACT_INTERNALS.has(name)) return true;
  if (NEXT_INTERNALS.has(name)) return true;
  if (LIBRARY_INTERNALS.has(name)) return true;

  // Filter out generic names
  if (name === 'Component' || name === 'Anonymous') return true;
  if (name.endsWith('Provider') || name.endsWith('Consumer')) return true;
  if (name.endsWith('Context')) return true;

  // Filter names that look auto-generated
  if (/^[a-z]$/.test(name)) return true; // single lowercase letter
  if (/^\$/.test(name)) return true; // starts with $

  return false;
}

/**
 * Check if a fiber is a composite component (not a DOM element)
 */
function isCompositeComponent(fiber: FiberNode): boolean {
  const { type } = fiber;
  return typeof type === 'function' || (typeof type === 'object' && type !== null);
}

/**
 * Walk up the fiber tree and collect component names
 */
function getComponentStack(fiber: FiberNode, maxDepth: number = 5): string[] {
  const components: string[] = [];
  let current: FiberNode | null = fiber;

  while (current && components.length < maxDepth) {
    if (isCompositeComponent(current)) {
      const name = getComponentName(current.type);
      if (name && !isInternalComponent(name)) {
        // Avoid duplicates
        if (components.length === 0 || components[components.length - 1] !== name) {
          components.push(name);
        }
      }
    }
    current = current.return;
  }

  return components;
}

/**
 * Get the nearest meaningful component name
 */
function getNearestComponent(fiber: FiberNode): string | null {
  let current: FiberNode | null = fiber;

  while (current) {
    if (isCompositeComponent(current)) {
      const name = getComponentName(current.type);
      if (name && !isInternalComponent(name)) {
        return name;
      }
    }
    current = current.return;
  }

  return null;
}

export interface ReactComponentInfo {
  // Nearest component name (e.g., "ChatMessage")
  component: string | null;
  // Full component stack (e.g., ["ChatMessage", "MessageList", "ChatPanel"])
  stack: string[];
  // Formatted display string
  displayString: string | null;
}

/**
 * Main function: Get React component information for a DOM element
 */
export function getReactComponentInfo(element: Element, debug = false): ReactComponentInfo {
  const result: ReactComponentInfo = {
    component: null,
    stack: [],
    displayString: null,
  };

  try {
    const fiber = getFiberFromElement(element);
    if (debug) {
      console.log('[ReactRecall Debug] Element:', element.tagName, element.className);
      console.log('[ReactRecall Debug] Fiber found:', !!fiber);
    }
    if (!fiber) return result;

    // Debug: collect ALL component names before filtering
    if (debug) {
      const allNames: string[] = [];
      let curr: FiberNode | null = fiber;
      let depth = 0;
      while (curr && depth < 20) {
        if (isCompositeComponent(curr)) {
          const name = getComponentName(curr.type);
          allNames.push(name || '(anonymous)');
        }
        curr = curr.return;
        depth++;
      }
      console.log('[ReactRecall Debug] All component names (before filter):', allNames);
    }

    const stack = getComponentStack(fiber, 5);
    const nearestComponent = stack[0] || getNearestComponent(fiber);

    if (debug) {
      console.log('[ReactRecall Debug] Filtered stack:', stack);
    }

    result.component = nearestComponent;
    result.stack = stack;

    if (stack.length > 0) {
      // Format: "ChatMessage > MessageList > ChatPanel"
      result.displayString = stack.join(' > ');
    }
  } catch (err) {
    if (debug) {
      console.error('[ReactRecall Debug] Error:', err);
    }
  }

  return result;
}

/**
 * Quick check if React is present on the page
 */
export function isReactPresent(): boolean {
  if (typeof document === 'undefined') return false;

  // Check for React DevTools hook
  if ((window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__) return true;

  // Check for any element with React fiber
  const testElement = document.body?.firstElementChild;
  if (testElement) {
    const keys = Object.keys(testElement);
    for (const key of keys) {
      if (key.startsWith('__reactFiber$') || key.startsWith('__reactInternalInstance$')) {
        return true;
      }
    }
  }

  return false;
}
