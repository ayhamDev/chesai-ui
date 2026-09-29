import type { Meta, StoryObj } from '@storybook/react'
import { Star, X } from 'lucide-react'
import { useState } from 'react'
import { Flex } from '../layouts'
import { Typography } from '../typography'
import { Chip } from './index'

const meta: Meta<typeof Chip> = {
  title: 'Components/Chip',
  component: Chip,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['outlined', 'filled', 'tonal', 'soft', 'ghost'] },
    color: { control: 'select', options: ['primary', 'secondary', 'tertiary', 'error', 'neutral'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    shape: { control: 'select', options: ['full', 'minimal', 'sharp'] },
    behavior: { control: 'select', options: ['toggle', 'action'] },
    showCheck: { control: 'boolean' },
    selected: { control: 'boolean' },
    disabled: { control: 'boolean' },
    children: { control: 'text' },
    onClick: { action: 'clicked' },
  },
}
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = { args: { children: 'Chip' } }
export const Selected: Story = { args: { children: 'Selected', selected: true } }
export const Interactive: Story = {
  name: 'Interactive toggle',
  render: args => {
    const [selected, setSelected] = useState(false)
    return (
      <Chip {...args} selected={selected} onSelectedChange={setSelected}>
        Available now
      </Chip>
    )
  },
}
export const Variants: Story = {
  name: 'Variants and animated selection',
  render: () => (
    <Flex direction="column" align="start" gap="lg" className="p-5 text-on-surface">
      <Typography variant="title-large">Chip appearances</Typography>
      <Typography variant="body-medium">Toggle a chip to compare its selected and unselected treatment.</Typography>
      {(['outlined', 'filled', 'tonal', 'soft', 'ghost'] as const).map(variant => (
        <Flex key={variant} direction="column" align="start" gap="sm">
          <Typography variant="label-medium" className="capitalize">
            {variant}
          </Typography>
          <Flex wrap="wrap" gap="sm">
            <Chip variant={variant} color="primary" defaultSelected>
              Selected
            </Chip>
            <Chip variant={variant} color="primary" defaultSelected={false}>
              Unselected
            </Chip>
            <Chip variant={variant} disabled>
              Unavailable
            </Chip>
          </Flex>
        </Flex>
      ))}
    </Flex>
  ),
}
export const Colors: Story = {
  render: () => (
    <Flex wrap="wrap" gap="sm" className="p-4">
      {(['primary', 'secondary', 'tertiary', 'error', 'neutral'] as const).map(color => (
        <Chip key={color} color={color} variant="filled" defaultSelected className="capitalize">
          {color}
        </Chip>
      ))}
    </Flex>
  ),
}
export const SizesAndShapes: Story = {
  render: () => (
    <Flex direction="column" align="start" gap="lg" className="p-4">
      {(['full', 'minimal', 'sharp'] as const).map(shape => (
        <Flex key={shape} wrap="wrap" align="center" gap="sm">
          {(['sm', 'md', 'lg'] as const).map(size => (
            <Chip key={size} size={size} shape={shape} variant="tonal" defaultSelected={false}>
              {shape} / {size}
            </Chip>
          ))}
        </Flex>
      ))}
    </Flex>
  ),
}
export const WithIcons: Story = {
  render: () => (
    <Flex wrap="wrap" gap="md">
      <Chip startIcon={<Star className="h-4 w-4" />} defaultSelected={false}>
        Favorite
      </Chip>
      <Chip endIcon={<X className="h-4 w-4" />}>End icon</Chip>
    </Flex>
  ),
}
export const Disabled: Story = {
  render: () => (
    <Flex wrap="wrap" gap="md">
      <Chip disabled>Disabled</Chip>
      <Chip selected disabled>
        Selected and disabled
      </Chip>
    </Flex>
  ),
}
