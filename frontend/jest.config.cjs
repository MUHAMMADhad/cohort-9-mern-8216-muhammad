module.exports = {
  testEnvironment: "jsdom",

  setupFilesAfterEnv: ["<rootDir>/jest.setup.cjs"],

  transform: {
    "^.+\\.(js|jsx)$": "babel-jest",
  },

  moduleNameMapper: {
    "\\.(css)$": "<rootDir>/test/styleMock.js",
    "^\\.\\./config/api\\.js$": "<rootDir>/test/apiConfigMock.js",
  },

  moduleFileExtensions: ["js", "jsx"],

  testMatch: ["**/test/**/*.test.jsx"],
};
