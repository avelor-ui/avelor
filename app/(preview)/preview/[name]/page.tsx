import type { Metadata } from "next"
import { headers } from "next/headers"
import { notFound } from "next/navigation"

import { previewBlocks, type PreviewBlockName } from "@/components/preview/blocks"
import { PreviewBridge } from "@/components/preview/preview-bridge"
import { readPreviewHeaders } from "@/lib/preview-params"

type Props = { params: Promise<{ name: string }> }

function isPreviewBlockName(name: string): name is PreviewBlockName {
  return Object.hasOwn(previewBlocks, name)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name } = await params
  return { title: `${name} preview`, robots: { index: false } }
}

export default async function PreviewPage({ params }: Props) {
  const { name } = await params
  if (!isPreviewBlockName(name)) {
    notFound()
  }
  const { lang, motion } = readPreviewHeaders(await headers())
  const { Component } = previewBlocks[name]

  return (
    <PreviewBridge motion={motion}>
      <main>
        <Component locale={lang} />
      </main>
    </PreviewBridge>
  )
}
