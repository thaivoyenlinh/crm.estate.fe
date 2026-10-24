import { defineConfig, type UserConfig } from "vite"

import { RUNTIME_EXTERNALS, viteSharedExternals } from "../../mfe.config.mjs"
import { viteImportMap, viteImportMapFile } from "./import-map.mjs"

export default defineConfig(
  (): UserConfig => ({
    root: import.meta.dirname,
    cacheDir: "../../node_modules/.vite/apps/root-config",
    server: {
      port: 4200,
      host: "localhost",
      strictPort: true,
    },
    preview: {
      port: 4300,
      host: "localhost",
    },
    plugins: [viteSharedExternals(), viteImportMap(), viteImportMapFile()],

    build: {
      outDir: "dist",
      emptyOutDir: true,
      rolldownOptions: {
        external: RUNTIME_EXTERNALS,
      },
      modulePreload: {
        polyfill: false,
      },
    },
  }),
)
