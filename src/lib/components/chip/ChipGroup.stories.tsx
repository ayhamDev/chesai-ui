import type { Meta, StoryObj } from '@storybook/react'
import { ChevronDown, Copy, RotateCcw, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../dropdown-menu'
import { Flex } from '../layouts'
import { Typography } from '../typography'
import { Chip, ChipGroup } from './index'

const meta = {
  title: 'Components/ChipGroup',
  component: ChipGroup,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A general-purpose layout and appearance group for chips. Join chips or add gaps with shared end caps. Compose arbitrary actions, toggles, or existing DropdownMenu/Popover triggers. Selection management is optional; no application-specific behavior is built in.',
      },
    },
  },
  argTypes: {
    gap: { control: 'select', options: ['none', 'xs', 'sm', 'md', 'lg'] },
    shape: { control: 'select', options: ['full', 'minimal', 'sharp'] },
    separated: { control: 'boolean' },
    orientation: { control: 'select', options: ['horizontal', 'vertical'] },
  },
} satisfies Meta<typeof ChipGroup>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { gap: 'none', shape: 'full', variant: 'filled', 'aria-label': 'Actions' },
  render: args => (
    <ChipGroup {...args}>
      <Chip>Primary action</Chip>
      <Chip aria-label="More actions" className="px-3">
        <ChevronDown aria-hidden="true" className="h-4 w-4" />
      </Chip>
    </ChipGroup>
  ),
}

export const Gaps: Story = {
  render: () => (
    <Flex direction="column" align="start" gap="lg" className="p-4">
      {(['none', 'xs', 'sm', 'md', 'lg'] as const).map(gap => (
        <Flex key={gap} direction="column" align="start" gap="xs">
          <Typography variant="label-medium">{gap === 'none' ? 'Joined' : `Gap: ${gap}`}</Typography>
          <ChipGroup gap={gap} variant="tonal" aria-label={`${gap} actions`}>
            <Chip>Action</Chip>
            <Chip aria-label="Copy" className="px-3">
              <Copy aria-hidden="true" className="h-4 w-4" />
            </Chip>
          </ChipGroup>
        </Flex>
      ))}
    </Flex>
  ),
}

export const Shapes: Story = {
  render: () => (
    <Flex direction="column" align="start" gap="lg" className="p-4">
      {(['full', 'minimal', 'sharp'] as const).map(shape => (
        <Flex key={shape} direction="column" align="start" gap="sm">
          <Typography variant="label-medium" className="capitalize">
            {shape}
          </Typography>
          <Flex wrap="wrap" gap="lg">
            <ChipGroup shape={shape} variant="filled" aria-label={`${shape} joined`}>
              <Chip>Joined</Chip>
              <Chip>Action</Chip>
            </ChipGroup>
            <ChipGroup shape={shape} gap="md" variant="filled" aria-label={`${shape} gapped`}>
              <Chip>Gapped</Chip>
              <Chip>Action</Chip>
            </ChipGroup>
            <ChipGroup shape={shape} gap="md" separated variant="filled" aria-label={`${shape} separate`}>
              <Chip>Separate</Chip>
              <Chip>Action</Chip>
            </ChipGroup>
          </Flex>
        </Flex>
      ))}
    </Flex>
  ),
}

export const ComposedActions: Story = {
  render: () => {
    const [enabled, setEnabled] = useState(true)
    const main = useRef<HTMLButtonElement>(null)
    return (
      <Flex direction="column" align="start" gap="sm" className="p-4">
        <Typography variant="title-medium">Compose your own actions</Typography>
        <ChipGroup gap="md" variant="filled" color="primary" aria-label="Notifications">
          <Chip ref={main} selected={enabled} onSelectedChange={setEnabled}>
            Notifications
          </Chip>
          {enabled && (
            <Chip
              behavior="action"
              selected
              aria-label="Turn off notifications"
              className="px-3"
              onClick={() => {
                setEnabled(false)
                main.current?.focus()
              }}
            >
              <X aria-hidden="true" className="h-4 w-4" />
            </Chip>
          )}
        </ChipGroup>
        <Typography variant="body-small" role="status">
          Notifications {enabled ? 'on' : 'off'}
        </Typography>
      </Flex>
    )
  },
}

export const WithDropdownMenu: Story = {
  name: 'Composed with DropdownMenu',
  render: () => {
    const [mode, setMode] = useState('Balanced')
    const [open, setOpen] = useState(false)
    const trigger = useRef<HTMLButtonElement>(null)
    const active = mode !== 'Balanced'
    return (
      <Flex direction="column" align="start" gap="sm" className="p-4">
        <Typography variant="title-medium">Choose a mode</Typography>
        <Typography variant="body-medium">Chip supplies the trigger. DropdownMenu supplies the menu.</Typography>
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <ChipGroup gap="md" shape="full" variant="filled" aria-label="Mode actions">
            <DropdownMenuTrigger asChild>
              <Chip
                ref={trigger}
                behavior="action"
                selected={active}
                endIcon={<ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />}
              >
                {mode}
              </Chip>
            </DropdownMenuTrigger>
            {active && (
              <Chip
                behavior="action"
                selected
                aria-label="Reset mode"
                className="px-3"
                onClick={() => {
                  setMode('Balanced')
                  trigger.current?.focus()
                }}
              >
                <RotateCcw aria-hidden="true" className="h-4 w-4" />
              </Chip>
            )}
          </ChipGroup>
          <DropdownMenuContent align="start">
            {['Balanced', 'Fast', 'Precise'].map(value => (
              <DropdownMenuItem key={value} onSelect={() => setMode(value)}>
                {value}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Typography variant="body-small" role="status">
          Current mode: {mode}
        </Typography>
      </Flex>
    )
  },
}

export const OptionalSelection: Story = {
  render: () => (
    <ChipGroup type="multiple" gap="md" variant="filled" aria-label="Text formatting">
      <Chip value="bold">Bold</Chip>
      <Chip value="italic">Italic</Chip>
      <Chip value="underline">Underline</Chip>
    </ChipGroup>
  ),
}

export const VerticalAndRTL: Story = {
  render: () => (
    <Flex gap="lg" align="start" className="p-4">
      <ChipGroup orientation="vertical" gap="sm" shape="minimal" aria-label="Vertical actions">
        <Chip>First</Chip>
        <Chip>Second</Chip>
        <Chip disabled>Unavailable</Chip>
      </ChipGroup>
      <ChipGroup dir="rtl" gap="sm" aria-label="RTL actions">
        <Chip>الأول</Chip>
        <Chip>الثاني</Chip>
      </ChipGroup>
    </Flex>
  ),
}
