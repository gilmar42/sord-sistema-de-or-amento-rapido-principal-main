require('@testing-library/jest-dom');

// Mock environment variables
process.env.VITE_API_URL = 'http://localhost:3001/api';
process.env.VITE_MERCADO_PAGO_PUBLIC_KEY = 'TEST-mock-key-123';

// Mock import.meta.env
global.importMeta = {
  env: {
    VITE_API_URL: 'http://localhost:3001/api',
    VITE_MERCADO_PAGO_PUBLIC_KEY: 'TEST-mock-key-123',
  },
};

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock fetch
global.fetch = jest.fn();
