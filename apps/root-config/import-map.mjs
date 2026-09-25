import { rm } from "node:fs/promises"
import { resolve } from "node:path"

import { MFE_MODULES, SHARED_RUNTIME } from "../../scripts/shared-runtime.mjs"

const LOCAL_VERSION = "local"

const mfeBuildUrl = (module) => {
  const name = module.replace("@recrm/", "")
  return `/mfe/${name}/${LOCAL_VERSION}/${name}.js`
}

export const buildImportMap = (isBuild) => ({
  imports: {
    ...Object.fromEntries(
      MFE_MODULES.map(({ module, port }) => [
        module,
        isBuild ? mfeBuildUrl(module) : `http://localhost:${port}/src/main.ts`,
      ]),
    ),
    ...Object.fromEntries(
      SHARED_RUNTIME.map(({ pkg, to, toProd }) => [
        pkg,
        `/vendor/${isBuild ? (toProd ?? to) : to}`,
      ]),
    ),
  },
})

export const viteImportMap = () => ({
  name: "vite-plugin-import-map",
  apply: "serve",

  transformIndexHtml: {
    order: "pre",

    handler() {
      return [
        {
          tag: "script",
          attrs: { type: "importmap" },
          children: JSON.stringify(buildImportMap(false), null, 2),
          injectTo: "head-prepend",
        },
      ]
    },
  },
})

const IMPORT_MAP_FILE = "importmap.json"

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
    this.emitFile({
      type: "asset",
      fileName: IMPORT_MAP_FILE,
      source: JSON.stringify(buildImportMap(true), null, 2),
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

const DEV_ONLY_VENDOR = SHARED_RUNTIME.filter(({ toProd }) => toProd).map(
  ({ to }) => to,
)

export const viteDropDevVendor = () => ({
  name: "vite-plugin-drop-dev-vendor",
  apply: "build",

  async writeBundle({ dir }) {
    await Promise.all(
      DEV_ONLY_VENDOR.map((file) =>
        rm(resolve(dir, "vendor", file), { force: true }),
      ),
    )
  },
})
