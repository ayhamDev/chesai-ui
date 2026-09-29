import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Package, Truck } from 'lucide-react'
import { Stepper, stepperColors } from './index'

type StepStyle = { color?: ComponentProps<typeof Stepper.Step>['color']; indicator?: Pick<ComponentProps<typeof Stepper.Indicator>, 'color' | 'foreground' | 'shape' | 'size'>; connector?: Pick<ComponentProps<typeof Stepper.Separator>, 'color' | 'variant' | 'shape' | 'size' | 'waveSize' | 'animated' | 'duration' | 'flowDirection'> }
type JourneyArgs = ComponentProps<typeof Stepper> & { step1: StepStyle; step2: StepStyle; step3: StepStyle; step4: StepStyle }
const stepDefaults = {
  step1: { color: 'secondary', indicator: { color: 'secondary', foreground: 'on-secondary', size: 'lg', shape: 'circle' }, connector: { color: 'primary', variant: 'solid', shape: 'regular', animated: false, duration: 1.2 } },
  step2: { color: 'tertiary', indicator: { color: 'tertiary-container', foreground: 'on-tertiary-container', size: 'lg', shape: 'square' }, connector: { color: 'tertiary', variant: 'dashed', shape: 'regular', animated: false, duration: 1.2 } },
  step3: { color: 'primary', indicator: { color: 'primary', foreground: 'on-primary', size: 'lg', shape: 'circle' }, connector: { color: 'secondary', variant: 'solid', shape: 'wavy', animated: true, duration: 1.2, waveSize: 'md', flowDirection: 'forward' } },
  step4: { color: 'outline', indicator: { color: 'surface-container', foreground: 'on-surface', size: 'lg', shape: 'circle' } },
} satisfies Pick<JourneyArgs, 'step1' | 'step2' | 'step3' | 'step4'>

const meta: Meta<JourneyArgs> = {
  title: 'Components/Feedback/Stepper/Delivery and Styling', component: Stepper, tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: { ...stepDefaults, currentStep: 2, orientation: 'horizontal', dir: 'ltr' },
  argTypes: {
    step1: { control: 'object', description: 'First milestone: independently edit indicator and outgoing connector.' },
    step2: { control: 'object', description: 'Second milestone: independently edit indicator and outgoing connector.' },
    step3: { control: 'object', description: 'Third milestone: independently edit indicator and outgoing connector.' },
    step4: { control: 'object', description: 'Final milestone appearance (no outgoing connector).' },
    currentStep: { control: { type: 'range', min: 0, max: 4, step: 1 } },
    orientation: { control: 'select', options: ['horizontal', 'vertical'] },
    dir: { control: 'select', options: ['ltr', 'rtl'] },
    color: { control: 'select', options: stepperColors },
  },
}
export default meta
type Story = StoryObj<JourneyArgs>
export const Delivery: Story = {
  render: args => {
    const { step1, step2, step3, step4, ...rootProps } = args
    const steps = [step1, step2, step3, step4]
    const rtl = args.dir === 'rtl'
    const labels = rtl ? ['تأكيد الطلب', 'تجهيز الشحنة', 'الشحنة في الطريق', 'تم التسليم'] : ['Order confirmed', 'Packed at warehouse', 'Out for delivery', 'Delivered']
    return <div className="p-6"><Stepper {...rootProps} aria-label={rtl ? 'تقدم الطلب' : 'Order progress'}>
      {labels.map((label, i) => <Stepper.Step key={label} color={steps[i].color} size="lg">
        <Stepper.Indicator {...steps[i].indicator} icon={i === 1 ? <Package size={18} /> : i === 2 ? <Truck size={18} /> : undefined} />
        <Stepper.Separator {...steps[i].connector} />
        <Stepper.Content><Stepper.Title>{label}</Stepper.Title><Stepper.Description>{rtl ? (i < args.currentStep ? 'مكتمل' : i === args.currentStep ? 'المرحلة الحالية' : 'قيد الانتظار') : i < args.currentStep ? 'Complete' : i === args.currentStep ? 'Current stage' : 'Upcoming'}</Stepper.Description></Stepper.Content>
      </Stepper.Step>)}
    </Stepper></div>
  },
}
export const HorizontalRTL: Story = { ...Delivery, args: { dir: 'rtl' } }
export const VerticalRTL: Story = { ...Delivery, args: { dir: 'rtl', orientation: 'vertical' } }
export const Exception: Story = {
  render: () => <Stepper currentStep={1} orientation="vertical" className="p-6">
    <Stepper.Step><Stepper.Indicator /><Stepper.Separator /><Stepper.Content><Stepper.Title>Dispatched</Stepper.Title><Stepper.Description>Complete</Stepper.Description></Stepper.Content></Stepper.Step>
    <Stepper.Step status="error" color="error-container"><Stepper.Indicator foreground="on-error-container">!</Stepper.Indicator><Stepper.Separator variant="dotted" color="error" /><Stepper.Content><Stepper.Title>Address needs confirmation</Stepper.Title><Stepper.Description>Action required before delivery can continue.</Stepper.Description></Stepper.Content></Stepper.Step>
    <Stepper.Step><Stepper.Indicator /><Stepper.Content><Stepper.Title>Delivered</Stepper.Title><Stepper.Description>Upcoming</Stepper.Description></Stepper.Content></Stepper.Step>
  </Stepper>,
}
