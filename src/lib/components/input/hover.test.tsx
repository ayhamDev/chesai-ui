import React from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { Input } from './index'
import { Textarea } from '../textarea'
import { NumberInput } from '../number-input'
import { PhoneInput } from '../phone-input'
import { DateInput, TimeInput, DurationInput } from '../date-input'
import { Select } from '../select'
import { MultiSelect } from '../multi-select'
import { Combobox } from '../combobox'
import { DatePicker } from '../date-picker/date-picker'
import { TimePicker } from '../time-picker'
import { ColorPicker } from '../color-picker'
import { Checkbox } from '../checkbox'
import { RadioGroup, RadioGroupItem } from '../radio-group'
import { Switch } from '../switch'
import { Slider } from '../slider'
import { Dropzone } from '../dropzone'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../otp-field'
vi.mock('@uidotdev/usehooks', () => ({ useMediaQuery: () => false }))
beforeEach(() => {
  vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} })
  vi.stubGlobal('matchMedia', () => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} }))
})
afterEach(() => { cleanup(); vi.unstubAllGlobals() })
const examples = {
  Input: <Input label="Name" isClearable defaultValue="Alex" />,
  Textarea: <Textarea label="Notes" />,
  NumberInput: <NumberInput label="Quantity" />,
  PhoneInput: <PhoneInput label="Phone" defaultCountry="US" />,
  DateInput: <DateInput label="Date" />,
  TimeInput: <TimeInput label="Time" />,
  DurationInput: <DurationInput label="Duration" />,
  Select: <Select label="Select" items={[]} />,
  MultiSelect: <MultiSelect label="Multi" options={[]} />,
  Combobox: <Combobox label="Combo" options={[]} />,
  DatePicker: <DatePicker label="Date picker" />,
  TimePicker: <TimePicker label="Time picker" />,
  ColorPicker: <ColorPicker label="Color" />,
  Checkbox: <Checkbox label="Check" />,
  RadioGroup: <RadioGroup label="Group"><RadioGroupItem label="One" value="one" /></RadioGroup>,
  RadioGroupItem: <RadioGroupItem label="Radio" />,
  Switch: <Switch label="Switch" />,
  Slider: <Slider aria-label="Slider" />,
  Dropzone: <Dropzone onDrop={() => {}} />,
  InputOTP: <InputOTP maxLength={2}><InputOTPGroup><InputOTPSlot index={0} /><InputOTPSlot index={1} /></InputOTPGroup></InputOTP>,
}
it.each(Object.entries(examples))('%s enables and disables hover without leaking a native attribute', (_, element) => {
  const { container, rerender } = render(element)
  expect(container.querySelector('[data-disable-hover="true"]')).toBeNull()
  rerender(React.cloneElement(element, { disableHover: true }))
  expect(container.querySelector('[data-disable-hover="true"]')).not.toBeNull()
  expect(container.querySelector('[disablehover]')).toBeNull()
  rerender(React.cloneElement(element, { disableHover: false }))
  expect(container.querySelector('[data-disable-hover="true"]')).toBeNull()
})
it('keeps typing and check actions available with hover disabled', () => {
  const change = vi.fn(), toggle = vi.fn()
  render(<><Input aria-label="Name" disableHover onValueChange={change} /><Checkbox label="Check" disableHover onChange={toggle} /></>)
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Alex' } })
  expect(change).toHaveBeenCalledWith('Alex')
  fireEvent.click(screen.getByRole('checkbox'))
  expect(toggle).toHaveBeenCalledOnce()
})
