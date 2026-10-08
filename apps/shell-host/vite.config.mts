import { defineConfig } from "vite"

import { mfeViteConfig } from "../../mfe.config.mjs"

export default defineConfig(mfeViteConfig(import.meta.dirname))
