// src/lib/components/playlist-studio/use-playhead.ts
import { useMotionValue } from 'framer-motion'
import { useEffect, useRef, useCallback } from 'react'

interface UsePlayheadOptions {
  duration: number
  loop: boolean
  playing: boolean
  onComplete?: () => void
  externalPlayhead?: any // Optional Framer MotionValue<number> for editor control
}

export const usePlayhead = ({ duration, loop, playing, onComplete, externalPlayhead }: UsePlayheadOptions) => {
  const internalPlayhead = useMotionValue(0)
  const playhead = externalPlayhead ?? internalPlayhead // Use external if provided, else standalone
  
  const requestRef = useRef<number>(0)
  const lastTimeRef = useRef<number | undefined>(undefined)

  const animate = useCallback(
    (time: number) => {
      if (lastTimeRef.current !== undefined) {
        const deltaTime = time - lastTimeRef.current
        let nextTime = playhead.get() + deltaTime

        if (nextTime >= duration) {
          if (loop) {
            nextTime = nextTime % duration
          } else {
            nextTime = duration
            playhead.set(nextTime)
            onComplete?.()
            return // Halt playback loop
          }
        }
        playhead.set(nextTime)
      }
      lastTimeRef.current = time
      if (playing) {
        requestRef.current = requestAnimationFrame(animate)
      }
    },
    [duration, loop, playing, playhead, onComplete],
  )

  useEffect(() => {
    if (playing) {
      lastTimeRef.current = performance.now()
      requestRef.current = requestAnimationFrame(animate)
    } else {
      lastTimeRef.current = undefined
      if (requestRef.current) cancelAnimationFrame(requestRef.current)
    }

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current)
    }
  }, [playing, animate])

  const seek = useCallback(
    (timeMs: number) => {
      playhead.set(Math.max(0, Math.min(timeMs, duration)))
      lastTimeRef.current = performance.now()
    },
    [duration, playhead],
  )

  return { playhead, seek }
}
