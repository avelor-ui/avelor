import { spawn, type SpawnOptions } from "node:child_process"
import fs from "node:fs"
import path from "node:path"

export const repoRoot = path.resolve(import.meta.dirname, "..")
export const registryOutDir = path.join(repoRoot, "registry-out")
export const registryNamespace = "avelor"

export type RegistryFile = {
  path: string
  type: string
  target?: string
}

export type RegistryItemSource = {
  name: string
  type: string
  categories?: string[]
  meta?: Record<string, unknown>
  dependencies?: string[]
  registryDependencies?: string[]
  files: RegistryFile[]
}

export function readRegistryJson(): {
  name: string
  homepage: string
  items: RegistryItemSource[]
} {
  return JSON.parse(
    fs.readFileSync(path.join(repoRoot, "registry.json"), "utf8")
  )
}

// Runs the shadcn CLI shipped with this repo so the build and the smoke test
// use the exact version pinned in package.json.
export const shadcnBin = path.join(
  repoRoot,
  "node_modules",
  "shadcn",
  "dist",
  "index.js"
)

// Async so the smoke test's HTTP server keeps answering while a child runs.
export function run(
  command: string,
  args: string[],
  options: SpawnOptions = {}
): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit", ...options })
    child.on("error", reject)
    child.on("exit", (code, signal) => {
      if (code === 0) resolve()
      else
        reject(
          new Error(`${command} ${args.join(" ")} exited with ${code ?? signal}`)
        )
    })
  })
}
