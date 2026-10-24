import { cpSync, existsSync, readFileSync, rmSync } from "node:fs"
import { createServer } from "node:http"
import { dirname, resolve } from "node:path"

import { MFE_MODULES, mfeDir } from "../mfe.config.mjs"
import { cacheControl, contentType, resolveKey } from "./site-rules.mjs"

const PORT = 4400

const workspaceRoot = resolve(import.meta.dirname, "..")
const siteDir = resolve(workspaceRoot, "dist/site")

const assemble = () => {
  rmSync(siteDir, { force: true, recursive: true })
  cpSync(resolve(workspaceRoot, "apps/root-config/dist"), siteDir, {
    recursive: true,
  })

  const { imports } = JSON.parse(readFileSync(resolve(siteDir, "importmap.json"), "utf8"))
  for (const mfe of MFE_MODULES) {
    cpSync(
      resolve(workspaceRoot, mfeDir(mfe), "dist"),
      resolve(siteDir, dirname(imports[mfe.module].slice(1))),
      { recursive: true },
    )
  }

  const missing = Object.values(imports).filter(
    (url) => !existsSync(resolve(siteDir, url.slice(1))),
  )
  if (missing.length) {
    throw new Error(`importmap.json trỏ tới file không có:\n${missing.join("\n")}`)
  }
}

assemble()

createServer((req, res) => {
  const key = resolveKey(new URL(req.url, "http://localhost").pathname)
  let body
  try {
    body = readFileSync(resolve(siteDir, key))
  } catch {
    res.writeHead(404).end()
    return
  }
  res.writeHead(200, {
    "Cache-Control": cacheControl(key),
    "Content-Type": contentType(key),
  })
  res.end(body)
}).listen(PORT, "localhost", () => {
  console.log(`Site ghép tại dist/site → http://localhost:${PORT}/leads`)
})
