module.exports = {
  testEnvironment: 'jest-environment-jsdom',
  testMatch: [
    "**/test/**/*.js"
  ],
  moduleFileExtensions: ['js', 'json', 'jsx', 'node'],
  setupFiles: ['./jest.setup.js']
};
