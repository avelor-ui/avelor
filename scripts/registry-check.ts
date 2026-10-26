import fs from "node:fs"
import path from "node:path"
import { pathToFileURL } from "node:url"

import { registryItemSchema, registrySchema } from "@shadcn/registry/schema"

import { shapeDiff } from "./content-shape.ts"
import { dependencyProblems } from "./registry-deps.ts"
import {
  readRegistryJson,
  registryNamespace,
  registryOutDir,
  repoRoot,
  type RegistryItemSource,
} from "./shared.ts"

const problems: string[] = []
const fail = (message: string) => problems.push(message)
const exists = (relative: string) => fs.existsSync(path.join(repoRoot, relative))

const blocksDir = `registry/${registryNamespace}/blocks`
const libDir = `registry/${registryNamespace}/lib/`

const registry = readRegistryJson()
const registryParse = registrySchema.safeParse(registry)
if (!registryParse.success) {
  fail(`registry.json does not match the registry schema: ${registryParse.error.message}`)
}

if (exists("public/r")) {
  fail("public/r/ exists; the registry is served by a route from registry-out/, delete it")
}

if (!fs.existsSync(registryOutDir)) {
  fail("registry-out/ is missing; run `pnpm registry:build` first")
} else {
  const catalogPath = path.join(registryOutDir, "registry.json")
  const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"))
  const catalogParse = registrySchema.safeParse(catalog)
  if (!catalogParse.success) {
    fail(`registry-out/registry.json does not match the registry schema: ${catalogParse.error.message}`)
  }
}

const hiddenNames = new Set(
  registry.items.filter((item) => item.meta?.hidden === true).map((i) => i.name)
)
const docsMeta = JSON.parse(
  fs.readFileSync(path.join(repoRoot, "content/docs/blocks/meta.json"), "utf8")
) as { pages?: string[] }
for (const page of docsMeta.pages ?? []) {
  if (hiddenNames.has(page)) {
    fail(`content/docs/blocks/meta.json lists hidden item "${page}"`)
  }
}

const previewRegistry = fs.readFileSync(
  path.join(repoRoot, "components/preview/blocks.ts"),
  "utf8"
)

for (const item of registry.items) {
  await checkItem(item)
}

const itemNames = new Set(registry.items.map((item) => item.name))
for (const folder of fs.readdirSync(path.join(repoRoot, blocksDir))) {
  if (!itemNames.has(folder)) {
    fail(`${blocksDir}/${folder}/ has no entry in registry.json`)
  }
}

if (problems.length > 0) {
  console.error(`registry:check found ${problems.length} problem(s):`)
  for (const problem of problems) console.error(`  - ${problem}`)
  process.exit(1)
}
console.log(`registry:check passed for ${registry.items.length} item(s)`)

async function checkItem(item: RegistryItemSource) {
  const label = `item "${item.name}"`

  for (const file of item.files) {
    if (!exists(file.path)) fail(`${label}: file not found: ${file.path}`)
    if (file.type === "registry:lib" && !file.path.startsWith(libDir)) {
      fail(`${label}: registry:lib file must live under ${libDir}: ${file.path}`)
    }
    if (file.type === "registry:block") {
      const expected = `@components/blocks/${item.name}/${path.basename(file.path)}`
      if (file.target !== expected) {
        fail(`${label}: ${file.path} needs target "${expected}", has "${file.target ?? "none"}"`)
      }
    }
  }

  const sources = item.files
    .filter((file) => exists(file.path))
    .map((file) => ({
      path: file.path,
      source: fs.readFileSync(path.join(repoRoot, file.path), "utf8"),
    }))
  for (const problem of dependencyProblems({ ...item, files: sources })) {
    fail(`${label}: ${problem}`)
  }

  if (item.meta?.internal !== true && !(item.categories && item.categories.length > 0)) {
    fail(`${label}: categories is required (only meta.internal items are exempt)`)
  }

  const builtPath = path.join(registryOutDir, `${item.name}.json`)
  if (fs.existsSync(registryOutDir)) {
    if (!fs.existsSync(builtPath)) {
      fail(`${label}: registry-out/${item.name}.json is missing; run \`pnpm registry:build\``)
    } else {
      const built = registryItemSchema.safeParse(
        JSON.parse(fs.readFileSync(builtPath, "utf8"))
      )
      if (!built.success) {
        fail(`${label}: registry-out/${item.name}.json fails the registry-item schema: ${built.error.message}`)
      }
    }
  }

  if (item.type !== "registry:block") return

  const folder = `${blocksDir}/${item.name}`
  if (!exists(folder)) {
    fail(`${label}: folder ${folder}/ is missing`)
    return
  }

  const contentPath = `${folder}/content.ts`
  if (!exists(contentPath)) {
    fail(`${label}: ${contentPath} is missing`)
  } else {
    const source = fs.readFileSync(path.join(repoRoot, contentPath), "utf8")
    if (!source.includes("PLACEHOLDER")) {
      fail(`${label}: ${contentPath} has no PLACEHOLDER marker`)
    }
    const mod = (await import(pathToFileURL(path.join(repoRoot, contentPath)).href)) as {
      content?: { en?: unknown; ar?: unknown }
    }
    if (!mod.content || !("en" in mod.content) || !("ar" in mod.content)) {
      fail(`${label}: ${contentPath} must export content with en and ar`)
    } else {
      for (const diff of shapeDiff(mod.content.en, mod.content.ar)) {
        fail(`${label}: content.en vs content.ar shape differs at ${diff}`)
      }
    }
  }

  if (!exists(`content/docs/blocks/${item.name}.mdx`)) {
    fail(`${label}: docs page content/docs/blocks/${item.name}.mdx is missing`)
  }

  if (!new RegExp(`["']${item.name}["']\\s*:`).test(previewRegistry)) {
    fail(`${label}: not registered in components/preview/blocks.ts`)
  }
}
