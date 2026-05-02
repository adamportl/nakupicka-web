import globals from "globals";

export default [
  {
    ignores: ["vendor/**", "dist/**", "node_modules/**"],
  },
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      "no-unused-vars": ["warn", { "argsIgnorePattern": "^_", "caughtErrorsIgnorePattern": "^_" }],
      "no-undef": "error",
      eqeqeq: ["error", "always"],
    },
  },
];
