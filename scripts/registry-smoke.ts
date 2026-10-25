// Installs every registry item from the built site (`next start`, so the real
// /r/[file] route is exercised) into a fresh shadcn app for each requested base
// (Base UI and Radix) and typechecks it. Needs `pnpm build` first.
//
//   node scripts/registry-smoke.ts [--base base|radix] [--keep]

import { spawn, type ChildProcess } from "node:child_process"
import fs from "node:fs"
import net from "node:net"
import os from "node:os"
import path from "node:path"
import { parseArgs } from "node:util"

import { readRegistryJson, repoRoot, run, shadcnBin } from "./shared.ts"

const { values } = parseArgs({
  options: {
    base: { type: "string", multiple: true },
    keep: { type: "boolean", default: false },
  },
})
const bases = values.base?.length ? values.base : ["base", "radix"]

if (!fs.existsSync(path.join(repoRoot, ".next", "BUILD_ID"))) {
  console.error(".next/ is missing; run `pnpm build` first")
  process.exit(1)
}

const items = readRegistryJson().items.map((item) => item.name)

async function freePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const probe = net.createServer()
    probe.on("error", reject)
    probe.listen(0, "127.0.0.1", () => {
      const address = probe.address()
      if (!address || typeof address === "string") {
        reject(new Error("no port"))
        return
      }
      probe.close(() => resolve(address.port))
    })
  })
}

async function waitFor(url: string, attempts = 60): Promise<void> {
  for (let i = 0; i < attempts; i++) {
    try {
      const response = await fetch(url)
      if (response.ok) return
    } catch {
      // not listening yet
    }
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  throw new Error(`${url} did not come up`)
}

function stop(child: ChildProcess): void {
  if (child.exitCode !== null || !child.pid) return
  if (process.platform === "win32") {
    spawn("taskkill", ["/pid", String(child.pid), "/T", "/F"], { stdio: "ignore" })
  } else {
    child.kill("SIGTERM")
  }
}

const port = await freePort()
const origin = `http://127.0.0.1:${port}`
const nextBin = path.join(repoRoot, "node_modules", "next", "dist", "bin", "next")
const site = spawn(process.execPath, [nextBin, "start", "-p", String(port)], {
  cwd: repoRoot,
  stdio: ["ignore", "inherit", "inherit"],
})
await waitFor(`${origin}/r/registry.json`)

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
  stop(site)
  if (values.keep || failed) {
    console.log(`Kept ${workDir}`)
  } else {
    fs.rmSync(workDir, { recursive: true, force: true })
  }
}

process.exit(failed ? 1 : 0)
