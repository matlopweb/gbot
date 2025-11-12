export default {
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  moduleFileExtensions: ['js', 'json'],
  collectCoverageFrom: ['src/**/*.js', '!src/websocket/**'],
  coverageDirectory: 'coverage'
};
