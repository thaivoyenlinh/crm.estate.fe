const IMMUTABLE = "public, max-age=31536000, immutable"
const IMMUTABLE_PREFIXES = ["assets/", "mfe/", "vendor/"]
const INDEX_KEY = "index.html"
const NO_CACHE = "no-cache"

export const resolveKey = (pathname) => {
  const key = pathname.slice(1)
  return /\.\w+$/.test(key) ? key : INDEX_KEY
}

export const cacheControl = (key) =>
  IMMUTABLE_PREFIXES.some((prefix) => key.startsWith(prefix))
    ? IMMUTABLE
    : NO_CACHE
