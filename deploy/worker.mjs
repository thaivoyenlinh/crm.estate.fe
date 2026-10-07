import { cacheControl, contentType, resolveKey } from "./site-rules.mjs"

export default {
  async fetch(request, env) {
    const key = resolveKey(new URL(request.url).pathname)
    const object = await env.SITE.get(key)

    if (object === null) {
      return new Response(null, { status: 404 })
    }

    return new Response(object.body, {
      headers: {
        "Cache-Control": cacheControl(key),
        "Content-Type": contentType(key),
      },
    })
  },
}
