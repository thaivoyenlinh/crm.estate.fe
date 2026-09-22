import { access, copyFile, mkdir, readFile, writeFile } from "node:fs/promises"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { SHARED_RUNTIME } from "./shared-runtime.mjs"

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const vendorDir = resolve(repoRoot, "apps/root-config/public/vendor")

const vendorSources = SHARED_RUNTIME.flatMap(({ from, fromProd, pkg, to, toProd }) =>
  fromProd ? [{ from, pkg, to }, { from: fromProd, pkg, to: toProd }] : [{ from, pkg, to }],
)

const readVersion = async (pkg) => {
  const manifest = resolve(repoRoot, "node_modules", pkg, "package.json")
  return JSON.parse(await readFile(manifest, "utf8")).version
}

const assertVendorFilesExist = async () => {
  const missing = []

  for (const { from, pkg } of vendorSources) {
    try {
      await access(resolve(repoRoot, "node_modules", from))
    } catch {
      missing.push(`  ${pkg}: node_modules/${from}`)
    }
  }

  if (missing.length > 0) {
    throw new Error(`vendor sources not found:\n${missing.join("\n")}`)
  }
}

const main = async () => {
  await assertVendorFilesExist()

  await mkdir(vendorDir, { recursive: true })

  const versions = {}

  for (const { pkg, from, to } of vendorSources) {
    await copyFile(resolve(repoRoot, "node_modules", from), resolve(vendorDir, to))
    versions[pkg] ??= await readVersion(pkg)
    console.log(`vendor: ${to} <- ${pkg}@${versions[pkg]}`)
  }

  await writeFile(
    resolve(vendorDir, "versions.json"),
    `${JSON.stringify(versions, null, 2)}\n`,
  )
}

main().catch((error) => {
  console.error("vendor sync failed:", error)
  process.exit(1)
})
