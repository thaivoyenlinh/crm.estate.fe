import { MFE_MODULES, SHARED_RUNTIME } from "../../scripts/shared-runtime.mjs"

export const buildImportMap = (isBuild) => ({
  imports: {
    ...Object.fromEntries(
      MFE_MODULES.map(({ buildPath, module, port }) => [
        module,
        isBuild ? buildPath : `http://localhost:${port}/src/main.ts`,
      ]),
    ),
    ...Object.fromEntries(SHARED_RUNTIME.map(({ pkg, to }) => [pkg, `/vendor/${to}`])),
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
