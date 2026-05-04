export default {
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  testMatch: ["**/*.test.js"],
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
  collectCoverageFrom: [
    "src/controllers/**/*.js",
    "src/routes/**/*.js",
    "src/middleware/**/*.js",
    "src/models/**/*.js",
  ],
  coveragePathIgnorePatterns: ["/node_modules/", "/tests/"],
};