import tailwindcss from "@tailwindcss/vite"
import vue from "@vitejs/plugin-vue"
import { basename } from "node:path"

export const MFE_MODULES = [
  { module: "@recrm/shell-host", port: 4201 },
  { module: "@recrm/leads", port: 4202 },
]

export const SHARED_RUNTIME = [
  { file: "dist/antd.esm.min.js", pkg: "ant-design-vue" },
  { file: "lib/esm/single-spa-css.min.js", pkg: "single-spa-css" },
  { file: "lib/es2015/esm/single-spa.min.js", pkg: "single-spa" },
  {
    file: "dist/vue.runtime.esm-browser.prod.js",
    pkg: "vue",
    devFile: "dist/vue.runtime.esm-browser.js",
  },
  { file: "dist/vue-router.esm-browser.prod.js", pkg: "vue-router" },
]

export const SHARED_EXTERNALS = SHARED_RUNTIME.map(({ pkg }) => pkg)

export const mfeUrl = (module, version) => {
  const name = module.replace("@recrm/", "")
  return `/mfe/${name}/${version}/${name}.js`
}

const VALID_ID_PREFIX = "/@id/"

export const viteSharedExternals = () => ({
  name: "vite-plugin-shared-externals",
  enforce: "pre",
  apply: "serve",

  resolveId(id) {
    if (SHARED_EXTERNALS.includes(id)) {
      return { id, external: true }
    }
    return null
  },

  config() {
    return { optimizeDeps: { exclude: SHARED_EXTERNALS } }
  },

  configResolved(config) {
    const pattern = new RegExp(`${VALID_ID_PREFIX}(${SHARED_EXTERNALS.join("|")})`, "g")

    config.plugins.push({
      name: "vite-plugin-shared-externals-strip-id-prefix",
      transform(code) {
        if (!code.includes(VALID_ID_PREFIX)) return null
        return { code: code.replace(pattern, "$1"), map: null }
      },
    })
  },
})

/** @returns {import("vite").UserConfig} */
export const mfeViteConfig = (appDir) => {
  const name = basename(appDir)
  const { port } = MFE_MODULES.find(({ module }) => module === `@recrm/${name}`)

  return {
    build: {
      emptyOutDir: true,
      lib: {
        cssFileName: name,
        entry: "src/main.ts",
        fileName: () => `${name}.js`,
        formats: ["es"],
      },
      outDir: "dist",
      rolldownOptions: { external: SHARED_EXTERNALS },
    },
    cacheDir: `../../node_modules/.vite/apps/${name}`,
    plugins: [tailwindcss(), vue(), viteSharedExternals()],
    preview: { cors: true, host: "localhost", port: port + 100 },
    root: appDir,
    server: {
      cors: true,
      host: "localhost",
      origin: `http://localhost:${port}`,
      port,
      strictPort: true,
    },
  }
}
