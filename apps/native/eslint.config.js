import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import reactYouMightNotNeedAnEffect from "eslint-plugin-react-you-might-not-need-an-effect";
import unicorn from "eslint-plugin-unicorn";
import depend from "eslint-plugin-depend";

export default defineConfig([
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/.expo/**",
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  reactHooks.configs.flat.recommended,
  reactYouMightNotNeedAnEffect.configs.recommended,

  unicorn.configs.recommended,
  depend.configs["flat/recommended"],

  {
    files: ["**/*.{js,mjs,cjs,ts,tsx,jsx}"],

    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",

      globals: {
        ...globals.browser,
      },

      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },

    rules: {
      /*
       * Reduce noisy Unicorn rules
       */

      "unicorn/prevent-abbreviations": "off",
      "unicorn/filename-case": "off",
      "unicorn/no-array-for-each": "off",
      "unicorn/prefer-top-level-await": "off",
      "unicorn/prefer-module": "off",

      /*
       * React Compiler noisy RN rules
       */

      "react-hooks/immutability": "off",
      "react-hooks/refs": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
    },
  },
]);