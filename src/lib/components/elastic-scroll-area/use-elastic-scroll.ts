import { animate, type MotionValue, useReducedMotion } from 'framer-motion'
import { type RefObject, useEffect, useRef, useState } from 'react'

const MAX_STRETCH = 200
const WHEEL_IDLE_MS = 120
const SPRING = { type: 'spring', stiffness: 300, damping: 30 } as const

interface Options {
  orientation: 'vertical' | 'horizontal'
  elasticity: boolean
  damping: number
  isRefreshEnabled: boolean
  onRefresh?: () => Promise<unknown>
  onRefreshError?: (error: unknown) => void
  pullThreshold: number
}

/** Native scrolling owns a gesture unless we claim a cancelable edge pull. */
export function useElasticAndRefresh(
  viewportRef: RefObject<HTMLDivElement | null>,
  offset: MotionValue<number>,
  indicator: MotionValue<number>,
  options: Options,
) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const refreshing = useRef(false)
  const mounted = useRef(false)
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])
  const callbacks = useRef(options)
  callbacks.current = options
  const reducedMotion = useReducedMotion()
  const { orientation, elasticity, damping, isRefreshEnabled, pullThreshold } = options

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return
    const vertical = orientation === 'vertical'
    const refreshEnabled = vertical && isRefreshEnabled
    const enabled = elasticity || refreshEnabled
    const resistance = Number.isFinite(damping) ? Math.max(0, damping) : 0.25
    const threshold = Number.isFinite(pullThreshold) ? Math.max(1, pullThreshold) : 80
    // Keep custom refresh thresholds reachable, while bounding huge deltas.
    const limit = refreshEnabled ? Math.max(MAX_STRETCH, threshold * 1.5) : MAX_STRETCH
    let disposed = false
    let animation: ReturnType<typeof animate> | undefined
    let indicatorAnimation: ReturnType<typeof animate> | undefined
    let wheelTimer: ReturnType<typeof setTimeout> | undefined
    let mode: 'idle' | 'pending' | 'native' | 'elastic' = 'idle'
    let touchId = -1
    let last = 0
    let origin = 0
    let crossOrigin = 0
    let rawPull = 0

    const clearWheel = () => {
      clearTimeout(wheelTimer)
      wheelTimer = undefined
    }
    const moveIndicator = (value: number) => {
      indicatorAnimation?.stop()
      if (reducedMotion) indicator.set(value)
      else indicatorAnimation = animate(indicator, value, SPRING)
    }
    const settle = () => {
      clearWheel()
      rawPull = 0
      animation?.stop()
      if (reducedMotion) offset.set(0)
      else animation = animate(offset, 0, SPRING)
    }
    const reset = () => {
      clearWheel()
      animation?.stop()
      rawPull = 0
      offset.set(0)
    }
    const unsubscribe = offset.on('change', value => {
      if (!refreshing.current) {
        indicatorAnimation?.stop()
        indicator.set(Math.max(0, value))
      }
    })
    const refresh = async () => {
      const callback = callbacks.current.onRefresh
      if (refreshing.current || !callback) {
        settle()
        return
      }
      refreshing.current = true
      setIsRefreshing(true)
      settle()
      moveIndicator(threshold)
      try {
        await callback()
      } catch (error) {
        if (!disposed) {
          if (callbacks.current.onRefreshError) callbacks.current.onRefreshError(error)
          else console.error('ElasticScrollArea refresh failed', error)
        }
      } finally {
        refreshing.current = false
        if (mounted.current) {
          setIsRefreshing(false)
          if (!disposed) moveIndicator(0)
          else indicator.set(0)
        }
      }
    }
    // Coordinates increase toward the end, including RTL scrollLeft values.
    const bounds = (element: HTMLElement) => {
      const max = Math.max(
        0,
        vertical ? element.scrollHeight - element.clientHeight : element.scrollWidth - element.clientWidth,
      )
      const rtl = !vertical && getComputedStyle(element).direction === 'rtl'
      const position = vertical ? element.scrollTop : element.scrollLeft
      return { position, min: rtl ? -max : 0, max: rtl ? 0 : max }
    }
    const atEdge = (delta: number) => {
      const { position, min, max } = bounds(viewport)
      return delta > 0 ? position <= min + 1 : position >= max - 1
    }
    const nestedCanScroll = (event: Event, delta: number) => {
      for (const target of event.composedPath()) {
        if (target === viewport) break
        if (!(target instanceof HTMLElement)) continue
        const style = getComputedStyle(target)
        if (!/(auto|scroll|overlay)/.test(vertical ? style.overflowY : style.overflowX)) continue
        const { position, min, max } = bounds(target)
        if (max > min && (delta > 0 ? position > min + 1 : position < max - 1)) return true
      }
      return false
    }
    const canPull = (delta: number) =>
      enabled && resistance > 0 && atEdge(delta) && (elasticity || (refreshEnabled && delta > 0))
    const stretch = (delta: number) => {
      animation?.stop()
      rawPull += delta
      // Saturate the raw input too, so reversing a very large swipe responds promptly.
      const cap = (limit * 4) / resistance
      rawPull = Math.max(-cap, Math.min(cap, rawPull))
      offset.set(Math.sign(rawPull) * limit * (1 - Math.exp((-Math.abs(rawPull) * resistance) / limit)))
    }
    const handleWheel = (event: WheelEvent) => {
      // Trackpad pinch is also delivered as Ctrl+wheel by browsers.
      if (event.ctrlKey || event.metaKey || event.altKey) {
        settle()
        return
      }
      if (!enabled || refreshing.current || mode !== 'idle' || event.defaultPrevented) return
      const primary = vertical ? event.deltaY : event.deltaX || (event.shiftKey ? event.deltaY : 0)
      const cross = vertical ? event.deltaX : event.shiftKey ? 0 : event.deltaY
      if (!primary || Math.abs(cross) > Math.abs(primary)) return
      const unit =
        event.deltaMode === 1
          ? Number.parseFloat(getComputedStyle(viewport).lineHeight) || 16
          : event.deltaMode === 2
            ? vertical
              ? viewport.clientHeight
              : viewport.clientWidth
            : 1
      const delta = -primary * unit
      if (
        !event.cancelable ||
        nestedCanScroll(event, delta) ||
        !canPull(delta) ||
        (rawPull !== 0 && Math.sign(delta) !== Math.sign(rawPull))
      ) {
        reset()
        return
      }
      event.preventDefault()
      stretch(delta)
      clearWheel()
      // Wheel momentum never triggers a destructive/unintentional refresh.
      wheelTimer = setTimeout(settle, WHEEL_IDLE_MS)
    }
    const cancelTouch = () => {
      mode = 'idle'
      touchId = -1
      settle()
    }
    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1 || refreshing.current || event.defaultPrevented) {
        cancelTouch()
        return
      }
      if (!enabled) return
      reset()
      const touch = event.touches[0]
      touchId = touch.identifier
      last = origin = vertical ? touch.clientY : touch.clientX
      crossOrigin = vertical ? touch.clientX : touch.clientY
      mode = 'pending'
    }
    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length !== 1 || event.defaultPrevented) {
        cancelTouch()
        return
      }
      if (mode === 'idle' || mode === 'native') return
      const touch = event.touches[0]
      if (touch.identifier !== touchId || !event.cancelable) {
        cancelTouch()
        return
      }
      const position = vertical ? touch.clientY : touch.clientX
      const cross = vertical ? touch.clientX : touch.clientY
      const delta = position - last
      last = position
      if (mode === 'pending') {
        const distance = position - origin
        if (Math.max(Math.abs(distance), Math.abs(cross - crossOrigin)) < 5) return
        if (
          Math.abs(cross - crossOrigin) > Math.abs(distance) ||
          nestedCanScroll(event, distance) ||
          !canPull(distance)
        ) {
          // Never switch from an in-flight native fling to synthetic overscroll.
          mode = 'native'
          return
        }
        mode = 'elastic'
      }
      if (mode === 'elastic') {
        event.preventDefault()
        // Once canceled, the browser may not resume panning in this touch sequence.
        // Scroll inward ourselves until release; subsequent gestures remain native.
        if (!rawPull && !canPull(delta)) {
          if (vertical) viewport.scrollTop -= delta
          else viewport.scrollLeft -= delta
          return
        }
        const previous = rawPull
        if (previous && Math.sign(previous + delta) !== Math.sign(previous)) {
          const remainder = previous + delta
          reset()
          if (vertical) viewport.scrollTop -= remainder
          else viewport.scrollLeft -= remainder
          return
        }
        stretch(delta)
      }
    }
    const handleTouchEnd = (event: TouchEvent) => {
      const shouldRefresh =
        mode === 'elastic' && event.touches.length === 0 && refreshEnabled && offset.get() >= threshold
      mode = 'idle'
      touchId = -1
      if (shouldRefresh) void refresh()
      else settle()
    }
    const handleScroll = () => {
      // Programmatic scrolls, keyboard input, and native momentum invalidate an edge pull.
      if (offset.get() && !atEdge(offset.get())) {
        if (mode === 'elastic') mode = 'native'
        reset()
      }
    }

    setIsRefreshing(refreshing.current)
    viewport.addEventListener('wheel', handleWheel, { passive: false })
    viewport.addEventListener('touchstart', handleTouchStart, { passive: true })
    viewport.addEventListener('touchmove', handleTouchMove, { passive: false })
    viewport.addEventListener('touchend', handleTouchEnd, { passive: true })
    viewport.addEventListener('touchcancel', cancelTouch, { passive: true })
    viewport.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      disposed = true
      viewport.removeEventListener('wheel', handleWheel)
      viewport.removeEventListener('touchstart', handleTouchStart)
      viewport.removeEventListener('touchmove', handleTouchMove)
      viewport.removeEventListener('touchend', handleTouchEnd)
      viewport.removeEventListener('touchcancel', cancelTouch)
      viewport.removeEventListener('scroll', handleScroll)
      clearWheel()
      animation?.stop()
      indicatorAnimation?.stop()
      unsubscribe()
      offset.set(0)
      indicator.set(0)
    }
  }, [viewportRef, offset, indicator, orientation, elasticity, damping, isRefreshEnabled, pullThreshold, reducedMotion])

  return { isRefreshing }
}
