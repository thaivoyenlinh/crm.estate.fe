import { readFileSync } from "node:fs"
import { basename, resolve } from "node:path"

import { MFE_MODULES, SHARED_RUNTIME } from "../../mfe.config.mjs"

const IMPORT_MAP_FILE = "importmap.json"
const LOCAL_VERSION = "local"

const nodeModules = resolve(import.meta.dirname, "../../node_modules")

const vendorFiles = (isBuild) =>
  SHARED_RUNTIME.map(({ devFile, file, pkg }) => {
    const pkgDir = resolve(nodeModules, pkg)
    const { version } = JSON.parse(
      readFileSync(resolve(pkgDir, "package.json"), "utf8"),
    )
    const source = resolve(pkgDir, isBuild ? file : (devFile ?? file))

    return { pkg, source, url: `/vendor/${pkg}@${version}/${basename(source)}` }
  })

const mfeBuildUrl = (module) => {
  const name = module.replace("@recrm/", "")
  return `/mfe/${name}/${LOCAL_VERSION}/${name}.js`
}

const buildImportMap = (isBuild, vendor) => ({
  imports: {
    ...Object.fromEntries(
      MFE_MODULES.map(({ module, port }) => [
        module,
        isBuild ? mfeBuildUrl(module) : `http://localhost:${port}/src/main.ts`,
      ]),
    ),
    ...Object.fromEntries(vendor.map(({ pkg, url }) => [pkg, url])),
  },
})

export const viteImportMap = () => ({
  name: "vite-plugin-import-map",
  apply: "serve",

  configureServer(server) {
    const sources = new Map(
      vendorFiles(false).map(({ source, url }) => [url, source]),
    )

    server.middlewares.use((req, res, next) => {
      const source = sources.get(req.url)

      if (source) {
        res.setHeader("Content-Type", "text/javascript")
        res.end(readFileSync(source))
        return
      }

      next()
    })
  },

  transformIndexHtml: {
    order: "pre",

    handler() {
      return [
        {
          tag: "script",
          attrs: { type: "importmap" },
          children: JSON.stringify(
            buildImportMap(false, vendorFiles(false)),
            null,
            2,
          ),
          injectTo: "head-prepend",
        },
      ]
    },
  },
})

const bootstrapScript = (entry) => `
fetch("/${IMPORT_MAP_FILE}", { cache: "no-cache" })
  .then((response) => response.json())
  .then((importMap) => {
    const script = document.createElement("script")
    script.type = "importmap"
    script.textContent = JSON.stringify(importMap)
    document.head.append(script)
    return import("${entry}")
  })
  .catch((error) => console.error("Không tải được import map:", error))
`

export const viteImportMapFile = () => ({
  name: "vite-plugin-import-map-file",
  apply: "build",

  generateBundle() {
    const vendor = vendorFiles(true)

    for (const { source, url } of vendor) {
      this.emitFile({
        type: "asset",
        fileName: url.slice(1),
        source: readFileSync(source),
      })
    }

    this.emitFile({
      type: "asset",
      fileName: IMPORT_MAP_FILE,
      source: JSON.stringify(buildImportMap(true, vendor), null, 2),
    })
  },

  transformIndexHtml: {
    order: "post",

    handler(html, { chunk }) {
      const entry = `/${chunk.fileName}`

      return {
        html: html.replace(
          new RegExp(
            `<script type="module"[^>]*src="${entry}"[^>]*></script>\\s*`,
          ),
          "",
        ),
        tags: [
          { tag: "script", children: bootstrapScript(entry), injectTo: "head" },
        ],
      }
    },
  },
})
