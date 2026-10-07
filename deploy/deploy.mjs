import { execFileSync } from "node:child_process"
import { mkdtempSync, readdirSync, readFileSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join, relative, resolve } from "node:path"

import { MFE_MODULES, SHARED_EXTERNALS, mfeUrl } from "../mfe.config.mjs"

const BUCKET = "crm-estate-fe"
const IMPORT_MAP_KEY = "importmap.json"

const args = process.argv.slice(2)
const [command, name, version] = args.filter((arg) => !arg.startsWith("--"))
const storage = args.includes("--local") ? "--local" : "--remote"
const tempDir = mkdtempSync(join(tmpdir(), "deploy-"))
const workspaceRoot = resolve(import.meta.dirname, "..")

const wrangler = (...wranglerArgs) =>
  execFileSync(
    process.execPath,
    [
      resolve(workspaceRoot, "node_modules/wrangler/bin/wrangler.js"),
      ...wranglerArgs,
      storage,
    ],
    { cwd: workspaceRoot, stdio: "inherit" },
  )

const putObject = (key, file) =>
  wrangler("r2", "object", "put", `${BUCKET}/${key}`, "--file", file)

const getObject = (key) => {
  const file = join(tempDir, key.replaceAll("/", "_"))
  wrangler("r2", "object", "get", `${BUCKET}/${key}`, "--file", file)
  return readFileSync(file, "utf8")
}

const listFiles = (dir) =>
  readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) =>
      relative(dir, join(entry.parentPath, entry.name)).replaceAll("\\", "/"),
    )

const patchImportMap = (entries, isInit = false) => {
  const importMap = isInit
    ? { imports: {} }
    : JSON.parse(getObject(IMPORT_MAP_KEY))
  Object.assign(importMap.imports, entries)

  const file = join(tempDir, IMPORT_MAP_KEY)
  writeFileSync(file, JSON.stringify(importMap, null, 2))
  putObject(IMPORT_MAP_KEY, file)
  console.log("importmap.json ←", entries)
}

const mfeModule = () => {
  const module = `@recrm/${name}`
  if (MFE_MODULES.some((mfe) => mfe.module === module)) return module
  throw new Error(`Không có MFE "${name}" trong MFE_MODULES`)
}

const deployRoot = () => {
  const dir = resolve(workspaceRoot, "apps/root-config/dist")
  const assets = listFiles(dir).filter(
    (file) => file !== IMPORT_MAP_KEY && file !== "index.html",
  )
  for (const file of [...assets, "index.html"]) putObject(file, join(dir, file))

  const { imports } = JSON.parse(
    readFileSync(join(dir, IMPORT_MAP_KEY), "utf8"),
  )
  patchImportMap(
    Object.fromEntries(SHARED_EXTERNALS.map((pkg) => [pkg, imports[pkg]])),
    args.includes("--init"),
  )
}

const deployMfe = () => {
  const module = mfeModule()
  const sha =
    version ??
    execFileSync("git", ["rev-parse", "--short=12", "HEAD"], {
      encoding: "utf8",
    }).trim()
  const dir = resolve(workspaceRoot, `apps/${name}/dist`)
  const url = mfeUrl(module, sha)

  for (const file of listFiles(dir)) {
    putObject(`${dirname(url).slice(1)}/${file}`, join(dir, file))
  }
  patchImportMap({ [module]: url })
}

const rollback = () => {
  const url = mfeUrl(mfeModule(), version)
  getObject(url.slice(1))
  patchImportMap({ [`@recrm/${name}`]: url })
}

const COMMANDS = { mfe: deployMfe, rollback, root: deployRoot }

if (!COMMANDS[command] || (command === "rollback" && !version)) {
  throw new Error(
    "Dùng: root [--init] | mfe <tên> [sha] | rollback <tên> <sha>  [--local]",
  )
}
COMMANDS[command]()
