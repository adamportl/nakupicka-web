import globals from "globals";

export default [
  {
    ignores: [".next/**", "vendor/**", "public/vendor/**", "dist/**", "node_modules/**"],
  },
  {
    files: ["**/*.js", "**/*.jsx"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      "no-unused-vars": ["warn", { "argsIgnorePattern": "^_", "caughtErrorsIgnorePattern": "^_" }],
      "no-undef": "error",
      eqeqeq: ["error", "always"],
    },
  },
  {
    files: ["app/**/*.jsx", "components/**/*.jsx"],
    rules: {
      "no-unused-vars": "off",
    },
  },
];
