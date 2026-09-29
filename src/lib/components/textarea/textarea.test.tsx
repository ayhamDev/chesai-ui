import React from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { Textarea } from './index'

beforeEach(() => {
  vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} })
  vi.spyOn(HTMLTextAreaElement.prototype, 'scrollHeight', 'get').mockImplementation(function (this: HTMLTextAreaElement) {
    // Model the default two-row height when height:auto is used for measurement.
    const content = this.value.split('\n').length * 20 + 8
    return this.style.height === '0px' ? content : Math.max(48, content)
  })
})
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals() })

it('starts at one row, grows to the limit, and shrinks after clearing', () => {
  const props = {
    'aria-label': 'Message', minRows: 1, maxRows: 3,
    style: { lineHeight: '20px', padding: '4px', border: '1px solid', boxSizing: 'border-box' as const },
  }
  const { rerender } = render(<Textarea {...props} value="" />)
  const input = screen.getByRole('textbox')
  expect(input.style.height).toBe('30px')
  rerender(<Textarea {...props} value={'one\ntwo\nthree\nfour'} />)
  expect(input.style.height).toBe('70px')
  expect(input.style.overflowY).toBe('auto')
  rerender(<Textarea {...props} value="" />)
  expect(input.style.height).toBe('30px')
  expect(input.style.overflowY).toBe('hidden')
})

it('leaves sizing to the caller when autosizing is disabled', () => {
  render(<Textarea aria-label="Message" disableAutosize style={{ height: '90px' }} />)
  expect(screen.getByRole('textbox').style.height).toBe('90px')
})
