import { defineConfig, type UserConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import path from "node:path"

const shellHostDevEntry = {
  name: "shell-host-dev-entry",

  configureServer(server) {
    server.middlewares.use("/shell-host.js", async (_req, res, next) => {
      try {
        const entry = path.resolve(server.config.root, "src/main.ts")

        const result = await server.transformRequest(entry)

        if (!result) {
          next()
          return
        }

        res.statusCode = 200
        res.setHeader("Content-Type", "application/javascript")
        res.end(result.code)
      } catch (error) {
        next(error)
      }
    })
  },
}

export default defineConfig(
  (): UserConfig => ({
    root: import.meta.dirname,
    cacheDir: "../../node_modules/.vite/apps/shell-host",
    server: {
      port: 4201,
      host: "localhost",
      cors: true,
      // origin: "http://localhost:4201",
      strictPort: true,
    },
    preview: {
      port: 4301,
      host: "localhost",
      cors: true,
    },
    plugins: [vue(), shellHostDevEntry],
    resolve: { tsconfigPaths: true },

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
    },
  }),
)
