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
}

export interface CarouselItemProps {
  index: number
  imageUrl: string
  title?: string
  subtitle?: string
  progress?: MotionValue<number>
  inputRange?: number[]
  widthRange?: string[]
  // Fix: Added missing marginRange
  marginRange?: string[]
  onClick?: () => void
}
