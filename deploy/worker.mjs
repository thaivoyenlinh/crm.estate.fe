import {
  IMPORT_MAP_KEY,
  SHARED_KEY,
  cacheControl,
  contentType,
  pointerKey,
  resolveKey,
} from "./site-rules.mjs"

// Mỗi key chỉ một người ghi (root ghi shared, mỗi MFE ghi con trỏ của nó) nên không deploy nào đè được deploy khác
const importMap = async (env) => {
  const shared = await env.SITE.get(SHARED_KEY, "json")

  if (shared === null) {
    return new Response(null, { status: 404 })
  }

  const urls = await Promise.all(
    shared.modules.map((module) => env.SITE.get(pointerKey(module))),
  )
  const pointers = shared.modules
    .map((module, index) => [module, urls[index]])
    .filter(([, url]) => url)

  return Response.json(
    { imports: { ...Object.fromEntries(pointers), ...shared.imports } },
    { headers: { "Cache-Control": cacheControl(IMPORT_MAP_KEY) } },
  )
}

export default {
  async fetch(request, env) {
    const key = resolveKey(new URL(request.url).pathname)

    if (key === IMPORT_MAP_KEY) {
      return importMap(env)
    }

    const body = await env.SITE.get(key, "stream")

    if (body === null) {
      return new Response(null, { status: 404 })
    }

    return new Response(body, {
      headers: {
        "Cache-Control": cacheControl(key),
        "Content-Type": contentType(key),
      },
    })
  },
}
