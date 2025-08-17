// client/jest.config.mjs
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
  // Путь к Next.js приложению
  dir: './',
})

// Настройки Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/src/test-utils/setupTests.ts'],
  testEnvironment: 'jest-environment-jsdom',
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/test-utils/**',
    '!src/types/**',
    '!src/lib/i18n.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}',
  ],
}

export default createJestConfig(customJestConfig)