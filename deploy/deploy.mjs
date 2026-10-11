import { execFileSync } from "node:child_process"
import { readdirSync, readFileSync } from "node:fs"
import { dirname, join, relative, resolve } from "node:path"

import { MFE_MODULES, SHARED_EXTERNALS, mfeUrl } from "../mfe.config.mjs"
import { IMPORT_MAP_KEY, SHARED_KEY, pointerKey } from "./site-rules.mjs"

const BINDING = "SITE"
const LOCAL_MISSING = "Value not found\n"

const args = process.argv.slice(2)
const [command, name, version] = args.filter((arg) => !arg.startsWith("--"))
const storage = args.includes("--local") ? "--local" : "--remote"
const workspaceRoot = resolve(import.meta.dirname, "..")

const wrangler = (wranglerArgs, stdout = "inherit") =>
  execFileSync(
    process.execPath,
    [
      resolve(workspaceRoot, "node_modules/wrangler/bin/wrangler.js"),
      ...wranglerArgs,
      "--binding",
      BINDING,
      storage,
    ],
    {
      cwd: workspaceRoot,
      encoding: "utf8",
      stdio: ["inherit", stdout, "inherit"],
    },
  )

const putObject = (key, file) => wrangler(["kv", "key", "put", key, "--path", file])

const putValue = (key, value) => {
  wrangler(["kv", "key", "put", key, value])
  console.log(key, "←", value)
}

// Key không có: --remote ném lỗi 404, còn --local in LOCAL_MISSING rồi exit 0
const getObject = (key) => {
  const value = wrangler(["kv", "key", "get", key], "pipe")
  if (value === LOCAL_MISSING) throw new Error(`Không có "${key}" trên KV`)
  return value
}

const listFiles = (dir) =>
  readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => relative(dir, join(entry.parentPath, entry.name)).replaceAll("\\", "/"))

const mfeModule = () => {
  const module = `@recrm/${name}`
  if (MFE_MODULES.some((mfe) => mfe.module === module)) return module
  throw new Error(`Không có MFE "${name}" trong MFE_MODULES`)
}

const deployRoot = () => {
  const dir = resolve(workspaceRoot, "apps/root-config/dist")
  const assets = listFiles(dir).filter((file) => file !== IMPORT_MAP_KEY && file !== "index.html")
  for (const file of [...assets, "index.html"]) putObject(file, join(dir, file))

  const { imports } = JSON.parse(readFileSync(join(dir, IMPORT_MAP_KEY), "utf8"))
  putValue(
    SHARED_KEY,
    JSON.stringify({
      imports: Object.fromEntries(SHARED_EXTERNALS.map((pkg) => [pkg, imports[pkg]])),
      modules: MFE_MODULES.map(({ module }) => module),
    }),
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
  putValue(pointerKey(module), url)
}

const rollback = () => {
  const module = mfeModule()
  const url = mfeUrl(module, version)
  getObject(url.slice(1))
  putValue(pointerKey(module), url)
}

const COMMANDS = { mfe: deployMfe, rollback, root: deployRoot }

if (!COMMANDS[command] || (command === "rollback" && !version)) {
  throw new Error("Dùng: root | mfe <tên> [sha] | rollback <tên> <sha>  [--local]")
}
COMMANDS[command]()
