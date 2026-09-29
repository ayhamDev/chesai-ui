import React from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { InputOTP, InputOTPGroup, InputOTPSlot } from './index'

beforeEach(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  )
  document.elementFromPoint = vi.fn()
})
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

it('supports typing and completion in spaced slots without separator elements', () => {
  const complete = vi.fn()
  render(
    <InputOTP maxLength={4} separated shape="minimal" onComplete={complete} aria-label="Verification code">
      <InputOTPGroup data-testid="group">
        {[0, 1, 2, 3].map(index => (
          <InputOTPSlot key={index} index={index} data-testid={`slot-${index}`} />
        ))}
      </InputOTPGroup>
    </InputOTP>,
  )
  fireEvent.change(screen.getByRole('textbox'), { target: { value: '1234' } })
  expect(complete).toHaveBeenCalledWith('1234')
  expect(screen.getByTestId('group').className).toContain('gap-2')
  expect(screen.queryByRole('separator')).toBeNull()
  for (let index = 0; index < 4; index++) {
    expect(screen.getByTestId(`slot-${index}`).textContent).toBe(String(index + 1))
    expect(screen.getByTestId(`slot-${index}`).className).toContain('rounded-2xl')
    expect(screen.getByTestId(`slot-${index}`).className).not.toContain('first:rounded')
  }
})
