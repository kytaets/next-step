module.exports = {
  testEnvironment: 'jsdom',

  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['@swc/jest'],
  },

  moduleNameMapper: {
    '^@/app/(.*)$': '<rootDir>/src/app/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@/services/(.*)$': '<rootDir>/src/services/$1',
    '^@/store/(.*)$': '<rootDir>/src/store/$1',
  },

  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
