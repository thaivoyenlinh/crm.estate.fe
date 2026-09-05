import { defineConfig, type UserConfig } from "vite"
import vue from "@vitejs/plugin-vue"

export default defineConfig(
  (): UserConfig => ({
    root: "apps/shell-host",
    cacheDir: "../../node_modules/.vite/apps/shell-host",
    server: {
      port: 4200,
      host: "localhost",
    },
    preview: {
      port: 4300,
      host: "localhost",
    },
    resolve: { tsconfigPaths: true },
    plugins: [vue()],

    build: {
      target: "es2022",

      outDir: "../../dist/apps/shell-host",
      emptyOutDir: true,
      rolldownOptions: {
        output: {
          format: "es",
          entryFileNames: "shell-host.js",
        },
      },
      // reportCompressedSize: true,
      // commonjsOptions: {
      //   transformMixedEsModules: true,
      // },
    },
  }),
)
