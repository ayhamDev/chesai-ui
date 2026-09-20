import { render } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { VirtualList } from './index'
import { VirtualFlex } from '../layouts/virtual-flex'
import { DirectionProvider } from '../../context/direction'

const virtualHarness = vi.hoisted(() => {
  const measureElement = vi.fn()
  let start = 0
  return {
    setStart: (value: number) => { start = value },
    options: null as Record<string, unknown> | null,
    measureElement,
    virtualizer: {
      getVirtualItems: () => [{ index: 0, key: 'item-a', start }],
      getTotalSize: () => 100,
      measureElement,
    },
  }
})

vi.mock('@tanstack/react-virtual', () => ({
  useVirtualizer: vi.fn(options => {
    virtualHarness.options = options
    return virtualHarness.virtualizer
  }),
}))

beforeEach(() => {
  virtualHarness.setStart(0)
  virtualHarness.options = null
  virtualHarness.measureElement.mockClear()
  vi.clearAllMocks()
})

describe('VirtualList', () => {
  const data = [{ id: 'item-a', label: 'Alpha' }]

  it('uses stable item identities in the virtualizer', () => {
    render(<VirtualList data={data} getItemKey={item => item.id} renderItem={item => item.label} />)

    const getItemKey = virtualHarness.options?.getItemKey as ((index: number) => React.Key) | undefined
    expect(getItemKey?.(0)).toBe('item-a')
  })

  it('skips element measurement in fixed-size mode', () => {
    render(<VirtualList data={data} measureItems={false} estimateSize={100} renderItem={item => item.label} />)

    expect(virtualHarness.measureElement).not.toHaveBeenCalled()
    expect(virtualHarness.options?.useAnimationFrameWithResizeObserver).toBe(false)
  })

  it('does not rerender unchanged item content when its parent rerenders', () => {
    const renderItem = vi.fn((item: (typeof data)[number]) => item.label)
    const { rerender } = render(
      <VirtualList data={data} containerProps={{ 'data-state': 'before' }} renderItem={renderItem} />,
    )

    expect(renderItem).toHaveBeenCalledTimes(1)

    rerender(<VirtualList data={data} containerProps={{ 'data-state': 'after' }} renderItem={renderItem} />)

    expect(renderItem).toHaveBeenCalledTimes(1)
  })
})


describe('horizontal RTL scrolling', () => {
  it.each([false, true])('positions and scrolls items consistently (reverse=%s)', reverse => {
    virtualHarness.setStart(128)
    const { container } = render(<VirtualList data={['Alpha']} direction={reverse ? 'horizontal-reverse' : 'horizontal'} containerProps={{ dir: 'rtl' }} renderItem={item => item} />)
    const row = container.querySelector<HTMLElement>('[data-index]')!
    expect(row.style.transform).toBe(reverse ? 'translateX(128px)' : 'translateX(-128px)')
    expect(virtualHarness.options?.isRtl).toBe(!reverse)
    if (!reverse) {
      const viewport = container.firstElementChild as HTMLElement
      const scrollToFn = virtualHarness.options?.scrollToFn as Function
      scrollToFn(500, { adjustments: 12, behavior: 'auto' }, { scrollElement: viewport })
      expect(viewport.scrollLeft).toBe(-512)
    }
  })
})


it('writes negative horizontal measurement adjustments for VirtualFlex in RTL', () => {
  render(<DirectionProvider dir="rtl"><VirtualFlex data={['Alpha']} direction="horizontal" renderItem={item => item} /></DirectionProvider>)
  const scrollTo = vi.fn()
  const scrollToFn = virtualHarness.options?.scrollToFn as Function
  scrollToFn(500, { adjustments: 12, behavior: 'auto' }, { scrollElement: { scrollTo } })
  expect(scrollTo).toHaveBeenCalledWith({ left: -512, behavior: 'auto' })
})
