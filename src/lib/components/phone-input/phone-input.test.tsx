import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@uidotdev/usehooks', () => ({ useMediaQuery: () => false }))
vi.mock('../sheet', () => ({ Sheet: () => null, SheetContent: () => null, SheetHeader: () => null, SheetTitle: () => null, SheetTrigger: () => null }))
vi.mock('../elastic-scroll-area', () => ({ ElasticScrollArea: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }))
// Keep the real phone formatter and picker; isolate visual theme/input wrappers.
vi.mock('../input', () => ({
  Input: React.forwardRef<HTMLInputElement, any>(({ startContent, value, onChange, placeholder, onFocusCapture, onBlurCapture }, ref) => (
    <div>{startContent}<input ref={ref} value={value} onChange={onChange} placeholder={placeholder} onFocusCapture={onFocusCapture} onBlurCapture={onBlurCapture} /></div>
  )),
}))

import { PhoneInput } from './index'

afterEach(cleanup)
const picker = (country: string, code: string) => screen.getByRole('button', { name: `${country} +${code}` })

describe('PhoneInput country restoration', () => {
  it('infers the initial country from an international saved number without emitting changes', () => {
    const onValueChange = vi.fn(), onCountryChange = vi.fn()
    render(<PhoneInput value="+201012345678" defaultCountry="US" onValueChange={onValueChange} onCountryChange={onCountryChange} />)
    expect(picker('EG', '20')).toBeTruthy()
    expect(onValueChange).not.toHaveBeenCalled()
    expect(onCountryChange).not.toHaveBeenCalled()
  })

  it('updates when asynchronous data arrives or a different record is loaded', () => {
    const { rerender } = render(<PhoneInput defaultCountry="US" />)
    expect(picker('US', '1')).toBeTruthy()
    rerender(<PhoneInput value="+201012345678" defaultCountry="US" />)
    expect(picker('EG', '20')).toBeTruthy()
    rerender(<PhoneInput value="+966501234567" defaultCountry="US" />)
    expect(picker('SA', '966')).toBeTruthy()
  })

  it('honors a controlled country over inferred country', () => {
    const { rerender } = render(<PhoneInput country="US" value="+201012345678" />)
    expect(picker('US', '1')).toBeTruthy()
    rerender(<PhoneInput country="SA" value="+201012345678" />)
    expect(picker('SA', '966')).toBeTruthy()
  })

  it.each([undefined, '', '01012345678', '+', '+999123'])('uses the fallback for an unidentifiable initial value %s', value => {
    render(<PhoneInput value={value} defaultCountry="EG" />)
    expect(picker('EG', '20')).toBeTruthy()
  })

  it('keeps the selected country when the number is cleared', () => {
    const { rerender } = render(<PhoneInput value="+201012345678" />)
    rerender(<PhoneInput value="" />)
    expect(picker('EG', '20')).toBeTruthy()
  })

  it('distinguishes countries sharing a calling code', () => {
    render(<PhoneInput value="+14165551234" defaultCountry="US" />)
    expect(picker('CA', '1')).toBeTruthy()
  })

  it('does not reset a manual picker choice on an unchanged value', () => {
    const onCountryChange = vi.fn()
    const { rerender } = render(<PhoneInput value="+966501234567" onCountryChange={onCountryChange} />)
    fireEvent.click(picker('SA', '966'))
    fireEvent.click(screen.getByRole('button', { name: /Egypt/ }))
    expect(picker('EG', '20')).toBeTruthy()
    rerender(<PhoneInput value="+966501234567" onCountryChange={onCountryChange} />)
    expect(picker('EG', '20')).toBeTruthy()
    expect(onCountryChange).toHaveBeenCalledWith('EG')
  })
})
