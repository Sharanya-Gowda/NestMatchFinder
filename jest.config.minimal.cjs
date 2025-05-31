module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/server/**/*.test.ts'],
  moduleNameMapper: {
    '^@shared/(.*)$': '<rootDir>/shared/$1'
  },
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'server/**/*.ts',
    '!server/index.ts'
  ],
  coverageDirectory: 'coverage',
  testTimeout: 10000
};