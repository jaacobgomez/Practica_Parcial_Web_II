export default {
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
  collectCoverageFrom: [
    "src/controllers/**/*.js",
    "src/routes/**/*.js",
    "src/middleware/**/*.js",
    "src/models/**/*.js",
  ],
};