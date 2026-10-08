import { defineConfig, type UserConfig } from "vite"
import tailwindcss from "@tailwindcss/vite"

import {
  MFE_MODULES,
  SHARED_EXTERNALS,
  viteSharedExternals,
} from "../../mfe.config.mjs"
import { viteImportMap, viteImportMapFile } from "./import-map.mjs"

const mfeModules = MFE_MODULES.map(({ module }) => module)

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
    plugins: [
      tailwindcss(),
      viteSharedExternals(mfeModules),
      viteImportMap(),
      viteImportMapFile(),
    ],

    build: {
      outDir: "dist",
      emptyOutDir: true,
      rolldownOptions: {
        external: [...mfeModules, ...SHARED_EXTERNALS],
      },
      modulePreload: {
        polyfill: false,
      },
    },
  }),
)
