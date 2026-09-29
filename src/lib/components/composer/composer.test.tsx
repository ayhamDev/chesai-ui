import React from 'react'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { Composer } from './index'

beforeEach(() => {
  vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} })
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(400)
  vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockReturnValue(40)
  vi.spyOn(HTMLTextAreaElement.prototype, 'scrollHeight', 'get').mockImplementation(function (this: HTMLTextAreaElement) {
    const columns = Math.max(1, Math.floor((Number.parseFloat(this.style.width) || 400) / 8))
    return this.value.split('\n').reduce((rows, line) => rows + Math.max(1, Math.ceil(line.length / columns)), 0) * 24
  })
})
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals() })

it('makes the surface focus outline opt-in and uses explicit CSS sizing transitions', () => {
  const { container, rerender } = render(<Composer aria-label="Draft" />)
  expect(container.firstElementChild?.className).not.toContain('has-[textarea:focus-visible]:ring-2')
  const body = container.querySelector('[data-slot="composer-body"]') as HTMLElement
  expect(body.style.transition).toContain('height 320ms')
  rerender(<Composer aria-label="Draft" focusOutline transitionDuration={450} />)
  expect(container.firstElementChild?.className).toContain('has-[textarea:focus-visible]:ring-2')
  expect(body.style.transition).toContain('height 450ms')
  expect(screen.getByRole('textbox').hasAttribute('focusOutline')).toBe(false)
})

it('grows and shrinks without remounting the editor or composed controls', () => {
  const ref = React.createRef<HTMLTextAreaElement>()
  const { container } = render(<Composer ref={ref} aria-label="Draft" maxRows={3} endContent={<button>Custom action</button>} />)
  const field = screen.getByRole('textbox') as HTMLTextAreaElement
  const action = screen.getByRole('button')
  act(() => field.focus())
  fireEvent.change(field, { target: { value: 'one\ntwo\nthree\nfour' } })
  expect(container.firstElementChild?.getAttribute('data-layout')).toBe('stacked')
  expect(field.style.height).toBe('76px')
  expect(ref.current).toBe(field)
  expect(document.activeElement).toBe(field)
  expect(screen.getByRole('button')).toBe(action)
  fireEvent.change(field, { target: { value: 'one' } })
  expect(container.firstElementChild?.getAttribute('data-layout')).toBe('inline')
  expect(field.style.height).toBe('28px')
})

it('measures wrapping at compact width without oscillating after gaining a full row', () => {
  const { container, rerender } = render(<Composer aria-label="Draft" value={'a'.repeat(45)} />)
  expect(container.firstElementChild?.getAttribute('data-layout')).toBe('stacked')
  rerender(<Composer aria-label="Draft" value={'a'.repeat(45)} />)
  expect(container.firstElementChild?.getAttribute('data-layout')).toBe('stacked')
})

it('supports controlled values and leaves keyboard/IME policy to the app', () => {
  const changed = vi.fn(), key = vi.fn()
  const { rerender } = render(<Composer aria-label="Draft" value="Original" onValueChange={changed} onKeyDown={key} name="draft" />)
  const field = screen.getByRole('textbox') as HTMLTextAreaElement
  fireEvent.change(field, { target: { value: 'Edited' } })
  expect(changed).toHaveBeenCalledWith('Edited')
  expect(field.value).toBe('Original')
  const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true, isComposing: true })
  field.dispatchEvent(event)
  expect(key).toHaveBeenCalled()
  expect(event.defaultPrevented).toBe(false)
  rerender(<Composer aria-label="Draft" value="Accepted" />)
  expect(field.value).toBe('Accepted')
})

it('keeps focus expansion while interacting with a supplied control', () => {
  const { container } = render(<Composer aria-label="Draft" expandOn="focus" endContent={<button>Options</button>} />)
  fireEvent.focus(screen.getByRole('textbox'))
  expect(container.firstElementChild?.getAttribute('data-layout')).toBe('stacked')
  fireEvent.blur(screen.getByRole('textbox'), { relatedTarget: screen.getByRole('button') })
  expect(container.firstElementChild?.getAttribute('data-layout')).toBe('stacked')
  fireEvent.blur(screen.getByRole('button'), { relatedTarget: null })
  expect(container.firstElementChild?.getAttribute('data-layout')).toBe('inline')
})

it('supports manual expansion and native form reset without triggering actions', async () => {
  const { rerender } = render(<form aria-label="Form"><Composer aria-label="Draft" defaultValue="Initial" expanded expandedRows={10} /></form>)
  const field = screen.getByRole('textbox') as HTMLTextAreaElement
  expect(field.style.height).toBe('244px')
  fireEvent.change(field, { target: { value: 'Changed' } })
  fireEvent.reset(screen.getByRole('form'))
  await waitFor(() => expect(field.value).toBe('Initial'))
  rerender(<form aria-label="Form"><Composer aria-label="Draft" defaultValue="Initial" expanded={false} /></form>)
  expect(field.style.height).toBe('28px')
})

it('omits false content slots and preserves native disabled, readonly and accessible attributes', () => {
  const { container, rerender } = render(<Composer aria-label="Draft" aria-describedby="help" disabled isInvalid topContent={false} bottomContent={false} />)
  const field = screen.getByRole('textbox') as HTMLTextAreaElement
  expect(field.disabled).toBe(true)
  expect(field.getAttribute('aria-invalid')).toBe('true')
  expect(field.getAttribute('aria-describedby')).toBe('help')
  expect(container.querySelector('[data-slot="composer-top"]')).toBeNull()
  expect(container.querySelector('[data-slot="composer-bottom"]')).toBeNull()
  rerender(<Composer aria-label="Draft" readOnly value="Selectable text" />)
  expect(field.readOnly).toBe(true)
  expect(field.value).toBe('Selectable text')
})

it('waits for an outside click to complete before collapsing focus layout', async () => {
  const clicked = vi.fn()
  const { container } = render(<><Composer aria-label="Draft" expandOn="focus" /><button onClick={clicked}>Outside</button></>)
  const field = screen.getByRole('textbox')
  const outside = screen.getByRole('button')
  fireEvent.focus(field)
  fireEvent.pointerDown(outside)
  fireEvent.blur(field, { relatedTarget: outside })
  expect(container.firstElementChild?.getAttribute('data-layout')).toBe('stacked')
  fireEvent.pointerUp(outside)
  fireEvent.click(outside)
  expect(clicked).toHaveBeenCalledOnce()
  await waitFor(() => expect(container.firstElementChild?.getAttribute('data-layout')).toBe('inline'))
})


it('hides the scrollbar throughout uncapped growth, and restores scrolling only above the row limit', () => {
  const { rerender } = render(<Composer aria-label="Draft" maxRows={3} disableHover />)
  const field = screen.getByRole('textbox') as HTMLTextAreaElement
  expect(field.style.overflowY).toBe('hidden')
  for (const value of ['one\ntwo', 'one\ntwo\nthree']) {
    fireEvent.change(field, { target: { value } })
    expect(field.style.overflowY).toBe('hidden')
  }
  fireEvent.change(field, { target: { value: 'one\ntwo\nthree\nfour' } })
  expect(field.style.overflowY).toBe('auto')
  rerender(<Composer aria-label="Draft" maxRows={3} expanded expandedRows={8} />)
  expect(field.style.overflowY).toBe('hidden')
  rerender(<Composer aria-label="Draft" maxRows={3} />)
  expect(field.style.overflowY).toBe('auto')
  fireEvent.change(field, { target: { value: 'one' } })
  expect(field.style.overflowY).toBe('hidden')
})
