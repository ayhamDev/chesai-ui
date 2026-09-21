import React, { useState } from 'react'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Combobox } from './index'
import { Select } from '../select'
import { Dialog, DialogContent, DialogTitle } from '../dialog'

vi.mock('@uidotdev/usehooks', () => ({ useMediaQuery: () => false }))
const options = Array.from({ length: 20 }, (_, i) => ({ value: String(i + 1), label: `Option ${i + 1}` }))
const originalScrollIntoView = Element.prototype.scrollIntoView

beforeEach(() => {
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
