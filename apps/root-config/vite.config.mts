import { defineConfig, type UserConfig } from "vite"

function viteNativeEsmMfePlugin(importKeys: string[]) {
  return {
    name: "vite-plugin-native-esm-mfe",
    enforce: "pre" as const,

    // 1. Intercept Vite's default resolve step
    resolveId(id: string) {
      if (importKeys.some((key) => id === key || id.startsWith(key))) {
        return { id, external: true }
      }
      return null
    },

    // 2. HACK INTO VITE CORE: intercept after vite:import-analysis forces in /@id/
    configResolved(config: any) {
      const VALID_ID_PREFIX = `/@id/`
      const reg = new RegExp(`${VALID_ID_PREFIX}(${importKeys.join("|")})`, "g")

      config.plugins.push({
        name: "vite-plugin-strip-id-prefix",
        transform(code: string, id: string) {
          // If Vite has injected /@id/@recrm, strip /@id/ out to restore the original ESM import string
          if (code.includes(VALID_ID_PREFIX)) {
            const updatedCode = code.replace(reg, "$1")
            return { code: updatedCode, map: null }
          }
          return null
        },
      })
    },
  }
}

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
    resolve: {
      tsconfigPaths: true,
    },
    plugins: [viteNativeEsmMfePlugin(["@recrm/shell-host", "@recrm/"])],

    optimizeDeps: {
      exclude: ["@recrm/shell-host"],
    },

    build: {
      outDir: "../../dist/apps/root-config",
      emptyOutDir: true,
      rolldownOptions: {
        external: ["@recrm/shell-host", /^@recrm\/.*/],
      },
      modulePreload: {
        polyfill: false, // Disable automatic preload since we load dynamically via the import map
      },
    },
  }),
)
