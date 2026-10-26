"use client"

import { LazyMotion, domAnimation, m } from "motion/react"

import {
  duration,
  instant,
  reveal,
  revealTransition,
  useReducedMotionSafe,
} from "@/registry/avelor/lib/motion"

export function HeroOneReveal({
  step,
  children,
  className,
}: {
  step: number
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
        animate="visible"
        transition={
          reduced
            ? instant
            : { ...revealTransition, delay: step * duration.staggerChild }
        }
      >
        {children}
      </m.div>
    </LazyMotion>
  )
}
