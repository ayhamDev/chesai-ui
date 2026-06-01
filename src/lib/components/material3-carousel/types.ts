// src/lib/components/material3-carousel/types.ts
import type { MotionValue } from 'framer-motion'

export interface CarouselBreakpoint {
  slidesPerView?: number
}

export interface CarouselAutoplay {
  delay?: number
  disableOnInteraction?: boolean
}

export interface CarouselProps {
  children: React.ReactNode
  className?: string
  height?: string | number
  slidesPerView?: number
  breakpoints?: {
    [width: number]: CarouselBreakpoint
  }
  loop?: boolean
  autoplay?: boolean | CarouselAutoplay
  /** The scroll direction of the carousel. @default "horizontal" */
  orientation?: 'horizontal' | 'vertical'
}

export interface CarouselItemProps {
  index: number
  imageUrl: string
  title?: string
  subtitle?: string
  progress?: MotionValue<number>
  inputRange?: number[]
  sizeRange?: string[]
  gapRange?: string[]
  orientation?: 'horizontal' | 'vertical'
  onClick?: () => void
}
