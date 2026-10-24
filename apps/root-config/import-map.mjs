import { readFileSync } from "node:fs"
import { basename, resolve } from "node:path"

import { MFE_MODULES, SHARED_RUNTIME, mfeUrl } from "../../mfe.config.mjs"

const IMPORT_MAP_FILE = "importmap.json"
const LOCAL_VERSION = "local"

const nodeModules = resolve(import.meta.dirname, "../../node_modules")

// overrides must run before the injector — https://github.com/single-spa/import-map-injector#compatibility
const BOOT_PACKAGES = [
  { file: "dist/import-map-overrides.js", pkg: "import-map-overrides" },
  {
    file: "lib/import-map-injector.js",
    pkg: "@single-spa/import-map-injector",
  },
]

const vendorFiles = (isBuild, packages = SHARED_RUNTIME) =>
  packages.map(({ devFile, file, pkg }) => {
    const pkgDir = resolve(nodeModules, pkg)
    const { version } = JSON.parse(readFileSync(resolve(pkgDir, "package.json"), "utf8"))
    const source = resolve(pkgDir, isBuild ? file : (devFile ?? file))

    return { pkg, source, url: `/vendor/${pkg}@${version}/${basename(source)}` }
  })

const buildImportMap = (isBuild, vendor) => ({
  imports: {
    ...Object.fromEntries(
      MFE_MODULES.map(({ module, port }) => [
        module,
        isBuild ? mfeUrl(module, LOCAL_VERSION) : `http://localhost:${port}/src/main.ts`,
      ]),
    ),
    ...Object.fromEntries(vendor.map(({ pkg, url }) => [pkg, url])),
  },
})

export const viteImportMap = () => ({
  name: "vite-plugin-import-map",
  apply: "serve",

  configureServer(server) {
    const sources = new Map(vendorFiles(false).map(({ source, url }) => [url, source]))

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
          children: JSON.stringify(buildImportMap(false, vendorFiles(false)), null, 2),
          injectTo: "head-prepend",
        },
      ]
    },
  },
})

const bootstrapScript = (entry) => `
importMapInjector.initPromise
  .then(() => import("${entry}"))
  .catch((error) => console.error("Failed to load the import map:", error))
`

export const viteImportMapFile = () => ({
  name: "vite-plugin-import-map-file",
  apply: "build",

  generateBundle() {
    const vendor = vendorFiles(true)

    for (const { source, url } of [...vendor, ...vendorFiles(true, BOOT_PACKAGES)]) {
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
          new RegExp(`<script type="module"[^>]*src="${entry}"[^>]*></script>\\s*`),
          "",
        ),
        tags: [
          {
            tag: "meta",
            attrs: { name: "importmap-type", "use-injector": true },
            injectTo: "head",
          },
          {
            tag: "script",
            attrs: { src: `/${IMPORT_MAP_FILE}`, type: "injector-importmap" },
            injectTo: "head",
          },
          ...vendorFiles(true, BOOT_PACKAGES).map(({ url }) => ({
            tag: "script",
            attrs: { src: url },
            injectTo: "head",
          })),
          { tag: "script", children: bootstrapScript(entry), injectTo: "head" },
          {
            tag: "import-map-overrides-full",
            attrs: { "show-when-local-storage": "overrides-ui" },
            injectTo: "body",
          },
        ],
      }
    },
  },
})
