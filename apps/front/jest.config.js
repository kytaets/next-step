const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './', // корінь Next.js застосунку
});

const customJestConfig = {
  testEnvironment: 'jsdom',

  moduleNameMapper: {
    '^framer-motion$': '<rootDir>/__mocks__/framer-motion.js',

    '^@/app/(.*)$': '<rootDir>/src/app/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@/services/(.*)$': '<rootDir>/src/services/$1',
    '^@/store/(.*)$': '<rootDir>/src/store/$1',
    '^@/types/(.*)$': '<rootDir>/src/types/$1',

    '^.+\\.module\\.(css|scss)$': 'identity-obj-proxy',
  },

  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  transformIgnorePatterns: ['node_modules/(?!(uuid|nanoid)/)'],
};

module.exports = createJestConfig(customJestConfig);
