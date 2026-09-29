import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Check, Package, Truck, MapPin } from 'lucide-react'
import { Timeline, timelineColors } from './index'
import { Typography } from '../typography'

type StepStyle = { color?: ComponentProps<typeof Timeline.Item>['color']; indicator?: Pick<ComponentProps<typeof Timeline.Dot>, 'color' | 'foreground' | 'shape' | 'size'>; connector?: Pick<ComponentProps<typeof Timeline.Connector>, 'color' | 'variant' | 'shape' | 'size' | 'waveSize' | 'animated' | 'duration' | 'flowDirection'> }
type JourneyArgs = ComponentProps<typeof Timeline> & { step1: StepStyle; step2: StepStyle; step3: StepStyle; step4: StepStyle }
const stepDefaults = {
  step1: { color: 'secondary', indicator: { color: 'secondary', foreground: 'on-secondary', size: 'lg', shape: 'circle' }, connector: { color: 'primary', variant: 'solid', shape: 'regular', animated: false, duration: 1.2 } },
  step2: { color: 'tertiary', indicator: { color: 'tertiary-container', foreground: 'on-tertiary-container', size: 'lg', shape: 'square' }, connector: { color: 'tertiary', variant: 'dashed', shape: 'regular', animated: false, duration: 1.2 } },
  step3: { color: 'primary', indicator: { color: 'primary', foreground: 'on-primary', size: 'lg', shape: 'circle' }, connector: { color: 'secondary', variant: 'solid', shape: 'wavy', animated: true, duration: 1.2, waveSize: 'md', flowDirection: 'forward' } },
  step4: { color: 'outline', indicator: { color: 'surface-container', foreground: 'on-surface', size: 'lg', shape: 'circle' } },
} satisfies Pick<JourneyArgs, 'step1' | 'step2' | 'step3' | 'step4'>

const meta: Meta<JourneyArgs> = {
  title: 'Components/Data/Timeline/Layouts and Colors', component: Timeline, tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: { ...stepDefaults, orientation: 'horizontal', dir: 'ltr' },
  argTypes: {
    step1: { control: 'object', description: 'First milestone: independently edit indicator and outgoing connector.' },
    step2: { control: 'object', description: 'Second milestone: independently edit indicator and outgoing connector.' },
    step3: { control: 'object', description: 'Third milestone: independently edit indicator and outgoing connector.' },
    step4: { control: 'object', description: 'Final milestone appearance (no outgoing connector).' },
    orientation: { control: 'select', options: ['horizontal', 'vertical'] },
    dir: { control: 'select', options: ['ltr', 'rtl'] },
    color: { control: 'select', options: timelineColors },
  },
}
export default meta
type Story = StoryObj<JourneyArgs>
export const OrderJourney: Story = {
  render: args => {
    const { step1, step2, step3, step4, ...rootProps } = args
    const steps = [step1, step2, step3, step4]
    const rtl = args.dir === 'rtl'
    const titles = rtl ? ['تم تأكيد الطلب', 'تم تجهيز الشحنة', 'الشحنة في الطريق', 'التسليم'] : ['Order confirmed', 'Packed at warehouse', 'Out for delivery', 'Delivered']
    const statuses = ['completed', 'completed', 'current', 'pending'] as const
    const icons = [Check, Package, Truck, MapPin]
    return (
      <section dir={args.dir} className="p-4 text-on-surface">
        <Typography as="h2" variant="headline-small" className="mb-8">{rtl ? 'تتبع الطلب' : 'Track your order'}</Typography>
        <Timeline {...rootProps} aria-label={rtl ? 'مراحل توصيل الطلب' : 'Order delivery stages'}>
          {titles.map((title, index) => {
            const Icon = icons[index]
            return <Timeline.Item key={title} status={statuses[index]} color={steps[index].color}>
              <Timeline.Separator>
                <Timeline.Dot {...steps[index].indicator}><Icon aria-hidden="true" /></Timeline.Dot>
                {index < titles.length - 1 && <Timeline.Connector {...steps[index].connector} />}
              </Timeline.Separator>
              <Timeline.Content><Typography as="h3" variant="title-medium">{title}</Typography><Typography variant="body-small" muted>{rtl ? ['مكتمل', 'مكتمل', 'المرحلة الحالية', 'قيد الانتظار'][index] : statuses[index]}</Typography></Timeline.Content>
            </Timeline.Item>
          })}
        </Timeline>
      </section>
    )
  },
}
export const HorizontalRTL: Story = { ...OrderJourney, args: { orientation: 'horizontal', dir: 'rtl' } }
export const VerticalRTL: Story = { ...OrderJourney, args: { orientation: 'vertical', dir: 'rtl' } }
export const ThemePalette: Story = {
  render: () => <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-4">
    {timelineColors.map(color => <div key={color} className="flex gap-3 items-center text-on-surface">
      <Timeline.Dot color={color} size="lg"><Package aria-hidden="true" /></Timeline.Dot>
      <Typography variant="label-small">{color}</Typography>
    </div>)}
  </div>,
}
