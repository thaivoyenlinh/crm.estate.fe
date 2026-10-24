import { execFileSync } from "node:child_process"
import { readdirSync, readFileSync } from "node:fs"
import { dirname, join, relative, resolve } from "node:path"

import { MFE_MODULES, SHARED_EXTERNALS, mfeDir, mfeUrl } from "../mfe.config.mjs"
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

// Missing key: --remote throws a 404, while --local prints LOCAL_MISSING and exits 0
const getObject = (key) => {
  const value = wrangler(["kv", "key", "get", key], "pipe")
  if (value === LOCAL_MISSING) throw new Error(`"${key}" not found in KV`)
  return value
}

const listFiles = (dir) =>
  readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => relative(dir, join(entry.parentPath, entry.name)).replaceAll("\\", "/"))

const findMfe = () => {
  const module = `@recrm/${name}`
  const mfe = MFE_MODULES.find((entry) => entry.module === module)
  if (mfe) return mfe
  throw new Error(`Cannot find MFE "${name}" in MFE_MODULES`)
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
  const mfe = findMfe()
  const sha =
    version ??
    execFileSync("git", ["rev-parse", "--short=12", "HEAD"], {
      encoding: "utf8",
    }).trim()
  const dir = resolve(workspaceRoot, mfeDir(mfe), "dist")
  const url = mfeUrl(mfe.module, sha)

  for (const file of listFiles(dir)) {
    putObject(`${dirname(url).slice(1)}/${file}`, join(dir, file))
  }
  putValue(pointerKey(mfe.module), url)
}

const rollback = () => {
  const module = findMfe().module
  const url = mfeUrl(module, version)
  getObject(url.slice(1))
  putValue(pointerKey(module), url)
}

const COMMANDS = { mfe: deployMfe, rollback, root: deployRoot }

if (!COMMANDS[command] || (command === "rollback" && !version)) {
  throw new Error("Use: root | mfe <name> [sha] | rollback <name> <sha>  [--local]")
}
COMMANDS[command]()
