import React from 'react'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

const calls = vi.hoisted(() => ({ targets: [] as number[] }))
// Isolate release geometry from pointer capture/inertia; retain real motion values/transforms.
vi.mock('framer-motion', async importOriginal => {
  const actual = await importOriginal<typeof import('framer-motion')>()
  return { ...actual,
    animate: (value: { set: (n: number) => void }, target: number) => {
      calls.targets.push(target); value.set(target); return Promise.resolve()
    },
    motion: { ...actual.motion, div: React.forwardRef<HTMLDivElement, any>(({
      children, onDragEnd, style, animate, transition, drag, dragDirectionLock,
      dragMomentum, dragConstraints, dragElastic, ...props
    }, ref) => <div {...props} ref={ref}
      data-momentum={dragMomentum === undefined ? undefined : String(dragMomentum)}
      style={Object.fromEntries(Object.entries(style ?? {}).filter(([key]) => key !== 'x').map(([key, value]: [string, any]) => [key, value?.get ? value.get() : value]))}
      onMouseUp={event => onDragEnd?.(event, { offset: { x: event.clientX } })}>{children}</div>) },
  }
})
import { Swipeable } from './index'
afterEach(() => { cleanup(); calls.targets.length = 0 })

describe('Swipeable dismiss bounds', () => {
  it.each([240, 384, 900, 1200])('dismisses exactly one row width (%ipx) in both directions', async width => {
    const action = vi.fn()
    const ref = React.createRef<HTMLDivElement>()
    render(<Swipeable ref={ref} type="dismiss" leftAction={{ onClick: action }} rightAction={{ onClick: action }}>
      <Swipeable.Action side="left" data-testid="left" />
      <Swipeable.Action side="right" data-testid="right" />
      <Swipeable.Content data-testid="content">Row</Swipeable.Content>
    </Swipeable>)
    Object.defineProperty(ref.current, 'clientWidth', { configurable: true, value: width })
    fireEvent.mouseUp(screen.getByTestId('content'), { clientX: -150 })
    await waitFor(() => expect(action).toHaveBeenCalledTimes(1))
    expect(calls.targets.at(-1)).toBe(-width)
    fireEvent.mouseUp(screen.getByTestId('content'), { clientX: 150 })
    await waitFor(() => expect(action).toHaveBeenCalledTimes(2))
    expect(calls.targets.at(-1)).toBe(width)
    expect(screen.getByTestId('left').style.maxWidth).toBe('100%')
    expect(screen.getByTestId('right').style.maxWidth).toBe('100%')
    expect(screen.getByTestId('content').getAttribute('data-momentum')).toBe('false')
  })

  it('uses the latest layout width rather than scaled visual bounds', async () => {
    const ref = React.createRef<HTMLDivElement>(), action = vi.fn()
    render(<Swipeable ref={ref} type="dismiss" rightAction={{ onClick: action }}><Swipeable.Content data-testid="content">Row</Swipeable.Content></Swipeable>)
    let width = 300
    Object.defineProperty(ref.current, 'clientWidth', { get: () => width })
    vi.spyOn(ref.current!, 'getBoundingClientRect').mockReturnValue({ width: 600 } as DOMRect)
    width = 420
    fireEvent.mouseUp(screen.getByTestId('content'), { clientX: -150 })
    await waitFor(() => expect(action).toHaveBeenCalledOnce())
    expect(calls.targets.at(-1)).toBe(-420)
  })

  it('returns a below-threshold swipe without firing the action', () => {
    const action = vi.fn()
    render(<Swipeable type="dismiss" rightAction={{ onClick: action }}><Swipeable.Content data-testid="content">Row</Swipeable.Content></Swipeable>)
    fireEvent.mouseUp(screen.getByTestId('content'), { clientX: -40 })
    expect(calls.targets.at(-1)).toBe(0)
    expect(action).not.toHaveBeenCalled()
  })
})
