import { defineConfig, type UserConfig } from "vite"
import tailwindcss from "@tailwindcss/vite"
import vue from "@vitejs/plugin-vue"

import { SHARED_EXTERNALS, viteSharedExternals } from "../../scripts/vite-shared-externals.mjs"

export default defineConfig(
  (): UserConfig => ({
    root: import.meta.dirname,
    cacheDir: "../../node_modules/.vite/apps/leads",
    server: {
      port: 4202,
      host: "localhost",
      cors: true,
      origin: "http://localhost:4202",
      strictPort: true,
    },
    preview: {
      port: 4302,
      host: "localhost",
      cors: true,
    },
    resolve: {
      tsconfigPaths: true,
    },
    plugins: [tailwindcss(), vue(), viteSharedExternals()],
    build: {
      outDir: "dist",
      emptyOutDir: true,

      lib: {
        entry: "src/main.ts",
        formats: ["es"],
        fileName: () => "leads.js",
      },

      rolldownOptions: {
        external: SHARED_EXTERNALS,
      },
    },
  }),
)
