import React, { useRef } from 'react'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import useRipple from './useRipple'
import { ThemeProvider, useTheme } from '../context/ThemeProvider'
import { defaultRippleSettings } from '../utils/ripple-settings'
import { RippleContext } from '../context/ripple-context'

vi.mock('../utils/font-loader', () => ({ loadGoogleFont: vi.fn(), PRESET_FONTS: {} }))
vi.mock('../utils/theme-generator', () => ({ applyThemeVariables: vi.fn(), CSS_MAPPING: {} }))
let frames: Map<number, FrameRequestCallback>
let next: number
let now: number
const gradient = { addColorStop: vi.fn() }
const ctx = {
  fillStyle: '',
  fillRect: vi.fn(),
  getImageData: () => ({ data: new Uint8ClampedArray([0, 0, 0, 51]) }),
  setTransform: vi.fn(),
  clearRect: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  createRadialGradient: vi.fn(() => gradient),
  fill: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  translate: vi.fn(),
  createPattern: vi.fn(() => null),
}
const disconnect = vi.fn()
function advance(count = 1) {
  act(() => {
    for (let i = 0; i < count; i++) {
      now += 16
      const pending = [...frames.values()]
      frames.clear()
      pending.forEach(fn => fn(now))
    }
  })
}
function Target({ disabled = false }: { disabled?: boolean }) {
  const ref = useRef<HTMLButtonElement>(null)
  const [, press] = useRipple({ ref, disabled, color: 'rgba(0,0,0,0.2)' })
  return (
    <button ref={ref} onPointerDown={press} disabled={disabled}>
      Press
    </button>
  )
}
function Settings() {
  const { rippleSettings, setRippleSettings, resetRippleSettings } = useTheme()
  return (
    <>
      <output data-testid="settings">{JSON.stringify(rippleSettings)}</output>
      <button onClick={() => setRippleSettings({ expandMs: 900, sparkle: false })}>Update</button>
      <button onClick={resetRippleSettings}>Reset</button>
      <button onClick={() => setRippleSettings({ style: 'classic' })}>Classic</button>
      <button onClick={() => setRippleSettings({ style: 'liquid' })}>Liquid</button>
    </>
  )
}
beforeEach(() => {
  frames = new Map()
  next = 0
  now = 0
  localStorage.clear()
  vi.stubGlobal('requestAnimationFrame', (fn: FrameRequestCallback) => {
    frames.set(++next, fn)
    return next
  })
  vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id))
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
  )
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      disconnect = disconnect
    },
  )
  vi.stubGlobal(
    'PointerEvent',
    class extends MouseEvent {
      pointerId: number
      constructor(type: string, init: PointerEventInit = {}) {
        super(type, init)
        this.pointerId = init.pointerId ?? 1
      }
    },
  )
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(ctx as unknown as CanvasRenderingContext2D)
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(200)
  vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(100)
})
afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})

describe('liquid ripple', () => {
  it('switches engines through the provider while held and retains liquid settings', () => {
    render(
      <ThemeProvider>
        <Target />
        <Settings />
      </ThemeProvider>,
    )
    fireEvent.pointerDown(screen.getByText('Press'))
    expect(document.querySelector('canvas')).not.toBeNull()
    fireEvent.click(screen.getByText('Classic'))
    expect(document.querySelector('canvas')).toBeNull()
    expect(frames.size).toBe(0)
    fireEvent.pointerDown(screen.getByText('Press'))
    expect(document.querySelector('[data-chesai-classic-ripple]')).not.toBeNull()
    expect(document.querySelector('canvas')).toBeNull()
    expect(JSON.parse(localStorage.getItem('chesai-ui-ripple')!)).toMatchObject({ style: 'classic', waveAmp: 0.04 })
    fireEvent.click(screen.getByText('Liquid'))
    expect(document.querySelector('[data-chesai-classic-ripple]')).toBeNull()
    fireEvent.pointerDown(screen.getByText('Press'))
    expect(document.querySelector('canvas')).not.toBeNull()
  })
  it('releases classic keyboard ripples and cleans up timers on unmount', () => {
    vi.useFakeTimers()
    const view = render(
      <RippleContext.Provider value={{ ...defaultRippleSettings, style: 'classic' }}>
        <Target />
      </RippleContext.Provider>,
    )
    const button = screen.getByText('Press')
    fireEvent.keyDown(button, { key: 'Enter' })
    advance()
    expect(document.querySelector('[data-chesai-classic-ripple]')).not.toBeNull()
    fireEvent.keyUp(button, { key: 'Enter' })
    act(() => vi.advanceTimersByTime(600))
    expect(document.querySelector('[data-chesai-classic-ripple]')).toBeNull()
    fireEvent.pointerDown(button)
    fireEvent.pointerUp(window)
    view.unmount()
    expect(frames.size).toBe(0)
    expect(vi.getTimerCount()).toBe(0)
  })
  it('uses live provider settings and quarter-speed playback', () => {
    const view = render(
      <RippleContext.Provider value={{ ...defaultRippleSettings, timeScale: 0.25 }}>
        <Target />
      </RippleContext.Provider>,
    )
    fireEvent.pointerDown(screen.getByText('Press'), { pointerId: 1 })
    fireEvent.pointerUp(window, { pointerId: 1 })
    advance(40)
    expect(document.querySelector('canvas')).not.toBeNull()
    view.rerender(
      <RippleContext.Provider value={defaultRippleSettings}>
        <Target />
      </RippleContext.Provider>,
    )
    advance(40)
    expect(document.querySelector('canvas')).toBeNull()
  })
  it('releases simultaneous pointers independently', () => {
    render(<Target />)
    const button = screen.getByText('Press')
    fireEvent.pointerDown(button, { pointerId: 1 })
    fireEvent.pointerDown(button, { pointerId: 2 })
    fireEvent.pointerUp(window, { pointerId: 1 })
    advance(45)
    expect(document.querySelector('canvas')).not.toBeNull()
    fireEvent.pointerUp(window, { pointerId: 2 })
    advance(30)
    expect(frames.size).toBe(0)
  })
  it('disables shimmer when reduced motion is requested', () => {
    vi.mocked(window.matchMedia).mockReturnValue({ matches: true } as MediaQueryList)
    render(<Target />)
    fireEvent.pointerDown(screen.getByText('Press'))
    advance(10)
    expect(ctx.createPattern).not.toHaveBeenCalled()
  })
  it('holds until release outside the host, then removes the canvas and stops frames', () => {
    render(<Target />)
    fireEvent.pointerDown(screen.getByText('Press'), { pointerId: 7, button: 0 })
    advance(80)
    expect(document.querySelector('canvas')).not.toBeNull()
    expect(frames.size).toBe(1)
    fireEvent.pointerUp(window, { pointerId: 7 })
    advance(30)
    expect(document.querySelector('canvas')).toBeNull()
    expect(frames.size).toBe(0)
  })
  it('keeps quick taps visible and supports cancellation', () => {
    render(<Target />)
    fireEvent.pointerDown(screen.getByText('Press'), { pointerId: 1 })
    fireEvent.pointerCancel(window, { pointerId: 1 })
    advance(5)
    expect(document.querySelector('canvas')).not.toBeNull()
    advance(40)
    expect(document.querySelector('canvas')).toBeNull()
  })
  it('starts keyboard presses at the center, ignores repeats and releases on blur', () => {
    render(<Target />)
    const button = screen.getByText('Press')
    fireEvent.keyDown(button, { key: 'Enter' })
    fireEvent.keyDown(button, { key: 'Enter', repeat: true })
    advance()
    expect(ctx.createRadialGradient).toHaveBeenCalledTimes(1)
    expect(ctx.createRadialGradient.mock.calls[0].slice(0, 3)).toEqual([100, 50, 0])
    fireEvent.blur(button)
    advance(40)
    expect(frames.size).toBe(0)
  })
  it('ignores disabled hosts and secondary buttons, and disposes on unmount', () => {
    const { rerender, unmount } = render(<Target disabled />)
    fireEvent.pointerDown(screen.getByText('Press'))
    expect(document.querySelector('canvas')).toBeNull()
    rerender(<Target />)
    fireEvent.pointerDown(screen.getByText('Press'), { button: 2 })
    expect(document.querySelector('canvas')).toBeNull()
    fireEvent.pointerDown(screen.getByText('Press'), { button: 0 })
    unmount()
    expect(frames.size).toBe(0)
    expect(disconnect).toHaveBeenCalled()
  })
  it('persists partial updates, restores them and resets to provider defaults', () => {
    const view = render(
      <ThemeProvider defaultRippleSettings={{ waveAmp: 0.08 }}>
        <Settings />
      </ThemeProvider>,
    )
    fireEvent.click(screen.getByText('Update'))
    expect(JSON.parse(localStorage.getItem('chesai-ui-ripple')!)).toMatchObject({
      waveAmp: 0.08,
      expandMs: 900,
      sparkle: false,
    })
    view.unmount()
    render(
      <ThemeProvider defaultRippleSettings={{ waveAmp: 0.08 }}>
        <Settings />
      </ThemeProvider>,
    )
    expect(JSON.parse(screen.getByTestId('settings').textContent!)).toMatchObject({ expandMs: 900 })
    fireEvent.click(screen.getByText('Reset'))
    expect(JSON.parse(screen.getByTestId('settings').textContent!)).toEqual({ ...defaultRippleSettings, waveAmp: 0.08 })
  })
  it('falls back safely for corrupt saved settings', () => {
    localStorage.setItem('chesai-ui-ripple', '{bad json')
    render(
      <ThemeProvider>
        <Settings />
      </ThemeProvider>,
    )
    expect(JSON.parse(screen.getByTestId('settings').textContent!)).toEqual(defaultRippleSettings)
  })
})
