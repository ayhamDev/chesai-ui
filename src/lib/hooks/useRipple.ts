'use client'

import {
  useCallback,
  useContext,
  useEffect,
  useRef,
  type RefObject,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { RippleContext } from '../context/ripple-context'
import { createLiquidRipple } from '../utils/liquid-ripple'
import { createClassicRipple } from '../utils/classic-ripple'

export interface UseRippleOptions {
  ref: RefObject<HTMLElement | null>
  color?: string
  opacity?: number
  disabled?: boolean
}

/** Pointer handler plus centered keyboard presses; all listeners and frames are
 * released when a host unmounts or becomes disabled. */
export default function useRipple(options: UseRippleOptions) {
  const rippleSettings = useContext(RippleContext)
  const latest = useRef({ ...options, rippleSettings })
  latest.current = { ...options, rippleSettings }
  const engine = useRef<ReturnType<typeof createLiquidRipple>>(null)
  const releases = useRef(new Map<number | string, () => void>())
  const start = useCallback((key: number | string, x: number, y: number) => {
    const o = latest.current
    const el = o.ref.current
    if (
      !el ||
      o.disabled ||
      el.matches(":disabled, [aria-disabled='true'], [data-disabled]") ||
      releases.current.has(key)
    )
      return
    engine.current ??=
      o.rippleSettings.style === 'classic'
        ? createClassicRipple(el, o.color ?? 'currentColor', o.opacity)
        : createLiquidRipple(el, () => latest.current.rippleSettings, o.color ?? 'currentColor', o.opacity)
    const release = engine.current?.spawn(x, y)
    if (release) releases.current.set(key, release)
  }, [])
  useEffect(() => {
    const el = options.ref.current
    if (!el || options.disabled) return
    const win = el.ownerDocument.defaultView!
    const release = (key: number | string) => {
      releases.current.get(key)?.()
      releases.current.delete(key)
    }
    const releaseAll = () => {
      releases.current.forEach(fn => fn())
      releases.current.clear()
    }
    const up = (e: PointerEvent) => release(e.pointerId)
    const down = (e: KeyboardEvent) => {
      if (e.target !== el || e.defaultPrevented || e.repeat || (e.key !== ' ' && e.key !== 'Enter')) return
      start(e.key, el.clientWidth / 2, el.clientHeight / 2)
    }
    const keyup = (e: KeyboardEvent) => release(e.key)
    el.addEventListener('keydown', down)
    el.addEventListener('keyup', keyup)
    el.addEventListener('blur', releaseAll)
    win.addEventListener('pointerup', up)
    win.addEventListener('pointercancel', up)
    win.addEventListener('blur', releaseAll)
    return () => {
      releaseAll()
      engine.current?.dispose()
      engine.current = null
      el.removeEventListener('keydown', down)
      el.removeEventListener('keyup', keyup)
      el.removeEventListener('blur', releaseAll)
      win.removeEventListener('pointerup', up)
      win.removeEventListener('pointercancel', up)
      win.removeEventListener('blur', releaseAll)
    }
  }, [options.ref, options.disabled, options.color, options.opacity, rippleSettings.style, start])
  const pointerDown = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      if (e.defaultPrevented || (e.button !== undefined && e.button !== 0)) return
      const el = latest.current.ref.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      start(
        e.pointerId,
        (e.clientX - rect.left) * (el.offsetWidth / (rect.width || 1)) - el.clientLeft,
        (e.clientY - rect.top) * (el.offsetHeight / (rect.height || 1)) - el.clientTop,
      )
    },
    [start],
  )
  return [options.ref, pointerDown] as const
}

export { useRipple }
