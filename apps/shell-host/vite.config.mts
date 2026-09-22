import { defineConfig, type UserConfig } from "vite"
import tailwindcss from "@tailwindcss/vite"
import vue from "@vitejs/plugin-vue"
import path from "node:path"

import {
  SHARED_EXTERNALS,
  viteSharedExternals,
} from "../../scripts/vite-shared-externals.mjs"
import { MFE_APPS } from "./src/constants/mfe"

const mfeModules = Object.values(MFE_APPS).map((app) => app.module)

export default defineConfig(
  (): UserConfig => ({
    root: import.meta.dirname,
    cacheDir: "../../node_modules/.vite/apps/shell-host",
    server: {
      port: 9001,
      host: "localhost",
      cors: true,
      origin: "http://localhost:9001",
      strictPort: true,
    },
    preview: {
      port: 9101,
      host: "localhost",
      cors: true,
    },
    plugins: [tailwindcss(), vue(), viteSharedExternals(mfeModules)],
    resolve: {
      tsconfigPaths: true,
      alias: {
        "@": path.resolve(import.meta.dirname, "src"),
      },
    },

    build: {
      outDir: "dist",
      emptyOutDir: true,

      lib: {
        entry: "src/main.ts",
        formats: ["es"],
        fileName: () => "shell-host.js",
      },

      rolldownOptions: {
        external: [...mfeModules, ...SHARED_EXTERNALS],
      },
    },
  }),
)
