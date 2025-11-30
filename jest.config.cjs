const path = require('path');

const jestConfig = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/setupTests.ts'],

  testMatch: ['<rootDir>/src/**/*.test.tsx', '<rootDir>/src/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
    '^@/components/MaterialSelectionModal$': '<rootDir>/src/components/__mocks__/MaterialSelectionModal.tsx',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  moduleDirectories: ['node_modules', 'src'],
  modulePathIgnorePatterns: ['<rootDir>/sored-novo/'], // Ignora subprojeto para evitar duplicação de mocks
  transform: {
    '^.+\\.(ts|tsx)$' : 'ts-jest',
    '^.+\\.(js|jsx|mjs)$' : 'babel-jest',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!uuid)/'
  ],
};

module.exports = jestConfig;