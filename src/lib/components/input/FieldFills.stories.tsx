import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Flex } from '../layouts'
import { Typography } from '../typography'
import { Button } from '../button'
import { Checkbox } from '../checkbox'
import { Composer } from '../composer'
import { Switch } from '../switch'
import { Slider } from '../slider'
import { ColorPicker } from '../color-picker'
import { RadioGroup, RadioGroupItem } from '../radio-group'
import { Dropzone } from '../dropzone'
import { Input } from './index'
import { Textarea } from '../textarea'
import { NumberInput } from '../number-input'
import { PhoneInput } from '../phone-input'
import { DateInput, TimeInput, DurationInput } from '../date-input'
import { DatePicker } from '../date-picker/date-picker'
import { TimePicker } from '../time-picker'
import { Select } from '../select'
import { MultiSelect } from '../multi-select'
import { Combobox } from '../combobox'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../otp-field'

const options = [
  { value: 'design', label: 'Design' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'operations', label: 'Operations' },
]

function FieldFills() {
  const [disableHover, setDisableHover] = useState(false)
  const [variant, setVariant] = useState<'filled' | 'filled-inverted'>('filled-inverted')
  return (
    <Flex disableAnimatePresence direction="column" className="max-w-6xl mx-auto p-6 text-on-surface">
      <Flex disableAnimatePresence className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <Flex disableAnimatePresence direction="column">
          <Typography variant="headline-small">Input field fills</Typography>
          <Typography variant="body-medium" className="text-on-surface-variant">Hover over each field and its controls to compare the fill treatments.</Typography>
        </Flex>
        <Flex disableAnimatePresence className="flex gap-2">
          {(['filled', 'filled-inverted'] as const).map(value => (
            <Button key={value} type="button" aria-pressed={variant === value}
              onClick={() => setVariant(value)} variant={variant === value ? 'primary' : 'outline'}>
              {value === 'filled' ? 'Filled' : 'Filled inverted'}
            </Button>
          ))}
        </Flex>
      </Flex>
      <Checkbox label="Disable input hover effects" checked={disableHover} onChange={event => setDisableHover(event.target.checked)} />
      <Flex disableAnimatePresence className="!grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
        <Input disableHover={disableHover} label="Email" type="email" variant={variant} labelPlacement="outside" placeholder="you@example.com" />
        <NumberInput disableHover={disableHover} label="Quantity" variant={variant} labelPlacement="outside" defaultValue={3} />
        <PhoneInput disableHover={disableHover} label="Phone number" variant={variant} defaultCountry="US" />
        <DateInput disableHover={disableHover} label="Date" variant={variant} labelPlacement="outside" />
        <TimeInput disableHover={disableHover} label="Time" variant={variant} labelPlacement="outside" />
        <DurationInput disableHover={disableHover} label="Duration" variant={variant} labelPlacement="outside" />
        <Select disableHover={disableHover} label="Department" items={options} variant={variant} labelPlacement="outside" />
        <MultiSelect disableHover={disableHover} label="Teams" options={options} variant={variant} labelPlacement="outside" />
        <Combobox disableHover={disableHover} label="Search departments" options={options} variant={variant} labelPlacement="outside" />
        <DatePicker disableHover={disableHover} label="Date picker" inputVariant={variant} />
        <TimePicker disableHover={disableHover} label="Time picker" inputVariant={variant} />
        <Flex disableAnimatePresence direction="column" gap="xs">
          <Typography variant="body-small" className="text-on-surface-variant">Verification code</Typography>
          <InputOTP disableHover={disableHover} aria-label="Verification code" maxLength={4} variant={variant}>
            <InputOTPGroup>{[0, 1, 2, 3].map(index => <InputOTPSlot key={index} index={index} />)}</InputOTPGroup>
          </InputOTP>
        </Flex>
        <Textarea disableHover={disableHover} label="Notes" variant={variant} labelPlacement="outside" placeholder="Add a note" />
        <Composer aria-label="Composer" placeholder="Add lines to test expansion..." maxRows={4} variant={variant} disableHover={disableHover} />
        <ColorPicker label="Color" disableHover={disableHover} />
        <Checkbox label="Notifications" disableHover={disableHover} />
        <Switch label="Available" disableHover={disableHover} />
        <RadioGroup label="Priority" disableHover={disableHover}><RadioGroupItem label="Normal" value="normal" /><RadioGroupItem label="High" value="high" /></RadioGroup>
        <Slider aria-label="Volume" defaultValue={[40]} withLabel disableHover={disableHover} />
        <Dropzone label="Attachments" onDrop={() => {}} disableHover={disableHover} />
      </Flex>
    </Flex>
  )
}

const meta = { title: 'Showcase/Input field fills', component: FieldFills, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof FieldFills>
export default meta
type Story = StoryObj<typeof meta>
export const AllFields: Story = {}
