const IMMUTABLE = "public, max-age=31536000, immutable"
const IMMUTABLE_PREFIXES = ["assets/", "mfe/", "vendor/"]
const INDEX_KEY = "index.html"
const NO_CACHE = "no-cache"
const POINTER_PREFIX = "importmap/"

export const IMPORT_MAP_KEY = "importmap.json"
export const SHARED_KEY = `${POINTER_PREFIX}shared`

export const pointerKey = (module) => `${POINTER_PREFIX}${module}`

const CONTENT_TYPES = {
  ".css": "text/css",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".json": "application/json",
}

export const contentType = (key) =>
  CONTENT_TYPES[key.slice(key.lastIndexOf("."))] ?? "application/octet-stream"

export const resolveKey = (pathname) => {
  const key = pathname.slice(1)
  return /\.\w+$/.test(key) ? key : INDEX_KEY
}

export const cacheControl = (key) =>
  IMMUTABLE_PREFIXES.some((prefix) => key.startsWith(prefix))
    ? IMMUTABLE
    : NO_CACHE
