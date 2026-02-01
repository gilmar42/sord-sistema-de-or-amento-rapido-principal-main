module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/setupTests.ts'],
  globals: {
    'ts-jest': {
      useESM: true,
      tsconfig: {
        module: 'esnext',
      },
    },
  },
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { useESM: true }],
    '^.+\\.(js|jsx|mjs)$': 'babel-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/frontend/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    // Map all possible import paths for api service to the mock
    // Map all possible import paths for services/api to the mock
    // Handles: @/services/api, ../services/api, ./services/api, services/api, with/without .ts extension
    // This ensures the mock is always used by the component
    '^(?:@/|../|./|/)?services/api(?:\\.ts)?$': '<rootDir>/frontend/services/__mocks__/api.ts',

    // Force all react and react-dom imports to resolve to the root node_modules
    '^react$': '<rootDir>/node_modules/react',
    '^react-dom$': '<rootDir>/node_modules/react-dom',
  },
  testMatch: [
    '<rootDir>/frontend/**/*.test.tsx',
    '<rootDir>/frontend/**/*.test.ts',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleDirectories: ['node_modules', '<rootDir>/frontend'],
  transformIgnorePatterns: [
    '/node_modules/(?!uuid)/',
  ],
  testPathIgnorePatterns: ['<rootDir>/archive/'],
  modulePathIgnorePatterns: ['<rootDir>/archive/'],
};

