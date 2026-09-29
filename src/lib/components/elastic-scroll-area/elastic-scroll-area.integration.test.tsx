import { act, cleanup, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { MotionValue } from 'framer-motion'
import { ElasticScrollArea } from './index'

vi.mock('../loadingIndicator', () => ({ LoadingIndicator: () => null }))
vi.mock('framer-motion', async importOriginal => ({
  ...(await importOriginal<typeof import('framer-motion')>()),
  useReducedMotion: () => false,
  animate: vi.fn((value, target) => {
    value.set(target)
    return { stop: vi.fn() }
  }),
}))

beforeEach(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  )
})
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

function touch(viewport: HTMLElement, type: string, y = 0) {
  const event = new Event(type, { bubbles: true, cancelable: true })
  Object.defineProperty(event, 'touches', {
    value: type === 'touchend' ? [] : [{ identifier: 0, clientY: y, clientX: 0 }],
  })
  act(() => {
    viewport.dispatchEvent(event)
  })
}

describe('ElasticScrollArea refresh integration', () => {
  it('keeps content stationary while its indicator pulls, loads and resets with hidden scrollbars', async () => {
    let progress!: MotionValue<number>
    let finish!: () => void
    const onRefresh = vi.fn(
      () =>
        new Promise<void>(resolve => {
          finish = resolve
        }),
    )
    function Indicator({ pullProgress, isRefreshing }: { pullProgress: MotionValue<number>; isRefreshing: boolean }) {
      progress = pullProgress
      return <span data-testid="indicator">{isRefreshing ? 'Refreshing' : 'Pull'}</span>
    }
    const view = render(
      <ElasticScrollArea
        elasticity={false}
        pullToRefresh
        onRefresh={onRefresh}
        scrollbarVisibility="hidden"
        RefreshIndicatorComponent={Indicator}
      >
        <div>Content</div>
      </ElasticScrollArea>,
    )
    const viewport = view.container.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement
    const contentMotion = viewport.parentElement!
    Object.defineProperties(viewport, { scrollHeight: { value: 1000 }, clientHeight: { value: 200 } })
    touch(viewport, 'touchstart')
    touch(viewport, 'touchmove', 600)
    expect(progress.get()).toBeGreaterThan(80)
    expect(contentMotion.style.transform).toMatch(/^(none)?$/)
    touch(viewport, 'touchend')
    expect(view.getByTestId('indicator').textContent).toBe('Refreshing')
    expect(onRefresh).toHaveBeenCalledTimes(1)
    expect(contentMotion.style.transform).toMatch(/^(none)?$/)
    await act(async () => finish())
    expect(view.getByTestId('indicator').textContent).toBe('Pull')
    expect(progress.get()).toBe(0)
  })

  it('uses the same safe threshold for gesture detection and a custom indicator', () => {
    let threshold: number | undefined
    function Indicator(props: { pullThreshold?: number }) {
      threshold = props.pullThreshold
      return null
    }
    const view = render(
      <ElasticScrollArea
        elasticity={false}
        pullToRefresh
        onRefresh={async () => {}}
        pullThreshold={Number.NaN}
        RefreshIndicatorComponent={Indicator}
      >
        Content
      </ElasticScrollArea>,
    )
    expect(threshold).toBe(80)
    view.rerender(
      <ElasticScrollArea
        elasticity={false}
        pullToRefresh
        onRefresh={async () => {}}
        pullThreshold={0}
        RefreshIndicatorComponent={Indicator}
      >
        Content
      </ElasticScrollArea>,
    )
    expect(threshold).toBe(1)
  })

  it('leaves native overscroll and hides refresh UI when no callback is available', () => {
    const view = render(
      <ElasticScrollArea
        elasticity={false}
        pullToRefresh
        RefreshIndicatorComponent={() => <span>Refresh indicator</span>}
      >
        Content
      </ElasticScrollArea>,
    )
    const viewport = view.container.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement
    expect(view.queryByText('Refresh indicator')).toBeNull()
    expect(viewport.style.overscrollBehaviorY).toBe('')
  })
})
