module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/setupTests.ts'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.(js|jsx|mjs)$': 'babel-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/frontend/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^../services/api$': '<rootDir>/frontend/services/__mocks__/api.ts'
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

