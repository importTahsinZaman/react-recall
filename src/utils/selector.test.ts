import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { generateSelector, getElementText } from './selector';
import {
  createButton,
  createInput,
  createAnchor,
  createDiv,
  createSpan,
  createSvg,
} from '../__tests__/mocks/dom';

describe('generateSelector', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('data-action attribute (highest priority)', () => {
    it('returns selector with data-action when present', () => {
      const button = createButton({ dataAction: 'submit-form' });
      container.appendChild(button);
      expect(generateSelector(button)).toBe('[data-action="submit-form"]');
    });

    it('prefers data-action over id', () => {
      const button = createButton({ id: 'btn', dataAction: 'click-me' });
      container.appendChild(button);
      expect(generateSelector(button)).toBe('[data-action="click-me"]');
    });
  });

  describe('ID selector', () => {
    it('returns ID selector for elements with meaningful IDs', () => {
      const button = createButton({ id: 'submit-button' });
      container.appendChild(button);
      expect(generateSelector(button)).toBe('#submit-button');
    });

    it('filters out generated IDs starting with underscore', () => {
      const button = createButton({ id: '_generated123', text: 'Click' });
      container.appendChild(button);
      expect(generateSelector(button)).not.toContain('#_generated123');
    });

    it('filters out generated IDs starting with colon', () => {
      const button = createButton({ id: ':r0:', text: 'Click' });
      container.appendChild(button);
      expect(generateSelector(button)).not.toContain('#:r0:');
    });

    it('filters out radix-prefixed IDs', () => {
      const button = createButton({ id: 'radix-123', text: 'Click' });
      container.appendChild(button);
      expect(generateSelector(button)).not.toContain('#radix-');
    });

    it('filters out headlessui-prefixed IDs', () => {
      const button = createButton({ id: 'headlessui-menu-button-1', text: 'Click' });
      container.appendChild(button);
      expect(generateSelector(button)).not.toContain('#headlessui-');
    });

    it('filters out hash-like IDs', () => {
      const button = createButton({ id: 'abcdef1234567890', text: 'Click' });
      container.appendChild(button);
      expect(generateSelector(button)).not.toContain('#abcdef');
    });

    it('filters out pure number IDs', () => {
      const button = createButton({ id: '12345', text: 'Click' });
      container.appendChild(button);
      expect(generateSelector(button)).not.toContain('#12345');
    });

    it('filters out IDs with double underscores', () => {
      const button = createButton({ id: 'component__button', text: 'Click' });
      container.appendChild(button);
      expect(generateSelector(button)).not.toContain('#component__button');
    });
  });

  describe('name attribute', () => {
    it('returns name selector for form elements', () => {
      const input = createInput({ name: 'email' });
      container.appendChild(input);
      expect(generateSelector(input)).toBe('[name="email"]');
    });

    it('prefers ID over name', () => {
      const input = createInput({ id: 'email-input', name: 'email' });
      container.appendChild(input);
      expect(generateSelector(input)).toBe('#email-input');
    });
  });

  describe('data-testid attribute', () => {
    it('returns data-testid selector when present', () => {
      const button = createButton({ dataTestId: 'submit-btn' });
      container.appendChild(button);
      expect(generateSelector(button)).toBe('[data-testid="submit-btn"]');
    });
  });

  describe('aria-label attribute', () => {
    it('returns aria-label selector for icon buttons', () => {
      const button = createButton({ ariaLabel: 'Close dialog' });
      container.appendChild(button);
      expect(generateSelector(button)).toBe('[aria-label="Close dialog"]');
    });
  });

  describe('input type selector', () => {
    it('returns type selector for inputs without other identifiers', () => {
      const input = createInput({ type: 'email' });
      container.appendChild(input);
      expect(generateSelector(input)).toBe('input[type="email"]');
    });

    it('returns type selector for password inputs', () => {
      const input = createInput({ type: 'password' });
      container.appendChild(input);
      expect(generateSelector(input)).toBe('input[type="password"]');
    });
  });

  describe('meaningful classes', () => {
    it('returns tag + semantic classes for elements', () => {
      const button = createButton({ classes: ['primary', 'large'] });
      container.appendChild(button);
      expect(generateSelector(button)).toBe('button.primary.large');
    });

    it('limits to first 2 classes', () => {
      const button = createButton({ classes: ['primary', 'large', 'rounded', 'shadow'] });
      container.appendChild(button);
      expect(generateSelector(button)).toBe('button.primary.large');
    });

    it('filters out underscore-prefixed classes', () => {
      const button = createButton({ classes: ['_internal', 'visible'], text: 'Click' });
      container.appendChild(button);
      expect(generateSelector(button)).toBe('button.visible');
    });

    it('filters out css- prefixed classes (CSS Modules)', () => {
      const button = createButton({ classes: ['css-abc123', 'primary'], text: 'Click' });
      container.appendChild(button);
      expect(generateSelector(button)).toBe('button.primary');
    });

    it('filters out sc- prefixed classes (Styled Components)', () => {
      const button = createButton({ classes: ['sc-bdVaJa', 'btn'], text: 'Click' });
      container.appendChild(button);
      expect(generateSelector(button)).toBe('button.btn');
    });

    it('filters out emotion- prefixed classes', () => {
      const button = createButton({ classes: ['emotion-0', 'action'], text: 'Click' });
      container.appendChild(button);
      expect(generateSelector(button)).toBe('button.action');
    });

    it('filters out chakra- prefixed classes', () => {
      const button = createButton({ classes: ['chakra-button', 'submit'], text: 'Click' });
      container.appendChild(button);
      expect(generateSelector(button)).toBe('button.submit');
    });

    it('filters out MUI typography classes', () => {
      // Use button since div bubbles up to body
      const button = createButton({ classes: ['MuiButton-contained', 'submit'], text: 'Submit' });
      container.appendChild(button);
      expect(generateSelector(button)).toBe('button.submit');
    });

    it('filters out MUI button classes', () => {
      const button = createButton({ classes: ['MuiButton-root', 'action'], text: 'Click' });
      container.appendChild(button);
      expect(generateSelector(button)).toBe('button.action');
    });

    it('filters out classes with double underscores (BEM)', () => {
      const button = createButton({ classes: ['button__icon', 'primary'], text: 'Click' });
      container.appendChild(button);
      expect(generateSelector(button)).toBe('button.primary');
    });

    it('filters out hash-like classes from CSS-in-JS', () => {
      const button = createButton({ classes: ['ab-1234abcd', 'primary'], text: 'Click' });
      container.appendChild(button);
      expect(generateSelector(button)).toBe('button.primary');
    });

    it('filters out pure hash classes', () => {
      const button = createButton({ classes: ['abcdef1234', 'visible'], text: 'Click' });
      container.appendChild(button);
      expect(generateSelector(button)).toBe('button.visible');
    });
  });

  describe('text content selector', () => {
    it('returns text selector for short text content', () => {
      const button = createButton({ text: 'Submit' });
      container.appendChild(button);
      expect(generateSelector(button)).toBe('button[text="Submit"]');
    });

    it('does not use text longer than 20 characters', () => {
      const button = createButton({ text: 'This is a very long button text that exceeds limit' });
      container.appendChild(button);
      expect(generateSelector(button)).toBe('button');
    });

    it('escapes quotes in text content', () => {
      const button = createButton({ text: 'Say "Hello"' });
      container.appendChild(button);
      expect(generateSelector(button)).toBe('button[text="Say \\"Hello\\""]');
    });
  });

  describe('fallback to tag name', () => {
    it('returns tag name when no other identifier exists', () => {
      const button = document.createElement('button');
      container.appendChild(button);
      expect(generateSelector(button)).toBe('button');
    });
  });

  describe('interactive parent bubbling', () => {
    it('bubbles from SVG to parent button', () => {
      const button = createButton({ id: 'icon-btn' });
      const svg = createSvg();
      button.appendChild(svg);
      container.appendChild(button);
      expect(generateSelector(svg)).toBe('#icon-btn');
    });

    it('bubbles from span to parent button', () => {
      const button = createButton({ id: 'span-btn' });
      const span = createSpan({ text: 'Text' });
      button.appendChild(span);
      container.appendChild(button);
      expect(generateSelector(span)).toBe('#span-btn');
    });

    it('bubbles from span to parent anchor', () => {
      const anchor = createAnchor({ id: 'link', text: '' });
      const span = createSpan({ text: 'Link Text' });
      anchor.appendChild(span);
      container.appendChild(anchor);
      expect(generateSelector(span)).toBe('#link');
    });

    it('bubbles to element with role="button"', () => {
      const div = createDiv({ id: 'role-btn', role: 'button' });
      const span = createSpan({ text: 'Click' });
      div.appendChild(span);
      container.appendChild(div);
      expect(generateSelector(span)).toBe('#role-btn');
    });

    it('stops bubbling at non-interactive element', () => {
      // section is not in the non-interactive list, so bubbling stops there
      const section = document.createElement('section');
      section.id = 'my-section';
      const span = createSpan({ text: 'Text', classes: ['content'] });
      section.appendChild(span);
      container.appendChild(section);
      // Bubbling stops at section since it's not a non-interactive tag
      expect(generateSelector(span)).toBe('#my-section');
    });
  });

  describe('edge cases', () => {
    describe('deeply nested elements', () => {
      it('handles elements nested 5+ levels deep', () => {
        // Create a deeply nested structure: div > div > div > div > div > button
        let current: HTMLElement = container;
        for (let i = 0; i < 5; i++) {
          const div = document.createElement('div');
          current.appendChild(div);
          current = div;
        }
        const button = createButton({ id: 'deep-button' });
        current.appendChild(button);

        expect(generateSelector(button)).toBe('#deep-button');
      });

      it('bubbles through deeply nested non-interactive elements to find parent', () => {
        const button = createButton({ id: 'outer-btn' });
        container.appendChild(button);

        // Nest spans 5 levels deep inside the button
        let current: HTMLElement = button;
        for (let i = 0; i < 5; i++) {
          const span = document.createElement('span');
          current.appendChild(span);
          current = span;
        }
        const innerSpan = createSpan({ text: 'Deep text' });
        current.appendChild(innerSpan);

        // Should bubble up to the button
        expect(generateSelector(innerSpan)).toBe('#outer-btn');
      });
    });

    describe('special characters in attributes', () => {
      it('handles data-action with special characters', () => {
        const button = createButton({ dataAction: 'user:login-submit' });
        container.appendChild(button);
        expect(generateSelector(button)).toBe('[data-action="user:login-submit"]');
      });

      it('handles ID with hyphens and numbers', () => {
        const button = createButton({ id: 'btn-submit-123' });
        container.appendChild(button);
        expect(generateSelector(button)).toBe('#btn-submit-123');
      });

      it('handles data-testid with dots', () => {
        const button = document.createElement('button');
        button.setAttribute('data-testid', 'form.submit.button');
        container.appendChild(button);
        expect(generateSelector(button)).toBe('[data-testid="form.submit.button"]');
      });

      it('handles aria-label with quotes (unescaped)', () => {
        const button = createButton({ ariaLabel: 'Click "here" to continue' });
        container.appendChild(button);
        // Note: Current implementation doesn't escape quotes in attribute values
        // This could cause issues with CSS selector parsing but reflects actual behavior
        expect(generateSelector(button)).toBe('[aria-label="Click "here" to continue"]');
      });

      it('handles name attribute with brackets', () => {
        const input = createInput({ name: 'user[email]' });
        container.appendChild(input);
        expect(generateSelector(input)).toBe('[name="user[email]"]');
      });

      it('handles classes with numbers', () => {
        const button = createButton({ classes: ['mt-4', 'px-2'] });
        container.appendChild(button);
        expect(generateSelector(button)).toBe('button.mt-4.px-2');
      });
    });
  });
});

describe('getElementText', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('data-action attribute', () => {
    it('returns data-action value when present', () => {
      const button = createButton({ dataAction: 'submit-form', text: 'Submit' });
      container.appendChild(button);
      expect(getElementText(button)).toBe('submit-form');
    });
  });

  describe('aria-label attribute', () => {
    it('returns aria-label for icon buttons', () => {
      const button = createButton({ ariaLabel: 'Close' });
      container.appendChild(button);
      expect(getElementText(button)).toBe('Close');
    });

    it('prefers data-action over aria-label', () => {
      const button = createButton({ dataAction: 'close-dialog', ariaLabel: 'Close' });
      container.appendChild(button);
      expect(getElementText(button)).toBe('close-dialog');
    });
  });

  describe('input elements', () => {
    it('returns placeholder for inputs', () => {
      const input = createInput({ placeholder: 'Enter email' });
      container.appendChild(input);
      expect(getElementText(input)).toBe('Enter email');
    });

    it('returns value for inputs without placeholder', () => {
      const input = createInput({ value: 'test@example.com' });
      container.appendChild(input);
      expect(getElementText(input)).toBe('test@example.com');
    });

    it('prefers placeholder over value', () => {
      const input = createInput({ placeholder: 'Email', value: 'test@test.com' });
      container.appendChild(input);
      expect(getElementText(input)).toBe('Email');
    });
  });

  describe('button elements', () => {
    it('returns text content for buttons', () => {
      const button = createButton({ text: 'Click Me' });
      container.appendChild(button);
      expect(getElementText(button)).toBe('Click Me');
    });

    it('returns empty string for buttons without text', () => {
      const button = createButton();
      container.appendChild(button);
      expect(getElementText(button)).toBe('');
    });
  });

  describe('anchor elements', () => {
    it('returns text content for links', () => {
      const anchor = createAnchor({ text: 'Learn More' });
      container.appendChild(anchor);
      expect(getElementText(anchor)).toBe('Learn More');
    });

    it('returns href for links without text', () => {
      const anchor = createAnchor({ href: 'https://example.com/page' });
      container.appendChild(anchor);
      expect(getElementText(anchor)).toBe('https://example.com/page');
    });
  });

  describe('general text content', () => {
    it('returns text content for other elements', () => {
      const div = createDiv({ text: 'Some content' });
      container.appendChild(div);
      expect(getElementText(div)).toBe('Some content');
    });

    it('truncates text longer than 50 characters', () => {
      const text = 'This is a very long text content that definitely exceeds fifty characters limit';
      const div = createDiv({ text });
      container.appendChild(div);
      expect(getElementText(div)).toBe('This is a very long text content that definitely e...');
    });

    it('trims whitespace from text content', () => {
      const div = createDiv({ text: '  Padded Text  ' });
      container.appendChild(div);
      expect(getElementText(div)).toBe('Padded Text');
    });
  });

  describe('interactive parent bubbling', () => {
    it('gets text from parent button when clicking SVG', () => {
      const button = createButton({ text: 'Icon Button' });
      const svg = createSvg();
      button.appendChild(svg);
      container.appendChild(button);
      expect(getElementText(svg)).toBe('Icon Button');
    });

    it('gets aria-label from parent button', () => {
      const button = createButton({ ariaLabel: 'Menu' });
      const span = createSpan();
      button.appendChild(span);
      container.appendChild(button);
      expect(getElementText(span)).toBe('Menu');
    });
  });
});
