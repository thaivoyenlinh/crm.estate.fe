import { defineConfig, type UserConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import path from "node:path"

const leadsDevEntry = {
  name: "leads-dev-entry",

  configureServer(server) {
    server.middlewares.use("/leads.js", async (_req, res, next) => {
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
    cacheDir: "../../node_modules/.vite/apps/leads",
    server: {
      port: 4202,
      host: "localhost",
      cors: true,
      origin: "http://localhost:4202",
      strictPort: true,
    },
    preview: {
      port: 4202,
      host: "localhost",
    },
    resolve: {
      tsconfigPaths: true,
    },
    plugins: [vue(), leadsDevEntry],
    build: {
      outDir: "../../dist/apps/leads",
      emptyOutDir: true,

      lib: {
        entry: "src/main.ts",
        formats: ["es"],
        fileName: () => "leads.js",
      },
    },
  }),
)
