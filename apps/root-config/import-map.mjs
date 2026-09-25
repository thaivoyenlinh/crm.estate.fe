import { rm } from "node:fs/promises"
import { resolve } from "node:path"

import { MFE_MODULES, SHARED_RUNTIME } from "../../scripts/shared-runtime.mjs"

export const buildImportMap = (isBuild) => ({
  imports: {
    ...Object.fromEntries(
      MFE_MODULES.map(({ buildPath, module, port }) => [
        module,
        isBuild ? buildPath : `http://localhost:${port}/src/main.ts`,
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

  transformIndexHtml: {
    order: "pre",

    handler(_html, ctx) {
      return [
        {
          tag: "script",
          attrs: { type: "importmap" },
          children: JSON.stringify(buildImportMap(!ctx.server), null, 2),
          injectTo: "head-prepend",
        },
      ]
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
