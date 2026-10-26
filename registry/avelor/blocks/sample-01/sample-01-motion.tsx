"use client"

import { LazyMotion, domAnimation, m } from "motion/react"

import {
  instant,
  reveal,
  revealTransition,
  useReducedMotionSafe,
  viewportOnce,
} from "@/registry/avelor/lib/motion"

export function SampleOneReveal({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const reduced = useReducedMotionSafe()
  return (
    <LazyMotion features={domAnimation} strict>
      <m.div
        data-reveal=""
        className={className}
        variants={reveal}
        initial="hidden"
        animate={reduced ? "visible" : undefined}
        whileInView={reduced ? undefined : "visible"}
        viewport={viewportOnce}
        transition={reduced ? instant : revealTransition}
      >
        {children}
      </m.div>
      {/* The server renders the hidden state; without JavaScript nothing would ever reveal it. */}
      <noscript>
        <style>{`[data-reveal]{opacity:1!important;transform:none!important}`}</style>
      </noscript>
    </LazyMotion>
  )
}
