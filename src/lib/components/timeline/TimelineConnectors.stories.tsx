import type { Meta, StoryObj } from '@storybook/react'
import { Timeline, timelineColors } from './index'
import { Typography } from '../typography'

const meta: Meta<typeof Timeline.Connector> = {
  title: 'Components/Data/Timeline/Connectors',
  component: Timeline.Connector,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: { variant: 'dashed', shape: 'regular', size: 'md', waveSize: 'md', color: 'primary', animated: true, duration: 1.2, flowDirection: 'forward' },
  argTypes: {
    variant: { control: 'select', options: ['solid', 'dashed', 'dotted'] },
    shape: { control: 'select', options: ['regular', 'wavy'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    waveSize: { control: 'select', options: ['sm', 'md', 'lg'] },
    color: { control: 'select', options: ['default', ...timelineColors] },
    animated: { control: 'boolean' },
    duration: { control: { type: 'range', min: 0.3, max: 5, step: 0.1 } },
    flowDirection: { control: 'select', options: ['forward', 'reverse'] },
  },
}
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: args => (
    <Timeline aria-label="Shipment journey" className="w-72">
      <Timeline.Item status="current">
        <Timeline.Separator><Timeline.Dot /><Timeline.Connector {...args} /></Timeline.Separator>
        <Timeline.Content className="min-h-48">
          <Typography as="h3" variant="title-medium">In transit</Typography>
          <Typography variant="body-small">Moving to the destination hub</Typography>
        </Timeline.Content>
      </Timeline.Item>
      <Timeline.Item status="pending">
        <Timeline.Separator><Timeline.Dot /></Timeline.Separator>
        <Timeline.Content><Typography variant="title-medium">Delivery hub</Typography></Timeline.Content>
      </Timeline.Item>
    </Timeline>
  ),
}

export const AllStyles: Story = {
  render: () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 p-4">
      {(['regular', 'wavy'] as const).flatMap(shape => (['solid', 'dashed', 'dotted'] as const).map(variant => (
        <div key={`${shape}-${variant}`} className="flex flex-col items-center gap-4">
          <Typography variant="label-large">{shape} / {variant}</Typography>
          <div className="flex h-48 gap-8">
            {[false, true].map(animated => (
              <div key={String(animated)} className="flex flex-col items-center">
                <Timeline.Dot size="sm" variant="primary" />
                <Timeline.Connector variant={variant} shape={shape} animated={animated} color="primary" />
                <Timeline.Dot size="sm" variant="outline" />
                <Typography variant="label-small" className="mt-3">{animated ? 'Flow' : 'Static'}</Typography>
              </div>
            ))}
          </div>
        </div>
      )))}
    </div>
  ),
}
