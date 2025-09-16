module.exports = {
  root: true,
  extends: [
    "eslint:recommended",
    "prettier"
  ],
  parser: "@typescript-eslint/parser",
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
    "no-unused-vars": "error",
    "prefer-const": "error"
  },
  overrides: [
    {
      files: ["*.ts", "*.tsx"],
      parser: "@typescript-eslint/parser",
      plugins: ["@typescript-eslint"],
      extends: [
        "eslint:recommended",
        "@typescript-eslint/recommended",
        "prettier"
      ],
      rules: {
        "@typescript-eslint/no-unused-vars": "error",
        "@typescript-eslint/no-explicit-any": "warn",
        "no-unused-vars": "off"
      }
    }
  ]
};
