import React from 'react'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
const preference = vi.hoisted(() => ({ reduced: false }))
vi.mock('framer-motion', () => ({ useReducedMotion: () => preference.reduced }))
import { ButtonGroup } from './index'
afterEach(() => { cleanup(); preference.reduced = false })
const setup = (props = {}) => {
  render(<ButtonGroup {...props}><button>A</button><button>B</button><button>C</button></ButtonGroup>)
  const buttons = screen.getAllByRole('button')
  buttons.forEach(button => Object.defineProperty(button, 'offsetWidth', { configurable: true, get: () => parseFloat(button.style.width) || 100 }))
  return buttons
}
describe('ButtonGroup expressive presses', () => {
  it('borrows equally from immediate neighbors and restores on key release', async () => {
    const buttons = setup()
    fireEvent.keyDown(buttons[1], { key: ' ' })
    expect(buttons.map(b => parseFloat(b.style.width))).toEqual([92.5, 115, 92.5])
    fireEvent.keyUp(window, { key: ' ' })
    await waitFor(() => expect(buttons.map(b => b.style.width)).toEqual(['', '', '']))
  })
  it('compresses only the adjacent button for an end press', async () => {
    const buttons = setup({ dir: 'rtl' })
    fireEvent.keyDown(buttons[0], { key: 'Enter' })
    expect(buttons.map(b => parseFloat(b.style.width))).toEqual([115, 85, 100])
    fireEvent.blur(window)
    await waitFor(() => expect(buttons[0].style.width).toBe(''))
  })
  it('does not animate under reduced motion or when opted out', () => {
    preference.reduced = true
    const buttons = setup()
    fireEvent.keyDown(buttons[0], { key: 'Enter' })
    expect(buttons[0].style.width).toBe('')
  })
  it('preserves consumer handlers and respects prevented presses', () => {
    const handler = vi.fn(event => event.preventDefault())
    const buttons = setup({ onKeyDownCapture: handler })
    fireEvent.keyDown(buttons[0], { key: 'Enter' })
    expect(handler).toHaveBeenCalledOnce()
    expect(buttons[0].style.width).toBe('')
  })
  it('honors disabled buttons', () => {
    const buttons = setup()
    buttons[0].setAttribute('disabled', '')
    fireEvent.keyDown(buttons[0], { key: 'Enter' })
    expect(buttons[0].style.width).toBe('')
  })
})
