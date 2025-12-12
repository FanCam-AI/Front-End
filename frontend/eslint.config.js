// eslint.config.js
import sveltePlugin from "eslint-plugin-svelte";
import tsParser from "@typescript-eslint/parser";
import ts from "@typescript-eslint/eslint-plugin";

export default [
  {
    files: ["**/*.svelte"],
    languageOptions: {
      parser: sveltePlugin.parsers["svelte"],
      parserOptions: {
        parser: tsParser
      }
    },
    plugins: {
      svelte: sveltePlugin,
      "@typescript-eslint": ts
    },
    rules: {
      ...sveltePlugin.configs.recommended.rules
    }
  },
  {
    files: ["**/*.{ts,js}"],
    languageOptions: {
      parser: tsParser
    },
    plugins: { "@typescript-eslint": ts },
    rules: {
      ...ts.configs.recommended.rules
    }
  }
];
