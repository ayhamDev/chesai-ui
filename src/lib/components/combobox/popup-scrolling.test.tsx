import React, { useState } from 'react'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Combobox } from './index'
import { Select } from '../select'
import { Dialog, DialogContent, DialogTitle } from '../dialog'

vi.mock('@uidotdev/usehooks', () => ({
  useMediaQuery: (query: string) => query === '(min-width: 768px)',
}))
const options = Array.from({ length: 20 }, (_, i) => ({ value: String(i + 1), label: `Option ${i + 1}` }))
const originalScrollIntoView = Element.prototype.scrollIntoView

beforeEach(() => {
  vi.stubGlobal('matchMedia', vi.fn((query: string) => ({
    matches: query === '(min-width: 768px)',
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })))
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  )
  Element.prototype.scrollIntoView = vi.fn()
})
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  Element.prototype.scrollIntoView = originalScrollIntoView
})

describe('popup scrolling integration', () => {
  it('observes the pagination sentinel inside the actual scroll viewport', async () => {
    const observe = vi.fn()
    const disconnect = vi.fn()
    let notify: (entries: { isIntersecting: boolean }[]) => void = () => {}
    let observerRoot: Element | Document | null | undefined
    vi.stubGlobal('IntersectionObserver', class {
      constructor(callback: typeof notify, config: IntersectionObserverInit) {
        notify = callback
        observerRoot = config.root
      }
      observe = observe
      disconnect = disconnect
    })
    const onLoadMore = vi.fn()
    const { unmount } = render(<Combobox label="Remote" options={options} hasMore onLoadMore={onLoadMore} />)
    expect(observe).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: /Remote/ }))
    await screen.findByPlaceholderText('Search...')
    expect(observerRoot).toBe(document.querySelector('[data-radix-scroll-area-viewport]'))
    expect(observe).toHaveBeenCalled()
    notify([{ isIntersecting: false }])
    expect(onLoadMore).not.toHaveBeenCalled()
    notify([{ isIntersecting: true }])
    notify([{ isIntersecting: true }])
    expect(onLoadMore).toHaveBeenCalledTimes(1)
    unmount()
    expect(disconnect).toHaveBeenCalled()
  })

  it.each([false, true])('uses server results without local filtering (sheet=%s)', async forceMobileLayout => {
    const onSearchChange = vi.fn()
    const { rerender } = render(<Combobox label="Remote" options={options} forceMobileLayout={forceMobileLayout} shouldFilter={false} onSearchChange={onSearchChange} />)
    const trigger = screen.getByRole('button', { name: /Remote/ })
    fireEvent.click(trigger)
    fireEvent.change(await screen.findByPlaceholderText('Search...'), { target: { value: 'synonym' } })
    expect(onSearchChange).toHaveBeenCalledWith('synonym')
    const resultRole = forceMobileLayout ? 'button' : 'option'
    fireEvent.click(screen.getByRole(resultRole, { name: 'Option 20' }))
    rerender(<Combobox label="Remote" options={[]} forceMobileLayout={forceMobileLayout} shouldFilter={false} onSearchChange={onSearchChange} />)
    expect(trigger.textContent).toContain('Option 20')
  })

  it.each([false, true])('loads pages near the scroll boundary and blocks duplicate requests (sheet=%s)', async forceMobileLayout => {
    const onLoadMore = vi.fn()
    const props = { label: 'Remote', options, forceMobileLayout, hasMore: true, onLoadMore }
    const { rerender } = render(<Combobox {...props} />)
    fireEvent.click(screen.getByRole('button', { name: /Remote/ }))
    await screen.findByPlaceholderText('Search...')
    const viewport = document.querySelector('[data-radix-scroll-area-viewport]')!
    Object.defineProperties(viewport, {
      scrollHeight: { configurable: true, value: 1000 },
      clientHeight: { configurable: true, value: 200 },
      scrollTop: { configurable: true, writable: true, value: 0 },
    })
    fireEvent.scroll(viewport)
    expect(onLoadMore).not.toHaveBeenCalled()
    viewport.scrollTop = 750
    fireEvent.scroll(viewport)
    fireEvent.scroll(viewport)
    expect(onLoadMore).toHaveBeenCalledTimes(1)
    rerender(<Combobox {...props} isLoading />)
    expect(screen.getByRole('status').textContent).toBe('Loading...')
    fireEvent.scroll(viewport)
    expect(onLoadMore).toHaveBeenCalledTimes(1)
    rerender(<Combobox {...props} options={[...options, { value: '21', label: 'Option 21' }]} />)
    fireEvent.scroll(viewport)
    expect(onLoadMore).toHaveBeenCalledTimes(2)
    rerender(<Combobox {...props} hasMore={false} />)
    fireEvent.scroll(viewport)
    expect(onLoadMore).toHaveBeenCalledTimes(2)
  })

  it.each(['select', 'combobox'] as const)('customizes the %s sheet independently of its input', async component => {
    const sheetProps = { mode: 'detached', shape: 'sharp', variant: 'secondary', glass: true } as const
    render(component === 'select'
      ? <Select items={options} label="Choose" shape="full" forceMobileLayout sheetProps={sheetProps} />
      : <Combobox options={options} label="Choose" shape="full" forceMobileLayout sheetProps={sheetProps} />)
    fireEvent.click(screen.getByRole('button', { name: /Choose/ }))
    const sheet = await screen.findByRole('dialog')
    expect(sheet.classList.contains('bottom-4')).toBe(true)
    expect(sheet.classList.contains('rounded-none')).toBe(true)
    expect(sheet.classList.contains('bg-surface-container-highest/50')).toBe(true)
    expect(sheet.classList.contains('backdrop-blur-2xl')).toBe(true)
  })

  it.each(['select', 'combobox'] as const)('opens %s as a bottom sheet on desktop when requested', async component => {
    const onChange = vi.fn()
    render(component === 'select'
      ? <Select items={options} label="Choose" forceMobileLayout onValueChange={onChange} />
      : <Combobox options={options} label="Choose" forceMobileLayout onValueChange={onChange} />)
    const trigger = screen.getByRole('button', { name: /Choose/ })
    fireEvent.click(trigger)
    const sheet = await screen.findByRole('dialog')
    expect(sheet.getAttribute('data-vaul-drawer-direction')).toBe('bottom')
    fireEvent.change(screen.getByPlaceholderText('Search...'), { target: { value: 'Option 20' } })
    expect(screen.queryByRole('button', { name: 'Option 1' })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Option 20' }))
    expect(onChange).toHaveBeenCalledWith('20')
    await waitFor(() => expect(trigger.textContent).toContain('Option 20'))
    await waitFor(() => expect(trigger.getAttribute('aria-expanded')).toBe('false'))
  })

  it('keeps ComboBox search focus inside a dialog and restores its stable trigger', async () => {
    function Example() {
      const [value, setValue] = useState('')
      return (
        <Dialog open onOpenChange={() => {}}>
          <DialogContent aria-describedby={undefined}>
            <DialogTitle>Form</DialogTitle>
            <Combobox
              label="Framework"
              options={options}
              value={value}
              onValueChange={setValue}
              mobileLayout="default"
            />
          </DialogContent>
        </Dialog>
      )
    }
    render(<Example />)
    const trigger = await screen.findByRole('button', { name: /Framework/ })
    fireEvent.click(trigger)
    const search = await screen.findByPlaceholderText('Search...')
    await waitFor(() => expect(document.activeElement).toBe(search))
    fireEvent.change(search, { target: { value: 'Option 20' } })
    fireEvent.click(await screen.findByRole('option', { name: 'Option 20' }))
    await waitFor(() => expect(trigger.textContent).toContain('Option 20'))
    expect(screen.getByRole('button', { name: /Framework/ })).toBe(trigger)
    await waitFor(() => expect(document.activeElement).toBe(trigger))
  })

  it.each([
    'popper',
    'item-aligned',
  ] as const)("composes Select's %s viewport with ElasticScrollArea and preserves keyboard selection", async position => {
    const onChange = vi.fn()
    render(
      <Select items={options} label="Choose" position={position} onValueChange={onChange} mobileLayout="default" />,
    )
    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'ArrowDown' })
    const first = await screen.findByRole('option', { name: 'Option 1' })
    const viewport = document.querySelector('[data-radix-select-viewport]')
    expect(viewport?.hasAttribute('data-radix-scroll-area-viewport')).toBe(true)
    expect(document.querySelectorAll('[data-radix-scroll-area-viewport]')).toHaveLength(1)
    fireEvent.keyDown(first, { key: 'End' })
    const last = screen.getByRole('option', { name: 'Option 20' })
    await waitFor(() => expect(document.activeElement).toBe(last))
    fireEvent.keyDown(last, { key: 'Enter' })
    expect(onChange).toHaveBeenCalledWith('20')
  })
})
