import { interpolate } from 'flubber'
import { type MotionValue, useTransform } from 'framer-motion'

export const useFlubber = (progress: MotionValue<number>, paths: string[]) => {
  return useTransform(
    progress,
    paths.map((_, i) => i),
    paths,
    {
      mixer: (a, b) => interpolate(a, b, { maxSegmentLength: 2 }),
    },
  )
}
