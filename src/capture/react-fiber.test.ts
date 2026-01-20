import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getReactComponentInfo, isReactPresent } from './react-fiber';
import { createButton, attachFiber, createMockFiber } from '../__tests__/mocks/dom';

describe('getReactComponentInfo', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('fiber node detection', () => {
    it('detects __reactFiber$ prefixed properties', () => {
      const button = createButton();
      container.appendChild(button);

      const fiber = createMockFiber({ componentName: 'Button' });
      (button as any).__reactFiber$abc123 = fiber;

      const info = getReactComponentInfo(button);
      expect(info.component).toBe('Button');
    });

    it('detects __reactInternalInstance$ prefixed properties (React 16)', () => {
      const button = createButton();
      container.appendChild(button);

      const fiber = createMockFiber({ componentName: 'LegacyButton' });
      (button as any).__reactInternalInstance$xyz789 = fiber;

      const info = getReactComponentInfo(button);
      expect(info.component).toBe('LegacyButton');
    });

    it('returns empty info when no fiber found', () => {
      const button = createButton();
      container.appendChild(button);

      const info = getReactComponentInfo(button);
      expect(info.component).toBeNull();
      expect(info.stack).toEqual([]);
      expect(info.displayString).toBeNull();
    });
  });

  describe('component name extraction', () => {
    it('extracts displayName from function component', () => {
      const button = createButton();
      container.appendChild(button);

      const Component = () => null;
      Component.displayName = 'MyButton';

      const fiber = {
        type: Component,
        return: null,
        child: null,
        sibling: null,
        stateNode: null,
        memoizedProps: {},
      };
      (button as any).__reactFiber$test = fiber;

      const info = getReactComponentInfo(button);
      expect(info.component).toBe('MyButton');
    });

    it('extracts name from function component without displayName', () => {
      const button = createButton();
      container.appendChild(button);

      function NamedComponent() { return null; }

      const fiber = {
        type: NamedComponent,
        return: null,
        child: null,
        sibling: null,
        stateNode: null,
        memoizedProps: {},
      };
      (button as any).__reactFiber$test = fiber;

      const info = getReactComponentInfo(button);
      expect(info.component).toBe('NamedComponent');
    });

    it('extracts displayName from ForwardRef component', () => {
      const button = createButton();
      container.appendChild(button);

      const forwardRefType = {
        render: {
          displayName: 'ForwardRefButton',
        },
      };

      const fiber = {
        type: forwardRefType,
        return: null,
        child: null,
        sibling: null,
        stateNode: null,
        memoizedProps: {},
      };
      (button as any).__reactFiber$test = fiber;

      const info = getReactComponentInfo(button);
      expect(info.component).toBe('ForwardRefButton');
    });

    it('extracts name from ForwardRef render function', () => {
      const button = createButton();
      container.appendChild(button);

      function ForwardedInput() { return null; }
      const forwardRefType = {
        render: ForwardedInput,
      };

      const fiber = {
        type: forwardRefType,
        return: null,
        child: null,
        sibling: null,
        stateNode: null,
        memoizedProps: {},
      };
      (button as any).__reactFiber$test = fiber;

      const info = getReactComponentInfo(button);
      expect(info.component).toBe('ForwardedInput');
    });

    it('extracts displayName from Memo component', () => {
      const button = createButton();
      container.appendChild(button);

      function MemoizedList() { return null; }
      MemoizedList.displayName = 'MemoizedList';

      const memoType = {
        type: MemoizedList,
      };

      const fiber = {
        type: memoType,
        return: null,
        child: null,
        sibling: null,
        stateNode: null,
        memoizedProps: {},
      };
      (button as any).__reactFiber$test = fiber;

      const info = getReactComponentInfo(button);
      expect(info.component).toBe('MemoizedList');
    });
  });

  describe('internal component filtering', () => {
    const internalComponents = [
      'Suspense',
      'Fragment',
      'StrictMode',
      'Profiler',
      'Provider',
      'Consumer',
      'Context',
    ];

    internalComponents.forEach(name => {
      it(`filters out ${name}`, () => {
        const button = createButton();
        container.appendChild(button);

        const Component = () => null;
        Component.displayName = name;

        const parentComponent = () => null;
        parentComponent.displayName = 'UserComponent';

        const fiber = {
          type: Component,
          return: {
            type: parentComponent,
            return: null,
            child: null,
            sibling: null,
            stateNode: null,
            memoizedProps: {},
          },
          child: null,
          sibling: null,
          stateNode: null,
          memoizedProps: {},
        };
        (button as any).__reactFiber$test = fiber;

        const info = getReactComponentInfo(button);
        expect(info.component).toBe('UserComponent');
      });
    });

    it('filters out Next.js internal components', () => {
      const nextInternals = [
        'InnerLayoutRouter',
        'RedirectErrorBoundary',
        'LoadingBoundary',
        'ErrorBoundary',
        'OuterLayoutRouter',
        'AppRouter',
      ];

      nextInternals.forEach(name => {
        const button = createButton();
        container.appendChild(button);

        const Component = () => null;
        Component.displayName = name;

        const userComponent = () => null;
        userComponent.displayName = 'MyPage';

        const fiber = {
          type: Component,
          return: {
            type: userComponent,
            return: null,
            child: null,
            sibling: null,
            stateNode: null,
            memoizedProps: {},
          },
          child: null,
          sibling: null,
          stateNode: null,
          memoizedProps: {},
        };
        (button as any).__reactFiber$test = fiber;

        const info = getReactComponentInfo(button);
        expect(info.component).toBe('MyPage');

        // Clean up for next iteration
        delete (button as any).__reactFiber$test;
        container.removeChild(button);
        container.appendChild(createButton());
      });
    });

    it('filters out components ending with Provider', () => {
      const button = createButton();
      container.appendChild(button);

      const Provider = () => null;
      Provider.displayName = 'ThemeProvider';

      const userComponent = () => null;
      userComponent.displayName = 'App';

      const fiber = {
        type: Provider,
        return: {
          type: userComponent,
          return: null,
          child: null,
          sibling: null,
          stateNode: null,
          memoizedProps: {},
        },
        child: null,
        sibling: null,
        stateNode: null,
        memoizedProps: {},
      };
      (button as any).__reactFiber$test = fiber;

      const info = getReactComponentInfo(button);
      expect(info.component).toBe('App');
    });

    it('filters out single character names', () => {
      const button = createButton();
      container.appendChild(button);

      const Component = () => null;
      Component.displayName = 'a';

      const userComponent = () => null;
      userComponent.displayName = 'RealComponent';

      const fiber = {
        type: Component,
        return: {
          type: userComponent,
          return: null,
          child: null,
          sibling: null,
          stateNode: null,
          memoizedProps: {},
        },
        child: null,
        sibling: null,
        stateNode: null,
        memoizedProps: {},
      };
      (button as any).__reactFiber$test = fiber;

      const info = getReactComponentInfo(button);
      expect(info.component).toBe('RealComponent');
    });

    it('filters out underscore-prefixed names', () => {
      const button = createButton();
      container.appendChild(button);

      const Component = () => null;
      Component.displayName = '_InternalComponent';

      const userComponent = () => null;
      userComponent.displayName = 'PublicComponent';

      const fiber = {
        type: Component,
        return: {
          type: userComponent,
          return: null,
          child: null,
          sibling: null,
          stateNode: null,
          memoizedProps: {},
        },
        child: null,
        sibling: null,
        stateNode: null,
        memoizedProps: {},
      };
      (button as any).__reactFiber$test = fiber;

      const info = getReactComponentInfo(button);
      expect(info.component).toBe('PublicComponent');
    });

    it('filters out hook names (use* prefix)', () => {
      const button = createButton();
      container.appendChild(button);

      const Component = () => null;
      Component.displayName = 'useCustomHook';

      const userComponent = () => null;
      userComponent.displayName = 'ComponentUsingHook';

      const fiber = {
        type: Component,
        return: {
          type: userComponent,
          return: null,
          child: null,
          sibling: null,
          stateNode: null,
          memoizedProps: {},
        },
        child: null,
        sibling: null,
        stateNode: null,
        memoizedProps: {},
      };
      (button as any).__reactFiber$test = fiber;

      const info = getReactComponentInfo(button);
      expect(info.component).toBe('ComponentUsingHook');
    });
  });

  describe('component stack', () => {
    it('builds component stack from fiber tree', () => {
      const button = createButton();
      container.appendChild(button);

      const ButtonComponent = () => null;
      ButtonComponent.displayName = 'Button';

      const ToolbarComponent = () => null;
      ToolbarComponent.displayName = 'Toolbar';

      const HeaderComponent = () => null;
      HeaderComponent.displayName = 'Header';

      const fiber = {
        type: ButtonComponent,
        return: {
          type: ToolbarComponent,
          return: {
            type: HeaderComponent,
            return: null,
            child: null,
            sibling: null,
            stateNode: null,
            memoizedProps: {},
          },
          child: null,
          sibling: null,
          stateNode: null,
          memoizedProps: {},
        },
        child: null,
        sibling: null,
        stateNode: null,
        memoizedProps: {},
      };
      (button as any).__reactFiber$test = fiber;

      const info = getReactComponentInfo(button);
      expect(info.stack).toEqual(['Button', 'Toolbar', 'Header']);
    });

    it('limits stack depth to 5', () => {
      const button = createButton();
      container.appendChild(button);

      // Build a deep fiber chain
      const components = ['A', 'B', 'C', 'D', 'E', 'F', 'G'].map(name => {
        const Component = () => null;
        Component.displayName = name;
        return Component;
      });

      let currentFiber: any = null;
      for (let i = components.length - 1; i >= 0; i--) {
        currentFiber = {
          type: components[i],
          return: currentFiber,
          child: null,
          sibling: null,
          stateNode: null,
          memoizedProps: {},
        };
      }

      (button as any).__reactFiber$test = currentFiber;

      const info = getReactComponentInfo(button);
      expect(info.stack.length).toBeLessThanOrEqual(5);
    });

    it('deduplicates consecutive component names', () => {
      const button = createButton();
      container.appendChild(button);

      const ListItem = () => null;
      ListItem.displayName = 'ListItem';

      const fiber = {
        type: ListItem,
        return: {
          type: ListItem, // Same component (e.g., nested list items)
          return: null,
          child: null,
          sibling: null,
          stateNode: null,
          memoizedProps: {},
        },
        child: null,
        sibling: null,
        stateNode: null,
        memoizedProps: {},
      };
      (button as any).__reactFiber$test = fiber;

      const info = getReactComponentInfo(button);
      // Should only have one ListItem, not duplicates
      expect(info.stack.filter(s => s === 'ListItem').length).toBe(1);
    });
  });

  describe('display string', () => {
    it('formats stack as display string with " > " separator', () => {
      const button = createButton();
      container.appendChild(button);

      const ButtonComponent = () => null;
      ButtonComponent.displayName = 'Button';

      const FormComponent = () => null;
      FormComponent.displayName = 'Form';

      const fiber = {
        type: ButtonComponent,
        return: {
          type: FormComponent,
          return: null,
          child: null,
          sibling: null,
          stateNode: null,
          memoizedProps: {},
        },
        child: null,
        sibling: null,
        stateNode: null,
        memoizedProps: {},
      };
      (button as any).__reactFiber$test = fiber;

      const info = getReactComponentInfo(button);
      expect(info.displayString).toBe('Button > Form');
    });

    it('returns null displayString when no components found', () => {
      const button = createButton();
      container.appendChild(button);

      const info = getReactComponentInfo(button);
      expect(info.displayString).toBeNull();
    });
  });

  describe('error handling', () => {
    it('handles errors gracefully and returns empty info', () => {
      const button = createButton();
      container.appendChild(button);

      // Attach a fiber that will cause an error when accessed
      Object.defineProperty(button, '__reactFiber$broken', {
        get() {
          throw new Error('Fiber access error');
        },
        configurable: true,
      });

      const info = getReactComponentInfo(button);
      expect(info.component).toBeNull();
      expect(info.stack).toEqual([]);
    });
  });
});

describe('isReactPresent', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    // Clean up React DevTools hook if set
    delete (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;
  });

  it('returns true when React DevTools hook exists', () => {
    (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ = {};
    expect(isReactPresent()).toBe(true);
  });

  it('returns true when element has React fiber', () => {
    const button = createButton();
    document.body.insertBefore(button, document.body.firstChild);
    (button as any).__reactFiber$test = {};

    expect(isReactPresent()).toBe(true);

    document.body.removeChild(button);
  });

  it('returns false when no React indicators found', () => {
    // Ensure no React indicators exist
    delete (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;

    expect(isReactPresent()).toBe(false);
  });
});
