module.exports = {
  root: true,
  extends: [
    "eslint:recommended",
    "prettier"
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module"
  },
  env: {
    es6: true,
    node: true,
    browser: true
  },
  globals: {
    RequestInit: "readonly",
    Response: "readonly",
    fetch: "readonly",
    NodeJS: "readonly",
    React: "readonly"
  },
  ignorePatterns: [
    "node_modules/",
    "dist/",
    ".next/",
    "*.config.js"
  ],
  rules: {
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }],
    "prefer-const": "error"
  }
};
