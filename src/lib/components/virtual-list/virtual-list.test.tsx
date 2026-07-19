import { render } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { VirtualList } from './index'

const virtualHarness = vi.hoisted(() => {
  const measureElement = vi.fn()
  return {
    options: null as Record<string, unknown> | null,
    measureElement,
    virtualizer: {
      getVirtualItems: () => [{ index: 0, key: 'item-a', start: 0 }],
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
