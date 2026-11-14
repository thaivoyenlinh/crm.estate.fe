import js from "@eslint/js"
import { defineConfig } from "eslint/config"
import tseslint from "typescript-eslint"

export default defineConfig({
  extends: [js.configs.recommended, tseslint.configs.recommended],
  files: ["src/**/*.ts"],
})
