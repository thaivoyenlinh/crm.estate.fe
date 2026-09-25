import { defineConfig, type UserConfig } from "vite"
import tailwindcss from "@tailwindcss/vite"

import { MFE_MODULES } from "../../scripts/shared-runtime.mjs"
import { viteSharedExternals } from "../../scripts/vite-shared-externals.mjs"
import { viteDropDevVendor, viteImportMap } from "./import-map.mjs"

const mfeModules = MFE_MODULES.map(({ module }) => module)

export default defineConfig(
  (): UserConfig => ({
    root: import.meta.dirname,
    cacheDir: "../../node_modules/.vite/apps/root-config",
    server: {
      port: 9000,
      host: "localhost",
      strictPort: true,
    },
    preview: {
      port: 9100,
      host: "localhost",
    },
    resolve: {
      tsconfigPaths: true,
    },
    plugins: [
      tailwindcss(),
      viteSharedExternals(mfeModules),
      viteImportMap(),
      viteDropDevVendor(),
    ],

    build: {
      outDir: "dist",
      emptyOutDir: true,
      rolldownOptions: {
        external: [...mfeModules, "single-spa"],
      },
      modulePreload: {
        polyfill: false,
      },
    },
  }),
)
