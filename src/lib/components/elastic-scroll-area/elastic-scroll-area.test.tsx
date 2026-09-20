import { act, cleanup, renderHook } from '@testing-library/react'
import { motionValue } from 'framer-motion'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useElasticAndRefresh } from './use-elastic-scroll'

vi.mock('framer-motion', async importOriginal => ({
  ...(await importOriginal<typeof import('framer-motion')>()),
  useReducedMotion: () => false,
  // Exercise gesture ownership independently of animation frame timing.
  animate: vi.fn((value, target) => {
    value.set(target)
    return { stop: vi.fn() }
  }),
}))

afterEach(() => {
  cleanup()
  document.body.replaceChildren()
  vi.useRealTimers()
})

function setup(overrides: Partial<Parameters<typeof useElasticAndRefresh>[3]> = {}) {
  const viewport = document.createElement('div')
  document.body.append(viewport)
  Object.defineProperties(viewport, {
    scrollHeight: { value: 1000 },
    clientHeight: { value: 200 },
    scrollWidth: { value: 1000 },
    clientWidth: { value: 200 },
  })
  const offset = motionValue(0)
  const indicator = motionValue(0)
  const ref = { current: viewport }
  const options = {
    orientation: 'vertical' as const,
    elasticity: true,
    damping: 0.25,
    isRefreshEnabled: false,
    pullThreshold: 80,
    ...overrides,
  }
  const hook = renderHook(props => useElasticAndRefresh(ref, offset, indicator, props), {
    initialProps: options,
  })
  const touch = (type: string, y = 0, config: { count?: number; cancelable?: boolean; x?: number } = {}) => {
    const count = config.count ?? (type === 'touchend' || type === 'touchcancel' ? 0 : 1)
    const event = new Event(type, { bubbles: true, cancelable: config.cancelable ?? true })
    Object.defineProperty(event, 'touches', {
      value: Array.from({ length: count }, (_, identifier) => ({
        identifier,
        clientY: y,
        clientX: config.x ?? 0,
      })),
    })
    act(() => {
      viewport.dispatchEvent(event)
    })
    return event
  }
  const wheel = (init: WheelEventInit, target: HTMLElement = viewport) => {
    const event = new WheelEvent('wheel', { bubbles: true, cancelable: true, ...init })
    act(() => {
      target.dispatchEvent(event)
    })
    return event
  }
  return { ...hook, viewport, offset, indicator, options, touch, wheel }
}

describe('elastic scroll gesture ownership', () => {
  it.each([0, 400, 800])('allows browser zoom at scroll position %s', position => {
    const s = setup()
    s.viewport.scrollTop = position
    for (const deltaY of [-100, 100]) {
      expect(s.wheel({ deltaY, ctrlKey: true }).defaultPrevented).toBe(false)
      expect(s.wheel({ deltaY, metaKey: true }).defaultPrevented).toBe(false)
    }
    expect(s.offset.get()).toBe(0)
  })

  it.each(['top', 'bottom'])('does not jump when a native fast swipe reaches the %s', edge => {
    const s = setup()
    const direction = edge === 'top' ? 1 : -1
    s.viewport.scrollTop = 400
    s.touch('touchstart', 500)
    expect(s.touch('touchmove', 500 + direction * 100).defaultPrevented).toBe(false)
    s.viewport.scrollTop = edge === 'top' ? 0 : 800
    expect(s.touch('touchmove', 500 + direction * 450).defaultPrevented).toBe(false)
    expect(s.offset.get()).toBe(0)
  })

  it.each([0, 800])('bounds a large edge pull at %s and recovers on release', position => {
    const s = setup()
    s.viewport.scrollTop = position
    s.touch('touchstart', 0)
    expect(s.touch('touchmove', position ? -10000 : 10000).defaultPrevented).toBe(true)
    expect(Math.abs(s.offset.get())).toBeGreaterThan(0)
    expect(Math.abs(s.offset.get())).toBeLessThanOrEqual(200)
    s.touch('touchend')
    expect(s.offset.get()).toBe(0)
  })

  it('uses the configured damping on touch', () => {
    const weak = setup({ damping: 0.1 })
    const strong = setup({ damping: 0.5 })
    for (const s of [weak, strong]) {
      s.touch('touchstart')
      s.touch('touchmove', 100)
    }
    expect(strong.offset.get()).toBeGreaterThan(weak.offset.get())
  })

  it('unwinds a reversed pull and continues scrolling within the same touch', () => {
    const s = setup()
    s.touch('touchstart', 100)
    s.touch('touchmove', 200)
    s.touch('touchmove', 50)
    expect(s.offset.get()).toBe(0)
    expect(s.viewport.scrollTop).toBe(50)
    s.touch('touchmove', 20)
    expect(s.viewport.scrollTop).toBe(80)
  })

  it('does not transform a non-cancelable native gesture', () => {
    const s = setup()
    s.touch('touchstart')
    s.touch('touchmove', 200, { cancelable: false })
    expect(s.offset.get()).toBe(0)
    expect(s.wheel({ deltaY: -200, cancelable: false }).defaultPrevented).toBe(false)
    expect(s.offset.get()).toBe(0)
  })

  it('abandons a pull for pinch and does not restart when one finger remains', () => {
    const onRefresh = vi.fn()
    const s = setup({ isRefreshEnabled: true, onRefresh })
    s.touch('touchstart')
    s.touch('touchmove', 600)
    s.touch('touchstart', 600, { count: 2 })
    expect(s.offset.get()).toBe(0)
    expect(s.touch('touchmove', 900, { count: 2 }).defaultPrevented).toBe(false)
    s.touch('touchend', 600, { count: 1 })
    expect(s.touch('touchmove', 1000).defaultPrevented).toBe(false)
    s.touch('touchend')
    expect(onRefresh).not.toHaveBeenCalled()
  })

  it('never refreshes a canceled pull or a wheel burst', () => {
    vi.useFakeTimers()
    const onRefresh = vi.fn()
    const s = setup({ isRefreshEnabled: true, onRefresh })
    s.touch('touchstart')
    s.touch('touchmove', 1000)
    s.touch('touchcancel')
    s.wheel({ deltaY: -1000 })
    act(() => {
      vi.advanceTimersByTime(200)
    })
    expect(s.offset.get()).toBe(0)
    expect(onRefresh).not.toHaveBeenCalled()
  })

  it('normalizes wheel line and page units', () => {
    const pixels = setup()
    const lines = setup()
    const pages = setup()
    pixels.wheel({ deltaY: -200 })
    lines.wheel({ deltaY: -12.5, deltaMode: 1 })
    pages.wheel({ deltaY: -1, deltaMode: 2 })
    expect(lines.offset.get()).toBeCloseTo(pixels.offset.get())
    expect(pages.offset.get()).toBeCloseTo(pixels.offset.get())
  })

  it('leaves inward wheel and cross-axis gestures native', () => {
    const s = setup()
    s.wheel({ deltaY: -100 })
    expect(s.wheel({ deltaY: 100 }).defaultPrevented).toBe(false)
    expect(s.offset.get()).toBe(0)
    s.touch('touchstart')
    expect(s.touch('touchmove', 10, { x: 100 }).defaultPrevented).toBe(false)
    expect(s.offset.get()).toBe(0)
  })

  it('allows a nested scrollable element to consume the gesture first', () => {
    const s = setup()
    const child = document.createElement('div')
    child.style.overflowY = 'auto'
    Object.defineProperties(child, { scrollHeight: { value: 500 }, clientHeight: { value: 100 } })
    child.scrollTop = 100
    s.viewport.append(child)
    expect(s.wheel({ deltaY: -100 }, child).defaultPrevented).toBe(false)
    expect(s.offset.get()).toBe(0)
  })

  it('supports horizontal pulls and RTL physical edges', () => {
    const s = setup({ orientation: 'horizontal' })
    s.viewport.style.direction = 'rtl'
    expect(s.wheel({ deltaX: 100 }).defaultPrevented).toBe(true)
    expect(s.offset.get()).toBeLessThan(0)
    s.viewport.scrollLeft = -800
    s.wheel({ deltaX: -100 }) // reverse the previous burst
    expect(s.wheel({ deltaX: -100 }).defaultPrevented).toBe(true)
    expect(s.offset.get()).toBeGreaterThan(0)
  })

  it('keeps bottom scrolling native in refresh-only mode', () => {
    const s = setup({ elasticity: false, isRefreshEnabled: true })
    s.viewport.scrollTop = 800
    expect(s.wheel({ deltaY: 100 }).defaultPrevented).toBe(false)
    s.touch('touchstart', 500)
    expect(s.touch('touchmove', 0).defaultPrevented).toBe(false)
  })

  it('cleans up pending wheel recovery and transforms when disabled', () => {
    vi.useFakeTimers()
    const s = setup()
    s.wheel({ deltaY: -100 })
    s.rerender({ ...s.options, elasticity: false })
    expect(s.offset.get()).toBe(0)
    expect(s.indicator.get()).toBe(0)
    expect(vi.getTimerCount()).toBe(0)
    expect(s.wheel({ deltaY: -100 }).defaultPrevented).toBe(false)
  })

  it('runs one refresh and reports rejection without leaving loading active', async () => {
    let reject!: (error: unknown) => void
    const onRefresh = vi.fn(
      () =>
        new Promise((_, fail) => {
          reject = fail
        }),
    )
    const onRefreshError = vi.fn()
    const s = setup({ isRefreshEnabled: true, onRefresh, onRefreshError })
    s.touch('touchstart')
    s.touch('touchmove', 600)
    s.touch('touchend')
    expect(onRefresh).toHaveBeenCalledTimes(1)
    expect(s.result.current.isRefreshing).toBe(true)
    s.touch('touchstart')
    s.touch('touchmove', 600)
    s.touch('touchend')
    expect(onRefresh).toHaveBeenCalledTimes(1)
    const error = new Error('offline')
    await act(async () => {
      reject(error)
    })
    expect(onRefreshError).toHaveBeenCalledWith(error)
    expect(s.result.current.isRefreshing).toBe(false)
    expect(s.indicator.get()).toBe(0)
  })

  it('finishes an in-flight refresh after options change', async () => {
    let finish!: () => void
    const s = setup({
      isRefreshEnabled: true,
      onRefresh: () =>
        new Promise<void>(resolve => {
          finish = resolve
        }),
    })
    s.touch('touchstart')
    s.touch('touchmove', 600)
    s.touch('touchend')
    s.rerender({ ...s.options, damping: 0.5 })
    await act(async () => {
      finish()
    })
    expect(s.result.current.isRefreshing).toBe(false)
    expect(s.indicator.get()).toBe(0)
  })

  it('removes listeners and timers on unmount', () => {
    vi.useFakeTimers()
    const s = setup()
    s.wheel({ deltaY: -100 })
    s.unmount()
    expect(vi.getTimerCount()).toBe(0)
    expect(s.offset.get()).toBe(0)
    expect(s.wheel({ deltaY: -100 }).defaultPrevented).toBe(false)
  })
})
