// Installs every registry item from the local build output into a fresh
// shadcn app for each requested base (Base UI and Radix) and typechecks it.
//
//   node scripts/registry-smoke.ts [--base base|radix] [--keep]

import fs from "node:fs"
import http from "node:http"
import os from "node:os"
import path from "node:path"
import { parseArgs } from "node:util"

import { readRegistryJson, registryOutDir, run, shadcnBin } from "./shared.ts"

const { values } = parseArgs({
  options: {
    base: { type: "string", multiple: true },
    keep: { type: "boolean", default: false },
  },
})
const bases = values.base?.length ? values.base : ["base", "radix"]

if (!fs.existsSync(registryOutDir)) {
  console.error("registry-out/ is missing; run `pnpm registry:build` first")
  process.exit(1)
}

const items = readRegistryJson().items.map((item) => item.name)

let userAgentLogged = false
const server = http.createServer((req, res) => {
  if (!userAgentLogged) {
    userAgentLogged = true
    console.log(`CLI User-Agent: ${req.headers["user-agent"] ?? "(none)"}`)
  }
  const match = /^\/r\/([\w.-]+\.json)$/.exec(req.url ?? "")
  const file = match ? path.join(registryOutDir, match[1]) : null
  if (!file || !fs.existsSync(file)) {
    res.writeHead(404).end()
    return
  }
  res.writeHead(200, { "content-type": "application/json" })
  fs.createReadStream(file).pipe(res)
})
await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve))
const address = server.address()
if (!address || typeof address === "string") throw new Error("no port")
const origin = `http://127.0.0.1:${address.port}`

const workDir = fs.mkdtempSync(path.join(os.tmpdir(), "avelor-smoke-"))
console.log(`Scratch apps in ${workDir}`)

let failed = false
try {
  for (const base of bases) {
    const appName = `app-${base}`
    const appDir = path.join(workDir, appName)
    console.log(`\n== ${base}: scaffold`)
    await run(
      process.execPath,
      [shadcnBin, "create", "-t", "next", "-b", base, "-p", "nova", "--rtl", "--no-monorepo", "-n", appName, "-c", workDir],
      { cwd: workDir, stdio: ["ignore", "inherit", "inherit"] }
    )

    for (const name of items) {
      console.log(`== ${base}: add ${name}`)
      await run(
        process.execPath,
        [shadcnBin, "add", `${origin}/r/${name}.json`, "-y", "-c", appDir],
        { cwd: appDir, stdio: ["ignore", "inherit", "inherit"] }
      )
    }

    console.log(`== ${base}: tsc --noEmit`)
    await run(
      process.execPath,
      [path.join(appDir, "node_modules", "typescript", "bin", "tsc"), "--noEmit", "-p", appDir],
      { cwd: appDir }
    )
    console.log(`== ${base}: ok`)
  }
} catch (error) {
  failed = true
  console.error(error instanceof Error ? error.message : error)
} finally {
  server.close()
  if (values.keep || failed) {
    console.log(`Kept ${workDir}`)
  } else {
    fs.rmSync(workDir, { recursive: true, force: true })
  }
}

process.exit(failed ? 1 : 0)
