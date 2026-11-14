import js from "@eslint/js"
import prettier from "eslint-config-prettier/flat"
import { defineConfig } from "eslint/config"
import pluginVue from "eslint-plugin-vue"
import globals from "globals"
import tseslint from "typescript-eslint"

export default defineConfig(
  {
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      pluginVue.configs["flat/recommended"],
      prettier,
    ],
    files: ["{apps,libs}/*/src/**/*.{ts,vue}"],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    files: ["**/*.vue"],
    languageOptions: {
      parserOptions: { parser: tseslint.parser },
    },
  },
)
