import React from 'react'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot, type InputOTPProps } from './index'

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

it('preserves entered digits and focus when changing grouped spacing or separated mode', () => {
  function Example({ gap, separated }: Pick<InputOTPProps, 'gap' | 'separated'>) {
    return <InputOTP maxLength={4} gap={gap} separated={separated} aria-label="Code">
      <InputOTPGroup>{[0, 1, 2, 3].map(index => <InputOTPSlot key={index} index={index} data-testid={`digit-${index}`} />)}</InputOTPGroup>
    </InputOTP>
  }
  const { rerender } = render(<Example gap="none" />)
  const input = screen.getByRole('textbox') as HTMLInputElement
  act(() => input.focus())
  fireEvent.change(input, { target: { value: '123' } })
  for (const gap of ['xs', 'sm', 'md', 'lg', 'none'] as const) {
    rerender(<Example gap={gap} />)
    expect(screen.getByRole('textbox')).toBe(input)
    expect(document.activeElement).toBe(input)
    expect(input.value).toBe('123')
    expect(screen.getByTestId('digit-2').textContent).toBe('3')
    expect(input.hasAttribute('gap')).toBe(false)
  }
  rerender(<Example separated gap="lg" />)
  expect(screen.getByRole('textbox')).toBe(input)
  expect(input.value).toBe('123')
  fireEvent.change(input, { target: { value: '1234' } })
  expect(screen.getByTestId('digit-3').textContent).toBe('4')
})

it('keeps one input and completion across groups with independent layout overrides', () => {
  const complete = vi.fn()
  render(<InputOTP maxLength={4} gap="none" shape="full" onComplete={complete} aria-label="Code">
    <InputOTPGroup data-testid="joined"><InputOTPSlot index={0} /><InputOTPSlot index={1} /></InputOTPGroup>
    <InputOTPSeparator />
    <InputOTPGroup gap="md" shape="minimal" activeShape="full" data-testid="gapped"><InputOTPSlot index={2} /><InputOTPSlot index={3} /></InputOTPGroup>
  </InputOTP>)
  expect(screen.getAllByRole('textbox')).toHaveLength(1)
  fireEvent.change(screen.getByRole('textbox'), { target: { value: '9876' } })
  expect(screen.getByTestId('joined').textContent).toBe('98')
  expect(screen.getByTestId('gapped').textContent).toBe('76')
  expect(screen.getByTestId('joined').getAttribute('data-gap')).toBe('none')
  expect(screen.getByTestId('gapped').getAttribute('data-gap')).toBe('md')
  expect(screen.getByTestId('gapped').getAttribute('data-separated')).toBe('false')
  expect(complete).toHaveBeenCalledWith('9876')
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
