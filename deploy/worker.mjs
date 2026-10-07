import { cacheControl, contentType, resolveKey } from "./site-rules.mjs"

export default {
  async fetch(request, env) {
    const key = resolveKey(new URL(request.url).pathname)
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
