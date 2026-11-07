module.exports = {
  testEnvironment: "node",
  setupFiles: ["<rootDir>/test/setup-env.js"], // Cambiado 'tests' por 'test'
  testMatch: ["**/test/**/*.test.js"],          // Cambiado 'tests' por 'test'
  clearMocks: true,
};