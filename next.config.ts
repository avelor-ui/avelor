import type { NextConfig } from "next"
import { createMDX } from "fumadocs-mdx/next"

const nextConfig: NextConfig = {
  agentRules: false,
}

const withMDX = createMDX()

export default withMDX(nextConfig)
