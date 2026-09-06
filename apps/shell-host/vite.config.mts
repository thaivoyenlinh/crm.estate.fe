import { defineConfig, type UserConfig } from "vite"
import vue from "@vitejs/plugin-vue"

export default defineConfig(
  (): UserConfig => ({
    root: "apps/shell-host",
    cacheDir: "../../node_modules/.vite/apps/shell-host",
    server: {
      port: 4201,
      host: "localhost",
      cors: true,
    },
    preview: {
      port: 4301,
      host: "localhost",
      cors: true,
    },
    resolve: { tsconfigPaths: true },
    plugins: [vue()],

    build: {
      target: "es2022",

      outDir: "../../dist/apps/shell-host",
      emptyOutDir: true,

      // NOTE: USE LIB OR ROLLDOWN
      lib: {
        entry: "src/main.ts",
        formats: ["es"],
        fileName: () => "shell-host.js",
      },
      // rolldownOptions: {
      //   output: {
      //     // Native ESM
      //     format: "es",
      //     entryFileNames: "shell-host.js",
      //   },
      // },
    },
  }),
)
