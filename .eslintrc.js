module.exports = {
  root: true,
  extends: [
    "eslint:recommended",
    "@typescript-eslint/recommended",
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
  ignorePatterns: [
    "node_modules/",
    "dist/",
    ".next/",
    "*.config.js"
  ],
  rules: {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "prefer-const": "error"
  }
};
