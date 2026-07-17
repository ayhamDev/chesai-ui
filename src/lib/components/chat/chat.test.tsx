import { act, fireEvent, render, screen } from '@testing-library/react'
import React, { useCallback } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ChatController } from './controller'
import { Chat, type ChatRootRef } from './index'

/* ------------------------------------------------------------------ mocks */

type ROCallback = (entries: ResizeObserverEntry[], observer: ResizeObserver) => void

class MockResizeObserver {
  static instances: MockResizeObserver[] = []
  static trigger() {
    for (const instance of MockResizeObserver.instances) {
      instance.callback([], instance as unknown as ResizeObserver)
    }
  }
  callback: ROCallback
  observed = new Set<Element>()
  constructor(callback: ROCallback) {
    this.callback = callback
    MockResizeObserver.instances.push(this)
  }
  observe(el: Element) {
    this.observed.add(el)
  }
  unobserve(el: Element) {
    this.observed.delete(el)
  }
  disconnect() {
    this.observed.clear()
  }
}

interface ScrollBox {
  scrollHeight: number
  clientHeight: number
}

/** jsdom has no layout: back scroll geometry with plain state + browser-like clamping. */
function mockScrollBox(el: HTMLElement, dims: ScrollBox): ScrollBox {
  const state = { ...dims }
  let scrollTop = 0
  Object.defineProperty(el, 'scrollHeight', { configurable: true, get: () => state.scrollHeight })
  Object.defineProperty(el, 'clientHeight', { configurable: true, get: () => state.clientHeight })
  Object.defineProperty(el, 'scrollTop', {
    configurable: true,
    get: () => scrollTop,
    set: (value: number) => {
      scrollTop = Math.max(0, Math.min(value, state.scrollHeight - state.clientHeight))
    },
  })
  return state
}

function mockRect(el: Element, rect: Partial<DOMRect>) {
  el.getBoundingClientRect = () =>
    ({ top: 0, bottom: 0, left: 0, right: 0, width: 0, height: 0, x: 0, y: 0, ...rect }) as DOMRect
}

beforeEach(() => {
  MockResizeObserver.instances = []
  vi.stubGlobal('ResizeObserver', MockResizeObserver)
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

/* ------------------------------------------------------- controller tests */

function createControllerHarness(dims: ScrollBox = { scrollHeight: 1000, clientHeight: 400 }) {
  const viewport = document.createElement('div')
  const content = document.createElement('div')
  viewport.appendChild(content)
  const box = mockScrollBox(viewport, dims)
  const controller = new ChatController()
  controller.setContent(content)
  controller.setViewport(viewport)
  return { controller, viewport, content, box }
}

describe('ChatController', () => {
  it('starts pinned to the bottom', () => {
    const { viewport } = createControllerHarness()
    expect(viewport.scrollTop).toBe(600)
  })

  it('flips atBottom only on real transitions and notifies subscribers', () => {
    const { controller, viewport } = createControllerHarness()
    const onAtBottomChange = vi.fn()
    const subscriber = vi.fn()
    controller.setOptions({ onAtBottomChange })
    controller.subscribe(subscriber)

    viewport.scrollTop = 0
    fireEvent.scroll(viewport)
    expect(onAtBottomChange).toHaveBeenCalledExactlyOnceWith(false)
    expect(subscriber).toHaveBeenCalledTimes(1)
    expect(controller.isAtBottom()).toBe(false)

    // Scrolling within the top region again must not re-notify.
    viewport.scrollTop = 10
    fireEvent.scroll(viewport)
    expect(subscriber).toHaveBeenCalledTimes(1)

    viewport.scrollTop = 600
    fireEvent.scroll(viewport)
    expect(onAtBottomChange).toHaveBeenLastCalledWith(true)
    expect(subscriber).toHaveBeenCalledTimes(2)
  })

  it('fires onLoadOlder once at the top threshold and again after the load settles', async () => {
    const { controller, viewport } = createControllerHarness()
    let resolve!: () => void
    const onLoadOlder = vi.fn(() => new Promise<void>(r => (resolve = r)))
    controller.setOptions({ hasMore: true, onLoadOlder })

    viewport.scrollTop = 20
    fireEvent.scroll(viewport)
    fireEvent.scroll(viewport)
    expect(onLoadOlder).toHaveBeenCalledTimes(1)

    resolve()
    await Promise.resolve()

    viewport.scrollTop = 10
    fireEvent.scroll(viewport)
    expect(onLoadOlder).toHaveBeenCalledTimes(2)
  })

  it('suppresses load triggers while the parent reports isLoading', () => {
    const { controller, viewport } = createControllerHarness()
    const onLoadOlder = vi.fn()
    controller.setOptions({ hasMore: true, isLoading: true, onLoadOlder })

    viewport.scrollTop = 0
    fireEvent.scroll(viewport)
    expect(onLoadOlder).not.toHaveBeenCalled()

    controller.setOptions({ isLoading: false })
    viewport.scrollTop = 5
    fireEvent.scroll(viewport)
    expect(onLoadOlder).toHaveBeenCalledTimes(1)
  })

  it('backfills when the content does not overflow the viewport', () => {
    const { controller } = createControllerHarness({ scrollHeight: 300, clientHeight: 400 })
    const onLoadOlder = vi.fn()
    controller.setOptions({ hasMore: true, onLoadOlder })
    expect(onLoadOlder).toHaveBeenCalledTimes(1)
  })

  it('keeps the viewport pinned while content grows', () => {
    const { viewport, box } = createControllerHarness()
    expect(viewport.scrollTop).toBe(600)

    box.scrollHeight = 1400
    act(() => MockResizeObserver.trigger())
    expect(viewport.scrollTop).toBe(1000)
  })

  it('does not follow growth after the user scrolls up', () => {
    const { viewport, box } = createControllerHarness()
    viewport.scrollTop = 200
    fireEvent.scroll(viewport)

    box.scrollHeight = 1400
    act(() => MockResizeObserver.trigger())
    expect(viewport.scrollTop).toBe(200)
  })

  it('anchors the reading position when older messages are prepended', () => {
    const { controller, viewport, content, box } = createControllerHarness()
    const first = document.createElement('div')
    content.appendChild(first)
    mockRect(viewport, { top: 0, bottom: 400 })
    mockRect(first, { top: 5, bottom: 45 })
    controller.setOptions({ hasMore: true, onLoadOlder: vi.fn() })

    // Scroll to the top: unpins and triggers the load (capturing the anchor).
    viewport.scrollTop = 0
    fireEvent.scroll(viewport)

    // Prepend simulation: 300px of history lands above the anchor element.
    box.scrollHeight = 1300
    mockRect(first, { top: 305, bottom: 345 })
    act(() => MockResizeObserver.trigger())
    expect(viewport.scrollTop).toBe(300)
  })

  it('re-pins via scrollToBottom', () => {
    const { controller, viewport, box } = createControllerHarness()
    viewport.scrollTop = 0
    fireEvent.scroll(viewport)
    expect(controller.isAtBottom()).toBe(false)

    controller.scrollToBottom('instant')
    expect(viewport.scrollTop).toBe(600)
    expect(controller.isAtBottom()).toBe(true)

    // ...and it follows growth again afterwards.
    box.scrollHeight = 1200
    act(() => MockResizeObserver.trigger())
    expect(viewport.scrollTop).toBe(800)
  })

  it('releases the pin on an upward wheel gesture', () => {
    const { viewport, box } = createControllerHarness()
    fireEvent.wheel(viewport, { deltaY: -50 })

    box.scrollHeight = 1400
    act(() => MockResizeObserver.trigger())
    expect(viewport.scrollTop).toBe(600)
  })
})

/* -------------------------------------------------------- component tests */

interface Message {
  id: string
  text: string
}

function renderChat(ui?: { onLoadOlder?: () => void; hasMore?: boolean }) {
  const rootRef = React.createRef<ChatRootRef>()
  const utils = render(
    <Chat.Root ref={rootRef} hasMore={ui?.hasMore} onLoadOlder={ui?.onLoadOlder}>
      <Chat.Viewport data-testid="viewport">
        <Chat.Content data-testid="content">
          <div>hello</div>
        </Chat.Content>
      </Chat.Viewport>
      <Chat.ScrollToBottom data-testid="jump" />
    </Chat.Root>,
  )
  return { rootRef, ...utils }
}

describe('Chat components', () => {
  it('renders a functional viewport with headless styling hooks', () => {
    renderChat()
    const viewport = screen.getByTestId('viewport')
    expect(viewport.getAttribute('role')).toBe('log')
    expect(viewport.hasAttribute('data-chat-viewport')).toBe(true)
    expect(viewport.getAttribute('data-at-bottom')).toBe('true')
    expect(viewport.style.overflowY).toBe('auto')
    expect(screen.getByTestId('content').hasAttribute('data-chat-content')).toBe(true)
  })

  it('updates data attributes and ScrollToBottom state without prop changes', () => {
    renderChat()
    const viewport = screen.getByTestId('viewport')
    mockScrollBox(viewport, { scrollHeight: 1000, clientHeight: 400 })
    expect(screen.getByTestId('jump').getAttribute('data-state')).toBe('hidden')

    viewport.scrollTop = 0
    fireEvent.scroll(viewport)
    expect(viewport.getAttribute('data-at-bottom')).toBe('false')
    expect(screen.getByTestId('jump').getAttribute('data-state')).toBe('visible')

    fireEvent.click(screen.getByTestId('jump'))
    expect(viewport.getAttribute('data-at-bottom')).toBe('true')
    expect(screen.getByTestId('jump').getAttribute('data-state')).toBe('hidden')
  })

  it('exposes the imperative api through the root ref', () => {
    const { rootRef } = renderChat()
    const viewport = screen.getByTestId('viewport')
    mockScrollBox(viewport, { scrollHeight: 1000, clientHeight: 400 })

    expect(rootRef.current?.getViewport()).toBe(viewport)
    rootRef.current?.scrollToBottom('instant')
    expect(viewport.scrollTop).toBe(600)
    expect(rootRef.current?.isAtBottom()).toBe(true)
  })

  it('throws when parts are used outside Chat.Root', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<Chat.Viewport />)).toThrow(/inside <Chat.Root>/)
    spy.mockRestore()
  })
})

describe('Chat.Messages', () => {
  it('re-renders only rows whose item reference changed', () => {
    const renders = new Map<string, number>()

    function Transcript({ items }: { items: Message[] }) {
      const renderRow = useCallback((message: Message) => {
        renders.set(message.id, (renders.get(message.id) ?? 0) + 1)
        return <div>{message.text}</div>
      }, [])
      return (
        <Chat.Root>
          <Chat.Viewport>
            <Chat.Content>
              <Chat.Messages items={items} getKey={m => m.id}>
                {renderRow}
              </Chat.Messages>
            </Chat.Content>
          </Chat.Viewport>
        </Chat.Root>
      )
    }

    const a = { id: 'a', text: 'one' }
    const b = { id: 'b', text: 'two' }
    const { rerender } = render(<Transcript items={[a, b]} />)
    expect(renders.get('a')).toBe(1)
    expect(renders.get('b')).toBe(1)

    // Streaming update: only the last item gets a new reference.
    rerender(<Transcript items={[a, { ...b, text: 'two more tokens' }]} />)
    expect(renders.get('a')).toBe(1)
    expect(renders.get('b')).toBe(2)

    // Append: existing rows stay untouched.
    rerender(<Transcript items={[a, { ...b, text: 'two more tokens' }, { id: 'c', text: 'three' }]} />)
    expect(renders.get('a')).toBe(1)
    expect(renders.get('c')).toBe(1)
  })
})
