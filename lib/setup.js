// Test setup file for jsdom environment
import { vi } from 'vitest';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(() => null),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(() => null),
};

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
});

// Mock window object
global.window = global;

// Mock document methods
global.document = {
  getElementById: vi.fn(() => ({
    classList: {
      add: vi.fn(),
      remove: vi.fn(),
      toggle: vi.fn(),
    },
    innerHTML: '',
    textContent: '',
    value: '',
    style: {},
    appendChild: vi.fn(),
    removeChild: vi.fn(),
    querySelector: vi.fn(),
    querySelectorAll: vi.fn(() => []),
  })),
  createElement: vi.fn(() => ({
    classList: {
      add: vi.fn(),
      remove: vi.fn(),
      toggle: vi.fn(),
    },
    innerHTML: '',
    textContent: '',
    value: '',
    style: {},
    appendChild: vi.fn(),
    removeChild: vi.fn(),
    querySelector: vi.fn(),
    querySelectorAll: vi.fn(() => []),
  })),
  querySelector: vi.fn(),
  querySelectorAll: vi.fn(() => []),
  createDocumentFragment: vi.fn(() => ({
    appendChild: vi.fn(),
  })),
};

// Mock fetch
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ success: true }),
    body: {
      getReader: vi.fn(() => ({
        read: vi.fn(() => Promise.resolve({ done: true, value: new Uint8Array() })),
      })),
    },
  })
);

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
};

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
  localStorageMock.getItem.mockReturnValue(null);
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
});
