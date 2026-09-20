import { SHARED_EXTERNALS } from "./shared-runtime.mjs"

export { SHARED_EXTERNALS }

const VALID_ID_PREFIX = "/@id/"

export const viteSharedExternals = (extraKeys = []) => {
  const keys = [...SHARED_EXTERNALS, ...extraKeys]

  return {
    name: "vite-plugin-shared-externals",
    enforce: "pre",
    apply: "serve",

    resolveId(id) {
      if (keys.includes(id)) {
        return { id, external: true }
      }
      return null
    },

    configResolved(config) {
      const pattern = new RegExp(`${VALID_ID_PREFIX}(${keys.join("|")})`, "g")

      config.plugins.push({
        name: "vite-plugin-shared-externals-strip-id-prefix",
        transform(code) {
          if (!code.includes(VALID_ID_PREFIX)) return null
          return { code: code.replace(pattern, "$1"), map: null }
        },
      })
    },
  }
}
