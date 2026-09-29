import React from 'react'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { Messenger } from './Messenger'

vi.mock('../../lib/hooks/useRipple', () => ({ default: () => [null, vi.fn()] }))
vi.mock('@uidotdev/usehooks', () => ({ useMediaQuery: () => true }))
beforeEach(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  )
  vi.stubGlobal('matchMedia', () => ({
    matches: false,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
  }))
})
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

it('preserves drafts per conversation and sends only into the active chat', async () => {
  render(<Messenger />)
  fireEvent.change(screen.getByRole('textbox', { name: 'Message' }), {
    target: { value: 'A draft for Jenny' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Open Bessie Cooper' }))
  expect((screen.getByRole('textbox', { name: 'Message' }) as HTMLTextAreaElement).value).toBe('')
  fireEvent.change(screen.getByRole('textbox', { name: 'Message' }), { target: { value: 'Hello Bessie' } })
  fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
  expect(within(screen.getByRole('log')).getByText('Hello Bessie')).toBeTruthy()
  expect((screen.getByRole('textbox', { name: 'Message' }) as HTMLTextAreaElement).value).toBe('')
  fireEvent.click(screen.getByRole('button', { name: 'Open Jenny Wilson' }))
  expect((screen.getByRole('textbox', { name: 'Message' }) as HTMLTextAreaElement).value).toBe('A draft for Jenny')
  expect(within(screen.getByRole('log')).queryByText('Hello Bessie')).toBeNull()
  fireEvent.keyDown(screen.getByRole('textbox', { name: 'Message' }), { key: 'Enter' })
  await waitFor(() => expect(within(screen.getByRole('log')).getByText('A draft for Jenny')).toBeTruthy())
})

it('has a recoverable empty search and disables sending whitespace', () => {
  render(<Messenger />)
  fireEvent.change(screen.getByRole('textbox', { name: 'Search messages' }), { target: { value: 'no-such-person' } })
  expect(screen.getByText('No conversations found')).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Clear search and filters' }))
  expect(screen.getByRole('button', { name: 'Open Jenny Wilson' })).toBeTruthy()
  fireEvent.change(screen.getByRole('textbox', { name: 'Message' }), { target: { value: '   ' } })
  expect((screen.getByRole('button', { name: 'Send message' }) as HTMLButtonElement).disabled).toBe(true)
})

it('does not send during IME composition or when entering a newline', () => {
  render(<Messenger />)
  const input = screen.getByRole('textbox', { name: 'Message' })
  fireEvent.change(input, { target: { value: 'Still composing' } })
  fireEvent.keyDown(input, { key: 'Enter', isComposing: true })
  expect(within(screen.getByRole('log')).queryByText('Still composing')).toBeNull()
  fireEvent.keyDown(input, { key: 'Enter', shiftKey: true })
  expect(within(screen.getByRole('log')).queryByText('Still composing')).toBeNull()
  fireEvent.keyDown(input, { key: 'Enter' })
  expect(within(screen.getByRole('log')).getByText('Still composing')).toBeTruthy()
})
